# 📋 Exécution du Script SQL - Ajout created_by/updated_by

## ✅ Méthode 1 : Via le Serveur SSH (Recommandé)

### Sur le serveur Linux :

```bash
# Se connecter au serveur
ssh ubuntu@137.74.40.191

# Aller dans le projet
cd /opt/fouta-erp  # ou le chemin de votre projet

# Pull les dernières modifications
git pull origin main

# Exécuter le script
bash scripts/executer-add-created-updated-by.sh
```

Le script va automatiquement :
1. Charger les variables d'environnement depuis `backend/.env`
2. Se connecter à la base de données
3. Exécuter le script SQL
4. Afficher le résultat

---

## ✅ Méthode 2 : Via pgAdmin (Windows)

### Étapes :

1. **Ouvrir pgAdmin**
   - Lancez pgAdmin sur votre machine

2. **Connecter à la base de données**
   - Si vous avez déjà une connexion : utilisez-la
   - Sinon, créez une connexion vers :
     - **Host:** `sh131616-002.eu.clouddb.ovh.net`
     - **Port:** `35392`
     - **Database:** `ERP_La_Plume`
     - **User:** `Aviateur`
     - **Password:** `Allbyfouta007`

3. **Ouvrir Query Tool**
   - Clic droit sur la base `ERP_La_Plume`
   - Sélectionnez **"Query Tool"**

4. **Charger le fichier SQL**
   - Cliquez sur **"Open File"** (ou `Ctrl+O`)
   - Naviguez vers : `backend/database/add_created_updated_by.sql`
   - OU copiez-collez le contenu du fichier dans l'éditeur

5. **Exécuter le script**
   - Cliquez sur **"Execute"** (ou `F5`)
   - Vérifiez les messages de succès dans les messages

### Résultat attendu :

```
CREATE FUNCTION
DO
DO
DO
...
COMMENT
```

---

## ✅ Méthode 3 : Via psql en ligne de commande (si installé)

### Windows :

Si vous avez installé PostgreSQL Client :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$env:PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f backend\database\add_created_updated_by.sql
```

### Linux/macOS :

```bash
cd /path/to/La-Plume-Artisanale
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f backend/database/add_created_updated_by.sql
```

---

## 🔍 Vérification

Après l'exécution, vérifiez que les colonnes ont été ajoutées :

```sql
-- Vérifier une table exemple
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND column_name IN ('created_by', 'updated_by');

-- Vérifier plusieurs tables
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('created_by', 'updated_by')
ORDER BY table_name, column_name;
```

Vous devriez voir les colonnes `created_by` et `updated_by` pour toutes les tables principales.

---

## 📊 Tables concernées

Le script ajoute les champs aux tables suivantes :

### Module Ventes :
- `devis` (ajoute `updated_by`)
- `bons_livraison` (ajoute `updated_by`)
- `factures` (ajoute `updated_by`)
- `avoirs` (ajoute `updated_by`)
- `bons_retour` (ajoute `updated_by`)

### Module Clients/Fournisseurs :
- `clients` (ajoute `created_by`, `updated_by`)
- `fournisseurs` (ajoute `created_by`, `updated_by`)

### Module Production :
- `ordres_fabrication` (ajoute `created_by`, `updated_by`)
- `suivi_fabrication` (ajoute `created_by`, `updated_by`)
- `commandes` (ajoute `created_by`, `updated_by`)

### Module Stock :
- `articles_catalogue` (ajoute `created_by`, `updated_by`)
- `matieres_premieres` (ajoute `created_by`, `updated_by`)
- `machines` (ajoute `created_by`, `updated_by`)

### Module Sous-traitance :
- `sous_traitants` (ajoute `created_by`, `updated_by`)
- `mouvements_sous_traitance` (ajoute `created_by`, `updated_by`)

### Module Qualité :
- `qualite_avancee` (si la table existe) (ajoute `created_by`, `updated_by`)

---

## ⚠️ Notes importantes

- Le script est **idempotent** : il vérifie si les colonnes existent avant de les ajouter
- Vous pouvez l'exécuter plusieurs fois sans risque
- Les colonnes sont de type `INTEGER` (référence à `utilisateurs.id_utilisateur`)
- Les colonnes sont **NULL** par défaut pour les enregistrements existants
