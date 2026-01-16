# Script PowerShell pour exécuter les tests
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTS AUTOMATIQUES SYSTÈME GPAO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé !" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier tests
Set-Location $PSScriptRoot

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Exécuter les tests
Write-Host ""
Write-Host "Exécution des tests..." -ForegroundColor Yellow
Write-Host ""

node test-complet.js

# Afficher le rapport
if (Test-Path "../RAPPORT_TESTS.html") {
    Write-Host ""
    Write-Host "✅ Rapport généré: RAPPORT_TESTS.html" -ForegroundColor Green
    Write-Host ""
    Write-Host "Voulez-vous ouvrir le rapport ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "O" -or $response -eq "o") {
        Start-Process "../RAPPORT_TESTS.html"
    }
}
