# 🐘 Créer une Base PostgreSQL sur OVH Web Cloud Databases

## ✅ Solution Parfaite !

OVH propose PostgreSQL via Web Cloud Databases. Voici comment procéder :

---

## 🚀 Étape 1 : Créer l'Instance PostgreSQL

### Dans le Panneau OVH

1. Cliquez sur **"PostgreSQL"**
2. Choisissez la version : **postgresql_17** (recommandé)
3. Choisissez le plan : **1 private sql 1024M** (6.59 € HT/mois)
4. Cliquez sur **"Créer"** ou **"Commander"**

**Note** : Il y a un coût mensuel, mais c'est la solution la plus simple et professionnelle.

---

## 🚀 Étape 2 : Noter les Identifiants

Après création, OVH vous donnera :

- **Adresse du serveur** : (ex: `postgresql-xxxxx.ovh.net`)
- **Port** : `5432` (généralement)
- **Nom d'utilisateur** : (généralement `postgres` ou celui que vous créez)
- **Mot de passe** : (celui que vous définissez)
- **Nom de la base** : (celle que vous créez)

---

## 🚀 Étape 3 : Créer la Base de Données

Dans l'interface Web Cloud Databases :

1. Allez dans votre instance PostgreSQL
2. Cliquez sur **"Bases de données"** ou **"Databases"**
3. Créez une nouvelle base : `fouta_erp`
4. Créez un utilisateur : `fouta_user`
5. Donnez tous les droits à cet utilisateur sur la base `fouta_erp`

---

## 🔧 Étape 4 : Configurer le Projet

Une fois la base créée, modifiez le fichier `.env` :

```env
DB_HOST=postgresql-xxxxx.ovh.net
DB_PORT=5432
DB_NAME=fouta_erp
DB_USER=fouta_user
DB_PASSWORD=votre_mot_de_passe
```

---

## 📋 Checklist

- [ ] Instance PostgreSQL créée sur OVH
- [ ] Base de données `fouta_erp` créée
- [ ] Utilisateur `fouta_user` créé avec tous les droits
- [ ] Identifiants notés
- [ ] Fichier `.env` configuré
- [ ] Scripts SQL exécutés

---

## 💰 Coût

- **6.59 € HT/mois** pour 1 GB de stockage
- C'est un investissement raisonnable pour un ERP professionnel

---

## ✅ Avantages

- ✅ PostgreSQL natif (pas besoin d'adapter le code)
- ✅ Scripts SQL fonctionnent tels quels
- ✅ Géré par OVH (backups automatiques)
- ✅ Performances garanties
- ✅ Support OVH

---

## 🚀 Après Création

Une fois la base créée, dites-moi les identifiants et je vous aiderai à :
1. Configurer le `.env`
2. Exécuter les scripts SQL
3. Démarrer l'application

---

## 🎯 Prochaines Étapes

1. **Créer l'instance PostgreSQL** sur OVH
2. **Créer la base** `fouta_erp`
3. **Créer l'utilisateur** `fouta_user`
4. **Noter tous les identifiants**
5. **Configurer le projet** avec ces identifiants

---

## 💡 Alternative Gratuite

Si vous voulez tester gratuitement d'abord :
- **ElephantSQL** : https://www.elephantsql.com/ (gratuit 20 MB)
- **Supabase** : https://supabase.com/ (gratuit avec limites)

Mais pour la production, OVH Web Cloud Databases est recommandé.

