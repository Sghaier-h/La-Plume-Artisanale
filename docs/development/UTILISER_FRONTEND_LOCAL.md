# 💻 Utiliser le Frontend Localement

## 🎯 Situation Actuelle

- ✅ **Backend déployé** : `https://fabrication.laplume-artisanale.tn` (VPS OVH)
- ❌ **Frontend non déployé** : Seulement le backend est accessible
- 💡 **Solution** : Développer le frontend localement et le connecter à l'API déployée

---

## 📋 Prérequis

- Node.js 18+ installé sur votre machine Windows
- Git (optionnel)
- Un éditeur de code (VS Code recommandé)

---

## 🚀 Étape 1 : Installer le Frontend

### Ouvrir PowerShell dans le dossier du projet

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"
```

### Installer les dépendances

```powershell
npm install
```

**⏱️ Cela peut prendre 2-5 minutes**

---

## ⚙️ Étape 2 : Configurer le Frontend pour l'API Déployée

### Créer un fichier `.env` dans le dossier `frontend`

```powershell
# Dans PowerShell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"
New-Item -ItemType File -Name ".env" -Force
notepad .env
```

### Ajouter cette ligne dans `.env`

```env
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
```

**💡 Important** : Le frontend se connectera maintenant à votre API déployée sur le VPS.

---

## 🎬 Étape 3 : Démarrer le Frontend

### Lancer l'application

```powershell
npm start
```

**L'application va :**
- Se compiler automatiquement
- S'ouvrir dans votre navigateur sur `http://localhost:3000`
- Se recharger automatiquement quand vous modifiez le code

---

## ✅ Étape 4 : Utiliser l'Application

### 1. Ouvrir l'application

Une fois `npm start` lancé, votre navigateur s'ouvrira automatiquement sur :
```
http://localhost:3000
```

### 2. Se connecter

Utilisez les comptes par défaut (selon votre base de données) :

| Rôle | Nom d'utilisateur | Mot de passe |
|------|-------------------|-------------|
| Admin | admin | (selon votre DB) |
| Chef Production | chef.prod | (selon votre DB) |
| Tisseur | tisseur | (selon votre DB) |

**⚠️ Note** : Les mots de passe dépendent de votre configuration de base de données.

---

## 🔧 Étape 5 : Vérifier la Connexion à l'API

### Tester depuis le navigateur

1. Ouvrir les **Outils de développement** (F12)
2. Aller dans l'onglet **Console**
3. Vérifier qu'il n'y a pas d'erreurs de connexion

### Tester manuellement

Dans la console du navigateur (F12), tapez :
```javascript
fetch('https://fabrication.laplume-artisanale.tn/health')
  .then(r => r.json())
  .then(console.log)
```

**Doit retourner** : `{status: "OK", timestamp: "..."}`

---

## 🎨 Fonctionnalités Disponibles

Selon votre rôle, vous aurez accès à :

### 👨‍💼 Admin / Chef Production
- Dashboard global
- Gestion des OF (Ordres de Fabrication)
- Planning de production
- Gestion des stocks
- Rapports et statistiques

### 👷 Tisseur
- Dashboard personnel
- Liste des OF assignés
- Suivi de production
- Scan QR Code

### 📦 Magasinier
- Gestion des stocks (MP/PF)
- Transferts
- Inventaires

---

## 🐛 Dépannage

### Erreur "Cannot find module"

```powershell
# Supprimer node_modules et réinstaller
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Erreur de connexion à l'API

1. **Vérifier le fichier `.env`** :
   ```env
   REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
   ```

2. **Vérifier que l'API est accessible** :
   ```powershell
   curl.exe https://fabrication.laplume-artisanale.tn/health
   ```

3. **Vérifier CORS** : L'API doit autoriser `http://localhost:3000` (déjà configuré)

### Port 3000 déjà utilisé

```powershell
# Changer le port (dans .env)
PORT=3001
```

Puis redémarrer : `npm start`

---

## 📦 Alternative : Déployer le Frontend sur le VPS

Si vous voulez déployer le frontend aussi sur le VPS :

### 1. Build de production

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"
npm run build
```

### 2. Transférer le dossier `build` sur le VPS

### 3. Configurer Nginx pour servir le frontend

Mais pour le développement, il est plus simple de travailler en local.

---

## 🎯 Résumé

1. ✅ **Installer** : `npm install` dans `frontend/`
2. ✅ **Configurer** : Créer `.env` avec `REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api`
3. ✅ **Lancer** : `npm start`
4. ✅ **Utiliser** : Ouvrir `http://localhost:3000` dans le navigateur

---

## 💡 Avantages du Développement Local

- ✅ **Rapide** : Pas besoin de transférer les fichiers à chaque modification
- ✅ **Hot Reload** : Les changements s'appliquent automatiquement
- ✅ **Debug facile** : Outils de développement du navigateur
- ✅ **Pas de build** : Développement en temps réel

---

## 🚀 C'est Prêt !

Votre frontend local se connecte maintenant à l'API déployée sur le VPS. Vous pouvez développer et tester votre application en local tout en utilisant les données de production.

