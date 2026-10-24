# Analyse des Fichiers Excel - Excel fab

Ce rapport décrit la structure des fichiers Excel pour adapter l'import/export.

---

## 📄 BOM 2025-2026.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\BOM 2025-2026.xlsx`
- **Nombre de feuilles:** 3

### Feuille: `Matière Première`

- **Dimensions:** 172 lignes × 19 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Type de données` | unknown | 172 |
| 2 | `Numero Métrique` | text | 2 |
| 3 | `Code Couleur` | text | 0 |
| 4 | `Code Fabrication MP` | text | 0 |
| 5 | `Couleur` | text | 0 |
| 6 | `E1` | number | 0 |
| 7 | `E2` | number | 0 |
| 8 | `E3` | number | 0 |
| 9 | `Usine` | number | 0 |
| 10 | `Fabrication` | number | 0 |
| 11 | `Réservé` | number | 0 |
| 12 | `Stock Minimal` | number | 0 |
| 13 | `Stock Disponible` | number | 0 |
| 14 | `Stock Final` | number | 0 |
| 15 | `Demande Transfert Usine` | text | 0 |
| 16 | `Demande Achat` | number | 0 |
| 17 | `Statut Achat` | text | 0 |
| 18 | `QR MP` | text | 0 |
| 19 | `Num de Lot` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Type de données | Numero Métrique | Code Couleur | Code Fabrication MP | Couleur | E1 | E2 | E3 | Usine | Fabrication |
|---|---|---|---|---|---|---|---|---|---|
| nan | NM05 | C01 | NM05-01.00 | BLANC | 0.0 | 140.0 | 0.0 | 11.5 | 8.7 |
| nan | NM15 | C01 | NM15-01.00 | BLANC | 3076.2 | 0.0 | 0.0 | 0.0 | 0.0 |
| nan | NM15 | C02 | NM15-02.00 | ECRU | 77.0 | -106.0 | 0.0 | -175.70000000000002 | 280.54 |

---

### Feuille: `Equipement`

- **Dimensions:** 23 lignes × 20 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num Machine` | text | 0 |
| 2 | `Numéro de série` | number | 5 |
| 3 | `Type Machine` | text | 5 |
| 4 | `Num Série Ratière` | number | 19 |
| 5 | `Type Ratière` | text | 19 |
| 6 | `Système` | text | 0 |
| 7 | `Etat` | text | 0 |
| 8 | `UNITE` | text | 0 |
| 9 | `laize Machine` | number | 3 |
| 10 | `laize actuelle` | number | 5 |
| 11 | `Longeur Peigne` | number | 7 |
| 12 | `Nombre de fil Par Cm` | number | 7 |
| 13 | `Nombre de fil chaine` | number | 9 |
| 14 | `selecteur couleur Installé` | number | 8 |
| 15 | `Cable satin` | text | 7 |
| 16 | `Type de programme` | text | 6 |
| 17 | `Vitesse ( duite par minute)` | number | 1 |
| 18 | `Compteur` | number | 1 |
| 19 | `Unite compteur` | text | 1 |
| 20 | `Parc` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num Machine | Numéro de série | Type Machine | Num Série Ratière | Type Ratière | Système | Etat | UNITE | laize Machine | laize actuelle |
|---|---|---|---|---|---|---|---|---|---|
| M2301 | 36525.0 | HTVS4/S | nan | nan | CADRE | En fonction | Usine | 210.0 | 100.0 |
| M2302 | 36523.0 | HTVS6/S | nan | nan | CADRE | En fonction | Usine | 210.0 | 100.0 |
| M2303 | 36530.0 | HTVS4/S | nan | nan | CADRE | En fonction | Usine | 210.0 | 100.0 |

---

### Feuille: `Base Commandes`

- **Dimensions:** 1000 lignes × 84 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Source` | text | 0 |
| 2 | `Etat` | text | 0 |
| 3 | `ID Commande` | text | 0 |
| 4 | `Num OF` | text | 0 |
| 5 | `Ordre de Fabrication` | number | 0 |
| 6 | `Num Commande` | text | 0 |
| 7 | `Num Client` | text | 0 |
| 8 | `Ref Commercial` | text | 0 |
| 9 | `Ref Fabrication` | text | 0 |
| 10 | `Modèle` | text | 0 |
| 11 | `Dimensions` | text | 0 |
| 12 | `Type de Finition` | text | 0 |
| 13 | `Nombre de couleur` | text | 0 |
| 14 | `Type de Fabrication` | text | 0 |
| 15 | `ID Composant` | text | 0 |
| 16 | `Description Composant` | text | 0 |
| 17 | `Dimensions Composant` | text | 0 |
| 18 | `Personnalisation` | text | 0 |
| 19 | `Qté Commandé Article Final` | number | 0 |
| 20 | `Qté Commandé Composant` | number | 0 |
| 21 | `Qté Réservé` | unknown | 1000 |
| 22 | `Qté Composant à Fabriquer` | number | 0 |
| 23 | `QTE Fabriquer Coupe` | number | 0 |
| 24 | `QTE Deuxieme Fab` | number | 0 |
| 25 | `Deuxieme Approuvee Interne` | number | 0 |
| 26 | `Ourlet` | number | 0 |
| 27 | `Qte Deu Ext` | number | 0 |
| 28 | `Reste A Fabriquer` | number | 0 |
| 29 | `Surplus Fabrication` | number | 0 |
| 30 | `Num Machine` | text | 610 |
| 31 | `Temps de production` | number | 610 |
| 32 | `Compteur à Afficher` | number | 610 |
| 33 | `Etat Préparation MP` | text | 0 |
| 34 | `Etat Tissage` | text | 0 |
| 35 | `Etat Coupe` | text | 0 |
| 36 | `Largeur Tissu` | number | 0 |
| 37 | `Longueur Tissu` | number | 0 |
| 38 | `Métrage Fil Chaîne (m)` | number | 0 |
| 39 | `Duite par CM` | number | 0 |
| 40 | `Nb Duites Total Production` | number | 0 |
| 41 | `Code S01` | text | 0 |
| 42 | `QR MP Réel S01` | text | 880 |
| 43 | `Besoin S01 (kg)` | number | 21 |
| 44 | `Poids Consommé S01` | number | 891 |
| 45 | `Différence S01 (kg)` | number | 0 |
| 46 | `Code S02` | text | 159 |
| 47 | `QR MP Réel S02` | text | 882 |
| 48 | `Besoin S02 (kg)` | number | 21 |
| 49 | `Poids Consommé S02` | number | 901 |
| 50 | `Différence S02 (kg)` | number | 0 |
| 51 | `Code S03` | text | 717 |
| 52 | `QR MP Réel S03` | text | 967 |
| 53 | `Besoin S03 (kg)` | number | 0 |
| 54 | `Poids Consommé S03` | number | 973 |
| 55 | `Différence S03 (kg)` | number | 0 |
| 56 | `Code S04` | text | 849 |
| 57 | `QR MP Réel S04` | text | 996 |
| 58 | `Besoin S04 (kg)` | number | 0 |
| 59 | `Poids Consommé S04` | number | 996 |
| 60 | `Différence S04 (kg)` | number | 0 |
| 61 | `Code S05` | text | 923 |
| 62 | `QR MP Réel S05` | unknown | 1000 |
| 63 | `Besoin S05 (kg)` | number | 0 |
| 64 | `Poids Consommé S05` | unknown | 1000 |
| 65 | `Différence S05 (kg)` | number | 0 |
| 66 | `Code S06` | text | 967 |
| 67 | `QR MP Réel S06` | unknown | 1000 |
| 68 | `Besoin S06 (kg)` | number | 0 |
| 69 | `Poids Consommé S06` | unknown | 1000 |
| 70 | `Différence S06 (kg)` | number | 0 |
| 71 | `Code S07` | unknown | 1000 |
| 72 | `QR MP Réel S07` | unknown | 1000 |
| 73 | `Besoin S07 (kg)` | number | 0 |
| 74 | `Poids Consommé S07` | unknown | 1000 |
| 75 | `Différence S07 (kg)` | number | 0 |
| 76 | `Code S08` | unknown | 1000 |
| 77 | `QR MP Réel S08` | unknown | 1000 |
| 78 | `Besoin S08 (kg)` | number | 0 |
| 79 | `Poids Consommé S08` | unknown | 1000 |
| 80 | `Différence S08 (kg)` | number | 0 |
| 81 | `Total Besoin (kg)` | number | 0 |
| 82 | `Total Consommé (kg)` | number | 0 |
| 83 | `Différence Totale (kg)` | number | 0 |
| 84 | `QR MP` | unknown | 1000 |

#### Exemples de données (premières 5 lignes):

| Source | Etat | ID Commande | Num OF | Ordre de Fabrication | Num Commande | Num Client | Ref Commercial | Ref Fabrication | Modèle |
|---|---|---|---|---|---|---|---|---|---|
| Catalogue | En cours | CA250000 | CA250000 | True | Catalogue | All by Fouta | UNS1020-02 | UNS1020-02 | UNI SURPIQUE |
| Catalogue | En cours | CA250001 | CA250001 | True | Catalogue | All by Fouta | UNS1020-03 | UNS1020-03 | UNI SURPIQUE |
| Catalogue | En cours | CA250002 | CA250002 | True | Catalogue | All by Fouta | UNS1020-04 | UNS1020-04 | UNI SURPIQUE |

---

## 📄 Commandes 2024-2025.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\Commandes 2024-2025.xlsx`
- **Nombre de feuilles:** 2

