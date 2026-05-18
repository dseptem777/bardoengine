/**
 * encrypt-story.cjs
 * Encrypts a single Ink story JSON for Tauri production builds.
 *
 * Hardened pipeline (v2):
 *   Layer 1: Key material from BARDO_SECRET_A + BARDO_SECRET_B, each XOR'd with compile-time masks
 *   Layer 2: HKDF-SHA256 derivation → 32-byte AES-256-GCM key
 *   Layer 4: Pre-AES ChaCha20 keystream XOR using BARDO_OBFUSCATION_SEED
 *
 * Blob format: IV (12) | AuthTag (16) | ChaCha20(AES-GCM ciphertext)
 *
 * Usage: node scripts/encrypt-story.cjs --story <story-id>
 * Example: node scripts/encrypt-story.cjs --story centinelas
 *
 * Required env vars (must match the values used at `cargo build` time):
 *   BARDO_SECRET_A         — 64 hex chars (32 bytes)
 *   BARDO_SECRET_B         — 64 hex chars (32 bytes)
 *   BARDO_OBFUSCATION_SEED — 64 hex chars (32 bytes)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { applyNarrativeWatermark } = require('./watermark.cjs');

// ---------------------------------------------------------------------------
// Layer 1 masks — MUST be kept in sync with src-tauri/src/crypto.rs
// ---------------------------------------------------------------------------
const MASK_A = Buffer.from([
    0x5a, 0x3c, 0x71, 0xe2, 0x9f, 0x14, 0xb8, 0x6d,
    0x2a, 0xc5, 0x87, 0x43, 0xf0, 0x1e, 0x96, 0x7b,
    0xd4, 0x52, 0x0a, 0xe8, 0x33, 0xbc, 0x6f, 0x95,
    0x4e, 0x27, 0xa1, 0x78, 0xc3, 0x5d, 0xf6, 0x89,
]);
const MASK_B = Buffer.from([
    0x91, 0x4f, 0xe3, 0x26, 0xb7, 0x5c, 0x0d, 0xa8,
    0x64, 0x3e, 0xf1, 0x82, 0x59, 0xcd, 0x07, 0x73,
    0xae, 0x18, 0x6b, 0xd5, 0x40, 0x9c, 0x2f, 0xe7,
    0x83, 0xba, 0x51, 0x0e, 0x7c, 0xf4, 0x39, 0xc6,
]);
const MASK_SEED = Buffer.from([
    0x37, 0x8a, 0xd2, 0x5f, 0x13, 0xe6, 0x94, 0x2b,
    0x70, 0xc8, 0x4b, 0xf7, 0x1d, 0x85, 0x3a, 0xee,
    0x62, 0x09, 0xb3, 0x7e, 0xd0, 0x47, 0x91, 0x5c,
    0xfa, 0x2d, 0x66, 0xb8, 0x3c, 0xe1, 0xa4, 0x08,
]);

// Layer 2 HKDF parameters — MUST match src-tauri/src/crypto.rs
const HKDF_SALT = Buffer.from([
    0xc3, 0x7e, 0x84, 0x1a, 0x56, 0xf2, 0x0b, 0x9d,
    0x38, 0xe7, 0x4c, 0xa0, 0xd1, 0x6f, 0x23, 0x5b,
]);
const HKDF_INFO = Buffer.from('bardoengine/centinelas/v1', 'ascii');

// Layer 4 ChaCha20 nonce — MUST match src-tauri/src/crypto.rs
const CHACHA_NONCE = Buffer.from([
    0x4b, 0x61, 0x72, 0x69, 0x6e, 0x61, 0x4f, 0x63,
    0x68, 0x6f, 0x41, 0x7a,
]);

// ---------------------------------------------------------------------------
// Env loading
// ---------------------------------------------------------------------------

function loadEnvVars() {
    // Try .env file first as fallback
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
            if (m && !process.env[m[1]]) {
                process.env[m[1]] = m[2].trim();
            }
        }
    }

    const missing = [];
    for (const v of ['BARDO_SECRET_A', 'BARDO_SECRET_B', 'BARDO_OBFUSCATION_SEED']) {
        if (!process.env[v]) missing.push(v);
    }
    if (missing.length) {
        console.error('Error: missing required env vars:', missing.join(', '));
        console.error('Set them in your shell or in a .env file at the project root.');
        console.error('Each must be a 64-character hex string (32 bytes).');
        process.exit(1);
    }
}

function parseHex32(varName) {
    const val = process.env[varName];
    if (!/^[0-9a-fA-F]{64}$/.test(val)) {
        console.error(`Error: ${varName} must be exactly 64 hex characters (32 bytes). Got: "${val}"`);
        process.exit(1);
    }
    return Buffer.from(val, 'hex');
}

// ---------------------------------------------------------------------------
// Layer 1: assemble IKM
// ---------------------------------------------------------------------------
function assembleIkm() {
    const rawA = parseHex32('BARDO_SECRET_A');
    const rawB = parseHex32('BARDO_SECRET_B');
    const ikm = Buffer.alloc(64);
    for (let i = 0; i < 32; i++) ikm[i] = rawA[i] ^ MASK_A[i];
    for (let i = 0; i < 32; i++) ikm[32 + i] = rawB[i] ^ MASK_B[i];
    return ikm;
}

// ---------------------------------------------------------------------------
// Layer 2: HKDF-SHA256
// ---------------------------------------------------------------------------
function deriveAesKey() {
    const ikm = assembleIkm();
    // Node's built-in HKDF (available since Node 15)
    const okm = crypto.hkdfSync('sha256', ikm, HKDF_SALT, HKDF_INFO, 32);
    return Buffer.from(okm);
}

// ---------------------------------------------------------------------------
// Layer 4: ChaCha20 obfuscation keystream XOR
// Node crypto does not expose ChaCha20 directly, so we use chacha20-js or
// derive it via AES-CTR as a fallback.
// We use Node's built-in 'chacha20' cipher name (available in OpenSSL builds).
// ---------------------------------------------------------------------------
function chachaXor(data) {
    const rawSeed = parseHex32('BARDO_OBFUSCATION_SEED');
    const key = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) key[i] = rawSeed[i] ^ MASK_SEED[i];

    // Node OpenSSL exposes chacha20 as a stream cipher.
    // Counter starts at 0, nonce is our fixed 12-byte value padded to 16 bytes
    // (Node's chacha20 expects a 16-byte "nonce": 4-byte counter LE + 12-byte nonce)
    const nodeNonce = Buffer.alloc(16, 0);
    CHACHA_NONCE.copy(nodeNonce, 4); // bytes 0-3 = counter (0), bytes 4-15 = nonce

    const cipher = crypto.createCipheriv('chacha20', key, nodeNonce);
    return Buffer.concat([cipher.update(data), cipher.final()]);
}

// ---------------------------------------------------------------------------
// Main encrypt function
// ---------------------------------------------------------------------------
function encrypt(plaintext) {
    const iv = crypto.randomBytes(12);
    const aesKey = deriveAesKey();

    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag(); // 16 bytes

    // Layer 4: ChaCha20 XOR over the raw AES ciphertext
    const chachaWrapped = chachaXor(ciphertext);

    // Blob: IV (12) | AuthTag (16) | ChaCha20(ciphertext)
    const combined = Buffer.concat([iv, authTag, chachaWrapped]);
    return combined.toString('base64');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function main() {
    loadEnvVars();

    const args = process.argv.slice(2);
    let storyId = args[0];

    const storyIndex = args.indexOf('--story');
    if (storyIndex !== -1 && args[storyIndex + 1]) {
        storyId = args[storyIndex + 1];
    }

    let storyTitle = null;
    const titleIndex = args.indexOf('--title');
    if (titleIndex !== -1 && args[titleIndex + 1]) {
        storyTitle = args[titleIndex + 1];
    }

    let buildId = null;
    const buildIdIndex = args.indexOf('--build-id');
    if (buildIdIndex !== -1 && args[buildIdIndex + 1]) {
        buildId = args[buildIdIndex + 1];
    }

    if (!storyId || storyId.startsWith('-')) {
        console.error('Usage: npm run encrypt-story <story-id>');
        console.error('   or: node scripts/encrypt-story.cjs <story-id>');
        process.exit(1);
    }

    const srcDir = path.join(__dirname, '..', 'src', 'stories');
    const outDir = path.join(__dirname, '..', 'src-tauri', 'resources');

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    } else {
        console.log('Cleaning old encrypted stories from resources...');
        const oldFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.enc'));
        oldFiles.forEach(f => {
            fs.unlinkSync(path.join(outDir, f));
            console.log(`  - Deleted: ${f}`);
        });
    }

    const inputFile = path.join(srcDir, `${storyId}.json`);
    const outputFile = path.join(outDir, `${storyId}.enc`);

    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Story file not found: ${inputFile}`);
        console.error('Available stories:');
        fs.readdirSync(srcDir)
            .filter(f => f.endsWith('.json'))
            .forEach(f => console.error(`  - ${f.replace('.json', '')}`));
        process.exit(1);
    }

    console.log(`Encrypting: ${storyId}`);

    let content = fs.readFileSync(inputFile, 'utf8');

    // Strip UTF-8 BOM if present (EF BB BF)
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log(`  - Standardizing: Stripped UTF-8 BOM from ${storyId}`);
        content = content.slice(1);
    }

    // Apply narrative watermark if a buildId was provided
    if (buildId) {
        console.log(`  - Watermarking with buildId: ${buildId}`);
        const jsonObj = JSON.parse(content);
        const watermarked = applyNarrativeWatermark(jsonObj, buildId);
        content = JSON.stringify(watermarked);
        console.log(`  - Watermark applied`);
    } else {
        console.log(`  - No --build-id provided; skipping watermark (dev build)`);
    }

    const encrypted = encrypt(content);
    fs.writeFileSync(outputFile, encrypted, 'utf8');

    // Generate config for frontend
    const configFile = path.join(__dirname, '..', 'src', 'story-config.json');
    const config = {
        storyId,
        title: storyTitle,
        encrypted: true,
        buildTime: new Date().toISOString(),
        buildId: buildId || null,
    };
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    const resourceConfigFile = path.join(outDir, 'story-config.json');
    fs.writeFileSync(resourceConfigFile, JSON.stringify(config, null, 2));

    console.log(`✓ Encrypted: ${outputFile}`);
    console.log(`✓ Config: ${configFile}`);
    console.log(`✓ Resource config: ${resourceConfigFile}`);
    console.log(`✓ Ready for Tauri build!`);
}

main();
