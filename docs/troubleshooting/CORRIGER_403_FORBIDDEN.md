# 🔧 Corriger l'erreur 403 Forbidden

## 🎯 Problème

Nginx ne peut pas accéder aux fichiers du frontend (problème de permissions ou fichiers manquants).

## ✅ Solution

### 1. Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### 2. Vérifier que le frontend existe

```bash
ls -la /opt/fouta-erp/frontend/
```

**Si le dossier est vide ou n'existe pas**, il faut déployer le frontend.

### 3. Vérifier les permissions

```bash
# Vérifier les permissions actuelles
ls -la /opt/fouta-erp/frontend/

# Corriger les permissions
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend

# Vérifier que index.html existe
ls -la /opt/fouta-erp/frontend/index.html
```

### 4. Vérifier que Nginx peut lire les fichiers

```bash
# Tester avec l'utilisateur www-data
sudo -u www-data ls -la /opt/fouta-erp/frontend/
```

**Si ça ne fonctionne pas**, vérifier les permissions du dossier parent :

```bash
sudo chown -R www-data:www-data /opt/fouta-erp
sudo chmod -R 755 /opt/fouta-erp
```

### 5. Vérifier les logs Nginx

```bash
# Voir les erreurs récentes
sudo tail -20 /var/log/nginx/error.log
```

### 6. Si le frontend n'existe pas, le déployer

Voir `DEPLOYER_FRONTEND_VPS.md` pour les instructions complètes.

**Résumé rapide** :

```bash
# Sur le serveur, vérifier si le frontend est buildé
cd /opt/fouta-erp/frontend
ls -la

# Si vide, il faut build depuis votre machine Windows
```

## 🚀 Déployer le frontend depuis Windows

### Sur votre machine Windows :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"

# Créer .env.production
echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production

# Build
npm run build

# Transférer sur le serveur
scp -r build/* ubuntu@137.74.40.191:/opt/fouta-erp/frontend/
```

### Puis sur le serveur :

```bash
# Corriger les permissions
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend

# Vérifier
ls -la /opt/fouta-erp/frontend/index.html
```

## ✅ Vérification finale

```bash
# Vérifier que tout est OK
sudo -u www-data cat /opt/fouta-erp/frontend/index.html | head -5

# Redémarrer Nginx
sudo systemctl restart nginx
```

Puis tester : `https://fabrication.laplume-artisanale.tn`
