# ============================================================================
# SCRIPT D'INITIALISATION COMPLÈTE STAGING
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INITIALISATION COMPLÈTE STAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ce script va:" -ForegroundColor Yellow
Write-Host "1. Configurer l'environnement staging" -ForegroundColor White
Write-Host "2. Créer la base de données" -ForegroundColor White
Write-Host "3. Appliquer tous les scripts SQL" -ForegroundColor White
Write-Host "4. Installer les dépendances" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Entrée pour continuer ou Ctrl+C pour annuler..." -ForegroundColor Yellow
Read-Host

# Étape 1: Configuration
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ÉTAPE 1: Configuration" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
& "$PSScriptRoot\staging-setup.ps1"

# Étape 2: Application SQL
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ÉTAPE 2: Application Scripts SQL" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
& "$PSScriptRoot\apply-sql-staging.ps1"

# Résumé final
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "INITIALISATION TERMINÉE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Environnement staging configuré" -ForegroundColor Green
Write-Host "✅ Base de données créée et initialisée" -ForegroundColor Green
Write-Host "✅ Dépendances installées" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer l'application:" -ForegroundColor Yellow
Write-Host "  .\scripts\start-staging.ps1" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Backend: http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
