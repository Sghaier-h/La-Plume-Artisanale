# 📋 Résumé des Modules - Vue d'Ensemble

Résumé rapide de tous les modules avec leurs tables principales et fonctionnalités frontend.

## 🎯 Modules Principaux

### 1. Module Clients (CRM Enrichi)
**Tables principales :**
- `clients` - Clients/Prospects avec catégories et commerciaux
- `categories_clients` - Catégories (Professionnel/Particulier, Local/Export)
- `types_commerciaux` - Types de commerciaux (Commercial, E-commerce, etc.)
- `adresses_client` - Adresses multiples (facturation/livraison)
- `contacts_client` - Contacts multiples avec contact principal

**Frontend :**
- `Clients.tsx` - Liste, création, modification, filtres
- `ClientDetails.tsx` - Vue détaillée avec onglets (Infos, Adresses, Contacts, Commandes, BL, Factures)

**Fonctionnalités clés :**
- ✅ Client/Prospect automatique selon commandes
- ✅ Devise automatique selon pays
- ✅ Adresses multiples avec principale
- ✅ Contacts multiples avec principal
- ✅ Attribution commercial

---

### 2. Module Ventes
**Tables principales :**
- `devis` - Devis clients
- `lignes_devis` - Lignes de devis
- `commandes` - Commandes clients
- `articles_commande` - Lignes de commande avec personnalisation

**Frontend :**
- `Devis.tsx` - Gestion des devis
- `Commandes.tsx` - Gestion des commandes avec personnalisation
- `CommandeDetails.tsx` - Détails de commande

**Fonctionnalités clés :**
- ✅ Transformation devis → commande
- ✅ Personnalisation (Broderie, Sérigraphie, Autre) avec fichier joint
- ✅ Articles hors catalogue (id_article NULL)
- ✅ Génération automatique des numéros

---

### 3. Module Articles & Catalogue
**Tables principales :**
- `articles_catalogue` - Articles avec génération automatique
- `parametres_modeles` - Modèles de base (articles parents)
- `parametres_types_personnalisation` - Types de personnalisation
- `parametres_dimensions`, `parametres_tissages`, `parametres_finitions`, `parametres_couleurs`

**Frontend :**
- `Articles.tsx` - Gestion des articles avec génération automatique
- `Modeles.tsx` - Gestion des modèles
- `ArticlesCatalogue.tsx`, `CatalogueArticles.tsx` - Affichage catalogue

**Fonctionnalités clés :**
- ✅ Génération automatique des références (commerciale, fabrication)
- ✅ Génération automatique de la couleur article
- ✅ Génération automatique de la description
- ✅ Sélecteurs de couleur multiples (1 à 6)
- ✅ Articles du catalogue par modèle

---

### 4. Module Utilisateurs & Groupes
**Tables principales :**
- `utilisateurs` - Utilisateurs avec groupes et photos
- `groupes` - Groupes (FAB, ATL, COM, SOU)
- `utilisateurs_roles` - Relation utilisateurs ↔ rôles
- `utilisateurs_dashboards` - Relation utilisateurs ↔ dashboards

**Frontend :**
- `Equipe.tsx` - Gestion de l'équipe avec création d'accès
- `Login.tsx` - Connexion

**Fonctionnalités clés :**
- ✅ Attribution de groupes
- ✅ Attribution de dashboards multiples
- ✅ Création d'accès avec email/mot de passe
- ✅ Photos/emojis pour utilisateurs

---

### 5. Module Facturation
**Tables principales :**
- `factures_clients` - Factures avec avoirs
- `lignes_facture` - Lignes de facture
- `paiements_clients` - Paiements des factures

**Frontend :**
- `Facture.tsx` - Gestion des factures
- `Avoir.tsx` - Gestion des avoirs

**Fonctionnalités clés :**
- ✅ Création depuis commande/livraison
- ✅ Suivi des paiements
- ✅ Gestion des avoirs

---

### 6. Module Livraisons
**Tables principales :**
- `livraisons` - Bons de livraison
- `lignes_livraison` - Lignes de livraison avec lots

**Frontend :**
- `BonLivraison.tsx` - Gestion des bons de livraison

**Fonctionnalités clés :**
- ✅ Création depuis commande
- ✅ Suivi des lots
- ✅ Gestion des quantités livrées

---

## 🔗 Relations Principales

```
clients (1) ──< (N) commandes
clients (1) ──< (N) adresses_client
clients (1) ──< (N) contacts_client
clients (1) ──< (N) factures_clients

commandes (1) ──< (N) articles_commande
articles_commande (N) ──> (1) articles_catalogue [NULL autorisé]
articles_catalogue (N) ──> (1) parametres_modeles

utilisateurs (N) ──< (N) utilisateurs_dashboards
utilisateurs (N) ──> (1) groupes
```

---

## 📊 Statistiques

- **Tables principales** : ~30 tables
- **Modules documentés** : 6 modules principaux
- **Pages frontend** : ~20 pages
- **Relations** : ~50 relations clés

---

**Pour plus de détails, consultez** : `DOCUMENTATION_MODULES.md`
