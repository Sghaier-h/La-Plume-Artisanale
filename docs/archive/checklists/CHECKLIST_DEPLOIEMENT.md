# 📋 CHECKLIST DE DÉPLOIEMENT - ERP LA PLUME ARTISANALE

## ✅ FONCTIONNALITÉS CRITIQUES À VÉRIFIER

### 1. Base de Données ✅
- [x] Table `parametres_systeme` créée
- [x] Table `res_users` créée
- [x] Table `societes` créée
- [x] Table `etablissements` créée
- [x] Script d'initialisation complet
- [ ] Exécuter tous les scripts SQL dans l'ordre
- [ ] Vérifier les contraintes et index

### 2. Backend ✅
- [x] Serveur Express configuré
- [x] Authentification JWT
- [x] Routes paramétrage complètes
- [x] Routes multi-société
- [x] Routes commerciales
- [x] Middleware de sécurité
- [x] Gestion des erreurs
- [x] Rate limiting
- [ ] Tester toutes les routes API

### 3. Frontend ✅
- [x] Authentification complète
- [x] Dashboards opérateurs
- [x] Navigation avec permissions
- [x] Page de paramétrage complète
- [x] Multi-société (CompanySwitcher)
- [x] Design moderne et responsive
- [ ] Tester tous les flux utilisateur

### 4. Modules Principaux

#### 4.1 Vente ✅
- [x] Gestion des devis
- [x] Gestion des commandes
- [x] Gestion des clients
- [ ] Catalogue produits avec quantité
- [ ] Panier de commande

#### 4.2 Production ✅
- [x] Ordres de fabrication (OF)
- [x] Bill of Material (BOM)
- [x] Suivi de production
- [x] Planning Gantt
- [ ] Pointage opérateurs

#### 4.3 Stock ✅
- [x] Gestion des articles
- [x] Inventaire
- [x] Mouvements de stock
- [x] Alertes stock
- [ ] Multi-entrepôts

#### 4.4 Qualité ✅
- [x] Contrôles qualité
- [x] Non-conformités
- [x] Rapports qualité
- [ ] Tracabilité complète

#### 4.5 Paramétrage ✅
- [x] Page complète avec 16 onglets
- [x] Sauvegarde des paramètres
- [x] Backend complet
- [ ] Valeurs par défaut

### 5. Sécurité ✅
- [x] Authentification JWT
- [x] Middleware d'autorisation
- [x] Rate limiting
- [x] Validation des entrées
- [x] Protection CORS
- [ ] Chiffrement des mots de passe
- [ ] HTTPS en production

### 6. Déploiement

#### 6.1 Prérequis
- [ ] Node.js 18+ installé
- [ ] PostgreSQL 12+ installé
- [ ] Base de données créée
- [ ] Variables d'environnement configurées

#### 6.2 Installation
```powershell
# 1. Cloner le projet (si nécessaire)
# 2. Installer les dépendances backend
cd backend
npm install

# 3. Installer les dépendances frontend
cd ../frontend
npm install

# 4. Configurer les variables d'environnement
# .env dans backend/
# .env dans frontend/
```

#### 6.3 Initialisation Base de Données
```sql
-- Exécuter dans l'ordre:
1. 00_INITIALISATION_COMPLETE.sql
2. 01_base_et_securite.sql
3. 02_production_et_qualite.sql
4. ... (autres scripts selon besoins)
```

#### 6.4 Démarrage
```powershell
# Option 1: Script automatique
.\DEMARRAGE_RAPIDE.ps1

# Option 2: Manuel
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### 7. Tests Critiques

#### 7.1 Authentification
- [ ] Login avec compte admin
- [ ] Login avec compte opérateur
- [ ] Vérification des permissions
- [ ] Redirection vers dashboard approprié

#### 7.2 Paramétrage
- [ ] Chargement des paramètres
- [ ] Modification des paramètres
- [ ] Sauvegarde des paramètres
- [ ] Rechargement après sauvegarde

#### 7.3 Multi-Société
- [ ] Création d'une société
- [ ] Sélection de société active
- [ ] Switch entre sociétés
- [ ] Vérification du header X-Active-Company-Id

#### 7.4 Dashboard Opérateurs
- [ ] Dashboard tisseur accessible
- [ ] Dashboard magasinier accessible
- [ ] Dashboard chef production accessible
- [ ] Menu gauche affiche seulement dashboards attribués

### 8. Performance
- [ ] Temps de chargement acceptable (< 3s)
- [ ] Cache activé
- [ ] Requêtes SQL optimisées
- [ ] Images optimisées

### 9. Documentation
- [ ] README principal
- [ ] Guide d'installation
- [ ] Guide d'utilisation
- [ ] Documentation API

## 🚀 COMMANDES RAPIDES

### Démarrer le système
```powershell
.\DEMARRAGE_RAPIDE.ps1
```

### Arrêter le système
```powershell
# Fermer les fenêtres PowerShell des serveurs
# Ou tuer les processus:
Stop-Process -Name node -Force
```

### Réinitialiser la base de données
```sql
-- Supprimer toutes les tables (ATTENTION!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;

-- Réexécuter les scripts d'initialisation
```

### Vérifier les logs
```powershell
# Backend: Voir dans la fenêtre PowerShell du backend
# Frontend: Voir dans la fenêtre PowerShell du frontend
# Base de données: Voir dans pgAdmin ou psql
```

## 📞 SUPPORT

En cas de problème:
1. Vérifier les logs des serveurs
2. Vérifier la connexion à la base de données
3. Vérifier les variables d'environnement
4. Vérifier les ports (5000 backend, 3000 frontend)

## ✅ VALIDATION FINALE

Avant de considérer le système prêt:
- [ ] Toutes les fonctionnalités critiques fonctionnent
- [ ] Aucune erreur critique dans les logs
- [ ] Les utilisateurs peuvent se connecter
- [ ] Les dashboards sont accessibles
- [ ] Les paramètres peuvent être modifiés
- [ ] Les données sont sauvegardées correctement
