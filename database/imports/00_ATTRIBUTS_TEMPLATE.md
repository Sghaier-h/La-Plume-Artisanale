# 📋 Template pour les Attributs

## Tables d'Attributs Disponibles

### 1. **Modèles** (`parametres_modeles`)
- `code_modele` (ex: AR, IB, PO)
- `libelle` (ex: ARTHUR, IBIZA, PONCHO)
- `description` (optionnel)
- `actif` (true/false)

### 2. **Dimensions** (`parametres_dimensions`)
- `code` (ex: 1020, 2426)
- `libelle` (ex: 100/200 CM, 240/260 CM)
- `largeur` (en cm, optionnel)
- `longueur` (en cm, optionnel)
- `actif` (true/false)

### 3. **Finitions** (`parametres_finitions`)
- `code` (ex: FR, OR, BR)
- `libelle` (ex: Frange, Ourlet, Bordure)
- `description` (optionnel)
- `actif` (true/false)

### 4. **Tissages** (`parametres_tissages`)
- `code` (ex: PL, JA, EP)
- `libelle` (ex: Tissage Plat, Jacquard, Eponge)
- `description` (optionnel)
- `actif` (true/false)

### 5. **Couleurs** (`parametres_couleurs`)
- `code_commercial` (ex: C01, C02, C10)
- `nom` (ex: BLANC, ECRU, BLEU MARINE)
- `code_hex` (ex: #FFFFFF, optionnel)
- `actif` (true/false)

### 6. **Types de Produits** (`parametres_types_produits`)
- `code` (ex: FOU, PON, SER)
- `libelle` (ex: Fouta, Poncho, Serviette)
- `description` (optionnel)
- `actif` (true/false)

### 7. **Nombre de Couleurs** (`parametres_nombre_couleurs`)
- `code` (ex: U, B, T, Q)
- `libelle` (ex: Uni, 2 Couleurs, 3 Couleurs)
- `nombre` (1, 2, 3, 4, 5, 6)
- `actif` (true/false)

---

## 📝 Format de Données Accepté

Vous pouvez me donner les données dans n'importe quel format :

### Format 1 : Tableau texte
```
Code | Libelle | Description
AR   | ARTHUR  | Modèle Arthur
IB   | IBIZA   | Modèle Ibiza
```

### Format 2 : CSV
```csv
code_modele,libelle,description
AR,ARTHUR,Modèle Arthur
IB,IBIZA,Modèle Ibiza
```

### Format 3 : Liste simple
```
AR - ARTHUR
IB - IBIZA
PO - PONCHO
```

### Format 4 : Excel
Uploadez votre fichier Excel avec les colonnes correspondantes

---

**Prêt à recevoir vos données d'attributs !** 🎯
