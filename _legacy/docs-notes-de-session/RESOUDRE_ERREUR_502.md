# 🔧 Résoudre l'Erreur 502 Bad Gateway

## Le Problème

**Erreur :** "Request failed with status code 502"

Cela signifie que le **frontend ne peut pas communiquer avec le backend**.

---

## 🔍 VÉRIFICATIONS À FAIRE

### 1. Vérifier que le Serveur Backend est en Ligne

```bash
# Vérifier le statut PM2
pm2 status

# Vérifier les logs du serveur
pm2 logs fouta-api --lines 30
```

**Rechercher :**
- ✅ Le serveur doit être "online"
- ✅ Message "Server running on port 5000" (ou le port configuré)
- ✅ Pas d'erreurs critiques

### 2. Vérifier que le Backend Répond

```bash
# Tester directement le backend
curl http://localhost:5000/api/health

# Ou depuis l'extérieur
curl https://fabrication.laplume-artisanale.tn/api/health
```

**Si ça ne répond pas :** Le backend n'est pas accessible.

### 3. Vérifier la Configuration Nginx (si utilisé)

```bash
# Vérifier la configuration Nginx
sudo nginx -t

# Vérifier les logs Nginx
sudo tail -n 50 /var/log/nginx/error.log
```

### 4. Vérifier la Connexion à la Base de Données

```bash
# Vérifier les logs pour voir si la connexion DB fonctionne
pm2 logs fouta-api --lines 50 | grep -i "postgres\|connecte\|error"
```

**Rechercher :**
- ✅ "✅ Connecté à PostgreSQL" (ou similaire)
- ❌ Pas d'erreur de connexion DB

---

## 🔧 SOLUTIONS

### Solution 1 : Redémarrer le Serveur Backend

```bash
# Redémarrer PM2
pm2 restart fouta-api

# Vérifier qu'il démarre correctement
pm2 logs fouta-api --lines 30
```

### Solution 2 : Vérifier le Port Backend

```bash
# Vérifier que le port 5000 est ouvert (ou le port configuré)
netstat -tlnp | grep 5000

# Ou
ss -tlnp | grep 5000
```

### Solution 3 : Vérifier les Variables d'Environnement

```bash
cd /opt/fouta-erp/backend
cat .env | grep -E "PORT|NODE_ENV"
```

Le `PORT` doit correspondre à celui utilisé par Nginx pour le proxy.

### Solution 4 : Vérifier la Configuration Nginx

Le fichier Nginx doit proxy les requêtes `/api/*` vers le backend :

```nginx
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📋 CHECKLIST RAPIDE

- [ ] PM2 montre le serveur comme "online" ?
- [ ] Le serveur répond sur `curl http://localhost:5000/api/health` ?
- [ ] Nginx est configuré pour proxy vers le backend ?
- [ ] Le port backend correspond à la configuration ?
- [ ] Aucune erreur dans `pm2 logs fouta-api` ?

---

## 🎯 DIAGNOSTIC RAPIDE

Exécutez cette commande pour un diagnostic rapide :

```bash
# Vérifier PM2
pm2 status

# Vérifier que le backend répond
curl -v http://localhost:5000/api/health 2>&1 | head -20

# Vérifier Nginx (si utilisé)
sudo nginx -t && echo "✅ Nginx OK" || echo "❌ Nginx erreur"
```

---

## 💡 CAUSES COURANTES

1. **Backend arrêté** : PM2 a crashé ou le serveur n'est pas démarré
2. **Port incorrect** : Le backend écoute sur un port différent
3. **Nginx mal configuré** : Le proxy ne pointe pas vers le bon port
4. **Erreur backend** : Le serveur crash au démarrage (voir logs)
5. **Firewall** : Le port backend est bloqué
