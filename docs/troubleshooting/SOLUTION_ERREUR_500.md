# 🔧 Solution : Erreur 500 - Backend VPS

## ❌ Problème

L'API retourne une erreur 500 (Erreur interne du serveur). Cela signifie que :
- ✅ L'API est accessible
- ✅ La route fonctionne
- ❌ Mais il y a une erreur côté serveur (probablement connexion à la base de données)

---

## 🔍 Diagnostic

**Le backend sur le VPS ne peut probablement pas :**
- Se connecter à la base de données PostgreSQL
- Ou utilise encore l'ancien code avec Prisma qui ne fonctionne pas

---

## ✅ Solution Immédiate : Utiliser le Backend Local

**Pour continuer rapidement, utilisons le backend local avec le tunnel SSH.**

### Étape 1 : Créer le Tunnel SSH

**Dans un terminal PowerShell (laisser ouvert) :**

```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez.

### Étape 2 : Configurer le Frontend pour Utiliser l'API Locale

**Créer un fichier `.env` dans le dossier `frontend/` :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
notepad .env
```

**Ajouter ce contenu :**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Sauvegarder le fichier.**

### Étape 3 : Démarrer le Backend Local

**Dans un nouveau terminal PowerShell :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

**Vous devriez voir :**
```
✅ Connecté à PostgreSQL
🚀 Serveur démarré sur le port 5000
```

### Étape 4 : Redémarrer le Frontend

**Dans le terminal où le frontend tourne :**
- Arrêter le frontend : `Ctrl + C`
- Redémarrer :
  ```powershell
  npm start
  ```

**Le frontend va maintenant utiliser `http://localhost:5000/api` au lieu du VPS.**

### Étape 5 : Tester la Connexion

1. Ouvrir le navigateur : `http://localhost:3000`
2. Se connecter avec :
   - Email : `admin@system.local`
   - Mot de passe : `Admin123!`

---

## 📋 Workflow Complet

**Vous avez besoin de 3 terminaux :**

**Terminal 1 : Tunnel SSH (laisser ouvert)**
```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Terminal 2 : Backend Local**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

**Terminal 3 : Frontend**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

---

## ✅ Alternative : Corriger le Backend sur le VPS

**Si vous préférez utiliser l'API VPS, il faut :**

1. **Déployer le code mis à jour sur le VPS** (avec les corrections pour utiliser `pg`)
2. **Vérifier que le backend peut se connecter à la base de données**
3. **Redémarrer le backend :**
   ```bash
   pm2 restart fouta-api
   ```

**Mais pour le développement, je recommande d'utiliser le backend local avec le tunnel SSH.**

---

## 🎯 Solution Recommandée

**Pour continuer rapidement, utilisez le backend local avec le tunnel SSH :**

1. ✅ Créer le tunnel SSH
2. ✅ Configurer le frontend pour utiliser localhost:5000
3. ✅ Démarrer le backend local
4. ✅ Tester la connexion

---

**🚀 Vous êtes prêt ! Suivez les étapes ci-dessus pour configurer le backend local.**
