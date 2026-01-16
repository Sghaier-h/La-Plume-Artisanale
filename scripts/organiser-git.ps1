# Script pour organiser le depot Git

Write-Host "Organisation du depot Git..." -ForegroundColor Cyan

# Creer les dossiers de documentation
$docsDirs = @(
    "docs",
    "docs\deployment",
    "docs\configuration",
    "docs\troubleshooting",
    "docs\development",
    "docs\database"
)

foreach ($dir in $docsDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Cree: $dir" -ForegroundColor Green
    }
}

# Deplacer les fichiers de deploiement
$deploymentFiles = @(
    "DEPLOYER_AVEC_GIT.md",
    "DEPLOYER_FRONTEND_VPS.md",
    "DEPLOIEMENT_OVH.md",
    "DEPLOIEMENT_SAAS.md",
    "DEPLOIEMENT_VPS_ETAPE_PAR_ETAPE.md",
    "GUIDE_DEPLOIEMENT_OVH.md",
    "MISE_A_JOUR_SERVEUR.md",
    "COMMANDES_MISE_A_JOUR_SERVEUR.md",
    "INITIALISER_GIT_SERVEUR.md",
    "STAGING_README.md",
    "DEMARRAGE_STAGING.md"
)

foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\deployment\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $file -> docs\deployment\" -ForegroundColor Yellow
    }
}

# Deplacer les fichiers de configuration
$configFiles = @(
    "CONFIGURER_NGINX_ET_SSL.md",
    "CONFIGURER_VPS_OVH.md",
    "CONFIGURER_POSTGRESQL_OVH.md",
    "CONFIGURER_DOMAINE_OVH.md",
    "CONFIGURATION_WEBHOOK_COMPLETE.md",
    "GUIDE_WEBHOOK_TIMEMOTO.md",
    "NGINX_CONFIG_CORRECTE.conf",
    "COMMANDES_CORRIGER_NGINX.md",
    "CORRIGER_NGINX_FRONTEND.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\configuration\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $file -> docs\configuration\" -ForegroundColor Yellow
    }
}

# Deplacer les fichiers de depannage
$troubleshootingFiles = @(
    "CORRIGER_403_FORBIDDEN.md",
    "RESOUDRE_ERREUR_CONNEXION.md",
    "RESOUDRE_ERREUR_404_HEALTH.md",
    "CORRIGER_PM2_SERVEUR.md",
    "RESOLUTION_ERREUR_CONNEXION.md",
    "DIAGNOSTIC_501_NOT_IMPLEMENTED.md",
    "SOLUTION_ERREUR_500.md"
)

foreach ($file in $troubleshootingFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\troubleshooting\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $file -> docs\troubleshooting\" -ForegroundColor Yellow
    }
}

# Deplacer les fichiers de developpement
$devFiles = @(
    "COMMENT_COMMENCER.md",
    "DEVELOPPEMENT_LOCAL_PAS_A_PAS.md",
    "PLAN_DEVELOPPEMENT_COMPLET.md",
    "PLAN_DEVELOPPEMENT_GPAO.md",
    "ARCHITECTURE_ERP_COMPLET.md",
    "GUIDE_ERP_COMPLET.md"
)

foreach ($file in $devFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\development\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $file -> docs\development\" -ForegroundColor Yellow
    }
}

# Deplacer les scripts PowerShell
$scripts = Get-ChildItem -Path "." -Filter "*.ps1" -File
foreach ($script in $scripts) {
    if ($script.DirectoryName -notlike "*scripts*") {
        Move-Item -Path $script.FullName -Destination "scripts\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $($script.Name) -> scripts\" -ForegroundColor Yellow
    }
}

# Deplacer les scripts shell
$shellScripts = Get-ChildItem -Path "." -Filter "*.sh" -File
foreach ($script in $shellScripts) {
    if ($script.DirectoryName -notlike "*scripts*") {
        Move-Item -Path $script.FullName -Destination "scripts\" -Force -ErrorAction SilentlyContinue
        Write-Host "Deplace: $($script.Name) -> scripts\" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Organisation terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "Fichiers restants a la racine (a verifier manuellement):" -ForegroundColor Cyan
Get-ChildItem -Path "." -Filter "*.md" -File | Select-Object -First 10 Name
