# Legacy GAS — Stock, BOM, Équipement

Source : `Projet Logiciel/Google Apps Script/`. Documente les sémantiques pour la refonte backend.

## 1. `07_Stock.gs` — Stock MP

### Fonctions
- **`getStockMP(ssId)`** — Vue agrégée MP. Lit référentiel (`Liste Matière Première`) et mouvements (`Matière premiere`), calcule le solde par QR × point de stock, regroupe Code Couleur → NM → Lot. Retourne `{byCouleur, codesCouleur, totalDispo, ruptures, bas, pointsStock}`. Statut lot : `rupture` (dispo ≤ 0), `bas` (somme dispo du couple CC/NM < stock min max), `encours` (rebobinage > 0), sinon `ok`.
- **`_mpLireReferentiel`** — Colonnes : `QR MP, Code Couleur, Couleur, Couleur Commercial(e), Code Fabrication MP, Numero Métrique, Num de Lot, Stock Minimal, QR`.
- **`_mpLireData`** — Journal mouvements : `QR MP, Operation, Depart, Destination, Poids, Date`.
- **`_mpCalculerStocks`** — Tri chronologique, cumul par QR × point :
  - `Inventaire` : poids = solde absolu du point à la date ; reset la base.
  - `Alimentation Fabrication|Alimentation Surplus|Préparation Fabrication` : −Départ, +consommé fabrication.
  - `Ourdissage` / `Retour Ourdissage` : cumul `consommeOurd`.
  - `Rebobinage` / `Retour Rebobinage` : cumul `enCoursReb`.
  - `Retour Fabrication` : +Destination, −consommé.
  - `Vente` : −Départ + cumul vente. `Achat`/`Import` : +Destination + cumul achat.
  - `Transfert` : −Départ, +Destination. Destination ∈ `POINTS_CONSO` (`Dimatex, Chokri Haddad`) traitée comme consommation.
  - Points : `E1, E2, E3, E4, Showroom, Usine`.
- **`getEtatStockMPParEntrepot(code)`** — Solde MP (kg) par lot pour un entrepôt.
- **`listerTousMouvementsMP` / `getMouvementsMP(qr)`** — Historique brut, tous ou par QR.
- **`ajouter|modifier|supprimerMouvementMP`** — CRUD mouvement par rowNum.
- **`ajouter|modifierLotMP`** — CRUD référentiel.
- **Alimentation Usine** : `enregistrerOrdreAlimentUsine`, `listerOrdresAlimentUsine`, `executerTransfertAlimentUsine` — file d'ordres dans `Ordres Alimentation Usine` (N° `ORD-yyyyMMdd-HHmmss`, statut `En attente|Transféré`) ; l'exécution génère un mouvement `Transfert`.

### Modèle
- **`Liste Matière Première`** = référentiel lots, clé `QR MP`. Un lot = 1 bobine (CC + NM + n° lot).
- **`Matière premiere`** = journal append-only (QR + Date). Seuil `Stock Minimal` agrégé au niveau (CC, NM) : max des lignes.

## 2. `08_Equipement.gs` — Parc machines

### Fonctions
- **`getEquipements(ssId)`** — Lecture dynamique feuille `Equipement`, toutes colonnes + `etatStats`. États canoniques : `En fonction, Arrêtée, En maintenance, En panne, Réformée, En cours de mise en fonctionnement`.
- **`ajouter|modifier|changerEtat|supprimerEquipement`** — CRUD. `Nom Machine` obligatoire ; défaut `Etat = En fonction`.

### Modèle
Colonnes usuelles : `Nom Machine, Num Machine, Opération, Type Machine, Type de Programme, Etat, Largeur de Foyer, Vibration (bielle par minute)/Vitesse, Unité`.

## 3. `09_BOM.gs` — Bill of Materials

