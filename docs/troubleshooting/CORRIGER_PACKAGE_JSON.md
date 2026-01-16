# 🔧 Corriger package.json - Point d'Entrée

## ❌ Problème : Point d'Entrée Incorrect

Le `package.json` a `"main": "src/server.js"` mais OVH cherche probablement `index.js` comme point d'entrée.

---

## ✅ Solution : Modifier package.json

Sur le serveur SSH :

```bash
cd ~/fouta-erp/backend

# Sauvegarder l'ancien package.json
cp package.json package.json.backup

# Modifier package.json pour mettre index.js comme point d'entrée
# Méthode 1 : Utiliser sed (si disponible)
sed -i 's/"main": "src\/server.js"/"main": "index.js"/' package.json

# OU Méthode 2 : Recréer la ligne main
grep -v '"main"' package.json > package.json.tmp
sed -i '/"type": "module",/a\  "main": "index.js",' package.json.tmp
mv package.json.tmp package.json

# Vérifier
cat package.json | grep -E "(main|type)"
```

---

## ✅ Solution Alternative : Modifier Manuellement

Si `sed` ne fonctionne pas, modifiez manuellement :

```bash
cd ~/fouta-erp/backend

# Créer un nouveau package.json avec index.js comme main
cat > package.json.new << 'EOF'
{
  "name": "fouta-erp-backend",
  "version": "1.0.0",
  "description": "API Backend pour ERP ALL BY FOUTA",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "migrate": "node src/database/migrate.js",
    "seed": "node src/database/seed.js",
    "test": "jest"
  },
  "keywords": [
    "erp",
    "textile",
    "production"
  ],
  "author": "ALL BY FOUTA",
  "license": "PROPRIETARY",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "socket.io": "^4.6.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "qrcode": "^1.5.3",
    "xlsx": "^0.18.5",
    "pdf-lib": "^1.17.1",
    "redis": "^4.6.10",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
EOF

# Remplacer l'ancien
mv package.json package.json.old
mv package.json.new package.json

# Vérifier
cat package.json | grep -E "(main|type)"
```

---

## 🔍 Vérification

Après modification :

```bash
# Vérifier que main pointe vers index.js
cat package.json | grep -E "(main|type)"

# Doit afficher :
# "main": "index.js",
# "type": "module",
```

---

## ⏰ Après Modification

1. **Attendez 2-3 minutes** pour qu'OVH prenne en compte les changements
2. **Testez** : `curl http://fabrication.laplume-artisanale.tn/health` (depuis Windows)
3. **Vérifiez** que ça fonctionne

---

## 📋 Checklist

- [ ] `package.json` modifié : `"main": "index.js"`
- [ ] `"type": "module"` toujours présent
- [ ] `index.js` existe et est correct
- [ ] Attendu 2-3 minutes
- [ ] Testé depuis Windows/navigateur

---

## 🎯 Action Immédiate

1. **Modifiez `package.json`** pour mettre `"main": "index.js"` (commandes ci-dessus)
2. **Vérifiez** : `cat package.json | grep -E "(main|type)"`
3. **Attendez 2-3 minutes**
4. **Testez** depuis Windows : `curl http://fabrication.laplume-artisanale.tn/health`

---

## 💡 Note

OVH cherche souvent le fichier défini dans `"main"` de `package.json`. Si `"main"` pointe vers `src/server.js` mais que vous avez créé `index.js`, OVH pourrait être confus.

