# 🚀 Comment Commencer avec l'Application ERP

## ✅ État Actuel

- ✅ **Backend déployé** : `https://fabrication.laplume-artisanale.tn` (VPS OVH)
- ✅ **Frontend compilé** : Prêt à être utilisé
- ✅ **Application accessible** : `http://localhost:3000` (développement local)

---

## 🎯 Option 1 : Utiliser l'Application en Local (Recommandé pour commencer)

### Étape 1 : Vérifier que l'Application Tourne

```powershell
# Vérifier que npm start est toujours actif
# Si non, lancer :
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

**L'application devrait s'ouvrir automatiquement sur** : `http://localhost:3000`

### Étape 2 : Vérifier la Connexion à l'API

1. **Ouvrir les Outils de développement** (F12 dans Chrome)
2. **Aller dans l'onglet Console**
3. **Vérifier qu'il n'y a pas d'erreurs de connexion**

Si vous voyez des erreurs comme `Failed to fetch` ou `Network error`, vérifier :
- Que le fichier `.env` contient : `REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api`
- Que l'API backend est accessible : `curl.exe https://fabrication.laplume-artisanale.tn/health`

### Étape 3 : Se Connecter

L'application devrait afficher une page de connexion. Utilisez vos identifiants selon votre base de données.

**Comptes par défaut possibles** (selon votre configuration) :
- Admin
- Chef Production
- Tisseur
- Magasinier MP
- etc.

---

## 🌐 Option 2 : Déployer sur le VPS (Pour accès partout)

### Étape 1 : Build de Production

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"

# Créer .env.production si pas déjà fait
@"
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
"@ | Out-File -FilePath .env.production -Encoding utf8

# Build
npm run build
```

**⏱️ Cela prend 2-5 minutes**

### Étape 2 : Déployer sur le VPS

#### Option A : Avec Git (Recommandé)

```powershell
# Sur votre machine
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"

# Si vous utilisez Git
git add .
git commit -m "Application prête pour déploiement"
git push  # Si vous avez un dépôt distant
```

Puis sur le VPS :
```bash
ssh ubuntu@137.74.40.191
cd /opt/fouta-erp
git pull  # Si vous utilisez Git
# Ou suivre le guide DEPLOYER_AVEC_GIT.md
```

#### Option B : Transférer Manuellement

**Via FileZilla** :
1. Connectez-vous au VPS (`137.74.40.191`, utilisateur `ubuntu`, port `22`)
2. Naviguez vers `/opt/fouta-erp/frontend/`
3. Transférez tout le contenu du dossier `build/` (créé par `npm run build`)

**Via SCP** :
```powershell
scp -r "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend\build\*" ubuntu@137.74.40.191:/opt/fouta-erp/frontend/
```

### Étape 3 : Configurer Nginx

Sur le VPS :
```bash
ssh ubuntu@137.74.40.191
sudo nano /etc/nginx/sites-available/fabrication
```

Vérifier que la configuration sert bien le frontend (voir `DEPLOYER_FRONTEND_VPS.md`).

Puis :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Étape 4 : Accéder à l'Application

Ouvrir dans le navigateur : `https://fabrication.laplume-artisanale.tn`

---

## 📋 Checklist de Démarrage

### Pour Développement Local

- [ ] `npm start` actif et application accessible sur `http://localhost:3000`
- [ ] Fichier `.env` créé avec `REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api`
- [ ] Pas d'erreurs dans la console du navigateur (F12)
- [ ] API accessible : `curl.exe https://fabrication.laplume-artisanale.tn/health`
- [ ] Page de connexion s'affiche
- [ ] Peut se connecter avec un compte utilisateur

### Pour Déploiement VPS

- [ ] Frontend buildé : `npm run build` réussi
- [ ] Dossier `build/` transféré sur le VPS dans `/opt/fouta-erp/frontend/`
- [ ] Nginx configuré pour servir le frontend
- [ ] Nginx testé et rechargé
- [ ] Application accessible via `https://fabrication.laplume-artisanale.tn`
- [ ] Peut se connecter avec un compte utilisateur

---

## 🎨 Utiliser l'Application

### Fonctionnalités Disponibles

Selon votre rôle :

#### 👨‍💼 Admin / Chef Production
- **Dashboard** : Vue d'ensemble de la production
- **Production** : Gestion des OF (Ordres de Fabrication)
- **Planning** : Planification de la production
- **Stock** : Gestion des stocks
- **Machines** : Suivi des machines
- **Rapports** : Statistiques et analyses

#### 👷 Tisseur
- **Mes Machines** : Liste des machines assignées
- **Mes OF** : Ordres de fabrication à traiter
- **Début/Fin de Poste** : Gestion des postes
- **Incidents** : Déclaration d'incidents
- **Étiquettes** : Impression d'étiquettes

#### 📦 Magasinier MP
- **Vue Machines** : Préparations par machine
- **Liste OF** : Tous les OF à préparer
- **Stock MP** : Gestion du stock matières premières
- **Transferts** : Gestion des transferts
- **Étiquettes** : Impression d'étiquettes MP

---

## 🔍 Vérifications Importantes

### 1. Vérifier que l'API Fonctionne

```powershell
# Tester l'API
curl.exe https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

### 2. Vérifier la Connexion Frontend → API

Dans le navigateur (F12 → Console) :
```javascript
fetch('https://fabrication.laplume-artisanale.tn/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Doit retourner** : `{status: "OK", timestamp: "..."}`

### 3. Vérifier les Logs Backend

Sur le VPS :
```bash
pm2 logs fouta-api --lines 20
```

**Ne doit pas afficher d'erreurs critiques**

---

## 🚀 Prochaines Étapes

Une fois l'application fonctionnelle :

1. **Tester les fonctionnalités** :
   - Se connecter avec différents rôles
   - Créer un OF
   - Gérer le stock
   - Suivre la production

2. **Configurer les données** :
   - Ajouter des utilisateurs
   - Configurer les machines
   - Importer des données initiales

3. **Personnaliser** :
   - Modifier les thèmes
   - Ajouter votre logo
   - Configurer les notifications

---

## 📚 Guides Disponibles

- `UTILISER_FRONTEND_LOCAL.md` : Guide détaillé du développement local
- `DEPLOYER_FRONTEND_VPS.md` : Guide de déploiement sur le VPS
- `DEPLOYER_AVEC_GIT.md` : Déploiement avec Git
- `DEPLOIEMENT_REUSSI.md` : Résumé du déploiement backend

---

## ❓ Questions Fréquentes

### Q: L'application ne se connecte pas à l'API

**R:** Vérifier :
1. Le fichier `.env` contient `REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api`
2. L'API est accessible : `curl.exe https://fabrication.laplume-artisanale.tn/health`
3. Pas d'erreurs CORS (vérifier la console F12)

### Q: Je vois une page blanche

**R:** Vérifier :
1. La console du navigateur (F12) pour les erreurs
2. Que `npm start` est toujours actif
3. Que l'application compile sans erreurs

### Q: Comment créer des utilisateurs ?

**R:** Les utilisateurs sont gérés via :
1. L'interface admin (une fois connecté en tant qu'admin)
2. Directement dans la base de données PostgreSQL

---

## ✅ C'est Parti !

Votre application ERP est maintenant prête à être utilisée. Choisissez l'option qui vous convient :
- **Développement local** : Rapide pour tester et développer
- **Déploiement VPS** : Pour un accès partout et une utilisation en production

Bonne utilisation ! 🎉

