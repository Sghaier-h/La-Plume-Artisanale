# 🗄️ Guide : Utiliser pgAdmin avec la Base Existante OVH

**Date :** 20 janvier 2026  
**Objectif :** Se connecter à la base de données existante sur OVH via pgAdmin et utiliser toutes les tables existantes

---

## 🎯 CONFIGURATION PGADMIN

### Étape 1 : Créer un Tunnel SSH

**Dans un terminal PowerShell (laissez-le ouvert) :**

```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Important :** Laissez ce terminal ouvert pendant toute la session pgAdmin.

---

### Étape 2 : Configurer pgAdmin

1. **Ouvrir pgAdmin**

2. **Clic droit sur "Servers"** → **Create** → **Server**

3. **Onglet "General" :**
   - **Name :** `OVH - La Plume Artisanale`

4. **Onglet "Connection" :**
   - **Host name/address :** `localhost`
   - **Port :** `5433` (port du tunnel SSH)
   - **Maintenance database :** `ERP_La_Plume` (votre base existante)
   - **Username :** `Aviateur` (votre utilisateur PostgreSQL OVH)
   - **Password :** `Allbyfouta007` (votre mot de passe PostgreSQL OVH)
   - ✅ **Save password** (cocher)

5. **Onglet "Advanced" (optionnel) :**
   - **DB restriction :** Laissez vide pour voir toutes les bases

6. **Cliquez "Save"**

---

### Étape 3 : Vérifier la Connexion

1. **Développez le serveur** dans l'arborescence
2. **Développez "Databases"**
3. **Vous devriez voir votre base de données existante**

---

## 📊 UTILISER LA BASE EXISTANTE

### Option A : Utiliser la Base Existante (Recommandé)

Si vous avez déjà une base de données avec des tables, utilisez-la directement.

#### 1. Identifier le Nom de la Base

Dans pgAdmin :
- Développez **Databases**
- Votre base s'appelle : **`ERP_La_Plume`** ✅

#### 2. Vérifier les Tables Existantes

```sql
-- Dans pgAdmin, ouvrez Query Tool (clic droit sur la base → Query Tool)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### 3. Adapter la Configuration

Modifiez le fichier `.env` :

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

**Ou pour la connexion directe (sans tunnel) :**

