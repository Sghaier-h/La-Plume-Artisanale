# Script pour configurer une base de donnees locale pour les tests

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION BASE DE DONNEES LOCALE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier PostgreSQL
Write-Host "1. Verification de PostgreSQL..." -ForegroundColor Blue
$pgService = Get-Service | Where-Object { $_.Name -like "*postgres*" } | Select-Object -First 1
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "   PostgreSQL: DEMARRE" -ForegroundColor Green
} else {
    Write-Host "   PostgreSQL: ARRETE" -ForegroundColor Red
    Write-Host "   Demarrage de PostgreSQL..." -ForegroundColor Yellow
    if ($pgService) {
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 3
        Write-Host "   PostgreSQL: DEMARRE" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: Service PostgreSQL non trouve" -ForegroundColor Red
        exit 1
    }
}

# Tester la connexion
Write-Host ""
Write-Host "2. Test de connexion PostgreSQL..." -ForegroundColor Blue
$env:PGPASSWORD = "postgres"
try {
    $result = psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Connexion: OK" -ForegroundColor Green
    } else {
        Write-Host "   Connexion: ECHOUE" -ForegroundColor Red
        Write-Host "   Essayez avec votre mot de passe PostgreSQL" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   psql non trouve dans le PATH" -ForegroundColor Yellow
    Write-Host "   Vous pouvez creer la base manuellement" -ForegroundColor Yellow
}

# Creer la base de donnees
Write-Host ""
Write-Host "3. Creation de la base de donnees..." -ForegroundColor Blue
Write-Host "   Base: ERP_La_Plume_Local" -ForegroundColor White
Write-Host ""

$createDbQuery = @"
-- Creer la base de donnees si elle n'existe pas
SELECT 'CREATE DATABASE "ERP_La_Plume_Local"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ERP_La_Plume_Local')\gexec
"@

Write-Host "Commande SQL a executer:" -ForegroundColor Yellow
Write-Host "  CREATE DATABASE ""ERP_La_Plume_Local"";" -ForegroundColor White
Write-Host ""
Write-Host "Pour executer manuellement:" -ForegroundColor Yellow
Write-Host "  psql -h localhost -p 5432 -U postgres -c 'CREATE DATABASE ""ERP_La_Plume_Local"";'" -ForegroundColor White
Write-Host ""

# Creer le fichier .env.local
Write-Host "4. Creation du fichier .env.local..." -ForegroundColor Blue
$envLocalContent = @"
# Configuration locale pour les tests
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume_Local
DB_USER=postgres
DB_PASSWORD=postgres

# Ou avec DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ERP_La_Plume_Local?schema=public"
"@

$envLocalPath = ".env.local"
$envLocalContent | Out-File -FilePath $envLocalPath -Encoding UTF8
Write-Host "   Fichier cree: $envLocalPath" -ForegroundColor Green

Write-Host ""
Write-Host "5. Creation de la base avec Node.js..." -ForegroundColor Blue
Write-Host "   (Si psql n'est pas disponible)" -ForegroundColor Gray
Write-Host ""
$env:DB_PASSWORD = "postgres"
node creer-base-locale-node.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "CONFIGURATION TERMINEE" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Basculer vers local: powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1" -ForegroundColor White
    Write-Host "  2. Tester: node test-modules-odoo.js" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "CONFIGURATION PARTIELLE" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Le fichier .env.local a ete cree." -ForegroundColor Yellow
    Write-Host "Pour creer la base manuellement:" -ForegroundColor Yellow
    Write-Host "  1. psql -h localhost -p 5432 -U postgres -c 'CREATE DATABASE ""ERP_La_Plume_Local"";'" -ForegroundColor White
    Write-Host "  2. psql -h localhost -p 5432 -U postgres -d ERP_La_Plume_Local -f creer-base-locale.sql" -ForegroundColor White
    Write-Host "  3. Basculer vers local: powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1" -ForegroundColor White
    Write-Host ""
}
