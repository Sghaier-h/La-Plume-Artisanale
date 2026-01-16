# 🔧 Initialiser Git sur le Serveur

## Problème

Le projet existe dans `/opt/fouta-erp` mais n'est pas un dépôt Git (pas de dossier `.git`).

## Solution : Initialiser Git et Connecter à GitHub

**Copiez-collez ce bloc complet dans votre terminal SSH :**

```bash
cd /opt/fouta-erp

# Initialiser Git
echo "🔧 Initialisation de Git..."
git init

# Ajouter le remote GitHub
echo "🔗 Connexion à GitHub..."
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git

# Récupérer les branches
echo "📥 Récupération depuis GitHub..."
git fetch origin

# Vérifier les branches disponibles
git branch -r

# Basculer sur la branche main
git checkout -b main origin/main || git checkout -b master origin/master

# Ou si main existe déjà
git checkout main || git checkout master

# Mettre à jour le code
echo "📥 Mise à jour du code..."
git pull origin main || git pull origin master

# Vérifier le statut
echo "✅ Statut Git :"
git status

# Mettre à jour le backend
echo "🔧 Mise à jour du backend..."
cd backend
npm install --production

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart fouta-api
pm2 save

echo "✅ Mise à jour terminée !"
```

---

## Alternative : Cloner Frais (si vous préférez repartir de zéro)

**⚠️ Attention : Cela supprimera les fichiers locaux non versionnés**

```bash
# Sauvegarder le .env si nécessaire
cd /opt/fouta-erp/backend
cp .env ~/.env.backup

# Supprimer l'ancien dossier
cd /opt
sudo rm -rf fouta-erp

# Cloner depuis GitHub
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
cd fouta-erp

# Restaurer le .env
cp ~/.env.backup backend/.env

# Installer les dépendances
cd backend
npm install --production

# Redémarrer l'application
pm2 restart fouta-api || pm2 start src/server.js --name fouta-api
pm2 save
```

---

## Vérification

```bash
# Vérifier que Git fonctionne
cd /opt/fouta-erp
git status
git remote -v

# Vérifier PM2
pm2 status
pm2 logs fouta-api --lines 20
```
