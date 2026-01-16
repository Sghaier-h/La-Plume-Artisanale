# ⚡ Démarrage Rapide - Développement Local

## 🚀 En 3 commandes

### Option 1 : Script automatique (Recommandé)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\start-dev.ps1
```

**C'est tout !** Le script va :
- ✅ Vérifier Node.js et npm
- ✅ Installer les dépendances si nécessaire
- ✅ Créer les fichiers `.env` si manquants
- ✅ Démarrer le backend (port 5000)
- ✅ Démarrer le frontend (port 3000)

---

### Option 2 : Démarrage manuel

**Terminal 1 - Backend :**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm install
npm run dev
```

**Terminal 2 - Frontend :**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm install
npm start
```

---

## ✅ Vérification

1. **Backend** : Ouvrir `http://localhost:5000/health`
   - Devrait retourner : `{"status":"OK","timestamp":"..."}`

2. **Frontend** : Ouvrir `http://localhost:3000`
   - L'application devrait s'afficher

3. **Test d'authentification** :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Admin123!`

---

## 🆘 Problèmes courants

### "npm n'est pas reconnu"
**Solution :** Réinstaller Node.js depuis https://nodejs.org/

### "Port 5000 already in use"
**Solution :**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Cannot find module"
**Solution :**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📚 Documentation complète

Pour plus de détails, voir : **`DEVELOPPEMENT_LOCAL_PAS_A_PAS.md`**


