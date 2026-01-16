# 🔧 Retirer PORT du .env - Laisser OVH Gérer le Port

## ❌ Problème

L'erreur `EACCES: permission denied 127.0.0.1:5000` indique que le port 5000 n'est pas disponible ou nécessite des permissions spéciales.

Sur hébergement partagé OVH, il faut **laisser OVH gérer le port automatiquement** via `process.env.PORT`.

---

## ✅ Solution : Retirer PORT du .env

### Vérifier le Port Actuel

```bash
cd ~/fouta-erp/backend

# Vérifier si PORT est dans .env
grep "^PORT" .env
```

### Retirer ou Commenter PORT

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
#PORT=5000
```

**OU** retirez complètement la ligne.

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### Vérifier

```bash
# Vérifier que PORT est commenté ou retiré
grep "^PORT" .env

# Ne doit rien afficher (ou afficher #PORT=5000)
```

---

## 💡 Pourquoi ?

Sur hébergement partagé OVH :
- OVH fournit automatiquement `process.env.PORT`
- Le port est géré par OVH (reverse proxy)
- Il ne faut **PAS** forcer un port spécifique dans `.env`
- Le code utilise déjà `process.env.PORT || 5000`, donc si `process.env.PORT` n'est pas défini, il utilisera 5000 par défaut

**Mais sur OVH, `process.env.PORT` devrait être fourni automatiquement.**

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

- [ ] PORT commenté ou retiré du `.env`
- [ ] Code vérifié (utilise `process.env.PORT || 5000`)
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes
- [ ] Application vérifiée : `ps aux | grep node`
- [ ] Application testée : `curl http://fabrication.laplume-artisanale.tn/health`

---

## ⚠️ Note

L'erreur `EACCES` lors d'un démarrage manuel est **normale** sur hébergement partagé OVH. Le problème est que OVH ne démarre pas l'application automatiquement.

**Après avoir retiré PORT du .env, OVH devrait démarrer l'application automatiquement avec le port qu'il fournit.**

---

## ✅ Résumé

1. **Retirer ou commenter `PORT=5000` du `.env`**
2. **Forcer un redémarrage** : `touch index.js`
3. **Attendre 15-20 minutes**
4. **Vérifier** : `ps aux | grep node`
5. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`

**L'erreur EACCES est normale. Le problème est que OVH ne démarre pas l'application automatiquement !**

