# Script PowerShell pour démarrer le frontend

Write-Host "🚀 Démarrage du frontend..." -ForegroundColor Cyan
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Erreur: Le dossier frontend n'existe pas !" -ForegroundColor Red
    Write-Host "   Chemin attendu: $frontendPath" -ForegroundColor Yellow
    exit 1
}

Set-Location $frontendPath

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances !" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🌐 Démarrage du serveur de développement React..." -ForegroundColor Cyan
Write-Host "   Le frontend sera accessible sur http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur React
npm start
