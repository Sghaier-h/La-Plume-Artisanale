# Script PowerShell pour vérifier rapidement la connexion

Write-Host "🔍 Diagnostic de connexion à la base de données..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier le fichier .env
Write-Host "1️⃣ Vérification du fichier .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ Fichier .env trouvé" -ForegroundColor Green
    
    # Charger les variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    
    Write-Host "   📋 Configuration:" -ForegroundColor Cyan
    Write-Host "      Host: $env:DB_HOST" -ForegroundColor White
    Write-Host "      Port: $env:DB_PORT" -ForegroundColor White
    Write-Host "      Database: $env:DB_NAME" -ForegroundColor White
    Write-Host "      User: $env:DB_USER" -ForegroundColor White
    Write-Host "      Password: $(if ($env:DB_PASSWORD) { '***' } else { '❌ NON DÉFINI' })" -ForegroundColor $(if ($env:DB_PASSWORD) { 'White' } else { 'Red' })
    Write-Host ""
} else {
    Write-Host "   ❌ Fichier .env non trouvé !" -ForegroundColor Red
    Write-Host "   💡 Exécutez: .\creer-env.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. Vérifier la connexion réseau
Write-Host "2️⃣ Test de connexion réseau..." -ForegroundColor Yellow
$hostName = $env:DB_HOST
$port = if ($env:DB_PORT) { [int]$env:DB_PORT } else { 5432 }

try {
    $test = Test-NetConnection -ComputerName $hostName -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($test) {
        Write-Host "   ✅ Connexion réseau réussie" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Connexion réseau échouée" -ForegroundColor Red
        Write-Host "   💡 Vérifiez que l'IP de votre PC est autorisée dans PostgreSQL OVH" -ForegroundColor Yellow
        Write-Host "   💡 Votre IP publique: $((Invoke-RestMethod -Uri 'https://api.ipify.org?format=json').ip)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Impossible de tester la connexion réseau: $_" -ForegroundColor Yellow
}
Write-Host ""

# 3. Exécuter le test Node.js
Write-Host "3️⃣ Test de connexion PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

try {
    node src/utils/test-db.js
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ Tous les tests sont passés avec succès !" -ForegroundColor Green
        Write-Host "🚀 Vous pouvez démarrer le serveur avec: npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Les tests ont échoué. Voir les détails ci-dessus." -ForegroundColor Red
        Write-Host "📚 Voir: DIAGNOSTIC_CONNEXION.md pour plus de solutions" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du test: $_" -ForegroundColor Red
    exit 1
}
