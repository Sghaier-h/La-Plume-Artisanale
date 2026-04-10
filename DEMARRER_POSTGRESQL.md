# 🚀 Démarrer PostgreSQL

## ✅ PostgreSQL est déjà en cours d'exécution !

Le service **postgresql-x64-18** est actif.

## 🔧 Informations de Connexion

Selon le script, PostgreSQL écoute sur :
- **Host:** localhost
- **Port:** 5433 (ou 5432 selon votre configuration)
- **Database:** ERP_La_Plume
- **User:** Aviateur

## 📋 Méthodes pour Exécuter les Scripts SQL

### Option 1 : Via pgAdmin (Recommandé - Plus Simple)

1. **Ouvrir pgAdmin**
   - Lancez pgAdmin depuis le menu Démarrer
   - Connectez-vous à votre serveur PostgreSQL

2. **Se connecter à la base de données**
   - Développez l'arborescence jusqu'à **ERP_La_Plume**
   - Clic droit → **Query Tool**

3. **Exécuter le script de structure**
   - Dans Query Tool : `Ctrl+O` (Ouvrir fichier)
   - Naviguez vers : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database\imports\`
   - Sélectionnez : **04_structure_commandes.sql**
   - Cliquez sur **▶ Exécuter** (ou `F5`)

4. **Exécuter le script d'import**
   - Dans Query Tool : `Ctrl+O` (Ouvrir fichier)
   - Sélectionnez : **04_commandes_data.sql**
   - Cliquez sur **▶ Exécuter** (ou `F5`)

### Option 2 : Via psql (Ligne de commande)

Si vous avez `psql` installé et dans votre PATH :

```powershell
# Se connecter à PostgreSQL
psql -U Aviateur -d ERP_La_Plume -h localhost -p 5433

# Dans psql, exécuter :
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/imports/04_structure_commandes.sql"
\i "D:/OneDrive - FLYING TEX/PROJET/La-Plume-Artisanale/database/imports/04_commandes_data.sql"
```

### Option 3 : Corriger le fichier .env

Si vous voulez utiliser le script Node.js, vérifiez que le fichier `.env` dans `backend/` contient :

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=votre_mot_de_passe
```

## 🔍 Vérifier que PostgreSQL écoute

Pour vérifier sur quel port PostgreSQL écoute :

```powershell
netstat -an | findstr "543"
```

Vous devriez voir quelque chose comme :
```
TCP    0.0.0.0:5433           0.0.0.0:0              LISTENING
```

## ⚠️ Si PostgreSQL ne démarre pas

Si le service n'est pas en cours d'exécution :

1. **Démarrer manuellement via Services Windows**
   - Appuyez sur `Win+R`
   - Tapez `services.msc` et appuyez sur Entrée
   - Cherchez "PostgreSQL"
   - Clic droit → **Démarrer**

2. **Ou utiliser le script PowerShell**
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
   powershell -ExecutionPolicy Bypass -File demarrer-postgresql.ps1
   ```

## ✅ Vérification

Après avoir exécuté les scripts, vérifiez :

```sql
-- Vérifier la table des types de personnalisation
SELECT * FROM parametres_types_personnalisation;

-- Vérifier les commandes
SELECT COUNT(*) FROM commandes;

-- Vérifier les lignes avec personnalisation
SELECT COUNT(*) FROM articles_commande WHERE personnalisation = true;
```

---

**💡 Conseil : Utilisez pgAdmin, c'est la méthode la plus simple et la plus fiable !**
