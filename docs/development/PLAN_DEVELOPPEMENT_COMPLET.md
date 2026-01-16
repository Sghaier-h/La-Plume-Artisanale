# 📋 Plan de Développement Complet - ERP La Plume Artisanale

## 🎯 Vue d'ensemble

Ce document organise le développement de l'application ERP selon le cahier des charges fourni, en suivant un ordre logique et progressif.

**Objectif :** Développer l'application complète localement sur PC avant déploiement sur serveur.

---

## 📊 Architecture Technique

### Stack Technologique

| Composant | Technologie | Version |
|-----------|------------|---------|
| Frontend | React.js + TypeScript | 18.2+ |
| Styling | Tailwind CSS | 3.3+ |
| Backend | Node.js + Express.js | 18+ |
| Base de données | PostgreSQL | 17 |
| ORM | Prisma | Latest |
| Authentification | JWT + bcrypt | - |
| QR Codes | qrcode (npm) | - |
| État global | Zustand | 4.4+ |

### Structure du Projet

```
La-Plume-Artisanale/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration DB, env
│   │   ├── controllers/     # Logique métier par module
│   │   ├── middleware/      # Auth, validation, erreurs
│   │   ├── routes/          # Endpoints API
│   │   ├── services/        # Services métier
│   │   └── utils/           # Helpers, QR generation
│   ├── prisma/
│   │   ├── schema.prisma    # Modèle de données complet
│   │   └── seed.ts          # Données initiales (machines)
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages par module
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Appels API
│   │   └── store/           # État global (Zustand)
│   └── public/
└── database/
    ├── 01_base_et_securite.sql
    ├── 02_production_et_qualite.sql
    ├── 03_flux_et_tracabilite.sql
    └── 04_mobile_devices.sql
```

---

## 🗓️ Phases de Développement

### Phase 1 : Architecture + Authentification (3-4 jours)

**Objectifs :**
- ✅ Configuration Prisma avec schéma de base
- ✅ Système d'authentification JWT
- ✅ Gestion des utilisateurs et rôles
- ✅ Middleware de sécurité

**Tâches :**
1. Initialiser Prisma avec PostgreSQL
2. Créer modèles User, Role, Session
3. Implémenter endpoints auth (login, logout, me)
4. Créer middleware JWT
5. Interface login frontend
6. Gestion des rôles et permissions

**Livrables :**
- ✅ API `/api/auth/*` fonctionnelle
- ✅ Page de connexion React
- ✅ Protection des routes avec JWT
- ✅ Gestion des rôles (ADMIN, COMMERCIAL, CHEF_PRODUCTION, etc.)

---

### Phase 2 : Articles + Nomenclature (3-4 jours)

**Objectifs :**
- ✅ Catalogue des modèles et articles
- ✅ Gestion des nomenclatures (BOM) avec sélecteurs
- ✅ Variantes (couleurs, dimensions)

**Tâches :**
1. Modèles Prisma : Modele, Article, Nomenclature
2. CRUD modèles (ARTHUR, IBIZA, PONCHO, etc.)
3. CRUD articles avec variantes
4. Gestion BOM avec types (CHAINE, SELECTEUR, LISIERE)
5. Interface catalogue frontend
6. Formulaire création article avec BOM

**Livrables :**
- ✅ API `/api/modeles/*`, `/api/articles/*`
- ✅ Page catalogue articles
- ✅ Formulaire création/édition article
- ✅ Gestion nomenclatures avec sélecteurs (S01-S08)

---

### Phase 3 : Clients (1-2 jours)

**Objectifs :**
- ✅ Base clients complète
- ✅ Catégorisation (GROSSISTE, DETAILLANT, EXPORT, PARTICULIER)
- ✅ Conditions commerciales

**Tâches :**
1. Modèle Prisma : Client
2. CRUD clients
3. Interface liste clients
4. Formulaire création/édition client
5. Historique commandes par client

**Livrables :**
- ✅ API `/api/clients/*`
- ✅ Page gestion clients
- ✅ Filtres et recherche

---

### Phase 4 : Commandes (3-4 jours)

**Objectifs :**
- ✅ Création commandes multi-lignes
- ✅ Workflow d'états
- ✅ Génération automatique des OF

**Tâches :**
1. Modèles Prisma : Commande, LigneCommande
2. CRUD commandes
3. Gestion lignes commande
4. Workflow statuts (BROUILLON → CONFIRMEE → EN_PRODUCTION → LIVREE)
5. Génération automatique OF à la confirmation
6. Interface commandes frontend
7. Formulaire création commande avec lignes

