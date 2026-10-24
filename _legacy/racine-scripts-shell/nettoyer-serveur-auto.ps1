# Script PowerShell pour nettoyer et organiser le serveur automatiquement

$SERVER = "ubuntu@137.74.40.191"
$PROJECT_DIR = "/opt/fouta-erp"

Write-Host "Nettoyage et organisation automatique du serveur..." -ForegroundColor Cyan
Write-Host ""

# Fonction pour executer une commande SSH
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    Write-Host "Execution: $Command" -ForegroundColor Gray
    $result = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER $Command 2>&1
    return $result
}

# 1. Mettre a jour depuis GitHub
Write-Host "Mise a jour depuis GitHub..." -ForegroundColor Yellow
$updateCmd = "cd $PROJECT_DIR; bash scripts/update-server.sh"
$updateResult = Invoke-SSHCommand -Command $updateCmd
Write-Host $updateResult

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la mise a jour" -ForegroundColor Red
    Write-Host "Continuez quand meme..." -ForegroundColor Yellow
}

Write-Host "Mise a jour terminee" -ForegroundColor Green
Write-Host ""

# 2. Rendre les scripts executables
Write-Host "Configuration des permissions..." -ForegroundColor Yellow
$chmodCmd = "cd $PROJECT_DIR; chmod +x scripts/nettoyer-serveur.sh scripts/organiser-serveur.sh"
$chmodResult = Invoke-SSHCommand -Command $chmodCmd
Write-Host $chmodResult

# 3. Executer le nettoyage
Write-Host "Execution du nettoyage..." -ForegroundColor Yellow
$cleanCmd = "cd $PROJECT_DIR; bash scripts/nettoyer-serveur.sh"
$cleanResult = Invoke-SSHCommand -Command $cleanCmd
Write-Host $cleanResult

if ($LASTEXITCODE -ne 0) {
    Write-Host "Avertissement lors du nettoyage (peut etre normal)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Executer l'organisation
Write-Host "Organisation de la structure..." -ForegroundColor Yellow
$orgCmd = "cd $PROJECT_DIR; bash scripts/organiser-serveur.sh"
$orgResult = Invoke-SSHCommand -Command $orgCmd
Write-Host $orgResult

if ($LASTEXITCODE -ne 0) {
    Write-Host "Avertissement lors de l'organisation (peut etre normal)" -ForegroundColor Yellow
}

Write-Host ""

# 5. Verifier la structure
Write-Host "Verification de la structure..." -ForegroundColor Yellow
$checkCmd = "cd $PROJECT_DIR; ls -la docs/ 2>/dev/null; echo '---'; ls -1 database/*.sql 2>/dev/null | wc -l"
$structure = Invoke-SSHCommand -Command $checkCmd
Write-Host $structure

# 6. Redemarrer l'application
Write-Host ""
Write-Host "Redemarrage de l'application..." -ForegroundColor Yellow
$restartCmd = "cd $PROJECT_DIR/backend; pm2 restart fouta-api"
$restartResult = Invoke-SSHCommand -Command $restartCmd
Write-Host $restartResult

if ($LASTEXITCODE -eq 0) {
    Write-Host "Application redemarree" -ForegroundColor Green
} else {
    Write-Host "Erreur lors du redemarrage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Nettoyage et organisation termines !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour verifier manuellement:" -ForegroundColor Cyan
Write-Host "  ssh $SERVER" -ForegroundColor White
Write-Host "  cd $PROJECT_DIR" -ForegroundColor White
Write-Host "  ls -la docs/" -ForegroundColor White
Write-Host "  ls -1 database/*.sql | wc -l" -ForegroundColor White
