# 🚀 DÉMARRAGE RAPIDE STAGING

## ✅ Configuration Complète

L'environnement staging est maintenant configuré et prêt à être utilisé !

## 📋 Fichiers Créés

### Scripts PowerShell
- ✅ `scripts/staging-setup.ps1` - Configuration initiale
- ✅ `scripts/apply-sql-staging.ps1` - Application scripts SQL
- ✅ `scripts/start-staging.ps1` - Démarrage serveurs
- ✅ `scripts/stop-staging.ps1` - Arrêt serveurs
- ✅ `scripts/init-staging-complete.ps1` - Installation complète automatique

### Fichiers de Configuration
- ✅ `backend/env.staging.example` - Configuration backend staging
- ✅ `frontend/env.staging.example` - Configuration frontend staging

### Documentation
- ✅ `STAGING_README.md` - Guide complet staging

## 🚀 Démarrage en 3 Étapes

### Option 1: Installation Automatique (Recommandé)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\scripts\init-staging-complete.ps1
```

Ce script fait tout automatiquement !

### Option 2: Installation Manuelle

#### Étape 1: Configuration
```powershell
.\scripts\staging-setup.ps1
```

#### Étape 2: Application SQL
```powershell
.\scripts\apply-sql-staging.ps1
```

#### Étape 3: Démarrage
```powershell
.\scripts\start-staging.ps1
```

## 📊 Configuration Base de Données

**Base de données staging** : `fouta_erp_staging`

Le script vous demandera le mot de passe PostgreSQL lors de l'exécution.

## 🌐 URLs

Une fois démarré :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000

## ✅ Vérification

Après le démarrage, vous pouvez :
1. Accéder à http://localhost:3000
2. Tester les endpoints API
3. Utiliser toutes les fonctionnalités en mode staging

## 🔧 Configuration Personnalisée

Si vous devez modifier la configuration :
1. Éditez `backend/env.staging.example` ou `frontend/env.staging.example`
2. Recopiez vers `backend/.env` ou `frontend/.env`
3. Redémarrez les serveurs

## 📝 Notes

- **Mode Mock Auth** : Activé en staging (pas besoin de vraie authentification)
- **Base de données** : Sépare de la production
- **Logs** : Mode debug activé pour le développement

## 🆘 Problèmes ?

Consultez `STAGING_README.md` pour le guide complet et le dépannage.

---

**Prêt à démarrer ! 🚀**