**Livrables :**
- ✅ API `/api/commandes/*`
- ✅ Page liste commandes
- ✅ Formulaire création commande
- ✅ Génération automatique OF

---

### Phase 5 : Machines + Sélecteurs (3-4 jours) ⚠️ CRITIQUE

**Objectifs :**
- ✅ Inventaire complet 23 machines
- ✅ Configuration sélecteurs par machine
- ✅ Vérification compatibilité OF ↔ Machine

**Tâches :**
1. Modèles Prisma : Machine, ConfigSelecteurMachine
2. Seed données machines (23 machines)
3. CRUD machines
4. Gestion état sélecteurs (quel fil dans quel sélecteur)
5. Logique compatibilité (nb_selecteurs requis)
6. Interface machines frontend
7. Visualisation config sélecteurs
8. Planning occupation machines

**Livrables :**
- ✅ API `/api/machines/*`
- ✅ Page inventaire machines
- ✅ Configuration sélecteurs par machine
- ✅ Vérification compatibilité OF

---

### Phase 6 : Ordres de Fabrication (4-5 jours)

**Objectifs :**
- ✅ Génération depuis commandes
- ✅ Attribution machines compatibles
- ✅ Configuration sélecteurs par OF
- ✅ Calcul besoins MP

**Tâches :**
1. Modèles Prisma : OrdreFabrication, ConfigOFSelecteur, BesoinMP
2. Génération OF depuis commandes
3. Attribution machine avec vérification compatibilité
4. Configuration sélecteurs OF (copie depuis BOM)
5. Calcul automatique besoins MP
6. Calcul temps production
7. Interface OF frontend
8. Dossier fabrication PDF avec QR codes

**Livrables :**
- ✅ API `/api/of/*`
- ✅ Page liste OF
- ✅ Attribution machine
- ✅ Configuration sélecteurs OF
- ✅ Génération dossier fabrication

---

### Phase 7 : Stock et Matières Premières (4-5 jours)

**Objectifs :**
- ✅ Catalogue MP (fils trame, chaîne)
- ✅ Gestion multi-entrepôts
- ✅ Traçabilité par lots
- ✅ Mouvements stock

**Tâches :**
1. Modèles Prisma : MatierePremiere, LotMatiere, Entrepot, Stock, MouvementStock
2. CRUD matières premières
3. Gestion lots avec QR codes
4. Multi-entrepôts (E1, E2, E3, Usine, Fabrication)
5. Mouvements (entrées, sorties, transferts)
6. Alertes stock minimum
7. Interface stock frontend
8. Génération étiquettes QR codes

**Livrables :**
- ✅ API `/api/matieres/*`, `/api/stock/*`
- ✅ Page catalogue MP
- ✅ Gestion stock multi-entrepôts
- ✅ Traçabilité lots
- ✅ Alertes stock

---

### Phase 8 : Suivi de Production (3-4 jours)

**Objectifs :**
- ✅ Suivi tissage (compteurs, temps, casse)
- ✅ Suivi coupe
- ✅ Suivi qualité (OK, rebut, 2ème choix)
- ✅ Calcul reste à fabriquer

**Tâches :**
1. Modèles Prisma : SuiviTissage, SuiviCoupe, SuiviQualite
2. Enregistrement tissage (compteur début/fin, temps, casse)
3. Enregistrement coupe
4. Enregistrement contrôle qualité
5. Calcul automatique reste à fabriquer
6. Interface suivi production frontend
7. Tableau de bord production

**Livrables :**
- ✅ API `/api/production/*`
- ✅ Interface suivi tissage
- ✅ Interface suivi coupe
- ✅ Interface contrôle qualité
- ✅ Calcul reste à fabriquer

---

### Phase 9 : Sous-traitants (2-3 jours)

**Objectifs :**
- ✅ Base sous-traitants
- ✅ Suivi envois/retours
- ✅ Alertes retard (> 12 jours)

**Tâches :**
1. Modèles Prisma : SousTraitant, MouvementSousTraitant
2. CRUD sous-traitants
3. Enregistrement sorties/retours
4. Calcul reste à retourner
5. Alertes retard
6. Interface sous-traitants frontend

**Livrables :**
- ✅ API `/api/soustraitants/*`
- ✅ Page gestion sous-traitants
- ✅ Suivi en-cours
- ✅ Alertes retard

---

### Phase 10 : Dashboard (2-3 jours)

**Objectifs :**
- ✅ KPIs principaux
- ✅ Graphiques (production, commandes, performance)
- ✅ Exports Excel/PDF

