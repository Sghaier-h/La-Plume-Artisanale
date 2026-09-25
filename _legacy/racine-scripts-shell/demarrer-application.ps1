# ============================================================================
# SCRIPT DE DÉMARRAGE - ERP LA PLUME ARTISANALE
# ============================================================================
# Ce script démarre le backend et le frontend
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEMARRAGE APPLICATION ERP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les dépendances sont installées
Write-Host "Verification des dependances..." -ForegroundColor Yellow

if (-not (Test-Path "La-Plume-Artisanale\backend\node_modules")) {
    Write-Host "  ⚠️  Dependances backend non installees" -ForegroundColor Yellow
    Write-Host "  Execution de l'installation..." -ForegroundColor Yellow
    Set-Location "La-Plume-Artisanale"
    .\installer-complet.ps1
    Set-Location ".."
}

if (-not (Test-Path "La-Plume-Artisanale\frontend\node_modules")) {
    Write-Host "  ⚠️  Dependances frontend non installees" -ForegroundColor Yellow
    Write-Host "  Execution de l'installation..." -ForegroundColor Yellow
    Set-Location "La-Plume-Artisanale"
    .\installer-complet.ps1
    Set-Location ".."
}

Write-Host "  ✅ Dependances OK" -ForegroundColor Green
Write-Host ""

# Vérifier le fichier .env
if (-not (Test-Path "La-Plume-Artisanale\backend\.env")) {
    Write-Host "  ⚠️  Fichier .env non trouve dans backend/" -ForegroundColor Yellow
    Write-Host "  Creation du fichier .env..." -ForegroundColor Yellow
    Copy-Item "La-Plume-Artisanale\backend\.env.example" "La-Plume-Artisanale\backend\.env" -ErrorAction SilentlyContinue
    if (Test-Path "La-Plume-Artisanale\backend\.env") {
        Write-Host "  ✅ Fichier .env cree (a configurer)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEMARRAGE SERVEURS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Demarrage du backend sur le port 5000..." -ForegroundColor Yellow
Write-Host "Demarrage du frontend sur le port 3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Les deux serveurs vont demarrer dans des fenetres separees." -ForegroundColor Cyan
Write-Host ""

# Démarrer le backend dans une nouvelle fenêtre
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\La-Plume-Artisanale\backend'; Write-Host 'BACKEND - Port 5000' -ForegroundColor Green; npm run dev"

# Attendre un peu
Start-Sleep -Seconds 3

# Démarrer le frontend dans une nouvelle fenêtre
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\La-Plume-Artisanale\frontend'; Write-Host 'FRONTEND - Port 3000' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SERVEURS DEMARRES !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connexion (mode mock):" -ForegroundColor Yellow
Write-Host "  Email: admin@system.local" -ForegroundColor White
Write-Host "  Mot de passe: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenetre..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
