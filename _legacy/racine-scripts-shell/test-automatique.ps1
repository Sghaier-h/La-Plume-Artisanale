# Script de test automatique de la configuration

Write-Host "🧪 Tests Automatiques de Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

$errors = 0
$warnings = 0
$success = 0

# Fonction pour afficher les résultats
function Show-Result {
    param($test, $status, $message = "")
    if ($status -eq "✅") {
        Write-Host "$status $test" -ForegroundColor Green
        $script:success++
    } elseif ($status -eq "⚠️") {
        Write-Host "$status $test" -ForegroundColor Yellow
        $script:warnings++
        if ($message) { Write-Host "   $message" -ForegroundColor Gray }
    } else {
        Write-Host "$status $test" -ForegroundColor Red
        $script:errors++
        if ($message) { Write-Host "   $message" -ForegroundColor Red }
    }
}

Write-Host "📋 Test 1 : Vérification des dossiers..." -ForegroundColor Yellow
if (Test-Path $backendDir) {
    Show-Result "Dossier backend trouvé" "✅"
} else {
    Show-Result "Dossier backend introuvable" "❌" $backendDir
}

if (Test-Path $frontendDir) {
    Show-Result "Dossier frontend trouvé" "✅"
} else {
    Show-Result "Dossier frontend introuvable" "❌" $frontendDir
}
Write-Host ""

Write-Host "📋 Test 2 : Vérification du fichier .env backend..." -ForegroundColor Yellow
$backendEnv = Join-Path $backendDir ".env"
if (Test-Path $backendEnv) {
    Show-Result "Fichier .env backend existe" "✅"
    
    $envContent = Get-Content $backendEnv -Raw
    
    if ($envContent -match 'DB_HOST=localhost') {
        Show-Result "DB_HOST configuré pour Tunnel SSH (localhost)" "✅"
    } else {
        Show-Result "DB_HOST pas configuré pour Tunnel SSH" "⚠️" "Doit être 'localhost' pour Tunnel SSH"
    }
    
    if ($envContent -match 'DB_PORT=5433') {
        Show-Result "DB_PORT configuré pour Tunnel SSH (5433)" "✅"
    } else {
        Show-Result "DB_PORT pas configuré pour Tunnel SSH" "⚠️" "Doit être '5433' pour Tunnel SSH"
    }
    
    if ($envContent -match 'DB_NAME=ERP_La_Plume') {
        Show-Result "DB_NAME correct" "✅"
    } else {
        Show-Result "DB_NAME incorrect ou manquant" "❌"
    }
} else {
    Show-Result "Fichier .env backend introuvable" "❌"
}
Write-Host ""

Write-Host "📋 Test 3 : Vérification de la configuration frontend..." -ForegroundColor Yellow

# Test api.ts
$apiTs = Join-Path $frontendDir "src\services\api.ts"
if (Test-Path $apiTs) {
    $apiContent = Get-Content $apiTs -Raw
    if ($apiContent -match 'fabrication\.laplume-artisanale\.tn') {
        Show-Result "api.ts configuré pour API VPS" "✅"
    } else {
        Show-Result "api.ts pas configuré pour API VPS" "⚠️" "Utilise probablement localhost"
    }
} else {
    Show-Result "Fichier api.ts introuvable" "❌"
}

# Test socket.ts
$socketTs = Join-Path $frontendDir "src\services\socket.ts"
if (Test-Path $socketTs) {
    $socketContent = Get-Content $socketTs -Raw
    if ($socketContent -match 'fabrication\.laplume-artisanale\.tn') {
        Show-Result "socket.ts configuré pour API VPS" "✅"
    } else {
        Show-Result "socket.ts pas configuré pour API VPS" "⚠️" "Utilise probablement localhost"
    }
} else {
    Show-Result "Fichier socket.ts introuvable" "❌"
}

# Test Login.tsx
$loginTsx = Join-Path $frontendDir "src\pages\Login.tsx"
if (Test-Path $loginTsx) {
    $loginContent = Get-Content $loginTsx -Raw
    if ($loginContent -match 'fabrication\.laplume-artisanale\.tn') {
        Show-Result "Login.tsx configuré pour API VPS" "✅"
    } else {
        Show-Result "Login.tsx pas configuré pour API VPS" "⚠️" "Utilise probablement localhost"
    }
} else {
    Show-Result "Fichier Login.tsx introuvable" "❌"
}
Write-Host ""

Write-Host "📋 Test 4 : Vérification de la connexion à l'API VPS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://fabrication.laplume-artisanale.tn/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Show-Result "API VPS accessible" "✅" "Répond correctement"
        try {
            $json = $response.Content | ConvertFrom-Json
            if ($json.status -eq "OK") {
                Show-Result "Endpoint /health fonctionne" "✅"
            }
        } catch {
            Show-Result "Réponse API invalide" "⚠️" "Mais l'API répond"
        }
    }
} catch {
    Show-Result "API VPS inaccessible" "❌" "Vérifiez la connexion internet"
}
Write-Host ""

Write-Host "📋 Test 5 : Vérification des dépendances..." -ForegroundColor Yellow

# Test backend node_modules
$backendNodeModules = Join-Path $backendDir "node_modules"
if (Test-Path $backendNodeModules) {
    Show-Result "Dépendances backend installées" "✅"
} else {
    Show-Result "Dépendances backend non installées" "⚠️" "Exécutez: cd backend; npm install"
}

# Test frontend node_modules
$frontendNodeModules = Join-Path $frontendDir "node_modules"
if (Test-Path $frontendNodeModules) {
    Show-Result "Dépendances frontend installées" "✅"
} else {
    Show-Result "Dépendances frontend non installées" "⚠️" "Exécutez: cd frontend; npm install"
}
Write-Host ""

Write-Host "📋 Test 6 : Vérification du tunnel SSH (optionnel)..." -ForegroundColor Yellow
try {
    $testConnection = Test-NetConnection -ComputerName localhost -Port 5433 -WarningAction SilentlyContinue -InformationLevel Quiet -ErrorAction Stop
    if ($testConnection) {
        Show-Result "Tunnel SSH actif (port 5433)" "✅" "Prêt pour développement backend local"
    } else {
        Show-Result "Tunnel SSH non actif" "⚠️" "Pour backend local: ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N"
    }
} catch {
    Show-Result "Tunnel SSH non actif" "⚠️" "Pas nécessaire si vous utilisez l'API VPS"
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Résumé des Tests" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Succès : $success" -ForegroundColor Green
Write-Host "⚠️  Avertissements : $warnings" -ForegroundColor Yellow
Write-Host "❌ Erreurs : $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errors -eq 0) {
    Write-Host "✅ Configuration OK !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Vous pouvez démarrer le frontend :" -ForegroundColor Cyan
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 L'application se connectera à l'API VPS automatiquement" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Des erreurs ont été détectées. Vérifiez les messages ci-dessus." -ForegroundColor Yellow
}

Write-Host ""
