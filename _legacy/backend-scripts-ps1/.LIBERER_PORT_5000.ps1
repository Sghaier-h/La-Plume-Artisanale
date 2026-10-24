# Script PowerShell pour libérer le port 5000

Write-Host "`n=== Libération du port 5000 ===" -ForegroundColor Cyan

# Trouver les processus utilisant le port 5000
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($connections) {
    Write-Host "`nProcessus utilisant le port 5000:" -ForegroundColor Yellow
    $connections | ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  - PID: $($_.OwningProcess) | Nom: $($process.Name) | Chemin: $($process.Path)" -ForegroundColor White
        }
    }
    
    Write-Host "`nArrêt des processus..." -ForegroundColor Yellow
    $connections | ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
            Write-Host "  ✅ Processus $($_.OwningProcess) arrêté" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Impossible d'arrêter le processus $($_.OwningProcess): $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ Port 5000 libéré" -ForegroundColor Green
} else {
    Write-Host "`n✅ Aucun processus n'utilise le port 5000" -ForegroundColor Green
}

Write-Host "`nVous pouvez maintenant redémarrer le serveur avec: npm start`n" -ForegroundColor Cyan
