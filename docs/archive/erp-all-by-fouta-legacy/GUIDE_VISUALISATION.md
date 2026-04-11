# 👀 Guide de Visualisation du Projet

## 🎯 Méthode la plus simple : Dans votre IDE

### 1. Ouvrir l'explorateur de fichiers
- **Raccourci** : `Ctrl + Shift + E`
- Ou cliquez sur l'icône 📁 dans la barre latérale gauche

### 2. Naviguer dans les dossiers
```
PROJET/
├── 📂 backend/          ← Cliquez pour voir les fichiers
├── 📂 frontend/         ← Cliquez pour voir les fichiers
├── 📂 database/         ← Cliquez pour voir les fichiers
└── 📄 *.md              ← Fichiers de documentation
```

### 3. Ouvrir un fichier
- **Double-clic** sur un fichier pour l'ouvrir
- Ou **clic droit** → "Open"

## 📋 Fichiers à voir en priorité

### 📚 Documentation (dans la racine)
1. **README.md** - Vue d'ensemble du projet
2. **ARTEFACTS_VISUEL.md** - Vue visuelle de tous les fichiers
3. **INSTALLATION.md** - Comment installer
4. **COMMENT_VOIR.md** - Ce guide

### 🔧 Backend (backend/src/)
1. **server.js** - Serveur principal
2. **controllers/** - Logique métier
3. **routes/** - Routes API
4. **package.json** - Dépendances

### 🎨 Frontend (frontend/src/)
1. **pages/FoutaManagement.tsx** - Application principale
2. **pages/DashboardTisseur.tsx** - Dashboard tisseur
3. **services/api.ts** - Client API
4. **package.json** - Dépendances

### 🗄️ Database (database/)
1. **01_base_et_securite.sql** - Tables de base
2. **02_production_et_qualite.sql** - Production
3. **03_flux_et_tracabilite.sql** - Flux

## 🔍 Recherche rapide dans l'IDE

### Raccourcis utiles
- **`Ctrl + P`** - Ouvrir un fichier rapidement
  - Tapez "server.js" pour ouvrir le serveur
  - Tapez "package.json" pour voir les dépendances
  
- **`Ctrl + Shift + F`** - Rechercher dans tous les fichiers
  - Tapez "express" pour trouver où Express est utilisé
  - Tapez "router" pour trouver les routes

- **`Ctrl + T`** - Rechercher un symbole/fonction
  - Tapez "login" pour trouver la fonction login

## 📊 Voir la structure complète

### Option 1 : Dans l'explorateur
- Cliquez sur les flèches ▶️ à côté des dossiers pour les développer
- Vous verrez tous les fichiers et sous-dossiers

### Option 2 : Ouvrir ARTEFACTS_VISUEL.md
Ce fichier contient une vue complète de tous les fichiers créés avec leur description.

## 💡 Astuces

### Voir plusieurs fichiers en même temps
1. Ouvrez un fichier
2. **`Ctrl + \`** pour diviser la vue
3. Ouvrez un autre fichier dans la nouvelle vue

### Navigation entre fichiers
- **`Ctrl + Tab`** - Basculer entre les fichiers ouverts
- **`Ctrl + Page Up/Down`** - Naviguer dans les onglets

### Voir les modifications
- Onglet **"Source Control"** (icône branche Git)
- Voir tous les fichiers modifiés/créés

## 🚀 Commencer ici

1. **Ouvrez** `ARTEFACTS_VISUEL.md` pour voir tous les fichiers
2. **Explorez** `backend/src/server.js` pour comprendre le serveur
3. **Regardez** `frontend/src/pages/FoutaManagement.tsx` pour l'interface
4. **Consultez** `README.md` pour la vue d'ensemble

## 📁 Structure visuelle

```
PROJET/
│
├── 📄 README.md                    ← Commencez ici
├── 📄 ARTEFACTS_VISUEL.md          ← Voir tous les fichiers
├── 📄 INSTALLATION.md              ← Comment installer
│
├── 📂 backend/
│   ├── 📄 package.json
│   └── 📂 src/
│       ├── 📄 server.js            ← Point d'entrée
│       ├── 📂 controllers/         ← 4 fichiers
│       ├── 📂 routes/              ← 5 fichiers
│       └── 📂 utils/
│
├── 📂 frontend/
│   ├── 📄 package.json
│   └── 📂 src/
│       ├── 📂 pages/              ← 3 fichiers
│       ├── 📂 services/           ← 2 fichiers
│       └── 📂 types/              ← 1 fichier
│
└── 📂 database/
    ├── 📄 01_base_et_securite.sql
    ├── 📄 02_production_et_qualite.sql
    └── 📄 03_flux_et_tracabilite.sql
```

## ✅ Checklist de visualisation

- [ ] Ouvrir `ARTEFACTS_VISUEL.md` pour voir la liste complète
- [ ] Explorer `backend/src/server.js`
- [ ] Regarder `frontend/src/pages/FoutaManagement.tsx`
- [ ] Consulter `README.md` pour comprendre le projet
- [ ] Voir `INSTALLATION.md` pour savoir comment démarrer

