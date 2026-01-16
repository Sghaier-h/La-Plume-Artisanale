# 🚀 GUIDE D'ACCÈS RAPIDE - APPLICATION ERP

## ✅ APPLICATION DÉMARRÉE !

Les serveurs backend et frontend ont été démarrés dans des fenêtres PowerShell séparées.

## 🌐 URLs D'ACCÈS

### 🖥️ Interface Principale
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000/api

### 🔐 Connexion (Mode Mock)
- **Email** : `admin@system.local`
- **Mot de passe** : `Admin123!`

### 📱 Pages Tablettes (Accessibles après connexion)

1. **Tablette Tisseur**
   - URL : http://localhost:3000/tablette/tisseur
   - Fonctionnalités : Tâches en cours, saisie production, scan QR

2. **Tablette Magasinier MP**
   - URL : http://localhost:3000/tablette/magasinier
   - Fonctionnalités : Préparations MP, scan QR matières premières

3. **Tablette Coupeur**
   - URL : http://localhost:3000/tablette/coupeur
   - Fonctionnalités : OF prêts à couper, saisie quantités

4. **Tablette Qualité**
   - URL : http://localhost:3000/tablette/qualite
   - Fonctionnalités : Contrôles qualité, photos non-conformités

### 🎯 Dashboard Responsable
- URL : http://localhost:3000/responsable-dashboard
- Fonctionnalités : Vue globale production, attribution tâches, opérateurs en ligne

## 📋 Tous les Modules Disponibles

### Modules Principaux
- **Dashboard** : http://localhost:3000/dashboard
- **Articles** : http://localhost:3000/articles
- **Catalogue Articles** : http://localhost:3000/articles-catalogue
- **Clients** : http://localhost:3000/clients
- **Commandes** : http://localhost:3000/commandes
- **Machines** : http://localhost:3000/machines
- **Ordres de Fabrication** : http://localhost:3000/of
- **Planning Drag & Drop** : http://localhost:3000/planning-dragdrop

### Modules Production
- **Suivi Fabrication** : http://localhost:3000/suivi-fabrication
- **Matières Premières** : http://localhost:3000/matieres-premieres
- **Stock Multi-Entrepôts** : http://localhost:3000/stock-multi-entrepots
- **Traçabilité Lots** : http://localhost:3000/tracabilite-lots

### Modules Qualité
- **Qualité Avancée** : http://localhost:3000/qualite-avancee

### Modules Paramétrage
- **Paramétrage** : http://localhost:3000/parametrage
- **Paramètres Catalogue** : http://localhost:3000/parametres-catalogue
- **Fournisseurs** : http://localhost:3000/fournisseurs
- **Soustraitants** : http://localhost:3000/soustraitants

### Modules Communication (Nouveau !)
- **Dashboard Responsable** : http://localhost:3000/responsable-dashboard
- **Tâches** : Accessible via API `/api/taches`
- **Notifications** : Accessible via API `/api/notifications`
- **Messages** : Accessible via API `/api/messages`

### Modules Documents
- **Documents** : http://localhost:3000/documents
- Export PDF : `/api/documents/of/:id/dossier-fabrication`
- Export Excel : `/api/documents/of/export/excel`

## 🔧 Commandes Utiles

### Arrêter les serveurs
- Appuyer sur `Ctrl+C` dans chaque fenêtre PowerShell

### Redémarrer
```powershell
cd "d:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\demarrer-application.ps1
```

### Vérifier les logs
- Backend : Fenêtre PowerShell avec titre "BACKEND - Port 5000"
- Frontend : Fenêtre PowerShell avec titre "FRONTEND - Port 3000"

## 📱 Applications Natives (Pour plus tard)

Une fois les APK générés avec Capacitor :

1. Installer l'APK sur la tablette
2. Configurer l'URL de l'API dans l'application
3. Les mêmes pages seront disponibles en mode natif

### Générer APK Android
```powershell
cd "d:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npx cap open android
# Dans Android Studio : Build > Generate Signed Bundle / APK
```

## 🎯 Fonctionnalités Disponibles

### ✅ Module 13 : Communication et Attribution des Tâches
- Dashboard Responsable avec vue globale
- Attribution tâches en temps réel
- Notifications WebSocket
- Messagerie responsable → opérateurs
- Vues personnalisées par poste
- Workflow automatique (chaîne production)

### ✅ Tous les Modules ERP
- Catalogue articles avec BOM
- Paramètres catalogue (dimensions, couleurs, finitions)
- Stock multi-entrepôts
- Traçabilité lots QR codes
- Qualité avancée
- Génération documents PDF/Excel
- Planning drag & drop

## 🚀 Prêt à Utiliser !

**L'application est maintenant accessible à :**
- http://localhost:3000

**Connectez-vous avec :**
- Email : `admin@system.local`
- Mot de passe : `Admin123!`

Enjoy ! 🎉
