# Script PowerShell pour demarrer le SAAS en local (Version Simple)

$ErrorActionPreference = "Stop"

$PROJECT_DIR = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$BACKEND_DIR = Join-Path $PROJECT_DIR "backend"
$FRONTEND_DIR = Join-Path $PROJECT_DIR "frontend"

Write-Host "Demarrage du SAAS en local..." -ForegroundColor Cyan
Write-Host ""

# 1. Verifier les repertoires
Write-Host "Verification des repertoires..." -ForegroundColor Yellow
if (-not (Test-Path $PROJECT_DIR)) {
    Write-Host "ERREUR: Repertoire projet introuvable: $PROJECT_DIR" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "ERREUR: Repertoire backend introuvable: $BACKEND_DIR" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "ERREUR: Repertoire frontend introuvable: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Repertoires trouves" -ForegroundColor Green
Write-Host ""

# 2. Verifier Node.js et npm
Write-Host "Verification de Node.js et npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "OK - Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "OK - npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Node.js ou npm n'est pas installe !" -ForegroundColor Red
    Write-Host "Installez Node.js depuis https://nodejs.org/" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# 3. Configurer le backend
Write-Host "Configuration du backend..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR

# Verifier que le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "ATTENTION: Le fichier .env n'existe pas dans le backend" -ForegroundColor Yellow
    Write-Host "Creer un fichier .env avec la configuration de la base de donnees" -ForegroundColor Gray
}

# Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances du backend..." -ForegroundColor Yellow
    npm install
}

# Verifier que nodemon est disponible pour npm run dev
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.dev -and $packageJson.scripts.dev -match "nodemon") {
    $nodemonInstalled = Test-Path "node_modules/nodemon"
    if (-not $nodemonInstalled) {
        Write-Host "Installation de nodemon..." -ForegroundColor Yellow
        npm install nodemon --save-dev
    }
}

Write-Host "OK - Backend configure" -ForegroundColor Green
Write-Host ""

# 4. Configurer le frontend
Write-Host "Configuration du frontend..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR

# Creer le fichier .env.local pour le developpement local
$envLocal = Join-Path $FRONTEND_DIR ".env.local"
if (-not (Test-Path $envLocal)) {
    Write-Host "Creation du fichier .env.local..." -ForegroundColor Yellow
    Set-Content -Path $envLocal -Value "REACT_APP_API_URL=http://localhost:5000/api"
    Write-Host "OK - Fichier .env.local cree" -ForegroundColor Green
}

# Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances du frontend..." -ForegroundColor Yellow
    npm install
}

Write-Host "OK - Frontend configure" -ForegroundColor Green
Write-Host ""

# 5. Demarrer le backend dans un nouveau terminal
Write-Host "Demarrage du backend..." -ForegroundColor Green
$backendScript = @"
Set-Location '$BACKEND_DIR'
Write-Host 'Backend demarre sur http://localhost:5000...' -ForegroundColor Green
npm run dev
"@

$backendScriptPath = Join-Path $env:TEMP "start-backend.ps1"
Set-Content -Path $backendScriptPath -Value $backendScript

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendScriptPath

Write-Host "OK - Terminal backend ouvert" -ForegroundColor Green
Write-Host ""

# Attendre que le backend demarre
Write-Host "Attente du demarrage du backend (5 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 6. Demarrer le frontend
Write-Host "Demarrage du frontend sur http://localhost:3000..." -ForegroundColor Green
Write-Host ""
Write-Host "URLs locales:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API: http://localhost:5000/api" -ForegroundColor White
Write-Host "  - Health Check: http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter le frontend" -ForegroundColor Yellow
Write-Host ""

# Demarrer le frontend
npm start
