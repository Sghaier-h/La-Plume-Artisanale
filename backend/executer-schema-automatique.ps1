# Script PowerShell pour executer automatiquement le schema de pointage
# Cree le tunnel SSH si necessaire, puis execute le script SQL

Write-Host "Execution automatique du schema de pointage TimeMoto" -ForegroundColor Cyan
Write-Host ""

# Configuration
$dbHost = "localhost"
$dbPort = 5433
$scriptPath = Join-Path $PSScriptRoot "executer-schema-pointage.js"

# Fonction pour verifier si le tunnel est actif
function Test-Tunnel {
    $connection = Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Verifier si le tunnel est deja actif
Write-Host "Verification du tunnel SSH..." -ForegroundColor Yellow
if (Test-Tunnel) {
    Write-Host "Tunnel SSH deja actif sur le port $dbPort" -ForegroundColor Green
    $tunnelActif = $true
} else {
    Write-Host "Tunnel SSH non actif" -ForegroundColor Yellow
    Write-Host "Tentative de creation du tunnel en arriere-plan..." -ForegroundColor Cyan
    
    # Creer le tunnel SSH en arriere-plan
    $vpsHost = "137.74.40.191"
    $vpsUser = "ubuntu"
    $dbHostRemote = "sh131616-002.eu.clouddb.ovh.net"
    $dbPortRemote = "35392"
    
    try {
        Start-Process -FilePath "ssh" -ArgumentList "-L", "${dbPort}:${dbHostRemote}:${dbPortRemote}", "${vpsUser}@${vpsHost}", "-N", "-f" -WindowStyle Hidden -ErrorAction Stop
        Write-Host "Attente de l'etablissement du tunnel..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Verifier a nouveau
        $tentatives = 0
        $maxTentatives = 10
        while (-not (Test-Tunnel) -and $tentatives -lt $maxTentatives) {
            $tentatives++
            Write-Host "   Tentative $tentatives/$maxTentatives..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
        
        if (Test-Tunnel) {
            Write-Host "Tunnel SSH cree avec succes" -ForegroundColor Green
            $tunnelActif = $true
        } else {
            Write-Host "Impossible de creer le tunnel SSH automatiquement" -ForegroundColor Red
            Write-Host "Veuillez creer le tunnel manuellement" -ForegroundColor Yellow
            $tunnelActif = $false
        }
    } catch {
        Write-Host "Erreur lors de la creation du tunnel: $_" -ForegroundColor Red
        $tunnelActif = $false
    }
}

# Si le tunnel est actif, executer le script SQL
if ($tunnelActif) {
    Write-Host ""
    Write-Host "Execution du script SQL..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        # Executer le script Node.js
        node $scriptPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Script SQL execute avec succes !" -ForegroundColor Green
            Write-Host ""
            Write-Host "Prochaines etapes :" -ForegroundColor Cyan
            Write-Host "   1. Redemarrer le serveur backend" -ForegroundColor White
            Write-Host "   2. Tester l'endpoint webhook" -ForegroundColor White
            Write-Host "   3. Verifier les webhooks dans TimeMoto" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "Erreur lors de l'execution du script SQL" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "Erreur: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Impossible de continuer sans tunnel SSH actif" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions alternatives :" -ForegroundColor Yellow
    Write-Host "   1. Creer le tunnel manuellement" -ForegroundColor White
    Write-Host "   2. Utiliser pgAdmin pour executer le script SQL" -ForegroundColor White
    exit 1
}
