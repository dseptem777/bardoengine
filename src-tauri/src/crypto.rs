use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use chacha20::cipher::{KeyIvInit, StreamCipher};
use chacha20::ChaCha20;
use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::Zeroize;

// Layer 1: Key material split across two env vars, each XOR'd with distinct compile-time masks.
// This prevents a single contiguous 32-byte secret from appearing in the binary.
//
// SECRET_A and SECRET_B are hex strings (64 hex chars = 32 bytes each) set at compile time.
// The assembler XORs each half with a hardcoded mask, then concatenates for the HKDF IKM.

const SECRET_A_HEX: &str = env!(
    "BARDO_SECRET_A",
    "BARDO_SECRET_A env var must be set at compile time (64 hex chars = 32 bytes)"
);
const SECRET_B_HEX: &str = env!(
    "BARDO_SECRET_B",
    "BARDO_SECRET_B env var must be set at compile time (64 hex chars = 32 bytes)"
);
const OBFUSCATION_SEED_HEX: &str = env!(
    "BARDO_OBFUSCATION_SEED",
    "BARDO_OBFUSCATION_SEED env var must be set at compile time (64 hex chars = 32 bytes)"
);

// Compile-time XOR masks — distinct per half so no two chunks share a pattern.
// These are baked into .rdata; the attacker must find all masks + reconstruct the XOR logic.
const MASK_A: [u8; 32] = [
    0x5a, 0x3c, 0x71, 0xe2, 0x9f, 0x14, 0xb8, 0x6d,
    0x2a, 0xc5, 0x87, 0x43, 0xf0, 0x1e, 0x96, 0x7b,
    0xd4, 0x52, 0x0a, 0xe8, 0x33, 0xbc, 0x6f, 0x95,
    0x4e, 0x27, 0xa1, 0x78, 0xc3, 0x5d, 0xf6, 0x89,
];
const MASK_B: [u8; 32] = [
    0x91, 0x4f, 0xe3, 0x26, 0xb7, 0x5c, 0x0d, 0xa8,
    0x64, 0x3e, 0xf1, 0x82, 0x59, 0xcd, 0x07, 0x73,
    0xae, 0x18, 0x6b, 0xd5, 0x40, 0x9c, 0x2f, 0xe7,
    0x83, 0xba, 0x51, 0x0e, 0x7c, 0xf4, 0x39, 0xc6,
];
const MASK_SEED: [u8; 32] = [
    0x37, 0x8a, 0xd2, 0x5f, 0x13, 0xe6, 0x94, 0x2b,
    0x70, 0xc8, 0x4b, 0xf7, 0x1d, 0x85, 0x3a, 0xee,
    0x62, 0x09, 0xb3, 0x7e, 0xd0, 0x47, 0x91, 0x5c,
    0xfa, 0x2d, 0x66, 0xb8, 0x3c, 0xe1, 0xa4, 0x08,
];

// Layer 2: HKDF-SHA256 derivation salt and info.
const HKDF_SALT: [u8; 16] = [
    0xc3, 0x7e, 0x84, 0x1a, 0x56, 0xf2, 0x0b, 0x9d,
    0x38, 0xe7, 0x4c, 0xa0, 0xd1, 0x6f, 0x23, 0x5b,
];
const HKDF_INFO: &[u8] = b"bardoengine/centinelas/v1";

// ChaCha20 nonce for the pre-XOR obfuscation layer (Layer 4).
// This is NOT cryptographic security — it's a scramble layer.
// A fixed nonce is intentional: the obfuscation is keyed on OBFUSCATION_SEED, not randomness.
const CHACHA_NONCE: [u8; 12] = [
    0x4b, 0x61, 0x72, 0x69, 0x6e, 0x61, 0x4f, 0x63,
    0x68, 0x6f, 0x41, 0x7a,
];

/// Parse a hex string into a fixed 32-byte array.
fn hex_to_bytes(hex: &str) -> Result<[u8; 32], String> {
    if hex.len() != 64 {
        return Err(format!(
            "Expected 64 hex chars (32 bytes), got {}",
            hex.len()
        ));
    }
    let mut out = [0u8; 32];
    for i in 0..32 {
        out[i] = u8::from_str_radix(&hex[i * 2..i * 2 + 2], 16)
            .map_err(|e| format!("Invalid hex at offset {}: {}", i * 2, e))?;
    }
    Ok(out)
}

/// Layer 1: Assemble and XOR-unmask the raw IKM from the two env-var secrets.
/// Returns 64 bytes: unmasked_A || unmasked_B.
#[inline(never)]
fn assemble_ikm() -> Result<[u8; 64], String> {
    let raw_a = hex_to_bytes(SECRET_A_HEX)?;
    let raw_b = hex_to_bytes(SECRET_B_HEX)?;

    let mut ikm = [0u8; 64];
    for i in 0..32 {
        ikm[i] = raw_a[i] ^ MASK_A[i];
    }
    for i in 0..32 {
        ikm[32 + i] = raw_b[i] ^ MASK_B[i];
    }
    Ok(ikm)
}

