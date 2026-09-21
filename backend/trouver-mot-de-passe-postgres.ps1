# Script pour trouver ou configurer le mot de passe PostgreSQL

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION MOT DE PASSE POSTGRESQL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Options pour configurer PostgreSQL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPTION 1: Tester avec des mots de passe courants" -ForegroundColor Blue
Write-Host "  - postgres" -ForegroundColor White
Write-Host "  - admin" -ForegroundColor White
Write-Host "  - root" -ForegroundColor White
Write-Host "  - (vide)" -ForegroundColor White
Write-Host ""

Write-Host "OPTION 2: Reinitialiser le mot de passe" -ForegroundColor Blue
Write-Host "  1. Ouvrir pgAdmin ou psql" -ForegroundColor White
Write-Host "  2. Se connecter en tant qu'administrateur" -ForegroundColor White
Write-Host "  3. Executer: ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';" -ForegroundColor White
Write-Host ""

Write-Host "OPTION 3: Utiliser un autre utilisateur" -ForegroundColor Blue
Write-Host "  Si vous avez un autre utilisateur PostgreSQL avec les droits" -ForegroundColor White
Write-Host ""

Write-Host "OPTION 4: Configurer l'authentification trust (developpement uniquement)" -ForegroundColor Blue
Write-Host "  1. Trouver le fichier pg_hba.conf" -ForegroundColor White
Write-Host "  2. Changer 'md5' en 'trust' pour localhost" -ForegroundColor White
Write-Host "  3. Redemarrer PostgreSQL" -ForegroundColor White
Write-Host ""

# Tester quelques mots de passe courants
Write-Host "Test de connexion avec des mots de passe courants..." -ForegroundColor Yellow
Write-Host ""

$passwords = @("postgres", "admin", "root", "")

foreach ($pwd in $passwords) {
    $env:DB_PASSWORD = $pwd
    $pwdDisplay = if ($pwd -eq '') { '(vide)' } else { '***' }
    Write-Host "Test avec mot de passe: $pwdDisplay" -ForegroundColor Gray -NoNewline
    
    # Tester la connexion
    try {
        $testScript = @"
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD || ''
});
try {
    await pool.query('SELECT 1');
    console.log('OK');
    process.exit(0);
} catch (e) {
    console.log('ECHOUE');
    process.exit(1);
}
"@
        $testScript | Out-File -FilePath "test-pwd-temp.mjs" -Encoding UTF8
        $result = node test-pwd-temp.mjs 2>&1
        Remove-Item "test-pwd-temp.mjs" -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " -> SUCCES !" -ForegroundColor Green
            Write-Host ""
            $pwdFound = if ($pwd -eq '') { '(aucun)' } else { '***' }
            Write-Host "Mot de passe trouve: $pwdFound" -ForegroundColor Green
            Write-Host ""
            Write-Host "Vous pouvez maintenant executer:" -ForegroundColor Yellow
            Write-Host "  `$env:DB_PASSWORD = '$pwd'" -ForegroundColor White
            Write-Host "  node creer-base-locale-node.js" -ForegroundColor White
            Write-Host ""
            exit 0
        } else {
            Write-Host " -> ECHOUE" -ForegroundColor Red
        }
    } catch {
        Write-Host " -> ERREUR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Aucun mot de passe standard n'a fonctionne." -ForegroundColor Yellow
Write-Host ""
Write-Host "Veuillez:" -ForegroundColor Yellow
Write-Host "  1. Trouver votre mot de passe PostgreSQL" -ForegroundColor White
Write-Host "  2. Ou le reinitialiser (voir instructions ci-dessus)" -ForegroundColor White
Write-Host "  3. Puis executer: node creer-base-locale-node.js" -ForegroundColor White
Write-Host ""
