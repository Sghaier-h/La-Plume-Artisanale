# 🚀 Guide : Démarrer PostgreSQL et Créer le Tunnel SSH

**Date :** 20 janvier 2026

---

## 📋 ÉTAPES

### 1. ✅ Démarrer PostgreSQL (Local)

PostgreSQL est **déjà en cours d'exécution** sur votre machine (service `postgresql-x64-18`).

**Vérification :**
```powershell
Get-Service | Where-Object { $_.Name -like "*postgres*" }
```

**Si besoin de démarrer :**
```powershell
Start-Service -Name "postgresql-x64-18"
```

---

### 2. 🔗 Créer le Tunnel SSH (Pour la base OVH)

Votre base de données est sur **OVH** et nécessite un tunnel SSH.

#### Option A : Tunnel Automatique (PowerShell)

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File tunnel-ssh.ps1
```

**⚠️ Important :** Laissez cette fenêtre ouverte pendant que vous travaillez.

#### Option B : Tunnel Manuel (Terminal SSH)

Ouvrez un **nouveau terminal PowerShell** et exécutez :

```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**⚠️ Important :** 
- Laissez ce terminal ouvert
- Ne fermez pas la fenêtre
- Le tunnel reste actif tant que le terminal est ouvert

---

### 3. ✅ Vérifier le Tunnel

Dans un **autre terminal**, vérifiez que le port est ouvert :

```powershell
Test-NetConnection -ComputerName localhost -Port 5433
```

**Résultat attendu :** `TcpTestSucceeded : True`

---

### 4. 🧪 Tester la Connexion

Une fois le tunnel actif, testez la connexion :

```bash
cd backend
node verifier-tables-modules-odoo.js
```

**Ou test simple :**

```bash
cd backend
node test-connexion-simple.js
```

---

## 🔧 CONFIGURATION

### Fichier `.env`

Assurez-vous que votre `.env` contient :

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

**Ou avec DATABASE_URL :**

```env
DATABASE_URL="postgresql://Aviateur:Allbyfouta007@localhost:5433/ERP_La_Plume?schema=public"
```

---

## 🎯 RÉSUMÉ DES COMMANDES

### Démarrer PostgreSQL
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File demarrer-postgresql.ps1
```

### Créer le Tunnel SSH
```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

### Vérifier les Tables
```bash
cd backend
node verifier-tables-modules-odoo.js
```

### Tester les Modules
```bash
cd backend
node test-modules-odoo.js
```

---

## ⚠️ PROBLÈMES COURANTS

### 1. Port 5433 fermé

**Cause :** Le tunnel SSH n'est pas actif

**Solution :**
1. Vérifiez que le terminal SSH est ouvert
2. Attendez 10-20 secondes après la création du tunnel
3. Vérifiez avec : `Test-NetConnection localhost -Port 5433`

### 2. Erreur d'authentification (28P01)

**Cause :** Mauvais utilisateur/mot de passe

**Solution :**
1. Vérifiez les identifiants dans `.env`
2. Vérifiez que l'utilisateur existe dans PostgreSQL

### 3. Base de données n'existe pas (3D000)

**Cause :** La base `ERP_La_Plume` n'existe pas

**Solution :**
1. Créez la base : `CREATE DATABASE "ERP_La_Plume";`
2. Ou utilisez une base existante

---

## ✅ CHECKLIST

- [ ] PostgreSQL démarré (service `postgresql-x64-18`)
- [ ] Tunnel SSH créé et actif (port 5433 ouvert)
- [ ] Fichier `.env` configuré correctement
- [ ] Test de connexion réussi
- [ ] Tables vérifiées

---

## 🚀 PROCHAINES ÉTAPES

Une fois le tunnel actif et la connexion testée :

1. **Vérifier les tables :**
   ```bash
   node verifier-tables-modules-odoo.js
   ```

2. **Tester les modules :**
   ```bash
   node test-modules-odoo.js
   ```

3. **Démarrer le serveur :**
   ```bash
   npm start
   ```

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
