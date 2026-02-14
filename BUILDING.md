# 🎮 BardoEngine - Guía de Build para Desarrolladores

Esta guía explica cómo crear builds standalone de juegos usando BardoEngine.
Soporta **Windows, macOS, Linux y Android**.

---

## 📁 Estructura del Proyecto

```
bardoengine/
├── src/
│   ├── stories/              # Historias y configs por juego
│   │   ├── serruchin.json          # Historia compilada
│   │   ├── serruchin.config.json   # ⭐ Config del juego
│   │   ├── partuza.json
│   │   └── partuza.config.json
│   ├── config/
│   │   └── loadGameConfig.js       # Loader de configs
│   └── story-config.json     # Config generado en build (no editar)
├── scripts/
│   ├── build-game.cjs        # Script interactivo de build
│   ├── encrypt-story.cjs     # Encripta historias para producción
│   └── setup-android.ps1     # Setup automático de Android
├── src-tauri/
│   ├── tauri.conf.json       # Config de Tauri (auto-generado en build)
│   ├── gen/android/          # Proyecto Android (auto-generado)
│   └── target/release/bundle/nsis/  # 📦 Instaladores generados
└── public/
    ├── sounds/               # Efectos de sonido
    └── music/                # Música de fondo
```

---

## ⚙️ Configuración de Juegos

### Archivo: `src/stories/{storyId}.config.json`

Cada juego tiene su propio archivo de configuración JSON:

```json
{
  "title": "Serruchín",
  "version": "1.0.0",
  "stats": {
    "enabled": true,
    "definitions": [...],
    "onZero": {...}
  },
  "inventory": {
    "enabled": true,
    "maxSlots": 5,
    "categories": ["herramientas", "trofeos"]
  },
  "items": {
    "serruchin": { "name": "Serrucho", "icon": "🪚", ... }
  }
}
```

### Campos de Build

| Campo | Descripción | Usado en |
|-------|-------------|----------|
| `title` | Nombre del juego | Instalador, ventana, tauri.conf.json |
| `version` | Versión semver | Instalador, info del .exe |
| `stats` | Definición de estadísticas | Sistema de stats in-game |
| `inventory` | Config de inventario | Sistema de inventario in-game |
| `items` | Definición de items | Inventario, descripción de objetos |

---

## 🔨 Proceso de Build

### Comando

```powershell
npm run build-game
```

### Qué hace el script:

1. **Lista historias disponibles** con su versión y título
2. **Te pide elegir** cuál empaquetar
3. **Te pide elegir plataforma** (Windows/Mac/Linux/Todas)
4. **Actualiza `tauri.conf.json`** con el title/version del gameConfig
5. **Encripta la historia** (protección del contenido)
6. **Compila Tauri** → genera instalador para la plataforma elegida

### Plataformas soportadas

| Plataforma | Target | Output |
|------------|--------|--------|
| Windows | `nsis` | `{GameTitle}_{version}_x64-setup.exe` |
| macOS | `dmg`, `app` | `{GameTitle}_{version}_x64.dmg` |
| Linux | `appimage`, `deb` | `{GameTitle}_{version}_amd64.AppImage`, `.deb` |
| Android | `apk`, `aab` | `.apk` (debug/testing), `.aab` (Google Play) |

### Output

Los bundles quedan en:
```
# Desktop
src-tauri/target/release/bundle/
├── nsis/      # Windows
├── dmg/       # macOS
├── macos/     # macOS App bundle
├── appimage/  # Linux AppImage
└── deb/       # Linux .deb

# Android
src-tauri/gen/android/app/build/outputs/
├── apk/       # APK para testing directo
└── bundle/    # AAB para Google Play
```

---

## 📱 Build para Android

### Prerequisitos

1. **Android Studio** instalado y abierto al menos una vez
2. Desde SDK Manager de Android Studio, instalar:
   - Android SDK Platform (API 34+)
   - Android SDK Platform-Tools
   - NDK (Side by side)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
3. **Rust Android targets** (se instalan automáticamente con el setup)

### Setup Automático

```powershell
npm run android:setup
```

Este script:
- ✅ Detecta Android Studio
- ✅ Configura `JAVA_HOME`, `ANDROID_HOME`, `NDK_HOME`
- ✅ Instala los Rust targets para ARM/x86
- ✅ Instala SDK components via sdkmanager
- ✅ Inicializa el proyecto Android de Tauri (`tauri android init`)

### Setup Manual

Si preferís configurar a mano:

```powershell
# 1. Variables de entorno (PowerShell)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LocalAppData\Android\Sdk", "User")
$NDK_VER = Get-ChildItem -Name "$env:LocalAppData\Android\Sdk\ndk" | Select-Object -Last 1
[System.Environment]::SetEnvironmentVariable("NDK_HOME", "$env:LocalAppData\Android\Sdk\ndk\$NDK_VER", "User")

# 2. Rust targets
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# 3. Inicializar proyecto Tauri Android
npm run android:init
```

