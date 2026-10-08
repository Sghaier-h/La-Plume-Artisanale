# 🔧 Solution : Timeout de Connexion à PostgreSQL OVH

## ❌ Problème

```
Connection terminated due to connection timeout
```

**Cela signifie que votre PC ne peut pas se connecter au serveur PostgreSQL OVH.**

---

## 🔍 Causes Possibles

1. ❌ **L'IP de votre PC n'est pas autorisée** dans PostgreSQL OVH
2. ❌ **Le firewall bloque** le port 35392
3. ❌ **Le serveur PostgreSQL** n'accepte pas les connexions externes
4. ❌ **Problème de connexion internet** ou réseau

---

## ✅ Solutions Immédiates

### Solution 1 : Utiliser un Tunnel SSH via le VPS (Recommandé)

**Si vous avez accès SSH au VPS (137.74.40.191), utilisez un tunnel SSH :**

```powershell
# Créer un tunnel SSH vers la base de données
ssh -L 5432:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Puis modifier le fichier `.env` :**

```env
# Utiliser localhost au lieu de l'adresse distante
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

**💡 Le tunnel SSH permet de :**
- ✅ Se connecter via localhost (port 5432)
- ✅ Contourner les restrictions de firewall
- ✅ Utiliser la connexion SSH existante

---

### Solution 2 : Autoriser votre IP dans PostgreSQL OVH

**1. Trouver votre IP publique :**

```powershell
Invoke-RestMethod -Uri "https://api.ipify.org?format=json"
```

**2. Autoriser cette IP dans OVH :**

1. Connectez-vous à votre espace client OVH
2. Allez dans **Web Cloud Databases** → Votre base PostgreSQL
3. Section **Utilisateurs et autorisations**
4. Ajoutez votre IP publique

**⚠️ Note :** Si votre IP change souvent (IP dynamique), cette solution n'est pas idéale.

---

### Solution 3 : Utiliser PostgreSQL Local (Pour le Développement)

**Installer PostgreSQL localement pour le développement :**

1. **Télécharger et installer PostgreSQL :**
   - https://www.postgresql.org/download/windows/
   - Installer avec les paramètres par défaut
   - Noter le mot de passe du superutilisateur `postgres`

2. **Créer la base de données locale :**

```sql
CREATE DATABASE erp_la_plume;
CREATE USER fouta_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE erp_la_plume TO fouta_user;
```

3. **Exécuter les scripts SQL :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database"

# Exécuter les scripts dans l'ordre
psql -U fouta_user -d erp_la_plume -f 01_base_et_securite.sql
psql -U fouta_user -d erp_la_plume -f 02_production_et_qualite.sql
psql -U fouta_user -d erp_la_plume -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d erp_la_plume -f 04_mobile_devices.sql
```

4. **Modifier le fichier `.env` :**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_la_plume
DB_USER=fouta_user
DB_PASSWORD=votre_mot_de_passe
```

---

### Solution 4 : Utiliser la Base de Données du VPS (Via API)

**Développer localement mais utiliser l'API du VPS :**

1. **Backend reste sur le VPS** (déjà déployé)
2. **Frontend local** se connecte à l'API du VPS

**Modifier le fichier `.env` du frontend :**

```env
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
REACT_APP_SOCKET_URL=https://fabrication.laplume-artisanale.tn
```

**Avantages :**
- ✅ Pas besoin d'accéder à la base de données localement
- ✅ Utilise la base de données du VPS via l'API
- ✅ Test avec les vraies données

---

## 🚀 Solution Recommandée : Tunnel SSH

**Pour continuer rapidement, je recommande d'utiliser un tunnel SSH :**

### Étapes

1. **Créer un tunnel SSH :**

```powershell
# Dans un terminal séparé (laisser ouvert)
ssh -L 5432:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez.

2. **Modifier le fichier `.env` :**

```env
DB_HOST=localhost
DB_PORT=5432
```

3. **Tester la connexion :**

```powershell
npm run test:db
```

4. **Démarrer le backend :**

```powershell
npm run dev
```

---

## 📋 Script PowerShell pour Tunnel SSH Automatique

Je vais créer un script pour automatiser le tunnel SSH.

---

## ✅ Prochaine Étape

**Choisissez une solution :**

1. **Tunnel SSH** (si vous avez accès SSH au VPS) - ✅ Recommandé
2. **PostgreSQL local** (pour le développement) - ✅ Rapide
3. **API du VPS** (frontend local, backend sur VPS) - ✅ Simple

**Quelle solution préférez-vous ?**
