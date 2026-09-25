# Script de test simple

Write-Host "Tests Complets de l'Application ERP" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

$success = 0
$warnings = 0
$errors = 0

# Test 1: Dossiers
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

# Test 2: Controllers
Write-Host "Test 2 : Verification des controllers..." -ForegroundColor Yellow
$controllers = @("articles.controller.js", "clients.controller.js", "commandes.controller.js", "machines.controller.js", "of.controller.js", "soustraitants.controller.js", "dashboard.controller.js")
foreach ($controller in $controllers) {
    $path = Join-Path $backendDir "src\controllers\$controller"
    if (Test-Path $path) {
        Write-Host "[OK] $controller" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[ERREUR] $controller introuvable" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# Test 3: Routes
Write-Host "Test 3 : Verification des routes..." -ForegroundColor Yellow
$routes = @("articles.routes.js", "clients.routes.js", "commandes.routes.js", "machines.routes.js", "of.routes.js", "soustraitants.routes.js", "dashboard.routes.js")
foreach ($route in $routes) {
    $path = Join-Path $backendDir "src\routes\$route"
    if (Test-Path $path) {
        Write-Host "[OK] $route" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[ERREUR] $route introuvable" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# Test 4: Pages frontend
Write-Host "Test 4 : Verification des pages frontend..." -ForegroundColor Yellow
$pages = @("Dashboard.tsx", "Articles.tsx", "Clients.tsx", "Commandes.tsx", "Machines.tsx", "OF.tsx", "Soustraitants.tsx")
foreach ($page in $pages) {
    $path = Join-Path $frontendDir "src\pages\$page"
    if (Test-Path $path) {
        Write-Host "[OK] $page" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[ERREUR] $page introuvable" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# Test 5: Services API
Write-Host "Test 5 : Verification des services API..." -ForegroundColor Yellow
$apiFile = Join-Path $frontendDir "src\services\api.ts"
if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    $services = @("articlesService", "clientsService", "commandesService", "machinesService", "ofService", "soustraitantsService", "dashboardService")
    foreach ($service in $services) {
        if ($content -match $service) {
            Write-Host "[OK] $service trouve" -ForegroundColor Green
            $success++
        } else {
            Write-Host "[ERREUR] $service introuvable" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "[ERREUR] Fichier api.ts introuvable" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Test 6: Navigation
Write-Host "Test 6 : Verification de la navigation..." -ForegroundColor Yellow
$navFile = Join-Path $frontendDir "src\components\Navigation.tsx"
if (Test-Path $navFile) {
    Write-Host "[OK] Composant Navigation trouve" -ForegroundColor Green
    $success++
} else {
    Write-Host "[ERREUR] Composant Navigation introuvable" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Test 7: Configuration backend
Write-Host "Test 7 : Verification de la configuration backend..." -ForegroundColor Yellow
$serverFile = Join-Path $backendDir "src\server.js"
if (Test-Path $serverFile) {
    $serverContent = Get-Content $serverFile -Raw
    $routesToCheck = @("articles", "clients", "commandes", "machines", "of", "soustraitants", "dashboard")
    foreach ($route in $routesToCheck) {
        if ($serverContent -match "/api/$route") {
            Write-Host "[OK] Route /api/$route enregistree" -ForegroundColor Green
            $success++
        } else {
            Write-Host "[ERREUR] Route /api/$route non enregistree" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "[ERREUR] Fichier server.js introuvable" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Test 8: Dépendances
Write-Host "Test 8 : Verification des dependances..." -ForegroundColor Yellow
$backendNodeModules = Join-Path $backendDir "node_modules"
$frontendNodeModules = Join-Path $frontendDir "node_modules"
if (Test-Path $backendNodeModules) {
    Write-Host "[OK] Dependances backend installees" -ForegroundColor Green
    $success++
} else {
    Write-Host "[AVERTISSEMENT] Dependances backend non installees" -ForegroundColor Yellow
    $warnings++
}
if (Test-Path $frontendNodeModules) {
    Write-Host "[OK] Dependances frontend installees" -ForegroundColor Green
    $success++
} else {
    Write-Host "[AVERTISSEMENT] Dependances frontend non installees" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# Test 9: Configuration .env
Write-Host "Test 9 : Verification de la configuration .env..." -ForegroundColor Yellow
$backendEnv = Join-Path $backendDir ".env"
if (Test-Path $backendEnv) {
    $envContent = Get-Content $backendEnv -Raw
    if ($envContent -match 'DB_HOST=localhost') {
        Write-Host "[OK] DB_HOST configure pour Tunnel SSH" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] DB_HOST pas configure pour Tunnel SSH" -ForegroundColor Yellow
        $warnings++
    }
    if ($envContent -match 'DB_PORT=5433') {
        Write-Host "[OK] DB_PORT configure pour Tunnel SSH" -ForegroundColor Green
        $success++
    } else {
        Write-Host "[AVERTISSEMENT] DB_PORT pas configure pour Tunnel SSH" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "[AVERTISSEMENT] Fichier .env backend introuvable" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# Test 10: Test API
Write-Host "Test 10 : Test de connexion API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Backend accessible sur localhost:5000" -ForegroundColor Green
        $success++
        try {
            $json = $response.Content | ConvertFrom-Json
            if ($json.status -eq "OK") {
                Write-Host "[OK] Endpoint /health fonctionne" -ForegroundColor Green
                $success++
            }
        } catch {
            Write-Host "[AVERTISSEMENT] Reponse API invalide" -ForegroundColor Yellow
            $warnings++
        }
    }
} catch {
    Write-Host "[INFO] Backend non demarre (normal si pas demarre)" -ForegroundColor Gray
}
Write-Host ""

# Résumé
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Resume des Tests" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Succes : $success" -ForegroundColor Green
Write-Host "Avertissements : $warnings" -ForegroundColor Yellow
Write-Host "Erreurs : $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errors -eq 0) {
    Write-Host "[OK] Tous les tests sont passes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application complete et prete !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour demarrer:" -ForegroundColor Cyan
    Write-Host "  1. Terminal 1: ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -ForegroundColor White
    Write-Host "  2. Terminal 2: cd backend; npm run dev" -ForegroundColor White
    Write-Host "  3. Terminal 3: cd frontend; npm start" -ForegroundColor White
} else {
    Write-Host "[ERREUR] Des erreurs detectees" -ForegroundColor Red
}

Write-Host ""