### Comandos de Android

| Comando | Descripción |
|---------|-------------|
| `npm run android:setup` | Setup completo automatizado |
| `npm run android:init` | Inicializa proyecto Android de Tauri |
| `npm run android:dev` | Dev mode con hot-reload en emulador/device |
| `npm run android:build` | Build debug APK (testing) |
| `npm run android:release` | Build release AAB (Google Play) |
| `npm run build-game` | Builder interactivo (ahora incluye opción Android) |

### Testing en Dispositivo

```powershell
# Dev mode con hot-reload
npm run android:dev

# O build + instalar APK manualmente
npm run android:build
# El APK queda en: src-tauri/gen/android/app/build/outputs/apk/
# Transferilo al dispositivo e instalarlo
```

### Firma para Google Play

Para publicar en Google Play necesitás firmar el AAB:

1. Generá un keystore:
```powershell
keytool -genkey -v -keystore bardoengine-release.keystore -alias bardoengine -keyalg RSA -keysize 2048 -validity 10000
```

2. Configurá la firma en `src-tauri/gen/android/app/build.gradle.kts`

3. Build release: `npm run android:release`

> ⚠️ **Nunca commitees el keystore ni las passwords.** Agregá `*.keystore` al `.gitignore`.

---

## 🖥️ Builds Multiplataforma

### Requisitos por Plataforma

**Windows (build nativo):**
```powershell
# Ya incluido en Rust toolchain
winget install Rustlang.Rust.MSVC
```

**macOS (requiere Mac o CI):**
```bash
# En macOS
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Linux (requiere Linux o CI):**
```bash
# Ubuntu/Debian
sudo apt-get install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Cross-Compilation (Avanzado)

Para generar builds de otras plataformas desde Windows, necesitás GitHub Actions o similar:

```yaml
# .github/workflows/release.yml (ejemplo)
jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-22.04, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - uses: dtolnay/rust-action@stable
      - run: npm install
      - run: npm run tauri:build
```

> **Nota:** Las builds de Mac solo pueden generarse en macOS (requisito de Apple).


---

## 📝 Checklist Pre-Build

Antes de hacer un build de producción:

- [ ] Actualizar `version` en `gameConfig.js`
- [ ] Verificar `title` correcto
- [ ] Tener todos los assets (sonidos, música) en `public/`
- [ ] Probar el juego en dev mode (`npm run dev`)
- [ ] Commitear todos los cambios

---

## 🔢 Versionado

Usamos **Semantic Versioning** (semver):

```
MAJOR.MINOR.PATCH
  │     │     └── Bugfixes
  │     └──────── Nuevas features (backwards compatible)
  └────────────── Breaking changes / releases mayores
```

Ejemplos:
- `0.1.0` → Alpha/Beta
- `1.0.0` → Primera release pública
- `1.1.0` → Nuevo contenido agregado
- `1.1.1` → Bugfix

---

## 🎵 Assets de Audio

### Sonidos (SFX)
- Ubicación: `public/sounds/`
- Formato: `.mp3`
- Registro: `src/hooks/useAudio.js` → `SOUNDS`

### Música
- Ubicación: `public/music/`
- Formato: `.mp3`
- Registro: `src/hooks/useAudio.js` → `MUSIC`

---

## 🔐 Encriptación

Las historias se encriptan automáticamente durante el build para proteger el contenido narrativo. El script `encrypt-story.cjs` maneja esto.

**Nota:** La encriptación es para ofuscación básica, no seguridad criptográfica.

---

## 🐛 Troubleshooting

### "Rust not found"
```powershell
# Instalar Rust
winget install Rustlang.Rust.MSVC
# Reiniciar terminal
```

### "No encontré config para 'X'"
Asegurate de que el juego tenga `title` y `version` en `gameConfig.js`.

### Build muy lento
El primer build de Tauri tarda ~5-10 min porque compila Rust. Los siguientes son más rápidos.

### Android: "SDK not found"
```powershell
# Verificar variables de entorno
echo $env:JAVA_HOME
echo $env:ANDROID_HOME
echo $env:NDK_HOME

# Si faltan, correr el setup:
npm run android:setup
```

### Android: "NDK not found"
Instalá el NDK desde Android Studio > Settings > SDK Manager > SDK Tools > NDK (Side by side).

### Android: Build falla con error de Gradle
```powershell
# Limpiar cache de Gradle
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue
# Reintentar build
npm run android:build
```

### Android: No detecta emulador/dispositivo
```powershell
# Verificar que adb detecta el device
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
# Si no aparece, habilitá USB Debugging en el teléfono
```

---

## 📚 Referencias

- [Tauri Docs](https://tauri.app/v1/guides/)
- [Ink Scripting](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)
- [Semver](https://semver.org/)
