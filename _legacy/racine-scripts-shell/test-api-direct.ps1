# Script pour tester l'API directement

Write-Host "Test de l'API VPS..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "1. Test Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "https://fabrication.laplume-artisanale.tn/health" -Method GET -UseBasicParsing
    Write-Host "[OK] Health check OK: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Health check echoue: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Login
Write-Host "2. Test Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@system.local"
        password = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "https://fabrication.laplume-artisanale.tn/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    
    if ($loginResponse.success) {
        Write-Host "[OK] Login reussi!" -ForegroundColor Green
        Write-Host "   Token: $($loginResponse.data.token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "   User: $($loginResponse.data.user.email) ($($loginResponse.data.user.role))" -ForegroundColor Gray
    } else {
        Write-Host "[ERREUR] Login echoue: $($loginResponse.error.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERREUR] Login echoue: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Reponse: $responseBody" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "Tests termines." -ForegroundColor Cyan
