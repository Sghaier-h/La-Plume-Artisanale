# 🔧 Diagnostic de Connexion - Base de Données

## 🔍 Tests de Diagnostic

### Test 1 : Script PowerShell Automatique

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
.\test-connection.ps1
```

**Ce script va :**
- ✅ Vérifier que le fichier `.env` existe
- ✅ Afficher la configuration de connexion
- ✅ Tester la connexion réseau
- ✅ Tester la connexion PostgreSQL
- ✅ Vérifier les tables existantes

### Test 2 : Script Node.js Direct

```powershell
npm run test:db
```

**Ce script va :**
- ✅ Tester la connexion à PostgreSQL
- ✅ Vérifier les tables existantes
- ✅ Vérifier les utilisateurs
- ✅ Afficher les erreurs détaillées

### Test 3 : Test Manuel avec psql

**Si vous avez psql installé :**

```powershell
$env:PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT NOW();"
```

---

## ❌ Erreurs Courantes

### Erreur : "Can't reach database server"

**Causes possibles :**
1. ❌ L'IP de votre PC n'est pas autorisée dans PostgreSQL OVH
2. ❌ Le firewall bloque le port 35392
3. ❌ Problème de connexion internet
4. ❌ Le serveur PostgreSQL est arrêté

**Solutions :**

1. **Autoriser votre IP dans OVH :**
   - Espace client OVH → Web Cloud Databases
   - Votre base PostgreSQL → Utilisateurs et autorisations
   - Ajouter votre IP publique (trouver avec : `Invoke-RestMethod -Uri "https://api.ipify.org?format=json"`)

2. **Vérifier le firewall Windows :**
   ```powershell
   # Test de connexion réseau
   Test-NetConnection -ComputerName sh131616-002.eu.clouddb.ovh.net -Port 35392
   ```

3. **Vérifier la connexion internet :**
   ```powershell
   Test-NetConnection -ComputerName sh131616-002.eu.clouddb.ovh.net -Port 35392 -InformationLevel Detailed
   ```

### Erreur : "password authentication failed"

**Causes possibles :**
1. ❌ Mot de passe incorrect dans `.env`
2. ❌ Nom d'utilisateur incorrect
3. ❌ Caractères spéciaux dans le mot de passe mal échappés

**Solutions :**

1. **Vérifier le fichier `.env` :**
   ```powershell
   Get-Content .env | Select-String "DB_PASSWORD"
   ```

2. **Vérifier avec psql :**
   ```powershell
   $env:PGPASSWORD="Allbyfouta007"
   psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume
   ```

### Erreur : "database does not exist"

**Causes possibles :**
1. ❌ Nom de base de données incorrect dans `.env`
2. ❌ La base de données n'existe pas

**Solutions :**

1. **Vérifier le nom de la base :**
   - Doit être : `ERP_La_Plume` (exactement, avec majuscules)

2. **Vérifier les bases disponibles :**
   ```powershell
   $env:PGPASSWORD="Allbyfouta007"
   psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -l
   ```

### Erreur : "relation does not exist"

**Causes possibles :**
1. ❌ Les tables n'existent pas dans la base de données
2. ❌ Les scripts SQL n'ont pas été exécutés

**Solutions :**

1. **Vérifier les tables existantes :**
   ```powershell
   npm run test:db
   ```

2. **Exécuter les scripts SQL d'initialisation :**
   - Voir `INSTRUCTIONS_PHASE_1.md`
   - Ou `PARAMETRAGE_INITIAL.md`

---

## ✅ Vérifications à Faire

### Checklist de Diagnostic

1. ✅ **Fichier `.env` existe** et contient `DATABASE_URL` ou `DB_HOST`, `DB_PORT`, etc.
2. ✅ **Variables d'environnement** correctes dans `.env`
3. ✅ **Connexion réseau** fonctionne (Test-NetConnection)
4. ✅ **IP autorisée** dans PostgreSQL OVH
5. ✅ **Tables existent** dans la base de données
6. ✅ **Utilisateurs existent** dans la table `utilisateurs`

---

## 🚀 Solutions Alternatives

### Solution 1 : Utiliser PostgreSQL Local

**Si vous ne pouvez pas accéder à la base distante :**

1. **Installer PostgreSQL localement :**
   - Télécharger : https://www.postgresql.org/download/windows/
   - Installer avec les paramètres par défaut

2. **Créer la base de données locale :**
   ```sql
   CREATE DATABASE erp_la_plume;
   CREATE USER fouta_user WITH PASSWORD 'votre_mot_de_passe';
   GRANT ALL PRIVILEGES ON DATABASE erp_la_plume TO fouta_user;
   ```

3. **Exécuter les scripts SQL :**
   ```powershell
   cd ..\database
   psql -U fouta_user -d erp_la_plume -f 01_base_et_securite.sql
   psql -U fouta_user -d erp_la_plume -f 02_production_et_qualite.sql
   psql -U fouta_user -d erp_la_plume -f 03_flux_et_tracabilite.sql
   ```

4. **Modifier le `.env` :**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=erp_la_plume
   DB_USER=fouta_user
   DB_PASSWORD=votre_mot_de_passe
   ```

### Solution 2 : Utiliser un Tunnel SSH (si vous avez accès SSH au VPS)

**Créer un tunnel SSH vers la base de données :**

```powershell
ssh -L 5432:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191
```

Puis modifier le `.env` :
```env
DB_HOST=localhost
DB_PORT=5432
```

---

## 📞 Support

**Si le problème persiste :**

1. ✅ Exécuter `npm run test:db` et copier l'erreur complète
2. ✅ Vérifier les logs dans l'espace client OVH
3. ✅ Contacter le support OVH si nécessaire

---

## 🆘 Commande Rapide de Diagnostic

```powershell
# Test complet en une commande
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
.\test-connection.ps1
```
