# Configuration PostgreSQL OVH Cloud

## 🎯 Configuration Détectée

D'après vos captures d'écran pgAdmin, votre serveur PostgreSQL est hébergé sur **OVH Cloud**, pas en localhost.

### Paramètres de Connexion OVH

- **Host**: `sh131616-002.eu.clouddb.ovh.net`
- **Port**: `35392`
- **Database**: `ERP_La_Plume`
- **User**: `Aviateur`
- **SSL**: Activé
- **SSH Tunnel**: Activé (optionnel)
  - Tunnel Host: `137.74.40.191`
  - Tunnel Port: `22`
  - Tunnel User: `ubuntu`

## 🔧 Mise à Jour du Fichier .env

Mettez à jour votre fichier `.env` avec ces valeurs :

```env
# Configuration PostgreSQL OVH Cloud
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Configuration JWT
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRE=24h

# Environnement
NODE_ENV=development
USE_MOCK_AUTH=false
```

## ✅ Vérification

Après mise à jour du `.env`, testez la connexion :

```bash
node scripts/verifier-connexion-ovh.mjs
```

## 🔐 Configuration SSL

Le script de vérification utilise SSL avec `rejectUnauthorized: false` pour OVH Cloud.

Si vous avez besoin d'une configuration SSL plus stricte, modifiez `src/utils/db.js` :

```javascript
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('path/to/ca-cert.pem') // Si OVH fournit un certificat
}
```

## 🌐 SSH Tunnel (Optionnel)

Si vous utilisez un SSH tunnel dans pgAdmin, vous pouvez aussi le configurer pour Node.js avec `ssh2` :

```bash
npm install ssh2
```

Puis créez un script qui établit le tunnel avant de se connecter à PostgreSQL.

## ⚠️ Important

1. **Autorisation IP** : Assurez-vous que l'IP de votre machine est autorisée dans le pare-feu OVH
2. **Mot de passe** : Vérifiez que le mot de passe dans `.env` correspond à celui dans pgAdmin
3. **SSL** : OVH Cloud nécessite généralement SSL pour les connexions

## 🧪 Test Final

```bash
# Vérifier la connexion
node scripts/verifier-connexion-ovh.mjs

# Démarrer le serveur
npm start

# Tester les routes CRUD
node scripts/test-crud-avec-auth.mjs
```
