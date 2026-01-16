# Script pour executer le schema SQL via l'API backend

Write-Host "Execution du schema de pointage via API" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "https://fabrication.laplume-artisanale.tn/api/migration/executer-schema-pointage"
$migrationKey = "temporary-migration-key-2025"

Write-Host "Test de l'endpoint de migration..." -ForegroundColor Yellow
$testResponse = Invoke-RestMethod -Uri "https://fabrication.laplume-artisanale.tn/api/migration/test" -Method GET

if ($testResponse.success) {
    Write-Host "Endpoint de migration actif" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Execution du schema SQL..." -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
        "X-Migration-Key" = $migrationKey
    }
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers
        
        if ($response.success) {
            Write-Host ""
            Write-Host "Script SQL execute avec succes !" -ForegroundColor Green
            Write-Host ""
            Write-Host "Tables creees :" -ForegroundColor Cyan
            foreach ($table in $response.tables) {
                Write-Host "   - $table" -ForegroundColor White
            }
            Write-Host ""
            Write-Host "Prochaines etapes :" -ForegroundColor Cyan
            Write-Host "   1. Redemarrer le serveur backend (si necessaire)" -ForegroundColor White
            Write-Host "   2. Tester l'endpoint : curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test" -ForegroundColor White
            Write-Host "   3. Verifier les webhooks dans TimeMoto (section Attempts)" -ForegroundColor White
            Write-Host ""
            Write-Host "IMPORTANT : Supprimer l'endpoint /api/migration apres utilisation pour la securite" -ForegroundColor Yellow
        } else {
            Write-Host ""
            Write-Host "Erreur lors de l'execution : $($response.error)" -ForegroundColor Red
            if ($response.detail) {
                Write-Host "Detail : $($response.detail)" -ForegroundColor Red
            }
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "Erreur lors de l'appel API : $_" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Message : $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        exit 1
    }
} else {
    Write-Host "Erreur : Endpoint de migration non disponible" -ForegroundColor Red
    exit 1
}
