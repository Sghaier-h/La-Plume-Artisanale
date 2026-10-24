# 🚀 Guide de Déploiement sur le Serveur

## 📅 Date
**Date** : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---

## ✅ STATUT : SYSTÈME VÉRIFIÉ ET PRÊT

**Tous les fichiers ont été vérifiés et sont prêts pour le déploiement.** ✅

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT

### ✅ Code Backend
- [x] **4 Helpers créés** : `validations.helper.js`, `error.helper.js`, `pagination.helper.js`, `audit.helper.js`
- [x] **5 Contrôleurs principaux mis à jour** : clients, commandes, of, devis, factures
- [x] **Validations métier** : Dates, statuts, intégrité référentielle
- [x] **Gestion erreurs standardisée** : Messages utilisateur-friendly
- [x] **Pagination** : Clients, Commandes, OF
- [x] **Traçage automatique** : created_by/updated_by dans 8 contrôleurs
- [x] **Aucune erreur de syntaxe** : Tous les fichiers vérifiés

### ✅ Base de Données
- [x] **Script SQL d'index créé** : `add_missing_indexes.sql`
- [x] **Script SQL corrigé** : `id_bl` au lieu de `id_bon_livraison`
- [x] **Script prêt à exécuter** : Vérifications colonnes incluses

### ✅ Documentation
- [x] **Swagger/OpenAPI créé** : `backend/docs/swagger.yaml`
- [x] **Configuration activée** : `server.js` avec IIFE async
- [x] **Dépendances ajoutées** : `package.json` mis à jour

---

## 🚀 ÉTAPES DE DÉPLOIEMENT

### 1. Connecter au Serveur

```bash
ssh ubuntu@137.74.40.191
# ou
ssh ubuntu@fabrication.laplume-artisanale.tn
```

### 2. Aller dans le Répertoire du Projet

```bash
cd /opt/fouta-erp
# ou le chemin où se trouve votre projet
```

### 3. Mettre à Jour le Code (Git Pull)

```bash
# Sauvegarder les fichiers déployés (frontend)
cp -r frontend/build /tmp/frontend-build-backup

# Mettre à jour le code
git pull origin main
# ou
git pull origin master

# Restaurer le build frontend si nécessaire
# cp -r /tmp/frontend-build-backup/* frontend/build/
```

### 4. Installer les Nouvelles Dépendances

```bash
cd backend
npm install
```

**Dépendances à installer :**
- `swagger-ui-express` (déjà dans package.json)
- `yamljs` (déjà dans package.json)

### 5. Exécuter le Script SQL d'Index (si pas déjà fait)

```bash
# Option 1 : Via psql (recommandé)
psql -U $DB_USER -d $DB_NAME -f backend/database/add_missing_indexes.sql

# Option 2 : Via pgAdmin (interface graphique)
# Ouvrir pgAdmin > Connexion > Query Tool > Copier/coller le contenu du fichier > Exécuter

# Option 3 : Via SSH direct
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f backend/database/add_missing_indexes.sql
```

**Note :** Si les index sont déjà créés, vous verrez des messages `NOTICE: relation "idx_..." already exists, skipping`. C'est normal.

### 6. Vérifier la Configuration

```bash
# Vérifier que .env contient les bonnes valeurs
cd backend
cat .env | grep -E "DB_|NODE_ENV|FRONTEND_URL"

# Si nécessaire, éditer .env
nano .env
```

### 7. Redémarrer le Serveur Backend

```bash
# Redémarrer PM2
pm2 restart fouta-api

# Vérifier les logs
pm2 logs fouta-api --lines 50

# Vérifier le statut
pm2 status
```

### 8. Vérifier la Documentation Swagger

Ouvrir dans un navigateur :
```
https://fabrication.laplume-artisanale.tn/api-docs
```

Vous devriez voir l'interface Swagger avec la documentation de l'API.

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### 1. Vérifier que le Serveur Démarre

```bash
pm2 logs fouta-api --lines 20
```

**Rechercher :**
- ✅ `✅ Documentation Swagger disponible sur /api-docs` (si dépendances installées)
- ✅ `Server running on port 5000` (ou le port configuré)
- ❌ Pas d'erreurs critiques

