# 🖥️ Guide : Créer la Base de Données sur le Serveur OVH

**Date :** 20 janvier 2026  
**Objectif :** Créer la base de données `ERP_La_Plume_Local` directement sur le serveur OVH

---

## 🎯 AVANTAGES

✅ **Pas besoin de PostgreSQL local**  
✅ **Base déjà accessible via SSH**  
✅ **Utilise l'infrastructure existante**  
✅ **Pas de problème de mot de passe local**

---

## 📋 MÉTHODE 1 : Script Bash (Recommandé)

### Étape 1 : Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### Étape 2 : Copier le script sur le serveur

Depuis votre machine locale :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
scp creer-base-serveur-simple.sh ubuntu@137.74.40.191:/tmp/
```

### Étape 3 : Exécuter le script sur le serveur

```bash
# Se connecter au serveur
ssh ubuntu@137.74.40.191

# Rendre le script exécutable
chmod +x /tmp/creer-base-serveur-simple.sh

# Exécuter le script
/tmp/creer-base-serveur-simple.sh postgres
```

Le script vous demandera le mot de passe PostgreSQL.

---

## 📋 MÉTHODE 2 : Exécution Directe via SSH

### Depuis PowerShell

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

# Copier le script SQL
scp creer-base-locale.sql ubuntu@137.74.40.191:/tmp/

# Se connecter et exécuter
ssh ubuntu@137.74.40.191 "PGPASSWORD='votre_mot_de_passe' psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U postgres -d postgres -f /tmp/creer-base-locale.sql"
```

---

## 📋 MÉTHODE 3 : Manuellement via SSH

### Étape 1 : Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### Étape 2 : Se connecter à PostgreSQL

```bash
export PGPASSWORD='votre_mot_de_passe'
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U postgres -d postgres
```

### Étape 3 : Créer la base de données

```sql
CREATE DATABASE "ERP_La_Plume_Local";
\c "ERP_La_Plume_Local"
```

### Étape 4 : Exécuter le script SQL

```sql
-- Copier le contenu de creer-base-locale.sql
-- Ou utiliser \i si vous avez copié le fichier
\i /tmp/creer-base-locale.sql
```

---

## 🔧 CONFIGURATION APRÈS CRÉATION

### 1. Créer le tunnel SSH (dans un terminal séparé)

```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

### 2. Modifier le fichier `.env`

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume_Local
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
```

### 3. Tester la connexion

```bash
cd backend
node test-connexion-simple.js
```

### 4. Vérifier les tables

```bash
node verifier-tables-modules-odoo.js
```

### 5. Tester les modules

```bash
node test-modules-odoo.js
```

---

## ✅ VÉRIFICATION

### Vérifier que la base existe

```bash
ssh ubuntu@137.74.40.191
export PGPASSWORD='votre_mot_de_passe'
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U postgres -d postgres -c "\l" | grep ERP_La_Plume_Local
```

### Lister les tables

```bash
export PGPASSWORD='votre_mot_de_passe'
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U postgres -d ERP_La_Plume_Local -c "\dt"
```

---

## 🎯 COMMANDES RAPIDES

### Tout en une fois (depuis PowerShell)

```powershell
# 1. Copier le script
scp creer-base-locale.sql ubuntu@137.74.40.191:/tmp/

# 2. Exécuter (remplacez le mot de passe)
ssh ubuntu@137.74.40.191 "PGPASSWORD='votre_mot_de_passe' psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U postgres -d postgres -f /tmp/creer-base-locale.sql"

# 3. Créer le tunnel SSH (dans un autre terminal)
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N

# 4. Tester
cd backend
node test-modules-odoo.js
```

---

## 💡 AVANTAGES DE CRÉER SUR LE SERVEUR

1. ✅ **Pas de configuration locale** : Pas besoin de PostgreSQL sur votre machine
2. ✅ **Accès direct** : La base est déjà accessible via SSH
3. ✅ **Infrastructure existante** : Utilise le serveur OVH déjà configuré
4. ✅ **Pas de problème de mot de passe local** : Le mot de passe du serveur est déjà connu

---

## ⚠️ NOTES IMPORTANTES

- Le tunnel SSH doit rester actif pendant les tests
- Utilisez le port **5433** en local (mappé vers **35392** sur OVH)
- Le mot de passe PostgreSQL sur OVH peut être différent de votre mot de passe local

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
