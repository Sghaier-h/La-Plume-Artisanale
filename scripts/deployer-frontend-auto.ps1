# Script PowerShell pour deployer automatiquement le frontend

$SERVER = "ubuntu@137.74.40.191"
$PROJECT_DIR = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$FRONTEND_DIR = Join-Path $PROJECT_DIR "frontend"
$BUILD_DIR = Join-Path $FRONTEND_DIR "build"
$REMOTE_FRONTEND_DIR = "/opt/fouta-erp/frontend"

Write-Host "Deploiement automatique du frontend..." -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que le dossier frontend existe
if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "Erreur: Le dossier frontend n'existe pas: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

# 2. Creer le fichier .env.production si necessaire
$envProduction = Join-Path $FRONTEND_DIR ".env.production"
if (-not (Test-Path $envProduction)) {
    Write-Host "Creation du fichier .env.production..." -ForegroundColor Yellow
    Set-Content -Path $envProduction -Value "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api"
    Write-Host "Fichier .env.production cree" -ForegroundColor Green
}

# 3. Build du frontend
Write-Host "Build du frontend (cela peut prendre 2-5 minutes)..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR

# Verifier si npm est installe
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Gray
} catch {
    Write-Host "Erreur: npm n'est pas installe !" -ForegroundColor Red
    exit 1
}

# Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances..." -ForegroundColor Yellow
    npm install
}

# Build
Write-Host "Build en cours..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build !" -ForegroundColor Red
    exit 1
}

Write-Host "Build termine avec succes !" -ForegroundColor Green
Write-Host ""

# 4. Verifier que le dossier build existe
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "Erreur: Le dossier build n'existe pas !" -ForegroundColor Red
    exit 1
}

# 5. Transférer les fichiers sur le serveur
Write-Host "Transfert des fichiers sur le serveur..." -ForegroundColor Yellow
$buildFiles = Join-Path $BUILD_DIR "*"

Write-Host "Copie de $buildFiles vers ${SERVER}:$REMOTE_FRONTEND_DIR/" -ForegroundColor Gray

scp -r $buildFiles "${SERVER}:$REMOTE_FRONTEND_DIR/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du transfert !" -ForegroundColor Red
    exit 1
}

Write-Host "Transfert termine avec succes !" -ForegroundColor Green
Write-Host ""

# 6. Corriger les permissions et recharger Nginx
Write-Host "Correction des permissions sur le serveur..." -ForegroundColor Yellow
$fixPermissionsCmd = "cd /opt/fouta-erp; sudo chown -R www-data:www-data $REMOTE_FRONTEND_DIR; sudo chmod -R 755 $REMOTE_FRONTEND_DIR; sudo systemctl reload nginx"
ssh $SERVER $fixPermissionsCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Permissions corrigees et Nginx recharge" -ForegroundColor Green
} else {
    Write-Host "Avertissement: erreur lors de la correction des permissions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Deploiement termine avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "Testez maintenant: https://fabrication.laplume-artisanale.tn" -ForegroundColor Cyan
