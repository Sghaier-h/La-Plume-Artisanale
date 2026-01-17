# Exécution du Schéma SQL - Module Ventes

Ce guide explique comment exécuter le schéma SQL du module Ventes dans votre base de données PostgreSQL.

## 📋 Prérequis

- Base de données PostgreSQL accessible
- Variables de connexion configurées dans `backend/.env`
- Accès à la base de données (via psql ou pgAdmin)

## 🚀 Méthode 1: Script Automatique (Recommandé)

### Sur Linux/macOS

```bash
# Depuis le répertoire racine du projet
bash scripts/executer-schema-ventes.sh
```

Le script va:
1. Vérifier la configuration (`backend/.env`)
2. Charger les variables d'environnement
3. Exécuter le schéma SQL via `psql`

### Sur Windows (PowerShell)

Si `psql` est installé dans votre PATH:

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
bash scripts/executer-schema-ventes.sh
```

> **Note**: Sur Windows, vous devrez peut-être installer PostgreSQL Client Tools ou utiliser pgAdmin (Méthode 2).

## 🖥️ Méthode 2: Via pgAdmin (Recommandé pour Windows)

### Étapes

1. **Ouvrir pgAdmin**
   - Lancez pgAdmin sur votre machine

2. **Créer une connexion SSH Tunnel** (si nécessaire)
   - Pour OVH Cloud DB, créez un tunnel SSH vers le serveur
   - Hébergement: `localhost` (tunnel local)
   - Port: Port du tunnel (ex: 5433)
   - Base: `ERP_La_Plume`
   - Utilisateur: `Aviateur`
   - Mot de passe: Depuis `backend/.env`

3. **Ouvrir l'outil Query Tool**
   - Clic droit sur la base de données `ERP_La_Plume`
   - Sélectionnez "Query Tool"

4. **Charger le fichier SQL**
   - Cliquez sur "Open File" (ou Ctrl+O)
   - Naviguez vers: `backend/database/schema_ventes.sql`
   - OU copiez-collez le contenu du fichier

5. **Exécuter le script**
   - Cliquez sur "Execute" (F5)
   - Vérifiez les messages de succès

### Vérification

Après l'exécution, vérifiez que les tables existent:

```sql
-- Lister les tables du module vente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'devis', 'lignes_devis',
    'bons_livraison', 'lignes_bl',
    'factures', 'lignes_facture',
    'avoirs', 'lignes_avoir',
    'bons_retour', 'lignes_retour'
  )
ORDER BY table_name;
```

## 🔧 Méthode 3: Via psql en ligne de commande

### Connexion directe

```bash
# Charger les variables d'environnement
export $(grep -v '^#' backend/.env | xargs)

# Exécuter le schéma
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f backend/database/schema_ventes.sql
```

### Via SSH vers le serveur

```bash
# Se connecter au serveur
ssh ubuntu@137.74.40.191

# Naviguer vers le projet
cd /opt/fouta-erp

# Exécuter le schéma (si psql est installé sur le serveur)
# Note: Cela nécessite que le serveur ait accès à la base de données OVH Cloud DB
```

## ✅ Vérification Post-Exécution

### 1. Vérifier les tables

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE '%devis%' 
   OR table_name LIKE '%livraison%'
   OR table_name LIKE '%facture%'
   OR table_name LIKE '%avoir%'
   OR table_name LIKE '%retour%'
ORDER BY table_name;
```

### 2. Vérifier les fonctions

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'generer_numero%'
ORDER BY routine_name;
```

### 3. Tester une fonction

```sql
-- Tester la génération de numéro de devis
SELECT generer_numero_devis();
-- Résultat attendu: DEV-2024-0001 (ou similaire)
```

## 🔍 Dépannage

### Erreur: "relation already exists"

Si une table existe déjà, le script utilise `CREATE TABLE IF NOT EXISTS`, donc c'est normal. Si vous voulez recréer une table:

```sql
-- ⚠️ ATTENTION: Supprime les données existantes
DROP TABLE IF EXISTS lignes_devis CASCADE;
DROP TABLE IF EXISTS devis CASCADE;
-- Répétez pour toutes les tables si nécessaire
```

### Erreur: "permission denied"

Vérifiez que l'utilisateur de la base de données a les permissions nécessaires:

```sql
-- Vérifier les permissions
SELECT * FROM information_schema.role_table_grants 
WHERE grantee = 'Aviateur';
```

### Erreur de connexion

1. **Vérifier les variables dans `backend/.env`**
   ```bash
   cat backend/.env | grep DB_
   ```

2. **Tester la connexion manuellement**
   ```bash
   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
   ```

3. **Vérifier l'IP autorisée** (OVH Cloud DB)
   - Connectez-vous au panel OVH
   - Allez dans "Bases de données" > Votre DB
   - Vérifiez "IP autorisées"

## 📊 Structure des Tables Créées

### Devis
- `devis` - Table principale des devis
- `lignes_devis` - Lignes de chaque devis

### Bons de Livraison
- `bons_livraison` - Table principale des BL
- `lignes_bl` - Lignes de chaque BL

### Factures
- `factures` - Table principale des factures
- `lignes_facture` - Lignes de chaque facture

### Avoirs
- `avoirs` - Table principale des avoirs
- `lignes_avoir` - Lignes de chaque avoir

### Bons de Retour
- `bons_retour` - Table principale des retours
- `lignes_retour` - Lignes de chaque retour

## 🎯 Prochaines Étapes

Après l'exécution du schéma:

1. ✅ Le backend est déjà configuré avec les routes API
2. ✅ Le frontend est déjà connecté aux APIs
3. ✅ Vous pouvez maintenant créer des devis, factures, etc. via l'interface

## 📝 Notes Importantes

- Le schéma utilise `CREATE TABLE IF NOT EXISTS`, donc l'exécution multiple est sûre
- Les tables sont liées aux tables existantes (`clients`, `commandes`, `articles_catalogue`)
- Les fonctions de génération de numéros sont créées automatiquement
- Les indexes sont créés pour optimiser les performances
