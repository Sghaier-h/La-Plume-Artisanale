# 📦 Créer une Base MySQL dans OVH

## 🎯 Guide Étape par Étape

### Étape 1 : Accéder au Panneau OVH

1. Connectez-vous à : https://www.ovh.com/manager/
2. Allez dans **"Web Cloud"** > **"Hébergements"**
3. Cliquez sur votre hébergement : `fabrication.laplume-artisanale.tn`
4. Allez dans l'onglet **"Bases de données"**

### Étape 2 : Créer une Nouvelle Base

1. Cliquez sur **"Créer une base de données"** ou **"Ajouter"**
2. Choisissez **MySQL**
3. Remplissez :
   - **Nom** : `allbyfbfouta` (ou votre choix)
   - **Version** : MySQL 8.0 (recommandé)
4. Cliquez sur **"Créer"**

### Étape 3 : Noter les Identifiants

OVH va créer :
- **Nom d'utilisateur** : `allbyfbfouta` (généralement)
- **Mot de passe** : (généré automatiquement - notez-le !)
- **Adresse du serveur** : `allbyfbfouta.mysql.db` (ou similaire)
- **Nom de la base** : `allbyfbfouta`
- **Port** : `3306` (MySQL)

---

## 🔧 Utiliser la Base MySQL

### Option A : Adapter le Projet pour MySQL

Il faudra modifier le code pour utiliser MySQL au lieu de PostgreSQL.

### Option B : Utiliser PostgreSQL Externe (Recommandé)

Utilisez une base PostgreSQL externe (ElephantSQL gratuit) pour garder le code tel quel.

---

## 📋 Informations à Noter

Après création, notez :

```
Nom d'utilisateur : allbyfbfouta
Mot de passe : [celui généré par OVH]
Serveur : allbyfbfouta.mysql.db
Base : allbyfbfouta
Port : 3306
```

Ces informations seront utilisées dans le fichier `.env`.

---

## ✅ Après Création

Dites-moi quand la base est créée et je vous aiderai à :
1. Configurer le `.env` avec les bonnes informations
2. Adapter le projet si nécessaire
3. Initialiser la base de données

