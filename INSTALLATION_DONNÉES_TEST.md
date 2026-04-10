# 📦 Installation des Données de Test - Guide Étape par Étape

## 🎯 Méthode 1 : Via pgAdmin (Recommandé pour débutants)

### Étape 1 : Ouvrir pgAdmin
1. Lancez **pgAdmin** sur votre ordinateur
2. Connectez-vous à votre serveur PostgreSQL

### Étape 2 : Sélectionner la base de données
1. Dans le panier de gauche, développez **Servers**
2. Développez votre serveur PostgreSQL
3. Développez **Databases**
4. Cliquez sur **la_plume_artisanale** (ou le nom de votre base de données)

### Étape 3 : Ouvrir le Query Tool
1. Clic droit sur **la_plume_artisanale**
2. Sélectionnez **Query Tool**

### Étape 4 : Ouvrir le script SQL
1. Dans le Query Tool, cliquez sur l'icône **📂 Ouvrir un fichier** (ou `Ctrl+O`)
2. Naviguez vers : `La-Plume-Artisanale/database/insert_donnees_test.sql`
3. Sélectionnez le fichier et cliquez sur **Ouvrir**

### Étape 5 : Exécuter le script
1. Vérifiez que le script est chargé dans l'éditeur
2. Cliquez sur le bouton **▶ Exécuter** (ou appuyez sur `F5`)
3. Attendez que le script se termine (quelques secondes)

### Étape 6 : Vérifier le résultat
Vous devriez voir des messages de confirmation dans l'onglet **Messages** :
```
✅ Données de test créées avec succès !
   - Utilisateurs: 4
   - Clients: 5
   ...
```

---

## 🖥️ Méthode 2 : Via Script Node.js (Recommandé si psql n'est pas disponible)

### Étape 1 : Ouvrir PowerShell ou Terminal
- **Windows** : Ouvrez PowerShell ou CMD
- **Linux/Mac** : Ouvrez Terminal

### Étape 2 : Naviguer vers le projet
```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
```

### Étape 3 : Installer les dépendances (si nécessaire)
```bash
cd backend
npm install
```

### Étape 4 : Configurer les variables d'environnement
Assurez-vous que le fichier `.env` dans le dossier `backend` contient :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=la_plume_artisanale
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

### Étape 5 : Exécuter le script
Depuis le dossier backend :
```bash
node scripts/executer-donnees-test.js
```

**Note** : Le script doit être exécuté depuis le dossier `backend` car il utilise les dépendances installées dans `backend/node_modules`.

### Étape 6 : Vérifier le résultat
Vous devriez voir :
```
✅ Script SQL exécuté avec succès !
📊 Les données de test ont été insérées dans la base de données.
```

---

## 🖥️ Méthode 3 : Via Ligne de Commande (psql)

**Note** : Cette méthode nécessite que `psql` soit dans votre PATH.

### Étape 1 : Trouver le chemin de psql
Sur Windows, `psql` se trouve généralement dans :
- `C:\Program Files\PostgreSQL\<version>\bin\psql.exe`

### Étape 2 : Ajouter PostgreSQL au PATH (optionnel)
1. Ouvrez les **Variables d'environnement** Windows
2. Ajoutez le chemin `C:\Program Files\PostgreSQL\<version>\bin` au PATH
3. Redémarrez PowerShell

### Étape 3 : Naviguer vers le projet
```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
```

### Étape 3 : Exécuter le script
```bash
psql -U postgres -d la_plume_artisanale -f database/insert_donnees_test.sql
```

**Remplacez** :
- `postgres` par votre nom d'utilisateur PostgreSQL si différent
- `la_plume_artisanale` par le nom de votre base de données si différent

### Étape 4 : Entrer le mot de passe
Si demandé, entrez le mot de passe de votre utilisateur PostgreSQL

### Étape 5 : Vérifier le résultat
Vous devriez voir :
```
BEGIN
INSERT 0 4
INSERT 0 5
...
COMMIT
✅ Données de test créées avec succès !
```

---

## 🔧 Méthode 3 : Via psql en mode interactif

### Étape 1 : Se connecter à PostgreSQL
```bash
psql -U postgres -d la_plume_artisanale
```

### Étape 2 : Exécuter le script
```sql
\i database/insert_donnees_test.sql
```

**Note** : Le chemin doit être relatif à votre répertoire de travail actuel, ou utilisez le chemin absolu :
```sql
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/insert_donnees_test.sql"
```

### Étape 3 : Vérifier
```sql
SELECT COUNT(*) FROM utilisateurs;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM articles_catalogue;
```

---

## ✅ Vérification de l'Installation

### Vérification rapide (SQL)
Exécutez cette requête pour vérifier que les données sont bien installées :

