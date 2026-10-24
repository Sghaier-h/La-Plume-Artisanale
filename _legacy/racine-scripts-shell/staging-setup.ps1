# ============================================================================
# SCRIPT DE CONFIGURATION STAGING
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION ENVIRONNEMENT STAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Vérifier PostgreSQL
Write-Host "Vérification PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    Write-Host "✅ PostgreSQL trouvé" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL non trouvé dans PATH" -ForegroundColor Yellow
    Write-Host "   Assurez-vous que PostgreSQL est installé" -ForegroundColor Yellow
}

# Créer base de données staging
Write-Host ""
Write-Host "Création base de données staging..." -ForegroundColor Yellow

$dbName = "fouta_erp_staging"
$dbUser = "postgres"
$dbPassword = Read-Host "Mot de passe PostgreSQL (laissez vide si pas de mot de passe)"

if ($dbPassword) {
    $env:PGPASSWORD = $dbPassword
}

# Créer la base si elle n'existe pas
$createDbQuery = "SELECT 1 FROM pg_database WHERE datname = '$dbName'"
$dbExists = psql -U $dbUser -d postgres -tAc $createDbQuery 2>&1

if ($dbExists -eq "1") {
    Write-Host "✅ Base de données $dbName existe déjà" -ForegroundColor Green
} else {
    Write-Host "Création de la base de données $dbName..." -ForegroundColor Yellow
    psql -U $dbUser -d postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données créée" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur création base de données" -ForegroundColor Red
        Write-Host "   Créez-la manuellement: CREATE DATABASE $dbName;" -ForegroundColor Yellow
    }
}

# Créer fichiers .env depuis exemples
Write-Host ""
Write-Host "Configuration fichiers .env..." -ForegroundColor Yellow

$backendEnvExample = "backend\env.staging.example"
$frontendEnvExample = "frontend\env.staging.example"

if (Test-Path $backendEnvExample) {
    Copy-Item $backendEnvExample "backend\.env" -Force
    Write-Host "✅ backend/.env créé depuis env.staging.example" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/env.staging.example non trouvé" -ForegroundColor Yellow
    Write-Host "   Création manuelle nécessaire" -ForegroundColor Yellow
}

if (Test-Path $frontendEnvExample) {
    Copy-Item $frontendEnvExample "frontend\.env" -Force
    Write-Host "✅ frontend/.env créé depuis env.staging.example" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend/env.staging.example non trouvé" -ForegroundColor Yellow
    Write-Host "   Création manuelle nécessaire" -ForegroundColor Yellow
}

# Créer dossiers nécessaires
Write-Host ""
Write-Host "Création dossiers..." -ForegroundColor Yellow

$folders = @(
    "backend/uploads/staging",
    "backend/logs",
    "frontend/build"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "✅ Dossier créé: $folder" -ForegroundColor Green
    }
}

# Installer dépendances
Write-Host ""
Write-Host "Installation dépendances..." -ForegroundColor Yellow

if (Test-Path "backend/package.json") {
    Write-Host "Installation dépendances backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install --silent
    Set-Location ..
    Write-Host "✅ Dépendances backend installées" -ForegroundColor Green
}

if (Test-Path "frontend/package.json") {
    Write-Host "Installation dépendances frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install --silent
    Set-Location ..
    Write-Host "✅ Dépendances frontend installées" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CONFIGURATION STAGING TERMINÉE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Appliquer les scripts SQL: .\scripts\apply-sql-staging.ps1" -ForegroundColor White
Write-Host "2. Démarrer le serveur: .\scripts\start-staging.ps1" -ForegroundColor White
Write-Host ""
