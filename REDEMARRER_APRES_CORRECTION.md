# 🔄 Redémarrer l'Application Après Correction

## ✅ Syntaxe Corrigée

La syntaxe est maintenant correcte :
- ✅ `node --check src/server.js` → (rien, pas d'erreur)
- ✅ Ligne 12 corrigée : `nano src/server.jsimport` → `import`
- ✅ Ligne `trust proxy` présente : `app.set('trust proxy', true);`

---

## 🔄 Redémarrer l'Application

### Sur le VPS

```bash
# Redémarrer l'application avec PM2
pm2 restart fouta-api

# Attendre quelques secondes pour que l'application démarre
sleep 5

# Vérifier le statut
pm2 status

# Doit afficher : fouta-api (online)
```

---

## 🧪 Vérifier les Logs

### Vérifier les Logs d'Erreur

```bash
# Voir les dernières erreurs
pm2 logs fouta-api --err --lines 10

# Ne doit plus afficher :
# SyntaxError: Unexpected identifier
# ValidationError: The 'X-Forwarded-For' header...
```

### Vérifier les Logs de Sortie

```bash
# Voir les logs de sortie
pm2 logs fouta-api --out --lines 10

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

### Voir Tous les Logs

```bash
# Voir tous les logs (dernières 20 lignes)
pm2 logs fouta-api --lines 20

# Ne doit plus afficher d'erreurs
```

---

## 🧪 Tester l'Application

### Tester l'Endpoint Health

```bash
# Tester localement
curl http://localhost:5000/health

# Doit retourner : {"status":"OK","timestamp":"..."}

# Tester via HTTPS
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 📋 Checklist

- [ ] Syntaxe vérifiée : `node --check src/server.js` → (rien)
- [ ] Application redémarrée : `pm2 restart fouta-api`
- [ ] Statut vérifié : `pm2 status` → fouta-api (online)
- [ ] Logs d'erreur vérifiés : Plus d'erreur `SyntaxError` ni `ValidationError`
- [ ] Logs de sortie vérifiés : `🚀 Serveur démarré sur le port 5000`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Redémarrer** : `pm2 restart fouta-api`
2. **Vérifier le statut** : `pm2 status`
3. **Vérifier les logs** : `pm2 logs fouta-api --err --lines 10`
4. **Tester** : `curl https://fabrication.laplume-artisanale.tn/health`

**Après le redémarrage, toutes les erreurs devraient disparaître !**

