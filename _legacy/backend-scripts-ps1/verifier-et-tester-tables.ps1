# Script pour verifier le tunnel et tester les tables

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION DU TUNNEL ET TEST DES TABLES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si le tunnel existe
Write-Host "1. Verification du tunnel SSH..." -ForegroundColor Blue
$tunnelProcess = Get-Process | Where-Object { 
    $_.ProcessName -eq "ssh" 
} -ErrorAction SilentlyContinue

if ($tunnelProcess) {
    Write-Host "   Processus SSH trouve: $($tunnelProcess.Count) processus" -ForegroundColor Green
} else {
    Write-Host "   Aucun tunnel SSH trouve" -ForegroundColor Yellow
    Write-Host "   Creation du tunnel..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -WindowStyle Minimized
    Write-Host "   Attente 15 secondes pour la connexion..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Verifier le port
Write-Host ""
Write-Host "2. Verification du port 5433..." -ForegroundColor Blue
$portTest = Test-NetConnection -ComputerName localhost -Port 5433 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "   Port 5433: OUVERT" -ForegroundColor Green
} else {
    Write-Host "   Port 5433: FERME" -ForegroundColor Red
    Write-Host "   Le tunnel SSH peut prendre du temps a se connecter" -ForegroundColor Yellow
    Write-Host "   Attente supplementaire (20 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
    $portTest = Test-NetConnection -ComputerName localhost -Port 5433 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($portTest) {
        Write-Host "   Port 5433: OUVERT (apres attente)" -ForegroundColor Green
    } else {
        Write-Host "   Port 5433: TOUJOURS FERME" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Solutions:" -ForegroundColor Yellow
        Write-Host "   1. Verifier manuellement: Test-NetConnection localhost -Port 5433" -ForegroundColor White
        Write-Host "   2. Creer le tunnel manuellement dans un terminal SSH" -ForegroundColor White
        Write-Host "   3. Verifier que vous avez acces SSH au serveur" -ForegroundColor White
        exit 1
    }
}

# Tester la connexion
Write-Host ""
Write-Host "3. Test de connexion a la base de donnees..." -ForegroundColor Blue
cd backend
node verifier-tables-modules-odoo.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "SUCCES ! Toutes les tables sont verifiees" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "ERREUR" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Le tunnel SSH peut ne pas etre pret. Attendez 30 secondes et reessayez." -ForegroundColor Yellow
}
