# 🔍 Vérifier les Logs PM2

## ❌ Problème : Application en Statut "errored"

L'application démarre mais passe en erreur. Il faut voir les logs pour identifier le problème.

---

## 🔍 Commandes de Diagnostic

```bash
# 1. Voir les logs d'erreur
pm2 logs fouta-api --lines 50

# 2. Voir uniquement les erreurs
pm2 logs fouta-api --err --lines 50

# 3. Voir les logs en temps réel
pm2 logs fouta-api

# 4. Vérifier le fichier .env
cat .env

# 5. Tester manuellement le serveur
node src/server.js
```

---

## 🔧 Problèmes Courants

### Problème 1 : Erreur de Connexion à la Base de Données

**Symptôme** : Erreur `ECONNREFUSED` ou `password authentication failed`

**Solution** :
```bash
# Vérifier les variables d'environnement
cat .env | grep DB_

# Tester la connexion manuellement
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT 1;"
unset PGPASSWORD
```

---

### Problème 2 : Module Manquant

**Symptôme** : `Cannot find module 'xxx'`

**Solution** :
```bash
cd ~/fouta-erp/backend
npm install --production
```

---

### Problème 3 : Port Toujours Bloqué

**Symptôme** : `EACCES: permission denied`

**Solution** :
```bash
# Vérifier le port dans .env
grep PORT .env

# Si c'est 5000, changer en 30000
grep -v "^PORT=" .env > .env.tmp
echo "PORT=30000" >> .env.tmp
mv .env.tmp .env

# Redémarrer
pm2 restart fouta-api --update-env
```

---

### Problème 4 : Fichier Route Manquant

**Symptôme** : `Cannot find module './routes/xxx.routes.js'`

**Solution** :
```bash
# Vérifier que les fichiers routes existent
ls -la src/routes/

# Si manquants, mettre à jour le code
cd ~/fouta-erp
git pull
cd backend
pm2 restart fouta-api
```

---

## 🚀 Après Diagnostic

Une fois l'erreur identifiée dans les logs, corrigez-la et redémarrez :

```bash
pm2 restart fouta-api
pm2 logs fouta-api --lines 20
```

---

## ✅ Résultat Attendu

Après correction, vous devriez voir :
- `pm2 status` : `status: online`
- Logs : `🚀 Serveur démarré sur 127.0.0.1:30000`
- `curl http://localhost:30000/health` : `{"status":"OK"}`

