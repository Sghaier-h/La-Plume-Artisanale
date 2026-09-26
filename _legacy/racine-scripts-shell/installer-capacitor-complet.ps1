# ============================================================================
# INSTALLATION COMPLETE CAPACITOR - APPLICATIONS NATIVES TABLETTES
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION CAPACITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installe. Veuillez l'installer d'abord." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js trouve: $(node --version)" -ForegroundColor Green
Write-Host ""

# Aller dans le dossier frontend
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Dossier frontend non trouve: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath
Write-Host "Repertoire: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Vérifier package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json non trouve" -ForegroundColor Red
    exit 1
}

# Installation des dépendances Capacitor
Write-Host "Installation des dependances Capacitor..." -ForegroundColor Yellow
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/camera @capacitor/push-notifications @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen --save

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dependances" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependances installees" -ForegroundColor Green
Write-Host ""

# Vérifier si Capacitor est déjà initialisé
if (Test-Path "capacitor.config.ts") {
    Write-Host "✅ Capacitor deja configure" -ForegroundColor Green
} else {
    Write-Host "Initialisation Capacitor..." -ForegroundColor Yellow
    
    # Créer le fichier capacitor.config.ts si nécessaire
    if (-not (Test-Path "capacitor.config.ts")) {
        Write-Host "Creation du fichier capacitor.config.ts..." -ForegroundColor Yellow
    }
    
    # Initialiser Capacitor
    npx cap init "ERP La Plume Artisanale" "com.laplumeartisanale.erp" --web-dir build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Capacitor deja initialise ou erreur" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Capacitor initialise" -ForegroundColor Green
    }
}

Write-Host ""

# Ajouter plateformes Android et iOS
if (-not (Test-Path "android")) {
    Write-Host "Ajout plateforme Android..." -ForegroundColor Yellow
    npx cap add android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Plateforme Android ajoutee" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur ou Android deja ajoute" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Plateforme Android deja presente" -ForegroundColor Green
}

if (-not (Test-Path "ios")) {
    Write-Host "Ajout plateforme iOS..." -ForegroundColor Yellow
    npx cap add ios
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Plateforme iOS ajoutee" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur ou iOS deja ajoute (necessite Mac)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Plateforme iOS deja presente" -ForegroundColor Green
}

Write-Host ""

# Build frontend
Write-Host "Build frontend React..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    Write-Host "Continuons quand meme..." -ForegroundColor Yellow
} else {
    Write-Host "✅ Build termine" -ForegroundColor Green
}

Write-Host ""

# Synchroniser Capacitor
Write-Host "Synchronisation Capacitor..." -ForegroundColor Yellow
npx cap sync

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erreur lors de la synchronisation" -ForegroundColor Yellow
} else {
    Write-Host "✅ Synchronisation terminee" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "INSTALLATION TERMINEE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ouvrir Android Studio:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Yellow
Write-Host "   npx cap open android" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Build APK dans Android Studio:" -ForegroundColor White
Write-Host "   Build > Generate Signed Bundle / APK" -ForegroundColor Yellow
Write-Host ""
if ($IsMacOS -or $IsLinux) {
    Write-Host "3. Ouvrir Xcode (Mac):" -ForegroundColor White
    Write-Host "   cd frontend" -ForegroundColor Yellow
    Write-Host "   npx cap open ios" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Build IPA dans Xcode:" -ForegroundColor White
    Write-Host "   Product > Archive" -ForegroundColor Yellow
    Write-Host ""
}
Write-Host "5. Distribuer les APK/IPA aux tablettes" -ForegroundColor White
Write-Host ""
Set-Location ..
