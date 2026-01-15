/**
 * encrypt-story.cjs
 * Encrypts a single Ink story JSON for Tauri production builds.
 * 
 * Usage: node scripts/encrypt-story.cjs --story <story-id>
 * Example: node scripts/encrypt-story.cjs --story serruchin
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// AES-256-GCM encryption key (32 bytes)
// This key is also hardcoded in the Rust backend for decryption
const ENCRYPTION_KEY = Buffer.from('B4rd0Eng1n3_S3cr3t_K3y_2024_!@#$', 'utf8');

function encrypt(plaintext) {
    // Generate random 12-byte IV (standard for GCM)
    const iv = crypto.randomBytes(12);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

    // Encrypt
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine: IV (12) + AuthTag (16) + Ciphertext
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return combined.toString('base64');
}

function main() {
    // Get story ID - support both positional and --story flag
    const args = process.argv.slice(2);
    let storyId = args[0];

    // Also check for --story flag for backwards compat
    const storyIndex = args.indexOf('--story');
    if (storyIndex !== -1 && args[storyIndex + 1]) {
        storyId = args[storyIndex + 1];
    }

    if (!storyId || storyId.startsWith('-')) {
        console.error('Usage: npm run encrypt-story serruchin');
        console.error('   or: node scripts/encrypt-story.cjs serruchin');
        process.exit(1);
    }

    const srcDir = path.join(__dirname, '..', 'src', 'stories');
    const outDir = path.join(__dirname, '..', 'src-tauri', 'resources');

    // Ensure output directory exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
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

    // Read and encrypt
    const content = fs.readFileSync(inputFile, 'utf8');
    const encrypted = encrypt(content);

    // Write encrypted file
    fs.writeFileSync(outputFile, encrypted, 'utf8');

    // Generate config for frontend
    const configFile = path.join(__dirname, '..', 'src', 'story-config.json');
    const config = {
        storyId: storyId,
        encrypted: true,
        buildTime: new Date().toISOString()
    };
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    console.log(`✓ Encrypted: ${outputFile}`);
    console.log(`✓ Config: ${configFile}`);
    console.log(`✓ Ready for Tauri build!`);
}

main();
