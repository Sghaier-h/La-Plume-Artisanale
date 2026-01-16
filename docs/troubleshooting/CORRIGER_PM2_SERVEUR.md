# 🔧 Corriger la Configuration PM2

## Problème

PM2 essaie de démarrer `index.js` qui n'existe pas. Le serveur est dans `src/server.js`.

## Solution : Corriger la Configuration PM2

**Copiez-collez ce bloc complet dans votre terminal SSH :**

```bash
cd /opt/fouta-erp/backend

# Arrêter l'application actuelle
pm2 stop fouta-api
pm2 delete fouta-api

# Démarrer avec le bon fichier
pm2 start src/server.js --name fouta-api

# OU si vous préférez avec un fichier de configuration PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'fouta-api',
    script: 'src/server.js',
    cwd: '/opt/fouta-erp/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Démarrer avec le fichier de configuration
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Vérifier le statut
pm2 status
pm2 logs fouta-api --lines 20
```

---

## Alternative : Commande Simple

```bash
cd /opt/fouta-erp/backend
pm2 stop fouta-api
pm2 delete fouta-api
pm2 start src/server.js --name fouta-api
pm2 save
pm2 status
```

---

## Vérification

```bash
# Vérifier que l'application fonctionne
pm2 status
pm2 logs fouta-api --lines 20

# Tester l'API
curl http://localhost:5000/health
curl https://fabrication.laplume-artisanale.tn/health
```
