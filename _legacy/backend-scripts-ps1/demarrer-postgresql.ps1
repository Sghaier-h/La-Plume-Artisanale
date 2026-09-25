# Script PowerShell pour demarrer PostgreSQL

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "DEMARRAGE DE POSTGRESQL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Chercher le service PostgreSQL
Write-Host "Recherche du service PostgreSQL..." -ForegroundColor Blue

$services = Get-Service | Where-Object { $_.Name -like "*postgres*" -or $_.Name -like "*PostgreSQL*" }

if ($services.Count -eq 0) {
    Write-Host "ERREUR: Aucun service PostgreSQL trouve" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "  1. Installer PostgreSQL"
    Write-Host "  2. Verifier les services: Get-Service | Where-Object { `$_.Name -like '*postgres*' }"
    Write-Host "  3. Demarrer manuellement depuis les Services Windows"
    exit 1
}

$service = $services[0]
Write-Host "Service trouve: $($service.Name)" -ForegroundColor Green
Write-Host "Etat actuel: $($service.Status)" -ForegroundColor Blue
Write-Host ""

if ($service.Status -eq "Running") {
    Write-Host "PostgreSQL est deja en cours d'execution !" -ForegroundColor Green
} else {
    Write-Host "Demarrage du service..." -ForegroundColor Blue
    try {
        Start-Service -Name $service.Name
        Start-Sleep -Seconds 3
        $service.Refresh()
        if ($service.Status -eq "Running") {
            Write-Host "PostgreSQL demarre avec succes !" -ForegroundColor Green
        } else {
            Write-Host "Echec du demarrage. Etat: $($service.Status)" -ForegroundColor Red
            Write-Host "Essayez en tant qu'administrateur:" -ForegroundColor Yellow
            Write-Host "  Start-Service -Name '$($service.Name)'" -ForegroundColor White
            exit 1
        }
    } catch {
        Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Essayez en tant qu'administrateur" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "INFORMATIONS DE CONNEXION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Host: localhost" -ForegroundColor White
Write-Host "Port: 5433" -ForegroundColor White
Write-Host "Database: ERP_La_Plume" -ForegroundColor White
Write-Host "User: Aviateur" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester la connexion:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  node verifier-tables-modules-odoo.js" -ForegroundColor White
Write-Host ""
