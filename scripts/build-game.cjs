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
 * - Android: APK + AAB (Google Play)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');

const STORIES_DIR = path.join(__dirname, '..', 'src', 'stories');
const TAURI_CONF = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const BUILD_REGISTRY = path.join(__dirname, '..', '.omc', 'build-registry.json');
const BUILD_ID_FILE = path.join(__dirname, '..', 'src-tauri', 'resources', 'build-id.txt');

// Load .env file for BARDO_ENCRYPTION_KEY (needed for both encrypt-story and Rust compile)
function loadDotEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const match = line.match(/^([A-Z_]+)=(.+)$/);
            if (match && !process.env[match[1]]) {
                process.env[match[1]] = match[2].trim();
            }
        }
    }
}
loadDotEnv();

// Platform targets mapping
const PLATFORM_TARGETS = {
    windows: 'nsis',
    mac: 'dmg,app',
    linux: 'appimage,deb',
    android: 'apk,aab',
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

function runCommand(cmd, description, extraEnv = {}) {
    console.log(`\n▶ ${description}...`);
    try {
        execSync(cmd, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            env: {
                ...process.env,
                Path: `${process.env.Path};${process.env.USERPROFILE}\\.cargo\\bin`,
                ...extraEnv
            }
        });
        return true;
    } catch (e) {
        console.error(`✗ Error: ${e.message}`);
        return false;
    }
}

function isAndroidConfigured() {
    const hasJavaHome = !!process.env.JAVA_HOME;
    const hasAndroidHome = !!process.env.ANDROID_HOME;
    const hasNdkHome = !!process.env.NDK_HOME;
    return hasJavaHome && hasAndroidHome && hasNdkHome;
}

function checkAndroidPrerequisites(expectedIdentifier) {
    if (!isAndroidConfigured()) {
        console.error('\n✗ Android no está configurado.');
        console.error('  Ejecutá primero: powershell .\\scripts\\setup-android.ps1');
        console.error('  O configurá manualmente JAVA_HOME, ANDROID_HOME y NDK_HOME.\n');
        return false;
    }

    // Check for Tauri Android project — auto-reinit if missing or stale identifier
    const genAndroidPath = path.join(__dirname, '..', 'src-tauri', 'gen', 'android');
    let needsInit = !fs.existsSync(genAndroidPath);

    if (!needsInit && expectedIdentifier) {
        // Check if the existing gen/android matches the current identifier
        // Identifier com.bardoengine.foo → expects .../java/com/bardoengine/foo/
        const parts = expectedIdentifier.split('.');
        const expectedDir = path.join(genAndroidPath, 'app', 'src', 'main', 'java', ...parts);
        if (!fs.existsSync(expectedDir)) {
            console.log(`\n⚠ gen/android fue generado para otro juego (no existe ${parts.join('.')})`);
            needsInit = true;
        }
    }

    if (needsInit) {
        // Delete stale gen/android if it exists
        if (fs.existsSync(genAndroidPath)) {
            console.log('  → Eliminando gen/android viejo...');
            fs.rmSync(genAndroidPath, { recursive: true, force: true });
        }
        console.log('  → Inicializando proyecto Android con tauri android init...');
        try {
            execSync('npx tauri android init', {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..'),
            });
            console.log('  ✓ Proyecto Android inicializado\n');
        } catch (e) {
            console.error(`\n✗ Error inicializando Android: ${e.message}`);
            return false;
        }
    }

    return true;
}

// ---------------------------------------------------------------------------
// DRM: buildId generation + registry
// ---------------------------------------------------------------------------

function generateBuildId() {
    return crypto.randomBytes(6).toString('hex'); // 12 hex chars
}

function appendBuildRegistry(entry) {
    const omcDir = path.join(__dirname, '..', '.omc');
    if (!fs.existsSync(omcDir)) {
        fs.mkdirSync(omcDir, { recursive: true });
    }
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(BUILD_REGISTRY, line, 'utf8');
}

function writeBuildIdFile(buildId) {
    const resourcesDir = path.join(__dirname, '..', 'src-tauri', 'resources');
    if (!fs.existsSync(resourcesDir)) {
        fs.mkdirSync(resourcesDir, { recursive: true });
    }
    fs.writeFileSync(BUILD_ID_FILE, buildId, 'utf8');
}

// ---------------------------------------------------------------------------
// DRM: key rotation per minor/patch release
// ---------------------------------------------------------------------------

