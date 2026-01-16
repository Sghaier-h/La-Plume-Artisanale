# 🚀 Configurer le Backend Local - Solution Rapide

## ✅ Pourquoi Utiliser le Backend Local ?

Le backend sur le VPS retourne une erreur 500. Pour continuer rapidement, utilisons le backend local avec le tunnel SSH.

---

## 📋 Étapes à Suivre

### 1️⃣ Créer le Tunnel SSH

**Ouvrir un terminal PowerShell et exécuter (laisser ouvert) :**

```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Entrer votre mot de passe SSH quand demandé.**

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez.

### 2️⃣ Configurer le Frontend

**Créer/modifier le fichier `.env.local` dans le dossier `frontend/` :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
notepad .env.local
```

**Ajouter :**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Sauvegarder.**

### 3️⃣ Démarrer le Backend Local

**Dans un nouveau terminal PowerShell :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

**Attendre de voir :**
```
✅ Connecté à PostgreSQL
🚀 Serveur démarré sur le port 5000
```

### 4️⃣ Redémarrer le Frontend

**Dans le terminal où le frontend tourne :**

1. Arrêter : Appuyer sur `Ctrl + C`
2. Redémarrer :
   ```powershell
   npm start
   ```

### 5️⃣ Tester la Connexion

1. Ouvrir le navigateur : `http://localhost:3000`
2. Se connecter :
   - Email : `admin@system.local`
   - Mot de passe : `Admin123!`

---

## ✅ Checklist

- [ ] Tunnel SSH créé et actif (Terminal 1)
- [ ] Fichier `.env.local` créé dans `frontend/` avec `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Backend local démarré (Terminal 2) - affiche "Serveur démarré sur le port 5000"
- [ ] Frontend redémarré (Terminal 3) - utilise la nouvelle configuration
- [ ] Test de connexion effectué

---

## 🆘 Si Ça Ne Fonctionne Pas

### Erreur : "Cannot connect to database"

**Vérifier :**
- Le tunnel SSH est actif (Terminal 1 toujours ouvert)
- Le fichier `.env` backend utilise `DB_HOST=localhost` et `DB_PORT=5433`

### Erreur : "Port 5000 already in use"

**Arrêter l'autre processus qui utilise le port 5000 :**

```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Arrêter le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### Erreur : "Frontend still uses VPS API"

**Vérifier :**
- Le fichier `.env.local` existe dans `frontend/`
- Le frontend a été redémarré après la création du fichier
- Pas de cache : Supprimer `node_modules/.cache` si nécessaire

---

**🎯 Suivez ces étapes et vous devriez pouvoir vous connecter !**
