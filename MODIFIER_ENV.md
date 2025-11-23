# 🔧 Modifier le Fichier .env - Alternative

## ❌ Problème : `sed -i` ne fonctionne pas

Sur certains systèmes, `sed -i` ne fonctionne pas. Utilisez une méthode alternative.

---

## ✅ Solution 1 : Utiliser `grep` et `echo`

```bash
cd ~/fouta-erp/backend

# Sauvegarder l'ancien fichier
cp .env .env.backup

# Créer un nouveau .env sans la ligne PORT
grep -v "^PORT=" .env > .env.tmp

# Ajouter la nouvelle ligne PORT
echo "PORT=30000" >> .env.tmp

# Remplacer l'ancien fichier
mv .env.tmp .env

# Vérifier
grep PORT .env
```

---

## ✅ Solution 2 : Utiliser `cat` avec `grep`

```bash
cd ~/fouta-erp/backend

# Créer un nouveau .env
cat > .env << 'EOF'
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
PORT=30000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn
JWT_SECRET=7548d6237c7df1abf961bce5a3990b01939d3a902f27a3ae3c0b233deefc2537
JWT_EXPIRE=7d
API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1
REDIS_HOST=localhost
REDIS_PORT=6379
HOST=127.0.0.1
EOF

# Vérifier
cat .env
```

---

## ✅ Solution 3 : Utiliser un Éditeur Simple

```bash
cd ~/fouta-erp/backend

# Si nano est disponible
nano .env
# Chercher PORT=5000 et changer en PORT=30000
# Sauvegarder : Ctrl+X, puis Y, puis Enter

# OU si vi est disponible
vi .env
# Appuyer sur 'i' pour mode insertion
# Chercher PORT=5000 et changer en PORT=30000
# Sauvegarder : Esc, puis :wq, puis Enter
```

---

## 🚀 Après Modification

```bash
# Redémarrer l'application
export PATH="$HOME/.local/bin:$PATH"
pm2 restart fouta-api --update-env

# Vérifier
pm2 status
pm2 logs fouta-api --lines 20

# Tester
curl http://localhost:30000/health
```

---

## 💡 Méthode la Plus Simple

**Utilisez la Solution 2** (avec `cat`) - elle recrée le fichier .env complet avec le bon port.

