# ============================================================================
# SCRIPT D'APPLICATION DES SCRIPTS SQL EN STAGING
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "APPLICATION SCRIPTS SQL STAGING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

$dbName = "fouta_erp_staging"
$dbUser = "postgres"
$dbPassword = Read-Host "Mot de passe PostgreSQL (laissez vide si pas de mot de passe)"

if ($dbPassword) {
    $env:PGPASSWORD = $dbPassword
}

# Liste des scripts SQL à appliquer dans l'ordre
$sqlScripts = @(
    "01_tables_base.sql",
    "02_tables_utilisateurs.sql",
    "03_tables_clients.sql",
    "04_tables_fournisseurs.sql",
    "05_tables_catalogue.sql",
    "06_tables_selecteurs.sql",
    "07_tables_stock_multi_entrepots.sql",
    "08_tables_tracabilite_lots.sql",
    "09_tables_communication_taches.sql",
    "10_tables_catalogue_produit.sql",
    "11_modules_ventes.sql",
    "12_modules_achats.sql",
    "13_modules_stock_avance.sql",
    "14_modules_comptabilite.sql",
    "15_modules_crm.sql",
    "16_modules_point_de_vente.sql",
    "17_modules_maintenance.sql",
    "18_modules_qualite_avance.sql",
    "19_modules_planification_gantt.sql",
    "20_modules_couts.sql",
    "21_modules_multisociete.sql",
    "22_modules_communication_externe.sql",
    "23_modules_ecommerce_ia.sql"
)

$successCount = 0
$errorCount = 0
$errors = @()

Write-Host "Application de $($sqlScripts.Count) scripts SQL..." -ForegroundColor Yellow
Write-Host ""

foreach ($script in $sqlScripts) {
    $scriptPath = "database\$script"
    
    if (Test-Path $scriptPath) {
        Write-Host "Application: $script..." -ForegroundColor Yellow -NoNewline
        
        $result = psql -U $dbUser -d $dbName -f $scriptPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $errorCount++
            $errors += @{
                Script = $script
                Error = $result
            }
        }
    } else {
        Write-Host "⚠️  Script non trouvé: $script" -ForegroundColor Yellow
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "RÉSUMÉ" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "✅ Scripts appliqués: $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "❌ Erreurs: $errorCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erreurs détectées:" -ForegroundColor Yellow
    foreach ($error in $errors) {
        Write-Host "  - $($error.Script)" -ForegroundColor Red
    }
}

Write-Host ""

# Vérifier les tables créées
Write-Host "Vérification des tables créées..." -ForegroundColor Yellow
$tableCheck = psql -U $dbUser -d $dbName -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Nombre de tables: $tableCheck" -ForegroundColor Green
}

Write-Host ""
