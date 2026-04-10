# Script pour tester la connexion SSH de base

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST DE CONNEXION SSH" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test de connexion SSH au serveur..." -ForegroundColor Blue
Write-Host "Serveur: ubuntu@137.74.40.191" -ForegroundColor White
Write-Host ""
Write-Host "Si demande un mot de passe, entrez-le." -ForegroundColor Yellow
Write-Host "Si demande 'Are you sure you want to continue connecting (yes/no)?', tapez: yes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour annuler" -ForegroundColor Yellow
Write-Host ""

# Tester la connexion
ssh ubuntu@137.74.40.191

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
if ($LASTEXITCODE -eq 0) {
    Write-Host "CONNEXION SSH REUSSIE !" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous pouvez maintenant creer le tunnel:" -ForegroundColor Yellow
    Write-Host "  ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -ForegroundColor White
} else {
    Write-Host "CONNEXION SSH ECHOUE" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "  1. Verifier le mot de passe" -ForegroundColor White
    Write-Host "  2. Verifier que votre IP est autorisee" -ForegroundColor White
    Write-Host "  3. Contacter l'administrateur du serveur" -ForegroundColor White
}