### Fonctions
- **`getBOMMaster` / `getBOMComplet`** — Charge Master + Composants + machines. Groupement par `Code BOM Master`. Alias FR/abbrégés sur composants, miroir vers clés canoniques, coercition duites : `Nombre de Duite Total = Longueur Tissage × Duite par CM` (inversions si un des trois manque).
- **`creerBOMMasterFromProduit(bomSsId, produitData)`** — Auto-création depuis catalogue. Code : `CodeProduit + CodeDim + "(" + CodeFinition + ")-" + CodeNbCoul` (ex. `AR1020(FR)-B`). `Type de Fabrication = Unique` sauf `Produit Composer=oui/composé` → `Composée`. Si `Unique`, crée un composant lié auto. Mapping nom modèle : `AR→ARTHUR, IB→IBIZA, MA→MARINIÈRE, KA→KAIROUAN, BIB→BIBI, BA→BASIQUE, BE→BERBER, EPIB→EPONGE IBIZA, EPMA→EPONGE MARINIÈRE`, fallback lecture `Modeles`.
- **`ajouterBOMComposant`** — Code = `codeMaster` ou `codeMaster/suffix`. Calcule `Duite Total` et `Temps Fabrication (min) = min(duiteTotal/Vibration)` sur machines compatibles.
- **`modifier|supprimerBOMComposant`** — CRUD.
- **`uploadBATImage(base64, fileName)`** — Upload Drive dossier `BAT_BOM_Images`, partage `ANYONE_WITH_LINK`, retourne URL thumbnail.
- **`migrerBOMVersCatalogue`** — Migration source vers Catalogue, dédoublonnage par clé, dry-run.

### Modèle
- **`BOM Master`** — 1 ligne / SKU (Produit × Dim × Finition × Nb couleurs). Colonnes : `Code BOM Master, Type, Produit, Code Produit, Type de Tissage, Code Type de Tissage, Dimensions, Code Dimensions, Type de Finition, Code Type De Finition, Type de Fabrication, Nombre de couleur, Code Nombre de couleur`.
- **`BOM Composant`** — N lignes rattachées : `Code BOM Composant, Code BOM Master, Type, Produit, Consommation Selecteur 01..06 (g), Longueur Tissage (cm), Largeur Tissage (cm), Duite par CM, Nombre de Duite Total, Machines Compatibles, Temps Fabrication (min), BAT Image, Notes`. Pas de versioning ; unicité par code.

## 4. `StockProduitFinis.gs` — Stock PF

