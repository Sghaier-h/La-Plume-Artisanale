# 📋 Guide de Réimport des Commandes avec Type de Personnalisation

Ce guide explique comment réimporter les commandes avec le nouveau champ "Type de Personnalisation".

## ✅ Prérequis

- PostgreSQL doit être démarré et accessible
- Les tables `commandes` et `articles_commande` doivent exister
- Le fichier Excel `Commandes 2025-2026.xlsx` doit être dans le dossier `Excel fab`

## 🔄 Étapes d'Import

### 1. Exécuter le Script de Structure (si pas déjà fait)

Ce script crée :
- La table `parametres_types_personnalisation` avec les valeurs (Broderie, Sérigraphie, Autre)
- Les colonnes `id_type_personnalisation` et `fichier_personnalisation` dans `articles_commande`

**Dans pgAdmin ou psql :**

```sql
-- Exécuter le script de structure
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/imports/04_structure_commandes.sql"
```

**Ou via psql en ligne de commande :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
psql -U votre_utilisateur -d votre_base -f database/imports/04_structure_commandes.sql
```

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

### 2. Vérifier la Création de la Table des Types de Personnalisation

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

### 3. Régénérer le Script SQL des Commandes (déjà fait)

Le script Python a été exécuté et a généré `04_commandes_data.sql` avec :
- **15 commandes** uniques
- **1326 lignes** de commande
- **Type de personnalisation = "Broderie"** par défaut pour toutes les personnalisations (car la colonne n'existe pas dans Excel)

**Note importante :** Le script détecte automatiquement que la colonne "Type de personnalisation" n'existe pas dans Excel et assigne "Broderie" par défaut pour toutes les lignes avec `personnalisation = "Oui"`.

### 4. Exécuter le Script d'Import des Commandes

**Dans pgAdmin ou psql :**

```sql
-- Exécuter le script d'import
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/imports/04_commandes_data.sql"
```

**Ou via psql en ligne de commande :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
psql -U votre_utilisateur -d votre_base -f database/imports/04_commandes_data.sql
```

**Résultat attendu :**
```
-- Les commandes seront insérées/mises à jour
-- Les lignes de commande seront insérées avec id_type_personnalisation = ID de "Broderie"
COMMIT
```

### 5. Vérifier l'Import

```sql
-- Vérifier le nombre de commandes
SELECT COUNT(*) FROM commandes;

-- Vérifier le nombre de lignes de commande
SELECT COUNT(*) FROM articles_commande;

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

## 📊 Statistiques Attendues

- **15 commandes** importées
- **1326 lignes** de commande importées
- Toutes les lignes avec `personnalisation = true` auront `id_type_personnalisation` pointant vers "Broderie"

## ⚠️ Notes Importantes

1. **Doublons :** Le script détecte et supprime automatiquement les doublons basés sur la combinaison :
   - `num_commande + ref_commercial + personnalisation + type_personnalisation + type_finition + details_personnalisation`

2. **Type de Personnalisation par défaut :** Comme la colonne n'existe pas dans Excel, toutes les personnalisations sont automatiquement assignées à "Broderie".

3. **Idempotence :** Les scripts utilisent `ON CONFLICT DO UPDATE`, donc ils peuvent être exécutés plusieurs fois sans créer de doublons.

## 🔍 Dépannage

### Erreur : "relation parametres_types_personnalisation does not exist"
→ Exécuter d'abord le script `04_structure_commandes.sql`

### Erreur : "column id_type_personnalisation does not exist"
→ Exécuter d'abord le script `04_structure_commandes.sql`

### Les types de personnalisation ne sont pas créés
→ Vérifier que la section 3 du script `04_structure_commandes.sql` a bien été exécutée

---

**✅ Une fois l'import terminé, les commandes seront disponibles dans l'application avec le type de personnalisation "Broderie" pour toutes les personnalisations.**
