# Script PowerShell pour déployer depuis Windows
# Usage: .\deploy-windows.ps1

$SSH_HOST = "allbyfb@145.239.37.162"
$SSH_PASS = "Allbyfouta007"
$SCRIPT_URL = "https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh"

Write-Host "🚀 Déploiement Automatique depuis Windows" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Vérifier si plink (PuTTY) est disponible
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue

if (-not $plinkPath) {
    Write-Host "❌ PuTTY/plink n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1 : Installer PuTTY" -ForegroundColor Yellow
    Write-Host "  winget install PuTTY.PuTTY" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 2 : Utiliser WSL" -ForegroundColor Yellow
    Write-Host "  wsl bash -c 'ssh allbyfb@145.239.37.162 \"bash <(curl -s $SCRIPT_URL)\"'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 3 : Utiliser Git Bash" -ForegroundColor Yellow
    Write-Host "  Ouvrez Git Bash et exécutez :" -ForegroundColor Cyan
    Write-Host "  ssh allbyfb@145.239.37.162" -ForegroundColor White
    Write-Host "  bash <(curl -s $SCRIPT_URL)" -ForegroundColor White
    exit 1
}

Write-Host "📤 Connexion au serveur et exécution du script..." -ForegroundColor Cyan
Write-Host ""

# Créer un script temporaire
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$scriptContent = @"
bash <(curl -s $SCRIPT_URL)
"@
$scriptContent | Out-File -FilePath $tempScript -Encoding ASCII

# Exécuter via plink
$plinkCommand = "echo `"$SSH_PASS`" | plink -ssh $SSH_HOST -pw `"$SSH_PASS`" -batch `"bash <(curl -s $SCRIPT_URL)`""

try {
    Invoke-Expression $plinkCommand
    Write-Host ""
    Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
    Write-Host "🌐 Testez : curl https://fabrication.laplume-artisanale.tn/health" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Essayez manuellement :" -ForegroundColor Yellow
    Write-Host "  ssh allbyfb@145.239.37.162" -ForegroundColor Cyan
    Write-Host "  bash <(curl -s $SCRIPT_URL)" -ForegroundColor Cyan
}

# Nettoyer
Remove-Item $tempScript -ErrorAction SilentlyContinue

