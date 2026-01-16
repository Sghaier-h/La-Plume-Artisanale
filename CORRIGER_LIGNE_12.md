# 🔧 Corriger la Ligne 12 du Fichier server.js

## ❌ Erreur Détectée

```
/opt/fouta-erp/backend/src/server.js:12
nano src/server.jsimport stockRoutes from './routes/stock.routes.js';
     ^^^

SyntaxError: Unexpected identifier
```

**Problème** : La commande `nano src/server.js` a été collée directement dans le fichier au lieu d'être exécutée.

---

## ✅ Solution : Corriger la Ligne 12

### Sur le VPS

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

### Trouver et Corriger la Ligne 12

**Chercher** cette ligne (vers la ligne 12) :
```javascript
nano src/server.jsimport stockRoutes from './routes/stock.routes.js';
```

**Remplacer par** :
```javascript
import stockRoutes from './routes/stock.routes.js';
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

---

## 🔧 Alternative : Utiliser sed

### Corriger Automatiquement

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Corriger la ligne 12
sed -i 's/nano src\/server\.jsimport/import/g' src/server.js

# Vérifier que c'est corrigé
grep -n "nano" src/server.js

# Ne doit rien afficher
```

---

## 🧪 Vérifier la Syntaxe

### Sur le VPS

```bash
# Tester la syntaxe
node --check src/server.js

# Doit afficher : (rien) si la syntaxe est correcte
```

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

# Ne doit plus afficher :
# SyntaxError: Unexpected identifier
```

---

## 📋 Checklist

- [ ] Fichier édité : `nano src/server.js`
- [ ] Ligne 12 corrigée : Supprimé `nano src/server.js`
- [ ] Syntaxe testée : `node --check src/server.js` → (rien)
- [ ] Application redémarrée : `pm2 restart fouta-api`
- [ ] Logs vérifiés : Plus d'erreur `SyntaxError`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Éditer le fichier** : `nano src/server.js`
2. **Trouver la ligne 12** : `nano src/server.jsimport stockRoutes...`
3. **Corriger** : Supprimer `nano src/server.js` → `import stockRoutes...`
4. **Sauvegarder** : Ctrl+O, Entrée, Ctrl+X
5. **Vérifier** : `node --check src/server.js`
6. **Redémarrer** : `pm2 restart fouta-api`

**La correction est simple : supprimer "nano src/server.js" de la ligne 12 !**

