# 📥 Guide d'Exécution - Import des Commandes

## ✅ Scripts Prêts

1. **Script de structure** : `database/imports/04_structure_commandes.sql` ✅ (Déjà exécuté)
2. **Script d'import** : `database/imports/04_commandes_data.sql` ✅ (Corrigé et prêt)

## 🔧 Méthode 1 : Via pgAdmin (Recommandé)

### Étape 1 : Ouvrir pgAdmin
1. Lancez **pgAdmin** sur votre ordinateur
2. Connectez-vous à votre serveur PostgreSQL
3. Développez l'arborescence jusqu'à votre base de données **ERP_La_Plume**

### Étape 2 : Ouvrir Query Tool
1. Clic droit sur la base de données **ERP_La_Plume**
2. Sélectionnez **Query Tool** (ou **Outil de requête**)

### Étape 3 : Charger le script
1. Dans Query Tool, cliquez sur l'icône **📁 Ouvrir un fichier** (ou `Ctrl+O`)
2. Naviguez vers : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\`
3. Sélectionnez le fichier **04_commandes_data.sql**

### Étape 4 : Exécuter le script
1. Vérifiez que le script est chargé (vous devriez voir le contenu SQL)
2. Cliquez sur le bouton **▶ Exécuter** (ou appuyez sur `F5`)
3. Attendez la fin de l'exécution (peut prendre quelques minutes)

### Étape 5 : Vérifier les résultats
Vous devriez voir des messages de succès. Ensuite, exécutez cette requête pour vérifier :

```sql
-- Vérifier le nombre de commandes importées
SELECT COUNT(*) as nombre_commandes FROM commandes;

-- Vérifier le nombre de lignes de commande importées
SELECT COUNT(*) as nombre_lignes FROM articles_commande;

-- Voir quelques commandes
SELECT 
    numero_commande, 
    ref_client, 
    statut, 
    date_commande 
FROM commandes 
ORDER BY date_commande DESC 
LIMIT 10;

-- Voir quelques lignes avec détails
SELECT 
    c.numero_commande,
    ac.ref_commerciale,
    ac.description_article,
    ac.quantite_commandee,
    ac.prix_unitaire,
    ac.prix_total_ht,
    ac.personnalisation
FROM articles_commande ac
JOIN commandes c ON c.id_commande = ac.id_commande
ORDER BY c.date_commande DESC
LIMIT 10;
```

---

## 🔧 Méthode 2 : Via psql (Ligne de commande)

### Étape 1 : Ouvrir PowerShell ou CMD
Ouvrez un terminal PowerShell ou CMD

### Étape 2 : Se connecter à PostgreSQL
```bash
psql -U Aviateur -d ERP_La_Plume -h localhost
```

(Si demandé, entrez votre mot de passe)

### Étape 3 : Exécuter le script
```sql
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/imports/04_commandes_data.sql"
```

**Note** : Utilisez des `/` au lieu de `\` dans le chemin pour psql

### Étape 4 : Vérifier
Exécutez les mêmes requêtes de vérification que dans la Méthode 1

---

## 🔧 Méthode 3 : Via Node.js (Si PostgreSQL est accessible)

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/executer-import.js database/imports/04_commandes_data.sql
```

---

## ⚠️ Important

- Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans créer de doublons
- Le script utilise `ON CONFLICT DO UPDATE` pour mettre à jour les données existantes
- **Temps d'exécution estimé** : 2-5 minutes pour 1 326 lignes

---

## ❌ En cas d'erreur

### Erreur : "column code_article does not exist"
→ Les articles n'ont pas été importés. Exécutez d'abord :
```sql
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/imports/03_articles_data.sql"
```

### Erreur : "column ref_commerciale does not exist"
→ Le script a été corrigé pour utiliser `code_article`. Si vous avez une ancienne version, régénérez le script :
```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
python scripts/analyser_commandes.py
python scripts/corriger_script_commandes.py
```

### Erreur : "foreign key constraint"
→ Vérifiez que les clients existent dans la table `clients` :
```sql
SELECT COUNT(*) FROM clients WHERE code_client IN ('CL00884', 'CL00296', ...);
```

---

## ✅ Résultat Attendu

Après l'import réussi, vous devriez avoir :
- **15 commandes** dans la table `commandes`
- **1 326 lignes de commande** dans la table `articles_commande`
- Toutes les colonnes remplies (ref_commerciale, description, dimensions, finition, personnalisation, etc.)

---

**Besoin d'aide ?** Dites-moi quelle erreur vous rencontrez et je vous aiderai à la résoudre ! 🚀
