# Script pour tester la connexion maintenant que le tunnel SSH est actif

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST DE CONNEXION A LA BASE DE DONNEES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Attendre un peu pour que le tunnel soit pret
Write-Host "Attente de 5 secondes pour que le tunnel SSH soit pret..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verifier le port
Write-Host "1. Verification du port 5433..." -ForegroundColor Blue
$portTest = Test-NetConnection -ComputerName localhost -Port 5433 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "   Port 5433: OUVERT" -ForegroundColor Green
} else {
    Write-Host "   Port 5433: FERME" -ForegroundColor Red
    Write-Host "   Le tunnel SSH peut prendre quelques secondes de plus" -ForegroundColor Yellow
    Write-Host "   Attente supplementaire (10 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    $portTest = Test-NetConnection -ComputerName localhost -Port 5433 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($portTest) {
        Write-Host "   Port 5433: OUVERT (apres attente)" -ForegroundColor Green
    } else {
        Write-Host "   Port 5433: TOUJOURS FERME" -ForegroundColor Red
        Write-Host "   Verifiez que le tunnel SSH est actif dans l'autre terminal" -ForegroundColor Yellow
        exit 1
    }
}

# Tester la connexion
Write-Host ""
Write-Host "2. Test de connexion a la base de donnees..." -ForegroundColor Blue
cd backend
node test-connexion-simple.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "SUCCES ! Connexion a la base de donnees reussie" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
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
    Write-Host "  1. Le tunnel SSH est actif (terminal ouvert)" -ForegroundColor White
    Write-Host "  2. Les identifiants dans .env sont corrects" -ForegroundColor White
    Write-Host "  3. La base de donnees existe sur le serveur OVH" -ForegroundColor White
}
