# 🔍 Vérifier les Logs de Sortie

## ✅ Application Redémarrée

L'application est maintenant **online** :
- ✅ PM2 status : `fouta-api (online)`
- ✅ PID : 13929
- ✅ Uptime : 7s

---

## 🧪 Vérifier les Logs de Sortie

### Voir les Logs de Sortie (Important)

```bash
# Voir les logs de sortie (pas les erreurs)
pm2 logs fouta-api --out --lines 20

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

### Voir Tous les Logs

```bash
# Voir tous les logs (dernières 20 lignes)
pm2 logs fouta-api --lines 20

# Les erreurs affichées peuvent être des erreurs anciennes dans le fichier de log
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

## ⚠️ Note sur les Erreurs dans les Logs

Les erreurs affichées dans `pm2 logs fouta-api --err` peuvent être des **erreurs anciennes** qui sont restées dans le fichier de log.

**Important** : Si l'application est **online** et répond aux requêtes, elle fonctionne correctement.

### Vérifier les Erreurs Récentes

```bash
# Voir les logs en temps réel
pm2 logs fouta-api --lines 0

# Faire une requête pour générer des logs
curl http://localhost:5000/health

# Voir si de nouvelles erreurs apparaissent
```

---

## 🔍 Vérifier que Trust Proxy Fonctionne

### Tester avec une Requête

```bash
# Faire une requête pour voir si trust proxy fonctionne
curl -H "X-Forwarded-For: 192.168.1.1" http://localhost:5000/health

# Si pas d'erreur dans les logs, trust proxy fonctionne
```

---

## 📋 Checklist

- [ ] Application online : `pm2 status` → fouta-api (online)
- [ ] Logs de sortie vérifiés : `pm2 logs fouta-api --out --lines 20`
- [ ] Application répond : `curl http://localhost:5000/health` → OK
- [ ] HTTPS fonctionne : `curl https://fabrication.laplume-artisanale.tn/health` → OK
- [ ] Pas de nouvelles erreurs : `pm2 logs fouta-api --lines 0` (temps réel)

---

## ✅ Résumé

1. **Vérifier les logs de sortie** : `pm2 logs fouta-api --out --lines 20`
2. **Tester l'application** : `curl http://localhost:5000/health`
3. **Tester HTTPS** : `curl https://fabrication.laplume-artisanale.tn/health`
4. **Vérifier les erreurs en temps réel** : `pm2 logs fouta-api --lines 0`

**Si l'application est online et répond, elle fonctionne correctement !**

