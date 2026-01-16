# Script de démarrage rapide pour le développement local
# Utilisation: .\start-dev.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Démarrage de l'application ERP en mode développement..." -ForegroundColor Green
Write-Host ""

$projectRoot = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# Vérifier que les dossiers existent
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Erreur: Dossier backend introuvable: $backendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Erreur: Dossier frontend introuvable: $frontendDir" -ForegroundColor Red
    exit 1
}

# Vérifier que Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur: Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que npm est installé
try {
    $npmVersion = npm --version
    Write-Host "✅ npm détecté: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur: npm n'est pas installé" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow

# Vérifier les dépendances backend
$backendNodeModules = Join-Path $backendDir "node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Host "⚠️  Dépendances backend manquantes. Installation..." -ForegroundColor Yellow
    Set-Location $backendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances backend" -ForegroundColor Red
        exit 1
    }
}

# Vérifier les dépendances frontend
$frontendNodeModules = Join-Path $frontendDir "node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "⚠️  Dépendances frontend manquantes. Installation..." -ForegroundColor Yellow
    Set-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances frontend" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dépendances vérifiées" -ForegroundColor Green
Write-Host ""

# Vérifier les fichiers .env
$backendEnv = Join-Path $backendDir ".env"
if (-not (Test-Path $backendEnv)) {
    Write-Host "⚠️  Fichier .env backend manquant. Création d'un exemple..." -ForegroundColor Yellow
    @"
# Base de données PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Serveur local
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=7d

# API
API_URL=http://localhost:5000
API_VERSION=v1
"@ | Out-File -FilePath $backendEnv -Encoding UTF8
    Write-Host "✅ Fichier .env backend créé. Veuillez le modifier si nécessaire." -ForegroundColor Yellow
}

$frontendEnv = Join-Path $frontendDir ".env"
if (-not (Test-Path $frontendEnv)) {
    Write-Host "⚠️  Fichier .env frontend manquant. Création..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
"@ | Out-File -FilePath $frontendEnv -Encoding UTF8
    Write-Host "✅ Fichier .env frontend créé." -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Démarrage du backend..." -ForegroundColor Green

# Démarrer le backend dans un nouveau terminal
$backendScript = @"
cd '$backendDir'
Write-Host '🔧 Backend - Port 5000' -ForegroundColor Cyan
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Attendre que le backend démarre
Write-Host "⏳ Attente du démarrage du backend (5 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎨 Démarrage du frontend..." -ForegroundColor Green

# Démarrer le frontend dans un nouveau terminal
$frontendScript = @"
cd '$frontendDir'
Write-Host '🎨 Frontend - Port 3000' -ForegroundColor Cyan
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "✅ Application démarrée !" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Les deux terminaux sont ouverts. Fermez-les pour arrêter l'application." -ForegroundColor Yellow
Write-Host ""


