# 📤 Déployer la Correction Trust Proxy

## ⚠️ Erreur Toujours Présente

L'erreur persiste car le fichier `server.js` sur le VPS n'a pas encore été mis à jour.

---

## ✅ Solution : Copier le Fichier Corrigé

### Option 1 : Utiliser FileZilla (Recommandé)

1. **Ouvrir FileZilla**
2. **Se connecter** au VPS : `137.74.40.191`
3. **Naviguer vers** (côté gauche) : `D:\OneDrive - FLYING TEX\PROJET\backend\src\`
4. **Naviguer vers** (côté droit) : `/opt/fouta-erp/backend/src/`
5. **Glisser-déposer** `server.js` vers le VPS
6. **Remplacer** le fichier existant

### Option 2 : Utiliser SCP

#### Depuis PowerShell

```powershell
# Copier le fichier corrigé
scp "D:\OneDrive - FLYING TEX\PROJET\backend\src\server.js" ubuntu@137.74.40.191:/opt/fouta-erp/backend/src/
```

**Mot de passe** : Votre mot de passe VPS

### Option 3 : Modifier Directement sur le VPS

#### Sur le VPS

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

#### Trouver et Modifier

Chercher cette section (vers la ligne 19-35) :
```javascript
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "capacitor://localhost",
      "ionic://localhost",
      "https://app.fouta-erp.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
```

**Ajouter après** `});` (ligne après `const io = new Server(...)`) :
```javascript
// Trust proxy (nécessaire derrière Nginx)
app.set('trust proxy', true);
```

**Le fichier devrait ressembler à** :
```javascript
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "capacitor://localhost",
      "ionic://localhost",
      "https://app.fouta-erp.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Trust proxy (nécessaire derrière Nginx)
app.set('trust proxy', true);

// Middleware
app.use(helmet());
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

---

## 🔄 Redémarrer l'Application

### Sur le VPS

```bash
# Redémarrer l'application avec PM2
pm2 restart fouta-api

# Attendre quelques secondes
sleep 3

# Vérifier les logs
pm2 logs fouta-api --lines 20
```

### Vérifier que l'Erreur a Disparu

```bash
# Voir les logs d'erreur
pm2 logs fouta-api --err --lines 10

# Ne doit plus afficher :
# ValidationError: The 'X-Forwarded-For' header is set but...
```

---

## 🧪 Tester l'Application

### Vérifier que Tout Fonctionne

```bash
# Tester que l'application fonctionne toujours
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 📋 Checklist

- [ ] Fichier `server.js` corrigé localement : `app.set('trust proxy', true);`
- [ ] Fichier copié sur le VPS : `/opt/fouta-erp/backend/src/server.js`
- [ ] Fichier vérifié sur le VPS : `grep "trust proxy" /opt/fouta-erp/backend/src/server.js`
- [ ] Application redémarrée : `pm2 restart fouta-api`
- [ ] Logs vérifiés : Plus d'avertissement `ValidationError`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## 🔍 Vérifier que le Fichier est Corrigé

### Sur le VPS

```bash
# Vérifier que la ligne existe
grep "trust proxy" /opt/fouta-erp/backend/src/server.js

# Doit afficher :
# app.set('trust proxy', true);
```

Si rien n'est affiché, le fichier n'a pas été mis à jour.

---

## ✅ Résumé

1. **Copier le fichier corrigé** : `server.js` vers `/opt/fouta-erp/backend/src/`
2. **Vérifier** : `grep "trust proxy" /opt/fouta-erp/backend/src/server.js`
3. **Redémarrer** : `pm2 restart fouta-api`
4. **Vérifier les logs** : `pm2 logs fouta-api --err --lines 10`

**L'erreur disparaîtra une fois le fichier corrigé copié et l'application redémarrée !**

