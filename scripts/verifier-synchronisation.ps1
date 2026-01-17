# Script PowerShell pour vérifier la synchronisation entre serveur, PC local et Git
# Usage: .\scripts\verifier-synchronisation.ps1

$PROJECT_DIR = "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$SERVEUR_SSH = "ubuntu@137.74.40.191"
$SERVEUR_DIR = "/opt/fouta-erp"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 VÉRIFICATION DE SYNCHRONISATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Git Local
Write-Host "1️⃣ VÉRIFICATION GIT LOCAL" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray
Set-Location $PROJECT_DIR

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Modifications locales non commitées:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "✅ Aucune modification locale non commitée" -ForegroundColor Green
}

$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main 2>$null

if ($remoteCommit) {
    if ($localCommit -eq $remoteCommit) {
        Write-Host "✅ Local est à jour avec origin/main" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Local n'est pas à jour avec origin/main" -ForegroundColor Yellow
        Write-Host "   Local:  $($localCommit.Substring(0,7))" -ForegroundColor Gray
        Write-Host "   Remote: $($remoteCommit.Substring(0,7))" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Impossible de récupérer origin/main" -ForegroundColor Yellow
}

Write-Host "   Commit local: $($localCommit.Substring(0,7))" -ForegroundColor Gray
Write-Host ""

# 2. Vérifier Git Remote
Write-Host "2️⃣ VÉRIFICATION GIT REMOTE (GitHub)" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

git fetch origin 2>&1 | Out-Null
$remoteCommit = git rev-parse origin/main 2>$null

if ($remoteCommit) {
    Write-Host "✅ Dernier commit sur GitHub: $($remoteCommit.Substring(0,7))" -ForegroundColor Green
    
    $ahead = git rev-list --count origin/main..HEAD 2>$null
    $behind = git rev-list --count HEAD..origin/main 2>$null
    
    if ($ahead -gt 0) {
        Write-Host "⚠️  $ahead commit(s) local(aux) non poussé(s)" -ForegroundColor Yellow
    }
    if ($behind -gt 0) {
        Write-Host "⚠️  $behind commit(s) en retard sur origin/main" -ForegroundColor Yellow
    }
    if ($ahead -eq 0 -and $behind -eq 0) {
        Write-Host "✅ Local synchronisé avec GitHub" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Impossible de récupérer origin/main" -ForegroundColor Red
}

Write-Host ""

# 3. Vérifier Serveur (via SSH)
Write-Host "3️⃣ VÉRIFICATION SERVEUR" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

try {
    $serverCommit = ssh $SERVEUR_SSH "cd $SERVEUR_DIR && git rev-parse HEAD 2>/dev/null" 2>$null
    
    if ($serverCommit) {
        $serverCommit = $serverCommit.Trim()
        Write-Host "✅ Commit serveur: $($serverCommit.Substring(0,7))" -ForegroundColor Green
        
        if ($serverCommit -eq $remoteCommit) {
            Write-Host "✅ Serveur synchronisé avec GitHub" -ForegroundColor Green
        } elseif ($serverCommit -eq $localCommit) {
            Write-Host "⚠️  Serveur synchronisé avec local (mais pas avec GitHub)" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️  Serveur n'est pas synchronisé" -ForegroundColor Yellow
            Write-Host "   Serveur: $($serverCommit.Substring(0,7))" -ForegroundColor Gray
            Write-Host "   GitHub:  $($remoteCommit.Substring(0,7))" -ForegroundColor Gray
        }
        
        # Vérifier les modifications non commitées sur le serveur
        $serverStatus = ssh $SERVEUR_SSH "cd $SERVEUR_DIR && git status --porcelain 2>/dev/null" 2>$null
        if ($serverStatus -and $serverStatus.Trim()) {
            Write-Host "⚠️  Modifications non commitées sur le serveur:" -ForegroundColor Yellow
            $serverStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-Host "✅ Aucune modification non commitée sur le serveur" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Impossible de récupérer le commit serveur" -ForegroundColor Red
        Write-Host "   Vérifiez la connexion SSH: ssh $SERVEUR_SSH" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur de connexion SSH: $_" -ForegroundColor Red
    Write-Host "   Vérifiez que vous pouvez vous connecter: ssh $SERVEUR_SSH" -ForegroundColor Gray
}

Write-Host ""

# 4. Résumé
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📋 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$allSynced = $true

if ($localCommit -ne $remoteCommit) {
    Write-Host "⚠️  Local et GitHub ne sont pas synchronisés" -ForegroundColor Yellow
    $allSynced = $false
}

if ($serverCommit -and $serverCommit -ne $remoteCommit) {
    Write-Host "⚠️  Serveur et GitHub ne sont pas synchronisés" -ForegroundColor Yellow
    $allSynced = $false
}

if ($allSynced -and $serverCommit) {
    Write-Host "✅ Tout est synchronisé !" -ForegroundColor Green
    Write-Host "   Local:  $($localCommit.Substring(0,7))" -ForegroundColor Gray
    Write-Host "   GitHub: $($remoteCommit.Substring(0,7))" -ForegroundColor Gray
    Write-Host "   Serveur: $($serverCommit.Substring(0,7))" -ForegroundColor Gray
} elseif (-not $serverCommit) {
    Write-Host "⚠️  Impossible de vérifier le serveur" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Mettre à jour local: git pull origin main" -ForegroundColor Gray
Write-Host "   - Pousser vers GitHub: git push origin main" -ForegroundColor Gray
Write-Host "   - Mettre à jour serveur: ssh $SERVEUR_SSH 'cd $SERVEUR_DIR && git pull origin main'" -ForegroundColor Gray
Write-Host ""
