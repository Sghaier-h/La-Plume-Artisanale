# 📋 Guide : Exécuter le Schéma SQL de Pointage

## 🔴 Problème Actuel

La connexion à la base de données PostgreSQL depuis le serveur VPS échoue avec un timeout. Cela peut être dû à :
- L'IP du serveur VPS n'est pas autorisée dans OVH Cloud DB
- Un problème de réseau/firewall
- Restrictions de sécurité OVH

## ✅ Solution : Exécuter le Schéma SQL via un Outil Externe

Puisque la connexion directe depuis le serveur ne fonctionne pas, vous devez exécuter le schéma SQL depuis votre machine locale ou via l'interface OVH.

### Option 1 : Via pgAdmin (Recommandé)

1. **Télécharger pgAdmin** : https://www.pgadmin.org/download/
2. **Créer une nouvelle connexion** :
   - Host: `sh131616-002.eu.clouddb.ovh.net`
   - Port: `35392`
   - Database: `ERP_La_Plume`
   - Username: `Aviateur`
   - Password: (celui dans `backend/.env`)
   - SSL Mode: `Require` ou `Allow`

3. **Ouvrir le fichier SQL** :
   - Chemin: `backend/database/schema_pointage.sql`
   - Ou copier le contenu depuis GitHub

4. **Exécuter le script** :
   - Ouvrir l'éditeur de requête dans pgAdmin
   - Coller le contenu du fichier `schema_pointage.sql`
   - Cliquer sur "Execute" (F5)

### Option 2 : Via DBeaver

1. **Télécharger DBeaver** : https://dbeaver.io/download/
2. **Créer une nouvelle connexion PostgreSQL** :
   - Host: `sh131616-002.eu.clouddb.ovh.net`
   - Port: `35392`
   - Database: `ERP_La_Plume`
   - Username: `Aviateur`
   - Password: (celui dans `backend/.env`)

3. **Exécuter le script** :
   - Ouvrir le fichier `backend/database/schema_pointage.sql`
   - Exécuter le script (Ctrl+Enter)

### Option 3 : Via l'Interface OVH Cloud DB

1. **Se connecter au panneau OVH** : https://www.ovh.com/manager/
2. **Aller dans Cloud DB** > Votre base de données
3. **Ouvrir phpMyAdmin ou l'éditeur SQL** (si disponible)
4. **Coller et exécuter le contenu de `schema_pointage.sql`**

### Option 4 : Via psql depuis votre machine locale

Si vous avez `psql` installé sur votre machine locale :

```bash
# Depuis votre PC local (Windows/Mac/Linux)
PGPASSWORD="votre_mot_de_passe" psql \
  -h sh131616-002.eu.clouddb.ovh.net \
  -p 35392 \
  -U Aviateur \
  -d ERP_La_Plume \
  -f backend/database/schema_pointage.sql
```

## 📄 Contenu du Fichier SQL

Le fichier `backend/database/schema_pointage.sql` contient :

1. **Table `pointage`** : Stocke chaque présence/absence
2. **Table `pointage_resume`** : Résumé mensuel automatique
3. **Colonnes dans `equipe`** :
   - `timemoto_user_id` : ID utilisateur TimeMoto
   - `temps_travaille_mois` : Temps travaillé mensuel
4. **Fonction `recalculer_resume_mois()`** : Calcul automatique du résumé
5. **Trigger `trigger_recalculer_resume_mois`** : Mise à jour automatique
6. **Vue `v_pointage_detail`** : Vue détaillée avec jointure equipe

## ✅ Vérification Après Exécution

Une fois le schéma exécuté, vérifiez que les tables existent :

```bash
# Via l'API (depuis le serveur)
curl https://fabrication.laplume-artisanale.tn/api/database/verifier-tables-pointage | python3 -m json.tool
```

Ou via pgAdmin/DBeaver :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('pointage', 'pointage_resume');

-- Vérifier les colonnes dans equipe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'equipe' 
  AND column_name IN ('timemoto_user_id', 'temps_travaille_mois');
```

## 🔧 Résoudre le Problème de Connexion (Optionnel)

Si vous voulez autoriser l'IP du serveur VPS dans OVH Cloud DB :

1. **Se connecter au panneau OVH** : https://www.ovh.com/manager/
2. **Aller dans Cloud DB** > Votre base de données
3. **Section "Autoriser les IP"** ou "Restricted IPs"
4. **Ajouter l'IP du serveur VPS** : `137.74.40.191` (ou l'IP actuelle du serveur)
5. **Sauvegarder**

⚠️ **Note** : Cela peut prendre quelques minutes pour être effectif.

## 📊 Après Création des Tables

Une fois les tables créées :
1. Les webhooks TimeMoto commenceront à enregistrer les données
2. Les pointages seront automatiquement calculés dans `pointage_resume`
3. Le temps travaillé mensuel sera mis à jour dans `equipe.temps_travaille_mois`
