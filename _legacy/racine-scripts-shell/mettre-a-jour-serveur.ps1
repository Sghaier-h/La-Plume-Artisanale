# Script PowerShell pour mettre a jour le serveur depuis GitHub
# Usage: .\scripts\mettre-a-jour-serveur.ps1

$SERVEUR_SSH = "ubuntu@137.74.40.191"
$SERVEUR_DIR = "/opt/fouta-erp"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MISE A JOUR DU SERVEUR" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Mise a jour du serveur depuis GitHub..." -ForegroundColor Yellow
Write-Host ""

# Commande pour mettre a jour le serveur
$updateCmd = "cd $SERVEUR_DIR; git fetch origin; git pull origin main; echo 'Mise a jour terminee'"

Write-Host "Execution de la commande sur le serveur..." -ForegroundColor Gray
Write-Host "   ssh $SERVEUR_SSH '$updateCmd'" -ForegroundColor Gray
Write-Host ""

ssh $SERVEUR_SSH $updateCmd

Write-Host ""
Write-Host "Verification de la mise a jour..." -ForegroundColor Yellow

$verifyCmd = "cd $SERVEUR_DIR; git rev-parse HEAD"
$serverCommit = ssh $SERVEUR_SSH $verifyCmd

if ($serverCommit) {
    $serverCommit = $serverCommit.Trim()
    Write-Host "   Commit serveur apres mise a jour: $($serverCommit.Substring(0,7))" -ForegroundColor Gray
}

Write-Host ""
Write-Host "OK: Mise a jour terminee" -ForegroundColor Green
Write-Host ""
