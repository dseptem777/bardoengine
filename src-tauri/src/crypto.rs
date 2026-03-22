use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD, Engine};

// AES-256-GCM key loaded from BARDO_ENCRYPTION_KEY env var at compile time.
// Set this env var before building: export BARDO_ENCRYPTION_KEY="your_32_byte_key"
const ENCRYPTION_KEY: &[u8] = env!("BARDO_ENCRYPTION_KEY", "BARDO_ENCRYPTION_KEY env var must be set at compile time (32 ASCII chars)").as_bytes();

pub fn decrypt_story_content(encrypted_base64: &str) -> Result<String, String> {
    // Decode base64
    let combined = STANDARD
        .decode(encrypted_base64)
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    if combined.len() < 28 {
        return Err("Invalid encrypted data: too short".to_string());
    }

    // Extract components: IV (12) + AuthTag (16) + Ciphertext
    let iv = &combined[0..12];
    let auth_tag = &combined[12..28];
    let ciphertext = &combined[28..];

    // Create cipher
    let cipher = Aes256Gcm::new_from_slice(ENCRYPTION_KEY)
        .map_err(|e| format!("Cipher init error: {}", e))?;

    let nonce = Nonce::from_slice(iv);

    // Combine ciphertext + auth tag for decryption (GCM format)
    let mut ciphertext_with_tag = ciphertext.to_vec();
    ciphertext_with_tag.extend_from_slice(auth_tag);

    // Decrypt
    let plaintext = cipher
        .decrypt(nonce, ciphertext_with_tag.as_ref())
        .map_err(|e| format!("Decryption error: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8 decode error: {}", e))
}
