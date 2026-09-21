# 🚀 Démarrer l'Application en Local

## Backend

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

Le backend démarre sur **http://localhost:5000**

---

## Frontend

Dans un **nouveau terminal** :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

Le frontend démarre sur **http://localhost:3000**

---

## Vérifications

### Backend
- Ouvrir : http://localhost:5000/api/health
- Devrait retourner : `{"status":"OK","timestamp":"..."}`

### Frontend
- Ouvrir : http://localhost:3000
- Devrait afficher la page de login

---

## Note

Les deux serveurs sont lancés en arrière-plan. Pour les arrêter :
- Backend : Chercher le processus Node.js et l'arrêter
- Frontend : `Ctrl+C` dans le terminal ou fermer le terminal
