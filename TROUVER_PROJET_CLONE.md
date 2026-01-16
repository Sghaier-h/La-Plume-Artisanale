# 🔍 Trouver le Projet Cloné

## ❌ Problème

Le script a dit "✅ Projet cloné" mais le dossier `backend/` n'existe pas dans `~/la-plume-artisanale`.

---

## 🔍 Vérifications

### 1. Chercher Où le Projet a été Cloné

```bash
# Chercher le dossier La-Plume-Artisanale
find ~ -type d -name "La-Plume-Artisanale" 2>/dev/null

# OU chercher le dossier backend
find ~ -type d -name "backend" 2>/dev/null | grep -v node_modules

# OU voir tous les dossiers dans le home
ls -la ~/
```

### 2. Vérifier l'Ancien Projet

L'ancien projet dans `~/fouta-erp/backend` fonctionnait déjà. Vérifions-le :

```bash
# Aller dans l'ancien projet
cd ~/fouta-erp/backend

# Vérifier les fichiers
ls -la
cat .ovhconfig
cat index.js

# Vérifier que l'application tourne
ps aux | grep node
```

### 3. Vérifier le Contenu de ~/la-plume-artisanale

```bash
# Voir ce qu'il y a dans le dossier
cd ~/la-plume-artisanale
ls -la

# Vérifier si le projet a été cloné ailleurs
ls -la ~/La-Plume-Artisanale 2>/dev/null
ls -la ~/la-plume-artisanale/La-Plume-Artisanale 2>/dev/null
```

---

## 🎯 Solution : Utiliser l'Ancien Projet

L'ancien projet `~/fouta-erp/backend` était déjà configuré et fonctionnait. Il est recommandé de continuer avec celui-ci.

### Vérifier l'Ancien Projet

```bash
cd ~/fouta-erp/backend

# Vérifier les fichiers
ls -la .ovhconfig index.js src/server.js

# Vérifier que l'application tourne
ps aux | grep node
```

### Vérifier la Configuration Multisite

Dans le panneau OVH :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. Vérifiez que le **dossier racine** est : `fouta-erp/backend`
3. Si ce n'est pas le cas, modifiez-le et sauvegardez

---

## 🔧 Si Vous Voulez Utiliser le Nouveau Projet

Si le script a cloné le projet ailleurs :

### 1. Trouver Où il a été Cloné

```bash
# Chercher
find ~ -type d -name "La-Plume-Artisanale" 2>/dev/null
find ~ -type d -name "backend" 2>/dev/null | grep -v node_modules
```

### 2. Copier les Fichiers Nécessaires

Si vous trouvez le projet cloné :

```bash
# Supposons qu'il soit dans ~/La-Plume-Artisanale
cd ~/La-Plume-Artisanale/backend

# Copier .ovhconfig et index.js vers fouta-erp/backend
cp .ovhconfig ~/fouta-erp/backend/
cp index.js ~/fouta-erp/backend/

# OU mettre à jour la configuration Multisite pour pointer vers le nouveau dossier
```

---

## ✅ Recommandation

**Utilisez l'ancien projet `~/fouta-erp/backend`** qui était déjà configuré :

1. **Vérifiez qu'il fonctionne toujours** :
   ```bash
   cd ~/fouta-erp/backend
   ps aux | grep node
   ```

2. **Vérifiez la configuration Multisite** :
   - Dossier racine : `fouta-erp/backend`

3. **Testez l'application** :
   ```bash
   curl http://fabrication.laplume-artisanale.tn/health
   ```

---

## 📋 Checklist

- [ ] Cherché où le projet a été cloné
- [ ] Vérifié l'ancien projet `~/fouta-erp/backend`
- [ ] Vérifié que l'application tourne (`ps aux | grep node`)
- [ ] Vérifié la configuration Multisite (dossier racine)
- [ ] Décidé quel projet utiliser
- [ ] Testé l'application

---

## 💡 Note

Le script a peut-être cloné le projet dans un autre emplacement ou la structure du repository GitHub est différente.

**L'ancien projet `~/fouta-erp/backend` était déjà configuré et fonctionnait. Il est recommandé de continuer avec celui-ci.**

