# 🔄 Commandes pour Mettre à Jour le Serveur

## Étape 1 : Trouver ou Cloner le Projet

### Option A : Si le projet existe déjà quelque part

```bash
# Chercher le projet
find ~ -type d -name "La-Plume-Artisanale" 2>/dev/null
find /opt -type d -name "fouta-erp" 2>/dev/null
find /var/www -type d -name "fouta-erp" 2>/dev/null
find /home -type d -name "*fouta*" 2>/dev/null
```

### Option B : Cloner le projet depuis GitHub

```bash
# Créer le dossier si nécessaire
sudo mkdir -p /opt/fouta-erp
sudo chown -R $USER:$USER /opt/fouta-erp

# Cloner le projet
cd /opt
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
cd fouta-erp
```

## Étape 2 : Mettre à Jour le Projet

```bash
# Aller dans le projet
cd /opt/fouta-erp

# Récupérer les dernières modifications
git fetch origin
git pull origin main

# OU si vous êtes sur master
git pull origin master
```

## Étape 3 : Exécuter le Script de Déploiement

```bash
# Vérifier que le script existe
ls -la scripts/deploy.sh

# Si le script existe, l'exécuter
bash scripts/deploy.sh

# Si le script n'existe pas, créer un script simple
cat > deploy-simple.sh << 'EOF'
#!/bin/bash
cd /opt/fouta-erp
git pull origin main
cd backend
npm install --production
pm2 restart fouta-api || pm2 start src/server.js --name fouta-api
pm2 save
echo "✅ Mise à jour terminée"
EOF

chmod +x deploy-simple.sh
./deploy-simple.sh
```

## Étape 4 : Vérification

```bash
# Vérifier PM2
pm2 status

# Vérifier les logs
pm2 logs fouta-api --lines 20

# Tester l'API
curl http://localhost:5000/health
```

---

## 🚀 Script Complet à Copier-Coller

**Copiez-collez ce bloc complet dans votre terminal SSH :**

```bash
# Trouver ou cloner le projet
if [ -d "/opt/fouta-erp" ]; then
    echo "✅ Projet trouvé dans /opt/fouta-erp"
    cd /opt/fouta-erp
elif [ -d "/opt/La-Plume-Artisanale" ]; then
    echo "✅ Projet trouvé dans /opt/La-Plume-Artisanale"
    cd /opt/La-Plume-Artisanale
else
    echo "📥 Clonage du projet depuis GitHub..."
    sudo mkdir -p /opt/fouta-erp
    sudo chown -R $USER:$USER /opt/fouta-erp
    cd /opt
    git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
    cd fouta-erp
fi

# Mettre à jour depuis GitHub
echo "📥 Mise à jour depuis GitHub..."
git fetch origin
git pull origin main || git pull origin master

# Mettre à jour le backend
echo "🔧 Mise à jour du backend..."
cd backend
npm install --production

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart fouta-api || pm2 start src/server.js --name fouta-api
pm2 save

# Vérification
echo "✅ Mise à jour terminée"
pm2 status
```
