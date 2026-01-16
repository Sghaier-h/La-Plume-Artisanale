# 🔧 Corriger Trust Proxy : Utiliser 1 au lieu de true

## ❌ Problème Identifié

```
ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```

**Cause** : `app.set('trust proxy', true)` est trop permissif et express-rate-limit refuse de fonctionner pour des raisons de sécurité.

---

## ✅ Solution : Utiliser `trust proxy: 1`

### Correction Appliquée

Le fichier `backend/src/server.js` a été corrigé :

**Avant** :
```javascript
app.set('trust proxy', true);
```

**Après** :
```javascript
// Trust proxy (nécessaire derrière Nginx)
// Utiliser 1 au lieu de true pour la sécurité avec express-rate-limit
app.set('trust proxy', 1);
```

---

## 📤 Déployer la Correction sur le VPS

### Option 1 : Copier le Fichier Corrigé (Recommandé)

#### Depuis Windows (FileZilla)

1. **Ouvrir FileZilla**
2. **Se connecter** au VPS : `137.74.40.191`
3. **Naviguer vers** (côté gauche) : `D:\OneDrive - FLYING TEX\PROJET\backend\src\`
4. **Naviguer vers** (côté droit) : `/opt/fouta-erp/backend/src/`
5. **Glisser-déposer** `server.js` vers le VPS
6. **Remplacer** le fichier existant

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

#### Trouver et Modifier

Chercher la ligne 35 :
```javascript
app.set('trust proxy', true);
```

**Remplacer par** :
```javascript
// Trust proxy (nécessaire derrière Nginx)
// Utiliser 1 au lieu de true pour la sécurité avec express-rate-limit
app.set('trust proxy', 1);
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
pm2 logs fouta-api --err --lines 10

# Ne doit plus afficher :
# ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```

---

## 🧪 Vérifier que la Correction Fonctionne

### Vérifier les Logs

```bash
# Voir les logs d'erreur
pm2 logs fouta-api --err --lines 10

# Ne doit plus afficher :
# ERR_ERL_UNEXPECTED_X_FORWARDED_FOR

# Voir les logs de sortie
pm2 logs fouta-api --out --lines 10

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

### Tester l'Application

```bash
# Tester que l'application fonctionne toujours
curl http://localhost:5000/health

# Doit retourner : {"status":"OK","timestamp":"..."}

# Tester via HTTPS
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 📋 Checklist

- [ ] Fichier `server.js` corrigé : `app.set('trust proxy', 1);`
- [ ] Fichier copié sur le VPS : `/opt/fouta-erp/backend/src/server.js`
- [ ] Fichier vérifié sur le VPS : `grep "trust proxy" /opt/fouta-erp/backend/src/server.js`
- [ ] Application redémarrée : `pm2 restart fouta-api`
- [ ] Logs vérifiés : Plus d'erreur `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## 🔍 Vérifier que le Fichier est Corrigé

### Sur le VPS

```bash
# Vérifier que la ligne est correcte
grep "trust proxy" /opt/fouta-erp/backend/src/server.js

# Doit afficher :
# app.set('trust proxy', 1);
```

Si ça affiche `app.set('trust proxy', true);`, le fichier n'a pas été mis à jour.

---

## ✅ Résumé

1. **Copier le fichier corrigé** : `server.js` vers `/opt/fouta-erp/backend/src/`
2. **Vérifier** : `grep "trust proxy" /opt/fouta-erp/backend/src/server.js` → `app.set('trust proxy', 1);`
3. **Redémarrer** : `pm2 restart fouta-api`
4. **Vérifier les logs** : `pm2 logs fouta-api --err --lines 10`

**La correction est simple : changer `true` en `1` dans `app.set('trust proxy', 1);`**

**Cette correction résout l'erreur `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` !**

