# 🔧 Résoudre ERR_ERL_PERMISSIVE_TRUST_PROXY

## ❌ Erreur Détectée

```
ERR_ERL_PERMISSIVE_TRUST_PROXY
The Express 'trust proxy' setting is true
```

**Problème** : Express-rate-limit détecte toujours que `trust proxy` est trop permissif, même si nous avons changé pour `1`.

---

## ✅ Solution : Vérifier et Redémarrer Complètement

### Étape 1 : Vérifier que le Fichier est Bien Modifié

```bash
# Vérifier la ligne exacte
grep -n "trust proxy" /opt/fouta-erp/backend/src/server.js

# Doit afficher :
# 35:app.set('trust proxy', 1);

# Voir le contexte autour de la ligne
sed -n '33,37p' /opt/fouta-erp/backend/src/server.js

# Doit afficher :
# });
#
# // Trust proxy (nécessaire derrière Nginx)
# // Utiliser 1 au lieu de true pour la sécurité avec express-rate-limit
# app.set('trust proxy', 1);
```

### Étape 2 : Vérifier la Syntaxe

```bash
# Vérifier la syntaxe
node --check src/server.js

# Doit afficher : (rien)
```

### Étape 3 : Redémarrer Complètement

```bash
# Arrêter complètement
pm2 stop fouta-api
pm2 delete fouta-api

# Vérifier qu'il n'y a plus de processus
pm2 status

# Doit afficher : (vide)

# Redémarrer depuis le début
cd /opt/fouta-erp/backend
pm2 start index.js --name fouta-api

# Vérifier le statut
pm2 status

# Doit afficher : fouta-api (online)
```

---

## 🔍 Vérifier les Logs Après Redémarrage

### Vérifier les Logs d'Erreur

```bash
# Attendre quelques secondes
sleep 5

# Voir les logs d'erreur
pm2 logs fouta-api --err --lines 10

# Ne doit plus afficher :
# ERR_ERL_PERMISSIVE_TRUST_PROXY
```

### Vérifier les Logs de Sortie

```bash
# Voir les logs de sortie
pm2 logs fouta-api --out --lines 10

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

---

## 🧪 Tester l'Application

### Tester Localement

```bash
# Tester que l'application répond
curl http://localhost:5000/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

### Tester via HTTPS

```bash
# Tester via HTTPS
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## ⚠️ Si l'Erreur Persiste

### Vérifier que le Fichier est Bien Sauvegardé

```bash
# Voir tout le fichier autour de trust proxy
cat -n src/server.js | grep -A 2 -B 2 "trust proxy"

# Doit afficher :
# 34  // Trust proxy (nécessaire derrière Nginx)
# 35  // Utiliser 1 au lieu de true pour la sécurité avec express-rate-limit
# 36  app.set('trust proxy', 1);
```

### Vérifier qu'il n'y a Pas d'Autre Ligne

```bash
# Chercher toutes les occurrences de "trust proxy"
grep -n "trust proxy" src/server.js

# Ne doit afficher qu'UNE ligne : app.set('trust proxy', 1);
```

### Vérifier qu'il n'y a Pas de Cache

```bash
# Vérifier qu'il n'y a pas de cache Node.js
ls -la node_modules/.cache 2>/dev/null || echo "Pas de cache"

# Redémarrer complètement PM2
pm2 kill
pm2 resurrect
```

---

## 📋 Checklist

- [ ] Fichier vérifié : `grep "trust proxy" src/server.js` → `app.set('trust proxy', 1);`
- [ ] Syntaxe vérifiée : `node --check src/server.js` → (rien)
- [ ] Application arrêtée : `pm2 stop fouta-api && pm2 delete fouta-api`
- [ ] Application redémarrée : `pm2 start index.js --name fouta-api`
- [ ] Logs vérifiés : Plus d'erreur `ERR_ERL_PERMISSIVE_TRUST_PROXY`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Vérifier le fichier** : `grep "trust proxy" src/server.js` → `app.set('trust proxy', 1);`
2. **Vérifier la syntaxe** : `node --check src/server.js`
3. **Arrêter complètement** : `pm2 stop fouta-api && pm2 delete fouta-api`
4. **Redémarrer** : `pm2 start index.js --name fouta-api`
5. **Vérifier les logs** : `pm2 logs fouta-api --err --lines 10`

**Après un redémarrage complet, l'erreur devrait disparaître !**

