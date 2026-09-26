# Script pour verifier le port PostgreSQL

Write-Host "Verification du port PostgreSQL..." -ForegroundColor Blue
Write-Host ""

# Verifier le port 5432 (port par defaut)
Write-Host "Test du port 5432 (port par defaut)..." -ForegroundColor Yellow
$port5432 = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($port5432) {
    Write-Host "Port 5432: OUVERT" -ForegroundColor Green
} else {
    Write-Host "Port 5432: FERME" -ForegroundColor Red
}

# Verifier le port 5433 (port configure)
Write-Host "Test du port 5433 (port configure)..." -ForegroundColor Yellow
$port5433 = Test-NetConnection -ComputerName localhost -Port 5433 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($port5433) {
    Write-Host "Port 5433: OUVERT" -ForegroundColor Green
} else {
    Write-Host "Port 5433: FERME" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pour trouver le port PostgreSQL:" -ForegroundColor Yellow
Write-Host "  1. Ouvrir pgAdmin ou psql"
Write-Host "  2. Voir les proprietes de la connexion"
Write-Host "  3. Ou verifier le fichier postgresql.conf"
Write-Host ""

# Chercher le fichier postgresql.conf
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\data\postgresql.conf",
    "C:\Program Files (x86)\PostgreSQL\*\data\postgresql.conf"
)

Write-Host "Recherche du fichier postgresql.conf..." -ForegroundColor Blue
foreach ($path in $possiblePaths) {
    $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
    if ($files) {
        foreach ($file in $files) {
            Write-Host "Fichier trouve: $($file.FullName)" -ForegroundColor Green
            $content = Get-Content $file.FullName | Select-String -Pattern "port\s*="
            if ($content) {
                Write-Host "Configuration du port:" -ForegroundColor Yellow
                Write-Host "  $content" -ForegroundColor White
            }
        }
    }
}
