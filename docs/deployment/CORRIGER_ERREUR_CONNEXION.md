# Corriger l'erreur "Impossible de se connecter au serveur"

## 🎯 Problème

Le frontend essaie de se connecter à `http://localhost:5000` au lieu de `https://fabrication.laplume-artisanale.tn/api`.

## ✅ Solution

Le frontend doit être reconstruit avec la bonne configuration d'environnement.

### Option 1 : Déploiement automatique (recommandé)

Sur votre machine Windows :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\scripts\deployer-frontend-auto.ps1
```

Ce script :
1. Crée le fichier `.env.production` avec la bonne URL
2. Build le frontend avec la bonne configuration
3. Déploie sur le serveur
4. Corrige les permissions

### Option 2 : Déploiement manuel

#### 1. Vérifier le fichier .env.production

Sur votre machine Windows :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
cat .env.production
```

**Doit contenir** :
```
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
```

**Si le fichier n'existe pas ou est incorrect**, créez-le :

```powershell
echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production
```

#### 2. Build du frontend

```powershell
npm run build
```

#### 3. Déployer sur le serveur

```powershell
scp -r build/* ubuntu@137.74.40.191:/opt/fouta-erp/frontend/
```

#### 4. Corriger les permissions sur le serveur

```bash
ssh ubuntu@137.74.40.191
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend
sudo systemctl reload nginx
```

## 🔍 Vérification

1. Ouvrez le site : `https://fabrication.laplume-artisanale.tn`
2. Ouvrez la console du navigateur (F12)
3. Vérifiez que les requêtes API pointent vers `https://fabrication.laplume-artisanale.tn/api`

## ⚠️ Important

- **Le fichier `.env.production` doit exister AVANT le build**
- **Les variables d'environnement React commencent par `REACT_APP_`**
- **Après modification de `.env.production`, le frontend doit être reconstruit**
