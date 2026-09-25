# Script de démarrage du système ERP La Plume Artisanale
# Démarre le backend et le frontend en local

Write-Host "🚀 Démarrage du système ERP La Plume Artisanale..." -ForegroundColor Cyan
Write-Host ""

# Arrêter les processus Node.js existants
Write-Host "🛑 Arrêt des processus Node.js existants..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Vérifier que le port 5000 est libre
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "⚠️  Le port 5000 est déjà utilisé. Arrêt des processus..." -ForegroundColor Yellow
    $port5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

# Vérifier que le port 3000 est libre
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Le port 3000 est déjà utilisé. Arrêt des processus..." -ForegroundColor Yellow
    $port3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

# Démarrage du backend
Write-Host ""
Write-Host "📦 Démarrage du Backend (port 5000)..." -ForegroundColor Green
$backendPath = Join-Path $PSScriptRoot "backend"
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $backendPath -PassThru -WindowStyle Minimized

# Attendre que le backend démarre
Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Vérifier que le backend répond
$backendReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend démarré avec succès sur http://localhost:5000" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "⚠️  Le backend semble prendre plus de temps à démarrer..." -ForegroundColor Yellow
    Write-Host "   Vérifiez les logs dans la fenêtre du backend" -ForegroundColor Yellow
}

# Démarrage du frontend
Write-Host ""
Write-Host "🎨 Démarrage du Frontend (port 3000)..." -ForegroundColor Green
$frontendPath = Join-Path $PSScriptRoot "frontend"
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $frontendPath -PassThru -WindowStyle Minimized

# Attendre que le frontend démarre
Write-Host "⏳ Attente du démarrage du frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Système démarré !" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "📍 API Docs: http://localhost:5000/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pour arrêter les serveurs, fermez les fenêtres ou utilisez Ctrl+C" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Garder le script actif pour voir les logs
Write-Host "Appuyez sur Ctrl+C pour arrêter les serveurs..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host ""
    Write-Host "🛑 Arrêt des serveurs..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Serveurs arrêtés" -ForegroundColor Green
}
