# 🚀 Démarrer l'Application ERP - Guide Complet

## ✅ Application Complète et Prête

Tous les modules du cahier des charges ont été implémentés automatiquement.

---

## 📋 Prérequis

- ✅ Node.js 18+ installé
- ✅ PostgreSQL accessible (via tunnel SSH ou directement)
- ✅ Dépendances installées (`npm install` dans backend et frontend)

---

## 🚀 Démarrage en 3 Étapes

### Étape 1 : Tunnel SSH (si nécessaire)

**Ouvrir un terminal PowerShell et exécuter (laisser ouvert) :**

```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Entrer votre mot de passe SSH quand demandé.**

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez.

---

### Étape 2 : Démarrer le Backend

**Ouvrir un nouveau terminal PowerShell :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

**Vous devriez voir :**
```
✅ Connecté à PostgreSQL
🚀 Serveur démarré sur le port 5000
📡 Socket.IO actif
```

**Si erreur de connexion DB :**
- Vérifier que le tunnel SSH est actif (Étape 1)
- Vérifier que `.env` utilise `DB_HOST=localhost` et `DB_PORT=5433`

---

### Étape 3 : Démarrer le Frontend

**Ouvrir un nouveau terminal PowerShell :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

**Le navigateur s'ouvrira automatiquement sur :**
- `http://localhost:3000`

**Si le navigateur ne s'ouvre pas :**
- Ouvrir manuellement : `http://localhost:3000`

---

## 🔐 Connexion

1. **Page de connexion** : `http://localhost:3000/login`

2. **Identifiants :**
   - Email : `admin@system.local`
   - Mot de passe : `Admin123!`

3. **Après connexion :**
   - Redirection automatique vers `/dashboard`
   - Menu latéral avec toutes les pages disponibles

---

## 📱 Pages Disponibles

### Menu de Navigation (Latéral)

- **📊 Dashboard** - KPIs, graphiques, statistiques
- **📦 Articles** - Gestion catalogue articles
- **👥 Clients** - Gestion clients
- **🛒 Commandes** - Gestion commandes
- **⚙️ Machines** - Gestion machines
- **📋 Ordres de Fabrication** - Gestion OF
- **🤝 Sous-traitants** - Gestion sous-traitants

### Autres Pages

- **🖥️ Gestion** (`/gestion`) - Application FoutaManagement complète
- **👷 Tisseur** (`/tisseur`) - Dashboard tisseur
- **📦 Magasinier MP** (`/magasinier-mp`) - Dashboard magasinier

---

## ✅ Vérification

### Backend Fonctionne

**Tester l'API :**
```powershell
curl.exe http://localhost:5000/health
```

**Résultat attendu :**
```json
{"status":"OK","timestamp":"..."}
```

### Frontend Fonctionne

**Vérifier dans le navigateur :**
- ✅ Page de connexion s'affiche
- ✅ Connexion réussie
- ✅ Menu latéral visible
- ✅ Dashboard s'affiche

---

## 🆘 Problèmes Courants

### Erreur : "Cannot connect to database"

**Solution :**
1. Vérifier que le tunnel SSH est actif (Terminal 1)
2. Vérifier `.env` backend : `DB_HOST=localhost` et `DB_PORT=5433`
3. Redémarrer le backend

### Erreur : "Port 5000 already in use"

**Solution :**
```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Arrêter (remplacer PID)
taskkill /PID <PID> /F
```

### Erreur : "Frontend ne se connecte pas à l'API"

**Solution :**
1. Vérifier que le backend est démarré (Terminal 2)
2. Vérifier `.env.local` frontend : `REACT_APP_API_URL=http://localhost:5000/api`
3. Redémarrer le frontend

### Erreur : "Module not found"

**Solution :**
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 📊 Workflow Complet

### Développement Local

**3 Terminaux ouverts :**

**Terminal 1 : Tunnel SSH**
```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Terminal 2 : Backend**
```powershell
cd backend
npm run dev
```

**Terminal 3 : Frontend**
```powershell
cd frontend
npm start
```

---

## 🎯 Utilisation

### Créer un Article

1. Cliquer sur **Articles** dans le menu
2. Cliquer sur **+ Nouvel Article**
3. Remplir le formulaire
4. Cliquer sur **Créer**

### Créer un Client

1. Cliquer sur **Clients** dans le menu
2. Cliquer sur **+ Nouveau Client**
3. Remplir le formulaire
4. Cliquer sur **Créer**

### Créer une Commande

1. Cliquer sur **Commandes** dans le menu
2. Cliquer sur **+ Nouvelle Commande**
3. Sélectionner un client
4. Ajouter des lignes (articles + quantités)
5. Cliquer sur **Créer**

### Créer un OF

1. Cliquer sur **Ordres de Fabrication** dans le menu
2. Cliquer sur **+ Nouvel OF**
3. Sélectionner un article
4. Entrer la quantité
5. Cliquer sur **Créer**

---

## ✅ Checklist de Démarrage

- [ ] Tunnel SSH créé et actif (Terminal 1)
- [ ] Backend démarré (Terminal 2) - Port 5000
- [ ] Frontend démarré (Terminal 3) - Port 3000
- [ ] Navigateur ouvert sur `http://localhost:3000`
- [ ] Connexion réussie avec `admin@system.local`
- [ ] Menu latéral visible
- [ ] Dashboard s'affiche correctement

---

## 🎉 Application Prête !

**Tous les modules sont fonctionnels et prêts à être utilisés.**

**Vous pouvez maintenant :**
- ✅ Gérer les articles
- ✅ Gérer les clients
- ✅ Créer des commandes
- ✅ Gérer les machines
- ✅ Créer des OF
- ✅ Gérer les sous-traitants
- ✅ Voir le dashboard avec KPIs

---

**🚀 Bon développement !**
