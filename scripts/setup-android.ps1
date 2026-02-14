<#
.SYNOPSIS
    BardoEngine Android Build Setup
    Configura el entorno para compilar APKs/AABs de Android con Tauri v2

.DESCRIPTION
    Este script:
    1. Valida que Android Studio este instalado
    2. Configura JAVA_HOME, ANDROID_HOME, NDK_HOME
    3. Instala los Android targets de Rust
    4. Instala SDK components faltantes via sdkmanager
    5. Inicializa el proyecto Android de Tauri

.NOTES
    Ejecutar como: .\scripts\setup-android.ps1
    Requiere: Android Studio instalado previamente
#>

# Use Continue so stderr from native tools (rustup, sdkmanager) does not abort
$ErrorActionPreference = "Continue"

# ======================================================================
# BARDOENGINE ANDROID SETUP
# ======================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "   BARDOENGINE - ANDROID BUILD SETUP                            " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host ""

# -- Step 1: Detect Android Studio ------------------------------------
Write-Host "[1/6] Buscando Android Studio..." -ForegroundColor Cyan

$androidStudioPaths = @(
    "C:\Program Files\Android\Android Studio",
    "$env:LocalAppData\Programs\Android\Android Studio",
    "$env:ProgramFiles\Android\Android Studio"
)

$androidStudioPath = $null
foreach ($p in $androidStudioPaths) {
    if (Test-Path $p) {
        $androidStudioPath = $p
        break
    }
}

if (-not $androidStudioPath) {
    Write-Host ""
    Write-Host "  [X] Android Studio NO encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Para instalar Android Studio:" -ForegroundColor Yellow
    Write-Host "  1. Descarga desde: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "  2. Instala con las opciones por defecto" -ForegroundColor White
    Write-Host "  3. Abri Android Studio al menos una vez para que descargue el SDK" -ForegroundColor White
    Write-Host "  4. En SDK Manager, instala:" -ForegroundColor White
    Write-Host "     - Android SDK Platform (API 34 o superior)" -ForegroundColor Gray
    Write-Host "     - Android SDK Platform-Tools" -ForegroundColor Gray
    Write-Host "     - NDK (Side by side)" -ForegroundColor Gray
    Write-Host "     - Android SDK Build-Tools" -ForegroundColor Gray
    Write-Host "     - Android SDK Command-line Tools" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  5. Volve a ejecutar este script." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "  [OK] Android Studio encontrado: $androidStudioPath" -ForegroundColor Green

# -- Step 2: Configure JAVA_HOME --------------------------------------
Write-Host ""
Write-Host "[2/6] Configurando JAVA_HOME..." -ForegroundColor Cyan

$jbrPath = Join-Path $androidStudioPath "jbr"
if (-not (Test-Path $jbrPath)) {
    Write-Host "  [!] JBR no encontrado, probando ruta alternativa..." -ForegroundColor Yellow
    $jbrPath = Join-Path $androidStudioPath "jre"
    if (-not (Test-Path $jbrPath)) {
        Write-Host "  [X] No se encontro el JDK de Android Studio" -ForegroundColor Red
        exit 1
    }
}

$currentJavaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
if ($currentJavaHome -ne $jbrPath) {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jbrPath, "User")
    $env:JAVA_HOME = $jbrPath
    Write-Host "  [OK] JAVA_HOME configurado: $jbrPath" -ForegroundColor Green
}
else {
    $env:JAVA_HOME = $jbrPath
    Write-Host "  [OK] JAVA_HOME ya configurado: $jbrPath" -ForegroundColor Green
}

# -- Step 3: Configure ANDROID_HOME & NDK_HOME ------------------------
Write-Host ""
Write-Host "[3/6] Configurando ANDROID_HOME y NDK_HOME..." -ForegroundColor Cyan

$sdkPaths = @(
    "$env:LocalAppData\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

$sdkPath = $null
foreach ($p in $sdkPaths) {
    if (Test-Path $p) {
        $sdkPath = $p
        break
    }
}

if (-not $sdkPath) {
    Write-Host "  [X] Android SDK no encontrado." -ForegroundColor Red
    Write-Host "  Abri Android Studio y deja que descargue el SDK," -ForegroundColor Yellow
    Write-Host "  despues volve a ejecutar este script." -ForegroundColor Yellow
    exit 1
}

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
$env:ANDROID_HOME = $sdkPath
Write-Host "  [OK] ANDROID_HOME: $sdkPath" -ForegroundColor Green

# Find and set NDK_HOME
$ndkDir = Join-Path $sdkPath "ndk"
$ndkFound = $false

if (Test-Path $ndkDir) {
    $ndkVersion = Get-ChildItem -Name $ndkDir -ErrorAction SilentlyContinue | Sort-Object -Descending | Select-Object -First 1
    if ($ndkVersion) {
        $ndkPath = Join-Path $ndkDir $ndkVersion
        [System.Environment]::SetEnvironmentVariable("NDK_HOME", $ndkPath, "User")
        $env:NDK_HOME = $ndkPath
        Write-Host "  [OK] NDK_HOME: $ndkPath" -ForegroundColor Green
        $ndkFound = $true
    }
}

if (-not $ndkFound) {
    Write-Host "  [!] NDK no encontrado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Para instalar el NDK:" -ForegroundColor White
    Write-Host "  1. Abri Android Studio" -ForegroundColor White
    Write-Host "  2. Anda a: File -> Settings -> Languages & Frameworks -> Android SDK" -ForegroundColor White
    Write-Host "  3. Selecciona la pestana 'SDK Tools'" -ForegroundColor White
    Write-Host "  4. Marca 'NDK (Side by side)' y 'Android SDK Command-line Tools'" -ForegroundColor White
    Write-Host "  5. Click en 'Apply' y espera la descarga" -ForegroundColor White
    Write-Host "  6. Volve a ejecutar este script" -ForegroundColor White
    Write-Host ""
}

# -- Step 4: Install SDK Components -----------------------------------
Write-Host ""
Write-Host "[4/6] Verificando SDK Components..." -ForegroundColor Cyan

# Search for sdkmanager recursively in the SDK directory
$sdkmanager = $null
$sdkmanagerSearch = Get-ChildItem -Path $sdkPath -Filter "sdkmanager.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if ($sdkmanagerSearch) {
    $sdkmanager = $sdkmanagerSearch.FullName
}

