# Lancer Backend + Frontend en local (ERP La Plume Artisanale)
# Double-cliquez ou exécutez: powershell -ExecutionPolicy Bypass -File LANCER_LOCAL.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$backendPath  = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

if (-not (Test-Path $backendPath)) {
    Write-Host "Erreur: dossier backend introuvable dans $root" -ForegroundColor Red
    pause
    exit 1
}
if (-not (Test-Path $frontendPath)) {
    Write-Host "Erreur: dossier frontend introuvable dans $root" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "ERP La Plume Artisanale - Demarrage local" -ForegroundColor Cyan
Write-Host ""

# Liberer les ports 5000 et 3000 (tuer les processus qui les utilisent)
foreach ($port in 5000, 3000) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
        Write-Host "Port $port utilise - arret des processus: $($pids -join ', ')" -ForegroundColor Yellow
        foreach ($procId in $pids) {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 3
    }
}

Write-Host "Backend (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"
Start-Sleep -Seconds 4

Write-Host "Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"

Write-Host ""
Write-Host "OK - Backend: http://localhost:5000  |  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Fermez les fenetres PowerShell pour arreter les serveurs." -ForegroundColor Gray
Start-Sleep -Seconds 2
