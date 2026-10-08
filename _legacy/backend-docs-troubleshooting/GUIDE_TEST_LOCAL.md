# 🧪 Guide : Tester les Modules Odoo en Local

**Date :** 20 janvier 2026  
**Objectif :** Tester les modules Odoo sans tunnel SSH en utilisant une base PostgreSQL locale

---

## 🎯 AVANTAGES

✅ **Pas besoin de tunnel SSH**  
✅ **Tests rapides**  
✅ **Base de données isolée**  
✅ **Données de test incluses**

---

## 📋 ÉTAPES

### 1. Créer la Base de Données Locale

#### Option A : Avec le script SQL

```bash
cd backend
psql -h localhost -p 5432 -U postgres -f creer-base-locale.sql
```

**Si demande le mot de passe :** Entrez le mot de passe de l'utilisateur `postgres`

#### Option B : Manuellement

```sql
-- Se connecter à PostgreSQL
psql -h localhost -p 5432 -U postgres

-- Créer la base
CREATE DATABASE "ERP_La_Plume_Local";

-- Se connecter à la nouvelle base
\c "ERP_La_Plume_Local"

-- Exécuter le script
\i creer-base-locale.sql
```

---

### 2. Configurer l'Environnement Local

#### Option A : Avec le script PowerShell

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File configurer-base-locale.ps1
```

#### Option B : Manuellement

Créez un fichier `.env.local` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume_Local
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres

DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/ERP_La_Plume_Local?schema=public"
```

---

### 3. Basculer vers la Configuration Locale

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
```

**Ou manuellement :**

```powershell
Copy-Item .env.local .env -Force
```

---

### 4. Tester les Modules

```bash
cd backend
node test-modules-odoo.js
```

**Ou vérifier les tables :**

```bash
node verifier-tables-modules-odoo.js
```

---

## 🔄 BASCULER ENTRE LOCAL ET DISTANT

### Vers Local (pour tests)

```powershell
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
```

### Vers Distant (OVH - nécessite tunnel SSH)

```powershell
powershell -ExecutionPolicy Bypass -File basculer-env-distant.ps1
```

**N'oubliez pas de créer le tunnel SSH avant !**

---

## 📊 TABLES CRÉÉES

Le script `creer-base-locale.sql` crée :

1. ✅ `utilisateurs` - Utilisateurs
2. ✅ `clients` - Clients (res.partner)
3. ✅ `commandes_clients` - Commandes de vente (sale.order)
4. ✅ `lignes_commande` - Lignes de commande (sale.order.line)
5. ✅ `articles_catalogue` - Produits (product.template)
6. ✅ `categories_articles` - Catégories (product.category)
7. ✅ `entrepots` - Entrepôts (stock.warehouse)
8. ✅ `livraisons` - Livraisons (stock.picking)
9. ✅ `ordres_fabrication` - Ordres de fabrication (mrp.production)
10. ✅ `factures_clients` - Factures (account.move)
11. ✅ `commandes_fournisseurs` - Commandes d'achat (purchase.order)

---

## 🧪 DONNÉES DE TEST

Le script ajoute automatiquement :

- **1 client de test** : `CLI001 - Client Test 1`
- **1 catégorie** : `Categorie Test`
- **2 articles** : `ART001` et `ART002`
- **1 entrepôt** : `E1 - Entrepot Principal`

---

## ✅ VALIDATION

### Test 1 : Connexion

```bash
cd backend
node test-connexion-simple.js
```

**Résultat attendu :** `✅ Port 5432: CONNEXION RÉUSSIE`

### Test 2 : Tables

```bash
node verifier-tables-modules-odoo.js
```

**Résultat attendu :** Toutes les tables trouvées

### Test 3 : Modules

```bash
node test-modules-odoo.js
```

**Résultat attendu :** Tous les tests réussis

---

## 🎯 COMMANDES RAPIDES

### Configuration complète

```powershell
# 1. Créer la base
psql -h localhost -p 5432 -U postgres -f creer-base-locale.sql

# 2. Configurer
powershell -ExecutionPolicy Bypass -File configurer-base-locale.ps1

# 3. Basculer vers local
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1

# 4. Tester
node test-modules-odoo.js
```

---

## 🔄 RETOUR À LA CONFIGURATION DISTANTE

Quand vous voulez revenir à la base OVH :

```powershell
# 1. Créer le tunnel SSH (dans un terminal séparé)
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N

# 2. Basculer vers distant
powershell -ExecutionPolicy Bypass -File basculer-env-distant.ps1
```

---

## 💡 AVANTAGES DU TEST LOCAL

1. ✅ **Rapide** : Pas d'attente de connexion SSH
2. ✅ **Isolé** : Ne modifie pas les données de production
3. ✅ **Contrôlable** : Vous maîtrisez toutes les données
4. ✅ **Reproductible** : Même environnement pour tous

---

## ⚠️ LIMITATIONS

- Les données locales sont différentes de la production
- Certaines fonctionnalités peuvent nécessiter la base distante
- Les tests locaux ne reflètent pas l'environnement réel

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
