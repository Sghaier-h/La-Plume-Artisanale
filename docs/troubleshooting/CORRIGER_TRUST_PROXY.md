# 🔧 Corriger l'Avertissement Trust Proxy

## ⚠️ Avertissement Détecté

```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Problème** : Express ne fait pas confiance au proxy (Nginx), ce qui peut causer des problèmes avec :
- Le rate limiting (détection incorrecte des IPs)
- Les headers `X-Forwarded-For` et `X-Real-IP`
- La détection du protocole (HTTP vs HTTPS)

---

## ✅ Solution : Activer Trust Proxy

### Correction Appliquée

Le fichier `backend/src/server.js` a été corrigé pour ajouter :

```javascript
// Trust proxy (nécessaire derrière Nginx)
app.set('trust proxy', true);
```

---

## 📤 Déployer la Correction sur le VPS

### Option 1 : Copier le Fichier Corrigé (Recommandé)

#### Depuis Windows (FileZilla)

1. **Ouvrir FileZilla**
2. **Naviguer vers** : `D:\OneDrive - FLYING TEX\PROJET\backend\src\`
3. **Glisser-déposer** `server.js` vers `/opt/fouta-erp/backend/src/` sur le VPS
4. **Remplacer** le fichier existant

#### Depuis Windows (SCP)

```powershell
# Copier le fichier corrigé
scp "D:\OneDrive - FLYING TEX\PROJET\backend\src\server.js" ubuntu@137.74.40.191:/opt/fouta-erp/backend/src/
```

### Option 2 : Modifier Directement sur le VPS

#### Sur le VPS

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

#### Ajouter la Ligne

Trouver cette section :
```javascript
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  // ...
});

// Middleware
app.use(helmet());
```

**Ajouter après** `const io = new Server(...)` :
```javascript
// Trust proxy (nécessaire derrière Nginx)
app.set('trust proxy', true);
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

---

## 🔄 Redémarrer l'Application

### Sur le VPS

```bash
# Redémarrer l'application avec PM2
pm2 restart fouta-api

# Vérifier les logs
pm2 logs fouta-api --lines 20

# Ne doit plus afficher l'avertissement ValidationError
```

---

## 🧪 Vérifier que la Correction Fonctionne

### Vérifier les Logs

```bash
# Voir les logs
pm2 logs fouta-api --lines 20

# Ne doit plus afficher :
# ValidationError: The 'X-Forwarded-For' header is set but...
```

### Tester l'Application

```bash
# Tester que l'application fonctionne toujours
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 📋 Checklist

- [ ] Fichier `server.js` corrigé : `app.set('trust proxy', true);`
- [ ] Fichier copié sur le VPS : `/opt/fouta-erp/backend/src/server.js`
- [ ] Application redémarrée : `pm2 restart fouta-api`
- [ ] Logs vérifiés : Plus d'avertissement `ValidationError`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Copier le fichier corrigé** : `server.js` vers le VPS
2. **Redémarrer l'application** : `pm2 restart fouta-api`
3. **Vérifier les logs** : Plus d'avertissement

**La correction est simple : ajouter `app.set('trust proxy', true);` dans `server.js`.**

