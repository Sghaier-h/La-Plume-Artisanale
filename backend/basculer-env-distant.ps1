# Script pour basculer vers la configuration distante (OVH)

Write-Host "Basculement vers la configuration distante (OVH)..." -ForegroundColor Blue

if (Test-Path ".env.distant") {
    Copy-Item ".env.distant" ".env" -Force
    Write-Host "Configuration distante activee" -ForegroundColor Green
    Write-Host ""
    Write-Host "N'oubliez pas de creer le tunnel SSH:" -ForegroundColor Yellow
    Write-Host "  ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -ForegroundColor White
} else {
    # Creer le fichier .env.distant depuis .env actuel
    if (Test-Path ".env") {
        Copy-Item ".env" ".env.distant" -Force
        Write-Host "Fichier .env.distant cree depuis .env actuel" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: Aucun fichier .env trouve" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Get-Content ".env" | Select-String -Pattern "DB_|DATABASE_URL" | ForEach-Object {
    if ($_ -match "PASSWORD") {
        Write-Host "  $_" -ForegroundColor Gray
    } else {
        Write-Host "  $_" -ForegroundColor White
    }
}
