# 🔧 Résoudre l'erreur npm install

## 🎯 Problème

Erreur lors de `npm install` :
```
npm error ERESOLVE could not resolve
npm error While resolving: react-scripts@5.0.1
npm error Found: typescript@5.9.3
npm error Could not resolve dependency:
npm error peerOptional typescript@"^3.2.1 || ^4" from react-scripts@5.0.1
```

**Cause** : `react-scripts@5.0.1` nécessite TypeScript version 3 ou 4, mais le projet avait TypeScript 5.3.3.

---

## ✅ Solution Appliquée

La version de TypeScript dans `package.json` a été corrigée de `^5.3.3` à `^4.9.5` (compatible avec react-scripts 5.0.1).

---

## 🚀 Réinstaller les Dépendances

### Option 1 : Installation normale (recommandé)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"

# Supprimer node_modules et package-lock.json si ils existent
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Installer avec la version corrigée
npm install
```

### Option 2 : Si l'erreur persiste

```powershell
npm install --legacy-peer-deps
```

**Note** : `--legacy-peer-deps` ignore les conflits de dépendances et installe quand même.

---

## ✅ Vérifier l'Installation

Après l'installation, vérifier :

```powershell
# Vérifier que node_modules existe
Test-Path node_modules

# Doit retourner : True

# Vérifier la version de TypeScript installée
npm list typescript

# Doit afficher : typescript@4.9.5
```

---

## 🎯 Continuer l'Installation

Une fois `npm install` réussi :

### 1. Créer le fichier `.env`

```powershell
New-Item -ItemType File -Name ".env" -Force
notepad .env
```

### 2. Ajouter la configuration de l'API

```env
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
```

### 3. Lancer l'application

```powershell
npm start
```

---

## 🐛 Si l'Erreur Persiste

### Solution Alternative : Utiliser --force

```powershell
npm install --force
```

**⚠️ Attention** : Cette option peut causer des problèmes, utilisez-la seulement en dernier recours.

### Solution Alternative : Mettre à jour react-scripts

Si vous voulez garder TypeScript 5, vous pouvez mettre à jour react-scripts :

```powershell
npm install react-scripts@latest --save-dev
```

Mais cela peut nécessiter d'autres ajustements.

---

## 📋 Checklist

- [ ] Version de TypeScript corrigée dans `package.json` (4.9.5)
- [ ] `node_modules` supprimé (si existant)
- [ ] `package-lock.json` supprimé (si existant)
- [ ] `npm install` exécuté avec succès
- [ ] Fichier `.env` créé avec `REACT_APP_API_URL`
- [ ] `npm start` fonctionne

---

## ✅ Résultat Attendu

Après ces étapes :
- ✅ Les dépendances sont installées sans erreur
- ✅ L'application peut démarrer avec `npm start`
- ✅ Le frontend se connecte à l'API déployée

---

## 🚀 Prochaines Étapes

Une fois l'installation réussie, suivez le guide `UTILISER_FRONTEND_LOCAL.md` pour :
1. Configurer le fichier `.env`
2. Lancer l'application
3. Utiliser l'interface utilisateur

---

## 💡 Explication Technique

**Pourquoi ce conflit ?**

- `react-scripts@5.0.1` a été publié avant TypeScript 5
- Il spécifie dans ses dépendances qu'il accepte TypeScript 3 ou 4
- TypeScript 5 est trop récent pour cette version de react-scripts
- Solution : Utiliser TypeScript 4.9.5 (dernière version 4.x, stable et compatible)

---

## ✅ Problème Résolu !

Le fichier `package.json` a été corrigé. Relancez `npm install` et cela devrait fonctionner.

