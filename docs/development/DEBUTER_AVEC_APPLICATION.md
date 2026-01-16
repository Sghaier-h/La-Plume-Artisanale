# 🚀 Débuter avec l'Application ERP

## 🎯 Comprendre la Situation

Vous avez actuellement :
- ✅ **Backend (API)** : Déployé et accessible sur `https://fabrication.laplume-artisanale.tn`
- ❌ **Frontend (Interface)** : Pas encore lancé

**Le backend seul ne suffit pas** : C'est juste une API (comme un serveur de données). Il faut l'interface utilisateur (frontend) pour travailler avec l'application.

---

## 🎨 Deux Options

### Option 1 : Développer en Local (Recommandé pour commencer)

✅ **Avantages** :
- Rapide à mettre en place
- Modifications instantanées
- Pas besoin de déployer à chaque changement

❌ **Inconvénients** :
- Nécessite Node.js sur votre machine
- L'application n'est accessible que depuis votre ordinateur

### Option 2 : Déployer le Frontend sur le VPS

✅ **Avantages** :
- Accessible depuis n'importe où
- Pas besoin d'installer Node.js localement

❌ **Inconvénients** :
- Plus complexe à configurer
- Nécessite de rebuild à chaque modification

---

## 🚀 Démarrage Rapide (Option 1 - Local)

### 1. Installer Node.js (si pas déjà fait)

Télécharger depuis : https://nodejs.org/ (Version 18 LTS)

### 2. Ouvrir PowerShell

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"
```

### 3. Installer les dépendances

```powershell
npm install
```

**⏱️ Attendre 2-5 minutes**

### 4. Configurer l'API

Créer un fichier `.env` dans `frontend/` :

```powershell
New-Item -ItemType File -Name ".env" -Force
notepad .env
```

Ajouter :
```env
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
```

### 5. Lancer l'application

```powershell
npm start
```

**L'application s'ouvrira automatiquement dans votre navigateur sur `http://localhost:3000`**

---

## 📱 Utiliser l'Application

### Page de Connexion

1. Ouvrir `http://localhost:3000`
2. Se connecter avec vos identifiants (selon votre base de données)

### Fonctionnalités Disponibles

Selon votre rôle :
- **Dashboard** : Vue d'ensemble de la production
- **Production** : Gestion des OF (Ordres de Fabrication)
- **Stock** : Gestion des matières premières et produits finis
- **Planning** : Planification de la production
- **Qualité** : Contrôle qualité

---

## 🔍 Vérifier que Tout Fonctionne

### Test 1 : API Accessible

```powershell
curl.exe https://fabrication.laplume-artisanale.tn/health
```

**Doit retourner** : `{"status":"OK","timestamp":"..."}`

### Test 2 : Frontend Connecté

1. Ouvrir `http://localhost:3000`
2. Ouvrir les **Outils de développement** (F12)
3. Aller dans l'onglet **Console**
4. Vérifier qu'il n'y a pas d'erreurs de connexion

---

## 🎯 Prochaines Étapes

Une fois l'application lancée :

1. **Se connecter** avec un compte utilisateur
2. **Explorer les fonctionnalités** selon votre rôle
3. **Tester les fonctionnalités** :
   - Créer un OF
   - Gérer le stock
   - Consulter le planning
   - etc.

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `UTILISER_FRONTEND_LOCAL.md` : Guide détaillé du développement local
- `INSTALLATION.md` : Guide d'installation complet
- `README.md` : Documentation générale du projet

---

## ❓ Questions Fréquentes

### Q: Pourquoi je ne vois que la page d'accueil de l'API ?

**R:** Parce que seul le backend est déployé. Il faut lancer le frontend localement ou le déployer aussi.

### Q: Puis-je accéder à l'application depuis un autre ordinateur ?

**R:** Si vous développez en local, non. Il faudrait déployer le frontend sur le VPS.

### Q: Comment déployer le frontend sur le VPS ?

**R:** Voir le guide `DEPLOIEMENT_FRONTEND_VPS.md` (à créer si nécessaire).

---

## ✅ Résumé

1. ✅ Backend déployé : `https://fabrication.laplume-artisanale.tn`
2. ⏳ Frontend à lancer : `npm start` dans `frontend/`
3. 🎯 Application complète : Frontend local + Backend VPS

---

## 🚀 C'est Parti !

Suivez les étapes ci-dessus et vous pourrez utiliser votre application ERP complète !

