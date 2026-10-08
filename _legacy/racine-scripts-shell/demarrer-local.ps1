# Script PowerShell pour demarrer le SAAS en local

$PROJECT_DIR = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$BACKEND_DIR = Join-Path $PROJECT_DIR "backend"
$FRONTEND_DIR = Join-Path $PROJECT_DIR "frontend"

Write-Host "🚀 Demarrage du SAAS en local..." -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que Node.js et npm sont installes
Write-Host "🔍 Verification de Node.js et npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Gray
    Write-Host "npm: $npmVersion" -ForegroundColor Gray
} catch {
    Write-Host "❌ Node.js ou npm n'est pas installe !" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Configurer le backend
Write-Host "🔧 Configuration du backend..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR

# Verifier que le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Le fichier .env n'existe pas dans le backend" -ForegroundColor Yellow
    Write-Host "   Creer un fichier .env avec la configuration de la base de donnees" -ForegroundColor Gray
}

# Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dependances du backend..." -ForegroundColor Yellow
    npm install
}

Write-Host ""

# 3. Configurer le frontend
Write-Host "🔧 Configuration du frontend..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR

# Creer le fichier .env.local pour le developpement local
$envLocal = Join-Path $FRONTEND_DIR ".env.local"
if (-not (Test-Path $envLocal)) {
    Write-Host "📝 Creation du fichier .env.local..." -ForegroundColor Yellow
    Set-Content -Path $envLocal -Value "REACT_APP_API_URL=http://localhost:5000/api"
    Write-Host "   Fichier .env.local cree avec REACT_APP_API_URL=http://localhost:5000/api" -ForegroundColor Gray
}

# Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dependances du frontend..." -ForegroundColor Yellow
    npm install
}

Write-Host ""

# 4. Demarrer le backend (dans un nouveau terminal)
Write-Host "🟢 Demarrage du backend sur http://localhost:5000..." -ForegroundColor Green
Write-Host "   Ouvrez un nouveau terminal et executez:" -ForegroundColor Gray
Write-Host "   cd `"$BACKEND_DIR`"" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

# 5. Demarrer le frontend
Write-Host "🟢 Demarrage du frontend sur http://localhost:3000..." -ForegroundColor Green
Write-Host "   Le navigateur va s'ouvrir automatiquement" -ForegroundColor Gray
Write-Host ""

# Demarrer le frontend
npm start
