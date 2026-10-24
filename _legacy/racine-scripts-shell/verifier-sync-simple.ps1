# Script PowerShell simplifie pour verifier la synchronisation
# Usage: .\scripts\verifier-sync-simple.ps1

$PROJECT_DIR = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$SERVEUR_SSH = "ubuntu@137.74.40.191"
$SERVEUR_DIR = "/opt/fouta-erp"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION DE SYNCHRONISATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier Git Local
Write-Host "1. VERIFICATION GIT LOCAL" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray
Set-Location $PROJECT_DIR

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "ATTENTION: Modifications locales non commitees:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "OK: Aucune modification locale non commitee" -ForegroundColor Green
}

$localCommit = git rev-parse HEAD
if ($localCommit) {
    Write-Host "   Commit local: $($localCommit.Substring(0,7))" -ForegroundColor Gray
} else {
    Write-Host "ERREUR: Impossible de recuperer le commit local" -ForegroundColor Red
    exit 1
}

git fetch origin 2>&1 | Out-Null
$remoteCommit = git rev-parse origin/main 2>&1
if ($LASTEXITCODE -eq 0 -and $remoteCommit) {
    Write-Host "   Commit GitHub: $($remoteCommit.Substring(0,7))" -ForegroundColor Gray
    
    if ($localCommit -eq $remoteCommit) {
        Write-Host "OK: Local est a jour avec GitHub" -ForegroundColor Green
    } else {
        Write-Host "ATTENTION: Local n'est pas a jour avec GitHub" -ForegroundColor Yellow
    }
} else {
    Write-Host "ATTENTION: Impossible de recuperer origin/main" -ForegroundColor Yellow
}

Write-Host ""

# 2. Verifier Serveur (via SSH)
Write-Host "2. VERIFICATION SERVEUR" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

$serverCommitCmd = "cd $SERVEUR_DIR; git rev-parse HEAD"
try {
    $serverCommit = ssh $SERVEUR_SSH $serverCommitCmd 2>&1
    if ($LASTEXITCODE -eq 0 -and $serverCommit -and $serverCommit -notmatch "error|Error|ERROR") {
        $serverCommit = $serverCommit.Trim()
        if ($serverCommit.Length -ge 7) {
            Write-Host "OK: Commit serveur: $($serverCommit.Substring(0,7))" -ForegroundColor Green
            
            if ($remoteCommit -and $serverCommit -eq $remoteCommit) {
                Write-Host "OK: Serveur synchronise avec GitHub" -ForegroundColor Green
            } elseif ($serverCommit -eq $localCommit) {
                Write-Host "ATTENTION: Serveur synchronise avec local (mais pas avec GitHub)" -ForegroundColor Yellow
            } else {
                Write-Host "ATTENTION: Serveur n'est pas synchronise" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "ERREUR: Impossible de recuperer le commit serveur" -ForegroundColor Red
        Write-Host "   Verifiez la connexion SSH: ssh $SERVEUR_SSH" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERREUR: Erreur de connexion SSH" -ForegroundColor Red
}

Write-Host ""

# 3. Resume
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESUME" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ($localCommit -and $remoteCommit -and $localCommit -eq $remoteCommit) {
    Write-Host "OK: Local synchronise avec GitHub" -ForegroundColor Green
} else {
    Write-Host "ATTENTION: Local et GitHub ne sont pas synchronises" -ForegroundColor Yellow
    Write-Host "   Commandes: git pull origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Mettre a jour local: git pull origin main" -ForegroundColor Gray
Write-Host "   - Pousser vers GitHub: git push origin main" -ForegroundColor Gray
Write-Host "   - Mettre a jour serveur: ssh $SERVEUR_SSH 'cd $SERVEUR_DIR && git pull origin main'" -ForegroundColor Gray
Write-Host ""
