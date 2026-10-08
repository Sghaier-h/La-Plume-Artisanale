# Script pour obtenir un token d'authentification
# Usage: .\obtenir-token.ps1

$baseUrl = "http://localhost:5000"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "OBTENIR UN TOKEN D'AUTHENTIFICATION" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Demander les credentials
$email = Read-Host "Entrez votre email"
$password = Read-Host "Entrez votre mot de passe" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "Connexion en cours..." -ForegroundColor Yellow

try {
    # Créer le body de la requête
    $body = @{
        email = $email
        password = $passwordPlain
    } | ConvertTo-Json

    # Faire la requête POST
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body

    if ($response.success -and $response.data.token) {
        Write-Host ""
        Write-Host "✅ TOKEN OBTENU AVEC SUCCÈS !" -ForegroundColor Green
        Write-Host ""
        Write-Host "Token:" -ForegroundColor Yellow
        Write-Host $response.data.token -ForegroundColor White
        Write-Host ""
        Write-Host "Utilisateur:" -ForegroundColor Yellow
        Write-Host "  - ID: $($response.data.user.id)" -ForegroundColor White
        Write-Host "  - Email: $($response.data.user.email)" -ForegroundColor White
        Write-Host "  - Role: $($response.data.user.role)" -ForegroundColor White
        Write-Host ""
        
        # Sauvegarder le token dans un fichier temporaire
        $tokenFile = "$PSScriptRoot\token.txt"
        $response.data.token | Out-File -FilePath $tokenFile -Encoding utf8 -NoNewline
        Write-Host "✅ Token sauvegardé dans: token.txt" -ForegroundColor Green
        Write-Host ""
        Write-Host "Vous pouvez maintenant utiliser ce token pour tester les API:" -ForegroundColor Cyan
        Write-Host "  .\test-api-odoo.ps1" -ForegroundColor White
        Write-Host ""
        Write-Host "OU copiez-le directement:" -ForegroundColor Cyan
        Write-Host $response.data.token -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ Erreur: Token non reçu dans la réponse" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERREUR LORS DE LA CONNEXION" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Code d'erreur: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "Erreur 401: Email ou mot de passe incorrect" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Vérifiez vos identifiants ou utilisez un compte valide." -ForegroundColor Yellow
        } elseif ($statusCode -eq 500) {
            Write-Host "Erreur 500: Problème serveur" -ForegroundColor Yellow
            Write-Host "Vérifiez que le serveur est démarré et que la base de données est accessible." -ForegroundColor Yellow
        }
        
        # Essayer de lire le message d'erreur de la réponse
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host ""
            Write-Host "Détails:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Gray
        } catch {
            # Ignorer si on ne peut pas lire la réponse
        }
    } else {
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Vérifiez que:" -ForegroundColor Yellow
        Write-Host "  - Le serveur est démarré (npm start)" -ForegroundColor White
        Write-Host "  - Le serveur écoute sur le port 5000" -ForegroundColor White
        Write-Host "  - Vous avez un compte utilisateur valide" -ForegroundColor White
    }
    Write-Host ""
}
