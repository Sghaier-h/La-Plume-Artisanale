# 📦 Système Complet de Gestion des Articles

## ✅ Système Créé

Un système complet de gestion des modèles (articles parents) et des articles générés, avec gestion du catalogue et génération automatique des références.

## 🏗️ Architecture du Système

### 1. 📋 Base Modèle (Articles Parents)
**Page**: `/modeles`

Les modèles sont les articles parents qui définissent la structure de base pour générer les articles.

#### Fonctionnalités
- ✅ **Création/Modification de modèles** avec formulaire complet
- ✅ **Informations de base** :
  - Code Modèle
  - Désignation
  - Produit (Fouta, Coussin Sac, Echarpe, etc.)
  - Description

- ✅ **Attributs du modèle** :
  - Code Dimensions
  - Type de Tissage
  - Code Type de Tissage
  - Nombre de Couleur
  - Code Nombre de Couleur (U, B, T, Q, C, S)
  - Type de Finition
  - Code Type de Finition
  - Composition Pour Fabrication

- ✅ **Prix** :
  - Prix de Reviens
  - Prix de Vente
  - Prix Frange CAT01 (optionnel)
  - Prix Frange CAT02 (optionnel)

- ✅ **Photo du modèle** :
  - Upload de photo
  - Prévisualisation
  - Stockage de la photo principale

- ✅ **Options** :
  - Appartient au catalogue produit (case à cocher)
  - Modèle actif/inactif

### 2. 📦 Base Article (Articles Générés)
**Page**: `/articles`

Les articles sont générés à partir des modèles avec différentes combinaisons d'attributs.

#### Fonctionnalités
- ✅ **Sélection du modèle** : Choisir un modèle existant
- ✅ **Sélection des couleurs (sélecteurs)** :
  - Code Selecteur 01 à 06 selon le nombre de couleurs
  - Dropdown avec toutes les couleurs disponibles
  - Génération automatique des références lors de la sélection

- ✅ **Références générées automatiquement** :
  - **Référence Commerciale** : Format compact (ex: `AR1020-B02-03`)
  - **Référence Fabrication** : Format avec tirets (ex: `AR1020-B-02-03`)
  - Affichage en temps réel lors de la sélection

- ✅ **Informations complémentaires** :
  - Dimensions
  - Couleur Article (description textuelle)
  - Description Article

- ✅ **Composition pour Production** :
  - Cases à cocher pour indiquer quels sélecteurs sont requis pour la production
  - Stockage de la composition des sélecteurs de couleur
  - Utilisé pour la génération des OF et le suivi de production

- ✅ **Quantités** :
  - Total Commandé
  - Total Envoyé
  - Total À Fabriquer

- ✅ **Photo de l'article** :
  - Upload de photo spécifique à l'article
  - Prévisualisation
  - Photo différente de celle du modèle

- ✅ **Options** :
  - Appartient au catalogue produit (case à cocher)
  - Article actif/inactif

### 3. 🛒 Catalogue Articles
**Page**: `/catalogue-articles`

Gestion du catalogue avec quantités minimales (stock de sécurité).

#### Fonctionnalités
- ✅ **Articles du catalogue** :
  - Liste des articles appartenant au catalogue
  - Référence commerciale
  - Modèle et caractéristiques

- ✅ **Quantités** :
  - **Quantité Minimale (Qte commandé)** : Stock de sécurité à maintenir
  - Stock Showroom
  - Stock Fab
  - Réservé
  - **À Fabriquer** : Calculé automatiquement
    - Formule : `Qte Minimale - Stock Showroom - Stock Fab - Réservé`

- ✅ **Ordre de Fabrication** :
  - Case à cocher pour indiquer si un OF a été créé
  - Filtre pour afficher les articles avec/sans OF

- ✅ **Alertes visuelles** :
  - Ligne en orange si besoin de fabrication
  - Badge avec icône d'alerte
  - Badge vert si stock suffisant

- ✅ **Statistiques** :
  - Quantité Minimale Totale
  - Total À Fabriquer
  - Nombre d'articles avec Ordre de Fabrication

## 🔧 Génération Automatique des Références

### Référence Commerciale
Générée selon la formule Excel :
- **U (Uni)** : `{CODE_MODELE}{CODE_DIMENSIONS}-{SELECTEUR_01}`
- **B (2 Couleurs)** : `{CODE_MODELE}{CODE_DIMENSIONS}-B{SELECTEUR_01}-{SELECTEUR_02}`
- **3+ Couleurs** : `{CODE_MODELE}{CODE_DIMENSIONS}-{CODE_COULEUR}{SELECTEUR_01}-{SELECTEUR_02}-{SELECTEUR_03}`

### Référence Fabrication
Générée selon la formule Excel :
- **U (Uni)** : `{CODE_MODELE}{CODE_DIMENSIONS}-{SELECTEUR_01}`
- **B (2 Couleurs)** : `{CODE_MODELE}{CODE_DIMENSIONS}-B-{SELECTEUR_01}-{SELECTEUR_02}`
- **T (3 Couleurs)** : `{CODE_MODELE}{CODE_DIMENSIONS}-T-{SELECTEUR_01}-{SELECTEUR_02}-{SELECTEUR_03}`
- Etc. avec tirets supplémentaires

