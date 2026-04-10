# Script pour démarrer le backend
# Usage: powershell -ExecutionPolicy Bypass -File DEMARRER_BACKEND.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Démarrage du backend ERP La Plume Artisanale..." -ForegroundColor Cyan

# Aller dans le répertoire backend
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Le répertoire backend n'existe pas !" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

# Vérifier si le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Le fichier .env n'existe pas. Création d'un fichier .env par défaut..." -ForegroundColor Yellow
    @"
# Configuration de la base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=la_plume_artisanale
DB_USER=postgres
DB_PASSWORD=

# Configuration JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Configuration du serveur
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Démarrer le serveur
Write-Host "✅ Démarrage du serveur sur http://localhost:5000..." -ForegroundColor Green
Write-Host "📝 Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

npm start
