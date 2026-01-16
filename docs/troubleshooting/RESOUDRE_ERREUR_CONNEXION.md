# 🔧 Résoudre l'Erreur de Connexion

## ⚠️ Problème Identifié

Le frontend compile correctement mais la connexion échoue. Le test curl montre "Bad Request", ce qui indique que :
1. L'API est accessible
2. Mais il y a un problème avec la requête ou la base de données

---

## 🔍 Diagnostic

**Le problème probable :**
- Le backend sur le VPS ne peut pas accéder à la base de données
- Ou le backend utilise encore l'ancien code avec Prisma
- Ou les utilisateurs n'existent pas dans la base de données

---

## ✅ Solution 1 : Vérifier les Logs du Backend sur le VPS

**Se connecter au VPS et vérifier les logs :**

```bash
# Sur le VPS
ssh ubuntu@137.74.40.191

# Voir les logs
pm2 logs fouta-api --lines 50
```

**Chercher les erreurs liées à :**
- Connexion à la base de données
- Utilisateurs non trouvés
- Erreurs SQL

---

## ✅ Solution 2 : Vérifier que le Backend sur le VPS Utilise les Bonnes Routes

**Le backend sur le VPS doit utiliser le code mis à jour avec `pg` au lieu de Prisma.**

**Vérifier que `backend/src/controllers/auth.controller.js` utilise `pool` et non `prisma`.**

---

## ✅ Solution 3 : Tester avec le Backend Local (Via Tunnel SSH)

**Si le problème persiste, utiliser le backend local :**

1. **Créer le tunnel SSH :**
   ```powershell
   ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
   ```

2. **Modifier le frontend pour utiliser localhost :**
   - Créer un fichier `.env` dans `frontend/` :
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. **Démarrer le backend local :**
   ```powershell
   cd backend
   npm run dev
   ```

4. **Redémarrer le frontend :**
   ```powershell
   cd frontend
   npm start
   ```

---

## 🔧 Solution Immédiate : Vérifier la Configuration CORS

**J'ai mis à jour la configuration CORS du backend pour autoriser localhost:3000.**

**Mais le backend sur le VPS doit être redémarré pour que les changements prennent effet.**

---

## 📋 Actions Immédiates

### 1. Vérifier l'Erreur Exacte dans le Navigateur

**Ouvrir la console du navigateur (F12) :**
1. Aller à l'onglet **Console**
2. Aller à l'onglet **Network**
3. Essayer de se connecter
4. Noter l'erreur exacte

### 2. Vérifier les Logs du Backend VPS

**Si vous avez accès SSH au VPS :**
```bash
pm2 logs fouta-api --lines 50
```

### 3. Tester l'API Directement

**Dans PowerShell :**
```powershell
# Test health
curl.exe https://fabrication.laplume-artisanale.tn/health

# Test login
$body = @{email="admin@system.local";password="Admin123!"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://fabrication.laplume-artisanale.tn/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## 🚀 Solution Recommandée

**Pour continuer rapidement, je recommande d'utiliser le backend local avec le tunnel SSH :**

1. **Déployer le code mis à jour sur le VPS** (avec les corrections pour utiliser pg)
2. **Ou utiliser le backend local** avec tunnel SSH

**Quelle solution préférez-vous ?**
