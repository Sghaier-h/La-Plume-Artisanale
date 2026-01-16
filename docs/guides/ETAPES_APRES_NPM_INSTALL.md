# ✅ Étapes Après npm install --production

## ✅ Dépendances Installées

Les dépendances sont installées. Il y a un avertissement de sécurité (1 high severity vulnerability), mais ce n'est pas critique pour le moment.

---

## 🔍 Vérifications Immédiates

### 1. Vérifier que le Code est Correct

```bash
cd ~/fouta-erp/backend

# Vérifier que HOST n'est plus défini
grep "const HOST\|let HOST\|var HOST" src/server.js

# Ne doit rien afficher

# Vérifier listen() et console.log
grep -A 3 "httpServer.listen" src/server.js

# Doit afficher :
# const PORT = process.env.PORT || 5000;
# 
# httpServer.listen(PORT, () => {
#   console.log(`🚀 Serveur démarré sur le port ${PORT}`);
```

### 2. Vérifier les Fichiers Essentiels

```bash
# Vérifier .ovhconfig
cat .ovhconfig

# Vérifier index.js
cat index.js

# Vérifier que server.js existe
ls -la src/server.js
```

### 3. Consulter les Logs OVH (CRITIQUE)

```bash
# Voir les erreurs récentes
tail -50 ~/logs/error.log | grep -i "node\|passenger\|error"

# OU voir tous les logs d'erreur récents
tail -100 ~/logs/error.log

# Logs d'accès
tail -50 ~/logs/access.log
```

**Les logs vous diront exactement pourquoi l'application ne démarre pas !**

---

## 🔧 Corrections Si Nécessaire

### Si HOST est encore présent

```bash
cd ~/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

**Retirer** :
```javascript
const HOST = '127.0.0.1';
```

**Et modifier** :
```javascript
console.log(`🚀 Serveur démarré sur le port ${PORT}`);
```

### Si index.js n'existe pas

```bash
cd ~/fouta-erp/backend

# Créer index.js
cat > index.js << 'EOF'
// Point d'entrée pour OVH
import './src/server.js';
EOF
```

### Si .ovhconfig n'existe pas

```bash
cd ~/fouta-erp/backend

# Créer .ovhconfig
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF
```

---

## 🔄 Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher tous les fichiers importants
touch index.js
touch .ovhconfig
touch src/server.js
touch package.json

# Attendre 15-20 minutes
```

---

## 🧪 Vérifications Après Attente (15-20 minutes)

### 1. Vérifier que l'Application Tourne

```bash
ps aux | grep node | grep -v grep

# Doit afficher un processus node
# Exemple :
# allbyfb 12345 0.0 0.2 ... node /home/allbyfb/fouta-erp/backend/index.js
```

### 2. Consulter les Logs à Nouveau

```bash
# Voir les nouvelles erreurs
tail -50 ~/logs/error.log | grep -i "node\|passenger\|error"
```

### 3. Tester l'Application

```bash
curl http://fabrication.laplume-artisanale.tn/health

# Doit retourner :
# {"status":"OK","timestamp":"2025-01-06T..."}
```

---

## 📋 Checklist

- [x] Dépendances installées : `npm install --production`
- [ ] Code vérifié (HOST retiré)
- [ ] Fichiers essentiels vérifiés (`.ovhconfig`, `index.js`)
- [ ] Logs OVH consultés : `tail -50 ~/logs/error.log`
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes
- [ ] Application vérifiée : `ps aux | grep node`
- [ ] Application testée : `curl http://fabrication.laplume-artisanale.tn/health`

---

## 💡 Note sur la Vulnérabilité

L'avertissement "1 high severity vulnerability" n'est pas critique pour le moment. Vous pouvez le corriger plus tard avec :

```bash
npm audit fix
```

**Mais ce n'est pas urgent pour faire fonctionner l'application.**

---

## ✅ Résumé

1. **Vérifier le code** : HOST retiré
2. **Consulter les logs OVH** : `tail -50 ~/logs/error.log` (CRITIQUE)
3. **Forcer un redémarrage** : `touch index.js`
4. **Attendre 15-20 minutes**
5. **Vérifier** : `ps aux | grep node`
6. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`

**Les logs OVH vous diront exactement pourquoi l'application ne démarre pas !**

