# Script pour creer le tunnel SSH et tester la connexion

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CREATION DU TUNNEL SSH ET TEST DE CONNEXION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si le tunnel existe deja
Write-Host "Verification du tunnel SSH existant..." -ForegroundColor Blue
$tunnelProcess = Get-Process | Where-Object { 
    $_.ProcessName -eq "ssh" -and 
    $_.CommandLine -like "*5433*sh131616*" 
} -ErrorAction SilentlyContinue

if ($tunnelProcess) {
    Write-Host "Tunnel SSH deja actif (PID: $($tunnelProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "Creation du tunnel SSH..." -ForegroundColor Blue
    Write-Host "  Port local: 5433" -ForegroundColor White
    Write-Host "  Serveur distant: sh131616-002.eu.clouddb.ovh.net:35392" -ForegroundColor White
    Write-Host "  Serveur SSH: ubuntu@137.74.40.191" -ForegroundColor White
    Write-Host ""
    
    # Demarrer le tunnel en arriere-plan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -WindowStyle Minimized
    
    Write-Host "Attente de la connexion (5 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Verifier que le port est ouvert
    $portTest = Test-NetConnection -ComputerName localhost -Port 5433 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($portTest) {
        Write-Host "Tunnel SSH cree avec succes !" -ForegroundColor Green
    } else {
        Write-Host "ATTENTION: Le tunnel peut prendre quelques secondes a se connecter" -ForegroundColor Yellow
        Write-Host "Attente supplementaire (10 secondes)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

Write-Host ""
Write-Host "Test de connexion a la base de donnees..." -ForegroundColor Blue
Write-Host ""

# Tester la connexion
cd backend
node test-connexion-simple.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "SUCCES !" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous pouvez maintenant:" -ForegroundColor Yellow
    Write-Host "  1. Verifier les tables: node verifier-tables-modules-odoo.js" -ForegroundColor White
    Write-Host "  2. Tester les modules: node test-modules-odoo.js" -ForegroundColor White
    Write-Host "  3. Demarrer le serveur: npm start" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "ERREUR DE CONNEXION" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Verifiez:" -ForegroundColor Yellow
    Write-Host "  1. Le tunnel SSH est actif" -ForegroundColor White
    Write-Host "  2. Les identifiants dans .env sont corrects" -ForegroundColor White
    Write-Host "  3. La base de donnees existe sur le serveur OVH" -ForegroundColor White
}
