# ✅ Vérifier le Déploiement Complet

## 📋 Informations de Configuration

### Base de Données PostgreSQL OVH
- **Host** : `sh131616-002.eu.clouddb.ovh.net`
- **Port** : `35392`
- **Version** : PostgreSQL 17
- **Base de données** : `ERP_La_Plume`
- **Utilisateur** : `Aviateur`
- **Mot de passe** : `Allbyfouta007`

### Serveur Application
- **IP** : `145.239.37.162`
- **Domaine** : `fabrication.laplume-artisanale.tn`
- **Port** : `5000` (localhost uniquement)
- **Node.js** : v18.20.8
- **npm** : 10.8.2

---

## 🔍 Vérifications à Effectuer

### 1. Vérifier que l'Application Tourne

```bash
# Sur le serveur SSH
pm2 status
pm2 logs fouta-api --lines 30
```

**Résultat attendu** :
- Status : `online`
- Logs : `🚀 Serveur démarré sur 127.0.0.1:5000`

---

### 2. Tester l'API

```bash
# Test health check
curl http://localhost:5000/health

# Résultat attendu :
# {"status":"OK","timestamp":"2025-01-XX..."}
```

---

### 3. Vérifier la Connexion à la Base de Données

```bash
# Se connecter à PostgreSQL
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume

# Dans psql, vérifier les tables
\dt

# Vous devriez voir les tables :
# - users
# - roles
# - production_orders
# - etc.

# Quitter
\q
unset PGPASSWORD
```

---

### 4. Vérifier le Fichier .env

```bash
cd ~/fouta-erp/backend
cat .env
```

**Vérifier que contient** :
```
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn
JWT_SECRET=...
```

---

### 5. Tester une Requête API Complète

```bash
# Test d'authentification (si endpoint existe)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Ou test simple
curl http://localhost:5000/api/health
```

---

## ✅ Checklist de Déploiement

- [x] Base de données PostgreSQL créée
- [x] Base de données initialisée (tables créées)
- [x] Node.js 18 installé
- [x] npm installé
- [x] Dépendances installées
- [x] PM2 installé
- [x] Application démarrée
- [ ] Application accessible (status online)
- [ ] API répond aux requêtes
- [ ] Connexion DB fonctionnelle

---

## 🚨 Problèmes Courants

### Problème 1 : Application en erreur

```bash
pm2 logs fouta-api
# Vérifier les erreurs dans les logs
```

**Solutions** :
- Vérifier le fichier `.env`
- Vérifier la connexion DB
- Vérifier les permissions

---

### Problème 2 : Port bloqué

Si le port 5000 est toujours bloqué :

```bash
cd ~/fouta-erp/backend
nano .env
# Changer PORT=5000 en PORT=30000
pm2 restart fouta-api
```

---

### Problème 3 : Connexion DB échoue

```bash
# Tester la connexion manuellement
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT version();"
unset PGPASSWORD
```

**Si erreur** :
- Vérifier que l'IP `145.239.37.162` est autorisée dans OVH
- Vérifier les identifiants
- Vérifier que la base existe

---

## 🎯 Prochaines Étapes

Une fois tout vérifié :

1. **Configurer le Reverse Proxy** (via panneau OVH)
   - Point `https://fabrication.laplume-artisanale.tn` vers `http://localhost:5000`

2. **Configurer SSL/HTTPS** (via panneau OVH)
   - Activer Let's Encrypt ou certificat OVH

3. **Configurer le Frontend**
   - Build React
   - Déployer sur le serveur
   - Configurer pour pointer vers l'API

---

## 📞 Support

Si problème persiste :
- Vérifier les logs : `pm2 logs fouta-api`
- Vérifier la connexion DB : `psql -h ...`
- Vérifier les variables d'environnement : `cat backend/.env`

---

## 🎉 Succès !

Si toutes les vérifications passent, votre API est déployée et fonctionnelle ! ✅