### Feuille: `Dossier `

- **Dimensions:** 58 lignes × 8 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Unnamed: 0` | text | 5 |
| 2 | `Unnamed: 1` | text | 6 |
| 3 | `Unnamed: 2` | text | 6 |
| 4 | `Unnamed: 3` | text | 6 |
| 5 | `Unnamed: 4` | text | 6 |
| 6 | `Unnamed: 5` | text | 6 |
| 7 | `Unnamed: 6` | text | 6 |
| 8 | `Unnamed: 7` | text | 5 |

#### Exemples de données (premières 5 lignes):

| Unnamed: 0 | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 |
|---|---|---|---|---|---|---|---|
| nan | nan | nan | nan | nan | nan | nan | nan |
| nan | nan | nan | nan | nan | nan | nan | nan |
| nan | nan | nan | nan | nan | nan | nan | nan |

---

### Feuille: `Commandes`

- **Dimensions:** 1000 lignes × 20 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `ID Commande` | text | 0 |
| 2 | `Etat` | text | 0 |
| 3 | `Num Commande Client` | text | 975 |
| 4 | `Num Commande` | text | 0 |
| 5 | `Date d'envoie` | date | 2 |
| 6 | `Num Client` | text | 0 |
| 7 | `Ref Client` | text | 0 |
| 8 | `Ref Commercial` | text | 0 |
| 9 | `Modèle` | text | 0 |
| 10 | `Type de Tissage` | text | 0 |
| 11 | `Code Dimensions` | text | 0 |
| 12 | `Type de Finition` | text | 0 |
| 13 | `Qte commandé` | number | 0 |
| 14 | `Stock` | number | 0 |
| 15 | `Reserve` | number | 0 |
| 16 | `A Fabriquer` | number | 0 |
| 17 | `EAN` | number | 962 |
| 18 | `Personnalisation` | text | 0 |
| 19 | `Détails Personnalisation` | text | 924 |
| 20 | `Ordre de Fabrication` | number | 0 |

#### Exemples de données (premières 5 lignes):

| ID Commande | Etat | Num Commande Client | Num Commande | Date d'envoie | Num Client | Ref Client | Ref Commercial | Modèle | Type de Tissage |
|---|---|---|---|---|---|---|---|---|---|
| OF230339 | Solder | nan | ABF-CM80171 | 2024-01-05 00:00:00 | CL00837 | NDL1020-B12-01 | NDL1020-B12-01 | ND LILI | Tissage Nid d'Abeille |
| OF230342 | Solder | nan | ABF-CM80171 | 2024-01-05 00:00:00 | CL00837 | NDL1020-B09-01 | NDL1020-B09-01 | ND LILI | Tissage Nid d'Abeille |
| OF230364 | Solder | nan | ABF-CM80171 | 2024-01-05 00:00:00 | CL00837 | IB1020-B16-01 | IB1020-B16-01 | IBIZA | Tissage Plat |

---

## 📄 Commandes 2025-2026.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\Commandes 2025-2026.xlsx`
- **Nombre de feuilles:** 5

### Feuille: `Caractéristique`

- **Dimensions:** 87 lignes × 13 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Modèle` | text | 0 |
| 2 | `Code Modèle` | text | 1 |
| 3 | `Type` | text | 73 |
| 4 | `Type de Tissage` | text | 82 |
| 5 | `Code Type de Tissage` | text | 82 |
| 6 | `Dimensions` | text | 61 |
| 7 | `Code Dimensions` | text | 61 |
| 8 | `Type de Finition` | text | 81 |
| 9 | `Code Type De Finition` | text | 81 |
| 10 | `Nombre de couleur` | text | 81 |
| 11 | `Code Nombre de couleur` | text | 81 |
| 12 | `Code Couleur` | text | 50 |
| 13 | `Couleur` | text | 50 |

#### Exemples de données (premières 5 lignes):

| Modèle | Code Modèle | Type | Type de Tissage | Code Type de Tissage | Dimensions | Code Dimensions | Type de Finition | Code Type De Finition | Nombre de couleur |
|---|---|---|---|---|---|---|---|---|---|
| ARTHUR | AR | Coussin Sac | Eponge | EP | 100/160 CM | 1016 | Couture | Cou | 2 Couleurs |
| BALI | BAL | Echarpe | Tissage Jacquard | JA | 100/200 CM | 1020 | Frange | FR | 3 Couleurs |
| BASQUE | BA | Fouta | Tissage Mixte | MIX | 15/35 CM | 0103 | Frange Court | Fcourt | 4 Couleurs |

---

### Feuille: `Base Modele`

- **Dimensions:** 140 lignes × 13 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Modèle` | text | 0 |
| 2 | `Type` | text | 0 |
| 3 | `Code Modèle` | text | 2 |
| 4 | `Code Dimensions` | text | 0 |
| 5 | `Type de Tissage` | text | 0 |
| 6 | `Code Type de Tissage` | text | 0 |
| 7 | `Nombre de couleur` | text | 0 |
| 8 | `Code Nombre de couleur` | text | 0 |
| 9 | `Type de Finition` | text | 0 |
| 10 | `Code Type De Finition` | text | 0 |
| 11 | `Composition Pour Fabrication` | number | 0 |
| 12 | `Prix de reviens` | number | 0 |
| 13 | `Prix de vente` | number | 0 |

#### Exemples de données (premières 5 lignes):