/// Layer 2: Derive the AES-256 key via HKDF-SHA256.
#[inline(never)]
fn derive_aes_key() -> Result<[u8; 32], String> {
    let ikm = assemble_ikm()?;
    let hk = Hkdf::<Sha256>::new(Some(&HKDF_SALT), &ikm);
    let mut okm = [0u8; 32];
    hk.expand(HKDF_INFO, &mut okm)
        .map_err(|e| format!("HKDF expand error: {}", e))?;
    Ok(okm)
}

/// Layer 4: Derive the ChaCha20 obfuscation key from BARDO_OBFUSCATION_SEED.
/// The seed is XOR'd with MASK_SEED before use so it doesn't appear raw in .rdata.
#[inline(never)]
fn derive_chacha_key() -> Result<[u8; 32], String> {
    let raw_seed = hex_to_bytes(OBFUSCATION_SEED_HEX)?;
    let mut key = [0u8; 32];
    for i in 0..32 {
        key[i] = raw_seed[i] ^ MASK_SEED[i];
    }
    Ok(key)
}

/// Layer 4: Apply ChaCha20 keystream XOR to data in-place.
/// Used symmetrically for both encryption (pre-AES scramble) and decryption (post-AES unscramble).
fn chacha_xor(data: &mut Vec<u8>) -> Result<(), String> {
    let key = derive_chacha_key()?;
    let nonce = chacha20::Nonce::from(CHACHA_NONCE);
    let mut cipher = ChaCha20::new((&key).into(), &nonce);
    cipher.apply_keystream(data);
    Ok(())
}

/// Public decrypt entry point — contract unchanged: `decrypt_story_content(base64) -> Result<String, String>`.
pub fn decrypt_story_content(encrypted_base64: &str) -> Result<String, String> {
    // Decode base64
    let combined = STANDARD
        .decode(encrypted_base64.trim())
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    if combined.len() < 28 {
        return Err("Invalid encrypted data: too short".to_string());
    }

    // Blob format: IV (12) | AuthTag (16) | ChaCha20(AES-GCM ciphertext)
    let iv = &combined[0..12];
    let auth_tag = &combined[12..28];
    let mut chacha_wrapped = combined[28..].to_vec();

    // Layer 4 reverse: undo ChaCha20 XOR to recover the raw AES-GCM ciphertext
    chacha_xor(&mut chacha_wrapped)?;

    // Layer 2+1: derive the AES key
    let mut aes_key = derive_aes_key()?;

    // Reconstruct GCM input: ciphertext || tag
    let mut ciphertext_with_tag = chacha_wrapped;
    ciphertext_with_tag.extend_from_slice(auth_tag);

    let cipher = Aes256Gcm::new_from_slice(&aes_key)
        .map_err(|e| format!("Cipher init error: {}", e))?;

    // Layer 5: zeroize the raw key material immediately after cipher init
    aes_key.zeroize();

    let nonce = Nonce::from_slice(iv);

    let mut plaintext = cipher
        .decrypt(nonce, ciphertext_with_tag.as_ref())
        .map_err(|_| "Decryption failed — wrong keys or corrupted data".to_string())?;

    // Layer 5: consume plaintext directly — no second copy escapes zeroize.
    // On UTF-8 error, recover the Vec via into_bytes() and zeroize it before returning.
    String::from_utf8(plaintext).map_err(|e| {
        let mut bytes = e.into_bytes();
        bytes.zeroize();
        format!("UTF-8 decode error: invalid UTF-8 sequence")
    })
}

/// Encrypt a plaintext string with the same KDF pipeline.
/// Used in unit tests and (optionally) in a Rust-side encrypt utility.
/// The encrypt-side is handled by scripts/encrypt-story.cjs for production.
#[cfg(test)]
pub fn encrypt_story_content(plaintext: &str) -> Result<String, String> {
    use aes_gcm::aead::OsRng;
    use aes_gcm::aead::rand_core::RngCore;

    let mut iv_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut iv_bytes);

    let mut aes_key = derive_aes_key()?;
    let cipher = Aes256Gcm::new_from_slice(&aes_key)
        .map_err(|e| format!("Cipher init error: {}", e))?;
    aes_key.zeroize();

    let nonce = Nonce::from_slice(&iv_bytes);
    let encrypted_with_tag = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("Encryption error: {}", e))?;

    // aes-gcm appends the 16-byte tag at the end of the output
    let ciphertext_len = encrypted_with_tag.len() - 16;
    let auth_tag = &encrypted_with_tag[ciphertext_len..];
    let ciphertext = &encrypted_with_tag[..ciphertext_len];

    // Apply Layer 4: ChaCha20 XOR over the raw ciphertext
    let mut chacha_wrapped = ciphertext.to_vec();
    chacha_xor(&mut chacha_wrapped)?;

    // Blob: IV (12) | AuthTag (16) | ChaCha20(ciphertext)
    let mut combined = Vec::with_capacity(12 + 16 + chacha_wrapped.len());
    combined.extend_from_slice(&iv_bytes);
    combined.extend_from_slice(auth_tag);
    combined.extend_from_slice(&chacha_wrapped);

    Ok(STANDARD.encode(&combined))
}

