# 🔗 Connexion à la Base de Données - Explication

## ✅ Comment Ça Fonctionne

### Architecture Complète

```
Internet → Port 80 → Reverse Proxy OVH → Application Node.js → Base de Données PostgreSQL
```

1. **Internet** : Les utilisateurs accèdent via `http://fabrication.laplume-artisanale.tn`
2. **Reverse Proxy OVH** : Route les requêtes vers l'application Node.js
3. **Application Node.js** : Traite les requêtes et se connecte à la base de données
4. **Base de Données PostgreSQL** : Stocke les données

---

## 🔗 L'Application Node.js SE CONNECTE à la Base de Données

### Configuration Actuelle

Dans `.env`, vous avez déjà :
```env
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

### Code de Connexion

Dans `src/utils/db.js`, l'application se connecte automatiquement :
```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

**L'application SE CONNECTE automatiquement à la base de données au démarrage !**

---

## ❌ Le Problème Actuel

### Pourquoi "Connexion Refusée" ?

```
curl http://fabrication.laplume-artisanale.tn/health
curl: (7) Failed to connect to fabrication.laplume-artisanale.tn port 80: Connexion refusée
```

**Le problème n'est PAS la connexion à la base de données**, mais que **l'application Node.js ne démarre pas du tout**.

### Séquence des Événements

1. **OVH devrait démarrer l'application Node.js** ❌ (ne démarre pas)
2. **L'application devrait se connecter à la base de données** ❌ (ne peut pas, car ne démarre pas)
3. **L'application devrait répondre aux requêtes HTTP** ❌ (ne peut pas, car ne démarre pas)

**Tout commence par le démarrage de l'application Node.js !**

---

## ✅ Vérifier la Connexion à la Base de Données

### Une Fois l'Application Démarrée

Quand l'application Node.js démarre, elle :
1. **Charge le `.env`** avec les informations de connexion DB
2. **Se connecte à PostgreSQL** automatiquement
3. **Écoute sur le port** fourni par OVH
4. **Répond aux requêtes HTTP**

### Tester la Connexion DB (Une Fois l'App Démarrée)

```bash
# Tester l'endpoint /health (qui ne nécessite pas de DB)
curl http://fabrication.laplume-artisanale.tn/health

# Tester un endpoint qui utilise la DB (ex: /api/auth/login)
curl http://fabrication.laplume-artisanale.tn/api/auth/login
```

---

## 🔍 Vérifier que l'IP est Autorisée

### IP du Serveur Web

- **IP** : `145.239.37.162`
- **Base de données** : `sh131616-002.eu.clouddb.ovh.net`

### Vérifier dans OVH

1. **Web Cloud** → **Databases** → **sh131616-002**
2. **Onglet** : **IPs autorisées**
3. **Vérifiez** que `145.239.37.162` est présent

**Si l'IP n'est pas autorisée, l'application ne pourra pas se connecter à la base de données même si elle démarre.**

---

## 📋 Checklist

- [x] Configuration DB dans `.env` (déjà fait)
- [x] IP autorisée dans OVH (145.239.37.162)
- [ ] **Application Node.js démarre** (le problème actuel)
- [ ] Application se connecte à la DB (automatique une fois démarrée)
- [ ] Application répond aux requêtes HTTP

---

## 💡 Résumé

1. **L'application Node.js SE CONNECTE à la base de données** (c'est déjà configuré)
2. **Le problème** : L'application Node.js ne démarre pas
3. **Une fois démarrée** : Elle se connectera automatiquement à la base de données
4. **L'IP est autorisée** : `145.239.37.162` dans les IPs autorisées de la DB

**La connexion à la base de données fonctionnera automatiquement une fois que l'application Node.js démarrera !**

---

## ✅ Actions à Faire

1. **Vérifier que l'application démarre** : `ps aux | grep node`
2. **Vérifier la configuration Multisite OVH** (dossier racine, Node.js activé)
3. **Forcer un redémarrage** : `touch index.js`
4. **Attendre 15-20 minutes**
5. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`

**Une fois l'application démarrée, elle se connectera automatiquement à la base de données !**

