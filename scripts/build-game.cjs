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
const { execSync, spawn } = require('child_process');

const STORIES_DIR = path.join(__dirname, '..', 'src', 'stories');
const TAURI_CONF = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');

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

function isAndroidConfigured() {
    const hasJavaHome = !!process.env.JAVA_HOME;
    const hasAndroidHome = !!process.env.ANDROID_HOME;
    const hasNdkHome = !!process.env.NDK_HOME;
    return hasJavaHome && hasAndroidHome && hasNdkHome;
}

function checkAndroidPrerequisites() {
    if (!isAndroidConfigured()) {
        console.error('\n✗ Android no está configurado.');
        console.error('  Ejecutá primero: powershell .\\scripts\\setup-android.ps1');
        console.error('  O configurá manualmente JAVA_HOME, ANDROID_HOME y NDK_HOME.\n');
        return false;
    }

    // Check for Tauri Android project
    const genAndroidPath = path.join(__dirname, '..', 'src-tauri', 'gen', 'android');
    if (!fs.existsSync(genAndroidPath)) {
        console.error('\n✗ Proyecto Android de Tauri no inicializado.');
        console.error('  Ejecutá: npm run tauri android init\n');
        return false;
    }

    return true;
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
    console.log(`  [4] 📱 Android (APK + AAB)${isAndroidConfigured() ? ' ✓' : ' ⚠ (requiere setup)'}`);
    console.log(`  [5] Todas Desktop (requiere cross-compilation)`);
    console.log(`\n  ℹ️  Plataforma actual: ${currentPlatform}`);

    const platformSelection = await prompt('\n¿Para qué plataforma? (número, default=actual): ');

    let targetPlatform;
    let bundleFlag = '';

    let isAndroid = false;
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
            if (!checkAndroidPrerequisites()) {
                process.exit(1);
            }
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
    updateTauriConfig(storyId, gameConfig.title, gameConfig.version);

    // Step 2: Encrypt story
    if (!runCommand(`node scripts/encrypt-story.cjs ${storyId} --title "${gameConfig.title}"`, 'Encriptando historia')) {
        process.exit(1);
    }

    // Step 3: Build Tauri with selected target
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

        const isDebugBuild = buildSpeed !== '2';

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

                const apks = findApk(apkOutputDir).filter(p => p.includes('release') || p.includes('debug'));
                if (apks.length > 0) {
                    const unsignedApk = apks[0];
                    const alignedApk = unsignedApk.replace('.apk', '-aligned.apk');
                    const signedApk = unsignedApk.replace('-unsigned', '-signed').replace('-release', '-release');

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
        if (!runCommand(buildCmd, `Build de Tauri para ${targetPlatform}`)) {
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

        // Copy APKs with game name - prefer signed version
        const signedApkPath = process.env._SIGNED_APK;
        if (signedApkPath && fs.existsSync(signedApkPath)) {
            // Use the signed APK
            const newName = `${safeTitle}_${version}.apk`;
            const newPath = path.join(outputDir, newName);
            fs.copyFileSync(signedApkPath, newPath);
            const sizeMB = (fs.statSync(newPath).size / 1024 / 1024).toFixed(1);
            console.log(`   ✓ APK (firmado): ${newName} (${sizeMB} MB)`);
        } else if (fs.existsSync(apkDir)) {
            const apks = findFiles(apkDir, '.apk').filter(p => (p.includes('release') || p.includes('debug')) && !p.includes('-aligned'));
            apks.forEach(apkPath => {
                const newName = `${safeTitle}_${version}.apk`;
                const newPath = path.join(outputDir, newName);
                fs.copyFileSync(apkPath, newPath);
                const sizeMB = (fs.statSync(newPath).size / 1024 / 1024).toFixed(1);
                console.log(`   ✓ APK: ${newName} (${sizeMB} MB)`);
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

main().catch(console.error);

