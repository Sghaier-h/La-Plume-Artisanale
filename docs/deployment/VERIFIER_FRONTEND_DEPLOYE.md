# Vérifier le Frontend Déployé

## Commandes rapides (sans Git)

### 1. Vérifier que les fichiers sont présents

```bash
cd /opt/fouta-erp
ls -la frontend/index.html
ls -la frontend/static/js/main.*.js | head -1
```

### 2. Vérifier les permissions

```bash
sudo -u www-data test -r /opt/fouta-erp/frontend/index.html && echo "✅ Nginx peut lire" || echo "❌ Problème de permissions"
```

### 3. Vérifier l'URL API dans le build

```bash
JS_FILE=$(find /opt/fouta-erp/frontend/static/js -name "main.*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    if grep -q "fabrication.laplume-artisanale.tn" "$JS_FILE"; then
        echo "✅ URL de production trouvée dans le build"
    elif grep -q "localhost:5000" "$JS_FILE"; then
        echo "❌ URL localhost trouvée - Le build doit être refait"
    else
        echo "ℹ️  Impossible de déterminer l'URL"
    fi
fi
```

### 4. Vérifier que le backend est accessible

```bash
curl -s http://localhost:5000/api/health | head -1
```

### 5. Vérifier Nginx

```bash
sudo systemctl status nginx --no-pager | head -5
```

## Script complet en une commande

```bash
cd /opt/fouta-erp && \
echo "📁 Vérification des fichiers:" && \
ls -la frontend/index.html && \
echo "" && \
echo "🔍 Test permissions Nginx:" && \
sudo -u www-data test -r frontend/index.html && echo "✅ OK" || echo "❌ KO" && \
echo "" && \
echo "🔍 URL API dans le build:" && \
JS_FILE=$(find frontend/static/js -name "main.*.js" | head -1) && \
if grep -q "fabrication.laplume-artisanale.tn" "$JS_FILE" 2>/dev/null; then \
    echo "✅ URL de production trouvée"; \
elif grep -q "localhost:5000" "$JS_FILE" 2>/dev/null; then \
    echo "❌ URL localhost trouvée - Build à refaire"; \
else \
    echo "ℹ️  Impossible de déterminer"; \
fi && \
echo "" && \
echo "🔍 Backend:" && \
curl -s http://localhost:5000/api/health 2>/dev/null | head -1 || echo "⚠️  Backend non accessible"
```
