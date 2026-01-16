# Script pour resoudre automatiquement le probleme de connexion

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resolution automatique du probleme" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

# 1. Verifier le tunnel SSH
Write-Host "[1/5] Verification du tunnel SSH..." -ForegroundColor Yellow
$tunnelProcess = Get-Process -Name ssh -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*5433*sh131616*" 
}

if ($tunnelProcess) {
    Write-Host "  [OK] Tunnel SSH actif (PID: $($tunnelProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "  [ATTENTION] Tunnel SSH non detecte" -ForegroundColor Yellow
    Write-Host "  Demarrage du tunnel SSH..." -ForegroundColor Cyan
    
    # Demarrer le tunnel SSH en arriere-plan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -WindowStyle Minimized
    
    Write-Host "  [INFO] Tunnel SSH demarre - Attente 5 secondes..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

# 2. Verifier le fichier .env
Write-Host ""
Write-Host "[2/5] Verification du fichier .env..." -ForegroundColor Yellow
$envPath = Join-Path $backendPath ".env"

if (Test-Path $envPath) {
    Write-Host "  [OK] Fichier .env existe" -ForegroundColor Green
    
    # Verifier que DB_PORT est 5433
    $envContent = Get-Content $envPath -Raw
    if ($envContent -notmatch "DB_PORT=5433") {
        Write-Host "  [CORRECTION] Mise a jour de DB_PORT a 5433..." -ForegroundColor Yellow
        $envContent = $envContent -replace "DB_PORT=\d+", "DB_PORT=5433"
        $envContent = $envContent -replace "DB_HOST=sh131616-002\.eu\.clouddb\.ovh\.net", "DB_HOST=localhost"
        Set-Content -Path $envPath -Value $envContent -NoNewline
        Write-Host "  [OK] Fichier .env mis a jour" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Configuration DB_PORT correcte" -ForegroundColor Green
    }
} else {
    Write-Host "  [ERREUR] Fichier .env non trouve !" -ForegroundColor Red
    Write-Host "  Creation du fichier .env..." -ForegroundColor Yellow
    
    $envContent = @"
# Base de donnees PostgreSQL OVH (via Tunnel SSH)
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Format pour Prisma
DATABASE_URL="postgresql://Aviateur:Allbyfouta007@localhost:5433/ERP_La_Plume?schema=public"

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
"@
    
    Set-Content -Path $envPath -Value $envContent -NoNewline
    Write-Host "  [OK] Fichier .env cree" -ForegroundColor Green
}

# 3. Tester la connexion a la base de donnees
Write-Host ""
Write-Host "[3/5] Test de connexion a la base de donnees..." -ForegroundColor Yellow
Set-Location $backendPath
$testResult = node src/utils/test-db.js 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Connexion a la base de donnees reussie" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] Connexion a la base de donnees echouee" -ForegroundColor Red
    Write-Host "  Verifiez que le tunnel SSH est actif" -ForegroundColor Yellow
}

# 4. Creer l'utilisateur admin
Write-Host ""
Write-Host "[4/5] Creation/Mise a jour de l'utilisateur admin..." -ForegroundColor Yellow
$createAdminResult = node src/utils/create-admin.js 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Utilisateur admin pret" -ForegroundColor Green
} else {
    Write-Host "  [ATTENTION] Probleme lors de la creation de l'utilisateur" -ForegroundColor Yellow
    Write-Host $createAdminResult -ForegroundColor Gray
}

# 5. Redemarrer le backend
Write-Host ""
Write-Host "[5/5] Redemarrage du backend..." -ForegroundColor Yellow

# Arreter les processus backend existants
$backendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*backend*" -or $_.CommandLine -like "*server.js*"
}

if ($backendProcesses) {
    Write-Host "  Arret des processus backend existants..." -ForegroundColor Yellow
    $backendProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Demarrer le backend
Write-Host "  Demarrage du backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Minimized

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Resolution terminee !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Identifiants de connexion:" -ForegroundColor Cyan
Write-Host "  Email: admin@system.local" -ForegroundColor White
Write-Host "  Mot de passe: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "Le backend devrait etre accessible sur http://localhost:5000" -ForegroundColor Cyan
Write-Host "Attendez quelques secondes que le backend demarre..." -ForegroundColor Yellow
