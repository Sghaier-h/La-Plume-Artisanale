# 📁 Réorganiser les Dossiers du Projet

## 🎯 Objectif

Réorganiser le projet pour avoir une structure claire avec `backend` et `frontend` dans le dossier `La-Plume-Artisanale`.

---

## 📋 Structure Actuelle

```
D:\OneDrive - FLYING TEX\PROJET\
├── backend\
├── frontend\
└── La-Plume-Artisanale\
    └── (documentation)
```

## 📋 Structure Cible

```
D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\
├── backend\
├── frontend\
└── (documentation)
```

---

## 🔧 Étape 1 : Déplacer Backend et Frontend

### Option A : Via l'Explorateur Windows

1. **Ouvrir l'Explorateur Windows**
2. **Naviguer vers** : `D:\OneDrive - FLYING TEX\PROJET`
3. **Couper** (Ctrl+X) les dossiers `backend` et `frontend`
4. **Aller dans** : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
5. **Coller** (Ctrl+V)

### Option B : Via PowerShell

```powershell
# Aller dans le dossier du projet
cd "D:\OneDrive - FLYING TEX\PROJET"

# Déplacer backend
Move-Item -Path "backend" -Destination "La-Plume-Artisanale\backend"

# Déplacer frontend
Move-Item -Path "frontend" -Destination "La-Plume-Artisanale\frontend"
```

---

## ✅ Étape 2 : Vérifier la Structure

```powershell
# Vérifier que les dossiers sont bien déplacés
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
ls -Name
```

**Doit afficher** :
- backend
- frontend
- (autres fichiers de documentation)

---

## 🔄 Étape 3 : Mettre à Jour les Chemins (si nécessaire)

### Si vous utilisez Git

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"

# Vérifier le statut Git
git status

# Ajouter les changements
git add .

# Commit
git commit -m "Réorganisation: déplacement de backend et frontend dans La-Plume-Artisanale"
```

### Si vous avez des scripts avec des chemins absolus

Vérifier et mettre à jour les chemins dans :
- Scripts de déploiement
- Fichiers de configuration
- Documentation

---

## 📋 Étape 4 : Vérifier que Tout Fonctionne

### Backend

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm list
# Doit afficher les dépendances sans erreur
```

### Frontend

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm list
# Doit afficher les dépendances sans erreur
```

---

## 🚀 Étape 5 : Mettre à Jour le VPS (si déjà déployé)

### Si vous utilisez Git

```bash
# Sur le VPS
cd /opt/fouta-erp
git pull
./deploy.sh
```

### Si vous transférez manuellement

Les chemins sur le VPS restent les mêmes (`/opt/fouta-erp/backend` et `/opt/fouta-erp/frontend`), donc pas de changement nécessaire.

---

## 📁 Structure Finale Recommandée

```
D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\
├── backend\
│   ├── src\
│   ├── package.json
│   └── .env
├── frontend\
│   ├── src\
│   ├── public\
│   ├── package.json
│   └── .env
├── database\
│   └── (scripts SQL)
├── mobile\
│   └── (applications mobiles)
├── docs\
│   └── (documentation)
└── (fichiers de documentation .md)
```

---

## ✅ Checklist

- [ ] Backend déplacé dans `La-Plume-Artisanale/backend`
- [ ] Frontend déplacé dans `La-Plume-Artisanale/frontend`
- [ ] Structure vérifiée
- [ ] Backend fonctionne (`npm list` sans erreur)
- [ ] Frontend fonctionne (`npm list` sans erreur)
- [ ] Git mis à jour (si utilisé)
- [ ] Documentation mise à jour (si nécessaire)

---

## 🎯 Avantages de cette Organisation

- ✅ **Structure claire** : Tout le projet dans un seul dossier
- ✅ **Facilité de navigation** : Backend et frontend côte à côte
- ✅ **Documentation centralisée** : Tous les guides au même endroit
- ✅ **Déploiement simplifié** : Un seul dossier à synchroniser

---

## 🚀 C'est Prêt !

Votre projet est maintenant mieux organisé et plus facile à gérer !

