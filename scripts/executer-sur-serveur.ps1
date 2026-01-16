# Script PowerShell pour executer le nettoyage sur le serveur en une seule commande

$SERVER = "ubuntu@137.74.40.191"
$PROJECT_DIR = "/opt/fouta-erp"

Write-Host "Envoi et execution du script sur le serveur..." -ForegroundColor Cyan
Write-Host ""

# Creer le script temporaire sur le serveur
$scriptContent = Get-Content -Path "scripts/nettoyer-et-organiser-serveur.sh" -Raw

# Encoder en base64 pour eviter les problemes de caracteres speciaux
$bytes = [System.Text.Encoding]::UTF8.GetBytes($scriptContent)
$encoded = [Convert]::ToBase64String($bytes)

# Envoyer et executer
$command = @"
cd $PROJECT_DIR
echo '$encoded' | base64 -d > /tmp/nettoyer-et-organiser.sh
chmod +x /tmp/nettoyer-et-organiser.sh
bash /tmp/nettoyer-et-organiser.sh
rm /tmp/nettoyer-et-organiser.sh
"@

Write-Host "Execution en cours..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no $SERVER $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Operation terminee avec succes !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Operation terminee avec des avertissements" -ForegroundColor Yellow
}
