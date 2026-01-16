# 🔍 Diagnostic de l'Erreur de Connexion

## ⚠️ Problème

Le frontend compile correctement mais il y a une erreur de connexion lors de la tentative de login.

---

## 🔍 Étapes de Diagnostic

### 1. Ouvrir la Console du Navigateur

**Dans votre navigateur (F12 ou Clic droit → Inspecter) :**
1. Aller à l'onglet **Console**
2. Aller à l'onglet **Network** (Réseau)
3. Essayer de se connecter
4. Noter les erreurs affichées

---

### 2. Vérifier les Erreurs CORS

**Si vous voyez une erreur comme :**
```
Access to XMLHttpRequest at 'https://fabrication.laplume-artisanale.tn/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cela signifie que le backend ne permet pas les requêtes depuis localhost.**

**Solution :** Vérifier la configuration CORS du backend.

---

### 3. Vérifier la Réponse de l'API

**Dans l'onglet Network du navigateur :**
1. Chercher la requête vers `/api/auth/login`
2. Cliquer dessus
3. Vérifier :
   - Le **Status Code** (200, 401, 500, etc.)
   - La **Response** (réponse de l'API)
   - Les **Headers**

---

### 4. Tester l'API Directement

**Ouvrir un nouveau terminal PowerShell et tester :**

```powershell
# Tester l'endpoint health
curl.exe https://fabrication.laplume-artisanale.tn/health

# Tester l'endpoint login
curl.exe -X POST https://fabrication.laplume-artisanale.tn/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@system.local\",\"password\":\"Admin123!\"}'
```

**Vérifier la réponse :**
- Si `{"status":"OK"}` → L'API fonctionne
- Si erreur 401 → Identifiants incorrects ou utilisateur inexistant
- Si erreur 500 → Erreur serveur
- Si erreur CORS → Problème de configuration CORS

---

## ✅ Solutions Selon l'Erreur

### Erreur CORS

**Le backend doit autoriser les requêtes depuis localhost:3000.**

**Vérifier dans `backend/src/server.js` :**

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fabrication.laplume-artisanale.tn',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));
```

### Erreur 401 (Unauthorized)

**Causes possibles :**
1. Utilisateur inexistant dans la base de données
2. Mot de passe incorrect
3. Table `utilisateurs` vide

**Solution :** Vérifier que les utilisateurs existent dans la base de données.

### Erreur 500 (Server Error)

**Le backend a une erreur interne.**

**Vérifier les logs du backend sur le VPS :**

```bash
# Sur le VPS
pm2 logs fouta-api --lines 50
```

### Erreur de Réseau

**L'API n'est pas accessible.**

**Vérifier :**
1. Le backend est démarré sur le VPS
2. L'URL est correcte : `https://fabrication.laplume-artisanale.tn`
3. La connexion internet fonctionne

---

## 🔧 Solution Immédiate : Vérifier la Configuration

### Vérifier la Configuration CORS du Backend

**Le backend doit permettre les requêtes depuis localhost:3000.**

**Je vais vérifier et corriger si nécessaire.**

---

## 📋 Checklist de Diagnostic

- [ ] Console du navigateur ouverte (F12)
- [ ] Onglet Console vérifié
- [ ] Onglet Network vérifié
- [ ] Requête `/api/auth/login` visible dans Network
- [ ] Status code de la requête noté
- [ ] Réponse de l'API vérifiée
- [ ] Test avec curl effectué

---

## 🚀 Prochaines Étapes

1. **Ouvrir la console du navigateur** (F12)
2. **Essayer de se connecter**
3. **Copier l'erreur exacte** affichée dans la console
4. **Me donner l'erreur complète** pour que je puisse la résoudre

**Ou exécuter ce test dans PowerShell :**

```powershell
curl.exe -X POST https://fabrication.laplume-artisanale.tn/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@system.local\",\"password\":\"Admin123!\"}'
```

**Et me donner la réponse complète.**
