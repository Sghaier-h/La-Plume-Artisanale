# Legacy GAS — Sous-Traitance & Colisage

Analyse de `03_SousTraitance.gs`, `ColisageListe.gs`, et de la partie ST de `HTML_Modules_ST_Stock.html` (pages `pgST*`).

## 1. `03_SousTraitance.gs`

### Modèle de données

**Registre `Sous Traitant`** : `NOM`, `PRENOM`, `NUM DE TEL`, `SERVICE` (Frange, Couture, Personnalisation, Coupe, Ourdissage, Nouage), `ADRESSE`, `RECTO CIN`, `VERSO CIN`, `NOTE`, `TERMINAL`, `DATE`, `Identification` (clé = prénom+nom sans espaces), `Total Sortis`, `Total Retour`, `Reste A Retourner`, `PRIX FRANGE|COUTURE|PERSONNALISATION|COUPE`, `Saisi par`.

**Mouvements ST** — plusieurs onglets fusionnés en lecture (typiquement `Sortis Sous Traitant` + `Retour Sous Traitant`, variantes tolérées par un détecteur heuristique + scoring d'en-têtes). Colonnes matchées de façon flexible : `Num de suivis` (= n° étiquette OF), `Opération` ("Sortie Frange", "Retour Couture"…), `Départ` (Usine/entrepôt), `Destination` (ST), `Sous Traitant` (fallback), `# QTE`, `Date`, `Remarque`, `Num OF`, `Photo`, `Saisi par`. Si `Opération` manque, l'opération est déduite du nom d'onglet (`retour` → Retour, sinon Sortie).

**`Prix service`** — grille tarifaire ST × produit × dimensions × tissage × finition × personnalisation × ensouple × service, avec `Prix unitaire`, `Montant total`, `Montant payé`.

### Fonctions serveur

- `getDonneesMouvST(ssId)` → 200 dernières lignes fusionnées, enrichies via `buildOFLookupSafe_` (client, ref, modèle, dim, machine, états, perso) + totaux global.
- `getMouvementsParST(mvtSsId, stSsId, identification, nom, prenom)` → filtre les mouvements par candidats d'identification (normalisation accents/ponctuation, matching sur `Départ` OU `Destination` OU `Sous Traitant`).
- `getMouvementsSTParSuiviEtOF(numSuivis, numOf)` → recherche par n° suivi ou OF (préfixe `OF` toléré) ; utilisée par le colisage magasin.
- `enregistrerRetourSTColisage(data)` → wrapper `ajouterMouvST` avec `Opération="Retour ST"`, `Départ=ST`, `Destination="Usine"`.
- `ajouterMouvST` / `modifierMouvST` / `supprimerMouvST` — CRUD ; onglet cible choisi selon opération. Renseigne les deux graphies (`Depart`/`Départ`, `# QTE`/`QTE`, `Sous Traitant`/`Sous-traitant`) pour compat feuille.
- `getSousTraitants(ssId)` → registre + totaux recalculés à la volée sur les mouvements (agrégation par clé loose, plafond `ST_MOUV_AGG_ROW_CAP=12000`). Priorité totaux calculés, fallback colonnes feuille.
- `ajouterSousTraitant` / `modifierSousTraitant` — unicité sur `Identification`.
- `getBilanParService(ssId, filterOpts)` → agrège sorties/retours/reste par service (mot après "Sortie"/"Retour") ; filtres période `tout|jour|mois|annee` + `dateRef`.
- `getRapportSousTraitantParPeriode({mvtSsId, stSsId, dateDebut, dateFin, serviceFiltre})` → regroupement contextuel : Frange/Couture/Coupe → produit×dim×finition (OF) ; Personnalisation → détail perso ; Ourdissage/Nouage → machine OF. Comptabilise `lignesSansDate`.
- `getPrixServiceData` / `getPrixServicePourIdent` / `majPrixServiceLigne` / `genererGrillePrixServiceFrange(ssId, catalogueSsId)` — CRUD grille tarifaire ; génération auto une ligne par (ST Frange × produit catalogue) manquante, plafond 600.

## 2. `ColisageListe.gs`

### Modèle

**`Liste de Colisage`** : `Num de Colis`, `ID Commande`, `Num Suivis`, `Quantité`, `PHOTO`, `NOTE`, `Terminal`, `Date`, `Bon de livraison`, `Num OF de l'étiquette Suivis`. Une ligne = un couple (colis, n° suivi).

**`Liste des palettes`** : `Num de Palette`, `Num De colis`, `Photo`, `Note`, `Terminale`, `Date`, `Facture Export`, `Transporteur`, `Nombre colis`. Une ligne = un couple (palette, colis) ; `Nombre colis` re-synchronisé après insert/delete (`_colisageSyncNombreColisPourPalette_`).

### Fonctions serveur

- `colisageProchainNumColis(numClient, idCommande)` → séquence par préfixe.
- `colisageAjouterLigne` / `colisageAjouterLignesBatch` → mode `__NEW__` / `__MAN__` / n° existant. Date = jour, Terminal = email session sinon "Manuel". `Num OF étiquette` dérivé de la partie avant le premier `-` du n° suivi (`deriveNumOfEtiquetteSuivis_`, réplique la formule feuille).
- `colisageProchainNumPalette` / `colisagePaletteAllouerNumerosEtiquettes(nb)` → séquence `PALyy-NNN` annuelle, max(feuille, ScriptProperty `palette_etiq_last_<yy>`), allocation par lots ≤500.
- `colisagePaletteAjouterLigne` / `colisagePaletteModifierLigne` / `colisagePaletteSupprimerLigne`.
- `colisageRecapPourBonLivraison(numBL)` → groupe par (commande × suivi) + totaux.
- `colisageRecapComplet(filtres)` — filtres `idCommande | factureExport | numBL | sansBL | numClient`. Enrichit chaque colis via `getColisageMagasinLignesCommande` (ref, dim, modèle, description, personnalisation) et `_colisageMapColisVersPalette_` (palette, position, facture export). Fournit `lignesBLGroupees` (ref+dim+modèle → qté agrégée) pour impression BL.
- `colisageDonneesFactureExportPourCompta(ssCom, numFactureExport)` → prépare la facture commerciale ; refuse si plusieurs clients ; ajoute lignes "Personnalisation" facturables (`qtePerso>0` ET `puPerso>0`).
- `colisageCreerBLDepuisCommande` / `colisageCreerBLetRattacheColis` / `colisageRattacherColisAuBL` — génération BL + rattachement masse.
- `getColisageMagasinContexteComplet` → vue 360° saisie magasin : ligne détail, état OF (`getOFStatus`), qtés (commandée / à fabriquer / fabriquée / colisée), historique ST (sorties/retours/reste).

## 3. UI ST (`pgST*`)

Cinq écrans routés depuis `pgST` :
- `pgSTlist` — grille sous-traitants (filtres service + recherche).
- `pgMouvST` — 4 KPI (Total / Sorties / Retours / Reste) + table filtres (recherche, service, Sorties/Retours).
- `pgSTbilan` — cartes par service + détail ST (Sorties, Retours, Reste, % Retourné) ; sélecteur `tout|jour|mois|année` + date réf.
- `pgSTrapport` — plage Du…Au + filtre service, tableau regroupé produit×dim×finition | perso | machine, export CSV.
- `pgSTsaisie` — scan/saisie mouvement (Num suivi/OF, Opération, Départ, Destination ST, Quantité, Photo, Remarque, Date). Une **Session (caisse)** empile les mouvements validés, avec canvas signature et photo de preuve. Bouton "Imprimer/PDF" génère le "**Bon de mouvement sous-traitance**".

## Synthèse

### Bon de sortie sous-traitant
Aucun objet BS en feuille : le "bon" est un **HTML/PDF généré client** (`stSessionPrintOrPdf`) à partir des lignes session. Contenu : en-tête société (logo/adresse/tel/email via `getParametrageSociete`), titre "Bon de mouvement sous-traitance", **synthèse groupée OF × produit × dimensions** (Sorties, Retours, Solde S−R), **détail chronologique** (Heure, OF, Opération, Qté, Destination), **signature** (canvas doigt/stylet, PNG dataURL), **photo de preuve** (URL Drive). Workflow : scanner OF → saisir opération/qté/photo → Enregistrer (persistance sur `Sortis`/`Retour Sous Traitant`) → répéter → Imprimer/PDF pour remise ST. **Pas de numérotation** du bon.

### Suivi ST
Pas de "lot" en tant qu'entité : suivi au **niveau ligne mouvement**. Identifiant = **N° de suivi** (= n° étiquette OF), fallback n° OF. L'agrégation "chez qui" via `getSousTraitants` par clé Identification normalisée : `Total Sortis − Total Retour = Reste A Retourner`. **Aucun délai/échéance stocké** — seule date = date sortie ; le "retard" est implicite (reste > 0). Rapprochement via `Destination` sur la sortie et `Départ` sur le retour.

### Retour ST
Saisi comme un **nouveau mouvement** `Opération="Retour <Service>"`, `Départ=ST`, `Destination="Usine"`. Deux entrées : (1) Saisie mouvement (`ajouterMouvST`), (2) écran Colisage magasin (`enregistrerRetourSTColisage`). **Partiel natif** : rien n'oblige `qté retour = qté sortie` ; N retours possibles contre 1 sortie ; solde = `Σsorties − Σretours`. **Aucune notion de rebut** : ni colonne "qté perdue" ni "rebutée" ; un écart reste en `Reste A Retourner` positif, sans catégorisation.

### Colisage
**Numérotation colis** : `C{XXX}-{YYY}-{NNN}` — `XXX` = 3 derniers chiffres n° client (padded), `YYY` = 3 derniers alphanum ID commande, `NNN` = séquence 001+ propre à ce préfixe (recalculée sur la feuille). **Numérotation palette** : `PAL{yy}-{NNN}` annuel, séquence = max(feuille, ScriptProperty), bumpée à chaque insert et à chaque allocation d'étiquettes (≤500). **Répartition** : une ligne `Liste de Colisage` = (colis, n° suivi) — un colis peut donc regrouper N suivis, une palette regroupe N colis. **Poids et dimensions absents du colis** — seuls `Quantité`, `PHOTO`, `NOTE`, `BL`, `Num OF étiquette`. La palette porte `Facture Export` et `Transporteur`, ni poids ni dimensions. Les dimensions dans les récaps proviennent de l'article (Détails Commandes), pas du colis.

### Litiges / 2ème choix ST
**Non implémenté.** Aucune occurrence de `litige`, `2ème choix`, `2nd choix`, `rebut`, `défaut qualité` dans les modules ST/colisage. Ni colonne dédiée, ni service dans le sélecteur d'opération (limité à Sortie/Retour × Frange/Couture/Personnalisation/Coupe), ni indicateur qualité côté rapport. Un litige ne peut être tracé aujourd'hui que via `Remarque` de la ligne mouvement ou une photo — sans agrégat ni KPI. **Lacune fonctionnelle explicite** à combler côté nouveau backend (statut ligne : conforme/litige/2ème choix ; qté rebut ; motif ; coût imputé au ST).
