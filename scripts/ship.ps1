#Requires -Version 5.1
<#
.SYNOPSIS
    Atomic ship script for BardoEngine. Runs validations, bumps versions, commits, merges to dev, and pushes.

.PARAMETER Bump
    Version bump type: 'patch' (default) or 'minor'.

.PARAMETER DryRun
    If set, prints what would happen without executing any changes. Skips test run.

.EXAMPLE
    pwsh scripts/ship.ps1 -Bump patch
    pwsh scripts/ship.ps1 -Bump minor -DryRun
#>

param(
    [ValidateSet('patch', 'minor')]
    [string]$Bump = 'patch',
    [switch]$DryRun
)

Set-StrictMode -Version Latest
# Don't use 'Stop' — git warnings (e.g. CRLF) come on stderr and would abort the script.
# We check $LASTEXITCODE explicitly after critical git calls instead.
$ErrorActionPreference = 'Continue'

# ─── Helpers ─────────────────────────────────────────────────────────────────

function Write-Step([string]$msg) {
    Write-Host "  ✓ $msg" -ForegroundColor Green
}

function Write-DryRun([string]$action) {
    Write-Host "  [dry-run] Would: $action" -ForegroundColor Cyan
}

function Fail([string]$msg) {
    Write-Host ""
    Write-Host "  ✗ $msg" -ForegroundColor Red
    Write-Host ""
    exit 1
}

function BumpVersion([string]$version, [string]$bumpType) {
    $parts = $version -split '\.'
    if ($parts.Count -ne 3) { Fail "Cannot parse version '$version' — expected X.Y.Z" }
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]

    if ($bumpType -eq 'minor') {
        $minor++
        $patch = 0
    } else {
        $patch++
    }
    return "$major.$minor.$patch"
}

function ReadJsonVersion([string]$path) {
    if (-not (Test-Path $path)) { Fail "File not found: $path" }
    $content = Get-Content $path -Raw
    if ($content -match '"version"\s*:\s*"([^"]+)"') {
        return $Matches[1]
    }
    Fail "Could not find 'version' field in $path"
}

function UpdateJsonVersion([string]$path, [string]$oldVersion, [string]$newVersion) {
    if (-not (Test-Path $path)) { return }
    $content = Get-Content $path -Raw
    # Replace first occurrence of the version value
    $updated = $content -replace [regex]::Escape("""version"": ""$oldVersion"""), """version"": ""$newVersion"""
    if ($updated -eq $content) {
        Fail "Could not replace version '$oldVersion' in $path"
    }
    Set-Content $path -Value $updated -NoNewline -Encoding utf8
}

# ─── Banner ───────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  BardoEngine Ship Script" -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "  Mode: DRY-RUN (no files will be changed)" -ForegroundColor Cyan
} else {
    Write-Host "  Mode: LIVE — Bump: $Bump" -ForegroundColor Yellow
}
Write-Host ""

# ─── Resolve repo root ────────────────────────────────────────────────────────

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot   = Split-Path -Parent $scriptDir

Push-Location $repoRoot

