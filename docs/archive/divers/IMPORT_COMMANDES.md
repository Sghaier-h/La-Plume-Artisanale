# 📥 Import des Commandes - Guide d'Exécution

## ✅ Scripts Générés

1. **Script de structure** : `database/imports/04_structure_commandes.sql`
   - Ajoute les colonnes nécessaires aux tables `commandes` et `articles_commande`

2. **Script d'import** : `database/imports/04_commandes_data.sql`
   - 15 commandes uniques
   - 1 326 lignes de commande (464 doublons supprimés)

## 🔧 Méthodes d'Exécution

### Méthode 1 : Via pgAdmin (Recommandé)

1. Ouvrir **pgAdmin**
2. Se connecter à votre serveur PostgreSQL
3. Sélectionner la base de données `ERP_La_Plume`
4. Cliquer sur **Tools** → **Query Tool**
5. Ouvrir le fichier `database/imports/04_structure_commandes.sql`
6. Exécuter le script (F5)
7. Répéter avec `database/imports/04_commandes_data.sql`

### Méthode 2 : Via psql (Ligne de commande)

```bash
# Se connecter à PostgreSQL
psql -U Aviateur -d ERP_La_Plume -h localhost

# Dans psql, exécuter :
\i "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\04_structure_commandes.sql"
\i "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\04_commandes_data.sql"
```

### Méthode 3 : Via Node.js (si PostgreSQL est accessible)

```bash
cd backend
node scripts/executer-import.js database/imports/04_structure_commandes.sql
node scripts/executer-import.js database/imports/04_commandes_data.sql
```

## ⚠️ Ordre d'Exécution

**IMPORTANT** : Exécuter d'abord le script de structure, puis le script d'import :

1. ✅ `04_structure_commandes.sql` (ajoute les colonnes)
2. ✅ `04_commandes_data.sql` (insère les données)

## 📊 Vérification

Après l'import, vérifier les données :

```sql
-- Vérifier le nombre de commandes
SELECT COUNT(*) FROM commandes;

-- Vérifier le nombre de lignes de commande
SELECT COUNT(*) FROM articles_commande;

-- Voir quelques commandes
SELECT numero_commande, ref_client, statut, date_commande 
FROM commandes 
ORDER BY date_commande DESC 
LIMIT 10;

-- Voir quelques lignes avec tous les détails
SELECT 
    c.numero_commande,
    ac.ref_commerciale,
    ac.description_article,
    ac.dimensions,
    ac.type_finition,
    ac.quantite_commandee,
    ac.prix_unitaire,
    ac.prix_total_ht,
    ac.personnalisation,
    ac.details_personnalisation
FROM articles_commande ac
JOIN commandes c ON c.id_commande = ac.id_commande
ORDER BY c.date_commande DESC
LIMIT 10;
```

## 🔄 Scripts Idempotents

Les scripts sont **idempotents** : ils peuvent être exécutés plusieurs fois sans créer de doublons grâce à `ON CONFLICT DO UPDATE`.

## 📝 Notes

- Les colonnes ajoutées par le script de structure sont :
  - `commandes` : `ref_client`, `num_commande_client`, `date_envoie`
  - `articles_commande` : `ref_commerciale`, `description_article`, `dimensions`, `type_finition`, `personnalisation`, `details_personnalisation`, `prix_total_ht`

- Les données sont liées automatiquement aux articles via `ref_commerciale`
- Les prix sont récupérés depuis les articles si disponibles
