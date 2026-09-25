# ============================================================================
# SCRIPT DE DÉMARRAGE AUTOMATIQUE STAGING
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DÉMARRAGE AUTOMATIQUE STAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les .env existent
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ backend/.env non trouvé" -ForegroundColor Red
    Write-Host "   Création depuis env.staging.example..." -ForegroundColor Yellow
    if (Test-Path "backend\env.staging.example") {
        Copy-Item "backend\env.staging.example" "backend\.env" -Force
        Write-Host "✅ backend/.env créé" -ForegroundColor Green
    }
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "❌ frontend/.env non trouvé" -ForegroundColor Red
    Write-Host "   Création depuis env.staging.example..." -ForegroundColor Yellow
    if (Test-Path "frontend\env.staging.example") {
        Copy-Item "frontend\env.staging.example" "frontend\.env" -Force
        Write-Host "✅ frontend/.env créé" -ForegroundColor Green
    }
}

# Vérifier les dépendances
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installation dépendances backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install --silent
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installation dépendances frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install --silent
    Set-Location ..
}

# Arrêter les processus existants
Write-Host ""
Write-Host "Arrêt des processus Node.js existants..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Démarrer backend
Write-Host ""
Write-Host "Démarrage backend (port 5000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "..\backend"
$backendPath = Resolve-Path $backendPath
$backendScript = "cd '$backendPath'; `$env:NODE_ENV='staging'; Write-Host '🚀 Backend Staging - Port 5000' -ForegroundColor Green; Write-Host 'API: http://localhost:5000' -ForegroundColor Cyan; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

# Attendre que le backend démarre
Write-Host "Attente démarrage backend (5 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Démarrer frontend
Write-Host "Démarrage frontend (port 3000)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "..\frontend"
$frontendPath = Resolve-Path $frontendPath
$frontendScript = "cd '$frontendPath'; `$env:NODE_ENV='staging'; Write-Host '🚀 Frontend Staging - Port 3000' -ForegroundColor Green; Write-Host 'Application: http://localhost:3000' -ForegroundColor Cyan; npm start"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SERVEURS DÉMARRÉS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Les fenêtres PowerShell sont minimisées." -ForegroundColor Yellow
Write-Host "Ouvrez-les pour voir les logs." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour arrêter: .\scripts\stop-staging.ps1" -ForegroundColor Cyan
Write-Host ""