**Tâches :**
1. Calcul KPIs (OF en cours, taux avancement, délai moyen, taux rebut)
2. Graphiques avec Recharts
3. Export Excel (xlsx)
4. Génération PDF rapports
5. Interface dashboard frontend

**Livrables :**
- ✅ API `/api/dashboard/*`
- ✅ Page dashboard avec KPIs
- ✅ Graphiques interactifs
- ✅ Exports Excel/PDF

---

## 📝 Instructions pour Cursor AI

### Template de Prompt pour chaque Module

```
Développe le module [NOM_MODULE] pour l'ERP La Plume Artisanale selon le cahier des charges :

1. BACKEND (Node.js + Express + Prisma) :
   - Créer/modifier le modèle Prisma : [copier spécifications du cahier]
   - Créer les routes API : [copier endpoints du cahier]
   - Implémenter les validations (Zod ou Joi)
   - Gestion des erreurs avec try/catch
   - Respecter l'architecture existante (controllers, services, routes)

2. FRONTEND (React + TypeScript + Tailwind) :
   - Créer la page liste avec DataTable (filtres, pagination, tri)
   - Créer le formulaire création/édition
   - Créer les composants réutilisables nécessaires
   - Implémenter les appels API avec gestion loading/error
   - Utiliser Zustand pour l'état global si nécessaire

3. VALIDATIONS :
   - Valider les données côté backend
   - Messages d'erreur clairs
   - Validation côté frontend (formulaire)

4. TESTS :
   - Tests unitaires pour les fonctions critiques
   - Tests d'intégration pour les endpoints API

Respecter :
- L'architecture existante du projet
- Les conventions de nommage
- Les types TypeScript
- Le style Tailwind CSS
```

---

## ✅ Checklist par Phase

### Checklist Générale par Module

- [ ] Modèle Prisma créé et migré
- [ ] Seed données initiales (si nécessaire)
- [ ] Routes API créées et testées
- [ ] Validations implémentées
- [ ] Gestion erreurs complète
- [ ] Interface liste créée (filtres, pagination)
- [ ] Formulaire CRUD fonctionnel
- [ ] Appels API avec loading/error
- [ ] Tests unitaires passants
- [ ] Documentation API (commentaires)

---

## 🚀 Ordre d'Exécution Recommandé

### Semaine 1 : Fondations
- **Jour 1-2** : Phase 1 (Architecture + Auth)
- **Jour 3-4** : Phase 2 (Articles + Nomenclature)
- **Jour 5** : Phase 3 (Clients)

### Semaine 2 : Commercial et Production
- **Jour 1-3** : Phase 4 (Commandes)
- **Jour 4-5** : Phase 5 (Machines + Sélecteurs)

### Semaine 3 : Production et Stock
- **Jour 1-3** : Phase 6 (Ordres de Fabrication)
- **Jour 4-5** : Phase 7 (Stock et MP)

### Semaine 4 : Suivi et Finalisation
- **Jour 1-2** : Phase 8 (Suivi Production)
- **Jour 3** : Phase 9 (Sous-traitants)
- **Jour 4-5** : Phase 10 (Dashboard)

**Total estimé : 4 semaines (20 jours ouvrables)**

---

## 📚 Ressources et Références

### Fichiers Importants

1. **Cahier des charges** : `Cahier_des_Charges_COMPLET_ERP_LaPlume.docx`
2. **Base de données** : Scripts SQL dans `database/`
3. **Architecture** : `DEVELOPPEMENT_LOCAL_PAS_A_PAS.md`
4. **Paramétrage** : `PARAMETRAGE_INITIAL.md`

### Données Initiales à Créer

1. **23 Machines** : Voir Annexe A du cahier des charges
2. **Types de machines** : CADRE, JACQUARD, ÉPONGE
3. **Modèles produits** : ARTHUR, IBIZA, PONCHO, etc.
4. **Utilisateurs** : Admin, Chef Production, Tisseurs, etc.

---

## 🎯 Prochaines Actions Immédiates

1. ✅ **Vérifier l'environnement de développement** (voir `DEVELOPPEMENT_LOCAL_PAS_A_PAS.md`)
2. ✅ **Initialiser Prisma** avec le schéma de base
3. ✅ **Commencer Phase 1** : Architecture + Authentification
4. ✅ **Créer les données initiales** (machines, modèles)

---

## 📞 Support

Pour chaque phase :
- Consulter le cahier des charges pour les spécifications détaillées
- Utiliser les templates de prompts pour Cursor AI
- Suivre la checklist de validation
- Tester chaque module avant de passer au suivant

---

**🎉 Bon développement !**
