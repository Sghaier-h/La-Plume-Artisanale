# Script pour installer toutes les dépendances nécessaires
# Usage: powershell -ExecutionPolicy Bypass -File INSTALLER_DEPENDANCES.ps1

$ErrorActionPreference = "Stop"

Write-Host "📦 Installation des dépendances manquantes..." -ForegroundColor Cyan

# Aller dans le répertoire backend
$backendPath = Join-Path $PSScriptRoot "."
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Le répertoire backend n'existe pas !" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Liste des packages à installer
$packages = @(
    "nodemailer",
    "axios"
)

Write-Host "🔍 Vérification des packages existants..." -ForegroundColor Yellow

# Vérifier et installer les packages manquants
foreach ($package in $packages) {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $installed = $packageJson.dependencies.PSObject.Properties.Name -contains $package -or 
                 $packageJson.devDependencies.PSObject.Properties.Name -contains $package
    
    if (-not $installed) {
        Write-Host "📥 Installation de $package..." -ForegroundColor Yellow
        npm install $package
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Erreur lors de l'installation de $package" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ $package installé" -ForegroundColor Green
    } else {
        Write-Host "✅ $package déjà présent" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Toutes les dépendances sont installées !" -ForegroundColor Green
Write-Host "🚀 Vous pouvez maintenant démarrer le backend avec : npm start" -ForegroundColor Cyan
