# ✅ PostgreSQL est Démarré - Exécuter les Scripts SQL

## 🎉 Bonne Nouvelle

PostgreSQL est **déjà en cours d'exécution** sur le port **5432** !

## 📋 Méthode la Plus Simple : Via pgAdmin

### Étape 1 : Ouvrir pgAdmin
1. Lancez **pgAdmin** depuis le menu Démarrer
2. Connectez-vous à votre serveur PostgreSQL
3. Développez l'arborescence jusqu'à la base de données **ERP_La_Plume**

### Étape 2 : Exécuter le Script de Structure
1. **Clic droit** sur la base de données **ERP_La_Plume**
2. Sélectionnez **Query Tool** (Outil de requête)
3. Cliquez sur l'icône **📁 Ouvrir un fichier** (ou appuyez sur `Ctrl+O`)
4. Naviguez vers : 
   ```
   D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\
   ```
5. Sélectionnez le fichier : **04_structure_commandes.sql**
6. Cliquez sur le bouton **▶ Exécuter** (ou appuyez sur `F5`)
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

### Étape 3 : Vérifier la Création de la Table
Dans le même Query Tool, exécutez cette requête :

```sql
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

### Étape 4 : Exécuter le Script d'Import des Commandes
1. Dans le même Query Tool, cliquez sur **📁 Ouvrir un fichier** (ou `Ctrl+O`)
2. Naviguez vers le même dossier
3. Sélectionnez le fichier : **04_commandes_data.sql**
4. Cliquez sur **▶ Exécuter** (ou `F5`)
5. Attendez la fin de l'exécution (peut prendre quelques minutes)

**Résultat attendu :**
```
COMMIT
```

### Étape 5 : Vérifier l'Import
Dans le Query Tool, exécutez ces requêtes :

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

## 📊 Statistiques Attendues

- **15 commandes** importées
- **1326 lignes** de commande importées
- Toutes les lignes avec `personnalisation = true` auront `id_type_personnalisation` pointant vers "Broderie"

## ⚠️ Si vous rencontrez des erreurs

### Erreur : "relation parametres_types_personnalisation does not exist"
→ Exécutez d'abord le script `04_structure_commandes.sql`

### Erreur : "column id_type_personnalisation does not exist"
→ Exécutez d'abord le script `04_structure_commandes.sql`

### Erreur de connexion
→ Vérifiez que PostgreSQL est bien démarré :
```powershell
Get-Service | Where-Object { $_.Name -like "*postgres*" }
```

---

**✅ Une fois terminé, les commandes seront disponibles dans l'application avec le type de personnalisation "Broderie" !**