```sql
SELECT 
  'Utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Machines', COUNT(*) FROM machines
UNION ALL
SELECT 'Matières Premières', COUNT(*) FROM matieres_premieres
UNION ALL
SELECT 'Articles', COUNT(*) FROM articles_catalogue
UNION ALL
SELECT 'Commandes', COUNT(*) FROM commandes
UNION ALL
SELECT 'OF', COUNT(*) FROM ordres_fabrication
UNION ALL
SELECT 'Suivis', COUNT(*) FROM suivi_fabrication
UNION ALL
SELECT 'Mouvements', COUNT(*) FROM mouvements_stock
UNION ALL
SELECT 'Inventaires', COUNT(*) FROM inventaires
UNION ALL
SELECT 'Entrepôts', COUNT(*) FROM entrepots
UNION ALL
SELECT 'Fournitures', COUNT(*) FROM fournitures;
```

**Résultat attendu** :
- Utilisateurs : 4
- Clients : 5
- Machines : 5
- Matières Premières : 5
- Articles : 3
- Commandes : 1
- OF : 2
- Suivis : 1
- Mouvements : 2
- Inventaires : 1
- Entrepôts : 3
- Fournitures : 4

---

## 🐛 Résolution de Problèmes

### Problème 1 : "relation does not exist"
**Cause** : Les tables n'existent pas encore

**Solution** :
1. Exécutez d'abord les scripts de création de tables :
   ```bash
   psql -U postgres -d la_plume_artisanale -f database/01_base_et_securite.sql
   psql -U postgres -d la_plume_artisanale -f database/05_tables_catalogue.sql
   psql -U postgres -d la_plume_artisanale -f database/05_attributs_articles.sql
   ```

### Problème 2 : "foreign key constraint"
**Cause** : Les paramètres (modèles, dimensions, etc.) n'existent pas

**Solution** :
1. Exécutez d'abord le script d'attributs :
   ```bash
   psql -U postgres -d la_plume_artisanale -f database/insert_attributs_catalogue.sql
   ```

### Problème 3 : "permission denied"
**Cause** : L'utilisateur n'a pas les droits nécessaires

**Solution** :
1. Connectez-vous en tant qu'administrateur (postgres)
2. Ou accordez les droits :
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE la_plume_artisanale TO votre_utilisateur;
   ```

### Problème 4 : "psql: command not found"
**Cause** : PostgreSQL n'est pas dans le PATH

**Solution** :
1. **Windows** : Utilisez pgAdmin ou ajoutez PostgreSQL au PATH
2. **Linux/Mac** : Installez PostgreSQL ou utilisez le chemin complet :
   ```bash
   /usr/bin/psql -U postgres -d la_plume_artisanale -f database/insert_donnees_test.sql
   ```

### Problème 5 : "could not connect to server"
**Cause** : Le serveur PostgreSQL n'est pas démarré

**Solution** :
1. **Windows** : Démarrez le service PostgreSQL depuis les Services
2. **Linux** : 
   ```bash
   sudo systemctl start postgresql
   ```
3. **Mac** :
   ```bash
   brew services start postgresql
   ```

---

## 📋 Checklist d'Installation

Avant d'exécuter le script, vérifiez :

- [ ] PostgreSQL est installé et fonctionne
- [ ] La base de données `la_plume_artisanale` existe
- [ ] Les tables sont créées (scripts de création exécutés)
- [ ] Les paramètres existent (insert_attributs_catalogue.sql exécuté)
- [ ] Vous avez les droits d'écriture sur la base

---

## 🎯 Après l'Installation

### 1. Créer un utilisateur de test pour se connecter

Les mots de passe dans le script sont hashés. Pour vous connecter :

**Option A** : Créer via l'interface web
1. Démarrez l'application
2. Allez dans "Paramétrage" → "Utilisateurs"
3. Créez un nouvel utilisateur avec un mot de passe que vous connaissez

**Option B** : Créer via SQL (avec mot de passe "admin123")
```sql
-- Note: Ce hash correspond à "admin123"
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, actif)
VALUES ('Admin', 'Test', 'admin@test.tn', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'ADMIN', true)
ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe;
```

### 2. Tester l'application

1. **Se connecter** avec votre utilisateur
2. **Naviguer** dans les différentes sections
3. **Vérifier** que les données s'affichent :
   - Articles
   - Clients
   - Commandes
   - OF
   - Stock
4. **Tester** les pages de détails en cliquant sur les éléments

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs PostgreSQL
2. Vérifiez que tous les scripts de création de tables ont été exécutés
3. Consultez la documentation : `docs/GUIDE_DONNÉES_TEST.md`

---

**Bon test ! 🚀**
