# 🧪 Tester la Connexion - Guide Rapide

## ⚡ Test Rapide en 1 Commande

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run test:db
```

---

## 📋 Autres Méthodes de Test

### Option 1 : Script PowerShell

```powershell
.\test-connection.ps1
```

### Option 2 : Test Direct

```powershell
node src/utils/test-db.js
```

### Option 3 : Test avec psql (si installé)

```powershell
$env:PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT NOW();"
```

---

## 🔍 Vérifications à Faire

### 1. Vérifier le fichier .env

```powershell
# Vérifier que le fichier existe
dir .env

# Vérifier le contenu (sans afficher le mot de passe)
Get-Content .env | Select-String -Pattern "^DB_|^DATABASE"
```

**Le fichier doit contenir :**
```
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

### 2. Vérifier la Connexion Réseau

```powershell
# Tester la connexion TCP au port 35392
Test-NetConnection -ComputerName sh131616-002.eu.clouddb.ovh.net -Port 35392
```

**Si "TcpTestSucceeded: False" :**
- ❌ Le port est bloqué ou l'IP n'est pas autorisée
- ✅ Ajouter votre IP dans PostgreSQL OVH

### 3. Trouver votre IP Publique

```powershell
# Trouver votre IP publique
Invoke-RestMethod -Uri "https://api.ipify.org?format=json"
```

**Puis autoriser cette IP dans :**
- Espace client OVH → Web Cloud Databases
- Votre base PostgreSQL → Utilisateurs et autorisations
- Ajouter votre IP publique

---

## ❌ Résoudre les Erreurs

### Erreur : "Can't reach database server"

**Solution :**

1. **Autoriser votre IP dans OVH :**
   - Espace client OVH
   - Web Cloud Databases → Votre base PostgreSQL
   - Utilisateurs et autorisations → Ajouter votre IP

2. **Vérifier le firewall Windows :**
   ```powershell
   # Vérifier que le port n'est pas bloqué
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
   ```

3. **Tester la connexion :**
   ```powershell
   Test-NetConnection -ComputerName sh131616-002.eu.clouddb.ovh.net -Port 35392
   ```

### Erreur : "password authentication failed"

**Solution :**

1. **Vérifier le mot de passe dans .env**
2. **Vérifier avec psql :**
   ```powershell
   $env:PGPASSWORD="Allbyfouta007"
   psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume
   ```

### Erreur : "database does not exist"

**Solution :**

1. **Vérifier le nom de la base :**
   - Doit être exactement : `ERP_La_Plume` (avec majuscules)

2. **Vérifier les bases disponibles :**
   ```powershell
   $env:PGPASSWORD="Allbyfouta007"
   psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -l
   ```

---

## ✅ Après le Diagnostic

**Si la connexion fonctionne :**

1. ✅ Démarrer le backend : `npm run dev`
2. ✅ Tester l'authentification
3. ✅ Continuer avec le développement

**Si la connexion ne fonctionne pas :**

1. ⚠️ Autoriser votre IP dans OVH
2. ⚠️ Vérifier le firewall
3. ⚠️ Vérifier les identifiants
4. ⚠️ Ou utiliser une base de données locale (voir `DIAGNOSTIC_CONNEXION.md`)

---

**🎯 Commencez par : `npm run test:db`**
