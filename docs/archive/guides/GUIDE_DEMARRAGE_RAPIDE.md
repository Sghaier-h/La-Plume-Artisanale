# 🚀 GUIDE DE DÉMARRAGE RAPIDE - ERP LA PLUME ARTISANALE

## ⚡ DÉMARRAGE EN 5 MINUTES

### Prérequis
- ✅ Node.js 18+ installé
- ✅ PostgreSQL 12+ installé et démarré
- ✅ Base de données `ERP_La_Plume` créée

### Étapes rapides

#### 1. Initialiser la base de données (PREMIER LANCEMENT UNIQUEMENT)
```sql
-- Connectez-vous à PostgreSQL et exécutez:
\c ERP_La_Plume

-- Exécutez le script d'initialisation:
\i database/00_INITIALISATION_COMPLETE.sql

-- Puis les autres scripts selon vos besoins:
\i database/01_base_et_securite.sql
\i database/02_production_et_qualite.sql
-- etc.
```

#### 2. Configuration des variables d'environnement

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_ultra_securise
USE_MOCK_AUTH=true
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### 3. Installation des dépendances

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

#### 4. Démarrage automatique (RECOMMANDÉ)
```powershell
# Depuis la racine du projet:
.\DEMARRAGE_RAPIDE.ps1
```

#### 5. Démarrage manuel

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

### 🎯 Accès au système

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### 🔐 Comptes de test

**Administrateur:**
- Email: `admin@system.local`
- Mot de passe: `Admin123!`

**Opérateur (Tisseur):**
- Email: `tisseur@entreprise.local`
- Mot de passe: `User123!`

**Chef Production:**
- Email: `chef.production@entreprise.local`
- Mot de passe: `User123!`

## 📋 FONCTIONNALITÉS DISPONIBLES

### ✅ Modules Opérationnels

1. **Authentification**
   - ✅ Login/Logout
   - ✅ JWT tokens
   - ✅ Gestion des permissions
   - ✅ Redirection par rôle

2. **Dashboards**
   - ✅ Dashboard Administrateur
   - ✅ Dashboard Tisseur
   - ✅ Dashboard Magasinier MP
   - ✅ Dashboard Chef Production
   - ✅ Dashboard Contrôle Central
   - ✅ Dashboard Post Coupe
   - ✅ Dashboard Chef Atelier
   - ✅ Dashboard GPAO

3. **Paramétrage**
   - ✅ Page complète avec 16 onglets
   - ✅ Général, Société, Utilisateurs
   - ✅ Sécurité, Email, Notifications
   - ✅ Vente, Production, Stock, Finance
   - ✅ Multi-Société, Devises, E-commerce
   - ✅ Intégrations, Import/Export, Maintenance

4. **Multi-Société**
   - ✅ Gestion des sociétés
   - ✅ Sélecteur de société active
   - ✅ Header automatique dans les requêtes API

5. **Vente**
   - ✅ Gestion des clients
   - ✅ Gestion des commandes
   - ✅ Gestion des devis
   - ✅ Factures et avoirs

6. **Production**
   - ✅ Ordres de fabrication (OF)
   - ✅ Bill of Material (BOM)
   - ✅ Suivi de production
   - ✅ Planning Gantt

7. **Stock**
   - ✅ Gestion des articles
   - ✅ Inventaire
   - ✅ Mouvements de stock
   - ✅ Alertes stock

8. **Qualité**
   - ✅ Contrôles qualité
   - ✅ Non-conformités
   - ✅ Rapports qualité

9. **Commercial**
   - ✅ Gestion des devises
   - ✅ Gestion des tarifs
   - ✅ Tableau de bord commercial
   - ✅ Comptes clients

## 🔧 DÉPANNAGE

### Port 5000 déjà utilisé
```powershell
# Trouver et arrêter le processus:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Ou utiliser le script:
.\ARRETER_PROCESSUS_PORT_5000.ps1
```

### Port 3000 déjà utilisé
```powershell
# Trouver et arrêter le processus:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est démarré
- Vérifier les identifiants dans `.env`
- Vérifier que la base `ERP_La_Plume` existe

### Erreur "Cannot find module"
```powershell
# Réinstaller les dépendances:
cd backend
rm -r node_modules
npm install

cd ../frontend
rm -r node_modules
npm install
```

## 📊 VÉRIFICATION RAPIDE

### Tester que tout fonctionne:

1. **Backend:**
   ```powershell
   curl http://localhost:5000/api/health
   # Devrait retourner: {"status":"OK","timestamp":"..."}
   ```

2. **Frontend:**
   - Ouvrir http://localhost:3000
   - Tester la connexion avec un compte
   - Vérifier que le dashboard s'affiche

3. **Base de données:**
   ```sql
   SELECT COUNT(*) FROM parametres_systeme;
   -- Devrait retourner un nombre > 0
   ```

## 🎯 PROCHAINES ÉTAPES

Après le démarrage initial:

1. **Configurer les paramètres système**
   - Aller dans Paramétrage → Général
   - Configurer la langue, timezone, formats
   - Configurer la société

2. **Créer les utilisateurs**
   - Aller dans Paramétrage → Utilisateurs
   - Créer les comptes nécessaires
   - Attribuer les dashboards

3. **Configurer les sociétés**
   - Aller dans Multi-Société
   - Créer les sociétés
   - Configurer les établissements

4. **Configurer l'email**
   - Aller dans Paramétrage → Email
   - Configurer le serveur SMTP
   - Tester l'envoi d'email

5. **Configurer les notifications**
   - Aller dans Paramétrage → Notifications
   - Activer les notifications souhaitées

## ✅ CHECKLIST DE VALIDATION

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Connexion à la base de données OK
- [ ] Page de login accessible
- [ ] Connexion avec compte admin OK
- [ ] Dashboard admin s'affiche
- [ ] Menu de navigation visible
- [ ] Page de paramétrage accessible
- [ ] Multi-société fonctionnel
- [ ] Aucune erreur dans la console

## 📞 SUPPORT

En cas de problème:
1. Vérifier les logs dans les fenêtres PowerShell
2. Vérifier la console du navigateur (F12)
3. Vérifier les logs PostgreSQL
4. Consulter `CHECKLIST_DEPLOIEMENT.md` pour plus de détails

---

**✨ Le système est prêt à être utilisé!**
