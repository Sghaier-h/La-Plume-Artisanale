# 📝 Modifications Demandées pour Modèles et Articles

## ✅ Fonctionnalités à Implémenter

### 1. Toggle Affichage (Ligne/Catalogue)
- Ajouter un toggle en haut de la page pour choisir entre :
  - **Mode Ligne** : Affichage en tableau (actuel)
  - **Mode Catalogue** : Affichage en grille avec photos, nom modèle, prix, etc.

### 2. Système de Prix Multiples avec Devises
- ❌ **Enlever** : Prix Frange CAT01 et CAT02
- ✅ **Ajouter** : Système de prix multiples
  - Liste de prix avec différentes devises
  - Chaque prix : Montant + Devise + Libellé (ex: "Prix de vente", "Prix promotionnel")
  - Devises supportées : TND, EUR, USD

### 3. Attributs Paramétrables
- ✅ **Créé** : Page `GestionAttributs` dans Paramétrage
- ✅ **Ajouté** : Bouton "Paramètres/Attributs" en haut à droite des pages Modèles et Articles
- Les attributs doivent être configurés depuis cette page
- Tous les attributs (Dimensions, Tissage, Finition, Couleur, etc.) sont paramétrables

### 4. Intégration Couleurs depuis Matière Première
- Les couleurs doivent être chargées depuis la table `matieres_premieres`
- Filtrage des matières premières de type "couleur"
- Dropdown dans les formulaires pour sélectionner une couleur depuis MP

### 5. Enregistrements Fonctionnels avec Messages d'Erreur
- Implémenter les appels API réels
- Gestion des erreurs avec messages d'erreur/succès
- Validation des formulaires
- Affichage des messages de confirmation

## 📁 Fichiers à Modifier

### Frontend
1. `frontend/src/pages/Modeles.tsx` - ✅ Partiellement modifié
2. `frontend/src/pages/Articles.tsx` - ✅ À modifier de la même manière
3. `frontend/src/pages/Parametrage.tsx` - ✅ Modifié (ajout onglet Attributs)
4. `frontend/src/pages/GestionAttributs.tsx` - ✅ Créé
5. `frontend/src/services/api.ts` - ✅ Modifié (ajout services)
6. `frontend/src/App.tsx` - ✅ Modifié (ajout route)

### Backend (À créer/Modifier)
1. `backend/src/controllers/modeles.controller.js` - À créer
2. `backend/src/routes/modeles.routes.js` - À créer
3. `backend/src/controllers/articles-generes.controller.js` - À créer
4. `backend/src/routes/articles-generes.routes.js` - À créer

## 🔧 Modifications Principales à Faire

### Modeles.tsx
1. Ajouter toggle affichage (ligne/catalogue) en haut de page
2. Remplacer prix frange par système de prix multiples
3. Ajouter bouton "Paramètres/Attributs" en haut à droite
4. Intégrer les couleurs depuis Matière Première
5. Implémenter les fonctions d'enregistrement avec messages d'erreur
6. Créer vue catalogue avec photos, nom, prix

### Articles.tsx
- Mêmes modifications que Modeles.tsx

## 📊 Structure des Données

### Prix Multiples
```typescript
interface Prix {
  montant: number;
  devise: string; // TND, EUR, USD
  libelle: string; // "Prix de vente", "Prix promotionnel", etc.
  actif: boolean;
}
```

### Couleurs depuis MP
```typescript
interface CouleurMP {
  id_mp: number;
  code_mp: string;
  designation: string;
  couleur_hex?: string;
}
```

## 🎯 Prochaines Étapes

1. ✅ Créer page GestionAttributs
2. ✅ Ajouter services API
3. ✅ Ajouter route
4. ⏳ Modifier Modeles.tsx avec toutes les fonctionnalités
5. ⏳ Modifier Articles.tsx avec toutes les fonctionnalités
6. ⏳ Créer contrôleurs backend
7. ⏳ Créer routes backend
8. ⏳ Tester les enregistrements
