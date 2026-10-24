# Script pour regrouper tous les fichiers texte et d'aide dans docs/

Write-Host "Regroupement de tous les fichiers texte et d'aide..." -ForegroundColor Cyan
Write-Host ""

# Creer le dossier docs si necessaire
if (-not (Test-Path "docs")) {
    New-Item -ItemType Directory -Path "docs" -Force | Out-Null
}

# Creer sous-dossiers si necessaires
$sousDossiers = @(
    "docs\guides",
    "docs\aide",
    "docs\references"
)

foreach ($dir in $sousDossiers) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

$moved = 0

# Deplacer tous les fichiers .md restants a la racine (sauf README.md)
Get-ChildItem -Path "." -Filter "*.md" -File | Where-Object { 
    $_.DirectoryName -eq (Resolve-Path ".").Path -and 
    $_.Name -ne "README.md" -and 
    $_.Name -ne "ORGANISER_GIT.md"
} | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "docs\guides\" -Force -ErrorAction SilentlyContinue
    Write-Host "Deplace: $($_.Name) -> docs\guides\" -ForegroundColor Yellow
    $moved++
}

# Deplacer tous les fichiers .txt
Get-ChildItem -Path "." -Filter "*.txt" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "docs\references\" -Force -ErrorAction SilentlyContinue
    Write-Host "Deplace: $($_.Name) -> docs\references\" -ForegroundColor Yellow
    $moved++
}

# Deplacer tous les fichiers .docx
Get-ChildItem -Path "." -Filter "*.docx" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "docs\references\" -Force -ErrorAction SilentlyContinue
    Write-Host "Deplace: $($_.Name) -> docs\references\" -ForegroundColor Yellow
    $moved++
}

# Deplacer autres fichiers de documentation
$autresFichiers = @("*.csv", "*.html", "*.pdf")
foreach ($pattern in $autresFichiers) {
    Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "docs\references\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $($_.Name) -> docs\references\" -ForegroundColor Yellow
        $moved++
    }
}

Write-Host ""
Write-Host "Regroupement termine !" -ForegroundColor Green
Write-Host "Fichiers deplaces: $moved" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers restants a la racine:" -ForegroundColor Yellow
Get-ChildItem -Path "." -File | Where-Object { 
    $_.Extension -in @(".md", ".txt", ".docx", ".csv", ".html", ".pdf") 
} | Select-Object -First 5 Name
