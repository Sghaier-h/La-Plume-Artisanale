# Script PowerShell pour demarrer le backend et le frontend simultanement

Write-Host "Demarrage complet de l'application ERP La Plume Artisanale" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Verifier que les dossiers existent
if (-not (Test-Path $backendPath)) {
    Write-Host "Erreur: Le dossier backend n'existe pas !" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Erreur: Le dossier frontend n'existe pas !" -ForegroundColor Red
    exit 1
}

# Fonction pour demarrer le backend dans une nouvelle fenetre
function Start-Backend {
    Write-Host "Demarrage du backend..." -ForegroundColor Yellow
    
    $backendScript = "cd '$backendPath'; Write-Host 'Demarrage du backend sur le port 5000...' -ForegroundColor Cyan; npm start"
    
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $backendScript)
    Start-Sleep -Seconds 3
}

# Fonction pour demarrer le frontend dans une nouvelle fenetre
function Start-Frontend {
    Write-Host "Demarrage du frontend..." -ForegroundColor Yellow
    
    $frontendScript = "cd '$frontendPath'; if (-not (Test-Path 'node_modules')) { Write-Host 'Installation des dependances frontend...' -ForegroundColor Yellow; npm install }; Write-Host 'Demarrage du frontend sur le port 3000...' -ForegroundColor Cyan; npm start"
    
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $frontendScript)
}

# Demarrer le backend
Start-Backend

# Attendre quelques secondes pour que le backend demarre
Write-Host "Attente du demarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Demarrer le frontend
Start-Frontend

Write-Host ""
Write-Host "Application demarree !" -ForegroundColor Green
Write-Host ""
Write-Host "Services disponibles :" -ForegroundColor Cyan
Write-Host "   - Backend : http://localhost:5000" -ForegroundColor White
Write-Host "   - Frontend : http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Les deux fenetres PowerShell sont maintenant ouvertes" -ForegroundColor Yellow
Write-Host "Fermez-les pour arreter les serveurs" -ForegroundColor Yellow
