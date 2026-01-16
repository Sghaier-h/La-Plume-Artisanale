# Script PowerShell pour initialiser Git dans le dossier La-Plume-Artisanale
# Usage: .\init-git.ps1

Write-Host "🚀 Initialisation Git pour La Plume Artisanale" -ForegroundColor Green
Write-Host ""

# Vérifier qu'on est dans le bon dossier
$currentDir = Get-Location
if ($currentDir.Path -notlike "*La-Plume-Artisanale*") {
    Write-Host "⚠️  Vous n'êtes pas dans le dossier La-Plume-Artisanale" -ForegroundColor Yellow
    Write-Host "📁 Changement de dossier..." -ForegroundColor Cyan
    Set-Location "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
}

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git installé : $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé !" -ForegroundColor Red
    Write-Host "📥 Téléchargez Git : https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Supprimer .git s'il existe
if (Test-Path ".git") {
    Write-Host "🗑️  Suppression du dossier .git existant..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force
}

# Initialiser Git
Write-Host "📦 Initialisation de Git..." -ForegroundColor Cyan
git init

# Vérifier la configuration Git
Write-Host ""
Write-Host "🔍 Vérification de la configuration Git..." -ForegroundColor Cyan
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "⚠️  Configuration Git manquante" -ForegroundColor Yellow
    $name = Read-Host "Entrez votre nom"
    $email = Read-Host "Entrez votre email"
    git config --global user.name $name
    git config --global user.email $email
    Write-Host "✅ Configuration Git mise à jour" -ForegroundColor Green
} else {
    Write-Host "✅ Nom : $userName" -ForegroundColor Green
    Write-Host "✅ Email : $userEmail" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host ""
Write-Host "📝 Ajout des fichiers..." -ForegroundColor Cyan
git add .

# Premier commit
Write-Host ""
Write-Host "💾 Création du commit initial..." -ForegroundColor Cyan
git commit -m "Initial commit - ERP ALL BY FOUTA / La Plume Artisanale"

# Configurer le remote
Write-Host ""
Write-Host "🔗 Configuration du remote GitHub..." -ForegroundColor Cyan
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git

# Renommer la branche en main
Write-Host ""
Write-Host "🌿 Configuration de la branche main..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "✅ Git initialisé avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Pour pousser sur GitHub, exécutez :" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "💡 Note : GitHub vous demandera vos identifiants" -ForegroundColor Yellow
Write-Host "   Utilisez un Personal Access Token comme mot de passe" -ForegroundColor Yellow
Write-Host "   Créez-en un ici : https://github.com/settings/tokens" -ForegroundColor Yellow