```env
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

---

### Option B : Créer les Tables Manquantes dans la Base Existante

Si votre base existe mais qu'il manque certaines tables pour les modules Odoo :

#### 1. Ouvrir Query Tool dans pgAdmin

- Clic droit sur votre base → **Query Tool**

#### 2. Exécuter le Script de Création

Copiez le contenu de `creer-base-locale.sql` et exécutez-le dans Query Tool.

**⚠️ Important :** Le script crée les tables avec `CREATE TABLE IF NOT EXISTS`, donc les tables existantes ne seront pas modifiées.

---

## 🔧 CRÉER LES TABLES MANQUANTES VIA PGADMIN

### Méthode 1 : Exécuter le Script SQL

1. **Ouvrir Query Tool** (clic droit sur votre base → Query Tool)

2. **Ouvrir le fichier SQL :**
   - Cliquez sur l'icône **"Open File"** (📁)
   - Sélectionnez `creer-base-locale.sql`

3. **Exécuter le script :**
   - Cliquez sur **"Execute"** (▶️) ou appuyez sur `F5`

4. **Vérifier les résultats :**
   - Les tables seront créées si elles n'existent pas déjà

---

### Méthode 2 : Créer les Tables Individuellement

Si vous préférez créer les tables une par une :

#### Table `utilisateurs`

```sql
CREATE TABLE IF NOT EXISTS utilisateurs (
    id_utilisateur SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(50) DEFAULT 'USER',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `clients`

```sql
CREATE TABLE IF NOT EXISTS clients (
    id_client SERIAL PRIMARY KEY,
    code_client VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    telephone VARCHAR(20),
    email VARCHAR(150),
    contact_principal VARCHAR(200),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `commandes_clients`

```sql
CREATE TABLE IF NOT EXISTS commandes_clients (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `lignes_commande`

```sql
CREATE TABLE IF NOT EXISTS lignes_commande (
    id_ligne SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes_clients(id_commande) ON DELETE CASCADE,
    id_article INTEGER,
    designation VARCHAR(200) NOT NULL,
    quantite_commandee NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);
```

#### Table `articles_catalogue`

```sql
CREATE TABLE IF NOT EXISTS articles_catalogue (
    id_article SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    reference VARCHAR(100),
    id_categorie INTEGER,
    type_article VARCHAR(50),
    prix_vente NUMERIC(10,2) DEFAULT 0,
    prix_achat NUMERIC(10,2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `categories_articles`

```sql
CREATE TABLE IF NOT EXISTS categories_articles (
    id_categorie SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    id_categorie_parent INTEGER REFERENCES categories_articles(id_categorie),
    actif BOOLEAN DEFAULT true
);
```

#### Table `entrepots`

```sql
CREATE TABLE IF NOT EXISTS entrepots (
    id_entrepot SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'stockage',
    adresse TEXT,
    responsable VARCHAR(200),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `livraisons`

```sql
CREATE TABLE IF NOT EXISTS livraisons (
    id_livraison SERIAL PRIMARY KEY,
    numero_livraison VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'PREVUE',
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `ordres_fabrication`

```sql
CREATE TABLE IF NOT EXISTS ordres_fabrication (
    id_of SERIAL PRIMARY KEY,
    numero_of VARCHAR(50) UNIQUE NOT NULL,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    quantite_a_produire DECIMAL(10,2) NOT NULL,
    quantite_produite DECIMAL(10,2) DEFAULT 0,
    date_creation_of DATE NOT NULL DEFAULT CURRENT_DATE,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_reelle TIMESTAMP,
    date_fin_reelle TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'planifie',
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `factures_clients`

```sql
CREATE TABLE IF NOT EXISTS factures_clients (
    id_facture SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `commandes_fournisseurs`

```sql
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_fournisseur INTEGER,
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔍 VÉRIFIER LES TABLES EXISTANTES

### Dans pgAdmin

1. **Développez votre base de données**
2. **Développez "Schemas"** → **"public"** → **"Tables"**
3. **Vous verrez toutes les tables existantes**

### Avec une Requête SQL

```sql
-- Lister toutes les tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 🔄 ADAPTER LES MODÈLES AUX TABLES EXISTANTES

Si vos tables existantes ont des noms différents, vous devrez adapter les modèles Odoo.

### Exemple : Si votre table s'appelle `commandes` au lieu de `commandes_clients`

Modifiez le modèle `SaleOrder.js` :

```javascript
// Avant
const result = await pool.query('SELECT * FROM commandes_clients WHERE id_commande = $1', [id]);

// Après
const result = await pool.query('SELECT * FROM commandes WHERE id_commande = $1', [id]);
```

---

## 📝 CONFIGURATION FINALE

### 1. Identifier le Nom de la Base

Dans pgAdmin, notez le nom exact de votre base de données.

### 2. Modifier `.env`

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=nom_de_votre_base_existante
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

### 3. Vérifier les Tables

```bash
cd backend
node verifier-tables-modules-odoo.js
```

### 4. Tester les Modules

```bash
node test-modules-odoo.js
```

---

## 🎯 RÉSUMÉ DES ÉTAPES

1. ✅ **Créer le tunnel SSH** (terminal séparé)
2. ✅ **Configurer pgAdmin** avec localhost:5433
3. ✅ **Identifier le nom de votre base existante**
4. ✅ **Vérifier les tables existantes**
5. ✅ **Créer les tables manquantes** (si nécessaire)
6. ✅ **Adapter la configuration `.env`**
7. ✅ **Tester la connexion**

---

## 💡 AVANTAGES DE PGADMIN

- ✅ **Interface graphique** : Plus facile que la ligne de commande
- ✅ **Visualisation** : Voir toutes les tables et données
- ✅ **Requêtes SQL** : Exécuter des requêtes facilement
- ✅ **Gestion** : Créer/modifier/supprimer des tables visuellement

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
