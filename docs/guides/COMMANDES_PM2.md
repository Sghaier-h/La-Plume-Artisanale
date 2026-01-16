# 🔧 Commandes PM2 - Résoudre "commande introuvable"

## ❌ Problème : `pm2 : commande introuvable`

PM2 est installé mais n'est pas dans le PATH de la session actuelle.

---

## ✅ Solution : Ajouter PM2 au PATH

```bash
# Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# Vérifier que PM2 est trouvé
which pm2
pm2 --version

# Maintenant vous pouvez utiliser PM2
pm2 status
pm2 restart fouta-api
```

---

## 🔄 Redémarrer l'Application

```bash
# 1. Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# 2. Redémarrer l'application
cd ~/fouta-erp/backend
pm2 restart fouta-api

# 3. Vérifier le statut
pm2 status

# 4. Voir les logs
pm2 logs fouta-api --lines 20
```

---

## 🔧 Solution Permanente

Pour que PM2 soit toujours disponible, ajoutez au `.bashrc` :

```bash
# Ajouter au .bashrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Vérifier
pm2 --version
```

---

## 🎯 Commandes Complètes

```bash
# Ajouter au PATH
export PATH="$HOME/.local/bin:$PATH"

# Aller dans le dossier backend
cd ~/fouta-erp/backend

# Redémarrer
pm2 restart fouta-api

# Vérifier
pm2 status
pm2 logs fouta-api --lines 30

# Tester l'API
curl http://localhost:5000/health
```

---

## 💡 Alternative : Chemin Complet

Si le PATH ne fonctionne pas, utilisez le chemin complet :

```bash
$HOME/.local/bin/pm2 status
$HOME/.local/bin/pm2 restart fouta-api
$HOME/.local/bin/pm2 logs fouta-api
```

---

## ✅ Après Correction

Une fois PM2 dans le PATH, toutes les commandes PM2 fonctionneront normalement.