if ($sdkmanager) {
    Write-Host "  sdkmanager found: $sdkmanager" -ForegroundColor Gray
    Write-Host "  Instalando componentes necesarios (puede tardar)..." -ForegroundColor Gray

    $components = @(
        "platforms;android-34",
        "platform-tools",
        "build-tools;34.0.0"
    )

    foreach ($component in $components) {
        Write-Host "    -> $component" -ForegroundColor Gray
        # Use cmd /c to avoid PowerShell stderr issues with batch files
        cmd /c "`"$sdkmanager`" `"$component`" --sdk_root=`"$sdkPath`" 2>&1" | Out-Null
    }
    Write-Host "  [OK] SDK Components verificados" -ForegroundColor Green
}
else {
    Write-Host "  [!] sdkmanager no disponible." -ForegroundColor Yellow
    Write-Host "  Instala 'Android SDK Command-line Tools' desde Android Studio > SDK Manager > SDK Tools" -ForegroundColor Yellow
}

# -- Step 5: Add Rust Android Targets ---------------------------------
Write-Host ""
Write-Host "[5/6] Instalando Rust Android targets..." -ForegroundColor Cyan

$rustTargets = @(
    "aarch64-linux-android",
    "armv7-linux-androideabi",
    "i686-linux-android",
    "x86_64-linux-android"
)

foreach ($target in $rustTargets) {
    Write-Host "  -> $target" -ForegroundColor Gray
    # Use cmd /c to prevent PowerShell from treating rustup's stderr info lines as errors
    cmd /c "rustup target add $target 2>&1" | Out-Host
}

Write-Host "  [OK] Targets de Rust instalados" -ForegroundColor Green

# -- Step 6: Initialize Tauri Android ---------------------------------
Write-Host ""
Write-Host "[6/6] Inicializando proyecto Android de Tauri..." -ForegroundColor Cyan

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Check if already initialized
$genAndroidPath = Join-Path $projectRoot "src-tauri\gen\android"
if (Test-Path $genAndroidPath) {
    Write-Host "  [OK] Proyecto Android ya inicializado" -ForegroundColor Green
}
else {
    if (-not $ndkFound) {
        Write-Host "  [!] Saltando inicializacion: NDK no disponible." -ForegroundColor Yellow
        Write-Host "  Instala el NDK primero y volve a ejecutar." -ForegroundColor Yellow
    }
    else {
        Push-Location $projectRoot
        try {
            cmd /c "npm run tauri -- android init 2>&1" | Out-Host
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Proyecto Android inicializado exitosamente" -ForegroundColor Green
            }
            else {
                Write-Host "  [X] Error inicializando proyecto Android" -ForegroundColor Red
                Write-Host "  Intenta manualmente: npm run tauri android init" -ForegroundColor Yellow
            }
        }
        finally {
            Pop-Location
        }
    }
}

# -- Summary -----------------------------------------------------------
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "   SETUP COMPLETADO                                             " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Variables de entorno:" -ForegroundColor White
Write-Host "    JAVA_HOME    = $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "    ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Gray
Write-Host "    NDK_HOME     = $env:NDK_HOME" -ForegroundColor Gray
Write-Host ""

if (-not $ndkFound) {
    Write-Host "  [!] ATENCION: Faltan componentes por instalar." -ForegroundColor Yellow
    Write-Host "  Abre Android Studio > SDK Manager > SDK Tools e instala:" -ForegroundColor Yellow
    Write-Host "    - NDK (Side by side)" -ForegroundColor White
    Write-Host "    - Android SDK Command-line Tools" -ForegroundColor White
    Write-Host "  Luego volve a ejecutar: npm run android:setup" -ForegroundColor Yellow
}
else {
    Write-Host "  Proximos pasos:" -ForegroundColor White
    Write-Host "    1. Reinicia la terminal para que tomen efecto las variables" -ForegroundColor Gray
    Write-Host "    2. Para desarrollo:  npm run android:dev" -ForegroundColor Gray
    Write-Host "    3. Para build APK:   npm run android:build" -ForegroundColor Gray
    Write-Host "    4. Para build game:  npm run build-game  (ahora incluye Android)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  Mas info: BUILDING.md" -ForegroundColor Yellow
Write-Host ""