| Modèle | Type | Code Modèle | Code Dimensions | Type de Tissage | Code Type de Tissage | Nombre de couleur | Code Nombre de couleur | Type de Finition | Code Type De Finition |
|---|---|---|---|---|---|---|---|---|---|
| ARTHUR | Fouta | AR | 1020 | Tissage Plat | PL | 2 Couleurs | B | Frange | FR |
| ARTHUR | Fouta | AR | 1020 | Tissage Plat | PL | 3 Couleurs | T | Frange | FR |
| ARTHUR | Fouta | AR | 1626 | Tissage Plat | PL | 2 Couleurs | B | Frange | FR |

---

### Feuille: `Base Article`

- **Dimensions:** 1000 lignes × 24 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Ref Commercial` | text | 0 |
| 2 | `Ref Fabrication` | text | 0 |
| 3 | `Type` | text | 0 |
| 4 | `Modèle` | text | 0 |
| 5 | `Code Modèle` | text | 11 |
| 6 | `Nombre de couleur` | text | 0 |
| 7 | `Code Nombre de couleur` | text | 0 |
| 8 | `Type de Tissage` | text | 0 |
| 9 | `Dimensions` | text | 0 |
| 10 | `Code Dimensions` | text | 0 |
| 11 | `Type de Finition` | text | 0 |
| 12 | `Total Commander` | number | 0 |
| 13 | `Total Envoyer` | number | 0 |
| 14 | `Total A Fabriquer` | number | 0 |
| 15 | `Code Selecteur 01` | text | 0 |
| 16 | `Code Selecteur 02` | text | 7 |
| 17 | `Code Selecteur 03` | text | 676 |
| 18 | `Code Selecteur 04` | text | 823 |
| 19 | `Code Selecteur 05` | text | 913 |
| 20 | `Code Selecteur 06` | text | 992 |
| 21 | `Code Selecteur 07` | unknown | 1000 |
| 22 | `Code Selecteur 08` | unknown | 1000 |
| 23 | `Couleur Article` | text | 747 |
| 24 | `Description Article` | text | 771 |

#### Exemples de données (premières 5 lignes):

| Ref Commercial | Ref Fabrication | Type | Modèle | Code Modèle | Nombre de couleur | Code Nombre de couleur | Type de Tissage | Dimensions | Code Dimensions |
|---|---|---|---|---|---|---|---|---|---|
| AR1020-B02-04 | AR1020-B-02-04 | Fouta | ARTHUR | AR | 2 Couleurs | B | Tissage Plat | 100/200 CM | 1020 |
| AR1020-B02-10 | AR1020-B-02-10 | Fouta | ARTHUR | AR | 2 Couleurs | B | Tissage Plat | 100/200 CM | 1020 |
| AR1020-B03-01 | AR1020-B-03-01 | Fouta | ARTHUR | AR | 2 Couleurs | B | Tissage Plat | 100/200 CM | 1020 |

---

### Feuille: `Catalogue`

- **Dimensions:** 1000 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `ID Commande` | text | 0 |
| 2 | `Num Client` | text | 0 |
| 3 | `Num Commande` | text | 0 |
| 4 | `Ref Commercial` | text | 0 |
| 5 | `Modèle` | text | 0 |
| 6 | `Type de Tissage` | text | 0 |
| 7 | `Code Dimensions` | text | 0 |
| 8 | `Type de Finition` | text | 0 |
| 9 | `Personnalisation` | text | 0 |
| 10 | `QTE minimal Stock` | number | 0 |
| 11 | `Stock Showrrom` | unknown | 1000 |
| 12 | `Stock Fab` | unknown | 1000 |
| 13 | `Reserve` | unknown | 1000 |
| 14 | `A Fabriquer` | number | 0 |
| 15 | `Ordre de Fabrication` | number | 0 |

#### Exemples de données (premières 5 lignes):

| ID Commande | Num Client | Num Commande | Ref Commercial | Modèle | Type de Tissage | Code Dimensions | Type de Finition | Personnalisation | QTE minimal Stock |
|---|---|---|---|---|---|---|---|---|---|
| CA250000 | All by Fouta | Catalogue | UNS1020-02 | UNI SURPIQUE | Tissage Plat | 1020 | Frange | Non | 60 |
| CA250001 | All by Fouta | Catalogue | UNS1020-03 | UNI SURPIQUE | Tissage Plat | 1020 | Frange | Non | 60 |
| CA250002 | All by Fouta | Catalogue | UNS1020-04 | UNI SURPIQUE | Tissage Plat | 1020 | Frange | Non | 60 |

---

### Feuille: `Commandes`

- **Dimensions:** 336 lignes × 20 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `ID Commande` | text | 0 |
| 2 | `Etat` | text | 0 |
| 3 | `Date d'envoie` | date | 0 |
| 4 | `Num Commande Client` | text | 298 |
| 5 | `Num Commande` | text | 0 |
| 6 | `Num Client` | text | 0 |
| 7 | `Ref Client` | text | 0 |
| 8 | `Ref Commercial` | text | 0 |
| 9 | `Modèle` | text | 0 |
| 10 | `Type de Tissage` | text | 0 |
| 11 | `Code Dimensions` | text | 0 |
| 12 | `Type de Finition` | text | 0 |
| 13 | `Qte commandé` | number | 0 |
| 14 | `Stock` | number | 319 |
| 15 | `Reserve` | number | 67 |
| 16 | `A Fabriquer` | number | 0 |
| 17 | `EAN` | unknown | 336 |
| 18 | `Personnalisation` | text | 0 |
| 19 | `Détails Personnalisation` | text | 335 |
| 20 | `Ordre de Fabrication` | number | 0 |

#### Exemples de données (premières 5 lignes):

| ID Commande | Etat | Date d'envoie | Num Commande Client | Num Commande | Num Client | Ref Client | Ref Commercial | Modèle | Type de Tissage |
|---|---|---|---|---|---|---|---|---|---|
| OF249780 | En cours | 2026-01-23 00:00:00 | nan | CM-FT0119 | CL00884 | REF224675 | IB1020-B29-01 | IBIZA | Tissage Plat |
| OF249781 | En cours | 2026-01-23 00:00:00 | nan | CM-FT0119 | CL00884 | REF224674 | IB1020-B20-01 | IBIZA | Tissage Plat |
| OF249782 | En cours | 2026-01-23 00:00:00 | nan | CM-FT0119 | CL00884 | REF224679 | IB1020-B24-01 | IBIZA | Tissage Plat |

---

## 📄 Donnée collecte.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\Donnée collecte.xlsx`
- **Nombre de feuilles:** 11

### Feuille: `Base Commandes `

