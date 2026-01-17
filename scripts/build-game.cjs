/**
 * build-game.cjs
 * Interactive builder for BardoEngine games
 * 
 * Usage: npm run build-game
 * 
 * Supports:
 * - Windows: NSIS installer (.exe)
 * - macOS: DMG + App bundle
 * - Linux: AppImage + Deb
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

const STORIES_DIR = path.join(__dirname, '..', 'src', 'stories');
const TAURI_CONF = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');

// Platform targets mapping
const PLATFORM_TARGETS = {
    windows: 'nsis',
    mac: 'dmg,app',
    linux: 'appimage,deb',
    all: 'all'
};

function getAvailableStories() {
    const files = fs.readdirSync(STORIES_DIR);
    return files
        .filter(f => f.endsWith('.json') && !f.endsWith('.config.json'))
        .map(f => f.replace('.json', ''));
}

// Read config from {storyId}.config.json
function getGameConfig(storyId) {
    const configPath = path.join(STORIES_DIR, `${storyId}.config.json`);

    try {
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.warn(`[Warning] Error reading config for '${storyId}':`, e.message);
    }

    // Fallback: return defaults
    console.warn(`[Warning] No config found for '${storyId}', using defaults`);
    return {
        title: storyId.charAt(0).toUpperCase() + storyId.slice(1),
        version: '0.1.0'
    };
}

function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function updateTauriConfig(storyId, title, version) {
    const config = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));

    config.productName = title;
    config.version = version;
    config.identifier = `com.bardoengine.${storyId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    config.app.windows[0].title = title;

    fs.writeFileSync(TAURI_CONF, JSON.stringify(config, null, 2));
    console.log(`✓ Configuración actualizada:`);
    console.log(`   Título: ${title}`);
    console.log(`   Versión: ${version}`);
}

function runCommand(cmd, description) {
    console.log(`\n▶ ${description}...`);
    try {
        execSync(cmd, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            env: {
                ...process.env,
                Path: `${process.env.Path};${process.env.USERPROFILE}\\.cargo\\bin`
            }
        });
        return true;
    } catch (e) {
        console.error(`✗ Error: ${e.message}`);
        return false;
    }
}

function detectCurrentPlatform() {
    switch (process.platform) {
        case 'win32': return 'windows';
        case 'darwin': return 'mac';
        case 'linux': return 'linux';
        default: return 'windows';
    }
}

async function main() {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║     🎮 BARDOENGINE GAME BUILDER 🎮    ║');
    console.log('╚══════════════════════════════════════╝\n');

    // List available stories
    const stories = getAvailableStories();

    if (stories.length === 0) {
        console.error('No hay historias en src/stories/');
        process.exit(1);
    }

    console.log('Historias disponibles:\n');
    stories.forEach((s, i) => {
        const config = getGameConfig(s);
        console.log(`  [${i + 1}] ${s} (v${config.version}) - "${config.title}"`);
    });

    // Get user selection for story
    const selection = await prompt('\n¿Qué historia querés empaquetar? (número): ');
    const index = parseInt(selection) - 1;

    if (isNaN(index) || index < 0 || index >= stories.length) {
        console.error('Selección inválida');
        process.exit(1);
    }

    const storyId = stories[index];
    const gameConfig = getGameConfig(storyId);

    // Platform selection
    const currentPlatform = detectCurrentPlatform();
    console.log('\nPlataformas disponibles:\n');
    console.log(`  [1] Windows (NSIS installer)`);
    console.log(`  [2] macOS (DMG + App bundle)`);
    console.log(`  [3] Linux (AppImage + Deb)`);
    console.log(`  [4] Todas (requiere cross-compilation)`);
    console.log(`\n  ℹ️  Plataforma actual: ${currentPlatform}`);

    const platformSelection = await prompt('\n¿Para qué plataforma? (número, default=actual): ');

    let targetPlatform;
    let bundleFlag = '';

    switch (platformSelection) {
        case '1':
            targetPlatform = 'Windows';
            bundleFlag = '--bundles nsis';
            break;
        case '2':
            targetPlatform = 'macOS';
            bundleFlag = '--bundles dmg,app';
            break;
        case '3':
            targetPlatform = 'Linux';
            bundleFlag = '--bundles appimage,deb';
            break;
        case '4':
            targetPlatform = 'Todas';
            bundleFlag = '';  // Uses "all" from config
            break;
        default:
            // Default to current platform
            targetPlatform = currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1);
            bundleFlag = `--bundles ${PLATFORM_TARGETS[currentPlatform]}`;
    }

    console.log(`\n═══════════════════════════════════════`);
    console.log(`  Empaquetando: ${storyId}`);
    console.log(`  Título: ${gameConfig.title}`);
    console.log(`  Versión: ${gameConfig.version}`);
    console.log(`  Plataforma: ${targetPlatform}`);
    console.log(`═══════════════════════════════════════\n`);

    // Step 1: Update Tauri config
    updateTauriConfig(storyId, gameConfig.title, gameConfig.version);

    // Step 2: Encrypt story
    if (!runCommand(`node scripts/encrypt-story.cjs ${storyId}`, 'Encriptando historia')) {
        process.exit(1);
    }

    // Step 3: Build Tauri with selected target
    console.log('\n▶ Compilando aplicación Tauri (esto puede tardar unos minutos)...\n');
    const buildCmd = bundleFlag ? `npm run tauri:build -- ${bundleFlag}` : 'npm run tauri:build';
    if (!runCommand(buildCmd, `Build de Tauri para ${targetPlatform}`)) {
        process.exit(1);
    }

    // Success!
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║          ✅ BUILD EXITOSO ✅          ║');
    console.log('╚══════════════════════════════════════╝\n');

    const bundleDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
    console.log(`📦 Bundles en:\n   ${bundleDir}\n`);

    // List what was generated
    if (fs.existsSync(bundleDir)) {
        const bundles = fs.readdirSync(bundleDir);
        console.log('Formatos generados:');
        bundles.forEach(b => console.log(`   - ${b}/`));
    }

    // Try to open the folder (Windows only)
    if (process.platform === 'win32') {
        try {
            execSync(`explorer "${bundleDir}"`, { stdio: 'ignore' });
        } catch (e) {
            // Ignore if explorer fails
        }
    }
}

main().catch(console.error);

