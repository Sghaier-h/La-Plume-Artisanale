# Script de test automatique

Write-Host "Tests Automatiques de Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

$success = 0
$warnings = 0
$errors = 0

Write-Host "Test 1 : Verification des dossiers..." -ForegroundColor Yellow
if (Test-Path $backendDir) {
    Write-Host "[OK] Dossier backend trouve" -ForegroundColor Green
    $success++
} else {
    Write-Host "[ERREUR] Dossier backend introuvable" -ForegroundColor Red
    $errors++
}

if (Test-Path $frontendDir) {
    Write-Host "[OK] Dossier frontend trouve" -ForegroundColor Green
    $success++
} else {
    Write-Host "[ERREUR] Dossier frontend introuvable" -ForegroundColor Red
    $errors++
}
Write-Host ""

Write-Host "Test 2 : Verification du fichier .env backend..." -ForegroundColor Yellow
$backendEnv = Join-Path $backendDir ".env"
if (Test-Path $backendEnv) {
    Write-Host "[OK] Fichier .env backend existe" -ForegroundColor Green
    $success++
    
    $envContent = Get-Content $backendEnv -Raw
    
    if ($envContent -match 'DB_HOST=localhost') {
        Write-Host "[OK] DB_HOST configure pour Tunnel SSH (localhost)" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] DB_HOST pas configure pour Tunnel SSH" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($envContent -match 'DB_PORT=5433') {
        Write-Host "[OK] DB_PORT configure pour Tunnel SSH (5433)" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] DB_PORT pas configure pour Tunnel SSH" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "[ERREUR] Fichier .env backend introuvable" -ForegroundColor Red
    $errors++
}
Write-Host ""

Write-Host "Test 3 : Verification de la configuration frontend..." -ForegroundColor Yellow

$apiTs = Join-Path $frontendDir "src\services\api.ts"
if (Test-Path $apiTs) {
    $apiContent = Get-Content $apiTs -Raw
    if ($apiContent -match 'fabrication\.laplume-artisanale\.tn') {
        Write-Host "[OK] api.ts configure pour API VPS" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] api.ts pas configure pour API VPS" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "[ERREUR] Fichier api.ts introuvable" -ForegroundColor Red
    $errors++
}

$socketTs = Join-Path $frontendDir "src\services\socket.ts"
if (Test-Path $socketTs) {
    $socketContent = Get-Content $socketTs -Raw
    if ($socketContent -match 'fabrication\.laplume-artisanale\.tn') {
        Write-Host "[OK] socket.ts configure pour API VPS" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] socket.ts pas configure pour API VPS" -ForegroundColor Yellow
        $warnings++
    }
}

$loginTsx = Join-Path $frontendDir "src\pages\Login.tsx"
if (Test-Path $loginTsx) {
    $loginContent = Get-Content $loginTsx -Raw
    if ($loginContent -match 'fabrication\.laplume-artisanale\.tn') {
        Write-Host "[OK] Login.tsx configure pour API VPS" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] Login.tsx pas configure pour API VPS" -ForegroundColor Yellow
        $warnings++
    }
}
Write-Host ""

Write-Host "Test 4 : Verification de la connexion a l'API VPS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://fabrication.laplume-artisanale.tn/health" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] API VPS accessible" -ForegroundColor Green
        $success++
        
        try {
            $json = $response.Content | ConvertFrom-Json
            if ($json.status -eq "OK") {
                Write-Host "[OK] Endpoint /health fonctionne" -ForegroundColor Green
                $success++
            }
        } catch {
            Write-Host "[AVERTISSEMENT] Reponse API invalide (mais l'API repond)" -ForegroundColor Yellow
            $warnings++
        }
    }
} catch {
    Write-Host "[ERREUR] API VPS inaccessible: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}
Write-Host ""

Write-Host "Test 5 : Verification des dependances..." -ForegroundColor Yellow

$backendNodeModules = Join-Path $backendDir "node_modules"
if (Test-Path $backendNodeModules) {
    Write-Host "[OK] Dependances backend installees" -ForegroundColor Green
    $success++
} else {
    Write-Host "[AVERTISSEMENT] Dependances backend non installees" -ForegroundColor Yellow
    Write-Host "   Executez: cd backend; npm install" -ForegroundColor Gray
    $warnings++
}

$frontendNodeModules = Join-Path $frontendDir "node_modules"
if (Test-Path $frontendNodeModules) {
    Write-Host "[OK] Dependances frontend installees" -ForegroundColor Green
    $success++
} else {
    Write-Host "[AVERTISSEMENT] Dependances frontend non installees" -ForegroundColor Yellow
    Write-Host "   Executez: cd frontend; npm install" -ForegroundColor Gray
    $warnings++
}
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Resume des Tests" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Succes : $success" -ForegroundColor Green
Write-Host "Avertissements : $warnings" -ForegroundColor Yellow
Write-Host "Erreurs : $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errors -eq 0) {
    Write-Host "[OK] Configuration OK !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez demarrer le frontend :" -ForegroundColor Cyan
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "L'application se connectera a l'API VPS automatiquement" -ForegroundColor Cyan
} else {
    Write-Host "[ERREUR] Des erreurs ont ete detectees. Verifiez les messages ci-dessus." -ForegroundColor Yellow
}

Write-Host ""
