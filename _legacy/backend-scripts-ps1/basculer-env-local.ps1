# Script pour basculer vers la configuration locale

Write-Host "Basculement vers la configuration locale..." -ForegroundColor Blue

if (Test-Path ".env.local") {
    Copy-Item ".env.local" ".env" -Force
    Write-Host "Configuration locale activee" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration:" -ForegroundColor Yellow
    Get-Content ".env" | Select-String -Pattern "DB_|DATABASE_URL" | ForEach-Object {
        if ($_ -match "PASSWORD") {
            Write-Host "  $_" -ForegroundColor Gray
        } else {
            Write-Host "  $_" -ForegroundColor White
        }
    }
} else {
    Write-Host "ERREUR: Fichier .env.local non trouve" -ForegroundColor Red
    Write-Host "Executez d'abord: configurer-base-locale.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Vous pouvez maintenant tester:" -ForegroundColor Yellow
Write-Host "  node test-modules-odoo.js" -ForegroundColor White