- **Dimensions:** 1000 lignes × 31 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Source` | text | 0 |
| 2 | `Etat` | text | 0 |
| 3 | `ID Commande` | text | 0 |
| 4 | `Num OF` | text | 0 |
| 5 | `Ordre de Fabrication` | number | 0 |
| 6 | `Num Commande` | text | 0 |
| 7 | `Num Client` | text | 0 |
| 8 | `Ref Commercial` | text | 0 |
| 9 | `Ref Fabrication` | text | 0 |
| 10 | `Modèle` | text | 0 |
| 11 | `Dimensions` | text | 0 |
| 12 | `Type de Finition` | text | 0 |
| 13 | `Nombre de couleur` | text | 0 |
| 14 | `Type de Fabrication` | text | 0 |
| 15 | `ID Composant` | text | 0 |
| 16 | `Description Composant` | text | 0 |
| 17 | `Dimensions Composant` | text | 0 |
| 18 | `Personnalisation` | text | 0 |
| 19 | `Qté Commandé` | number | 0 |
| 20 | `Qté Réservé` | number | 0 |
| 21 | `Qté Composant à Fabriquer` | number | 0 |
| 22 | `QTE Fabriquer Coupe` | number | 0 |
| 23 | `QTE Deuxieme Fab` | number | 0 |
| 24 | `Deuxieme Approuvee Interne` | number | 0 |
| 25 | `Ourlet` | number | 0 |
| 26 | `Qte Deu Ext` | number | 0 |
| 27 | `Reste A Fabriquer` | number | 0 |
| 28 | `Num Machine` | unknown | 1000 |
| 29 | `Etat Préparation MP` | text | 0 |
| 30 | `Etat Tissage` | text | 0 |
| 31 | `Etat Coupe` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Source | Etat | ID Commande | Num OF | Ordre de Fabrication | Num Commande | Num Client | Ref Commercial | Ref Fabrication | Modèle |
|---|---|---|---|---|---|---|---|---|---|
| Commandes 2024-2025 | Solder | OF243621 | OF243621 | False | CM-FT0008 | CL00886 | IB1020-B33-01 | IB1020-B-33-01 | IBIZA |
| Commandes 2024-2025 | Solder | OF243622 | OF243622 | False | CM-FT0008 | CL00886 | IB1020-B34-01 | IB1020-B-34-01 | IBIZA |
| Commandes 2024-2025 | Solder | OF243623 | OF243623 | False | CM-FT0008 | CL00886 | IB1020-B02-04 | IB1020-B-02-04 | IBIZA |

---

### Feuille: `coordonne sous traitant`

- **Dimensions:** 42 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `NOM` | text | 27 |
| 2 | `PRENOM` | text | 0 |
| 3 | `NUM DE TEL` | text | 17 |
| 4 | `SERVICE` | text | 0 |
| 5 | `ADRESSE` | text | 26 |
| 6 | `RECTO CIN` | unknown | 42 |
| 7 | `VERSO CIN` | unknown | 42 |
| 8 | `NOTE` | unknown | 42 |
| 9 | `TERMINAL` | text | 0 |
| 10 | `DATE` | date | 0 |
| 11 | `Identification` | text | 0 |
| 12 | `Total Sortis` | number | 0 |
| 13 | `Total Retour` | number | 0 |
| 14 | `Reste A Retourner` | number | 0 |
| 15 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| NOM | PRENOM | NUM DE TEL | SERVICE | ADRESSE | RECTO CIN | VERSO CIN | NOTE | TERMINAL | DATE |
|---|---|---|---|---|---|---|---|---|---|
| Gannoun | Abed | 93491729 | Frange | BANNEN | nan | nan | nan | Manuel | 2025-09-15 00:00:00 |
| nan | Abir | nan | Frange | nan | nan | nan | nan | Manuel | 2025-09-15 00:00:00 |
| Chakroun | Adel | 29596798 | Couture | nan | nan | nan | nan | Manuel | 2025-09-15 00:00:00 |

---

### Feuille: `Mouvement mp`

- **Dimensions:** 1000 lignes × 19 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `QR Mouvement` | text | 0 |
| 2 | `Type D'opération` | text | 0 |
| 3 | `Depart` | text | 0 |
| 4 | `Destination` | text | 0 |
| 5 | `Poids` | number | 0 |
| 6 | `Photo` | text | 848 |
| 7 | `Note` | text | 0 |
| 8 | `Terminal` | text | 0 |
| 9 | `Date` | date | 0 |
| 10 | `QR MP` | text | 0 |
| 11 | `Num OF` | text | 277 |
| 12 | `Numero Selecteur` | text | 277 |
| 13 | `Code Couleur` | text | 0 |
| 14 | `Couleur` | text | 0 |
| 15 | `Code Fabrication MP` | text | 0 |
| 16 | `Num de Lot` | text | 0 |
| 17 | `Mouvement` | number | 0 |
| 18 | `Contrôle Saisis` | text | 0 |
| 19 | `REF FAB` | text | 285 |

#### Exemples de données (premières 5 lignes):

| QR Mouvement | Type D'opération | Depart | Destination | Poids | Photo | Note | Terminal | Date | QR MP |
|---|---|---|---|---|---|---|---|---|---|
| C17_EMAURAUDE_NM15-17.00_61571 | Retour Fabrication | Fabrication | Usine | 0.95 | nan | RAS | Manuel | 2025-09-08 00:00:00 | C17_EMAURAUDE_NM15-17.00_61571 |
| C11_BLEU GITANE_NM15-11.00_616 | Retour Fabrication | Fabrication | Usine | 0.85 | nan | RAS | Manuel | 2025-09-08 00:00:00 | C11_BLEU GITANE_NM15-11.00_616 |
| C01_BLANC_NM15-01.00_62721_CA2 | Retour Fabrication | Fabrication | Usine | 0.6 | nan | RAS | Manuel | 2025-09-08 00:00:00 | C01_BLANC_NM15-01.00_62721 |

---

### Feuille: `Mouvement Fourniture`

- **Dimensions:** 72 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `ID Commande` | text | 64 |
| 2 | `QR Fourniture` | text | 0 |
| 3 | `Type D'opération` | text | 0 |
| 4 | `Qte Entree` | number | 8 |
| 5 | `Qte Sortis` | number | 64 |
| 6 | `Photo` | text | 70 |
| 7 | `Note` | text | 70 |
| 8 | `Terminal` | text | 0 |
| 9 | `Date` | date | 0 |
| 10 | `Contrôle Saisis` | text | 0 |
| 11 | `Type` | text | 0 |
| 12 | `Mouvement` | number | 0 |
| 13 | `Référence` | text | 0 |
| 14 | `Libele` | text | 4 |
| 15 | `Num Client` | text | 64 |

#### Exemples de données (premières 5 lignes):

| ID Commande | QR Fourniture | Type D'opération | Qte Entree | Qte Sortis | Photo | Note | Terminal | Date | Contrôle Saisis |
|---|---|---|---|---|---|---|---|---|---|
| nan | Couture_BB | Inventaire | 52.0 | nan | nan | nan | Manuel | 2025-09-15 00:00:00 | Correcte |
| nan | Couture_BN | Inventaire | 17.0 | nan | nan | nan | Manuel | 2025-09-15 00:00:00 | Correcte |
| nan | Etiquette_TABF100C | Inventaire | 2100.0 | nan | nan | nan | Manuel | 2025-09-15 00:00:00 | Correcte |

---

### Feuille: `Tissage`

- **Dimensions:** 1000 lignes × 11 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `QR Tissage` | text | 0 |
| 2 | `Opérateur` | text | 0 |
| 3 | `Type D'opération` | text | 0 |
| 4 | `Compteur` | unknown | 1000 |
| 5 | `Photo` | unknown | 1000 |
| 6 | `Note` | text | 0 |
| 7 | `Terminale` | text | 0 |
| 8 | `Date` | date | 0 |
| 9 | `Machine` | text | 0 |
| 10 | `Num OF` | text | 0 |
| 11 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| QR Tissage | Opérateur | Type D'opération | Compteur | Photo | Note | Terminale | Date | Machine | Num OF |
|---|---|---|---|---|---|---|---|---|---|
| M2307_OF230500 | Ridha | Départ | nan | nan | RAS | Manuel | 2023-12-30 00:00:00 | M2307 | OF230500 |
| M2309_OF230518 | Ridha | Départ | nan | nan | RAS | Manuel | 2023-12-30 00:00:00 | M2309 | OF230518 |
| M2310_OF230544 | Ridha | Départ | nan | nan | RAS | Manuel | 2023-12-30 00:00:00 | M2310 | OF230544 |

