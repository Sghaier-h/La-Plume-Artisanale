# 🔄 Redémarrage Complet PM2 (Forcer Rechargement)

## Le Problème

Même si le code est commenté, PM2 peut garder l'ancienne version en cache. Un simple `restart` ne suffit pas toujours.

## Solution : Supprimer et Recréer

```bash
# Arrêter et supprimer complètement
pm2 delete fouta-api

# Attendre quelques secondes
sleep 2

# Redémarrer proprement depuis le répertoire backend
cd /opt/fouta-erp/backend
pm2 start src/server.js --name fouta-api

# Vérifier les logs immédiatement
pm2 logs fouta-api --lines 50
```

---

## Vérification

Après le redémarrage, vérifier :

```bash
# Chercher les erreurs de syntaxe
pm2 logs fouta-api --lines 30 | grep -i "SyntaxError\|ERROR"

# Si aucune erreur n'apparaît → Succès !
```

---

## Alternative : Redémarrer avec Flush

```bash
# Vider les logs (optionnel)
pm2 flush

# Supprimer et redémarrer
pm2 delete fouta-api
cd /opt/fouta-erp/backend
pm2 start src/server.js --name fouta-api
```
