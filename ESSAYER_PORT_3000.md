# 🔧 Essayer le Port 3000

## ⚠️ Note Importante

Sur hébergement partagé OVH, il est **recommandé de laisser OVH gérer le port automatiquement** via `process.env.PORT`.

**Mais si vous voulez essayer le port 3000**, voici comment :

---

## 🔧 Modifier le Port dans .env

### Option 1 : Modifier .env

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

### Option 2 : Modifier Directement

```bash
cd ~/fouta-erp/backend

# Modifier PORT dans .env
sed -i 's/^PORT=5000$/PORT=3000/' .env

# OU si PORT est commenté
sed -i 's/^#PORT=5000$/PORT=3000/' .env

# Vérifier
grep "^PORT" .env
```

---

## 🧪 Tester le Démarrage Manuel

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Charger .env
set -a
source .env
set +a

# Tester
node index.js
```

**Note** : Cela peut toujours échouer avec EACCES, car les ports sont gérés par OVH.

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

## ⚠️ Problème Principal

**Le vrai problème n'est pas le port**, mais que **OVH ne démarre pas l'application automatiquement**.

Même avec le port 3000, si OVH ne démarre pas l'application automatiquement, vous aurez toujours "Connexion refusée".

---

## 💡 Solution Recommandée

**Au lieu de forcer un port**, il est préférable de :

1. **Retirer ou commenter PORT du .env** (laisser OVH gérer)
2. **Vérifier la configuration Multisite OVH** (dossier racine, Node.js activé)
3. **Contacter le support OVH** si l'application ne démarre toujours pas

---

## 📋 Checklist

- [ ] PORT modifié à 3000 dans `.env`
- [ ] Test manuel effectué (peut échouer avec EACCES)
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes
- [ ] Application vérifiée : `ps aux | grep node`
- [ ] Application testée : `curl http://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Modifier PORT à 3000 dans `.env`** (si vous voulez essayer)
2. **Forcer un redémarrage** : `touch index.js`
3. **Attendre 15-20 minutes**
4. **Vérifier** : `ps aux | grep node`
5. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`

**Mais rappelez-vous : le problème principal est que OVH ne démarre pas l'application automatiquement, pas le port !**

