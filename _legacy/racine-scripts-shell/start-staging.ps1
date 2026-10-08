# ============================================================================
# SCRIPT DE DÉMARRAGE ENVIRONNEMENT STAGING
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DÉMARRAGE ENVIRONNEMENT STAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les .env existent
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ backend/.env non trouvé" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: .\scripts\staging-setup.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "❌ frontend/.env non trouvé" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: .\scripts\staging-setup.ps1" -ForegroundColor Yellow
    exit 1
}

# Démarrer backend
Write-Host "Démarrage backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; Write-Host 'Backend Staging - Port 5000' -ForegroundColor Green; npm run dev" -WindowStyle Normal

# Attendre un peu
Start-Sleep -Seconds 3

# Démarrer frontend
Write-Host "Démarrage frontend (port 3000)..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; Write-Host 'Frontend Staging - Port 3000' -ForegroundColor Green; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ENVIRONNEMENT STAGING DÉMARRÉ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Les fenêtres PowerShell restent ouvertes pour voir les logs." -ForegroundColor Yellow
Write-Host "Fermez-les pour arrêter les serveurs." -ForegroundColor Yellow
Write-Host ""