/// Test-only helper: decrypt using an explicitly supplied 32-byte AES key.
/// This lets us verify that a ciphertext produced with key A cannot be
/// decrypted with key B (simulating cross-minor-version key rotation).
#[cfg(test)]
fn decrypt_with_explicit_key(encrypted_base64: &str, aes_key_bytes: &[u8; 32]) -> Result<String, String> {
    let combined = base64::engine::general_purpose::STANDARD
        .decode(encrypted_base64.trim())
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    if combined.len() < 28 {
        return Err("Invalid encrypted data: too short".to_string());
    }

    let iv = &combined[0..12];
    let auth_tag = &combined[12..28];
    let mut chacha_wrapped = combined[28..].to_vec();

    chacha_xor(&mut chacha_wrapped)?;

    let mut ciphertext_with_tag = chacha_wrapped;
    ciphertext_with_tag.extend_from_slice(auth_tag);

    let cipher = Aes256Gcm::new_from_slice(aes_key_bytes)
        .map_err(|e| format!("Cipher init error: {}", e))?;

    let nonce = Nonce::from_slice(iv);

    let plaintext = cipher
        .decrypt(nonce, ciphertext_with_tag.as_ref())
        .map_err(|_| "Decryption failed — wrong keys or corrupted data".to_string())?;

    String::from_utf8(plaintext).map_err(|_| "UTF-8 decode error".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_known_plaintext() {
        // Uses fixture env vars set at compile time (BARDO_SECRET_A, BARDO_SECRET_B, BARDO_OBFUSCATION_SEED)
        let plaintext = r#"{"inkVersion":21,"root":[[["^Hello, Centinelas!","\n",["done",null]]],null],"listDefs":{}}"#;

        let encrypted = encrypt_story_content(plaintext)
            .expect("encrypt should succeed");

        assert!(!encrypted.is_empty(), "encrypted output must not be empty");

        let decrypted = decrypt_story_content(&encrypted)
            .expect("decrypt should succeed");

        assert_eq!(decrypted, plaintext, "round-trip must reproduce plaintext exactly");
    }

    #[test]
    fn wrong_blob_returns_error() {
        // Garbage base64 must fail cleanly, not panic
        let result = decrypt_story_content("dGhpcyBpcyBub3QgZW5jcnlwdGVkIGRhdGEhISE=");
        assert!(result.is_err(), "garbage input must return Err");
    }

    #[test]
    fn too_short_blob_returns_error() {
        let result = decrypt_story_content("dGVzdA=="); // "test" in base64
        assert!(result.is_err());
    }

    /// Capa 2 validation: encrypting with key_A and decrypting with key_B
    /// must fail with an authentication error. This validates that key rotation
    /// across minor releases actually invalidates cross-version .enc files.
    #[test]
    fn cross_key_decrypt_fails_with_auth_error() {
        use aes_gcm::aead::OsRng;
        use aes_gcm::aead::rand_core::RngCore;

        let plaintext = "cross-key test payload";

        // Key A: derived from the compiled-in secrets (normal path)
        let key_a = derive_aes_key().expect("derive_aes_key must succeed");

        // Key B: a distinct random key simulating a different minor release
        let mut key_b = [0u8; 32];
        OsRng.fill_bytes(&mut key_b);
        // Ensure key_b actually differs from key_a (astronomically likely but assert anyway)
        assert_ne!(key_a, key_b, "key_b must differ from key_a");

        // Encrypt with key_a (via normal encrypt path)
        let encrypted = encrypt_story_content(plaintext)
            .expect("encrypt with key_a should succeed");

        // Decrypt with key_a — must succeed
        let decrypted_a = decrypt_story_content(&encrypted)
            .expect("decrypt with key_a must succeed");
        assert_eq!(decrypted_a, plaintext);

        // Decrypt with key_b — must fail (GCM auth tag mismatch)
        let result_b = decrypt_with_explicit_key(&encrypted, &key_b);
        assert!(
            result_b.is_err(),
            "decrypting key_a ciphertext with key_b must fail (got: {:?})",
            result_b
        );
        // Verify it's an auth failure, not a coding error
        let err = result_b.unwrap_err();
        assert!(
            err.contains("wrong keys") || err.contains("Decryption failed"),
            "error message should indicate auth failure, got: {}",
            err
        );
    }
}
