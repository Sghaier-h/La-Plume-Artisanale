# Script simplifie pour creer la base de donnees locale

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CREATION BASE DE DONNEES LOCALE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier PostgreSQL
Write-Host "1. Verification de PostgreSQL..." -ForegroundColor Blue
$pgService = Get-Service | Where-Object { $_.Name -like "*postgres*" } | Select-Object -First 1
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "   PostgreSQL: DEMARRE" -ForegroundColor Green
} else {
    Write-Host "   PostgreSQL: ARRETE" -ForegroundColor Red
    Write-Host "   Demarrage de PostgreSQL..." -ForegroundColor Yellow
    if ($pgService) {
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 3
        Write-Host "   PostgreSQL: DEMARRE" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: Service PostgreSQL non trouve" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "2. Demande du mot de passe PostgreSQL..." -ForegroundColor Blue
Write-Host "   (Appuyez sur Entree si pas de mot de passe)" -ForegroundColor Gray
$password = Read-Host "   Mot de passe postgres"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "   Utilisation sans mot de passe (trust authentication)" -ForegroundColor Yellow
    $env:DB_PASSWORD = ""
} else {
    $env:DB_PASSWORD = $password
}

Write-Host ""
Write-Host "3. Creation de la base de donnees..." -ForegroundColor Blue
Write-Host ""

# Executer le script Node.js
node creer-base-locale-node.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "4. Basculer vers la configuration locale..." -ForegroundColor Blue
    powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "SUCCES ! Base de donnees locale creee" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Tester la connexion: node test-connexion-simple.js" -ForegroundColor White
    Write-Host "  2. Verifier les tables: node verifier-tables-modules-odoo.js" -ForegroundColor White
    Write-Host "  3. Tester les modules: node test-modules-odoo.js" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "ERREUR LORS DE LA CREATION" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Solutions possibles:" -ForegroundColor Yellow
    Write-Host "  1. Verifiez que PostgreSQL est demarre" -ForegroundColor White
    Write-Host "  2. Verifiez le mot de passe PostgreSQL" -ForegroundColor White
    Write-Host "  3. Essayez avec psql manuellement:" -ForegroundColor White
    Write-Host "     psql -h localhost -p 5432 -U postgres" -ForegroundColor Gray
    Write-Host "     CREATE DATABASE ""ERP_La_Plume_Local"";" -ForegroundColor Gray
    Write-Host "  4. Verifiez les permissions de l'utilisateur postgres" -ForegroundColor White
    Write-Host ""
}
