# Guide d'Import des Articles Parents

## Vue d'ensemble

Ce guide explique comment importer tous les modèles d'articles parents dans la base de données.

## Étapes

### 1. Insérer les attributs de base (obligatoire)

D'abord, exécutez le script pour insérer tous les attributs :

```sql
-- Exécuter dans l'ordre :
\i database/insert_attributs_catalogue.sql
```

Ce script insère :
- Types de tissages (Eponge, Jacquard, etc.)
- Dimensions (avec codes)
- Finitions (Frange, Couture, etc.)
- Couleurs (toutes les couleurs C01 à C34, etc.)
- Types de produits (Fouta, Jeté, etc.)
- Nombre de couleurs (2, 3, 4, 5, 6, Uni)

### 2. Créer les fonctions SQL (obligatoire)

Ensuite, créez les fonctions SQL nécessaires :

```sql
-- Exécuter :
\i database/insert_modeles_articles_parents.sql
```

Ce script crée :
- `parse_prix()` : convertit les prix au format français
- `generer_code_article()` : génère automatiquement le code article
- `insert_article_parent()` : insère ou met à jour un article

### 3. Insérer les articles parents

#### Option A : Script Python (Recommandé)

Si vous avez un fichier Excel avec toutes les données :

1. Exportez votre Excel en CSV (Fichier → Enregistrer sous → CSV UTF-8)
2. Placez le CSV dans `Excel fab/Parametrages.csv`
3. Utilisez le script Python :

```bash
python La-Plume-Artisanale/scripts/generer_insert_articles_parents.py "Excel fab/Parametrages.csv" "La-Plume-Artisanale/database/insert_articles_parents_complet.sql"
```

#### Option B : Script SQL manuel

Modifiez `insert_articles_parents_toutes_donnees.sql` et ajoutez toutes vos lignes en suivant ce format :

```sql
SELECT insert_article_parent(
  'ARTHUR',           -- Modèle (nom complet)
  'AR',               -- Code modèle
  'Fouta',            -- Type de produit
  '1020',             -- Code dimension
  'Tissage Plat',     -- Type de tissage (nom complet)
  'PL',               -- Code type de tissage
  '2 Couleurs',       -- Nombre de couleurs (nom complet)
  'B',                -- Code nombre de couleurs
  'Frange',           -- Type de finition (nom complet)
  'FR',               -- Code type de finition
  1,                  -- Composition (nombre)
  '7,500',            -- Prix de revient (avec virgule comme séparateur de milliers)
  '9,750'             -- Prix de vente (avec virgule comme séparateur de milliers)
);
```

#### Option C : CSV direct

Créez un fichier CSV `Excel fab/Parametrages.csv` avec ces colonnes :

```csv
Modele,Code_Modele,Type_Produit,Code_Dim,Tissage,Code_Tissage,Nb_Couleurs,Code_Nb_Couleurs,Finition,Code_Finition,Composition,Prix_Revient,Prix_Vente
ARTHUR,AR,Fouta,1020,Tissage Plat,PL,2 Couleurs,B,Frange,FR,1,7.500,9.750
ARTHUR,AR,Fouta,1626,Tissage Plat,PL,2 Couleurs,B,Frange,FR,1,9.750,12.675
...
```

Puis utilisez le script Python avec le CSV.

## Structure des données

### Colonnes requises

| Colonne | Description | Exemple | Obligatoire |
|---------|-------------|---------|-------------|
| `Modele` | Nom du modèle | ARTHUR | Non |
| `Code_Modele` | Code du modèle | AR | **Oui** |
| `Type_Produit` | Type de produit | Fouta | Non |
| `Code_Dim` | Code dimension | 1020 | **Oui** |
| `Tissage` | Type de tissage | Tissage Plat | Non |
| `Code_Tissage` | Code tissage | PL | **Oui** |
| `Nb_Couleurs` | Nombre de couleurs | 2 Couleurs | Non |
| `Code_Nb_Couleurs` | Code nb couleurs | B | Non |
| `Finition` | Type de finition | Frange | Non |
| `Code_Finition` | Code finition | FR | Non |
| `Composition` | Composition | 1 | Non |
| `Prix_Revient` | Prix de revient | 7,500 | Non |
| `Prix_Vente` | Prix de vente | 9,750 | Non |

### Exemples de codes générés

Le code article est généré automatiquement :
- Format : `CODE_MODELE-CODE_DIM-CODE_TISSAGE-CODE_NB_COULEURS-CODE_FINITION`
- Exemple : `AR-1020-PL-B-FR` pour ARTHUR, dimension 1020, Tissage Plat, 2 Couleurs, Frange

## Vérification

Après l'import, vérifiez le nombre d'articles :

```sql
SELECT COUNT(*) FROM articles_catalogue WHERE id_modele IS NOT NULL;
```

Affichez quelques exemples :

```sql
SELECT 
  code_article,
  designation,
  prix_revient,
  prix_unitaire_base
FROM articles_catalogue 
WHERE id_modele IS NOT NULL 
LIMIT 10;
```

## Dépannage

### Erreur : "Les fonctions doivent être créées d'abord"
→ Exécutez d'abord `insert_modeles_articles_parents.sql`

### Erreur : "Relation does not exist"
→ Vérifiez que `insert_attributs_catalogue.sql` a été exécuté

### Articles non insérés
→ Vérifiez que les codes (modèle, dimension, tissage, etc.) correspondent exactement à ceux dans les tables `parametres_*`
