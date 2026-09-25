# Script pour créer le fichier .env automatiquement

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "⚠️  Le fichier .env existe déjà." -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le remplacer ? (o/N)"
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "❌ Opération annulée." -ForegroundColor Red
        exit 0
    }
}

Write-Host "📝 Création du fichier .env..." -ForegroundColor Cyan

$envContent = @"
# Base de données PostgreSQL OVH
# Format pour Prisma
DATABASE_URL="postgresql://Aviateur:Allbyfouta007@sh131616-002.eu.clouddb.ovh.net:35392/ERP_La_Plume?schema=public"

# Variables pour compatibilité avec l'ancien code (pg)
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
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

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ Fichier .env créé avec succès !" -ForegroundColor Green
Write-Host "📍 Emplacement: $envPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Vous pouvez maintenant exécuter:" -ForegroundColor Yellow
Write-Host "   npx prisma generate" -ForegroundColor White
Write-Host "   npx prisma db push" -ForegroundColor White
Write-Host "   npm run seed" -ForegroundColor White
