# 📊 Analyse du Fichier Excel "Commandes 2025-2026"

## 📁 Structure du Fichier

Le fichier contient **5 feuilles** avec des données structurées :

### 1. 📋 Caractéristique (89 lignes)
**Colonnes principales :**
- Modèle (ex: ARTHUR, BALI, BASQUE, BERBER, BIBI)
- Code Modèle (ex: AR, BAL, BA, BE, BIB)
- Produit (Fouta, Coussin Sac, Echarpe, Fouta Enfant, Fouta Eponge)
- Type de Tissage (Eponge, Jacquard, Mixte, Nid d'Abeille, Plat)
- Code Type de Tissage (EP, JA, MIX, ND, PL)
- Dimensions (100/160 CM, 100/200 CM, 15/35 CM, etc.)
- Code Dimensions (1016, 1020, 0103, etc.)
- Type de Finition (Couture, Frange, Frange Court, Frange Croisé, Ourlet 4 Face)
- Code Type De Finition (Cou, FR, Fcourt, Fcroisé, Our4)
- Nombre de couleur (2, 3, 4, 5, 6 Couleurs)
- Code Nombre de couleur (B, T, Q, C, S)
- Code Couleur (C01, C02, C03, C04, C05)
- Couleur (Blanc, Ecru, Beige, Naturel, Terra)

**Observations :**
- 89 lignes de caractéristiques
- Beaucoup de valeurs nulles (notamment pour Produit, Type de Tissage, Dimensions, etc.)
- Structure permettant de définir les attributs des produits

### 2. 🏭 Base Modele (143 lignes)
**Colonnes principales :**
- Modèle
- Produit
- Code Modèle
- Code Dimensions
- Type de Tissage
- Code Type de Tissage
- Nombre de couleur
- Code Nombre de couleur
- Type de Finition
- Code Type De Finition
- Composition Pour Fabrication
- Prix Frange CAT01 (majoritairement vide - 135 valeurs nulles)
- Prix Frange CAT02 (toutes vides - 143 valeurs nulles)
- Prix de reviens (tous renseignés)
- Prix de vente (tous renseignés)

**Exemples de données :**
- ARTHUR - Fouta - AR - 1020 - Tissage Plat - PL - 2 Couleurs - B - Frange - FR
- Prix de reviens: 7.5, Prix de vente: 9.75

**Observations :**
- 143 modèles différents
- Prix de reviens et prix de vente renseignés
- Prix Frange CAT01 et CAT02 majoritairement vides

### 3. 📦 Base Article (1531 lignes)
**Colonnes principales :**
- **Ref Commercial** (ex: ANA2426-lin, AR1020-B02-03) - Référence pour la vente
- **Ref Fabrication** (ex: ANA2426-lin, AR1020-B-02-03) - Référence pour la production
- Produit
- Modèle
- Code Modèle
- Nombre de couleur
- Code Nombre de couleur
- Type de Tissage
- Dimensions
- Code Dimensions
- Type de Finition
- Total Commander
- Total Envoyer
- Total A Fabriquer
- Code Selecteur 01 à 08 (pour les couleurs)
- Couleur Article
- Description Article

**Analyse des Références :**
- ✅ **1531 articles** avec Ref Commercial renseignée
- ✅ **1531 articles** avec Ref Fabrication renseignée
- ⚠️ **179 articles** ont des références identiques (Ref Commercial = Ref Fabrication)
- ⚠️ **1352 articles** ont des références différentes (Ref Commercial ≠ Ref Fabrication)

**Structure des Références :**
- **Ref Commercial** : Longueur moyenne de 14.1 caractères (min: 8, max: 21)
- **Ref Fabrication** : Longueur moyenne de 15.7 caractères (min: 8, max: 28)
- Toutes les références contiennent des tirets (-)
- Format typique : `{CODE_MODELE}{DIMENSIONS}-{NB_COULEURS}{COULEUR1}-{COULEUR2}`

**Exemples de différences :**
- Commercial: `AR1020-B02-03` → Fabrication: `AR1020-B-02-03` (tirets supplémentaires)
- Commercial: `AR1020-B02-04` → Fabrication: `AR1020-B-02-04`
- Commercial: `ANA2426-lin` → Fabrication: `ANA2426-lin` (identique)

**Top Modèles par nombre de références :**
1. ARTHUR : 306 références
2. UNI SURPIQUE : 132 références
3. ND LILI : 95 références
4. IBIZA : 81 références
5. MARINIERE : 46 références

**Exemples de données :**
- AR1020-B02-03 (Commercial) / AR1020-B-02-03 (Fabrication) : Fouta ARTHUR, 2 Couleurs, 100/200 CM, Frange
- Total Commander: 80, Total Envoyer: 0, Total A Fabriquer: 80

**Observations :**
- 1531 articles différents
- **Deux systèmes de références** : Commercial (vente) et Fabrication (production)
- La plupart des articles ont des références différentes entre commercial et fabrication
- Codes sélecteurs pour les couleurs (01 à 08)
- Quantités commandées, envoyées et à fabriquer

### 4. 🛒 Catalogue (1708 lignes)
**Colonnes principales :**
- ID Commande (ex: CA250000, CA250001)
- Num Client (All by Fouta)
- Num Commande (Catalogue)
- Ref Commercial
- Modèle
- Type de Tissage
- Code Dimensions
- Type de Finition
- Personnalisation (Non)
- Qte commandé
- Stock Showrrom (toutes vides)
- Stock Fab (toutes vides)
- Reserve (toutes vides)
- A Fabriquer
- Ordre de Fabrication (True/False)

**Exemples de données :**
- CA250000 : UNI SURPIQUE, 100/200 CM, Frange, Qte: 60, A Fabriquer: 60

**Observations :**
- 1708 lignes de catalogue
- Tous les stocks sont vides (Showrrom, Fab, Reserve)
- Quantités à fabriquer renseignées
- Ordre de Fabrication en booléen

### 5. 📋 Commandes (1653 lignes)
**Colonnes principales :**
- ID Commande (ex: OF249780, OF249781)
- Etat (En cours)
- Date d'envoie (2026-01-23)
- Num Commande Client (majoritairement vide - 307 valeurs nulles)
- Num Commande (ex: CM-FT0119)
- Num Client (ex: CL00884)
- Ref Client (ex: REF224675)
- Ref Commercial (ex: IB1020-B29-01)
- Modèle (ex: IBIZA)
- Type de Tissage
- Code Dimensions
- Type de Finition
- Qte commandé
- Stock (majoritairement vide - 1635 valeurs nulles)
- Reserve (majoritairement vide - 1383 valeurs nulles)
- A Fabriquer
- EAN (toutes vides)
- Personnalisation (Non)
- Détails Personnalisation (majoritairement vide - 1641 valeurs nulles)
- Ordre de Fabrication (True/False)

**Exemples de données :**
- OF249780 : IBIZA, 100/200 CM, Frange, Qte: 320, A Fabriquer: 320, Etat: En cours

**Observations :**
- 1653 commandes
- Toutes les commandes sont "En cours"
- Dates d'envoie en 2026
- Stocks et réserves majoritairement vides
- EAN toutes vides

## 🔍 Points Clés à Retenir

### Structure des Données
1. **Modèles** → Définis par : Type de Tissage, Dimensions, Finition, Nombre de couleurs
2. **Articles** → Générés à partir des modèles avec combinaisons de couleurs
3. **Commandes** → Liées aux articles avec quantités et états

### Attributs Identifiés
- **Type de Tissage** : Eponge, Jacquard, Mixte, Nid d'Abeille, Plat
- **Dimensions** : 15/35 CM, 100/160 CM, 100/200 CM, 160/260 CM, 180/240 CM, 240/260 CM
- **Type de Finition** : Couture, Frange, Frange Court, Frange Croisé, Ourlet 4 Face
- **Nombre de Couleurs** : 2, 3, 4, 5, 6 Couleurs
- **Couleurs** : Blanc, Ecru, Beige, Naturel, Terra, etc. (codes C01, C02, C03...)

### Données Manquantes
- Stocks (Showrrom, Fab, Reserve) majoritairement vides
- Prix Frange CAT01 et CAT02 vides
- EAN toutes vides
- Détails Personnalisation majoritairement vides

## 💡 Recommandations pour l'Intégration

1. **Créer les attributs** dans le système :
   - Type de Tissage
   - Dimensions
   - Type de Finition
   - Nombre de Couleurs
   - Couleurs

2. **Importer les modèles** depuis "Base Modele"
   - Avec leurs prix de reviens et prix de vente

3. **Générer les articles** depuis "Base Article"
   - **IMPORTANT** : Stocker les **deux références** pour chaque article :
     - **Ref Commercial** : Pour la vente, devis, factures
     - **Ref Fabrication** : Pour la production, OF, suivi fabrication
   - La plupart des articles ont des références différentes
   - Format : `{CODE_MODELE}{DIMENSIONS}-{NB_COULEURS}{COULEUR1}-{COULEUR2}`
   - Les références de fabrication ont souvent des tirets supplémentaires

4. **Importer les commandes** depuis "Commandes"
   - Utiliser la **Ref Commercial** pour lier les commandes aux articles
   - Avec leurs états et quantités

5. **Synchroniser le catalogue** depuis "Catalogue"
   - Utiliser la **Ref Commercial** pour le catalogue produit
   - Avec les quantités à fabriquer

6. **Gestion des références dans l'ERP :**
   - Champ `code_article` → **Ref Commercial** (pour la vente)
   - Champ `code_fabrication` → **Ref Fabrication** (pour la production)
   - Afficher les deux références dans les interfaces
   - Permettre la recherche par les deux types de références

## 📊 Statistiques

- **5 feuilles** au total
- **5124 lignes** de données au total
- **143 modèles** différents
- **1531 articles** différents
- **1708 lignes** de catalogue
- **1653 commandes** en cours
