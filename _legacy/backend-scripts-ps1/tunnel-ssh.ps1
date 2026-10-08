# Script PowerShell pour créer un tunnel SSH vers PostgreSQL

Write-Host "🔗 Création d'un tunnel SSH vers PostgreSQL OVH..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$vpsHost = "137.74.40.191"
$vpsUser = "ubuntu"
$dbHost = "sh131616-002.eu.clouddb.ovh.net"
$dbPort = "35392"
$localPort = "5433"  # Utiliser 5433 au lieu de 5432 (évite les permissions admin)

Write-Host "📋 Configuration du tunnel:" -ForegroundColor Cyan
Write-Host "   VPS: $vpsUser@$vpsHost" -ForegroundColor White
Write-Host "   Base de données: $dbHost:$dbPort" -ForegroundColor White
Write-Host "   Port local: $localPort" -ForegroundColor White
Write-Host ""

# Vérifier si SSH est disponible
try {
    $sshVersion = ssh -V 2>&1
    Write-Host "✅ SSH détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ SSH n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez OpenSSH depuis les paramètres Windows" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Création du tunnel SSH..." -ForegroundColor Yellow
Write-Host "⚠️  Ce terminal doit rester ouvert pendant que vous développez" -ForegroundColor Yellow
Write-Host "💡 Appuyez sur Ctrl+C pour arrêter le tunnel" -ForegroundColor Yellow
Write-Host ""

# Commande SSH pour créer le tunnel
$sshCommand = "ssh -L $localPort`:$dbHost`:$dbPort $vpsUser@$vpsHost -N -v"

Write-Host "📝 Commande: $sshCommand" -ForegroundColor Cyan
Write-Host ""

# Créer le tunnel
try {
    Invoke-Expression $sshCommand
} catch {
    Write-Host "❌ Erreur lors de la création du tunnel: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions:" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que vous avez accès SSH au VPS" -ForegroundColor White
    Write-Host "   2. Vérifiez que la clé SSH est configurée" -ForegroundColor White
    Write-Host "   3. Testez la connexion SSH: ssh $vpsUser@$vpsHost" -ForegroundColor White
    exit 1
}
