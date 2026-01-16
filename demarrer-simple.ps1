# Script simple de démarrage
Write-Host "Demarrage de l'application..." -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "Demarrage Backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend'; npm run dev"

Start-Sleep -Seconds 3

# Frontend
Write-Host "Demarrage Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend'; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SERVEURS DEMARRES !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connexion:" -ForegroundColor Yellow
Write-Host "  Email: admin@system.local" -ForegroundColor White
Write-Host "  Mot de passe: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
