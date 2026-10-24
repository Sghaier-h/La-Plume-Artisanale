# 🚀 Démarrage Rapide : Test Local

## 📋 Étapes Rapides

### 1. Créer la Base de Données Locale

**Option A : Script interactif (recommandé)**

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File creer-base-locale-interactif.ps1
```

Le script vous demandera le mot de passe PostgreSQL.

**Option B : Manuellement**

```powershell
# 1. Définir le mot de passe
$env:DB_PASSWORD = "votre_mot_de_passe_postgres"

# 2. Créer la base
node creer-base-locale-node.js

# 3. Basculer vers local
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
```

**Option C : Avec psql (si disponible)**

```bash
psql -h localhost -p 5432 -U postgres -f creer-base-locale.sql
```

---

### 2. Tester les Modules

```bash
cd backend
node test-modules-odoo.js
```

---

## ✅ Vérification

### Test de Connexion

```bash
node test-connexion-simple.js
```

**Résultat attendu :** `✅ Port 5432: CONNEXION RÉUSSIE`

### Vérifier les Tables

```bash
node verifier-tables-modules-odoo.js
```

**Résultat attendu :** Toutes les tables trouvées

---

## 🔄 Basculer entre Local et Distant

### Vers Local

```powershell
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
```

### Vers Distant (OVH)

```powershell
# 1. Créer le tunnel SSH (dans un terminal séparé)
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N

# 2. Basculer vers distant
powershell -ExecutionPolicy Bypass -File basculer-env-distant.ps1
```

---

## 📝 Configuration

Le fichier `.env.local` contient :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume_Local
DB_USER=postgres
DB_PASSWORD=postgres
```

**⚠️ Modifiez le mot de passe si nécessaire !**

---

## 🎯 Commandes Rapides

```powershell
# Tout en une fois
cd backend
powershell -ExecutionPolicy Bypass -File creer-base-locale-interactif.ps1
node test-modules-odoo.js
```

---

**Document créé le :** 20 janvier 2026