### Fonctions
- **`listerEntrepotsStock` / `listerEntrepotsStockCompletTerrain` / `listerTerrainStockPFComplet`** — Entrepôts + KPI mois + solde net par libellé.
- **`sauverEntrepotStock(rowNum, data)`** — CRUD entrepôt (Code, Libellé, Adresse, Ville, Responsable, Contact, Type, Actif).
- **`getStockPFAnalyseEntrepots()`** — Solde par emplacement depuis `Mouvement Stock` : `Depart=Inventaire` → +Destination absolu ; `Entrée` → +dest ; `Sortie` → −dép ; `Transfert|Ajustement|vide` → −dép, +dest ; quantités abs.
- **`getEtatStockPFParEntrepot(code)`** — Stock théorique par référence (OF prioritaire) au sein d'un entrepôt, chronologique. Inventaire reset le cumul.
- **`getEtatStockEntrepotComplet(code, {pf, mp})`** — PF + MP en un appel.
- **`listerMouvementsStockPF` / `listerMouvementsStockPFPourReference`** — Fusion `Mouvement Stock` (transferts) et `Opération` (Inv/Achat/Vente), tri date desc.
- **`ajouter|modifier|supprimerMouvementStockPF`** — CRUD (Date, Type, OF, Reference, Quantite, Depuis, Vers, Remarque, Utilisateur, Terminal, Photo).
- **`ajouterOperationStockPF`** — Écriture `Opération` (Num suivis, Opération, Entrepôt, # QTE, Photo, Note, Terminal, Date, Num OF).
- **`resoudreOFPourStockPF` / `resoudreEtStatutOFPourSaisieST`** — Scan → OF/client/article + `getOFStatus`.
- **`remplirStockParEntrepot`** — Reconstruit onglet `Stock Par Entrepot` (hors Usine), par référence, statut Disponible/Réservé.
- **`remplirStockUsine`** — Reconstruit `Stock Usine` par OF. Combine `Details_Fabrication` (QTE Première, Deuxième, Déchet, Deuxième Approuvée, Ourlet, Total), colisage, transferts, opérations Usine. `stockUsine = max(0, (inventaire || qteAcceptée) + achats − ventes − colisage − trSortants + trEntrants)`.
- **`getStockFabricationParRefCanon_`** — Stock libre par réf. commerciale canon : mouvements PF filtrés, excl. commandes `En cours`/`En attente`, déduit colisage.
- **`getStockDeuxiemeCoupeParRefCanon_`** — `max(0, Σ QTE Deuxième − Σ QTE Deuxième Approuvée)` par OF, agrégé par ref canon.

### Modèle
- **`Entrepot`** : Code, Libellé, Adresse, Ville, Responsable, Contact, Type, Actif.
- **`Mouvement Stock`** : Type ∈ `Entrée, Sortie, Transfert, Ajustement`.
- **`Opération`** : `Inventaire, Achat, Vente` (Usine).
- **`Stock Par Entrepot` / `Stock Usine`** : onglets dérivés recalculés.

---

## Synthèse

### BOM par article
Structure **Master → Composants**. Master identifie une SKU (Produit × Dim × Finition × Nb couleurs), code concaténé déterministe. `Type de Fabrication` :
- **Unique** : 1 composant auto-créé de même code.
- **Composée** : plusieurs composants manuels avec géométrie + sélecteurs. Code composant = `codeMaster/suffix`.

Les **`Consommation Selecteur 01..06`** représentent la **consommation fil par sélecteur du métier** (grammes) ; un sélecteur = une position d'alimentation fil. **Aucun rôle explicite chaîne/trame/fourniture/emballage** modélisé — la répartition dépend de l'attribution physique. **Pas de versioning** : réécriture in-place par code.

### Mouvements — types observés
- **MP** : `Achat, Import` (entrées) ; `Vente` (sortie) ; `Transfert` (inter-point) ; `Inventaire` (solde absolu) ; `Alimentation Fabrication, Alimentation Surplus, Préparation Fabrication, Ourdissage, Rebobinage` (consommations métier) avec retours dédiés `Retour Fabrication|Ourdissage|Rebobinage`. Déclencheurs : saisie terrain (scan QR + formulaire) ; ordres d'alimentation Usine dont l'exécution génère un Transfert.
- **PF** : `Entrée, Sortie, Transfert, Ajustement` sur `Mouvement Stock` ; `Inventaire, Achat, Vente` sur `Opération`. Déclencheurs : saisie terrain (scan OF), colisage (déduit), retours sous-traitance, transferts inter-entrepôts.

### Entrepôts
- **MP** : points fixes `E1, E2, E3, E4, Showroom, Usine` + points de consommation `Dimatex, Chokri Haddad` (sous-traitants). Config hub : `mp_aliment_entrepot_source` (défaut E1), `mp_aliment_destination` (défaut Usine).
- **PF** : liste dynamique `Entrepot` (Code + Type ∈ `Stockage, Point de Vente, Fabrication`). Workflow inter-entrepôts = mouvement `Transfert` avec Départ/Destination. Solde calculé à la volée (pas de cache).

### Équipement / machines
- **`Largeur de Foyer`** (cm) = **laize** utile ; contraint quelle SKU peut être produite (via `Largeur Tissage` BOM).
- **`Vibration (bielle par minute)` / `Vitesse`** = **cadence duites/min** ; base du calcul `Temps Fabrication = duiteTotal / Vibration`.
- **`Type de Programme`** (Programme / Manuel) = ratière programmée vs sélecteurs manuels.
- **`Opération`** = poste (Tissage, Ourdissage, Coupe…).
- **Sélecteurs couleur** : nombre implicite via `Nombre de couleur` du Master (B/T/Q/C/S). Pas de colonne dédiée sur `Equipement` ; la filtration se fait via `Machines Compatibles` du BOM.

### QR codes
- **Format QR MP** : chaîne `CodeCouleur_XXX_XXX_NumLot` — le parsing systématique fait `qr.split('_')[0]` (CC) et `[3]` (n° lot) en fallback. Un champ `QR` optionnel du référentiel porte le code long.
- **Génération** : côté client (QRious v4.0.2, `Vendor_QRious.html`) en data URL, sans round-trip serveur. Utilisé sur cartes lot MP, étiquettes A4, aperçus.
- **Usage** : scan sur saisie mouvement MP, alimentation, terrain PF, saisie ST → résolution lot ou OF via `resoudreOFPourStockPF` (recherche fuzzy sur classeur OF).

### Traçabilité par lot
Le **QR MP** est la **clé de traçabilité bobine**. Chaque bobine = 1 lot = 1 ligne référentiel (CC, NM, n° lot). Tous les mouvements portent le QR MP ; le solde par point de stock est reconstruit chronologiquement par QR. Le lot suit la bobine : achat/import → transferts → alimentation fabrication ou ourdissage/rebobinage → consommation (avec retour possible). Un `Inventaire` sur (QR, point) remet à zéro le solde à cette date ; les mouvements ultérieurs cumulent. **Pas de lien structuré lot ↔ OF** : la traçabilité descendante (quel lot a alimenté quel OF) passe par le rapprochement date/opération et les champs libres (`Remarque` d'un mouvement, ex. `Alimentation Usine — ordre ORD-…`), pas par une colonne de rattachement.
