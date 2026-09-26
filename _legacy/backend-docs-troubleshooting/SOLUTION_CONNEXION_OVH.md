# Solution Connexion OVH Cloud PostgreSQL

## ❌ Problème Actuel

**Erreur**: `connect ETIMEDOUT` - La connexion ne peut pas atteindre le serveur OVH.

## 🔍 Causes Possibles

1. **IP non autorisée** dans le pare-feu OVH
2. **Tunnel SSH requis** (comme configuré dans pgAdmin)
3. **Port bloqué** par le firewall local

## ✅ Solutions

### Solution 1 : Autoriser votre IP dans OVH (Recommandé)

1. **Connectez-vous à votre espace client OVH**
2. **Allez dans votre base de données PostgreSQL**
3. **Section "Autorisations IP"** ou "Restricted IPs"
4. **Ajoutez l'IP publique de votre machine**
   - Pour connaître votre IP : https://www.whatismyip.com/
   - Ajoutez cette IP dans la liste des IPs autorisées
5. **Attendez quelques minutes** pour que les changements prennent effet

### Solution 2 : Utiliser un Tunnel SSH (Comme dans pgAdmin)

Si vous utilisez un tunnel SSH dans pgAdmin, vous devez aussi le configurer pour Node.js.

#### Option A : Tunnel SSH Manuel (PuTTY ou SSH)

1. **Créer un tunnel SSH avec PuTTY** :
   - Host: `137.74.40.191`
   - Port: `22`
   - Username: `ubuntu`
   - Local port forwarding: `localhost:35392` → `sh131616-002.eu.clouddb.ovh.net:35392`

2. **Mettre à jour le .env** :
   ```env
   DB_HOST=localhost
   DB_PORT=35392
   ```

#### Option B : Tunnel SSH Automatique (Node.js)

Installez `ssh2` :
```bash
npm install ssh2
```

Créez un script `scripts/tunnel-ssh.mjs` qui établit le tunnel avant de se connecter.

### Solution 3 : Vérifier le Firewall Local

1. **Windows Firewall** :
   - Vérifiez que le port 35392 n'est pas bloqué
   - Autorisez Node.js dans le firewall

2. **Antivirus** :
   - Vérifiez que votre antivirus n'bloque pas les connexions sortantes

## 🔧 Configuration Recommandée

### Si vous autorisez votre IP dans OVH (Solution 1)

Votre `.env` devrait contenir :
```env
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

### Si vous utilisez un tunnel SSH (Solution 2)

1. **Créez le tunnel SSH** (PuTTY ou ligne de commande)
2. **Mettez à jour le .env** :
   ```env
   DB_HOST=localhost
   DB_PORT=35392
   DB_NAME=ERP_La_Plume
   DB_USER=Aviateur
   DB_PASSWORD=Allbyfouta007
   ```

## 🧪 Test de Connexion

Après avoir configuré, testez :

```bash
node scripts/verifier-connexion-ovh.mjs
```

## 📝 Commandes SSH Tunnel (Ligne de commande)

Si vous préférez créer le tunnel via ligne de commande :

```bash
ssh -L 35392:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191
```

Puis dans un autre terminal :
```bash
# Mettre à jour .env pour utiliser localhost
DB_HOST=localhost
DB_PORT=35392

# Tester
node scripts/verifier-connexion-ovh.mjs
```

## ✅ Vérification Finale

Une fois la connexion réussie :

```bash
# Démarrer le serveur
npm start

# Tester les routes CRUD
node scripts/test-crud-avec-auth.mjs
```
