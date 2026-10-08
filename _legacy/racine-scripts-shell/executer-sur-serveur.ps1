# Script PowerShell pour executer le nettoyage sur le serveur

$SERVER = "ubuntu@137.74.40.191"
$PROJECT_DIR = "/opt/fouta-erp"

Write-Host "Envoi et execution du script sur le serveur..." -ForegroundColor Cyan
Write-Host ""

# Copier le script sur le serveur
Write-Host "Copie du script..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no scripts/nettoyer-et-organiser-serveur.sh "${SERVER}:/tmp/nettoyer-et-organiser.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la copie" -ForegroundColor Red
    exit 1
}

# Executer le script
Write-Host "Execution du script..." -ForegroundColor Yellow
$command = "cd $PROJECT_DIR; chmod +x /tmp/nettoyer-et-organiser.sh; bash /tmp/nettoyer-et-organiser.sh; rm /tmp/nettoyer-et-organiser.sh"
ssh -o StrictHostKeyChecking=no $SERVER $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Operation terminee avec succes !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Operation terminee avec des avertissements" -ForegroundColor Yellow
}