try {

# ─── Step 1: Pre-flight — detect changed files ───────────────────────────────

Write-Host "  [1/11] Pre-flight: detecting changed files..." -ForegroundColor White

# Get all changed files (staged + unstaged + untracked that are staged)
$stagedFiles   = git diff --name-only --cached HEAD 2>$null
$unstagedFiles = git diff --name-only HEAD 2>$null
$allChangedRaw = ($stagedFiles + $unstagedFiles) | Sort-Object -Unique | Where-Object { $_ -ne '' }

if (-not $allChangedRaw) {
    # Also check staged new files (added)
    $allChangedRaw = git diff --name-only HEAD 2>$null
}

# Use git status --porcelain to catch staged + modified files.
# IGNORE untracked files (status "??") — user must `git add` them first to ship.
# Esto evita que basura del repo (docs sueltos, configs locales) entre al ship.
$statusLines = git status --porcelain 2>$null
$allChanged  = @()
foreach ($line in $statusLines) {
    if ($line.Length -lt 3) { continue }
    $statusCode = $line.Substring(0, 2)
    if ($statusCode -eq '??') { continue }   # skip untracked
    $file = $line.Substring(3).Trim()
    # Handle renamed files "old -> new"
    if ($file -match ' -> ') { $file = $file -split ' -> ' | Select-Object -Last 1 }
    $allChanged += $file
}
$allChanged = @($allChanged | Sort-Object -Unique | Where-Object { $_ -ne '' })

if ($allChanged.Count -eq 0) {
    Fail "Nada para shippear — el working tree está limpio."
}

# Classify files
$centinelasPatterns = @(
    '^centinelas\.ink$',
    '^src/stories/centinelas',
    '^src-tauri/resources/story-config\.json$',
    '^docs/centinelas/'
)

# Files that are version/changelog artifacts (excluded from classification trigger)
$artifactPatterns = @(
    '^package\.json$',
    '^package-lock\.json$',
    '^CHANGELOG\.md$',
    '^docs/centinelas/CHANGELOG\.md$',
    '^src-tauri/tauri\.conf\.json$',
    '^src/stories/centinelas\.config\.json$',
    '^src-tauri/resources/story-config\.json$'
)

$bumpEngine     = $false
$bumpCentinelas = $false
$engineFiles    = @()
$centinelasFiles = @()

foreach ($f in $allChanged) {
    # Skip pure artifact/version files for classification purposes
    $isArtifact = $false
    foreach ($pat in $artifactPatterns) {
        if ($f -match $pat) { $isArtifact = $true; break }
    }
    if ($isArtifact) { continue }

    $isCentinelas = $false
    foreach ($pat in $centinelasPatterns) {
        if ($f -match $pat) { $isCentinelas = $true; break }
    }

    if ($isCentinelas) {
        $centinelasFiles += $f
        $bumpCentinelas = $true
    } else {
        $engineFiles += $f
        $bumpEngine = $true
    }
}

if (-not $bumpEngine -and -not $bumpCentinelas) {
    Fail "Nada para shippear — sólo hay cambios en archivos de versión/changelog, sin contenido nuevo."
}

Write-Step "Archivos detectados: engine=$($engineFiles.Count) centinelas=$($centinelasFiles.Count)"
if ($engineFiles.Count -gt 0) {
    foreach ($f in $engineFiles) { Write-Host "      engine:     $f" -ForegroundColor DarkGray }
}
if ($centinelasFiles.Count -gt 0) {
    foreach ($f in $centinelasFiles) { Write-Host "      centinelas: $f" -ForegroundColor DarkGray }
}

# ─── Step 2: Validar rama ────────────────────────────────────────────────────

Write-Host "  [2/11] Validando rama..." -ForegroundColor White

$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($currentBranch -eq 'main' -or $currentBranch -eq 'dev') {
    Fail "Estás en '$currentBranch'. No se shippea desde main/dev — creá una feature branch."
}
Write-Step "Rama: $currentBranch"

# ─── Step 3: Validar tests ───────────────────────────────────────────────────

Write-Host "  [3/11] Validando tests..." -ForegroundColor White

if ($DryRun) {
    Write-DryRun "npm run test:run"
    Write-Host "         (tests skipped en dry-run)" -ForegroundColor DarkGray
} else {
    $testResult = & npm run test:run 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host $testResult
        Fail "Tests fallan — no se shippea broken code. Arreglá los tests y volvé a correr."
    }
    Write-Step "Tests: OK"
}

# ─── Step 4: Validar changelogs ──────────────────────────────────────────────

Write-Host "  [4/11] Validando changelogs..." -ForegroundColor White

# Get all files with any modification relative to HEAD (for changelog check)
$modifiedForChangelog = git diff --name-only HEAD 2>$null
# Also include staged new files
$stagedNew = git diff --name-only --cached 2>$null
$allModifiedFiles = ($modifiedForChangelog + $stagedNew + $allChanged) | Sort-Object -Unique

if ($bumpEngine) {
    $hasEngineChangelog = $allModifiedFiles | Where-Object { $_ -match '^CHANGELOG\.md$' }
    if (-not $hasEngineChangelog) {
        Fail "Engine cambió pero CHANGELOG.md no fue modificado.`n`n  Agregá el bullet antes de shippear:`n    1. Editá CHANGELOG.md (agregá entrada al tope)`n    2. Volvé a correr el script"
    }
    Write-Step "CHANGELOG.md: presente"
}

