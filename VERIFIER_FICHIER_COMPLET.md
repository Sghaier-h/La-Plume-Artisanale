# 🔍 Vérifier le Fichier server.js Complet

## ⚠️ Erreurs Persistantes

Les erreurs persistent après le redémarrage :
- `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` : `trust proxy` pas pris en compte
- `SyntaxError: Unexpected identifier` : Erreur de syntaxe encore présente

---

## ✅ Solution : Vérifier le Fichier Complet

### Voir Tout le Fichier

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Voir tout le fichier
cat src/server.js

# OU avec numéros de lignes
cat -n src/server.js
```

### Vérifier les Lignes Importantes

```bash
# Vérifier que trust proxy est présent
grep -n "trust proxy" src/server.js

# Doit afficher : 35:app.set('trust proxy', true);

# Vérifier qu'il n'y a pas de "nano" dans le fichier
grep -n "nano" src/server.js

# Ne doit rien afficher

# Vérifier toutes les lignes import
grep -n "^import" src/server.js

# Doit afficher toutes les lignes import sans erreur
```

---

## 🔧 Option 1 : Copier le Fichier Corrigé (Recommandé)

### Depuis Windows (FileZilla)

1. **Ouvrir FileZilla**
2. **Se connecter** au VPS : `137.74.40.191`
3. **Naviguer vers** (côté gauche) : `D:\OneDrive - FLYING TEX\PROJET\backend\src\`
4. **Naviguer vers** (côté droit) : `/opt/fouta-erp/backend/src/`
5. **Glisser-déposer** `server.js` vers le VPS
6. **Remplacer** le fichier existant

### Depuis Windows (SCP)

```powershell
# Copier le fichier corrigé
scp "D:\OneDrive - FLYING TEX\PROJET\backend\src\server.js" ubuntu@137.74.40.191:/opt/fouta-erp/backend/src/
```

---

## 🔧 Option 2 : Vérifier et Corriger Manuellement

### Voir le Fichier Ligne par Ligne

```bash
# Voir les 15 premières lignes
head -15 src/server.js

# Doit ressembler à :
# import express from 'express';
# import cors from 'cors';
# ...
# import stockRoutes from './routes/stock.routes.js';
# (sans "nano src/server.js")
```

### Vérifier la Ligne trust proxy

```bash
# Voir autour de la ligne 35
sed -n '30,40p' src/server.js

# Doit afficher :
# ...
# });
#
# // Trust proxy (nécessaire derrière Nginx)
# app.set('trust proxy', true);
#
# // Middleware
# ...
```

---

## 🔄 Redémarrer Complètement

### Arrêter et Redémarrer

```bash
# Arrêter complètement
pm2 stop fouta-api
pm2 delete fouta-api

# Redémarrer depuis le début
cd /opt/fouta-erp/backend
pm2 start index.js --name fouta-api

# Vérifier
pm2 status
pm2 logs fouta-api --lines 20
```

---

## 🧪 Vérifier la Syntaxe Avant Redémarrage

```bash
# Vérifier la syntaxe
node --check src/server.js

# Doit afficher : (rien)

# Si erreur, voir l'erreur exacte
node src/server.js

# (Arrêter avec Ctrl+C)
```

---

## 📋 Checklist

- [ ] Fichier complet vérifié : `cat src/server.js`
- [ ] Ligne 12 corrigée : Pas de "nano src/server.js"
- [ ] Ligne trust proxy présente : `grep "trust proxy" src/server.js`
- [ ] Syntaxe vérifiée : `node --check src/server.js` → (rien)
- [ ] Application arrêtée et redémarrée : `pm2 stop fouta-api && pm2 delete fouta-api && pm2 start index.js --name fouta-api`
- [ ] Logs vérifiés : Plus d'erreur

---

## ✅ Résumé

1. **Vérifier le fichier** : `cat src/server.js`
2. **Copier le fichier corrigé** : Depuis Windows vers le VPS
3. **Vérifier la syntaxe** : `node --check src/server.js`
4. **Redémarrer complètement** : `pm2 stop fouta-api && pm2 delete fouta-api && pm2 start index.js --name fouta-api`
5. **Vérifier les logs** : `pm2 logs fouta-api --lines 20`

**La meilleure solution est de copier le fichier corrigé depuis Windows vers le VPS !**

