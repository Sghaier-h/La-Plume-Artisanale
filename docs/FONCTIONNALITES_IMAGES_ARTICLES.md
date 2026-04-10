# 📸 Fonctionnalités Images pour les Articles - La Plume Artisanale

## ✅ Implémentation Complétée

### 1. **Backend - Upload d'Images**

#### Configuration Multer (`backend/modules/product/utils/upload.js`)
- ✅ Configuration du stockage dans `/uploads/products`
- ✅ Validation des types de fichiers (JPG, PNG, GIF, WEBP, SVG)
- ✅ Limite de taille : 10MB max
- ✅ Génération de noms de fichiers uniques
- ✅ Fonctions utilitaires : `getImageUrl()`, `deleteImageFile()`

#### Routes API (`backend/modules/product/routes/product_template.routes.js`)
- ✅ `POST /api/product/templates/:id/image` - Upload d'image
- ✅ `DELETE /api/product/templates/:id/image/:imageId` - Suppression d'image
- ✅ `GET /api/product/templates/:id/images` - Récupération des images

#### Contrôleurs (`backend/modules/product/controllers/product_template.controller.js`)
- ✅ `uploadProductImage` - Upload et mise à jour de `image_url` dans `articles_catalogue`
- ✅ `deleteProductImage` - Suppression de l'image et mise à jour du produit
- ✅ `getProductImages` - Récupération de toutes les images d'un produit
- ✅ Ajout automatique de `image_url_full` dans les réponses API

### 2. **Base de Données**

#### Colonne `image_url`
- ✅ Colonne `image_url VARCHAR(500)` ajoutée à `articles_catalogue`
- ✅ Index créé pour améliorer les performances
- ✅ Script d'ajout automatique : `ajouter-colonne-image-articles.mjs`

### 3. **Frontend - Interface Utilisateur**

#### Liste des Produits (`frontend/src/pages/erp/Products.tsx`)
- ✅ Colonne "Image" ajoutée dans le tableau
- ✅ Affichage des miniatures (48x48px) avec fallback sur icône Package
- ✅ Gestion des erreurs de chargement d'image
- ✅ Support des URLs complètes et relatives

#### Formulaire Produit
- ✅ Section "Photo du produit" avec aperçu (200x200px)
- ✅ Zone de drag & drop visuelle pour upload
- ✅ Bouton "Ajouter/Changer l'image"
- ✅ Bouton de suppression d'image
- ✅ Aperçu en temps réel avant upload
- ✅ Indication des formats acceptés et taille max

#### Services API (`frontend/src/services/api.ts`)
- ✅ `uploadImage(id, file)` - Upload d'image avec FormData
- ✅ `deleteImage(id, imageId?)` - Suppression d'image
- ✅ `getImages(id)` - Récupération des images

### 4. **Fonctionnalités**

#### Upload d'Image
1. Sélection du fichier via input file
2. Aperçu immédiat avec FileReader
3. Upload après sauvegarde du produit
4. Mise à jour automatique de l'aperçu après upload

#### Affichage
- Miniatures dans la liste (48x48px)
- Aperçu dans le formulaire (200x200px)
- Fallback sur icône si image manquante ou erreur
- Support des URLs absolues et relatives

#### Suppression
- Bouton de suppression avec confirmation visuelle
- Suppression du fichier physique
- Mise à jour de la base de données

## 📁 Structure des Fichiers

```
backend/
  modules/product/
    utils/
      upload.js          # Configuration Multer
    controllers/
      product_template.controller.js  # Contrôleurs upload/delete/getImages
    routes/
      product_template.routes.js      # Routes API images
  uploads/
    products/            # Dossier de stockage des images
```

## 🔧 Configuration

### Variables d'environnement
- `REACT_APP_API_URL` : URL de base de l'API (pour construire les URLs d'images)

### Formats acceptés
- JPEG, JPG, PNG, GIF, WEBP, SVG
- Taille max : 10MB

### Chemins
- Upload : `/uploads/products/product-{timestamp}-{random}.{ext}`
- URL API : `/api/product/templates/:id/image`
- URL statique : `/uploads/products/{filename}`

## 🎨 Interface Utilisateur

### Liste des Produits
- Colonne image avec miniature
- Fallback sur icône Package si pas d'image
- Gestion d'erreur de chargement

### Formulaire Produit
- Zone d'upload visuelle (200x200px)
- Aperçu en temps réel
- Boutons : Ajouter, Changer, Supprimer
- Indication des formats acceptés

## 🚀 Utilisation

### Pour l'utilisateur :
1. Ouvrir un produit (créer ou modifier)
2. Dans l'onglet "Informations générales", section "Photo du produit"
3. Cliquer sur la zone ou le bouton "Ajouter une image"
4. Sélectionner une image
5. L'aperçu s'affiche immédiatement
6. Enregistrer le produit (l'image sera uploadée automatiquement)

### Pour le développeur :
```typescript
// Upload d'image
await productTemplatesService.uploadImage(productId, file);

// Suppression d'image
await productTemplatesService.deleteImage(productId);

// Récupération des images
const response = await productTemplatesService.getImages(productId);
```

## 📝 Notes Techniques

- Les images sont stockées dans `backend/uploads/products/`
- Le serveur sert les fichiers statiques via `/uploads`
- Les URLs sont construites automatiquement avec `getImageUrl()`
- La colonne `image_url` stocke le chemin relatif (`/uploads/products/filename.jpg`)
- `image_url_full` est ajouté automatiquement dans les réponses API

## 🔄 Prochaines Améliorations Possibles

1. **Galerie d'images multiples** : Support de plusieurs images par produit
2. **Redimensionnement automatique** : Génération de thumbnails
3. **Compression** : Réduction de la taille des images
4. **CDN** : Stockage sur un CDN pour de meilleures performances
5. **Drag & Drop** : Upload par glisser-déposer
6. **Recadrage** : Outil de recadrage d'image intégré
