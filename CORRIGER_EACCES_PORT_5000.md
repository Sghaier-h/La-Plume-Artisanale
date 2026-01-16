# 🔧 Corriger EACCES: Permission Denied Port 5000

## ❌ Erreur

```
Error: listen EACCES: permission denied 127.0.0.1:5000
```

L'application essaie d'écouter sur `127.0.0.1:5000` mais n'a pas les permissions.

---

## 🔍 Cause

Sur hébergement partagé OVH :
- ❌ Vous ne pouvez pas écouter sur `127.0.0.1` (localhost)
- ❌ Vous ne pouvez pas choisir le port librement
- ✅ OVH fournit automatiquement un port via une variable d'environnement
- ✅ Vous devez écouter sans adresse IP spécifique

---

## 🔧 Solution : Modifier le Code du Serveur

Le code actuel dans `src/server.js` est presque correct, mais il faut s'assurer qu'il n'essaie pas d'écouter sur une adresse IP spécifique.

### Vérifier le Code Actuel

```bash
cd ~/fouta-erp/backend

# Voir la partie listen
grep -A 5 "httpServer.listen\|app.listen" src/server.js
```

Le code devrait être :
```javascript
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
```

**SANS adresse IP** (pas de `127.0.0.1`, `localhost`, ou `HOST`).

### Vérifier le Fichier .env

```bash
# Vérifier s'il y a une variable HOST
grep -i "HOST" .env

# Si HOST=127.0.0.1 est présent, commentez-le ou retirez-le
```

---

## ✅ Correction

### Option 1 : Modifier .env (Recommandé)

Si le `.env` contient `HOST=127.0.0.1`, commentez-le :

```bash
cd ~/fouta-erp/backend

# Éditer .env et commenter HOST si présent
# Changez : HOST=127.0.0.1
# En : #HOST=127.0.0.1
```

### Option 2 : Modifier src/server.js (Si Nécessaire)

Si le code essaie d'écouter sur une adresse IP spécifique, modifiez-le :

```bash
cd ~/fouta-erp/backend

# Voir le code actuel
cat src/server.js | grep -A 3 "listen"
```

Le code doit être :
```javascript
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
```

**SANS** `HOST` ou adresse IP.

---

## 🧪 Test Après Correction

### 1. Vérifier le .env

```bash
# Vérifier qu'il n'y a pas de HOST=127.0.0.1
grep -i "HOST" .env
```

### 2. Tester le Démarrage

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Tester (peut toujours échouer sur le port, mais on verra d'autres erreurs)
node index.js
```

### 3. Attendre que OVH Démarre l'Application

Après correction :
1. **Attendez 10-15 minutes** pour qu'OVH redémarre l'application
2. **Vérifiez** : `ps aux | grep node`
3. **Testez** : `curl http://fabrication.laplume-artisanale.tn/health`

---

## 📋 Checklist

- [ ] Vérifié le fichier `.env` (pas de `HOST=127.0.0.1`)
- [ ] Vérifié le code `src/server.js` (pas d'adresse IP dans `listen()`)
- [ ] Commenté ou retiré `HOST=127.0.0.1` du `.env` si présent
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne
- [ ] Testé l'application

---

## 💡 Note Importante

**Sur hébergement partagé OVH** :
- L'application ne doit **PAS** écouter sur `127.0.0.1` ou `localhost`
- L'application ne doit **PAS** spécifier d'adresse IP dans `listen()`
- OVH fournit automatiquement le port via `process.env.PORT`
- OVH gère le reverse proxy automatiquement

**L'erreur EACCES est normale si vous essayez d'écouter sur 127.0.0.1**. OVH doit gérer cela automatiquement via `.ovhconfig` et `index.js`.

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

### Contacter le Support OVH

Si après correction l'application ne démarre toujours pas automatiquement :

1. Panneau OVH → **Support** → **Créer un ticket**
2. Mentionnez que :
   - Les fichiers `.ovhconfig` et `index.js` sont présents
   - L'application ne peut pas écouter sur le port (EACCES)
   - Demandez comment OVH gère le port pour Node.js

---

## ✅ Résumé

1. **Vérifiez le `.env`** : Pas de `HOST=127.0.0.1`
2. **Vérifiez le code** : Pas d'adresse IP dans `listen()`
3. **Attendez 10-15 minutes** pour qu'OVH redémarre l'application
4. **Vérifiez** : `ps aux | grep node`

**L'erreur EACCES est attendue si vous testez manuellement. OVH doit gérer cela automatiquement !**