## 📁 Fichiers Créés

### Frontend
1. **`frontend/src/pages/Modeles.tsx`**
   - Page complète de gestion des modèles
   - Formulaire avec toutes les sections
   - Upload de photos
   - Gestion des prix

2. **`frontend/src/pages/Articles.tsx`** (réécrite)
   - Page complète de gestion des articles
   - Sélection de modèle et attributs
   - Génération automatique des références
   - Composition pour production
   - Upload de photos

3. **`frontend/src/pages/CatalogueArticles.tsx`**
   - Page de gestion du catalogue
   - Quantités minimales
   - Calcul automatique "À Fabriquer"
   - Alertes visuelles

4. **`frontend/src/utils/references.ts`**
   - Fonctions de génération des références
   - Conformes aux formules Excel

### Backend
1. **`backend/src/utils/references.js`**
   - Fonctions de génération des références (Node.js)
   - Utilisables dans les contrôleurs

## 🗂️ Navigation Mise à Jour

La catégorie **Produit et Service** contient maintenant :
1. **Modèles (Articles Parents)** - `/modeles`
2. **Articles** - `/articles`
3. **Catalogue Articles** - `/catalogue-articles`
4. **Services** - `/services`
5. **Matière Première** - `/matieres-premieres`

## 🎯 Workflow Complet

### 1. Créer un Modèle
1. Aller dans **Modèles (Articles Parents)**
2. Cliquer sur **Nouveau Modèle**
3. Remplir les informations :
   - Code, Désignation, Produit
   - Attributs (Dimensions, Tissage, Finition, Couleurs)
   - Prix (Reviens, Vente)
   - Upload photo du modèle
   - Cocher "Appartient au catalogue produit" si nécessaire
4. Enregistrer

### 2. Créer un Article
1. Aller dans **Articles**
2. Cliquer sur **Nouvel Article**
3. Sélectionner un **Modèle** (charge automatiquement les attributs)
4. Sélectionner les **Couleurs (Sélecteurs)** :
   - Pour Uni : 1 sélecteur
   - Pour 2 Couleurs : 2 sélecteurs
   - Pour 3+ Couleurs : 3 à 6 sélecteurs selon le modèle
5. Les **références sont générées automatiquement**
6. Remplir les informations complémentaires :
   - Dimensions, Couleur Article, Description
   - Composition pour Production (cases à cocher)
   - Quantités
7. Upload photo de l'article
8. Cocher "Appartient au catalogue produit" si nécessaire
9. Enregistrer

### 3. Gérer le Catalogue
1. Aller dans **Catalogue Articles**
2. Voir les articles du catalogue avec leurs quantités minimales
3. Les articles avec besoin de fabrication sont mis en évidence
4. Ajouter/modifier des articles au catalogue
5. Définir les quantités minimales (stock de sécurité)
6. Le système calcule automatiquement "À Fabriquer"

## 📊 Fonctionnalités Clés

### Génération Automatique
- ✅ Références commerciales et de fabrication générées automatiquement
- ✅ Basées sur les formules Excel exactes
- ✅ Mise à jour en temps réel lors de la sélection

### Gestion des Photos
- ✅ Photo générale pour chaque modèle
- ✅ Photo spécifique pour chaque article
- ✅ Upload avec prévisualisation
- ✅ Support JPG, PNG (max 5MB)

### Composition pour Production
- ✅ Indication des sélecteurs requis pour la production
- ✅ Stockage de la composition des couleurs
- ✅ Utilisé pour la génération des OF

### Quantités Minimales
- ✅ Stock de sécurité défini par article
- ✅ Calcul automatique du besoin de fabrication
- ✅ Alertes visuelles pour les articles à fabriquer

## 🔄 Intégration avec les Autres Modules

### Module Vente
- Utilise la **Référence Commerciale** pour les devis, commandes, factures

### Module Fabrication
- Utilise la **Référence Fabrication** pour les OF
- Utilise la **Composition des Sélecteurs** pour la production

### Module Stock
- Utilise la **Référence Commerciale** pour l'inventaire
- Les quantités minimales du catalogue servent de stock de sécurité

## 📝 Prochaines Étapes

Pour compléter le système, il faudra :

1. **Backend API** :
   - Créer les contrôleurs pour modèles, articles, catalogue
   - Endpoints pour upload de photos
   - Endpoints pour génération d'articles

2. **Base de Données** :
   - Tables `modeles_articles`
   - Tables `articles_generes`
   - Tables `catalogue_articles`
   - Relations avec attributs et photos

3. **Import depuis Excel** :
   - Script d'import des modèles depuis "Base Modele"
   - Script d'import des articles depuis "Base Article"
   - Script d'import du catalogue depuis "Catalogue"

Le système est maintenant prêt côté frontend ! 🎉
