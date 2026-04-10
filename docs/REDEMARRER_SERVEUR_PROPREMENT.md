# 🔄 Redémarrer le Serveur Proprement

## Redémarrage Complet (Recommandé)

```bash
# Arrêter complètement le serveur
pm2 stop fouta-api

# Supprimer du gestionnaire PM2 (pour forcer le rechargement)
pm2 delete fouta-api

# Redémarrer avec le fichier mis à jour
cd /opt/fouta-erp/backend
pm2 start src/server.js --name fouta-api

# Ou si vous avez un écosystème PM2 configuré
pm2 restart ecosystem.config.js
```

---

## Vérifier les Logs

```bash
# Voir les logs de démarrage
pm2 logs fouta-api --lines 50

# Filtrer pour Swagger
pm2 logs fouta-api --lines 50 | grep -i swagger

# Vérifier les erreurs
pm2 logs fouta-api --lines 50 | grep -i "SyntaxError\|ERROR"
```

---

## Ce qui devrait apparaître

### ✅ Si tout fonctionne :
- `✅ Documentation Swagger disponible sur /api-docs`
- Pas d'erreur `SyntaxError`

### ⚠️ Si dépendances manquantes :
- `⚠️ Swagger non configuré : ERR_MODULE_NOT_FOUND` (non bloquant)

### ❌ Si erreur persiste :
- `SyntaxError: Missing initializer in const declaration` (problème à corriger)
