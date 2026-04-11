# 🚀 Exécuter l'Import des Commandes avec Type de Personnalisation

## ⚠️ PostgreSQL n'est pas accessible automatiquement

Vous devez exécuter les scripts SQL manuellement via **pgAdmin** ou **psql**.

## 📋 Étapes d'Exécution

### Option 1 : Via pgAdmin (Recommandé)

#### Étape 1 : Ouvrir pgAdmin
1. Lancez **pgAdmin** sur votre ordinateur
2. Connectez-vous à votre serveur PostgreSQL
3. Développez l'arborescence jusqu'à votre base de données **ERP_La_Plume**

#### Étape 2 : Exécuter le Script de Structure
1. Clic droit sur la base de données **ERP_La_Plume**
2. Sélectionnez **Query Tool** (Outil de requête)
3. Cliquez sur l'icône **📁 Ouvrir un fichier** (ou `Ctrl+O`)
4. Naviguez vers : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\`
5. Sélectionnez le fichier **04_structure_commandes.sql**
6. Cliquez sur **▶ Exécuter** (ou `F5`)
7. Attendez la fin de l'exécution

**Résultat attendu :**
```
NOTICE: Colonne ref_client ajoutee a commandes
NOTICE: Colonne num_commande_client ajoutee a commandes
NOTICE: Colonne date_envoie ajoutee a commandes
NOTICE: Colonne ref_commerciale ajoutee a articles_commande
NOTICE: Colonne description_article ajoutee a articles_commande
NOTICE: Colonne dimensions ajoutee a articles_commande
NOTICE: Colonne type_finition ajoutee a articles_commande
NOTICE: Colonne personnalisation ajoutee a articles_commande
NOTICE: Colonne details_personnalisation ajoutee a articles_commande
NOTICE: Colonne prix_total_ht ajoutee a articles_commande
NOTICE: Colonne id_type_personnalisation ajoutee a articles_commande
NOTICE: Colonne fichier_personnalisation ajoutee a articles_commande
COMMIT
```

#### Étape 3 : Vérifier la Création de la Table
Dans le même Query Tool, exécutez :

```sql
-- Vérifier que la table existe et contient les 3 types
SELECT * FROM parametres_types_personnalisation;
```

**Résultat attendu :**
```
 id | code |    libelle    |           description            | actif 
----+------+---------------+----------------------------------+-------
  1 | BRO  | Broderie      | Personnalisation par broderie    | t
  2 | SER  | Sérigraphie   | Personnalisation par sérigraphie | t
  3 | AUT  | Autre         | Autre type de personnalisation  | t
```

#### Étape 4 : Exécuter le Script d'Import des Commandes
1. Dans le même Query Tool, cliquez sur **📁 Ouvrir un fichier** (ou `Ctrl+O`)
2. Naviguez vers : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\`
3. Sélectionnez le fichier **04_commandes_data.sql**
4. Cliquez sur **▶ Exécuter** (ou `F5`)
5. Attendez la fin de l'exécution (peut prendre quelques minutes)

**Résultat attendu :**
```
-- Les commandes seront insérées/mises à jour
-- Les lignes de commande seront insérées avec id_type_personnalisation = ID de "Broderie"
COMMIT
```

#### Étape 5 : Vérifier l'Import
Dans le Query Tool, exécutez :

```sql
-- Vérifier le nombre de commandes
SELECT COUNT(*) as nombre_commandes FROM commandes;

-- Vérifier le nombre de lignes de commande
SELECT COUNT(*) as nombre_lignes FROM articles_commande;

-- Vérifier les lignes avec personnalisation et type
SELECT 
    ac.ref_commerciale,
    ac.personnalisation,
    ptp.libelle as type_personnalisation,
    ac.details_personnalisation
FROM articles_commande ac
LEFT JOIN parametres_types_personnalisation ptp ON ptp.id = ac.id_type_personnalisation
WHERE ac.personnalisation = true
LIMIT 10;
```

### Option 2 : Via psql (Ligne de commande)

Si vous avez accès à `psql` en ligne de commande :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"

# Exécuter le script de structure
psql -U votre_utilisateur -d ERP_La_Plume -f database/imports/04_structure_commandes.sql

# Exécuter le script d'import
psql -U votre_utilisateur -d ERP_La_Plume -f database/imports/04_commandes_data.sql
```

## 📊 Statistiques Attendues

- **15 commandes** importées
- **1326 lignes** de commande importées
- Toutes les lignes avec `personnalisation = true` auront `id_type_personnalisation` pointant vers "Broderie"

## ✅ Vérification Finale

Après l'import, vérifiez que tout fonctionne :

```sql
-- Compter les commandes
SELECT COUNT(*) FROM commandes;

-- Compter les lignes
SELECT COUNT(*) FROM articles_commande;

-- Voir les types de personnalisation utilisés
SELECT 
    ptp.libelle,
    COUNT(*) as nombre_lignes
FROM articles_commande ac
JOIN parametres_types_personnalisation ptp ON ptp.id = ac.id_type_personnalisation
WHERE ac.personnalisation = true
GROUP BY ptp.libelle;
```

---

**✅ Une fois l'import terminé, les commandes seront disponibles dans l'application avec le type de personnalisation "Broderie" pour toutes les personnalisations.**
