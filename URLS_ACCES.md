# 🌐 URLs D'ACCÈS - APPLICATION ERP

## 🚀 APPLICATION DÉMARRÉE

### Accès Principal
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000/api
- **Health Check** : http://localhost:5000/health

### 🔐 Connexion
**Email** : `admin@system.local`  
**Mot de passe** : `Admin123!`

---

## 📱 PAGES TABLETTES (Module 13)

1. **Tablette Tisseur**
   ```
   http://localhost:3000/tablette/tisseur
   ```
   - Tâches en cours
   - Saisie production
   - Scan QR codes
   - Prochaines tâches

2. **Tablette Magasinier MP**
   ```
   http://localhost:3000/tablette/magasinier
   ```
   - Préparations MP
   - Scan QR matières premières
   - Validation préparation

3. **Tablette Coupeur**
   ```
   http://localhost:3000/tablette/coupeur
   ```
   - OF prêts à couper
   - Scan QR OF
   - Saisie quantités

4. **Tablette Qualité**
   ```
   http://localhost:3000/tablette/qualite
   ```
   - Contrôles qualité
   - Photos non-conformités
   - Validation

---

## 🎯 MODULES PRINCIPAUX

### Production
- Dashboard : http://localhost:3000/dashboard
- Dashboard Responsable : http://localhost:3000/responsable-dashboard
- Suivi Fabrication : http://localhost:3000/suivi-fabrication
- Planning Drag & Drop : http://localhost:3000/planning-dragdrop

### Articles & Catalogue
- Articles : http://localhost:3000/articles
- Catalogue Articles : http://localhost:3000/articles-catalogue
- Paramètres Catalogue : http://localhost:3000/parametres-catalogue

### Clients & Commandes
- Clients : http://localhost:3000/clients
- Commandes : http://localhost:3000/commandes
- Ordres de Fabrication : http://localhost:3000/of

### Stock & Traçabilité
- Matières Premières : http://localhost:3000/matieres-premieres
- Stock Multi-Entrepôts : http://localhost:3000/stock-multi-entrepots
- Traçabilité Lots : http://localhost:3000/tracabilite-lots

### Qualité
- Qualité Avancée : http://localhost:3000/qualite-avancee

### Paramétrage
- Paramétrage : http://localhost:3000/parametrage
- Fournisseurs : http://localhost:3000/fournisseurs
- Soustraitants : http://localhost:3000/soustraitants
- Machines : http://localhost:3000/machines

### Documents
- Documents : http://localhost:3000/documents

---

## 🔌 API ENDPOINTS

### Communication & Tâches (Module 13)
```
GET    /api/taches
GET    /api/taches/mes-taches
GET    /api/taches/poste/:poste
POST   /api/taches
POST   /api/taches/:id/assigner
POST   /api/taches/:id/demarrer
POST   /api/taches/:id/terminer
POST   /api/taches/:id/pause

GET    /api/notifications
GET    /api/notifications/non-lues
PUT    /api/notifications/:id/lue
PUT    /api/notifications/lire-toutes

POST   /api/messages
GET    /api/messages
PUT    /api/messages/:id/lu
```

### Autres Endpoints
```
GET    /api/dashboard
GET    /api/articles
GET    /api/clients
GET    /api/commandes
GET    /api/of
GET    /api/machines
... (voir documentation complète)
```

---

## 📱 Applications Natives (À venir)

Une fois les APK générés :
- Installation sur tablettes Android
- Mode kiosk (plein écran)
- Accès natif caméra/Bluetooth
- Notifications push natives

---

## 🎯 Accès Rapide Recommandé

1. **Se connecter** : http://localhost:3000/login
   - Email : `admin@system.local`
   - Mot de passe : `Admin123!`

2. **Voir Dashboard Responsable** : http://localhost:3000/responsable-dashboard

3. **Tester Pages Tablettes** :
   - http://localhost:3000/tablette/tisseur
   - http://localhost:3000/tablette/magasinier
   - http://localhost:3000/tablette/coupeur
   - http://localhost:3000/tablette/qualite

4. **Voir Catalogue Articles** : http://localhost:3000/articles-catalogue

---

## ✅ Tout est prêt !

L'application est démarrée et accessible.  
Les deux fenêtres PowerShell affichent les logs en temps réel.
