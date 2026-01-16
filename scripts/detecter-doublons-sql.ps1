# Script pour detecter et corriger les doublons dans les fichiers SQL

Write-Host "Detection des doublons dans les fichiers SQL..." -ForegroundColor Cyan
Write-Host ""

$databaseDir = "database"
$doublons = @()

# Fichiers suspects de doublons
$fichiersSuspects = @(
    @{Nom1="18_modules_couts.sql"; Nom2="20_modules_couts.sql"},
    @{Nom1="19_modules_planification_gantt.sql"; Nom2="20_modules_gantt_planification.sql"},
    @{Nom1="19_modules_multisociete.sql"; Nom2="21_modules_multisociete.sql"},
    @{Nom1="21_modules_communication_externe.sql"; Nom2="22_modules_communication_externe.sql"},
    @{Nom1="22_modules_ecommerce_ia.sql"; Nom2="23_modules_ecommerce_ia.sql"}
)

foreach ($pair in $fichiersSuspects) {
    $fichier1 = Join-Path $databaseDir $pair.Nom1
    $fichier2 = Join-Path $databaseDir $pair.Nom2
    
    if ((Test-Path $fichier1) -and (Test-Path $fichier2)) {
        Write-Host "Comparaison: $($pair.Nom1) vs $($pair.Nom2)" -ForegroundColor Yellow
        
        $hash1 = Get-FileHash -Path $fichier1 -Algorithm MD5
        $hash2 = Get-FileHash -Path $fichier2 -Algorithm MD5
        
        if ($hash1.Hash -eq $hash2.Hash) {
            Write-Host "  -> DOUBLON EXACT DETECTE !" -ForegroundColor Red
            $doublons += @{
                Fichier1 = $pair.Nom1
                Fichier2 = $pair.Nom2
                Type = "EXACT"
            }
        } else {
            # Comparer le nombre de lignes et les tables creees
            $lignes1 = (Get-Content $fichier1).Count
            $lignes2 = (Get-Content $fichier2).Count
            $tables1 = (Select-String -Path $fichier1 -Pattern "CREATE TABLE" -AllMatches).Matches.Count
            $tables2 = (Select-String -Path $fichier2 -Pattern "CREATE TABLE" -AllMatches).Matches.Count
            
            Write-Host "  -> Fichiers differents:" -ForegroundColor Yellow
            Write-Host "     $($pair.Nom1): $lignes1 lignes, $tables1 tables" -ForegroundColor Gray
            Write-Host "     $($pair.Nom2): $lignes2 lignes, $tables2 tables" -ForegroundColor Gray
            
            # Si le nombre de tables est identique, c'est peut-etre une version amelioree
            if ($tables1 -eq $tables2 -and $lignes1 -lt $lignes2) {
                Write-Host "  -> $($pair.Nom2) semble etre une version plus complete" -ForegroundColor Green
                $doublons += @{
                    Fichier1 = $pair.Nom1
                    Fichier2 = $pair.Nom2
                    Type = "VERSION_AMELIOREE"
                    Action = "SUPPRIMER_1"
                }
            } elseif ($tables1 -eq $tables2 -and $lignes2 -lt $lignes1) {
                Write-Host "  -> $($pair.Nom1) semble etre une version plus complete" -ForegroundColor Green
                $doublons += @{
                    Fichier1 = $pair.Nom1
                    Fichier2 = $pair.Nom2
                    Type = "VERSION_AMELIOREE"
                    Action = "SUPPRIMER_2"
                }
            }
        }
        Write-Host ""
    }
}

# Afficher le resume
Write-Host "Resume des doublons detectes:" -ForegroundColor Cyan
Write-Host ""

if ($doublons.Count -eq 0) {
    Write-Host "Aucun doublon exact detecte." -ForegroundColor Green
    Write-Host "Les fichiers sont des versions differentes ou ameliorees." -ForegroundColor Yellow
} else {
    foreach ($doublon in $doublons) {
        Write-Host "- $($doublon.Fichier1) / $($doublon.Fichier2) : $($doublon.Type)" -ForegroundColor Yellow
        if ($doublon.Action) {
            Write-Host "  Action recommandee: Supprimer $($doublon.Fichier1)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Analyse terminee." -ForegroundColor Green
