# ============================================================================
# Script PowerShell pour exécuter le schéma SQL du module Ventes
# ============================================================================
# Ce script affiche les instructions pour exécuter le schéma SQL
# via pgAdmin (recommandé sur Windows) ou via psql si disponible
#
# Usage:
#   .\scripts\executer-schema-ventes.ps1
# ============================================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📦 EXÉCUTION DU SCHÉMA SQL - MODULE VENTES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "backend/database/schema_ventes.sql")) {
    Write-Host "❌ Erreur: Le fichier backend/database/schema_ventes.sql n'existe pas" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
}

# Vérifier que .env existe
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ Erreur: Le fichier backend/.env n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Fichier SQL trouvé: backend/database/schema_ventes.sql" -ForegroundColor Green
Write-Host ""

# Lire les variables d'environnement (si possible)
Write-Host "📊 Informations de connexion (depuis backend/.env):" -ForegroundColor Yellow
$envContent = Get-Content "backend/.env" | Where-Object { $_ -match "^DB_" }
foreach ($line in $envContent) {
    if ($line -match "DB_PASSWORD") {
        Write-Host "   $($line.Split('=')[0]): *** (masqué)"
    } else {
        Write-Host "   $line"
    }
}
Write-Host ""

Write-Host "⚠️  MÉTHODE RECOMMANDÉE SUR WINDOWS: pgAdmin" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 Instructions rapides:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ouvrez pgAdmin" -ForegroundColor White
Write-Host "2. Connectez-vous à la base de données ERP_La_Plume" -ForegroundColor White
Write-Host "   (Via tunnel SSH si nécessaire pour OVH Cloud DB)" -ForegroundColor Gray
Write-Host "3. Clic droit sur la base de données > Query Tool" -ForegroundColor White
Write-Host "4. Ouvrez le fichier: backend/database/schema_ventes.sql" -ForegroundColor White
Write-Host "   (Ctrl+O ou File > Open)" -ForegroundColor Gray
Write-Host "5. Cliquez sur Execute (F5)" -ForegroundColor White
Write-Host ""

Write-Host "📄 Chemin complet du fichier SQL:" -ForegroundColor Cyan
$fullPath = (Resolve-Path "backend/database/schema_ventes.sql").Path
Write-Host "   $fullPath" -ForegroundColor White
Write-Host ""

# Proposer d'ouvrir le fichier
$response = Read-Host "Souhaitez-vous ouvrir le fichier SQL maintenant? (o/n)"
if ($response -eq "o" -or $response -eq "O") {
    Write-Host "📂 Ouverture du fichier SQL..." -ForegroundColor Green
    Start-Process "notepad.exe" -ArgumentList $fullPath
    Write-Host ""
    Write-Host "✅ Vous pouvez maintenant copier le contenu et l'exécuter dans pgAdmin" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour plus de details, consultez:" -ForegroundColor Cyan
Write-Host "   docs/database/EXECUTER_SCHEMA_VENTES.md" -ForegroundColor White
Write-Host ""
