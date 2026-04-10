# Script pour diagnostiquer les problemes SSH

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC DE LA CONNEXION SSH" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verifier que SSH est disponible
Write-Host "1. Verification de SSH..." -ForegroundColor Blue
try {
    $sshVersion = ssh -V 2>&1
    Write-Host "   SSH disponible: $sshVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR: SSH non disponible" -ForegroundColor Red
    Write-Host "   Installez OpenSSH depuis les parametres Windows" -ForegroundColor Yellow
    exit 1
}

# Test 2: Tester la connexion SSH de base
Write-Host ""
Write-Host "2. Test de connexion SSH au serveur..." -ForegroundColor Blue
Write-Host "   Serveur: ubuntu@137.74.40.191" -ForegroundColor White
Write-Host "   (Ce test peut prendre quelques secondes)" -ForegroundColor Yellow

$testResult = Test-NetConnection -ComputerName 137.74.40.191 -Port 22 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($testResult) {
    Write-Host "   Port 22 (SSH): OUVERT" -ForegroundColor Green
} else {
    Write-Host "   Port 22 (SSH): FERME ou INACCESSIBLE" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Solutions:" -ForegroundColor Yellow
    Write-Host "   1. Verifier votre connexion internet" -ForegroundColor White
    Write-Host "   2. Verifier que le firewall n bloque pas le port 22" -ForegroundColor White
    Write-Host "   3. Verifier que l IP du serveur est correcte" -ForegroundColor White
    exit 1
}

# Test 3: Verifier les cles SSH
Write-Host ""
Write-Host "3. Verification des cles SSH..." -ForegroundColor Blue
$sshKeyPath = "$env:USERPROFILE\.ssh"
if (Test-Path $sshKeyPath) {
    Write-Host "   Dossier .ssh trouve: $sshKeyPath" -ForegroundColor Green
    $keys = Get-ChildItem -Path $sshKeyPath -Filter "id_*" -ErrorAction SilentlyContinue
    if ($keys) {
        Write-Host "   Cles SSH trouvees:" -ForegroundColor Green
        foreach ($key in $keys) {
            Write-Host "     - $($key.Name)" -ForegroundColor White
        }
    } else {
        Write-Host "   Aucune cle SSH trouvee" -ForegroundColor Yellow
        Write-Host "   Vous devrez peut-etre utiliser un mot de passe" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Dossier .ssh non trouve" -ForegroundColor Yellow
    Write-Host "   Creation du dossier..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $sshKeyPath -Force | Out-Null
}

# Test 4: Essayer une connexion SSH avec verbose
Write-Host ""
Write-Host "4. Test de connexion SSH (mode verbose)..." -ForegroundColor Blue
Write-Host "   (Appuyez sur Ctrl+C si demande un mot de passe)" -ForegroundColor Yellow
Write-Host ""

# Commande SSH avec verbose pour voir les erreurs
Write-Host "Commande a executer:" -ForegroundColor Cyan
Write-Host "  ssh -v ubuntu@137.74.40.191" -ForegroundColor White
Write-Host ""
Write-Host "Si cela fonctionne, essayez ensuite:" -ForegroundColor Yellow
Write-Host "  ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N" -ForegroundColor White
Write-Host ""

# Proposer de tester
$response = Read-Host "Voulez-vous tester la connexion SSH maintenant ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "Lancement du test SSH..." -ForegroundColor Blue
    ssh -v ubuntu@137.74.40.191
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "SOLUTIONS POSSIBLES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si la connexion SSH echoue:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifier les identifiants SSH:" -ForegroundColor White
Write-Host "   - Utilisateur: ubuntu" -ForegroundColor Gray
Write-Host "   - Serveur: 137.74.40.191" -ForegroundColor Gray
Write-Host "   - Port: 22" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Verifier la cle SSH:" -ForegroundColor White
Write-Host "   - Fichier: $env:USERPROFILE\.ssh\id_rsa" -ForegroundColor Gray
Write-Host "   - Ou utiliser: ssh -i chemin/vers/cle ubuntu@137.74.40.191" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Essayer avec mot de passe:" -ForegroundColor White
Write-Host "   ssh ubuntu@137.74.40.191" -ForegroundColor Gray
Write-Host "   (Vous serez demande le mot de passe)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verifier les permissions du serveur:" -ForegroundColor White
Write-Host "   - Votre IP est-elle autorisee ?" -ForegroundColor Gray
Write-Host "   - Le serveur SSH est-il actif ?" -ForegroundColor Gray
Write-Host ""
