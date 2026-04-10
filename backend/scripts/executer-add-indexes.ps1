# Script PowerShell pour exécuter le script SQL d'index manquants
# Usage: .\executer-add-indexes.ps1

# Charger les variables d'environnement depuis .env
if (Test-Path ".\.env") {
    Get-Content ".\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$DB_HOST = $env.DB_HOST
$DB_PORT = $env.DB_PORT
$DB_NAME = $env.DB_NAME
$DB_USER = $env.DB_USER
$DB_PASSWORD = $env.DB_PASSWORD

if (-not $DB_HOST -or -not $DB_NAME -or -not $DB_USER) {
    Write-Host "❌ Erreur : Variables d'environnement manquantes" -ForegroundColor Red
    Write-Host "   Assurez-vous que .env contient DB_HOST, DB_NAME, DB_USER" -ForegroundColor Yellow
    exit 1
}

$SQL_FILE = "backend\database\add_missing_indexes.sql"

if (-not (Test-Path $SQL_FILE)) {
    Write-Host "❌ Erreur : Fichier SQL non trouvé : $SQL_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Exécution du script SQL : $SQL_FILE" -ForegroundColor Cyan
Write-Host "   Base de données : $DB_NAME sur $DB_HOST:$DB_PORT" -ForegroundColor Gray

# Vérifier si psql est disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "" 
    Write-Host "⚠️  psql n'est pas disponible sur ce système" -ForegroundColor Yellow
    Write-Host "" 
    Write-Host "Options alternatives :" -ForegroundColor Cyan
    Write-Host "1. Installer PostgreSQL client tools" -ForegroundColor White
    Write-Host "2. Exécuter le script via pgAdmin :" -ForegroundColor White
    Write-Host "   - Ouvrir pgAdmin" -ForegroundColor Gray
    Write-Host "   - Se connecter à la base $DB_NAME" -ForegroundColor Gray
    Write-Host "   - Outils > Query Tool" -ForegroundColor Gray
    Write-Host "   - Ouvrir le fichier $SQL_FILE" -ForegroundColor Gray
    Write-Host "   - Exécuter (F5)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Exécuter via SSH sur le serveur :" -ForegroundColor White
    Write-Host "   ssh user@server" -ForegroundColor Gray
    Write-Host "   cd /path/to/project" -ForegroundColor Gray
    Write-Host "   psql -U $DB_USER -d $DB_NAME -f backend/database/add_missing_indexes.sql" -ForegroundColor Gray
    exit 0
}

# Construire la commande psql
$env:PGPASSWORD = $DB_PASSWORD
$psqlCommand = "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SQL_FILE"

Write-Host ""
Write-Host "Exécution de la commande..." -ForegroundColor Cyan
Write-Host ""

try {
    Invoke-Expression $psqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Script SQL exécuté avec succès !" -ForegroundColor Green
        Write-Host "   Les index ont été créés pour optimiser les performances" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'exécution du script SQL" -ForegroundColor Red
        Write-Host "   Code de sortie : $LASTEXITCODE" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur : $_" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}
