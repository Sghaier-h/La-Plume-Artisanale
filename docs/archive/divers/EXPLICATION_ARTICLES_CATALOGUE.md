# 📚 Explication : Articles Catalogue vs Articles Hors Catalogue

## 🎯 Différence entre Articles Catalogue et Articles Hors Catalogue

### Articles Catalogue (`articles_catalogue`)
- **Définition** : Articles standards qui appartiennent au catalogue produit
- **Utilisation** :
  - Affichage sur le site e-commerce
  - Vente sur différents réseaux
  - Référence standardisée pour les clients
- **Caractéristique** : `dans_catalogue_produit = true`

### Articles Hors Catalogue
- **Définition** : Articles personnalisés ou spécifiques créés pour un client
- **Utilisation** :
  - Commandes personnalisées
  - Articles créés sur mesure
  - Variantes non standardisées
- **Caractéristique** : N'existent pas dans `articles_catalogue`

## 🔄 Logique dans les Commandes

### Dans `articles_commande` :
- **`id_article`** : 
  - Si l'article est dans le catalogue → `id_article` pointe vers `articles_catalogue`
  - Si l'article est hors catalogue → `id_article = NULL`
- **`ref_commerciale`** : Toujours remplie (référence commerciale de l'article commandé)
- **`description_article`** : Description de l'article (peut venir du catalogue ou être saisie manuellement)
- **`dimensions`**, **`type_finition`**, etc. : Informations spécifiques à la commande

## ✅ Solution Implémentée

1. **Structure modifiée** : `id_article` peut être `NULL` dans `articles_commande`
2. **Script SQL** : Utilise `LEFT JOIN` au lieu de `JOIN` pour permettre les articles hors catalogue
3. **Frontend** : Permet de sélectionner un article du catalogue OU de créer un article personnalisé

## 📊 Exemple

### Article dans le catalogue :
```sql
INSERT INTO articles_commande (
    id_commande, id_article, ref_commerciale, description_article, ...
)
VALUES (
    1, 
    123,  -- id_article existe dans articles_catalogue
    'AR1020-B02-03',
    'Fouta Modèle ARTHUR Couleur Ecru Beige',
    ...
);
```

### Article hors catalogue (personnalisé) :
```sql
INSERT INTO articles_commande (
    id_commande, id_article, ref_commerciale, description_article, ...
)
VALUES (
    1, 
    NULL,  -- Pas d'id_article car article personnalisé
    'AR1020-B02-03-PERSO',
    'Fouta Modèle ARTHUR Couleur Ecru Beige - Personnalisation Broderie Logo',
    ...
);
```

## 🎨 Workflow

1. **Client consulte le catalogue** → Voit les articles de `articles_catalogue` avec `dans_catalogue_produit = true`
2. **Client commande un article standard** → `id_article` est rempli
3. **Client demande une personnalisation** → Article peut être créé hors catalogue avec `id_article = NULL`
4. **Commande créée** → Ligne dans `articles_commande` avec toutes les informations

---

**✅ Cette architecture permet de gérer à la fois les articles standards du catalogue et les articles personnalisés hors catalogue !**
