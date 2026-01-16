# ✅ Étapes Finales - Application Prête

## ✅ Ce qui est Fait

- [x] Code `src/server.js` corrigé (HOST retiré de listen())
- [x] `listen()` correct : `httpServer.listen(PORT, () => {`
- [x] Fichiers touchés pour forcer redémarrage
- [x] Vérifié qu'aucun processus Node.js ne tourne

---

## 🔧 Dernière Étape : Commenter PORT dans .env

### Option 1 : Commenter PORT (Recommandé)

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

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### Option 2 : Retirer la Ligne

```bash
cd ~/fouta-erp/backend

# Retirer la ligne PORT=5000
sed -i '/^PORT=5000$/d' .env

# Vérifier
grep "^PORT" .env
# Ne doit rien afficher
```

---

## ⏰ Attendre 10-15 Minutes

OVH doit maintenant :
1. Détecter les modifications
2. Redémarrer l'application automatiquement
3. Assigner un port automatiquement

**Attendez 10-15 minutes avant de tester.**

---

## 🧪 Tests Après Attente

### 1. Vérifier que l'Application Tourne

```bash
cd ~/fouta-erp/backend

# Vérifier les processus Node.js
ps aux | grep node | grep -v grep

# Doit afficher un processus node
# Exemple :
# allbyfb 12345 0.0 0.2 ... node /home/allbyfb/fouta-erp/backend/index.js
```

### 2. Tester l'Application

```bash
# Tester HTTP
curl http://fabrication.laplume-artisanale.tn/health

# Doit retourner :
# {"status":"OK","timestamp":"2025-01-06T..."}
```

### 3. Si Ça Ne Fonctionne Pas

```bash
# Vérifier les fichiers essentiels
cat .ovhconfig
cat index.js

# Vérifier le code
grep -A 3 "httpServer.listen" src/server.js
```

---

## 📋 Checklist Finale

- [x] Code `src/server.js` corrigé
- [ ] `PORT=5000` commenté dans `.env` (optionnel mais recommandé)
- [x] Fichiers touchés (`touch index.js`, `touch .ovhconfig`)
- [ ] **Attendu 10-15 minutes** ⏰
- [ ] Vérifié que l'application tourne : `ps aux | grep node`
- [ ] Testé l'application : `curl http://fabrication.laplume-artisanale.tn/health`

---

## 💡 Si Ça Ne Fonctionne Toujours Pas Après 20 Minutes

### Vérifier la Configuration Multisite OVH

Dans le panneau OVH :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début)
3. **Node.js** : Activé (vert)
4. **PHP** : Désactivé (si possible)

### Contacter le Support OVH

Si après 20 minutes l'application ne démarre toujours pas :
- Contactez le support OVH
- Mentionnez que vous avez :
  - `.ovhconfig` avec Node.js 18
  - `index.js` qui importe `src/server.js`
  - `src/server.js` qui écoute sur `PORT` sans `HOST`
  - L'application ne démarre pas automatiquement

---

## ✅ Résumé

1. **Commenter `PORT=5000` dans `.env`** (optionnel mais recommandé)
2. **Attendre 10-15 minutes** ⏰
3. **Vérifier** : `ps aux | grep node`
4. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`

**Tout est prêt ! Il ne reste plus qu'à attendre et tester.**

