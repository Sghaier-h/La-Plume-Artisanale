# Script PowerShell pour transférer la configuration Nginx sur le serveur

$SERVER = "ubuntu@137.74.40.191"
$CONFIG_FILE = "NGINX_CONFIG_CORRECTE.conf"
$REMOTE_PATH = "/tmp/fabrication_nginx.conf"

Write-Host "📤 Transfert de la configuration Nginx..." -ForegroundColor Cyan

# Transférer le fichier
scp $CONFIG_FILE ${SERVER}:$REMOTE_PATH

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Fichier transféré avec succès" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Maintenant, connectez-vous au serveur et exécutez :" -ForegroundColor Yellow
    Write-Host "   ssh $SERVER" -ForegroundColor White
    Write-Host "   sudo cp $REMOTE_PATH /etc/nginx/sites-available/fabrication" -ForegroundColor White
    Write-Host "   sudo nginx -t" -ForegroundColor White
    Write-Host "   sudo systemctl reload nginx" -ForegroundColor White
} else {
    Write-Host "❌ Erreur lors du transfert" -ForegroundColor Red
}