/** Parse semver string → { major, minor, patch } */
function parseSemver(v) {
    const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!m) return null;
    return { major: parseInt(m[1]), minor: parseInt(m[2]), patch: parseInt(m[3]) };
}

/** Read package.json version */
function readPackageVersion() {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    return pkg.version || '0.0.0';
}

/**
 * Derive BARDO_SECRET_A, BARDO_SECRET_B, BARDO_OBFUSCATION_SEED deterministically
 * from a single .env.master file via HKDF-SHA256.
 * The info field is the minor-version tag so secrets rotate per minor automatically.
 * Sets the three env vars in process.env.
 * Returns { minorTag }.
 */
function resolveSecrets(version) {
    const sv = parseSemver(version);
    if (!sv) throw new Error(`Cannot parse semver from version: ${version}`);
    const minorTag = `${sv.major}.${sv.minor}.0`;

    // Master secret — único archivo a versionar en el vault.
    const masterFile = path.join(__dirname, '..', '.env.master');
    if (!fs.existsSync(masterFile)) {
        console.error('\n[DRM] ERROR: .env.master not found.');
        console.error('       This file holds BARDO_MASTER_SECRET (64 hex chars).');
        console.error('       Restore it from your secrets vault, or bootstrap a new');
        console.error('       project with: npm run drm:init');
        process.exit(1);
    }

    const masterLine = fs.readFileSync(masterFile, 'utf8')
        .split('\n').find(l => l.startsWith('BARDO_MASTER_SECRET='));
    if (!masterLine) {
        console.error('[DRM] ERROR: .env.master missing BARDO_MASTER_SECRET=…');
        process.exit(1);
    }
    const masterHex = masterLine.split('=')[1].trim();
    if (!/^[0-9a-f]{64}$/i.test(masterHex)) {
        console.error('[DRM] ERROR: BARDO_MASTER_SECRET must be 64 hex chars.');
        process.exit(1);
    }
    const master = Buffer.from(masterHex, 'hex');

    const derive = (label) => {
        // HKDF-SHA256: salt=label, info=minorTag, length=32 bytes
        return crypto.hkdfSync('sha256', master, Buffer.from(label), Buffer.from(minorTag), 32);
    };

    process.env.BARDO_SECRET_A         = Buffer.from(derive('bardo/secret-a')).toString('hex');
    process.env.BARDO_SECRET_B         = Buffer.from(derive('bardo/secret-b')).toString('hex');
    process.env.BARDO_OBFUSCATION_SEED = Buffer.from(derive('bardo/obfuscation')).toString('hex');

    console.log(`\n[DRM] Secrets derived for ${version} (minor=${minorTag}) from .env.master`);
    return { minorTag };
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
    console.log(`\n  [E] BardoEditor (standalone editor)`);

    // Get user selection for story
    const selection = await prompt('\n¿Qué querés empaquetar? (número o E): ');

    const isEditorBuild = selection.toLowerCase() === 'e';
    let storyId, gameConfig;

    if (isEditorBuild) {
        storyId = 'editor';
        gameConfig = { title: 'BardoEditor', version: '1.0.0' };
    } else {
        const index = parseInt(selection) - 1;
        if (isNaN(index) || index < 0 || index >= stories.length) {
            console.error('Selección inválida');
            process.exit(1);
        }
        storyId = stories[index];
        gameConfig = getGameConfig(storyId);
    }

    // Platform selection
    const currentPlatform = detectCurrentPlatform();
    console.log('\nPlataformas disponibles:\n');
    console.log(`  [1] Windows (NSIS installer)`);
    console.log(`  [2] macOS (DMG + App bundle)`);
    console.log(`  [3] Linux (AppImage + Deb)`);
    console.log(`  [4] 📱 Android (APK + AAB)${isAndroidConfigured() ? ' ✓' : ' ⚠ (requiere setup)'}`);
    console.log(`  [5] Todas Desktop (requiere cross-compilation)`);
    console.log(`\n  ℹ️  Plataforma actual: ${currentPlatform}`);

    const platformSelection = await prompt('\n¿Para qué plataforma? (número, default=actual): ');

    let targetPlatform;
    let bundleFlag = '';

    let isAndroid = false;
    let isDebugBuild = false;
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
            targetPlatform = 'Android';
            isAndroid = true;
            break;
        case '5':
            targetPlatform = 'Todas (Desktop)';
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
    if (isEditorBuild) {
        const config = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));
        config.productName = 'BardoEditor';
        config.version = gameConfig.version;
        config.identifier = 'com.bardoengine.editor';
        config.app.windows[0].title = 'BardoEditor';
        fs.writeFileSync(TAURI_CONF, JSON.stringify(config, null, 2));
        console.log(`✓ Configuración actualizada para BardoEditor`);
    } else {
        updateTauriConfig(storyId, gameConfig.title, gameConfig.version);
    }

    // Step 1b: For Android, check/reinit gen/android after config is updated
    if (isAndroid) {
        const config = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));
        if (!checkAndroidPrerequisites(config.identifier)) {
            process.exit(1);
        }
    }

    // Step 2: DRM — resolve secrets + generate buildId + prompt channel
    let buildId = null;
    if (!isEditorBuild) {
        // Key rotation: minor generates new secrets, patch reuses them
        const version = gameConfig.version;
        resolveSecrets(version);

        // Generate buildId for this specific build
        buildId = generateBuildId();
        console.log(`\n[DRM] Build ID: ${buildId}`);

        // Channel prompt
        console.log('\nCanales de distribución disponibles:');
        console.log('  itch / steam / web / press / beta / dev / other');
        const channel = await prompt('Channel para este build? [dev]: ') || 'dev';
        const recipient = await prompt('Destinatario (opcional, ej: "beta-tester-01"): ');

        // Write buildId to sidecar resource file (binary tracing)
        writeBuildIdFile(buildId);
        console.log(`[DRM] buildId escrito en src-tauri/resources/build-id.txt`);

        // Get git SHA for registry
        let gitSha = 'unknown';
        try {
            gitSha = execSync('git rev-parse --short HEAD', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
        } catch (_) { /* not a git repo or no commits */ }

        // Append to build registry
        const registryEntry = {
            buildId,
            timestamp: new Date().toISOString(),
            channel,
            recipient: recipient || null,
            version,
            gitSha,
        };
        appendBuildRegistry(registryEntry);
        console.log(`[DRM] Registry entry saved to .omc/build-registry.json`);
    }

    // Step 2b: Encrypt story (skip for editor builds — no story needed)
    if (!isEditorBuild) {
        const buildIdFlag = buildId ? `--build-id ${buildId}` : '';
        if (!runCommand(`node scripts/encrypt-story.cjs ${storyId} --title "${gameConfig.title}" ${buildIdFlag}`.trim(), 'Encriptando historia')) {
            process.exit(1);
        }
    }

    // Step 3: If new minor release, force cargo clean so new secrets bake in
    if (!isEditorBuild) {
        const sv = parseSemver(gameConfig.version);
        if (sv && sv.patch === 0) {
            console.log('\n[DRM] Minor release — forzando cargo clean para que los nuevos secretos se compilen...');
            runCommand('cargo clean --manifest-path src-tauri/Cargo.toml', 'cargo clean');
        }
    }

    // Step 4: Build Tauri with selected target
    if (isAndroid) {
        // Android build flow
        console.log('\n▶ Compilando para Android...\n');

        const androidBuildMode = await prompt(
            '¿Qué tipo de build?\n' +
            '  [1] APK para testing (firmado, instalable directo)\n' +
            '  [2] AAB para Google Play (sin firmar)\n' +
            'Elegí (1/2): '
        );

        const buildSpeed = await prompt(
            '\n¿Velocidad de build?\n' +
            '  [1] Rápido (debug, ~1-2 min, APK más grande) — para testing\n' +
            '  [2] Optimizado (release, ~5-10 min, APK mínimo) — para distribuir\n' +
            'Elegí (1/2, default=1): '
        );

        isDebugBuild = buildSpeed !== '2';

        const archChoice = await prompt(
            '\n¿Para qué arquitectura?\n' +
            '  [1] ARM64 (aarch64) - el 99% de celulares modernos (~15-20 MB)\n' +
            '  [2] Universal (todas las arquitecturas, ~60 MB)\n' +
            'Elegí (1/2): '
        );

        const targetArch = archChoice === '2' ? '' : '--target aarch64';
        const archLabel = archChoice === '2' ? 'universal' : 'aarch64';

        const debugFlag = isDebugBuild ? '--debug' : '';
        const androidBuildCmd = `npx tauri android build ${debugFlag} ${targetArch}`.trim();
        const modeLabel = isDebugBuild ? 'debug (rápido)' : 'release optimizado';
        console.log(`\n  📱 Compilando ${modeLabel} (${archLabel})...`);
        if (!isDebugBuild) {
            console.log('  (release = binarios optimizados y stripeados, tamaño mínimo)\n');
        } else {
            console.log('  (debug = compilación rápida, APK más grande pero funcional)\n');
        }

        if (!runCommand(androidBuildCmd, `Build Android ${archLabel}`)) {
            process.exit(1);
        }

        // For testing builds: auto-sign with debug keystore so APK is installable
        if (androidBuildMode !== '2') {
            console.log('\n▶ Firmando APK con debug keystore...');

            // Find apksigner and zipalign
            const sdkPath = process.env.ANDROID_HOME || process.env.LocalAppData + '\\Android\\Sdk';
            const buildToolsDir = path.join(sdkPath, 'build-tools');
            let apksigner = null;
            let zipalign = null;

            if (fs.existsSync(buildToolsDir)) {
                const versions = fs.readdirSync(buildToolsDir).sort().reverse();
                for (const ver of versions) {
                    const apk = path.join(buildToolsDir, ver, 'apksigner.bat');
                    const zip = path.join(buildToolsDir, ver, 'zipalign.exe');
                    if (fs.existsSync(apk) && fs.existsSync(zip)) {
                        apksigner = apk;
                        zipalign = zip;
                        break;
                    }
                }
            }

            const debugKeystore = path.join(process.env.USERPROFILE || process.env.HOME, '.android', 'debug.keystore');

            if (apksigner && zipalign && fs.existsSync(debugKeystore)) {
                // Find the unsigned APK
                const apkOutputDir = path.join(__dirname, '..', 'src-tauri', 'gen', 'android', 'app', 'build', 'outputs', 'apk');
                const findApk = (dir) => {
                    const results = [];
                    try {
                        const items = fs.readdirSync(dir, { withFileTypes: true });
                        for (const item of items) {
                            const full = path.join(dir, item.name);
                            if (item.isDirectory()) results.push(...findApk(full));
                            else if (item.name.endsWith('.apk')) results.push(full);
                        }
                    } catch (e) { /* ignore */ }
                    return results;
                };

                // Only sign the APK matching the chosen build variant (debug/release).
                // Without this filter we could grab a stale APK from the other variant.
                const variantTag = isDebugBuild ? 'debug' : 'release';
                const apks = findApk(apkOutputDir).filter(p => p.includes(variantTag) && !p.includes('-aligned'));
                if (apks.length > 0) {
                    const unsignedApk = apks[0];
                    const alignedApk = unsignedApk.replace('.apk', '-aligned.apk');
                    const signedApk = unsignedApk.replace('.apk', '-signed.apk');

                    // Step 1: zipalign
                    console.log('  → zipalign...');
                    execSync(`"${zipalign}" -f 4 "${unsignedApk}" "${alignedApk}"`, { stdio: 'pipe' });

                    // Step 2: sign with debug keystore
                    console.log('  → apksigner (debug keystore)...');
                    execSync(
                        `"${apksigner}" sign --ks "${debugKeystore}" --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --out "${signedApk}" "${alignedApk}"`,
                        { stdio: 'pipe' }
                    );

                    // Clean up intermediate file
                    try { fs.unlinkSync(alignedApk); } catch (e) { /* ignore */ }

                    console.log('  ✓ APK firmado exitosamente');

                    // Store the signed APK path for the rename step
                    process.env._SIGNED_APK = signedApk;
                } else {
                    console.log('  ⚠ No se encontró el APK para firmar');
                }
            } else {
                console.log('  ⚠ No se puede auto-firmar:');
                if (!fs.existsSync(debugKeystore)) console.log('    - debug.keystore no encontrado');
                if (!apksigner) console.log('    - apksigner no encontrado');
                if (!zipalign) console.log('    - zipalign no encontrado');
                console.log('  El APK queda sin firmar.');
            }
        }
    } else {
        // Desktop build flow
        console.log('\n▶ Compilando aplicación Tauri (esto puede tardar unos minutos)...\n');
        const buildCmd = bundleFlag ? `npm run tauri:build -- ${bundleFlag}` : 'npm run tauri:build';
        const buildEnv = isEditorBuild ? { VITE_EDITOR_STANDALONE: '1' } : {};
        if (!runCommand(buildCmd, `Build de Tauri para ${targetPlatform}`, buildEnv)) {
            process.exit(1);
        }
    }

    // Success!
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║          ✅ BUILD EXITOSO ✅          ║');
    console.log('╚══════════════════════════════════════╝\n');

    if (isAndroid) {
        // Android output paths
        const androidOutputDir = path.join(__dirname, '..', 'src-tauri', 'gen', 'android', 'app', 'build', 'outputs');
        const apkDir = path.join(androidOutputDir, 'apk');
        const aabDir = path.join(androidOutputDir, 'bundle');

        // Sanitize game title for filename: remove emojis, special chars, trim
        const safeTitle = gameConfig.title
            .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  // Remove emojis
            .replace(/[\u{2600}-\u{27FF}]/gu, '')     // Remove misc symbols
            .replace(/[\u{FE00}-\u{FEFF}]/gu, '')     // Remove variation selectors
            .replace(/[<>:"/\\|?*]/g, '')              // Remove filesystem-invalid chars
            .replace(/\s+/g, '_')                      // Spaces to underscores
            .replace(/_+/g, '_')                       // Collapse multiple underscores
            .replace(/^_|_$/g, '')                     // Trim leading/trailing underscores
            .trim();

        const version = gameConfig.version;
        const outputDir = path.join(__dirname, '..', 'android-builds');

        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Find and rename APK files
        const findFiles = (dir, ext) => {
            const results = [];
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                items.forEach(item => {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory()) results.push(...findFiles(fullPath, ext));
                    else if (item.name.endsWith(ext)) results.push(fullPath);
                });
            } catch (e) { /* ignore */ }
            return results;
        };

        console.log(`\n📱 Output Android:`);

        // Copy APK matching the chosen build variant only.
        // Previously this would copy BOTH debug AND release APKs to the same
        // filename, with the last-iterated overwriting the first — typically
        // leaving the stale-cached variant in android-builds/.
        const variantTag = isDebugBuild ? 'debug' : 'release';
        const variantLabel = isDebugBuild ? 'debug' : 'release';
        const signedApkPath = process.env._SIGNED_APK;
        if (signedApkPath && fs.existsSync(signedApkPath)) {
            const newName = `${safeTitle}_${version}_${variantLabel}.apk`;
            const newPath = path.join(outputDir, newName);
            fs.copyFileSync(signedApkPath, newPath);
            const sizeMB = (fs.statSync(newPath).size / 1024 / 1024).toFixed(1);
            console.log(`   ✓ APK (firmado, ${variantLabel}): ${newName} (${sizeMB} MB)`);
        } else if (fs.existsSync(apkDir)) {
            const apks = findFiles(apkDir, '.apk').filter(p =>
                p.includes(variantTag) && !p.includes('-aligned') && !p.includes('-signed')
            );
            apks.forEach(apkPath => {
                const newName = `${safeTitle}_${version}_${variantLabel}.apk`;
                const newPath = path.join(outputDir, newName);
                fs.copyFileSync(apkPath, newPath);
                const sizeMB = (fs.statSync(newPath).size / 1024 / 1024).toFixed(1);
                console.log(`   ✓ APK (${variantLabel}): ${newName} (${sizeMB} MB)`);
            });
        }

        // Copy AABs with game name
        if (fs.existsSync(aabDir)) {
            const aabs = findFiles(aabDir, '.aab');
            aabs.forEach(aabPath => {
                const newName = `${safeTitle}_${version}.aab`;
                const newPath = path.join(outputDir, newName);
                fs.copyFileSync(aabPath, newPath);
                console.log(`   ✓ AAB: ${newName} (${(fs.statSync(newPath).size / 1024 / 1024).toFixed(1)} MB)`);
            });
        }

        console.log(`\n   📂 Builds en: ${outputDir}`);

        // Try to open the output folder
        if (process.platform === 'win32') {
            try {
                execSync(`explorer "${outputDir}"`, { stdio: 'ignore' });
            } catch (e) { /* ignore */ }
        }
    } else {
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

}

function bootstrapMaster() {
    const masterFile = path.join(__dirname, '..', '.env.master');
    if (fs.existsSync(masterFile)) {
        console.error('[DRM] .env.master already exists — refusing to overwrite.');
        process.exit(1);
    }
    const master = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(masterFile,
        `BARDO_MASTER_SECRET=${master}\n` +
        `# Generated ${new Date().toISOString()}\n` +
        `# BACK THIS UP. Losing it strands every shipped build forever.\n`,
        'utf8');
    console.log(`[DRM] Wrote .env.master. BACK IT UP NOW.`);
}
if (process.argv[2] === '--init-master') { bootstrapMaster(); process.exit(0); }

main().catch(console.error);

