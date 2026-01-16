# 📦 Gestion des Articles avec Modèles

## ✅ Fonctionnalités Implémentées

### 1. Modèles (Articles Parents)
- ✅ Création de modèles de base (articles parents)
- ✅ Code modèle et désignation
- ✅ Description optionnelle
- ✅ Statut actif/inactif

### 2. Gestion des Attributs
- ✅ Sélection d'attributs pour chaque modèle
- ✅ Affichage visuel des attributs sélectionnés
- ✅ Affichage du nombre de valeurs possibles par attribut
- ✅ Calcul automatique du nombre total de combinaisons

### 3. Génération Automatique d'Articles
- ✅ Génération de toutes les combinaisons possibles d'attributs
- ✅ Prévisualisation des articles à générer
- ✅ Code article automatique basé sur le modèle et les attributs
- ✅ Désignation automatique avec les valeurs d'attributs

### 4. Case à Cocher "Catalogue Produit"
- ✅ Case à cocher au niveau du modèle
- ✅ Les articles générés héritent de cette propriété
- ✅ Possibilité de modifier individuellement pour chaque article généré
- ✅ Filtre pour afficher uniquement les modèles dans/hors catalogue

## 🎨 Interface Utilisateur

### Formulaire de Modèle
- **Code Modèle** : Identifiant unique du modèle
- **Désignation** : Nom du modèle
- **Description** : Description détaillée (optionnelle)
- **Case à cocher "Appartient au catalogue produit"** : Détermine si les articles générés seront dans le catalogue
- **Sélection d'attributs** : Interface visuelle avec cases à cocher
- **Prévisualisation** : Affiche le nombre d'articles qui seront générés

### Sélection d'Attributs
- Affichage en cartes cliquables
- Indication visuelle des attributs sélectionnés (bordure bleue)
- Affichage du nombre de valeurs possibles
- Liste des valeurs possibles pour chaque attribut

### Génération d'Articles
- Modal de prévisualisation avec tous les articles à générer
- Affichage du code article, désignation et combinaison d'attributs
- Case à cocher individuelle pour chaque article (catalogue produit)
- Bouton de validation pour générer tous les articles

### Liste des Modèles
- Tableau avec toutes les informations
- Badges pour les attributs sélectionnés
- Indication du nombre d'articles générés
- Badge pour indiquer si dans le catalogue produit
- Actions : Modifier, Supprimer

## 📋 Workflow

1. **Créer un Modèle**
   - Saisir le code et la désignation
   - Cocher si le modèle appartient au catalogue produit
   - Sélectionner les attributs à utiliser

2. **Prévisualiser les Articles**
   - Cliquer sur "Prévisualiser les articles à générer"
   - Voir toutes les combinaisons possibles
   - Modifier individuellement la case "Catalogue" pour chaque article

3. **Générer les Articles**
   - Valider la génération
   - Les articles sont créés automatiquement avec leurs codes et désignations

4. **Gérer les Modèles**
   - Modifier un modèle existant
   - Voir les articles générés
   - Supprimer un modèle

## 🔧 Structure Technique

### Interfaces TypeScript
```typescript
interface ModeleArticle {
  id_modele?: number;
  code_modele: string;
  designation: string;
  description?: string;
  actif: boolean;
  dans_catalogue_produit: boolean;
  attributs_ids: number[];
  articles_generes?: ArticleGenere[];
}

interface Attribut {
  id_attribut: number;
  code_attribut: string;
  libelle: string;
  type_attribut: string;
  valeurs_possibles: Array<{code: string; libelle: string}>;
}

interface ArticleGenere {
  id_article?: number;
  code_article: string;
  designation: string;
  combinaison_attributs: {[key: string]: string};
  dans_catalogue_produit: boolean;
  actif: boolean;
}
```

### Fonctionnalités Clés

1. **Génération Récursive des Combinaisons**
   - Algorithme récursif pour générer toutes les combinaisons possibles
   - Calcul automatique du nombre total de combinaisons

2. **Code Article Automatique**
   - Format : `{CODE_MODELE}-{VALEUR1}-{VALEUR2}-...`
   - Basé sur les codes des valeurs d'attributs

3. **Désignation Automatique**
   - Format : `{DESIGNATION_MODELE} - {VALEUR1} - {VALEUR2} - ...`
   - Basé sur les libellés des valeurs d'attributs

## 📁 Fichiers Modifiés

- **`frontend/src/pages/Articles.tsx`**
  - Réécriture complète avec toutes les nouvelles fonctionnalités
  - Interface moderne et intuitive
  - Gestion complète du cycle de vie des modèles et articles

## 🚀 Prochaines Étapes

Pour compléter l'implémentation, il faudra :

1. **Backend API**
   - Créer les endpoints pour les modèles
   - Endpoint pour générer les articles
   - Endpoint pour gérer les attributs

2. **Base de Données**
   - Table `modeles_articles`
   - Table `articles_generes`
   - Relations avec les attributs

3. **Intégration**
   - Connecter l'API réelle
   - Gérer les erreurs
   - Ajouter la validation

## 📊 Exemple d'Utilisation

**Modèle :**
- Code : `MOD-FOUTA-001`
- Désignation : `Fouta Classique`
- Attributs : Couleur (Rouge, Bleu, Vert) + Taille (150cm, 200cm, 250cm)

**Articles Générés :**
- `MOD-FOUTA-001-ROU-150` - Fouta Classique - Rouge - 150cm
- `MOD-FOUTA-001-ROU-200` - Fouta Classique - Rouge - 200cm
- `MOD-FOUTA-001-ROU-250` - Fouta Classique - Rouge - 250cm
- `MOD-FOUTA-001-BLE-150` - Fouta Classique - Bleu - 150cm
- ... (9 articles au total)

Le système est maintenant prêt pour la gestion complète des articles avec modèles ! 🎉