if ($bumpCentinelas) {
    $hasCentinelasChangelog = $allModifiedFiles | Where-Object { $_ -match '^docs/centinelas/CHANGELOG\.md$' }
    if (-not $hasCentinelasChangelog) {
        Fail "Centinelas cambió pero docs/centinelas/CHANGELOG.md no fue modificado.`n`n  Agregá el bullet antes de shippear:`n    1. Editá docs/centinelas/CHANGELOG.md (agregá entrada al tope)`n    2. Volvé a correr el script"
    }
    Write-Step "docs/centinelas/CHANGELOG.md: presente"
}

# ─── Step 5: Determinar versiones nuevas ─────────────────────────────────────

Write-Host "  [5/11] Calculando versiones nuevas..." -ForegroundColor White

$engineOldVersion      = ''
$engineNewVersion      = ''
$centinelasOldVersion  = ''
$centinelasNewVersion  = ''

if ($bumpEngine) {
    $engineOldVersion = ReadJsonVersion "$repoRoot\package.json"
    $engineNewVersion = BumpVersion $engineOldVersion $Bump
    Write-Step "Engine: $engineOldVersion → $engineNewVersion ($Bump)"
}

if ($bumpCentinelas) {
    $centinelasOldVersion = ReadJsonVersion "$repoRoot\src\stories\centinelas.config.json"
    $centinelasNewVersion = BumpVersion $centinelasOldVersion $Bump
    Write-Step "Centinelas: $centinelasOldVersion → $centinelasNewVersion ($Bump)"
}

# ─── Step 6: Bumpear versiones ───────────────────────────────────────────────

Write-Host "  [6/11] Bumpeando versiones..." -ForegroundColor White

$filesToStage = @()

# Always stage the user's changed files (content files)
$filesToStage += $allChanged

if ($bumpEngine) {
    if ($DryRun) {
        Write-DryRun "Update package.json: $engineOldVersion → $engineNewVersion"
        Write-DryRun "Update package-lock.json (if exists): $engineOldVersion → $engineNewVersion"
    } else {
        UpdateJsonVersion "$repoRoot\package.json" $engineOldVersion $engineNewVersion
        Write-Step "package.json bumped"

        $pkgLock = "$repoRoot\package-lock.json"
        if (Test-Path $pkgLock) {
            # package-lock.json has version in multiple places; update the top-level one
            $lockContent = Get-Content $pkgLock -Raw
            $lockUpdated = $lockContent -replace [regex]::Escape("""version"": ""$engineOldVersion"""), """version"": ""$engineNewVersion"""
            Set-Content $pkgLock -Value $lockUpdated -NoNewline -Encoding utf8
            Write-Step "package-lock.json bumped"
            $filesToStage += 'package-lock.json'
        }
        $filesToStage += 'package.json'
    }
}

if ($bumpCentinelas) {
    $tauriConf         = "$repoRoot\src-tauri\tauri.conf.json"
    $centinelasConfig  = "$repoRoot\src\stories\centinelas.config.json"

    if ($DryRun) {
        Write-DryRun "Update src-tauri/tauri.conf.json: $centinelasOldVersion → $centinelasNewVersion"
        Write-DryRun "Update src/stories/centinelas.config.json: $centinelasOldVersion → $centinelasNewVersion"
    } else {
        UpdateJsonVersion $tauriConf $centinelasOldVersion $centinelasNewVersion
        Write-Step "tauri.conf.json bumped"
        $filesToStage += 'src-tauri/tauri.conf.json'

        UpdateJsonVersion $centinelasConfig $centinelasOldVersion $centinelasNewVersion
        Write-Step "centinelas.config.json bumped"
        $filesToStage += 'src/stories/centinelas.config.json'
    }
}

# ─── Step 7: Stage ───────────────────────────────────────────────────────────

Write-Host "  [7/11] Stageando archivos..." -ForegroundColor White

# Add changelogs explicitly
if ($bumpEngine)     { $filesToStage += 'CHANGELOG.md' }
if ($bumpCentinelas) { $filesToStage += 'docs/centinelas/CHANGELOG.md' }

# Deduplicate
$filesToStage = $filesToStage | Sort-Object -Unique | Where-Object { $_ -ne '' }

