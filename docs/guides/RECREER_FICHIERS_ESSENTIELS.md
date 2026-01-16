# 🔧 Recréer les Fichiers Essentiels

## ❌ Problème

Dans `~/fouta-erp/backend`, il manque :
- ❌ `.ovhconfig` (nécessaire pour activer Node.js)
- ❌ `index.js` (point d'entrée pour OVH)
- ❌ Application Node.js ne tourne plus

---

## ✅ Solution : Recréer les Fichiers

### 1. Créer le Fichier .ovhconfig

```bash
cd ~/fouta-erp/backend

cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF

# Vérifier
cat .ovhconfig
```

### 2. Créer le Fichier index.js

```bash
cd ~/fouta-erp/backend

cat > index.js << 'EOF'
// Point d'entrée pour OVH
import './src/server.js';
EOF

# Vérifier
cat index.js
```

### 3. Vérifier que src/server.js Existe

```bash
# Vérifier
ls -la src/server.js

# Voir les premières lignes
head -20 src/server.js
```

### 4. Vérifier le Fichier .env

```bash
# Vérifier que .env existe et est configuré
cat .env

# Doit contenir au minimum :
# DB_HOST=sh131616-002.eu.clouddb.ovh.net
# DB_PORT=35392
# DB_NAME=ERP_La_Plume
# DB_USER=Aviateur
# DB_PASSWORD=Allbyfouta007
# PORT=50000
# NODE_ENV=production
```

---

## ⏰ Attendre la Propagation

Après avoir créé les fichiers :

1. **Attendez 10-15 minutes** pour qu'OVH détecte les fichiers et redémarre l'application
2. **Vérifiez que l'application tourne** :
   ```bash
   ps aux | grep node
   ```
3. **Testez l'application** :
   ```bash
   curl http://fabrication.laplume-artisanale.tn/health
   ```

---

## 🔍 Vérifications Complètes

### Checklist

- [ ] Fichier `.ovhconfig` créé et correct
- [ ] Fichier `index.js` créé et correct
- [ ] Fichier `src/server.js` existe
- [ ] Fichier `.env` existe et est configuré
- [ ] `node_modules/` existe
- [ ] Attendu 10-15 minutes
- [ ] Application Node.js tourne (`ps aux | grep node`)
- [ ] Testé l'application

---

## 🧪 Test Final

Après avoir créé les fichiers et attendu 10-15 minutes :

```bash
# Vérifier que l'application tourne
ps aux | grep node

# Tester HTTP
curl http://fabrication.laplume-artisanale.tn/health

# Tester HTTPS
curl https://fabrication.laplume-artisanale.tn/health
```

**Résultat attendu** :
```json
{"status":"OK","timestamp":"2024-..."}
```

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

### Vérifier la Configuration Multisite

Dans le panneau OVH :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. Vérifiez que le **dossier racine** est : `fouta-erp/backend`
3. Vérifiez que **Node.js** est activé

### Contacter le Support OVH

Si après 15-20 minutes ça ne fonctionne toujours pas :
1. Panneau OVH → **Support** → **Créer un ticket**
2. Mentionnez que vous avez recréé `.ovhconfig` et `index.js` mais que l'application ne démarre pas

---

## ✅ Résumé

1. **Créer `.ovhconfig`** dans `~/fouta-erp/backend`
2. **Créer `index.js`** dans `~/fouta-erp/backend`
3. **Attendre 10-15 minutes**
4. **Vérifier que l'application tourne**
5. **Tester l'application**

**Ces fichiers sont essentiels pour qu'OVH puisse démarrer votre application Node.js !**

