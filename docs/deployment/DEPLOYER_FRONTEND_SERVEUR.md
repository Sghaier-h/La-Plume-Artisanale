# Déployer le Frontend depuis le Serveur

Si le transfert SCP échoue, vous pouvez builder le frontend directement sur le serveur.

## Méthode 1 : Builder sur le serveur (recommandé)

### 1. Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
cd /opt/fouta-erp
```

### 2. Mettre à jour le dépôt

```bash
sudo chown -R ubuntu:ubuntu frontend/
git stash
git pull origin main
```

### 3. Créer le fichier .env.production

```bash
cd frontend
echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production
cat .env.production
```

### 4. Installer les dépendances (si nécessaire)

```bash
npm install
```

### 5. Builder le frontend

```bash
npm run build
```

Cela peut prendre 5-10 minutes sur le serveur.

### 6. Déplacer le build vers le dossier de déploiement

```bash
cd /opt/fouta-erp
sudo rm -rf frontend/* frontend/.* 2>/dev/null
sudo cp -r frontend/build/* frontend/
sudo chown -R www-data:www-data frontend/
sudo chmod -R 755 frontend/
sudo systemctl reload nginx
```

### 7. Vérifier

```bash
ls -la frontend/index.html
JS_FILE=$(find frontend/static/js -name "main.*.js" | head -1)
grep -q "fabrication.laplume-artisanale.tn" "$JS_FILE" && echo "✅ URL correcte" || echo "❌ URL incorrecte"
```

## Méthode 2 : Utiliser FileZilla

1. Builder le frontend sur Windows
2. Utiliser FileZilla pour transférer le contenu du dossier `build/` vers `/opt/fouta-erp/frontend/` sur le serveur
3. Corriger les permissions sur le serveur :

```bash
sudo chown -R www-data:www-data /opt/fouta-erp/frontend/
sudo chmod -R 755 /opt/fouta-erp/frontend/
sudo systemctl reload nginx
```