---

### Feuille: `Coupe`

- **Dimensions:** 1000 lignes × 20 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num OF` | text | 0 |
| 2 | `Personne` | text | 0 |
| 3 | `Date Tissage` | date | 0 |
| 4 | `QTE` | number | 0 |
| 5 | `QTE DEUXIEME` | number | 0 |
| 6 | `DECHET` | number | 0 |
| 7 | `DEUXIEME APPROUVEE` | number | 0 |
| 8 | `OURLET` | number | 0 |
| 9 | `TYPE DEXIEME` | unknown | 1000 |
| 10 | `PHOTO` | unknown | 1000 |
| 11 | `TERMINAL` | text | 0 |
| 12 | `Date` | date | 0 |
| 13 | `Type D'opération` | text | 0 |
| 14 | `Num Machine` | text | 0 |
| 15 | `Num Client` | text | 42 |
| 16 | `Num Commande` | text | 42 |
| 17 | `Ref Fabrication` | text | 42 |
| 18 | `Description` | text | 42 |
| 19 | `Dimensions` | text | 42 |
| 20 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num OF | Personne | Date Tissage | QTE | QTE DEUXIEME | DECHET | DEUXIEME APPROUVEE | OURLET | TYPE DEXIEME | PHOTO |
|---|---|---|---|---|---|---|---|---|---|
| OF230566 | Dimatex | 2023-12-30 00:00:00 | 141 | 0 | 0 | 0 | 0 | nan | nan |
| OF230567 | Dimatex | 2023-12-30 00:00:00 | 190 | 1 | 0 | 0 | 0 | nan | nan |
| OF240001 | Autre | 2023-12-30 00:00:00 | 76 | 0 | 0 | 0 | 0 | nan | nan |

---

### Feuille: `Mvtst`

- **Dimensions:** 1000 lignes × 18 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num Suivis` | text | 0 |
| 2 | `Sous Traitant` | text | 0 |
| 3 | `QTE SORTIS` | number | 0 |
| 4 | `QTE RETOUR` | number | 0 |
| 5 | `PHOTO` | unknown | 1000 |
| 6 | `Terminal` | text | 0 |
| 7 | `Date` | date | 0 |
| 8 | `Num OF` | text | 0 |
| 9 | `RESTE A RETOURNEE` | number | 0 |
| 10 | `Entrepot` | text | 0 |
| 11 | `Type D'opération` | text | 0 |
| 12 | `Num Commande` | text | 6 |
| 13 | `Num Client` | text | 6 |
| 14 | `Ref Fabrication` | text | 6 |
| 15 | `Description` | text | 6 |
| 16 | `Dimensions` | text | 6 |
| 17 | `Existance` | number | 0 |
| 18 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num Suivis | Sous Traitant | QTE SORTIS | QTE RETOUR | PHOTO | Terminal | Date | Num OF | RESTE A RETOURNEE | Entrepot |
|---|---|---|---|---|---|---|---|---|---|
| OF230387 | AliSassi | 21 | 0 | nan | Manuel | 2024-01-03 00:00:00 | OF230387 | 0 | Usine |
| OF230500 | AliSassi | 25 | 0 | nan | Manuel | 2024-01-03 00:00:00 | OF230500 | 0 | Usine |
| OF230501 | AliSassi | 65 | 0 | nan | Manuel | 2024-01-03 00:00:00 | OF230501 | 0 | Usine |

---

### Feuille: `Qualite`

- **Dimensions:** 63 lignes × 17 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num suivis` | text | 0 |
| 2 | `DEUXIEME EXTERNE` | number | 0 |
| 3 | `DEUXIEME APPROUVEE` | number | 0 |
| 4 | `OURLET` | number | 0 |
| 5 | `PHOTO` | text | 47 |
| 6 | `TYPE DE DEUXIEME` | text | 0 |
| 7 | `TERMINALE` | text | 0 |
| 8 | `DATE` | date | 0 |
| 9 | `Num OF` | text | 0 |
| 10 | `Num Commande` | text | 0 |
| 11 | `Num Client` | text | 0 |
| 12 | `Ref Fabrication` | text | 0 |
| 13 | `Description` | text | 0 |
| 14 | `Dimensions` | text | 0 |
| 15 | `Sous Traitant` | text | 0 |
| 16 | `Type D'opération` | text | 0 |
| 17 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num suivis | DEUXIEME EXTERNE | DEUXIEME APPROUVEE | OURLET | PHOTO | TYPE DE DEUXIEME | TERMINALE | DATE | Num OF | Num Commande |
|---|---|---|---|---|---|---|---|---|---|
| CA250070 | 1 | 0 | 0 | nan | Tache | Manuel | 2025-09-22 00:00:00 | CA250070 | Catalogue |
| OF242496 | 1 | 0 | 0 | nan | Tache | Manuel | 2025-09-22 00:00:00 | OF242496 | ABF-CM90226 |
| CA250397 | 1 | 0 | 0 | nan | Tache | Manuel | 2025-09-22 00:00:00 | CA250397 | Catalogue |

---

### Feuille: `Mvt Inter-entrepot`

- **Dimensions:** 1000 lignes × 16 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num suivis` | text | 0 |
| 2 | `Type` | text | 0 |
| 3 | `Entrepot Depart` | text | 0 |
| 4 | `Entrepot Destination` | text | 0 |
| 5 | `QTE` | number | 0 |
| 6 | `Photo` | text | 421 |
| 7 | `TERMINAL` | text | 0 |
| 8 | `DATE` | date | 0 |
| 9 | `Mouvement` | number | 0 |
| 10 | `Num OF` | text | 0 |
| 11 | `Num Commande` | text | 0 |
| 12 | `Num Client` | text | 0 |
| 13 | `Ref Commercial` | text | 0 |
| 14 | `Modèle` | text | 0 |
| 15 | `Dimensions` | text | 0 |
| 16 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num suivis | Type | Entrepot Depart | Entrepot Destination | QTE | Photo | TERMINAL | DATE | Mouvement | Num OF |
|---|---|---|---|---|---|---|---|---|---|
| CA250001 | Produit Finis | Inventaire | Showroom | 55 | nan | Manuel | 2025-09-15 00:00:00 | -55 | CA250001 |
| CA250002 | Produit Finis | Inventaire | Showroom | 49 | nan | Manuel | 2025-09-15 00:00:00 | -49 | CA250002 |
| CA250040 | Produit Finis | Inventaire | Showroom | 31 | nan | Manuel | 2025-09-15 00:00:00 | -31 | CA250040 |

---

### Feuille: `Liste de Colisage`

- **Dimensions:** 1000 lignes × 18 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num de Colis` | number | 0 |
| 2 | `QR Commande` | text | 0 |
| 3 | `Num Suivis` | text | 0 |
| 4 | `Quantité` | number | 0 |
| 5 | `PHOTO` | unknown | 1000 |
| 6 | `NOTE` | unknown | 1000 |
| 7 | `Terminal` | text | 0 |
| 8 | `Date` | date | 0 |
| 9 | `Emplacement` | text | 0 |
| 10 | `Facture export` | text | 0 |
| 11 | `ID Commande` | text | 0 |
| 12 | `Num Client` | text | 0 |
| 13 | `Num Commande` | text | 0 |
| 14 | `Ref commercial` | text | 497 |
| 15 | `Modèle` | text | 497 |
| 16 | `Dimensions` | text | 497 |
| 17 | `Bon de livraison` | text | 0 |
| 18 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num de Colis | QR Commande | Num Suivis | Quantité | PHOTO | NOTE | Terminal | Date | Emplacement | Facture export |
|---|---|---|---|---|---|---|---|---|---|
| 64716 | All By Fouta_Stock_OF247019 | OF247019 | 20 | nan | nan | KARIM | 2022-12-30 00:00:00 | PAL725 | ATF100041 |
| 64991 | All By Fouta_Stock_OF247020 | OF247020 | 20 | nan | nan | KARIM | 2023-01-18 00:00:00 | PAL725 | ATF100041 |
| 64992 | All By Fouta_Stock_OF247020 | OF247020 | 20 | nan | nan | KARIM | 2023-01-18 00:00:00 | PAL725 | ATF100041 |

