# 🔄 Adapter le Projet pour MySQL

## ⚠️ Situation

Vous avez des bases de données **MySQL** sur OVH, mais le projet est conçu pour **PostgreSQL**.

---

## 🚀 Solution 1 : Créer une Nouvelle Base MySQL

### Dans le panneau OVH

1. Allez dans **"Bases de données"**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez **MySQL**
4. Créez une base nommée : `allbyfbfouta` (ou similaire)
5. Notez les identifiants :
   - **Nom d'utilisateur**
   - **Mot de passe**
   - **Adresse du serveur**
   - **Nom de la base**

---

## 🚀 Solution 2 : Adapter le Projet pour MySQL

### Modifications nécessaires

1. **Changer le driver de base de données** dans le backend
2. **Adapter les scripts SQL** pour MySQL
3. **Modifier la connexion** dans `.env`

### Étape 1 : Installer mysql2 au lieu de pg

```bash
cd ~/la-plume-artisanale
cd backend
npm install mysql2 --save
npm uninstall pg
```

### Étape 2 : Modifier la connexion

Modifiez `backend/src/utils/db.js` pour utiliser MySQL au lieu de PostgreSQL.

### Étape 3 : Adapter les scripts SQL

Les scripts SQL PostgreSQL doivent être convertis en MySQL (syntaxe différente).

---

## 🚀 Solution 3 : Utiliser une Base PostgreSQL Externe (Recommandé)

### Services PostgreSQL gratuits/payants

1. **ElephantSQL** (gratuit jusqu'à 20 MB)
2. **Supabase** (gratuit)
3. **OVH Cloud Databases** (payant)
4. **Clever Cloud** (payant)

### Configuration

Une fois la base PostgreSQL créée, utilisez ses identifiants dans le `.env` :

```env
DB_HOST=adresse-du-serveur-postgresql
DB_PORT=5432
DB_NAME=nom-de-la-base
DB_USER=utilisateur
DB_PASSWORD=mot-de-passe
```

---

## 🚀 Solution 4 : Utiliser une Base MySQL Existante

Si vous voulez utiliser une de vos bases MySQL existantes :

### Étape 1 : Créer une nouvelle base MySQL

Dans OVH, créez une nouvelle base : `allbyfbfouta`

### Étape 2 : Adapter le projet

Il faudra convertir tous les scripts SQL de PostgreSQL vers MySQL.

---

## ✅ Recommandation

**Je recommande la Solution 3** : Utiliser une base PostgreSQL externe (ElephantSQL gratuit) car :
- ✅ Pas besoin de modifier le code
- ✅ Scripts SQL fonctionnent tels quels
- ✅ Gratuit pour commencer
- ✅ Facile à configurer

---

## 📋 Prochaines Étapes

1. **Créer une base PostgreSQL externe** (ElephantSQL)
2. **Utiliser ses identifiants** dans le `.env`
3. **Exécuter les scripts SQL** normalement

---

## 🔗 Liens Utiles

- **ElephantSQL** : https://www.elephantsql.com/
- **Supabase** : https://supabase.com/
- **OVH Cloud Databases** : https://www.ovh.com/cloud/databases/

---

## 💡 Alternative Rapide

Pour tester rapidement, vous pouvez aussi :
1. Créer une nouvelle base MySQL dans OVH
2. Je vous aiderai à adapter le projet pour MySQL

Dites-moi quelle solution vous préférez !

