# ============================================================
# SCRIPT POUR LIBÉRER LE PORT 5000
# ============================================================
# Ce script tue tous les processus utilisant le port 5000
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 LIBÉRATION DU PORT 5000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le port 5000 est utilisé
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($null -eq $connections -or $connections.Count -eq 0) {
    Write-Host "✅ Le port 5000 n'est pas utilisé." -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host "⚠️  Port 5000 utilisé par les processus suivants:" -ForegroundColor Yellow
Write-Host ""

# Lister les processus
$processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    try {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "   PID: $pid - Nom: $($proc.ProcessName) - Chemin: $($proc.Path)" -ForegroundColor White
        }
    } catch {
        Write-Host "   PID: $pid - Processus inconnu" -ForegroundColor Gray
    }
}

Write-Host ""
$response = Read-Host "Voulez-vous arrêter ces processus ? (O/N)"

if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🛑 Arrêt des processus..." -ForegroundColor Yellow
    
    $stopped = 0
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "   ✅ Processus $pid arrêté" -ForegroundColor Green
            $stopped++
        } catch {
            Write-Host "   ❌ Impossible d'arrêter le processus $pid : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    if ($stopped -gt 0) {
        Write-Host "✅ $stopped processus arrêté(s). Le port 5000 devrait être libre." -ForegroundColor Green
    } else {
        Write-Host "❌ Aucun processus n'a pu être arrêté." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Opération annulée." -ForegroundColor Yellow
}

Write-Host ""
