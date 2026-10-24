# ============================================================================
# INSTALLATION CAPACITOR - APPLICATIONS NATIVES TABLETTES
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION CAPACITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installe" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier frontend
Set-Location "frontend"

Write-Host "Installation des dependances Capacitor..." -ForegroundColor Yellow

# Installer Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/camera @capacitor/push-notifications @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen

Write-Host "✅ Dependances installees" -ForegroundColor Green
Write-Host ""

# Initialiser Capacitor
Write-Host "Initialisation Capacitor..." -ForegroundColor Yellow
npx cap init "ERP La Plume Artisanale" "com.laplumeartisanale.erp" --web-dir build

Write-Host "✅ Capacitor initialise" -ForegroundColor Green
Write-Host ""

# Ajouter plateformes
Write-Host "Ajout plateformes Android/iOS..." -ForegroundColor Yellow
npx cap add android
npx cap add ios

Write-Host "✅ Plateformes ajoutees" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "Build frontend..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Build termine" -ForegroundColor Green
Write-Host ""

# Synchroniser Capacitor
Write-Host "Synchronisation Capacitor..." -ForegroundColor Yellow
npx cap sync

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "INSTALLATION TERMINEE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Ouvrir Android Studio:" -ForegroundColor White
Write-Host "     npx cap open android" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Ouvrir Xcode (Mac):" -ForegroundColor White
Write-Host "     npx cap open ios" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Build APK/IPA depuis les IDEs" -ForegroundColor White
Write-Host ""

Set-Location ..