### 2. Tester les Endpoints Principaux

```bash
# Test de santé
curl https://fabrication.laplume-artisanale.tn/api/health

# Test d'authentification
curl -X POST https://fabrication.laplume-artisanale.tn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 3. Vérifier Swagger

Ouvrir dans un navigateur :
```
https://fabrication.laplume-artisanale.tn/api-docs
```

**Si Swagger ne s'affiche pas :**
- Vérifier les logs PM2 pour voir si les dépendances sont installées
- Installer manuellement : `cd backend && npm install swagger-ui-express yamljs`
- Redémarrer : `pm2 restart fouta-api`

---

## ⚠️ PROBLÈMES POTENTIELS ET SOLUTIONS

### Problème 1 : Dépendances non installées

**Symptôme :** Pas de message Swagger dans les logs

**Solution :**
```bash
cd /opt/fouta-erp/backend
npm install swagger-ui-express yamljs
pm2 restart fouta-api
```

### Problème 2 : Erreur "Cannot find module"

**Symptôme :** Erreur `Cannot find module 'swagger-ui-express'`

**Solution :**
```bash
cd /opt/fouta-erp/backend
rm -rf node_modules package-lock.json
npm install
pm2 restart fouta-api
```

### Problème 3 : Erreur SQL lors de l'exécution du script d'index

**Symptôme :** `ERROR: column "id_bon_livraison" does not exist`

**Solution :** Le script a été corrigé. Utiliser `add_missing_indexes.sql` (version corrigée).

### Problème 4 : Index déjà existants

**Symptôme :** Messages `NOTICE: relation "idx_..." already exists`

**Solution :** C'est normal. Les index sont déjà créés. Continuer.

---

## 📊 RÉSUMÉ DES MODIFICATIONS

### Fichiers Créés/Modifiés

#### Backend - Utils
- ✅ `backend/src/utils/validations.helper.js` (créé)
- ✅ `backend/src/utils/error.helper.js` (créé)
- ✅ `backend/src/utils/pagination.helper.js` (créé)
- ✅ `backend/src/utils/audit.helper.js` (déjà existant, vérifié)

#### Backend - Contrôleurs
- ✅ `backend/src/controllers/clients.controller.js` (mis à jour)
- ✅ `backend/src/controllers/commandes.controller.js` (mis à jour)
- ✅ `backend/src/controllers/of.controller.js` (mis à jour)
- ✅ `backend/src/controllers/devis.controller.js` (mis à jour)
- ✅ `backend/src/controllers/factures.controller.js` (mis à jour)

#### Backend - Configuration
- ✅ `backend/src/server.js` (Swagger activé)
- ✅ `backend/package.json` (dépendances ajoutées)

#### Base de Données
- ✅ `backend/database/add_missing_indexes.sql` (créé et corrigé)

#### Documentation
- ✅ `backend/docs/swagger.yaml` (créé)
- ✅ `backend/docs/OPTIMISATION_JOIN.md` (créé)
- ✅ `docs/VERIFICATION_SYSTEME_COMPLETE.md` (créé)
- ✅ `docs/GUIDE_DEPLOIEMENT_SERVEUR.md` (ce fichier)

---

## ✅ CHECKLIST POST-DÉPLOIEMENT

Après le déploiement, vérifier :

- [ ] Le serveur backend démarre sans erreur
- [ ] Swagger disponible sur `/api-docs`
- [ ] Les endpoints principaux fonctionnent (clients, commandes, OF)
- [ ] Aucune erreur dans les logs PM2
- [ ] Les validations métier fonctionnent (tester création OF avec dates incorrectes)
- [ ] Les messages d'erreur sont standardisés (tester erreur 404, 400)
- [ ] La pagination fonctionne (GET /api/clients?page=1&limit=10)

---

## 🎯 CONCLUSION

**Le système est prêt pour le déploiement !** 🚀

Suivre les étapes ci-dessus dans l'ordre pour déployer en toute sécurité.

**En cas de problème, consulter les logs PM2 :**
```bash
pm2 logs fouta-api --lines 100
```

**Guide créé le :** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