---

### Feuille: `Liste Palette`

- **Dimensions:** 1000 lignes × 9 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num de Palette` | text | 0 |
| 2 | `Num De colis` | text | 0 |
| 3 | `Facture Export` | text | 0 |
| 4 | `Transporteur` | text | 0 |
| 5 | `Photo` | unknown | 1000 |
| 6 | `Note` | unknown | 1000 |
| 7 | `Terminale` | text | 0 |
| 8 | `Date` | date | 0 |
| 9 | `Contrôle Saisis` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num de Palette | Num De colis | Facture Export | Transporteur | Photo | Note | Terminale | Date | Contrôle Saisis |
|---|---|---|---|---|---|---|---|---|
| PAL907 | C073-209 | PA-F25022 | BESSON | nan | nan | Manuel | 1900-01-01 00:00:00 | Correcte |
| PAL725 | 64716 | ATF100041 | BESSON | nan | nan | Manuel | 2022-12-30 00:00:00 | Correcte |
| PAL725 | 64991 | ATF100041 | BESSON | nan | nan | Manuel | 2023-01-18 00:00:00 | Correcte |

---

## 📄 Paramétrages.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\Paramétrages.xlsx`
- **Nombre de feuilles:** 5

### Feuille: `Equipement`

- **Dimensions:** 23 lignes × 20 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num Machine` | text | 0 |
| 2 | `Numéro de série` | number | 5 |
| 3 | `Type Machine` | text | 5 |
| 4 | `Num Série Ratière` | number | 19 |
| 5 | `Type Ratière` | text | 19 |
| 6 | `Système` | text | 0 |
| 7 | `Etat` | text | 0 |
| 8 | `UNITE` | text | 0 |
| 9 | `laize Machine` | number | 3 |
| 10 | `laize actuelle` | number | 5 |
| 11 | `Longeur Peigne` | number | 7 |
| 12 | `Nombre de fil Par Cm` | number | 7 |
| 13 | `Nombre de fil chaine` | number | 9 |
| 14 | `selecteur couleur Installé` | number | 8 |
| 15 | `Cable satin` | text | 7 |
| 16 | `Type de programme` | text | 6 |
| 17 | `Vitesse ( duite par minute)` | number | 1 |
| 18 | `Compteur` | number | 1 |
| 19 | `Unite compteur` | text | 1 |
| 20 | `Parc` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Num Machine | Numéro de série | Type Machine | Num Série Ratière | Type Ratière | Système | Etat | UNITE | laize Machine | laize actuelle |
|---|---|---|---|---|---|---|---|---|---|
| M2301 | 36525.0 | HTVS4/S | nan | nan | CADRE | En fonction | Usine | 210.0 | 100.0 |
| M2302 | 36523.0 | HTVS6/S | nan | nan | CADRE | En fonction | Usine | 210.0 | 100.0 |
| M2303 | 36530.0 | HTVS4/S | nan | nan | CADRE | En fonction | Usine | 210.0 | 100.0 |

---

### Feuille: `Equipe de Fabrication`

- **Dimensions:** 6 lignes × 7 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Nom` | text | 0 |
| 2 | `Fonction` | text | 0 |
| 3 | `Parc Machine` | text | 0 |
| 4 | `Equipe` | text | 0 |
| 5 | `Horaire Journaliere` | number | 0 |
| 6 | `Jour/Semaine` | number | 0 |
| 7 | `Taux Horaire` | number | 0 |

#### Exemples de données (premières 5 lignes):

| Nom | Fonction | Parc Machine | Equipe | Horaire Journaliere | Jour/Semaine | Taux Horaire |
|---|---|---|---|---|---|---|
| Najeh | Tisseur | Parc02 | Equipe1 | 8 | 6 | 4.695 |
| Mohamed | Mecanicien | Parc01&Parc02&Parc03 | Equipe2 | 8 | 6 | 7.199 |
| Habib | Mecanicien | Parc01&Parc02&Parc03 | Equipe1 | 8 | 6 | 7.199 |

---

### Feuille: `Opération de Fabrication`

- **Dimensions:** 11 lignes × 3 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Code Opération` | text | 0 |
| 2 | `Opération` | text | 0 |
| 3 | `Unité` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Code Opération | Opération | Unité |
|---|---|---|
| PMP | Préparation matière première | Magasin Matière première |
| TI | Tissage | Fabrication |
| COU | Coupe | Fabrication |

---

### Feuille: `Paramétrage Master`

- **Dimensions:** 216 lignes × 13 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Code paramétrage` | text | 0 |
| 2 | `Produit` | text | 0 |
| 3 | `Modèle` | text | 0 |
| 4 | `Code Modèle` | text | 12 |
| 5 | `Type de Tissage` | text | 0 |
| 6 | `Code Type de Tissage` | text | 0 |
| 7 | `Dimensions` | text | 0 |
| 8 | `Code Dimensions` | text | 0 |
| 9 | `Type de Finition` | text | 0 |
| 10 | `Code Type De Finition` | text | 0 |
| 11 | `Type de Fabrication` | text | 0 |
| 12 | `Nombre de couleur` | text | 0 |
| 13 | `Code Nombre de couleur` | text | 0 |

#### Exemples de données (premières 5 lignes):

| Code paramétrage | Produit | Modèle | Code Modèle | Type de Tissage | Code Type de Tissage | Dimensions | Code Dimensions | Type de Finition | Code Type De Finition |
|---|---|---|---|---|---|---|---|---|---|
| AR1020(FR)-B | Fouta | ARTHUR | AR | Tissage Plat | PL | 100/200 CM | 1020 | Frange | FR |
| AR1020(FR)-T | Fouta | ARTHUR | AR | Tissage Plat | PL | 100/200 CM | 1020 | Frange | FR |
| AR1626(FR)-B | Jeté | ARTHUR | AR | Tissage Plat | PL | 160/260 CM | 1626 | Frange | FR |

---

### Feuille: `Parametrage composant`

