# 🔖 Structure des Références Commerciales et de Production

## 📊 Vue d'Ensemble

### Statistiques
- **1531 articles** au total
- **100%** des articles ont une Ref Commercial
- **100%** des articles ont une Ref Fabrication
- **179 articles** (11.7%) ont des références identiques
- **1352 articles** (88.3%) ont des références différentes

## 🔍 Structure des Références

### Référence Commerciale
- **Longueur moyenne** : 14.1 caractères
- **Longueur min** : 8 caractères
- **Longueur max** : 21 caractères
- **Format** : Contient toujours des tirets (-)

### Référence de Production (Fabrication)
- **Longueur moyenne** : 15.7 caractères
- **Longueur min** : 8 caractères
- **Longueur max** : 28 caractères
- **Format** : Contient toujours des tirets (-)
- **Différence principale** : Souvent des tirets supplémentaires par rapport à la référence commerciale

## 📝 Exemples de Références

### Articles avec Références Identiques
```
Ref Commercial    Ref Fabrication    Produit    Modèle
ANA2426-lin       ANA2426-lin        Fouta      ARTISANAT
```

### Articles avec Références Différentes (Majorité)
```
Ref Commercial    Ref Fabrication    Produit    Modèle    Différence
AR1020-B02-03     AR1020-B-02-03     Fouta      ARTHUR    Tirets supplémentaires
AR1020-B02-04     AR1020-B-02-04     Fouta      ARTHUR    Tirets supplémentaires
AR1020-B02-10     AR1020-B-02-10     Fouta      ARTHUR    Tirets supplémentaires
```

**Pattern observé** :
- Commercial : `AR1020-B02-03` (sans tiret après B)
- Fabrication : `AR1020-B-02-03` (avec tiret après B)

## 🏷️ Top Préfixes de Références

### Références Commerciales
1. **AR2** : 179 articles (modèle ARTHUR - série 2)
2. **UNS** : 132 articles (UNI SURPIQUE)
3. **AR1** : 127 articles (modèle ARTHUR - série 1)
4. **NDL** : 115 articles (ND LILI)
5. **NDF** : 60 articles (ND FIVE)

### Références de Production
Les mêmes préfixes que les références commerciales, confirmant que la structure de base est identique.

## 📦 Répartition par Modèle

| Modèle | Nombre de Références |
|--------|---------------------|
| ARTHUR | 306 |
| UNI SURPIQUE | 132 |
| ND LILI | 95 |
| IBIZA | 81 |
| MARINIERE | 46 |
| BERBER | 35 |
| VERONE | 32 |
| LILI LUREX | 30 |
| PONCHO BICOULEUR | 27 |
| ND FIVE | 26 |

## 🔧 Structure Décodée

### Format Typique
```
{CODE_MODELE}{CODE_DIMENSIONS}-{CODE_NB_COULEURS}{CODE_COULEUR1}-{CODE_COULEUR2}
```

**Exemple** : `AR1020-B02-03`
- `AR` : Code Modèle (ARTHUR)
- `1020` : Code Dimensions (100/200 CM)
- `B` : Code Nombre de Couleurs (2 Couleurs)
- `02` : Code Couleur 1 (C02 = Ecru)
- `03` : Code Couleur 2 (C03 = Beige)

### Différence Commercial vs Fabrication
- **Commercial** : `AR1020-B02-03` (format compact)
- **Fabrication** : `AR1020-B-02-03` (format avec tirets supplémentaires pour lisibilité)

## 💡 Recommandations pour l'ERP

### 1. Structure de Base de Données
```sql
CREATE TABLE articles (
    id_article SERIAL PRIMARY KEY,
    code_article VARCHAR(50) NOT NULL,        -- Ref Commercial
    code_fabrication VARCHAR(50) NOT NULL,   -- Ref Fabrication
    id_modele INTEGER,
    designation VARCHAR(255),
    -- ... autres champs
    UNIQUE(code_article),
    UNIQUE(code_fabrication)
);
```

### 2. Champs dans l'Interface
- **Code Article** (Ref Commercial) : Pour la vente, devis, factures
- **Code Fabrication** (Ref Fabrication) : Pour la production, OF, suivi

### 3. Recherche
- Permettre la recherche par les deux types de références
- Index sur les deux champs pour performance

### 4. Affichage
- Afficher les deux références dans les listes d'articles
- Badge distinctif pour différencier Commercial vs Fabrication
- Option pour afficher/masquer selon le contexte (vente vs production)

### 5. Import/Export
- Importer les deux références depuis Excel
- Exporter avec les deux références
- Validation : Vérifier que les deux références sont renseignées

## 📋 Exemples d'Utilisation

### Dans le Module Vente
- Utiliser **Ref Commercial** pour :
  - Devis
  - Commandes
  - Factures
  - Catalogue produit

### Dans le Module Fabrication
- Utiliser **Ref Fabrication** pour :
  - Ordres de Fabrication (OF)
  - Suivi de production
  - Planning
  - Bons de travail

### Dans le Module Stock
- Utiliser **Ref Commercial** pour :
  - Inventaire
  - Mouvements de stock
  - Réceptions
  - Expéditions

## ⚠️ Points d'Attention

1. **88.3% des articles** ont des références différentes
   - Il est **essentiel** de stocker les deux références
   - Ne pas utiliser une seule référence pour tout

2. **Format des références**
   - Les références de fabrication ont souvent des tirets supplémentaires
   - Ne pas essayer de convertir automatiquement entre les deux formats

3. **Unicité**
   - Les deux références doivent être uniques
   - Vérifier l'unicité lors de l'import

4. **Compatibilité**
   - S'assurer que les anciens systèmes peuvent utiliser les deux références
   - Migration progressive si nécessaire
