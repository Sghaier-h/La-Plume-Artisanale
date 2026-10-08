# 🔐 Ajouter votre IP dans OVH Cloud

## 📋 Votre IP Publique

**IP à autoriser** : `197.244.78.162`

## ✅ Étapes pour Autoriser l'IP dans OVH

### Étape 1 : Se connecter à OVH

1. **Allez sur** : https://www.ovh.com/manager/
2. **Connectez-vous** avec vos identifiants OVH

### Étape 2 : Accéder à votre base de données PostgreSQL

1. **Dans le menu**, cliquez sur **"Bare Metal Cloud"** ou **"Cloud"**
2. **Cliquez sur "Databases"** ou **"Bases de données"**
3. **Sélectionnez "PostgreSQL"**
4. **Cliquez sur votre instance** : `sh131616-002.eu.clouddb.ovh.net`

### Étape 3 : Ajouter votre IP

1. **Onglet "Restricted IPs"** ou **"Autorisations IP"** ou **"IP autorisées"**
2. **Cliquez sur "Ajouter une IP"** ou **"Add an IP address"** ou le bouton **"+"**
3. **Entrez votre IP** : `197.244.78.162`
4. **Description** (optionnel) : `Mon PC - Développement` ou `Bardo, Tunisie`
5. **Cliquez sur "Valider"** ou **"Confirm"** ou **"Add"**

### Étape 4 : Attendre la propagation

- ⏱️ **Attendez 2-5 minutes** pour que les changements prennent effet
- 🔄 OVH doit mettre à jour le pare-feu

### Étape 5 : Tester la connexion

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/verifier-connexion-ovh.mjs
```

Vous devriez voir :
- ✅ Connexion réussie
- ✅ Version PostgreSQL
- ✅ Liste des tables

## 🔄 Si votre IP change

Si vous changez de connexion internet (WiFi différent, mobile, etc.) :

1. **Vérifiez votre nouvelle IP** : https://www.whatismyip.com/
2. **Ajoutez la nouvelle IP** dans OVH
3. **Ou supprimez l'ancienne** si vous n'en avez plus besoin

## ⚠️ Important

- **Une seule IP à la fois** : Si vous travaillez depuis plusieurs endroits, vous devrez ajouter chaque IP
- **IP dynamique** : Si votre FAI vous donne une IP dynamique, elle peut changer. Dans ce cas, utilisez un tunnel SSH (voir ci-dessous)

## 🌐 Alternative : Tunnel SSH

Si votre IP change souvent ou si vous ne pouvez pas l'ajouter dans OVH, utilisez un tunnel SSH (comme dans pgAdmin) :

### Avec PuTTY (Windows)

1. **Ouvrez PuTTY**
2. **Session** :
   - Host: `137.74.40.191`
   - Port: `22`
   - Saved Sessions: `OVH-Tunnel` (pour sauvegarder)
3. **Connection > SSH > Tunnels** :
   - Source port: `35392`
   - Destination: `sh131616-002.eu.clouddb.ovh.net:35392`
   - Cliquez **"Add"**
4. **Connection > Data** :
   - Auto-login username: `ubuntu`
5. **Retour à Session** :
   - Cliquez **"Save"** pour sauvegarder la configuration
6. **Cliquez "Open"** et entrez le mot de passe SSH
7. **Laissez PuTTY ouvert** (le tunnel reste actif tant que PuTTY est ouvert)
8. **Mettez à jour .env** :
   ```env
   DB_HOST=localhost
   DB_PORT=35392
   ```

### Avec SSH (Ligne de commande)

```bash
ssh -L 35392:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191
```

Puis dans un autre terminal, testez avec `DB_HOST=localhost`.

## ✅ Vérification Finale

Après avoir autorisé l'IP ou créé le tunnel :

```bash
# Tester la connexion
node scripts/verifier-connexion-ovh.mjs

# Si succès, démarrer le serveur
npm start

# Tester les routes CRUD
node scripts/test-crud-avec-auth.mjs
```

## 📝 Résumé

**IP à autoriser** : `197.244.78.162`

**Action** : Ajoutez cette IP dans OVH Cloud > Databases > PostgreSQL > Restricted IPs

**Temps d'attente** : 2-5 minutes après ajout

**Test** : `node scripts/verifier-connexion-ovh.mjs`
