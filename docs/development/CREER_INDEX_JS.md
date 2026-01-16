# 🚀 Créer le Fichier index.js

## 📋 Objectif

Créer le fichier `index.js` à la racine de `fouta-erp/backend` pour qu'OVH puisse démarrer l'application Node.js.

---

## ✅ Commande à Exécuter

Sur le serveur SSH :

```bash
cd ~/fouta-erp/backend

# Créer index.js
cat > index.js << 'EOF'
// Point d'entrée pour OVH
import './src/server.js';
EOF

# Vérifier que le fichier est créé
cat index.js

# Vérifier les permissions
ls -la index.js
```

---

## 📋 Contenu du Fichier

Le fichier `index.js` doit contenir :

```javascript
// Point d'entrée pour OVH
import './src/server.js';
```

---

## ✅ Vérification

Après création :

```bash
# Vérifier que le fichier existe
ls -la ~/fouta-erp/backend/index.js

# Voir le contenu
cat ~/fouta-erp/backend/index.js
```

---

## ⏰ Après Création

1. **Attendez 5-10 minutes** pour qu'OVH prenne en compte le fichier
2. **Testez** l'accès au domaine :
   ```bash
   curl http://fabrication.laplume-artisanale.tn/health
   ```
3. **OU** depuis votre navigateur :
   - `http://fabrication.laplume-artisanale.tn/health`

---

## 🎯 Résultat Attendu

Après propagation, vous devriez voir :
- `{"status":"OK","timestamp":"..."}` au lieu du listing de répertoire

---

## 🆘 Si Ça Ne Fonctionne Pas

1. Vérifier que `index.js` est bien créé
2. Vérifier que `.ovhconfig` est correct
3. Contacter le support OVH pour activer Node.js

