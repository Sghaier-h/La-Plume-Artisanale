# ============================================================================
# Script PowerShell pour vérifier les champs created_by/updated_by
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Vérification des champs created_by et updated_by" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Charger les variables d'environnement depuis .env
$envFile = "backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile | Where-Object { $_ -match '^DB_' }
    foreach ($line in $envContent) {
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "❌ Erreur: backend\.env introuvable" -ForegroundColor Red
    exit 1
}

$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD

Write-Host "📊 Connexion à la base de données:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST"
Write-Host "   Database: $DB_NAME"
Write-Host ""

$sqlFile = "scripts\verifier-created-updated-by.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Erreur: Fichier SQL introuvable: $sqlFile" -ForegroundColor Red
    exit 1
}

# Vérifier si psql est disponible
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "🔄 Exécution de la vérification..." -ForegroundColor Yellow
    Write-Host ""
    
    $env:PGPASSWORD = $DB_PASSWORD
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile 2>&1
    
    Write-Host $result
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Vérification terminée!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Vérifiez les résultats ci-dessus" -ForegroundColor Yellow
    }
    
    $env:PGPASSWORD = $null
} catch {
    Write-Host "❌ psql non disponible. Exécutez le fichier SQL manuellement dans pgAdmin:" -ForegroundColor Red
    Write-Host "   $sqlFile" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou connectez-vous au serveur et exécutez:" -ForegroundColor Yellow
    Write-Host "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/verifier-created-updated-by.sql" -ForegroundColor Cyan
}
