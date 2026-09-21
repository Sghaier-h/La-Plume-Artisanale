# Script pour naviguer rapidement vers le répertoire backend
# Usage: .\aller-backend.ps1

$backendPath = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "✅ Vous êtes maintenant dans le répertoire backend" -ForegroundColor Green
    Write-Host "📂 Chemin: $backendPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes utiles:" -ForegroundColor Yellow
    Write-Host "  - Tester les modules: node test-modules-odoo.js" -ForegroundColor White
    Write-Host "  - Démarrer le serveur: npm start" -ForegroundColor White
    Write-Host "  - Vérifier les tables: node verifier-tables-modules-odoo.js" -ForegroundColor White
} else {
    Write-Host "❌ Erreur: Le répertoire backend n'existe pas à cet emplacement" -ForegroundColor Red
    Write-Host "   Chemin recherché: $backendPath" -ForegroundColor Yellow
}