if ($DryRun) {
    foreach ($f in $filesToStage) {
        Write-DryRun "git add `"$f`""
    }
} else {
    foreach ($f in $filesToStage) {
        $absPath = "$repoRoot\$($f -replace '/', '\')"
        if (Test-Path $absPath) {
            git add $f
        }
    }
    Write-Step "Staged $($filesToStage.Count) files"
}

# ─── Step 8: Commit ──────────────────────────────────────────────────────────

Write-Host "  [8/11] Commitando..." -ForegroundColor White

$commitMsg = ''
if ($bumpEngine -and $bumpCentinelas) {
    $commitMsg = "chore(release): engine v$engineNewVersion + centinelas v$centinelasNewVersion"
} elseif ($bumpEngine) {
    $commitMsg = "chore(release): v$engineNewVersion"
} else {
    $commitMsg = "chore(release): centinelas v$centinelasNewVersion"
}

if ($DryRun) {
    Write-DryRun "git commit -m `"$commitMsg`""
} else {
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        Fail "git commit falló. Revisá el estado del repo."
    }
    $releaseCommitHash = (git rev-parse --short HEAD).Trim()
    Write-Step "Commit: $releaseCommitHash — $commitMsg"
}

# ─── Step 9: Merge a dev ─────────────────────────────────────────────────────

Write-Host "  [9/11] Mergeando a dev..." -ForegroundColor White

if ($DryRun) {
    Write-DryRun "git checkout dev"
    Write-DryRun "git merge $currentBranch --no-ff -m `"Merge branch '$currentBranch' into dev`""
    Write-DryRun "git checkout $currentBranch"
} else {
    git checkout dev
    if ($LASTEXITCODE -ne 0) { Fail "No se pudo hacer checkout de dev." }

    git merge $currentBranch --no-ff -m "Merge branch '$currentBranch' into dev"
    if ($LASTEXITCODE -ne 0) {
        # Go back to feature branch before failing
        git checkout $currentBranch 2>$null
        Fail "Conflicto de merge al mergear '$currentBranch' en dev.`n  Resolvé el conflicto manualmente y mergeá con:`n    git checkout dev`n    git merge $currentBranch --no-ff"
    }
    $mergeCommitHash = (git rev-parse --short HEAD).Trim()
    Write-Step "Merged → dev ($mergeCommitHash)"
}

# ─── Step 10: Push ────────────────────────────────────────────────────────────

Write-Host "  [10/11] Pusheando origin dev..." -ForegroundColor White

if ($DryRun) {
    Write-DryRun "git push origin dev"
} else {
    git push origin dev
    if ($LASTEXITCODE -ne 0) {
        # Go back to feature branch
        git checkout $currentBranch 2>$null
        Fail "git push origin dev falló.`n  El commit y el merge YA están. Corré manualmente:`n    git push origin dev`n  Después:`n    git checkout $currentBranch"
    }
    Write-Step "Push: origin dev OK"
}

# ─── Step 11: Volver a la feature branch ─────────────────────────────────────

Write-Host "  [11/11] Volviendo a $currentBranch..." -ForegroundColor White

if ($DryRun) {
    Write-DryRun "git checkout $currentBranch"
} else {
    git checkout $currentBranch
    Write-Step "De vuelta en $currentBranch"
}

# ─── Reporte final ────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "  DRY-RUN completado — nada fue modificado." -ForegroundColor Cyan
} else {
    Write-Host "  Ship completado." -ForegroundColor Green
}
Write-Host ""
Write-Host "  Rama:       $currentBranch" -ForegroundColor White
if ($bumpEngine)     { Write-Host "  Engine:     $engineOldVersion → $engineNewVersion" -ForegroundColor White }
if ($bumpCentinelas) { Write-Host "  Centinelas: $centinelasOldVersion → $centinelasNewVersion" -ForegroundColor White }
if (-not $DryRun) {
    Write-Host "  Release:    $releaseCommitHash" -ForegroundColor White
    Write-Host "  Merge:      $mergeCommitHash" -ForegroundColor White
    Write-Host "  Push:       origin dev OK" -ForegroundColor White
}
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

} finally {
    Pop-Location
}
