# Script pour démarrer le backend
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "DEMARRAGE DU BACKEND" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

Set-Location $backendPath

Write-Host "Chemin: $backendPath" -ForegroundColor Gray
Write-Host "URL: http://localhost:5000" -ForegroundColor Gray
Write-Host ""
Write-Host "Démarrage en cours..." -ForegroundColor Yellow
Write-Host ""

npm start
