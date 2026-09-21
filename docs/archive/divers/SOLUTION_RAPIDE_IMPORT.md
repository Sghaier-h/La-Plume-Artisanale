# ✅ Solution Rapide - Exécuter les Scripts SQL

## 🎯 PostgreSQL est Démarré !

PostgreSQL fonctionne sur le port **5432**. Le problème d'authentification avec le script Node.js peut être résolu, mais la méthode la plus simple est d'utiliser **pgAdmin**.

## 🚀 Méthode Recommandée : pgAdmin

### Étape 1 : Ouvrir pgAdmin
1. Lancez **pgAdmin** depuis le menu Démarrer
2. Connectez-vous (utilisez votre mot de passe pgAdmin habituel)
3. Développez l'arborescence :
   - **Servers** → Votre serveur → **Databases** → **ERP_La_Plume**

### Étape 2 : Exécuter le Script de Structure
1. **Clic droit** sur **ERP_La_Plume** → **Query Tool**
2. **Ctrl+O** (Ouvrir fichier)
3. Naviguez vers :
   ```
   D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\
   ```
4. Sélectionnez : **04_structure_commandes.sql**
5. **F5** (Exécuter)

**Attendez le message : `COMMIT`**

### Étape 3 : Vérifier la Table
Dans le même Query Tool, exécutez :

```sql
SELECT * FROM parametres_types_personnalisation;
```

Vous devriez voir 3 lignes : Broderie, Sérigraphie, Autre

### Étape 4 : Exécuter le Script d'Import
1. **Ctrl+O** (Ouvrir fichier)
2. Sélectionnez : **04_commandes_data.sql**
3. **F5** (Exécuter)

**Attendez le message : `COMMIT`** (peut prendre quelques minutes)

### Étape 5 : Vérifier l'Import
```sql
-- Compter les commandes
SELECT COUNT(*) FROM commandes;

-- Compter les lignes
SELECT COUNT(*) FROM articles_commande;

-- Voir les personnalisations avec type
SELECT 
    ptp.libelle as type_personnalisation,
    COUNT(*) as nombre
FROM articles_commande ac
JOIN parametres_types_personnalisation ptp ON ptp.id = ac.id_type_personnalisation
WHERE ac.personnalisation = true
GROUP BY ptp.libelle;
```

## 📊 Résultats Attendus

- ✅ **15 commandes** importées
- ✅ **1326 lignes** de commande importées
- ✅ Toutes les personnalisations ont le type **"Broderie"**

## 🔧 Alternative : Corriger le Mot de Passe dans .env

Si vous préférez utiliser le script Node.js, vous devez corriger le mot de passe dans `backend/.env` :

1. Ouvrez : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend\.env`
2. Vérifiez que `DB_PASSWORD` correspond au mot de passe de l'utilisateur "Aviateur" dans PostgreSQL
3. Réessayez :
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
   node scripts/executer-import.js "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\04_structure_commandes.sql"
   ```

---

**💡 Conseil : Utilisez pgAdmin, c'est plus simple et plus fiable !**