- **Dimensions:** 230 lignes × 25 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Code paramétrage Parent` | text | 0 |
| 2 | `Type De Fabrication` | text | 0 |
| 3 | `ID Composant` | text | 0 |
| 4 | `Qté par Unité` | number | 0 |
| 5 | `Description` | text | 0 |
| 6 | `Dimensions` | text | 0 |
| 7 | `Code Dimensions` | text | 0 |
| 8 | `Type de Finition` | text | 0 |
| 9 | `Code Type De Finition` | text | 0 |
| 10 | `LARGEUR TISSAGE` | number | 0 |
| 11 | `LONGEUR TISSAGE` | number | 0 |
| 12 | `Nombre de couleur` | text | 0 |
| 13 | `Code Nombre de couleur` | text | 0 |
| 14 | `Qualite` | text | 0 |
| 15 | `Code Qualite` | text | 0 |
| 16 | `DUITE PAR CM` | number | 0 |
| 17 | `Nombre de Duite Total` | number | 0 |
| 18 | `Consommation Selecteur 01` | number | 5 |
| 19 | `Consommation Selecteur 02` | number | 5 |
| 20 | `Consommation Selecteur 03` | number | 1 |
| 21 | `Consommation Selecteur 04` | number | 1 |
| 22 | `Consommation Selecteur 05` | number | 1 |
| 23 | `Consommation Selecteur 06` | number | 1 |
| 24 | `Consommation Selecteur 07` | number | 1 |
| 25 | `Consommation Selecteur 08` | number | 1 |

#### Exemples de données (premières 5 lignes):

| Code paramétrage Parent | Type De Fabrication | ID Composant | Qté par Unité | Description | Dimensions | Code Dimensions | Type de Finition | Code Type De Finition | LARGEUR TISSAGE |
|---|---|---|---|---|---|---|---|---|---|
| AR1020(FR)-B | Unique | AR1020(FR)-B | 1.0 | Fouta Modele ARTHUR | 100/200 CM | 1020 | Frange | FR | 100 |
| AR1020(FR)-T | Unique | AR1020(FR)-T | 1.0 | Fouta Modele ARTHUR | 100/200 CM | 1020 | Frange | FR | 100 |
| AR1626(FR)-B | Unique | AR1626(FR)-B | 1.0 | Jeté Modele ARTHUR | 160/260 CM | 1626 | Frange | FR | 160 |

---

## 📄 Qualite et Rendement.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\Qualite et Rendement.xlsx`
- **Nombre de feuilles:** 5

### Feuille: `Rendement Tissage`

- **Dimensions:** 1000 lignes × 35 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Num OF` | text | 0 |
| 2 | `Personne` | text | 0 |
| 3 | `Date Tissage` | date | 0 |
| 4 | `QTE` | number | 0 |
| 5 | `QTE DEUXIEME` | number | 0 |
| 6 | `DECHET` | number | 0 |
| 7 | `DEUXIEME APPROUVEE` | number | 0 |
| 8 | `OURLET` | number | 0 |
| 9 | `TYPE DEXIEME` | unknown | 1000 |
| 10 | `TERMINAL` | text | 0 |
| 11 | `Date` | date | 0 |
| 12 | `Type D'opération` | text | 0 |
| 13 | `Num Machine` | text | 0 |
| 14 | `Num Client` | text | 0 |
| 15 | `Num Commande` | text | 0 |
| 16 | `Ref Fabrication` | text | 0 |
| 17 | `Description` | text | 0 |
| 18 | `Dimensions` | text | 0 |
| 19 | `Contrôle Saisis` | text | 0 |
| 20 | `Code Dimensions` | number | 0 |
| 21 | `Modèle` | text | 114 |
| 22 | `Code Modèle` | text | 114 |
| 23 | `Prix_Revient` | number | 0 |
| 24 | `Prix_Vente` | number | 0 |
| 25 | `Total_Revient_DT` | number | 0 |
| 26 | `Total_Vente_DT` | number | 0 |
| 27 | `Perte_Dechet_DT` | number | 0 |
| 28 | `Perte_Deuxieme_DT` | number | 0 |
| 29 | `Perte_Ourlet_DT` | number | 0 |
| 30 | `Perte_Totale_DT` | number | 0 |
| 31 | `Gain_Approuve_DT` | number | 0 |
| 32 | `Qte_Totale_Brute` | number | 0 |
| 33 | `Taux_Perte_%` | number | 0 |
| 34 | `Marge_Nette_DT` | number | 0 |
| 35 | `Alerte_Prix` | text | 879 |

#### Exemples de données (premières 5 lignes):

| Num OF | Personne | Date Tissage | QTE | QTE DEUXIEME | DECHET | DEUXIEME APPROUVEE | OURLET | TYPE DEXIEME | TERMINAL |
|---|---|---|---|---|---|---|---|---|---|
| OF230566 | Dimatex | 2023-12-30 00:00:00 | 141 | 0 | 0 | 0 | 0 | nan | Manuel |
| OF230567 | Dimatex | 2023-12-30 00:00:00 | 190 | 1 | 0 | 0 | 0 | nan | Manuel |
| OF230567 | Dimatex | 2024-01-04 00:00:00 | 33 | 4 | 0 | 0 | 0 | nan | Manuel |

---

### Feuille: `Recap jour`

- **Dimensions:** 1000 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Personne` | text | 0 |
| 2 | `Date` | number | 0 |
| 3 | `Dimensions` | text | 140 |
| 4 | `Qte_Premiere` | number | 0 |
| 5 | `Qte_Deuxieme` | number | 0 |
| 6 | `Qte_Dechet` | number | 0 |
| 7 | `Qte_Ourlet` | number | 0 |
| 8 | `Qte_Deuxieme_Approuve` | number | 0 |
| 9 | `Perte_Dechet_DT` | number | 0 |
| 10 | `Perte_Deuxieme_DT` | number | 0 |
| 11 | `Perte_Ourlet_DT` | number | 0 |
| 12 | `Perte_Totale_DT` | number | 0 |
| 13 | `Gain_Approuve_DT` | number | 0 |
| 14 | `Taux_Qualite_%` | number | 0 |
| 15 | `Perte_Nette_DT` | number | 0 |

#### Exemples de données (premières 5 lignes):

| Personne | Date | Dimensions | Qte_Premiere | Qte_Deuxieme | Qte_Dechet | Qte_Ourlet | Qte_Deuxieme_Approuve | Perte_Dechet_DT | Perte_Deuxieme_DT |
|---|---|---|---|---|---|---|---|---|---|
| Dimatex | 45290 | 90/180 CM | 331 | 1 | 0 | 0 | 0 | 0.0 | 20.8 |
| Dimatex | 45295 | 90/180 CM | 81 | 4 | 0 | 0 | 0 | 0.0 | 83.2 |
| Samir | 45334 | 100/200 CM | 156 | 2 | 0 | 0 | 0 | 0.0 | 19.5 |

---

### Feuille: `Recap semaine`

- **Dimensions:** 1000 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Personne` | text | 0 |
| 2 | `Periode_Semaine` | text | 0 |
| 3 | `Dimensions` | text | 134 |
| 4 | `Qte_Premiere` | number | 0 |
| 5 | `Qte_Deuxieme` | number | 0 |
| 6 | `Qte_Dechet` | number | 0 |
| 7 | `Qte_Ourlet` | number | 0 |
| 8 | `Qte_Deuxieme_Approuve` | number | 0 |
| 9 | `Perte_Dechet_DT` | number | 0 |
| 10 | `Perte_Deuxieme_DT` | number | 0 |
| 11 | `Perte_Ourlet_DT` | number | 0 |
| 12 | `Perte_Totale_DT` | number | 0 |
| 13 | `Gain_Approuve_DT` | number | 0 |
| 14 | `Taux_Qualite_%` | number | 0 |
| 15 | `Perte_Nette_DT` | number | 0 |

#### Exemples de données (premières 5 lignes):

| Personne | Periode_Semaine | Dimensions | Qte_Premiere | Qte_Deuxieme | Qte_Dechet | Qte_Ourlet | Qte_Deuxieme_Approuve | Perte_Dechet_DT | Perte_Deuxieme_DT |
|---|---|---|---|---|---|---|---|---|---|
| Dimatex | 2023-S53 | 90/180 CM | 331 | 1 | 0 | 0 | 0 | 0.0 | 20.8 |
| Dimatex | 2024-S01 | 90/180 CM | 81 | 4 | 0 | 0 | 0 | 0.0 | 83.2 |
| Samir | 2024-S07 | 100/200 CM | 928 | 15 | 0 | 0 | 0 | 0.0 | 78.0 |

