# 🔧 Résoudre "URL Not Found"

## ❌ Problème : "The requested URL was not found on this server"

Le serveur répond, mais la route n'est pas trouvée. Cela signifie que :
- ✅ Node.js est probablement activé
- ❌ L'application ne démarre pas correctement
- ❌ OU la route n'est pas configurée

---

## 🔍 Diagnostic

### 1. Vérifier les Logs OVH

Dans le panneau OVH :
1. Allez dans **Statistiques et logs**
2. Cherchez les **logs d'erreur** pour `fabrication.laplume-artisanale.tn`
3. Vérifiez les erreurs Node.js

### 2. Tester la Route Racine

Testez d'abord la route racine :

```bash
# Depuis votre navigateur
http://fabrication.laplume-artisanale.tn/

# OU depuis PowerShell
curl http://fabrication.laplume-artisanale.tn/
```

### 3. Vérifier que l'Application Démarre

Sur le serveur SSH, vérifiez si l'application peut démarrer :

```bash
cd ~/fouta-erp/backend

# Vérifier que package.json existe
cat package.json | head -20

# Vérifier que src/server.js existe
ls -la src/server.js
```

---

## ✅ Solution 1 : Vérifier la Route /health

La route `/health` doit être définie dans `server.js`. Vérifions :

```bash
# Sur le serveur SSH
cd ~/fouta-erp/backend
grep -n "health" src/server.js
```

La route devrait être :
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

---

## ✅ Solution 2 : Tester la Route Racine

Testez d'abord la route racine :

```bash
# Depuis votre navigateur
http://fabrication.laplume-artisanale.tn/

# OU
http://fabrication.laplume-artisanale.tn/api/health
```

---

## ✅ Solution 3 : Vérifier les Modules Installés

Si l'application ne démarre pas, vérifiez que les modules sont installés :

```bash
cd ~/fouta-erp/backend

# Vérifier que node_modules existe
ls -la node_modules/ | head -10

# Si node_modules est vide ou manquant
npm install --production
```

---

## ✅ Solution 4 : Vérifier les Erreurs dans les Logs

Sur le serveur SSH, vérifiez s'il y a des fichiers de logs :

```bash
# Chercher des fichiers de logs
find ~/fouta-erp/backend -name "*.log" 2>/dev/null

# Vérifier les logs OVH (si disponibles)
ls -la ~/logs/ 2>/dev/null
```

---

## 🔧 Solution 5 : Créer une Route de Test Simple

Si l'application ne démarre pas, créons une version simplifiée pour tester :

```bash
cd ~/fouta-erp/backend

# Créer un server-test.js simple
cat > server-test.js << 'EOF'
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Application Node.js fonctionne !' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
EOF

# Modifier index.js pour utiliser server-test.js temporairement
cat > index.js << 'EOF'
import './server-test.js';
EOF
```

Puis testez à nouveau.

---

## 📋 Checklist de Diagnostic

- [ ] Testé la route racine : `http://fabrication.laplume-artisanale.tn/`
- [ ] Vérifié les logs dans le panneau OVH
- [ ] Vérifié que `node_modules` existe
- [ ] Vérifié que `src/server.js` existe
- [ ] Vérifié la route `/health` dans `server.js`

---

## 🎯 Action Immédiate

1. **Testez la route racine** :
   - `http://fabrication.laplume-artisanale.tn/`

2. **Vérifiez les logs** dans le panneau OVH

3. **Vérifiez que les modules sont installés** :
   ```bash
   cd ~/fouta-erp/backend
   ls -la node_modules/ | head -10
   ```

4. **Dites-moi ce que vous voyez** dans les logs ou quand vous testez la route racine

---

## 💡 Note

Le fait que vous voyiez "URL not found" au lieu du listing de répertoire est un **bon signe** : Node.js est probablement activé ! Il faut maintenant s'assurer que l'application démarre correctement.

