# 🔧 Corriger l'Erreur 501 Définitivement

## ❌ Problème : Erreur 501 Persiste

L'erreur 501 signifie que Node.js est activé, mais l'application ne démarre pas correctement.

---

## 🔍 Diagnostic Complet

Sur le serveur SSH, exécutez ces commandes pour diagnostiquer :

```bash
cd ~/fouta-erp/backend

# 1. Vérifier que index.js existe
echo "=== index.js ==="
cat index.js

# 2. Vérifier que src/server.js existe
echo "=== src/server.js existe ? ==="
ls -la src/server.js

# 3. Vérifier que les modules sont installés
echo "=== node_modules ==="
ls -la node_modules/ | head -10

# 4. Vérifier package.json
echo "=== package.json ==="
cat package.json | head -20
```

---

## ✅ Solution 1 : Vérifier et Installer les Modules

Si `node_modules` est vide ou manquant :

```bash
cd ~/fouta-erp/backend

# Installer les modules
npm install --production

# Vérifier
ls -la node_modules/ | head -10
```

---

## ✅ Solution 2 : Créer un index.js Simplifié pour Tester

Créons un `index.js` simplifié qui fonctionne à coup sûr :

```bash
cd ~/fouta-erp/backend

# Sauvegarder l'ancien index.js
cp index.js index.js.backup

# Créer un index.js simplifié
cat > index.js << 'EOF'
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Application Node.js fonctionne !',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
});
EOF

# Vérifier
cat index.js
```

Attendez 2-3 minutes et testez à nouveau.

---

## ✅ Solution 3 : Vérifier que package.json est Correct

Vérifiez que `package.json` contient bien `"type": "module"` :

```bash
cd ~/fouta-erp/backend

# Vérifier package.json
cat package.json | grep -E "(type|module)"
```

Doit afficher :
```json
"type": "module",
```

Si ce n'est pas le cas, modifiez `package.json`.

---

## ✅ Solution 4 : Vérifier les Logs OVH

Dans le panneau OVH :
1. Allez dans **Statistiques et logs**
2. Cherchez les **logs d'erreur** pour `fabrication.laplume-artisanale.tn`
3. Vérifiez les erreurs Node.js spécifiques

---

## 🔧 Script de Diagnostic Complet

Exécutez ce script pour tout vérifier :

```bash
cd ~/fouta-erp/backend

echo "=== DIAGNOSTIC COMPLET ==="
echo ""
echo "1. Fichiers présents :"
ls -la | grep -E "(index.js|.ovhconfig|package.json|src)"
echo ""
echo "2. Contenu index.js :"
cat index.js
echo ""
echo "3. src/server.js existe ?"
ls -la src/server.js 2>/dev/null || echo "❌ src/server.js n'existe pas"
echo ""
echo "4. node_modules existe ?"
ls -la node_modules/ 2>/dev/null | head -5 || echo "❌ node_modules n'existe pas"
echo ""
echo "5. package.json type :"
cat package.json | grep -E "(type|module)" || echo "❌ type: module non trouvé"
echo ""
echo "6. .ovhconfig :"
cat .ovhconfig
```

---

## 📋 Checklist de Correction

- [ ] Modules installés (`npm install --production`)
- [ ] `index.js` présent et correct
- [ ] `src/server.js` existe
- [ ] `package.json` contient `"type": "module"`
- [ ] `.ovhconfig` présent et correct
- [ ] Logs OVH vérifiés
- [ ] Attendu 2-3 minutes après modifications
- [ ] Testé à nouveau

---

## 🎯 Action Immédiate

1. **Exécutez le script de diagnostic** ci-dessus
2. **Installez les modules** si manquants : `npm install --production`
3. **Créez un `index.js` simplifié** (Solution 2)
4. **Attendez 2-3 minutes**
5. **Testez à nouveau** : `curl http://fabrication.laplume-artisanale.tn/health`

---

## 💡 Note

L'erreur 501 signifie que Node.js est activé mais l'application ne peut pas démarrer. Les causes les plus courantes sont :
- Modules non installés
- Erreur dans le code
- Point d'entrée incorrect

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

1. **Vérifiez les logs** dans le panneau OVH
2. **Contactez le support OVH** avec :
   - Le résultat du diagnostic
   - Les logs d'erreur
   - La demande d'aide pour résoudre l'erreur 501

