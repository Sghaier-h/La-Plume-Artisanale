# Script PowerShell pour tester les API Odoo avec token automatique
# Usage: .\test-api-avec-token.ps1

$baseUrl = "http://localhost:5000"
$tokenFile = "$PSScriptRoot\token.txt"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST DES API ODOO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si un token existe dans le fichier
$token = $null
if (Test-Path $tokenFile) {
    $token = Get-Content $tokenFile -Raw -Encoding utf8
    $token = $token.Trim()
    Write-Host "✅ Token trouvé dans token.txt" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aucun token trouvé" -ForegroundColor Yellow
    Write-Host ""
    $useExisting = Read-Host "Voulez-vous entrer un token manuellement ? (o/n)"
    if ($useExisting -eq "o" -or $useExisting -eq "O") {
        $token = Read-Host "Entrez votre token"
    } else {
        Write-Host ""
        Write-Host "Pour obtenir un token, exécutez:" -ForegroundColor Cyan
        Write-Host "  .\obtenir-token.ps1" -ForegroundColor White
        Write-Host ""
        exit
    }
}

if (-not $token) {
    Write-Host "❌ Token requis pour tester les API" -ForegroundColor Red
    Write-Host ""
    Write-Host "Exécutez d'abord: .\obtenir-token.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""

# Test 1: Lister les commandes de vente
Write-Host "1. Test GET /api/odoo/sale.order" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Get -Headers $headers
    if ($response -is [Array]) {
        Write-Host "✅ Succès: $($response.Count) commandes trouvées" -ForegroundColor Green
        if ($response.Count -gt 0) {
            Write-Host "   Première commande: $($response[0].name) - $($response[0].state)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ Succès: Réponse reçue" -ForegroundColor Green
        Write-Host $response | ConvertTo-Json -Depth 2 -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Code: $statusCode" -ForegroundColor Red
        if ($statusCode -eq 401) {
            Write-Host "   Token invalide ou expiré. Obtenez un nouveau token avec: .\obtenir-token.ps1" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Test 2: Lister les produits
Write-Host "2. Test GET /api/odoo/product.template" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/product.template" -Method Get -Headers $headers
    if ($response -is [Array]) {
        Write-Host "✅ Succès: $($response.Count) produits trouvés" -ForegroundColor Green
        if ($response.Count -gt 0) {
            Write-Host "   Premier produit: $($response[0].name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ Succès: Réponse reçue" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Créer une commande de vente
Write-Host "3. Test POST /api/odoo/sale.order (créer une commande)" -ForegroundColor Yellow
try {
    $orderName = "SO-TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $body = @{
        name = $orderName
        partner_id = 1
        state = "draft"
        date_order = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Succès: Commande créée" -ForegroundColor Green
    Write-Host "   ID: $($response.id)" -ForegroundColor Gray
    Write-Host "   Nom: $($response.name)" -ForegroundColor Gray
    Write-Host "   État: $($response.state)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Code: $statusCode" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "   Détails: $responseBody" -ForegroundColor Gray
        } catch {
            # Ignorer si on ne peut pas lire la réponse
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TESTS TERMINÉS" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour plus de détails, consultez: GUIDE_TESTER_API_ODOO.md" -ForegroundColor Cyan
Write-Host ""
