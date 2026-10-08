# ============================================================================
# SCRIPT D'ARRÊT ENVIRONNEMENT STAGING
# ============================================================================

Write-Host ""
Write-Host "Arrêt des processus Node.js..." -ForegroundColor Yellow

# Arrêter les processus Node.js
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✅ Processus arrêtés" -ForegroundColor Green
Write-Host ""
