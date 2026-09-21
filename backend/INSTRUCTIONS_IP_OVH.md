# Instructions : Autoriser votre IP dans OVH Cloud

## 🎯 Problème

L'erreur `ETIMEDOUT` indique que votre IP n'est pas autorisée à se connecter au serveur PostgreSQL OVH.

## ✅ Solution : Autoriser votre IP

### Étape 1 : Connaître votre IP publique

1. **Ouvrez votre navigateur**
2. **Allez sur** : https://www.whatismyip.com/
3. **Notez votre IP publique** (ex: `141.94.103.235`)

### Étape 2 : Autoriser l'IP dans OVH

1. **Connectez-vous à votre espace client OVH**
   - https://www.ovh.com/manager/
   
2. **Allez dans "Bare Metal Cloud" > "Databases" > "PostgreSQL"**

3. **Sélectionnez votre instance** (sh131616-002.eu.clouddb.ovh.net)

4. **Onglet "Restricted IPs"** ou "Autorisations IP"

5. **Cliquez sur "Ajouter une IP"** ou "Add an IP address"

6. **Entrez votre IP publique** (celle notée à l'étape 1)

7. **Description** (optionnel) : "Mon PC - Développement"

8. **Cliquez sur "Valider"** ou "Confirm"

9. **Attendez 2-5 minutes** pour que les changements prennent effet

### Étape 3 : Tester la connexion

```bash
node scripts/verifier-connexion-ovh.mjs
```

Vous devriez voir :
- ✅ Connexion réussie
- ✅ Version PostgreSQL
- ✅ Liste des tables

## 🔄 Si votre IP change

Si vous utilisez une connexion internet avec IP dynamique :

1. **Notez votre nouvelle IP** (whatismyip.com)
2. **Mettez à jour dans OVH** (remplacez l'ancienne IP)
3. **Ou ajoutez plusieurs IPs** si vous travaillez depuis différents endroits

## 🌐 Alternative : Utiliser un Tunnel SSH

Si vous ne pouvez pas autoriser votre IP, utilisez un tunnel SSH (comme dans pgAdmin) :

### Avec PuTTY (Windows)

1. **Ouvrez PuTTY**
2. **Session** :
   - Host: `137.74.40.191`
   - Port: `22`
3. **Connection > SSH > Tunnels** :
   - Source port: `35392`
   - Destination: `sh131616-002.eu.clouddb.ovh.net:35392`
   - Cliquez "Add"
4. **Connection > Data** :
   - Auto-login username: `ubuntu`
5. **Cliquez "Open"** et entrez le mot de passe SSH
6. **Laissez PuTTY ouvert** (le tunnel reste actif)
7. **Mettez à jour .env** :
   ```env
   DB_HOST=localhost
   DB_PORT=35392
   ```

### Avec SSH (Ligne de commande)

```bash
ssh -L 35392:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191
```

Puis dans un autre terminal, testez avec `DB_HOST=localhost`.

## ✅ Vérification

Après avoir autorisé l'IP ou créé le tunnel :

```bash
# Tester la connexion
node scripts/verifier-connexion-ovh.mjs

# Démarrer le serveur
npm start

# Tester les routes CRUD
node scripts/test-crud-avec-auth.mjs
```
