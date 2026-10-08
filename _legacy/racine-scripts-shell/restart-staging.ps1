# ============================================================================
# SCRIPT DE REDÉMARRAGE STAGING
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REDÉMARRAGE SERVEURS STAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arrêter les processus existants
Write-Host "Arrêt des processus Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Processus arrêtés" -ForegroundColor Green

# Chemins absolus
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Vérifier que les dossiers existent
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Dossier backend non trouvé: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Dossier frontend non trouvé: $frontendPath" -ForegroundColor Red
    exit 1
}

# Démarrer backend
Write-Host ""
Write-Host "Démarrage backend (port 5000)..." -ForegroundColor Yellow
$backendScript = "cd '$backendPath'; `$env:NODE_ENV='staging'; Write-Host '========================================' -ForegroundColor Green; Write-Host '🚀 BACKEND STAGING - PORT 5000' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Green; Write-Host ''; Write-Host 'API: http://localhost:5000' -ForegroundColor Cyan; Write-Host 'Mode: STAGING (Mock Auth)' -ForegroundColor Yellow; Write-Host ''; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

# Attendre un peu
Start-Sleep -Seconds 5

# Démarrer frontend
Write-Host "Démarrage frontend (port 3000)..." -ForegroundColor Yellow
$frontendScript = "cd '$frontendPath'; `$env:NODE_ENV='staging'; Write-Host '========================================' -ForegroundColor Green; Write-Host '🚀 FRONTEND STAGING - PORT 3000' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Green; Write-Host ''; Write-Host 'Application: http://localhost:3000' -ForegroundColor Cyan; Write-Host 'Mode: STAGING' -ForegroundColor Yellow; Write-Host ''; npm start"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SERVEURS REDÉMARRÉS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "CONNEXION:" -ForegroundColor Yellow
Write-Host "   Email: admin@system.local" -ForegroundColor White
Write-Host "   Mot de passe: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Attendez 15-20 secondes que les serveurs démarrent" -ForegroundColor Yellow
Write-Host "   puis ouvrez http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
