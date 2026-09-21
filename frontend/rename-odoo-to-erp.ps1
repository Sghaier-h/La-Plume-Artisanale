# Script pour renommer tous les fichiers Odoo en ERP
# Usage: .\rename-odoo-to-erp.ps1

$ErrorActionPreference = "Stop"

Write-Host "Début du renommage des fichiers Odoo vers ERP..." -ForegroundColor Green

# 1. Renommer le dossier odoo en erp
$odooDir = "src\components\odoo"
$erpDir = "src\components\erp"

if (Test-Path $odooDir) {
    Write-Host "Renommage du dossier $odooDir vers $erpDir..." -ForegroundColor Yellow
    if (Test-Path $erpDir) {
        Remove-Item -Recurse -Force $erpDir
    }
    Rename-Item -Path $odooDir -NewName "erp"
    Write-Host "✓ Dossier renommé" -ForegroundColor Green
}

# 2. Renommer tous les fichiers *Odoo.tsx dans pages/odoo/
$pagesDir = "src\pages\odoo"
if (Test-Path $pagesDir) {
    Write-Host "Renommage des fichiers dans $pagesDir..." -ForegroundColor Yellow
    Get-ChildItem -Path $pagesDir -Filter "*Odoo.tsx" | ForEach-Object {
        $newName = $_.Name -replace "Odoo", ""
        $newPath = Join-Path $_.DirectoryName $newName
        Write-Host "  Renommage: $($_.Name) -> $newName" -ForegroundColor Cyan
        Rename-Item -Path $_.FullName -NewName $newName
    }
    Write-Host "✓ Fichiers renommés" -ForegroundColor Green
}

# 3. Renommer les composants Odoo* en ERP*
$componentsDir = "src\components\erp"
if (Test-Path $componentsDir) {
    Write-Host "Renommage des composants dans $componentsDir..." -ForegroundColor Yellow
    Get-ChildItem -Path $componentsDir -Filter "Odoo*.tsx" | ForEach-Object {
        $newName = $_.Name -replace "Odoo", "ERP"
        $newPath = Join-Path $_.DirectoryName $newName
        Write-Host "  Renommage: $($_.Name) -> $newName" -ForegroundColor Cyan
        Rename-Item -Path $_.FullName -NewName $newName
    }
    Write-Host "✓ Composants renommés" -ForegroundColor Green
}

# 4. Renommer odoo-theme.css en erp-theme.css
$themeFile = "src\styles\odoo-theme.css"
if (Test-Path $themeFile) {
    Write-Host "Renommage du fichier thème..." -ForegroundColor Yellow
    Rename-Item -Path $themeFile -NewName "erp-theme.css"
    Write-Host "✓ Thème renommé" -ForegroundColor Green
}

Write-Host "`nRenommage terminé!" -ForegroundColor Green
Write-Host "`nNote: Vous devez maintenant remplacer manuellement toutes les références 'Odoo' par 'ERP' dans le code." -ForegroundColor Yellow
