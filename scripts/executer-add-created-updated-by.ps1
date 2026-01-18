# ============================================================================
# Script PowerShell pour exécuter le schéma SQL d'ajout des champs created_by/updated_by
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Ajout des champs created_by et updated_by aux tables principales" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Définir les informations de connexion (à adapter selon votre configuration)
$envFile = "backend\.env"
if (Test-Path $envFile) {
    # Charger les variables depuis .env
    $envContent = Get-Content $envFile | Where-Object { $_ -match '^DB_' }
    foreach ($line in $envContent) {
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Variables d'environnement chargées depuis backend\.env" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur: backend\.env introuvable" -ForegroundColor Red
    exit 1
}

$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD

# Vérifier que toutes les variables sont définies
if (-not $DB_HOST -or -not $DB_PORT -or -not $DB_NAME -or -not $DB_USER -or -not $DB_PASSWORD) {
    Write-Host "❌ Erreur: Variables d'environnement manquantes (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Connexion à la base de données:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST"
Write-Host "   Port: $DB_PORT"
Write-Host "   Database: $DB_NAME"
Write-Host "   User: $DB_USER"
Write-Host ""

# Vérifier que le fichier SQL existe
$sqlFile = "backend\database\add_created_updated_by.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Erreur: Fichier SQL introuvable: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Fichier SQL: $sqlFile" -ForegroundColor Yellow
Write-Host ""

# Vérifier si psql est disponible
$psqlPath = "psql"
try {
    $null = Get-Command $psqlPath -ErrorAction Stop
} catch {
    Write-Host "❌ Erreur: psql non trouvé. Veuillez installer PostgreSQL client." -ForegroundColor Red
    Write-Host "   Ou exécutez le script sur le serveur Linux: bash scripts/executer-add-created-updated-by.sh" -ForegroundColor Yellow
    exit 1
}

# Exécuter le script SQL
Write-Host "🔄 Exécution du script SQL..." -ForegroundColor Yellow

$env:PGPASSWORD = $DB_PASSWORD

$sqlContent = Get-Content $sqlFile -Raw
$result = $sqlContent | & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script exécuté avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Les champs created_by et updated_by ont été ajoutés aux tables principales." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution du script SQL" -ForegroundColor Red
    Write-Host $result
    exit 1
}

# Nettoyer
$env:PGPASSWORD = $null
