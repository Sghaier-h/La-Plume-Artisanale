# Script de configuration automatique pour le développement local

Write-Host "🚀 Configuration automatique du projet ERP..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# Vérifier que les dossiers existent
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Erreur: Dossier backend introuvable: $backendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Erreur: Dossier frontend introuvable: $frontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dossiers trouvés" -ForegroundColor Green
Write-Host ""

# ============================================
# SOLUTION 1 : Configurer le Frontend pour utiliser l'API du VPS
# ============================================
Write-Host "📱 Configuration du Frontend pour utiliser l'API du VPS..." -ForegroundColor Yellow

$frontendEnv = Join-Path $frontendDir ".env"

if (Test-Path $frontendEnv) {
    Write-Host "   ⚠️  Le fichier .env frontend existe déjà. Mise à jour..." -ForegroundColor Yellow
} else {
    Write-Host "   📝 Création du fichier .env frontend..." -ForegroundColor Cyan
}

$frontendEnvContent = @"
# Configuration pour utiliser l'API du VPS (déjà déployée)
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
REACT_APP_SOCKET_URL=https://fabrication.laplume-artisanale.tn

# Pour utiliser l'API locale (si backend local démarré), utiliser :
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000
"@

$frontendEnvContent | Out-File -FilePath $frontendEnv -Encoding UTF8 -NoNewline

Write-Host "   ✅ Frontend configuré pour utiliser l'API du VPS" -ForegroundColor Green
Write-Host ""

# ============================================
# SOLUTION 2 : Configurer le Backend pour le Tunnel SSH (si nécessaire)
# ============================================
Write-Host "🔧 Configuration du Backend pour Tunnel SSH..." -ForegroundColor Yellow

$backendEnv = Join-Path $backendDir ".env"

if (Test-Path $backendEnv) {
    Write-Host "   ⚠️  Le fichier .env backend existe déjà." -ForegroundColor Yellow
    
    # Lire le contenu actuel
    $currentContent = Get-Content $backendEnv -Raw
    
    # Remplacer DB_HOST et DB_PORT pour utiliser le tunnel SSH
    $currentContent = $currentContent -replace 'DB_HOST=sh131616-002\.eu\.clouddb\.ovh\.net', 'DB_HOST=localhost'
    $currentContent = $currentContent -replace 'DB_PORT=35392', 'DB_PORT=5433'
    
    # Sauvegarder
    $currentContent | Out-File -FilePath $backendEnv -Encoding UTF8 -NoNewline
    
    Write-Host "   ✅ Backend configuré pour utiliser Tunnel SSH (localhost:5433)" -ForegroundColor Green
} else {
    Write-Host "   📝 Création du fichier .env backend..." -ForegroundColor Cyan
    
    $backendEnvContent = @"
# Base de données PostgreSQL OVH
# Configuration pour Tunnel SSH (localhost:5433)
DATABASE_URL="postgresql://Aviateur:Allbyfouta007@localhost:5433/ERP_La_Plume?schema=public"

# Variables pour compatibilité avec l'ancien code (pg)
# ⚠️ IMPORTANT : Créer d'abord le tunnel SSH sur le port 5433 :
# ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Serveur
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=24h

# API
API_URL=http://localhost:5000
API_VERSION=v1

# Redis (optionnel)
REDIS_HOST=
REDIS_PORT=
"@
    
    $backendEnvContent | Out-File -FilePath $backendEnv -Encoding UTF8 -NoNewline
    
    Write-Host "   ✅ Fichier .env backend créé avec configuration Tunnel SSH" -ForegroundColor Green
}

Write-Host ""

# ============================================
# RÉSUMÉ
# ============================================
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé de la configuration:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Frontend :" -ForegroundColor Green
Write-Host "   - Configuré pour utiliser l'API du VPS" -ForegroundColor White
Write-Host "   - URL: https://fabrication.laplume-artisanale.tn/api" -ForegroundColor White
Write-Host "   - Vous pouvez démarrer immédiatement: cd frontend && npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Backend :" -ForegroundColor Green
Write-Host "   - Configuré pour utiliser Tunnel SSH (localhost:5433)" -ForegroundColor White
Write-Host "   - Pour utiliser le backend local, créez d'abord le tunnel SSH" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1 : Utiliser l'API du VPS (RECOMMANDÉ - Plus simple)" -ForegroundColor Yellow
Write-Host "   1. cd frontend" -ForegroundColor White
Write-Host "   2. npm start" -ForegroundColor White
Write-Host "   3. L'application se connectera à l'API du VPS" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 : Développement local complet" -ForegroundColor Yellow
Write-Host "   1. Terminal 1 : ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -ForegroundColor White
Write-Host "   2. Terminal 2 : cd backend && npm run dev" -ForegroundColor White
Write-Host "   3. Terminal 3 : cd frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "💡 Je recommande l'Option 1 pour commencer rapidement !" -ForegroundColor Cyan
Write-Host ""
