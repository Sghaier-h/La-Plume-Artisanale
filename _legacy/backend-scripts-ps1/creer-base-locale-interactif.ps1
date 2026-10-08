# Script interactif pour creer la base de donnees locale

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CREATION BASE DE DONNEES LOCALE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Demander le mot de passe PostgreSQL
$securePassword = Read-Host "Entrez le mot de passe PostgreSQL (utilisateur postgres)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Definir la variable d'environnement
$env:DB_PASSWORD = $plainPassword

Write-Host ""
Write-Host "Creation de la base de donnees..." -ForegroundColor Blue
Write-Host ""

# Executer le script Node.js
node creer-base-locale-node.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Basculer vers la configuration locale..." -ForegroundColor Blue
    powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "SUCCES !" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous pouvez maintenant tester:" -ForegroundColor Yellow
    Write-Host "  node test-modules-odoo.js" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "ERREUR" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Verifiez:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL est demarre" -ForegroundColor White
    Write-Host "  2. Le mot de passe est correct" -ForegroundColor White
    Write-Host "  3. L'utilisateur postgres existe" -ForegroundColor White
    Write-Host ""
}
