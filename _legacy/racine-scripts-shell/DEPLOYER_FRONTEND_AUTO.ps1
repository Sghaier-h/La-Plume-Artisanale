# Script PowerShell pour deployer automatiquement le frontend et corriger le 403

$SERVER = "ubuntu@137.74.40.191"
$FRONTEND_DIR = "frontend"
$REMOTE_FRONTEND = "/opt/fouta-erp/frontend"

Write-Host "Deploiement automatique du frontend..." -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que le dossier frontend existe
if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "Erreur: Le dossier frontend n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Verification du dossier frontend..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR

# 2. Creer .env.production si necessaire
if (-not (Test-Path ".env.production")) {
    Write-Host "Creation de .env.production..." -ForegroundColor Yellow
    "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" | Out-File -FilePath ".env.production" -Encoding UTF8
}

# 3. Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dependances" -ForegroundColor Red
        exit 1
    }
}

# 4. Build du frontend
Write-Host "Build du frontend en cours..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "build\index.html")) {
    Write-Host "Erreur: Le build n'a pas cree index.html" -ForegroundColor Red
    exit 1
}

Write-Host "Build termine avec succes" -ForegroundColor Green
Write-Host ""

# 5. Transferer les fichiers sur le serveur
Write-Host "Transfert des fichiers sur le serveur..." -ForegroundColor Yellow

# Creer le dossier sur le serveur si necessaire
ssh $SERVER "sudo mkdir -p $REMOTE_FRONTEND"

# Transférer les fichiers
scp -r build/* ${SERVER}:/tmp/frontend_build/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du transfert" -ForegroundColor Red
    exit 1
}

Write-Host "Fichiers transferes" -ForegroundColor Green
Write-Host ""

# 6. Deplacer et corriger les permissions sur le serveur
Write-Host "Configuration des permissions sur le serveur..." -ForegroundColor Yellow

$commands = "sudo rm -rf $REMOTE_FRONTEND/*; sudo mv /tmp/frontend_build/* $REMOTE_FRONTEND/; sudo chown -R www-data:www-data $REMOTE_FRONTEND; sudo chmod -R 755 $REMOTE_FRONTEND; sudo systemctl restart nginx"

ssh $SERVER $commands

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploiement termine avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testez maintenant : https://fabrication.laplume-artisanale.tn" -ForegroundColor Cyan
} else {
    Write-Host "Erreur lors de la configuration sur le serveur" -ForegroundColor Red
    exit 1
}

Set-Location ".."
