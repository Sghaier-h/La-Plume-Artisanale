# 👀 Comment Voir les Artefacts du Projet

## 📁 Méthodes pour visualiser le projet

### 1️⃣ Dans votre IDE (Cursor/VS Code)

#### Explorer les fichiers
- **Ouvrir l'explorateur** : `Ctrl + Shift + E` (ou clic sur l'icône dossier)
- **Rechercher un fichier** : `Ctrl + P` puis tapez le nom du fichier
- **Ouvrir un dossier** : Clic droit → "Reveal in File Explorer"

#### Fichiers clés à ouvrir
```
📂 backend/
  └── src/server.js              ← Point d'entrée du serveur
  └── src/controllers/           ← Logique métier
  └── src/routes/                ← Routes API

📂 frontend/
  └── src/pages/                 ← Pages principales
  └── src/services/              ← Services API
  └── src/types/                 ← Types TypeScript

📂 database/
  └── 01_base_et_securite.sql    ← Scripts SQL
```

### 2️⃣ Dans l'Explorateur Windows

1. **Ouvrir l'explorateur** : `Windows + E`
2. **Naviguer vers** : `D:\OneDrive - FLYING TEX\PROJET`
3. **Voir les dossiers** :
   - `backend/` - Code serveur
   - `frontend/` - Code client
   - `database/` - Scripts SQL
   - Fichiers `.md` - Documentation

### 3️⃣ Via le Terminal PowerShell

#### Lister tous les fichiers
```powershell
# Voir tous les fichiers du projet
Get-ChildItem -Path backend,frontend,database -Recurse -File

# Voir seulement les fichiers créés (sans node_modules)
Get-ChildItem -Path backend,frontend,database -Recurse -File | 
  Where-Object { $_.FullName -notmatch 'node_modules' }
```

#### Voir l'arborescence
```powershell
# Arborescence complète
tree /F /A backend frontend database

# Arborescence simplifiée
tree /A backend frontend database
```

### 4️⃣ Ouvrir les fichiers de documentation

#### Dans l'IDE
- `README.md` - Vue d'ensemble
- `ARTEFACTS_VISUEL.md` - Vue visuelle des fichiers
- `ARTEFACTS_PROJET.md` - Liste complète
- `INSTALLATION.md` - Guide d'installation
- `VUE_PROJET.md` - Structure complète

#### Commandes rapides
```powershell
# Ouvrir README dans l'éditeur
code README.md

# Ouvrir tous les fichiers MD
code *.md

# Ouvrir un fichier spécifique
code ARTEFACTS_VISUEL.md
```

### 5️⃣ Voir le contenu des fichiers

#### Dans PowerShell
```powershell
# Voir le contenu d'un fichier
Get-Content backend/package.json

# Voir les premières lignes
Get-Content backend/src/server.js -Head 20

# Compter les lignes
Get-Content backend/src/server.js | Measure-Object -Line
```

#### Dans l'IDE
- **Ouvrir un fichier** : `Ctrl + P` → nom du fichier
- **Voir plusieurs fichiers** : `Ctrl + K` puis `Ctrl + O` (ouvrir plusieurs fichiers)
- **Split view** : `Ctrl + \` (diviser la vue)

### 6️⃣ Rechercher dans les fichiers

#### Dans l'IDE
- **Recherche globale** : `Ctrl + Shift + F`
- **Recherche dans fichier** : `Ctrl + F`
- **Recherche de symboles** : `Ctrl + T`

#### Dans PowerShell
```powershell
# Rechercher un texte dans tous les fichiers
Select-String -Path "backend\src\**\*.js" -Pattern "express"

# Lister les fichiers contenant un mot
Get-ChildItem -Path backend -Recurse -File | 
  Select-String -Pattern "router"
```

### 7️⃣ Statistiques du projet

```powershell
# Compter les fichiers
(Get-ChildItem -Path backend,frontend,database -Recurse -File).Count

# Compter les lignes de code
Get-ChildItem -Path backend/src -Recurse -File -Filter "*.js" | 
  Get-Content | Measure-Object -Line

# Taille des dossiers
Get-ChildItem -Path backend,frontend,database -Directory | 
  ForEach-Object { 
    $size = (Get-ChildItem $_.FullName -Recurse -File | 
      Measure-Object -Property Length -Sum).Sum / 1MB
    [PSCustomObject]@{ 
      Dossier = $_.Name
      Taille_MB = [math]::Round($size, 2)
    }
  }
```

## 🎯 Fichiers à explorer en premier

### Backend
1. ✅ `backend/src/server.js` - Point d'entrée
2. ✅ `backend/package.json` - Dépendances
3. ✅ `backend/src/routes/auth.routes.js` - Routes d'authentification
4. ✅ `backend/src/controllers/production.controller.js` - Logique production

### Frontend
1. ✅ `frontend/package.json` - Dépendances
2. ✅ `frontend/src/pages/FoutaManagement.tsx` - Application principale
3. ✅ `frontend/src/services/api.ts` - Client API
4. ✅ `frontend/src/types/index.ts` - Types TypeScript

### Database
1. ✅ `database/01_base_et_securite.sql` - Tables de base
2. ✅ `database/02_production_et_qualite.sql` - Production
3. ✅ `database/03_flux_et_tracabilite.sql` - Flux

### Documentation
1. ✅ `README.md` - Commencer ici
2. ✅ `ARTEFACTS_VISUEL.md` - Vue visuelle
3. ✅ `INSTALLATION.md` - Pour installer

## 💡 Astuces

### Navigation rapide
- **Ouvrir un fichier** : `Ctrl + P` puis tapez le nom
- **Aller à une ligne** : `Ctrl + G` puis numéro de ligne
- **Rechercher un symbole** : `Ctrl + T`
- **Voir les définitions** : `F12` sur un symbole

### Explorer le code
- **Voir les références** : `Shift + F12`
- **Aller à la définition** : `F12`
- **Voir les fichiers modifiés** : Onglet "Source Control"

### Commandes utiles
```powershell
# Voir tous les fichiers .js du backend
Get-ChildItem -Path backend/src -Recurse -Filter "*.js"

# Voir tous les fichiers .tsx du frontend
Get-ChildItem -Path frontend/src -Recurse -Filter "*.tsx"

# Lister les routes API
Get-Content backend/src/routes/*.js | Select-String "router\."
```

## 🚀 Prochaines étapes

1. **Ouvrir** `README.md` pour comprendre le projet
2. **Explorer** `backend/src/server.js` pour voir le serveur
3. **Regarder** `frontend/src/pages/FoutaManagement.tsx` pour l'interface
4. **Consulter** `INSTALLATION.md` pour installer et démarrer

