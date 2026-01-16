# 🔧 Formules de Génération des Références

## 📋 Vue d'Ensemble

Les références commerciales et de fabrication sont générées automatiquement à partir des attributs de l'article selon des formules spécifiques.

## 🔖 Référence de Fabrication

### Formule Excel (traduite en JavaScript/TypeScript)

La formule suit cette logique selon le nombre de couleurs :

#### Format Général
```
Code Modèle + Code Dimensions + "-" + [Code Couleur] + "-" + [Codes Selecteurs]
```

#### Détails par Nombre de Couleurs

**U (Uni - 1 couleur)**
```
Code Modèle + Code Dimensions + "-" + DROITE(Code Selecteur 01, NBCAR-1)
```
Exemple : `AR1020-02` (si Code Selecteur 01 = "C02")

**B (2 Couleurs)**
```
Code Modèle + Code Dimensions + "-B-" + DROITE(Code Selecteur 01, NBCAR-1) + "-" + DROITE(Code Selecteur 02, NBCAR-1)
```
Exemple : `AR1020-B-02-03` (si Code Selecteur 01 = "C02", Code Selecteur 02 = "C03")

**T (3 Couleurs)**
```
Code Modèle + Code Dimensions + "-T-" + DROITE(Code Selecteur 01, NBCAR-1) + "-" + DROITE(Code Selecteur 02, NBCAR-1) + "-" + DROITE(Code Selecteur 03, NBCAR-1)
```
Exemple : `AR1020-T-02-03-04`

**Q (4 Couleurs)**
```
Code Modèle + Code Dimensions + "-Q-" + DROITE(Code Selecteur 01-04, NBCAR-1)
```
Exemple : `AR1020-Q-02-03-04-05`

**C (5 Couleurs)**
```
Code Modèle + Code Dimensions + "-C-" + DROITE(Code Selecteur 01-05, NBCAR-1)
```
Exemple : `AR1020-C-02-03-04-05-06`

**S (6 Couleurs)**
```
Code Modèle + Code Dimensions + "-S-" + DROITE(Code Selecteur 01-06, NBCAR-1)
```
Exemple : `AR1020-S-02-03-04-05-06-07`

**Par défaut (autre)**
```
Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + "-" + DROITE(Code Selecteur 01, NBCAR-1)
```

### Fonction DROITE(texte, NBCAR-1)

Cette fonction extrait tous les caractères sauf le premier :
- `C02` → `02`
- `C03` → `03`
- `C10` → `10`

## 🛒 Référence Commerciale

### Formule Excel Exacte

La formule Excel suit cette logique :

```
SI(Code Nombre de couleur="U";
   Code Modèle + Code Dimensions + "-" + DROITE(Code Selecteur 01);
SI(Code Nombre de couleur="B";
   Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + DROITE(Code Selecteur 01) + "-" + DROITE(Code Selecteur 02);
   Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + DROITE(Code Selecteur 01) + "-" + DROITE(Code Selecteur 02) + "-" + DROITE(Code Selecteur 03)))
```

**Note** : La formule Excel s'arrête à 3 couleurs pour le cas par défaut.

#### Détails par Nombre de Couleurs

**U (Uni - 1 couleur)**
```
Code Modèle + Code Dimensions + "-" + DROITE(Code Selecteur 01, NBCAR-1)
```
Exemple : `AR1020-02` (si Code Selecteur 01 = "C02")

**B (2 Couleurs)**
```
Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + DROITE(Code Selecteur 01, NBCAR-1) + "-" + DROITE(Code Selecteur 02, NBCAR-1)
```
Exemple : `AR1020-B02-03` (sans tiret entre B et 02, contrairement à `AR1020-B-02-03` en fabrication)

**Par défaut (3+ couleurs)**
```
Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + DROITE(Code Selecteur 01, NBCAR-1) + "-" + DROITE(Code Selecteur 02, NBCAR-1) + "-" + DROITE(Code Selecteur 03, NBCAR-1)
```
Exemple : `AR1020-T02-03-04` (pour 3 couleurs)

## 📊 Exemples Comparatifs

| Nombre Couleurs | Code Modèle | Code Dimensions | Code Selecteurs | Ref Commerciale | Ref Fabrication |
|----------------|-------------|----------------|-----------------|-----------------|-----------------|
| U | AR | 1020 | C01 | `AR1020-01` | `AR1020-01` |
| B | AR | 1020 | C02, C03 | `AR1020-B02-03` | `AR1020-B-02-03` |
| T | AR | 1020 | C02, C03, C04 | `AR1020-T02-03-04` | `AR1020-T-02-03-04` |
| Q | AR | 1020 | C02, C03, C04, C05 | `AR1020-Q02-03-04`* | `AR1020-Q-02-03-04-05` |

*Note : La formule Excel pour la référence commerciale s'arrête à 3 couleurs pour le cas par défaut.

## 🔧 Implémentation

### Backend (Node.js)
Fichier : `backend/src/utils/references.js`

```javascript
const { genererRefFabrication, genererRefCommerciale } = require('./utils/references');

const article = {
  code_modele: 'AR',
  code_dimensions: '1020',
  code_nombre_couleur: 'B',
  code_selecteur_01: 'C02',
  code_selecteur_02: 'C03'
};

const refCommerciale = genererRefCommerciale(article); // "AR1020-B02-03"
const refFabrication = genererRefFabrication(article); // "AR1020-B-02-03"
```

### Frontend (TypeScript)
Fichier : `frontend/src/utils/references.ts`

```typescript
import { genererRefFabrication, genererRefCommerciale } from '../utils/references';

const article = {
  code_modele: 'AR',
  code_dimensions: '1020',
  code_nombre_couleur: 'B',
  code_selecteur_01: 'C02',
  code_selecteur_02: 'C03'
};

const refCommerciale = genererRefCommerciale(article); // "AR1020-B02-03"
const refFabrication = genererRefFabrication(article); // "AR1020-B-02-03"
```

## ✅ Points Importants

1. **DROITE(texte, NBCAR-1)** : Extrait tous les caractères sauf le premier
   - Utilisé pour enlever le "C" des codes couleurs (C02 → 02)

2. **Différence principale** : 
   - **Fabrication** : Tirets supplémentaires après le code couleur (`-B-`, `-T-`, etc.)
   - **Commerciale** : Format compact (`-B`, `-T`, etc.)

3. **Codes Nombre de Couleur** :
   - `U` = Uni (1 couleur)
   - `B` = 2 Couleurs
   - `T` = 3 Couleurs
   - `Q` = 4 Couleurs
   - `C` = 5 Couleurs
   - `S` = 6 Couleurs

4. **Codes Selecteurs** : 
   - Format : `C##` (ex: C01, C02, C03)
   - La fonction DROITE enlève le "C" pour ne garder que le numéro

## 🚀 Utilisation dans le Système

Ces fonctions seront utilisées automatiquement lors de :
- La génération d'articles à partir des modèles
- La création d'articles manuellement
- L'import depuis Excel
- La mise à jour d'articles existants

Les références seront générées automatiquement et ne nécessiteront pas de saisie manuelle.
