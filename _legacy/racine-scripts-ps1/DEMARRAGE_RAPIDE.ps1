# ============================================================
# SCRIPT DE DÉMARRAGE RAPIDE - ERP LA PLUME ARTISANALE
# ============================================================
# Ce script démarre le backend et le frontend automatiquement
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 DÉMARRAGE ERP LA PLUME ARTISANALE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "   Veuillez installer Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Vérifier si PostgreSQL est accessible
Write-Host ""
Write-Host "📊 Vérification de la connexion PostgreSQL..." -ForegroundColor Yellow
$env:PGPASSWORD = "votre_mot_de_passe"  # À modifier selon votre configuration

# Vérifier les variables d'environnement
if (-not $env:REACT_APP_API_URL) {
    Write-Host "⚠️  REACT_APP_API_URL non défini, utilisation de la valeur par défaut" -ForegroundColor Yellow
}

# Fonction pour démarrer le backend
function Start-Backend {
    Write-Host ""
    Write-Host "🔧 DÉMARRAGE DU BACKEND..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Set-Location ".\backend"
    
    # Vérifier si node_modules existe
    if (-not (Test-Path ".\node_modules")) {
        Write-Host "📦 Installation des dépendances backend..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🚀 Démarrage du serveur backend sur le port 5000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    
    Set-Location ".."
}

# Fonction pour démarrer le frontend
function Start-Frontend {
    Write-Host ""
    Write-Host "🎨 DÉMARRAGE DU FRONTEND..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Set-Location ".\frontend"
    
    # Vérifier si node_modules existe
    if (-not (Test-Path ".\node_modules")) {
        Write-Host "📦 Installation des dépendances frontend..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🚀 Démarrage du serveur frontend sur le port 3000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    
    Set-Location ".."
}

# Fonction pour vérifier si le port est utilisé
function Test-Port {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Vérifier et tuer les processus sur les ports 5000 et 3000
Write-Host ""
Write-Host "🔍 Vérification des ports..." -ForegroundColor Yellow

if (Test-Port -Port 5000) {
    Write-Host "⚠️  Port 5000 déjà utilisé. Tentative de libération..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

if (Test-Port -Port 3000) {
    Write-Host "⚠️  Port 3000 déjà utilisé. Tentative de libération..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Démarrer les serveurs
Start-Backend
Start-Sleep -Seconds 3
Start-Frontend

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ SYSTÈME DÉMARRÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Comptes de test:" -ForegroundColor Cyan
Write-Host "   Admin: admin@system.local / Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Les fenêtres PowerShell restent ouvertes pour voir les logs." -ForegroundColor Yellow
Write-Host "   Fermez-les pour arrêter les serveurs." -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
