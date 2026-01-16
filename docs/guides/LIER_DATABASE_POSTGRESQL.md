# 🔗 Lier la Base de Données PostgreSQL au Serveur Web

## ❌ Problème

La base de données PostgreSQL `sh131616-002` n'est pas liée au serveur web `allbyfb.cluster130.hosting.ovh.net`.

**Base de données** :
- **Nom** : La Plume Artisanale
- **ID** : `sh131616-002`
- **Type** : PostgreSQL 17
- **Host** : `sh131616-002.eu.clouddb.ovh.net`
- **Port** : `35392`

**Serveur web** : `allbyfb.cluster130.hosting.ovh.net`

---

## ✅ Solution : Autoriser l'IP du Serveur Web

### Étape 1 : Trouver l'IP du Serveur Web

```bash
# Se connecter au serveur web
ssh allbyfb@ssh.cluster130.gra.hosting.ovh.net

# Trouver l'IP publique du serveur
curl -s ifconfig.me
# OU
curl -s ipinfo.io/ip
```

**Note** : Notez cette IP, vous en aurez besoin.

### Étape 2 : Autoriser l'IP dans OVH Cloud Databases

1. **Connectez-vous au panneau OVH**
2. **Allez dans** : **Web Cloud** → **Databases** → **sh131616-002** (La Plume Artisanale)
3. **Cliquez sur l'onglet** : **IPs autorisées**
4. **Cliquez sur** : **Ajouter une IP ou une plage d'IP**
5. **Entrez** :
   - **IP** : L'IP publique du serveur web (trouvée à l'étape 1)
   - **Description** : `Serveur web cluster130` (optionnel)
6. **Cliquez sur** : **Valider**

**OU** pour autoriser toutes les IPs (moins sécurisé mais plus simple) :
- **IP** : `0.0.0.0/0`
- **Description** : `Toutes les IPs` (optionnel)

### Étape 3 : Vérifier la Connexion

```bash
# Se connecter au serveur web
ssh allbyfb@ssh.cluster130.gra.hosting.ovh.net

cd ~/fouta-erp/backend

# Tester la connexion PostgreSQL
# (Si psql est installé)
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume

# OU tester avec Node.js
node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'sh131616-002.eu.clouddb.ovh.net',
  port: 35392,
  database: 'ERP_La_Plume',
  user: 'Aviateur',
  password: 'Allbyfouta007'
});
client.connect()
  .then(() => console.log('✅ Connexion réussie'))
  .catch(err => console.error('❌ Erreur:', err.message))
  .finally(() => client.end());
"
```

---

## 🔍 Vérifier la Configuration Actuelle

### Dans le Panneau OVH

1. **Web Cloud** → **Databases** → **sh131616-002**
2. **Onglet** : **IPs autorisées**
3. **Vérifiez** que l'IP du serveur web est présente

### Informations de Connexion

Dans le panneau OVH :
1. **Web Cloud** → **Databases** → **sh131616-002**
2. **Onglet** : **Informations générales**
3. **Notez** :
   - **Host** : `sh131616-002.eu.clouddb.ovh.net`
   - **Port** : `35392`
   - **Utilisateur** : `Aviateur`
   - **Mot de passe** : (dans l'onglet "Utilisateurs et droits")

---

## 📋 Checklist

- [ ] IP du serveur web trouvée : `curl -s ifconfig.me`
- [ ] IP ajoutée dans "IPs autorisées" de la base de données
- [ ] Connexion testée depuis le serveur web
- [ ] `.env` vérifié avec les bonnes informations

---

## 🔧 Vérifier le .env

```bash
cd ~/fouta-erp/backend

# Vérifier la configuration
cat .env | grep DB_

# Doit afficher :
# DB_HOST=sh131616-002.eu.clouddb.ovh.net
# DB_PORT=35392
# DB_NAME=ERP_La_Plume
# DB_USER=Aviateur
# DB_PASSWORD=Allbyfouta007
```

---

## ⚠️ Note de Sécurité

**Autoriser `0.0.0.0/0`** (toutes les IPs) est moins sécurisé mais fonctionne pour les tests.

**Pour la production**, autorisez uniquement l'IP du serveur web.

---

## ✅ Résumé

1. **Trouver l'IP du serveur web** : `curl -s ifconfig.me`
2. **Autoriser l'IP dans OVH** : Databases → sh131616-002 → IPs autorisées
3. **Tester la connexion** depuis le serveur web
4. **Vérifier le `.env`** avec les bonnes informations

**Une fois l'IP autorisée, la base de données sera accessible depuis le serveur web !**

