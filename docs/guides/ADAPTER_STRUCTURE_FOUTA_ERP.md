# 🔧 Adapter la Structure pour Dossier Racine fouta-erp

## 📋 Situation

Le dossier racine est configuré sur `fouta-erp` (pas `fouta-erp/backend`). Il faut adapter la structure ou la configuration.

---

## ✅ Solution 1 : Créer un Point d'Entrée à la Racine

Créer un fichier `server.js` ou `app.js` à la racine de `fouta-erp` qui démarre l'application backend.

### Structure Recommandée

```
fouta-erp/
├── server.js          (nouveau - point d'entrée)
├── package.json        (copier depuis backend/)
├── .env                (copier depuis backend/)
├── backend/
│   ├── src/
│   │   └── server.js
│   └── ...
└── ...
```

### Créer server.js à la Racine

```javascript
// fouta-erp/server.js
import './backend/src/server.js';
```

---

## ✅ Solution 2 : Déplacer les Fichiers Backend à la Racine

Déplacer les fichiers essentiels du backend à la racine de `fouta-erp`.

### Structure

```
fouta-erp/
├── src/
│   └── server.js
├── package.json
├── .env
└── ...
```

---

## ✅ Solution 3 : Utiliser un Fichier .htaccess (si PHP disponible)

Si OVH supporte les redirections, créer un `.htaccess` dans `fouta-erp` :

```apache
RewriteEngine On
RewriteRule ^(.*)$ backend/src/server.js [L]
```

Mais cela ne fonctionne que si Node.js est configuré correctement.

---

## 🚀 Solution Recommandée : Créer un Point d'Entrée

### Étape 1 : Créer server.js à la Racine

```bash
cd ~/fouta-erp
cat > server.js << 'EOF'
// Point d'entrée pour OVH
import './backend/src/server.js';
EOF
```

### Étape 2 : Copier package.json et .env

```bash
# Copier package.json
cp backend/package.json .

# Copier .env
cp backend/.env .
```

### Étape 3 : Modifier package.json

S'assurer que `package.json` à la racine a :
```json
{
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## 🔧 Configuration OVH

Dans le panneau OVH, pour le domaine `fabrication.laplume-artisanale.tn` :

- **Dossier racine** : `fouta-erp`
- **Point d'entrée Node.js** : `server.js` (ou `backend/src/server.js` si OVH permet de spécifier un chemin)

---

## 📋 Checklist

- [ ] Dossier racine : `fouta-erp`
- [ ] Point d'entrée créé à la racine
- [ ] package.json à la racine
- [ ] .env à la racine
- [ ] Node.js activé dans OVH
- [ ] Point d'entrée configuré dans OVH

---

## 🎯 Action Immédiate

1. **Sauvegardez** la configuration dans OVH avec `fouta-erp` comme dossier racine
2. **Créez** un point d'entrée à la racine si nécessaire
3. **Vérifiez** que Node.js est activé dans l'étape 2

---

## 💡 Note

Si OVH permet de spécifier un point d'entrée personnalisé dans l'étape 2, vous pouvez mettre `backend/src/server.js` et garder la structure actuelle.

