# Script PowerShell pour tester la connexion à la base de données

Write-Host "🔍 Test de connexion à la base de données PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Erreur: Le fichier .env n'existe pas !" -ForegroundColor Red
    Write-Host "💡 Exécutez: .\creer-env.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Fichier .env trouvé" -ForegroundColor Green
Write-Host ""

# Charger les variables d'environnement
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Afficher la configuration (sans le mot de passe)
Write-Host "📋 Configuration de connexion:" -ForegroundColor Cyan
Write-Host "   Host: $env:DB_HOST" -ForegroundColor White
Write-Host "   Port: $env:DB_PORT" -ForegroundColor White
Write-Host "   Database: $env:DB_NAME" -ForegroundColor White
Write-Host "   User: $env:DB_USER" -ForegroundColor White
Write-Host "   Password: $(if ($env:DB_PASSWORD) { '***' } else { 'NON DÉFINI' })" -ForegroundColor White
Write-Host ""

# Tester la connexion réseau
Write-Host "🌐 Test de connexion réseau..." -ForegroundColor Cyan
try {
    $connection = Test-NetConnection -ComputerName $env:DB_HOST -Port $env:DB_PORT -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Connexion réseau réussie" -ForegroundColor Green
    } else {
        Write-Host "❌ Connexion réseau échouée" -ForegroundColor Red
        Write-Host "💡 Vérifiez que l'IP de votre PC est autorisée dans PostgreSQL OVH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Impossible de tester la connexion réseau: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Exécution du script de test Node.js..." -ForegroundColor Cyan
Write-Host ""

# Exécuter le script de test
node src/utils/test-db.js
