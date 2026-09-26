# Script pour organiser TOUS les fichiers restants

Write-Host "Organisation complete de tous les fichiers..." -ForegroundColor Cyan
Write-Host ""

# Creer les dossiers si necessaires
$dirs = @(
    "docs\deployment",
    "docs\configuration", 
    "docs\troubleshooting",
    "docs\development",
    "docs\database",
    "docs\guides"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Fichiers de deploiement
$deployment = @(
    "DEPLOIEMENT_*.md",
    "*DEPLOIEMENT*.md",
    "*DEPLOY*.md",
    "*STAGING*.md",
    "*DEMARRAGE*.md",
    "MISE_A_JOUR*.md",
    "COMMANDES_MISE*.md",
    "INITIALISER_GIT*.md",
    "ACTIVER_GIT*.md",
    "SETUP_GIT*.md",
    "GUIDE_DEPLOIEMENT*.md",
    "GUIDE_GITHUB*.md",
    "PUSH_TO_GITHUB*.md",
    "STATUS_GIT*.md",
    "STATUS_STAGING*.md",
    "STATUS_FINAL*.md",
    "APRES_DEPLOIEMENT*.md",
    "EXECUTER_DEPLOIEMENT*.md",
    "COPIER_COLLER_DEPLOIEMENT*.md"
)

# Fichiers de configuration
$configuration = @(
    "CONFIGURER_*.md",
    "CONFIGURATION_*.md",
    "GUIDE_WEBHOOK*.md",
    "ACTIONS_WEBHOOK*.md",
    "ACTIONS_EFFECTUEES_WEBHOOK*.md",
    "PROCHAINES_ETAPES_WEBHOOK*.md",
    "RECAPITULATIF_WEBHOOK*.md",
    "CONFIGURATION_WEBHOOK*.md",
    "*.conf"
)

# Fichiers de depannage
$troubleshooting = @(
    "CORRIGER_*.md",
    "RESOUDRE_*.md",
    "SOLUTION_*.md",
    "DIAGNOSTIC_*.md",
    "ERREUR_*.md",
    "ERREURS_*.md",
    "PROBLEME_*.md",
    "RESOLUTION_*.md",
    "diagnostiquer-*.md"
)

# Fichiers de developpement
$development = @(
    "PLAN_*.md",
    "ARCHITECTURE_*.md",
    "GUIDE_ERP*.md",
    "SYSTEME_*.md",
    "MODULE_*.md",
    "MODULES_*.md",
    "GESTION_*.md",
    "STRUCTURE_*.md",
    "FORMULES_*.md",
    "ANALYSE_*.md",
    "REORGANISATION_*.md",
    "NAVIGATION_*.md",
    "MODIFICATIONS_*.md",
    "PHASE_*.md",
    "COMMENCER_*.md",
    "DEBUTER_*.md",
    "DEVELOPPEMENT_*.md",
    "CREER_*.md",
    "INSTALLATION_*.md",
    "INSTALLER_*.md",
    "DEMARRER_*.md",
    "COMMENT_*.md",
    "POURQUOI_*.md",
    "UTILISER_*.md",
    "AMELIORER_*.md"
)

# Fichiers guides et documentation generale
$guides = @(
    "GUIDE_*.md",
    "README*.md",
    "QUICK_START*.md",
    "DEMARRAGE*.md",
    "INSTRUCTIONS_*.md",
    "ETAPES_*.md",
    "PROCHAINES_ETAPES*.md",
    "RESUME_*.md",
    "VERIFICATION_*.md",
    "VERIFIER_*.md",
    "TESTER_*.md",
    "TESTS_*.md",
    "TEST_*.md",
    "STATUS_*.md",
    "APPLICATION_*.md",
    "APPLICATIONS_*.md",
    "LIVRAISON_*.md",
    "SUCCES_*.md",
    "REINSTALLER_*.md",
    "CHANGER_*.md",
    "RETIRER_*.md",
    "MODIFIER_*.md",
    "VIDER_*.md",
    "TROUVER_*.md",
    "AJOUTER_*.md",
    "LIER_*.md",
    "CONNEXION_*.md",
    "CONSULTER_*.md",
    "CONTACTER_*.md",
    "CHOISIR_*.md",
    "HEBERGEMENT_*.md",
    "UBUNTU_*.md",
    "PORTS_*.md",
    "ESSAYER_*.md",
    "FORCER_*.md",
    "REDEMARRER_*.md",
    "SUPPRIMER_*.md",
    "ADAPTER_*.md",
    "CREER_*.md",
    "INSTALLATION*.md",
    "PARAMETRAGE*.md",
    "UTILISATEURS_*.md",
    "URLS_*.md",
    "CAPACITOR_*.md",
    "CATALOGUE_*.md",
    "FRONTEND_*.md"
)

# Organiser les fichiers
$moved = 0
$skipped = 0

# Deploiement
foreach ($pattern in $deployment) {
    Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DirectoryName -eq (Resolve-Path ".").Path) {
            Move-Item -Path $_.FullName -Destination "docs\deployment\" -Force -ErrorAction SilentlyContinue
            Write-Host "Deplace: $($_.Name) -> docs\deployment\" -ForegroundColor Yellow
            $moved++
        }
    }
}

# Configuration
foreach ($pattern in $configuration) {
    Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DirectoryName -eq (Resolve-Path ".").Path) {
            Move-Item -Path $_.FullName -Destination "docs\configuration\" -Force -ErrorAction SilentlyContinue
            Write-Host "Deplace: $($_.Name) -> docs\configuration\" -ForegroundColor Yellow
            $moved++
        }
    }
}

# Depannage
foreach ($pattern in $troubleshooting) {
    Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DirectoryName -eq (Resolve-Path ".").Path) {
            Move-Item -Path $_.FullName -Destination "docs\troubleshooting\" -Force -ErrorAction SilentlyContinue
            Write-Host "Deplace: $($_.Name) -> docs\troubleshooting\" -ForegroundColor Yellow
            $moved++
        }
    }
}

# Developpement
foreach ($pattern in $development) {
    Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DirectoryName -eq (Resolve-Path ".").Path) {
            Move-Item -Path $_.FullName -Destination "docs\development\" -Force -ErrorAction SilentlyContinue
            Write-Host "Deplace: $($_.Name) -> docs\development\" -ForegroundColor Yellow
            $moved++
        }
    }
}

# Guides
foreach ($pattern in $guides) {
    Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.DirectoryName -eq (Resolve-Path ".").Path -and $_.Name -ne "README.md") {
            Move-Item -Path $_.FullName -Destination "docs\guides\" -Force -ErrorAction SilentlyContinue
            Write-Host "Deplace: $($_.Name) -> docs\guides\" -ForegroundColor Yellow
            $moved++
        }
    }
}

Write-Host ""
Write-Host "Organisation terminee !" -ForegroundColor Green
Write-Host "Fichiers deplaces: $moved" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers restants a la racine:" -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.md" -File | Where-Object { $_.DirectoryName -eq (Resolve-Path ".").Path } | Select-Object -First 10 Name
