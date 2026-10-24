# Script pour executer le schema SQL directement sur le serveur via SSH

Write-Host "Execution du schema de pointage via SSH" -ForegroundColor Cyan
Write-Host ""

$vpsHost = "137.74.40.191"
$vpsUser = "ubuntu"
$dbHost = "sh131616-002.eu.clouddb.ovh.net"
$dbPort = "35392"
$dbName = "ERP_La_Plume"
$dbUser = "Aviateur"
$dbPassword = "Allbyfouta007"

# Lire le fichier SQL
$sqlFile = Join-Path $PSScriptRoot "database\schema_pointage.sql"
$sqlContent = Get-Content $sqlFile -Raw

# Creer un fichier temporaire sur le serveur
$tempFile = "/tmp/schema_pointage_$(Get-Date -Format 'yyyyMMddHHmmss').sql"

Write-Host "Envoi du fichier SQL au serveur..." -ForegroundColor Yellow
# Envoyer le fichier SQL au serveur
$sqlContent | ssh "${vpsUser}@${vpsHost}" "cat > $tempFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Fichier envoye avec succes" -ForegroundColor Green
    
    Write-Host "Execution du script SQL sur le serveur..." -ForegroundColor Yellow
    
    # Executer le script SQL via psql sur le serveur
    $psqlCommand = "PGPASSWORD='$dbPassword' psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $tempFile"
    
    ssh "${vpsUser}@${vpsHost}" $psqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Script SQL execute avec succes !" -ForegroundColor Green
        
        # Nettoyer le fichier temporaire
        ssh "${vpsUser}@${vpsHost}" "rm -f $tempFile"
        
        Write-Host ""
        Write-Host "Prochaines etapes :" -ForegroundColor Cyan
        Write-Host "   1. Redemarrer le serveur backend" -ForegroundColor White
        Write-Host "   2. Tester l'endpoint webhook" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Erreur lors de l'execution du script SQL" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Erreur lors de l'envoi du fichier au serveur" -ForegroundColor Red
    Write-Host "Verifiez que vous avez acces SSH au serveur" -ForegroundColor Yellow
    exit 1
}
