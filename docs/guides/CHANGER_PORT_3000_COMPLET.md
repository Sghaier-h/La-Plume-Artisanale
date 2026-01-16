# 🔧 Changer le Port à 3000 - Guide Complet

## ✅ Bonne Nouvelle

Le code dans `server.js` utilise déjà `process.env.PORT || 5000`, donc **vous n'avez besoin de changer QUE le fichier `.env`**.

**Aucun autre fichier ne doit être modifié !**

---

## 🔧 Modification Unique : .env

### Vérifier le Port Actuel

```bash
cd ~/fouta-erp/backend

# Vérifier le port actuel
grep "^PORT" .env
```

### Modifier le Port à 3000

```bash
cd ~/fouta-erp/backend

# Éditer .env
nano .env
```

**Cherchez** :
```
PORT=5000
```

**Remplacez par** :
```
PORT=3000
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### OU Modifier Directement avec sed

```bash
cd ~/fouta-erp/backend

# Modifier PORT dans .env
sed -i 's/^PORT=5000$/PORT=3000/' .env

# OU si PORT est commenté
sed -i 's/^#PORT=5000$/PORT=3000/' .env

# Vérifier
grep "^PORT" .env

# Doit afficher : PORT=3000
```

---

## ✅ Pourquoi Uniquement .env ?

### Code dans server.js

Le code utilise déjà :
```javascript
const PORT = process.env.PORT || 5000;
```

Cela signifie :
- Si `process.env.PORT` est défini (depuis `.env`), il l'utilise
- Sinon, il utilise `5000` par défaut

**Donc, changer `PORT=3000` dans `.env` suffit !**

### Aucun Autre Fichier à Modifier

- ✅ `server.js` : Utilise déjà `process.env.PORT` (pas besoin de changer)
- ✅ Routes, contrôleurs : N'utilisent pas le port directement
- ✅ Frontend : Utilise l'URL complète (pas le port directement)

---

## 🔄 Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers
touch index.js
touch .ovhconfig
touch .env

# Attendre 15-20 minutes
```

---

## 🧪 Vérifications Après Attente

### 1. Vérifier que l'Application Tourne

```bash
ps aux | grep node | grep -v grep

# Doit afficher un processus node
```

### 2. Tester l'Application

```bash
curl http://fabrication.laplume-artisanale.tn/health

# Doit retourner :
# {"status":"OK","timestamp":"2025-01-06T..."}
```

---

## 📋 Checklist

- [ ] PORT modifié à 3000 dans `.env` uniquement
- [ ] Aucun autre fichier modifié (pas nécessaire)
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes
- [ ] Application vérifiée : `ps aux | grep node`
- [ ] Application testée : `curl http://fabrication.laplume-artisanale.tn/health`

---

## ⚠️ Note Importante

**Le problème principal n'est pas le port**, mais que **OVH ne démarre pas l'application automatiquement**.

Même avec le port 3000, si OVH ne démarre pas l'application automatiquement, vous aurez toujours "Connexion refusée".

**Il faut vérifier la configuration Multisite OVH** (dossier racine, Node.js activé).

---

## ✅ Résumé

1. **Modifier uniquement `.env`** : `PORT=3000`
2. **Aucun autre fichier à modifier** (le code utilise déjà `process.env.PORT`)
3. **Forcer un redémarrage** : `touch index.js`
4. **Attendre 15-20 minutes**
5. **Vérifier** : `ps aux | grep node`
6. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`

**Vous n'avez besoin de changer QUE le fichier `.env` !**