---

### Feuille: `Recap mois`

- **Dimensions:** 500 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Personne` | text | 0 |
| 2 | `Periode_Mois` | text | 1 |
| 3 | `Dimensions` | text | 69 |
| 4 | `Qte_Premiere` | number | 0 |
| 5 | `Qte_Deuxieme` | number | 0 |
| 6 | `Qte_Dechet` | number | 0 |
| 7 | `Qte_Ourlet` | number | 0 |
| 8 | `Qte_Deuxieme_Approuve` | number | 0 |
| 9 | `Perte_Dechet_DT` | number | 0 |
| 10 | `Perte_Deuxieme_DT` | number | 0 |
| 11 | `Perte_Ourlet_DT` | number | 0 |
| 12 | `Perte_Totale_DT` | number | 0 |
| 13 | `Gain_Approuve_DT` | number | 0 |
| 14 | `Taux_Qualite_%` | number | 0 |
| 15 | `Perte_Nette_DT` | number | 0 |

#### Exemples de données (premières 5 lignes):

| Personne | Periode_Mois | Dimensions | Qte_Premiere | Qte_Deuxieme | Qte_Dechet | Qte_Ourlet | Qte_Deuxieme_Approuve | Perte_Dechet_DT | Perte_Deuxieme_DT |
|---|---|---|---|---|---|---|---|---|---|
| Dimatex | 2023-12 | 90/180 CM | 331 | 1 | 0 | 0 | 0 | 0.0 | 20.8 |
| Dimatex | 2024-01 | 90/180 CM | 457 | 45 | 0 | 0 | 0 | 0.0 | 936.0000000000001 |
| Samir | 2024-02 | 100/200 CM | 3119 | 25 | 0 | 0 | 0 | 0.0 | 149.5 |

---

### Feuille: `Recap global personne`

- **Dimensions:** 24 lignes × 13 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `Personne` | text | 0 |
| 2 | `Qte_Premiere` | number | 0 |
| 3 | `Qte_Deuxieme` | number | 0 |
| 4 | `Qte_Dechet` | number | 0 |
| 5 | `Qte_Ourlet` | number | 0 |
| 6 | `Qte_Deuxieme_Approuve` | number | 0 |
| 7 | `Perte_Dechet_DT` | number | 0 |
| 8 | `Perte_Deuxieme_DT` | number | 0 |
| 9 | `Perte_Ourlet_DT` | number | 0 |
| 10 | `Perte_Totale_DT` | number | 0 |
| 11 | `Gain_Approuve_DT` | number | 0 |
| 12 | `Taux_Qualite_%` | number | 0 |
| 13 | `Perte_Nette_DT` | number | 0 |

#### Exemples de données (premières 5 lignes):

| Personne | Qte_Premiere | Qte_Deuxieme | Qte_Dechet | Qte_Ourlet | Qte_Deuxieme_Approuve | Perte_Dechet_DT | Perte_Deuxieme_DT | Perte_Ourlet_DT | Perte_Totale_DT |
|---|---|---|---|---|---|---|---|---|---|
| Badie | 56369 | 1247 | 970 | 92 | 308 | 7819.5 | 11097.450000000012 | 594.7500000000001 | 19511.69999999998 |
| Zied | 35379 | 1493 | 327 | 24 | 330 | 2375.5 | 11878.750000000002 | 105.3 | 14359.550000000003 |
| Mohamed | 29321 | 602 | 302 | 5 | 126 | 2566.5 | 6369.350000000001 | 45.5 | 8981.350000000002 |

---

## 📄 SOUS TRAITANT.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\SOUS TRAITANT.xlsx`
- **Nombre de feuilles:** 1

### Feuille: `Feuil1`

- **Dimensions:** 42 lignes × 7 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `NOM` | text | 27 |
| 2 | `PRENOM` | text | 0 |
| 3 | `NUM DE TEL` | text | 17 |
| 4 | `SERVICE` | text | 0 |
| 5 | `ADRESSE` | text | 26 |
| 6 | `RECTO CIN` | unknown | 42 |
| 7 | `VERSO CIN` | unknown | 42 |

#### Exemples de données (premières 5 lignes):

| NOM | PRENOM | NUM DE TEL | SERVICE | ADRESSE | RECTO CIN | VERSO CIN |
|---|---|---|---|---|---|---|
| Gannoun | Abed | 93491729 | Frange | BANNEN | nan | nan |
| nan | Abir | nan | Frange | nan | nan | nan |
| Chakroun | Adel | 29596798 | Couture | nan | nan | nan |

---

## 📄 Suivis Matière Première 2025-2026.xlsx

- **Chemin:** `D:\OneDrive - FLYING TEX\PROJET\Excel fab\Suivis Matière Première 2025-2026.xlsx`
- **Nombre de feuilles:** 2

### Feuille: `Fourniture`

- **Dimensions:** 64 lignes × 7 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `QR Fourniture` | text | 0 |
| 2 | `Type` | text | 0 |
| 3 | `Référence` | text | 0 |
| 4 | `Libele` | text | 0 |
| 5 | `Stock` | number | 0 |
| 6 | `Prix Achat` | number | 0 |
| 7 | `Valeur` | number | 0 |

#### Exemples de données (premières 5 lignes):

| QR Fourniture | Type | Référence | Libele | Stock | Prix Achat | Valeur |
|---|---|---|---|---|---|---|
| Couture_BB | Couture | BB | Bobine Blanche | 52 | 0.3 | 15.6 |
| Couture_BN | Couture | BN | Bobine Noir | 17 | 0.3 | 5.1 |
| Etiquette_TABF100C | Etiquette | TABF100C | All by fouta 100% Cotton | 2100 | 0.3 | 630.0 |

---

### Feuille: `Matière première`

- **Dimensions:** 170 lignes × 15 colonnes

#### Colonnes:

| # | Nom | Type | Valeurs nulles |
|---|-----|------|----------------|
| 1 | `QR MP` | text | 0 |
| 2 | `Numero Métrique` | text | 0 |
| 3 | `Couleur` | text | 0 |
| 4 | `Code Couleur` | text | 0 |
| 5 | `Couleur Commercial` | text | 0 |
| 6 | `Code Fabrication MP` | text | 0 |
| 7 | `Num de Lot` | text | 0 |
| 8 | `Stock Minimal` | number | 0 |
| 9 | `E1` | unknown | 170 |
| 10 | `E2` | unknown | 170 |
| 11 | `E3` | unknown | 170 |
| 12 | `Usine` | unknown | 170 |
| 13 | `Fabrication` | unknown | 170 |
| 14 | `Stock` | unknown | 170 |
| 15 | `QR` | text | 0 |

#### Exemples de données (premières 5 lignes):

| QR MP | Numero Métrique | Couleur | Code Couleur | Couleur Commercial | Code Fabrication MP | Num de Lot | Stock Minimal | E1 | E2 |
|---|---|---|---|---|---|---|---|---|---|
| C01_BLANC_NM05-01.00_S2023 | NM05 | BLANC | C01 | Blanc | NM05-01.00 | S2023 | 0 | nan | nan |
| C01_BLANC_NM15-01.00_63555 | NM15 | BLANC | C01 | Blanc | NM15-01.00 | 63555 | 0 | nan | nan |
| C01_BLANC_NM15-01.00_63577 | NM15 | BLANC | C01 | Blanc | NM15-01.00 | 63577 | 1500 | nan | nan |

---

