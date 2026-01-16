# 🔄 Redémarrer Complètement l'Application

## ✅ Fichier Vérifié

Le fichier `server.js` est maintenant correct :
- ✅ Pas de "nano" dans le fichier
- ✅ Ligne `trust proxy` présente : ligne 35
- ✅ Toutes les lignes import sont correctes
- ✅ Syntaxe semble correcte

---

## 🧪 Vérifier la Syntaxe

### Sur le VPS

```bash
# Vérifier la syntaxe
node --check src/server.js

# Doit afficher : (rien) si la syntaxe est correcte
```

---

## 🔄 Redémarrer Complètement l'Application

### Arrêter et Supprimer

```bash
# Arrêter complètement
pm2 stop fouta-api
pm2 delete fouta-api

# Vérifier qu'il n'y a plus de processus
pm2 status

# Doit afficher : (vide)
```

### Redémarrer

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Redémarrer depuis le début
pm2 start index.js --name fouta-api

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

### Sur le VPS

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
- [ ] Application arrêtée : `pm2 stop fouta-api && pm2 delete fouta-api`
- [ ] Application redémarrée : `pm2 start index.js --name fouta-api`
- [ ] Statut vérifié : `pm2 status` → fouta-api (online)
- [ ] Logs d'erreur vérifiés : Plus d'erreur `SyntaxError` ni `ValidationError`
- [ ] Logs de sortie vérifiés : `🚀 Serveur démarré sur le port 5000`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Vérifier la syntaxe** : `node --check src/server.js`
2. **Arrêter complètement** : `pm2 stop fouta-api && pm2 delete fouta-api`
3. **Redémarrer** : `pm2 start index.js --name fouta-api`
4. **Vérifier les logs** : `pm2 logs fouta-api --lines 20`
5. **Tester** : `curl https://fabrication.laplume-artisanale.tn/health`

**Après le redémarrage complet, toutes les erreurs devraient disparaître !**

