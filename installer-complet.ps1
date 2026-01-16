# ============================================================================
# SCRIPT D'INSTALLATION COMPLÈTE - ERP LA PLUME ARTISANALE
# ============================================================================
# Ce script installe toutes les dépendances et configure l'application
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION COMPLETE ERP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
Write-Host "Verification Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js $nodeVersion installe" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js non installe. Veuillez installer Node.js 18+" -ForegroundColor Red
    exit 1
}

# Vérifier npm
Write-Host "Verification npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✅ npm $npmVersion installe" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm non installe" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Installation backend
Set-Location "La-Plume-Artisanale\backend"

Write-Host "Installation des dependances backend..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Erreur lors de l'installation backend" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Dependances backend installees" -ForegroundColor Green

# Installation dépendances spécifiques
Write-Host "Installation exceljs..." -ForegroundColor Yellow
npm install exceljs

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Installation frontend
Set-Location "..\frontend"

Write-Host "Installation des dependances frontend..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Erreur lors de l'installation frontend" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Dependances frontend installees" -ForegroundColor Green

Set-Location "..\.."

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "INSTALLATION TERMINEE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "  1. Configurer le fichier .env dans backend/" -ForegroundColor White
Write-Host "  2. Executer les scripts SQL dans database/" -ForegroundColor White
Write-Host "  3. Demarrer le backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  4. Demarrer le frontend: cd frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - INSTALLATION_MODULES_COMPLETS.md" -ForegroundColor White
Write-Host "  - SYSTEME_COMPLET_CREE.md" -ForegroundColor White
Write-Host ""
