# Script PowerShell pour tester les API Odoo
# Usage: .\test-api-odoo.ps1

$baseUrl = "http://localhost:5000"
$tokenFile = "$PSScriptRoot\token.txt"

# Vérifier si un token existe dans le fichier
$token = $null
if (Test-Path $tokenFile) {
    $token = Get-Content $tokenFile -Raw -Encoding utf8
    $token = $token.Trim()
    Write-Host "✅ Token trouvé dans token.txt" -ForegroundColor Green
} else {
    $token = Read-Host "Entrez votre token d'authentification (ou laissez vide pour obtenir un token)"
    
    if (-not $token) {
        Write-Host ""
        Write-Host "Pour obtenir un token, exécutez:" -ForegroundColor Cyan
        Write-Host "  .\obtenir-token.ps1" -ForegroundColor White
        Write-Host ""
        Write-Host "Ou utilisez le script automatique:" -ForegroundColor Cyan
        Write-Host "  .\test-api-avec-token.ps1" -ForegroundColor White
        Write-Host ""
        exit
    }
}

if ($token) {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
} else {
    $headers = @{
        "Content-Type" = "application/json"
    }
    Write-Host "⚠️ Test sans token - certaines requêtes peuvent échouer" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST DES API ODOO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Lister les commandes de vente
Write-Host "1. Test GET /api/odoo/sale.order" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Get -Headers $headers
    Write-Host "✅ Succès: $($response.Count) commandes trouvées" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Lister les produits
Write-Host "2. Test GET /api/odoo/product.template" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/product.template" -Method Get -Headers $headers
    Write-Host "✅ Succès: $($response.Count) produits trouvés" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Créer une commande de vente (si token fourni)
if ($token) {
    Write-Host "3. Test POST /api/odoo/sale.order" -ForegroundColor Yellow
    try {
        $body = @{
            name = "SO-TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
            partner_id = 1
            state = "draft"
            date_order = (Get-Date).ToUniversalTime().ToString("o")
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/odoo/sale.order" -Method Post -Headers $headers -Body $body
        Write-Host "✅ Succès: Commande créée avec ID $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "3. Test POST ignoré (token requis)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TESTS TERMINES" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour plus de détails, consultez: GUIDE_TESTER_API_ODOO.md" -ForegroundColor Cyan
Write-Host ""
