# Script automatique pour obtenir un token et tester les API Odoo
# Usage: .\test-api-automatique.ps1

$baseUrl = "http://localhost:5000"
$tokenFile = "$PSScriptRoot\token.txt"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST AUTOMATIQUE DES API ODOO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour obtenir un token
function Get-Token {
    Write-Host "1. OBTENIR UN TOKEN D'AUTHENTIFICATION" -ForegroundColor Yellow
    Write-Host ""
    
    # Vérifier si un token existe déjà
    if (Test-Path $tokenFile) {
        $existingToken = Get-Content $tokenFile -Raw -Encoding utf8
        $existingToken = $existingToken.Trim()
        
        if ($existingToken) {
            Write-Host "✅ Token existant trouvé dans token.txt" -ForegroundColor Green
            Write-Host "   Test du token existant..." -ForegroundColor Gray
            
            # Tester si le token est toujours valide
            try {
                $headers = @{
                    "Authorization" = "Bearer $existingToken"
                }
                $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Get -Headers $headers -ErrorAction Stop
                Write-Host "✅ Token valide !" -ForegroundColor Green
                Write-Host ""
                return $existingToken
            } catch {
                Write-Host "⚠️  Token invalide ou expiré, obtention d'un nouveau token..." -ForegroundColor Yellow
            }
        }
    }
    
    # Demander les credentials
    Write-Host "Veuillez entrer vos identifiants:" -ForegroundColor Cyan
    $email = Read-Host "Email"
    $password = Read-Host "Mot de passe" -AsSecureString
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
            -Body $body `
            -ErrorAction Stop
        
        if ($response.success -and $response.data.token) {
            $token = $response.data.token
            Write-Host "✅ Token obtenu avec succès !" -ForegroundColor Green
            Write-Host ""
            Write-Host "Utilisateur: $($response.data.user.email) ($($response.data.user.role))" -ForegroundColor Gray
            
            # Sauvegarder le token
            $token | Out-File -FilePath $tokenFile -Encoding utf8 -NoNewline
            Write-Host "✅ Token sauvegardé dans token.txt" -ForegroundColor Green
            Write-Host ""
            return $token
        } else {
            Write-Host "❌ Erreur: Token non reçu dans la réponse" -ForegroundColor Red
            return $null
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
            } elseif ($statusCode -eq 500) {
                Write-Host "Erreur 500: Problème serveur ou base de données" -ForegroundColor Yellow
            }
            
            # Essayer de lire le message d'erreur
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                $reader.Close()
                Write-Host ""
                Write-Host "Details: $responseBody" -ForegroundColor Gray
            } catch {
                # Ignorer si on ne peut pas lire
            }
        } else {
            Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            Write-Host "Vérifiez que:" -ForegroundColor Yellow
            Write-Host "  - Le serveur est démarré (npm start)" -ForegroundColor White
            Write-Host "  - Le serveur écoute sur le port 5000" -ForegroundColor White
        }
        return $null
    }
}

# Fonction pour tester les API
function Test-OdooAPIs {
    param($token)
    
    Write-Host "2. TESTER LES API ODOO" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $token) {
        Write-Host "❌ Pas de token disponible pour tester les API" -ForegroundColor Red
        return
    }
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $testsPassed = 0
    $testsFailed = 0
    
    # Test 1: Lister les commandes de vente
    Write-Host "   Test 1/6: GET /api/odoo/sale.order" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Get -Headers $headers -ErrorAction Stop
        if ($response -is [Array]) {
            Write-Host "      ✅ Succès: $($response.Count) commandes trouvées" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "      ✅ Succès: Réponse reçue" -ForegroundColor Green
            $testsPassed++
        }
    } catch {
        Write-Host "      ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    
    # Test 2: Lister les produits
    Write-Host "   Test 2/6: GET /api/odoo/product.template" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/product.template" -Method Get -Headers $headers -ErrorAction Stop
        if ($response -is [Array]) {
            Write-Host "      ✅ Succès: $($response.Count) produits trouvés" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "      ✅ Succès: Réponse reçue" -ForegroundColor Green
            $testsPassed++
        }
    } catch {
        Write-Host "      ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    
    # Test 3: Lister les livraisons
    Write-Host "   Test 3/6: GET /api/odoo/stock.picking" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/stock.picking" -Method Get -Headers $headers -ErrorAction Stop
        if ($response -is [Array]) {
            Write-Host "      ✅ Succès: $($response.Count) livraisons trouvées" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "      ✅ Succès: Réponse reçue" -ForegroundColor Green
            $testsPassed++
        }
    } catch {
        Write-Host "      ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    
    # Test 4: Lister les ordres de fabrication
    Write-Host "   Test 4/6: GET /api/odoo/mrp.production" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/mrp.production" -Method Get -Headers $headers -ErrorAction Stop
        if ($response -is [Array]) {
            Write-Host "      ✅ Succès: $($response.Count) ordres de fabrication trouvés" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "      ✅ Succès: Réponse reçue" -ForegroundColor Green
            $testsPassed++
        }
    } catch {
        Write-Host "      ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    
    # Test 5: Lister les factures
    Write-Host "   Test 5/6: GET /api/odoo/account.move" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/account.move" -Method Get -Headers $headers -ErrorAction Stop
        if ($response -is [Array]) {
            Write-Host "      ✅ Succès: $($response.Count) factures trouvées" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "      ✅ Succès: Réponse reçue" -ForegroundColor Green
            $testsPassed++
        }
    } catch {
        Write-Host "      ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
    
    # Test 6: Créer une commande de test
    Write-Host "   Test 6/6: POST /api/odoo/sale.order (créer une commande)" -ForegroundColor Cyan
    try {
        $orderName = "SO-TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
        $body = @{
            name = $orderName
            partner_id = 1
            state = "draft"
            date_order = (Get-Date).ToUniversalTime().ToString("o")
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "      ✅ Succès: Commande créée (ID: $($response.id), Nom: $($response.name))" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "      ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 400) {
                Write-Host "      Erreur de validation - verifiez que partner_id=1 existe" -ForegroundColor Yellow
            }
        }
        $testsFailed++
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "RÉSULTATS DES TESTS" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "   Tests réussis: $testsPassed" -ForegroundColor Green
    Write-Host "   Tests échoués: $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
    
    if ($testsPassed -eq 6) {
        Write-Host "🎉 TOUS LES TESTS SONT PASSÉS !" -ForegroundColor Green
    } elseif ($testsPassed -gt 0) {
        Write-Host "⚠️  Certains tests ont échoué" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Tous les tests ont échoué" -ForegroundColor Red
    }
    Write-Host ""
}

# Programme principal
try {
    # Obtenir un token
    $token = Get-Token
    
    if ($token) {
        # Tester les API
        Test-OdooAPIs -token $token
    } else {
        Write-Host ""
        Write-Host "❌ Impossible de continuer sans token" -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur inattendue: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host 'Pour plus de details, consultez: GUIDE_TESTER_API_ODOO.md' -ForegroundColor Cyan
Write-Host ''
