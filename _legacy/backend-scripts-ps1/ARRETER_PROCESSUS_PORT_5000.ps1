# Script pour arrêter le processus utilisant le port 5000

Write-Host "🔍 Recherche du processus utilisant le port 5000..." -ForegroundColor Yellow

# Trouver le processus utilisant le port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    $processId = $process
    $processInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($processInfo) {
        Write-Host "📋 Processus trouvé:" -ForegroundColor Cyan
        Write-Host "   PID: $processId" -ForegroundColor White
        Write-Host "   Nom: $($processInfo.ProcessName)" -ForegroundColor White
        Write-Host "   Chemin: $($processInfo.Path)" -ForegroundColor White
        
        $response = Read-Host "❓ Voulez-vous arrêter ce processus ? (O/N)"
        
        if ($response -eq 'O' -or $response -eq 'o' -or $response -eq 'Y' -or $response -eq 'y') {
            try {
                Stop-Process -Id $processId -Force
                Write-Host "✅ Processus arrêté avec succès !" -ForegroundColor Green
                Write-Host "🚀 Vous pouvez maintenant redémarrer le serveur avec: npm start" -ForegroundColor Green
            } catch {
                Write-Host "❌ Erreur lors de l'arrêt du processus: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  Processus non arrêté. Changez le port dans .env ou arrêtez manuellement le processus." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Processus trouvé mais informations non disponibles." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Aucun processus n'utilise le port 5000." -ForegroundColor Green
    Write-Host "🚀 Vous pouvez démarrer le serveur avec: npm start" -ForegroundColor Green
}

Write-Host "`n💡 Astuce: Pour changer le port, modifiez PORT dans le fichier .env" -ForegroundColor Cyan
