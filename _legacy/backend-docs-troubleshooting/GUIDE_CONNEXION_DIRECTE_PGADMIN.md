# 🔗 Guide : Connexion Directe à PostgreSQL OVH avec pgAdmin (Sans Tunnel SSH)

**Date :** 20 janvier 2026  
**Objectif :** Se connecter directement à la base PostgreSQL OVH depuis pgAdmin sans créer de tunnel SSH

---

## ✅ CONNEXION DIRECTE

Vous pouvez vous connecter **directement** à PostgreSQL OVH depuis pgAdmin si :
- ✅ Votre IP est autorisée dans OVH Cloud Databases
- ✅ Le firewall ne bloque pas le port 35392
- ✅ Vous avez les identifiants corrects

---

## 🎯 CONFIGURATION PGADMIN (CONNEXION DIRECTE)

### Étape 1 : Vérifier l'IP Autorisée

1. **Connectez-vous au panneau OVH**
2. **Cloud Databases** → Votre base PostgreSQL
3. **IPs autorisées** → Vérifiez que votre IP publique est présente
4. Si absente, ajoutez-la : **Ajouter une IP** → Votre IP publique

**Pour connaître votre IP publique :**
- Allez sur https://www.whatismyip.com/
- Copiez votre adresse IPv4

---

### Étape 2 : Configurer pgAdmin

1. **Ouvrir pgAdmin**

2. **Clic droit sur "Servers"** → **Create** → **Server**

3. **Onglet "General" :**
   - **Name :** `OVH - ERP La Plume (Direct)`

4. **Onglet "Connection" :**
   - **Host name/address :** `sh131616-002.eu.clouddb.ovh.net`
   - **Port :** `35392`
   - **Maintenance database :** `ERP_La_Plume`
   - **Username :** `Aviateur`
   - **Password :** `Allbyfouta007`
   - ✅ **Save password** (cocher)

5. **Cliquez "Save"**

---

### Étape 3 : Tester la Connexion

Si la connexion réussit :
- ✅ Vous verrez la base `ERP_La_Plume` dans l'arborescence
- ✅ Vous pouvez explorer les tables existantes

Si la connexion échoue :
- ❌ Vérifiez que votre IP est autorisée dans OVH
- ❌ Vérifiez votre pare-feu Windows
- ❌ Vérifiez la connexion internet

---

## 📊 VÉRIFIER ET CRÉER LES TABLES

### Étape 1 : Vérifier les Tables Existantes

1. **Dans pgAdmin**, cliquez droit sur la base `ERP_La_Plume`
2. **Query Tool**
3. **Ouvrir** le fichier `verifier-base-existante-pgadmin.sql`
4. **Exécuter** (F5 ou bouton ▶️)

**Le script affichera :**
- ✅ Les tables qui existent
- ❌ Les tables qui manquent
- 📊 Le nombre d'enregistrements par table

---

### Étape 2 : Créer les Tables Manquantes

1. **Dans Query Tool**, ouvrir le fichier `creer-tables-manquantes-pgadmin.sql`
2. **Exécuter** (F5 ou bouton ▶️)

**Le script :**
- ✅ Crée uniquement les tables qui n'existent pas
- ✅ Ne modifie pas les tables existantes
- ✅ Préserve toutes vos données

---

## 🔧 CONFIGURATION .ENV (CONNEXION DIRECTE)

Modifiez le fichier `.env` dans votre projet :

```env
# Connexion directe à PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

**Pas besoin de tunnel SSH avec cette configuration !**

---

## 🧪 TESTER LA CONNEXION

### Depuis Node.js

```bash
cd backend
node test-connexion-simple.js
```

### Vérifier les Tables

```bash
node verifier-tables-modules-odoo.js
```

### Tester les Modules

```bash
node test-modules-odoo.js
```

---

## ❓ POURQUOI UN TUNNEL SSH ?

### Avantages du Tunnel SSH

✅ **Sécurité** : Les données passent par une connexion SSH chiffrée  
✅ **Pas besoin d'autoriser votre IP** : La connexion vient du serveur OVH  
✅ **Filtrage** : Le serveur peut filtrer les connexions

### Inconvénients du Tunnel SSH

❌ **Nécessite un terminal ouvert** : Le tunnel doit rester actif  
❌ **Plus lent** : Passage par un serveur intermédiaire  
❌ **Configuration supplémentaire** : Nécessite SSH configuré

---

## ✅ CONNEXION DIRECTE (Recommandé si possible)

### Avantages

✅ **Plus simple** : Pas de tunnel à gérer  
✅ **Plus rapide** : Connexion directe  
✅ **Plus stable** : Pas de dépendance à un terminal SSH

### Conditions

⚠️ **Votre IP doit être autorisée** dans OVH Cloud Databases  
⚠️ **Le pare-feu ne doit pas bloquer** le port 35392  
⚠️ **La connexion doit être fiable**

---

## 🔍 VÉRIFIER QUE VOTRE IP EST AUTORISÉE

### Méthode 1 : Depuis le Panneau OVH

1. **Panneau OVH** → **Cloud Databases**
2. **Votre base PostgreSQL** → **IPs autorisées**
3. Vérifiez que votre IP publique est dans la liste

### Méthode 2 : Test de Connexion

```bash
# Depuis votre terminal
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT version();"
```

Si ça fonctionne, votre IP est autorisée ✅

---

## 🎯 RÉSUMÉ

### Connexion Directe (Recommandé)

1. ✅ **Vérifier que votre IP est autorisée** dans OVH
2. ✅ **Configurer pgAdmin** avec les paramètres directs
3. ✅ **Configurer .env** avec la connexion directe
4. ✅ **Créer les tables manquantes** via pgAdmin
5. ✅ **Tester** la connexion

### Connexion via Tunnel SSH (Alternative)

1. ✅ **Créer le tunnel SSH** dans un terminal séparé
2. ✅ **Configurer pgAdmin** avec localhost:5433
3. ✅ **Configurer .env** avec localhost:5433
4. ✅ **Créer les tables manquantes** via pgAdmin
5. ✅ **Tester** la connexion

---

## 💡 RECOMMANDATION

**Utilisez la connexion directe** si votre IP est autorisée dans OVH. C'est plus simple et plus rapide.

**Utilisez le tunnel SSH** uniquement si :
- Votre IP n'est pas autorisée
- Vous êtes derrière un pare-feu strict
- Vous voulez une sécurité supplémentaire

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
