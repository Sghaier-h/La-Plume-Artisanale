# Legacy GAS — Commercial / Catalogue / Impression

Analyse du legacy Google Apps Script pour préparer la migration backend/frontend
des modules Vente. Sources : `04_Catalogue.gs`, `05_Commercial.gs`,
`13_Impression.gs`, `JS_Commercial.html`, `HTML_Modules_Commercial.html`,
`Template_Devis.html`, `Template_Facture.html`, `Template_BL.html`.

---

## 04_Catalogue.gs — Produits, Articles, Paramétrage

### Fonctions serveur principales

| Fonction | Paramètres | Effet métier | Feuilles touchées |
|---|---|---|---|
| `chargerDonneesInitialesCat(ssId)` | catalogue SS | Chargement batch produits + paramétrage + stats (articles chargés en 2e appel car volumineux) | `Produit`, `Parametrage/*` |
| `getProduits_cat(ssId)` | catalogue SS | Lecture produits, plafond 30 000 lignes, tolère onglet `Produit`/`Produits` | `Produit` |
| `ajouterProduit_cat / modifierProduit_cat / supprimerProduit_cat / dupliquerProduit_cat` | ssId, rowNum/data | CRUD produit ; supprime bloqué si articles liés ; auto-création BOM Master | `Produit` (+ BOM) |
| `getArticles_cat / rechercherArticles / rechercherProduits` | ssId, filtres | Lecture + filtrage serveur (texte, type, dimensions, tissage, finition, couleur, stock alerte) | `Articles` |
| `ajouterArticle_cat / modifierArticle_cat / supprimerArticle_cat` | ssId, data | CRUD article avec génération auto `Ref Commercial` et `Ref Fabrication` selon nombre de sélecteurs (U/B/T/Q/C/S) | `Articles` |
| `getValeursDistinctesProduits` | ssId | Listes distinctes (types, tissages, finitions, couleurs, dimensions) pour filtres UI | `Produit` |
| `getAlertesStock / mettreAJourStock / synchroniserStockArticlesDepuisCalculStock` | ssId | Alertes RUPTURE/CRITIQUE/ALERTE ; réécrit Stock (usine 1er / total 1er+2e coupe) | `Articles` |
| `getStatsCatalogue` | ssId | Comptages par type/tissage/finition/couleur + min/max/moyenne prix | `Produit`, `Articles` |
| `exportArticlesCSV / exportProduitsCSV / importArticlesCSV` | ssId, csv | Import/export CSV `;` UTF-8 | idem |
| `getParametrageComplet / getParametrageCouleurPourMP` | — | Charge tous onglets paramétrage (priorité `Type de Produit`, `Type de Finition`, `Type de Tissage`, `Dimensions`, `Nombre de Couleur`, `Couleur`, `Catalogues`) | classeur `PARAM_SS_ID` |
| `creerCategorieParam / ajouterParametre / modifierParametre / supprimerParametre` | — | CRUD valeurs de nomenclature | onglets paramétrage |

### Modèle de données

**Produit** (15 colonnes) : `Produit`, `Type`, `Code Produit`, `C. Dimensions`,
`C. Code Dimensions`, `Type de Tissage`, `Code Type de Tissage`, `Nombre de
couleur`, `Code Nombre de couleur`, `Type de Finition`, `Code Type De Finition`,
`Produit Composer` (bool), `Prix de reviens`, `Prix de vente`, `Photo Produit`.

**Article** : hérite du produit + `Ref Commercial`, `Ref Fabrication`,
`Catalogue`, `Description Article`, `Couleur Article`, `Code Selecteur 01..06`,
`Stock`, `Stock 2e` (optionnel), `Une Minimal Stock` (= stock mini), `Prix de
vente`, `Prix de reviens`, `Photo Article`.

---

## 05_Commercial.gs — Clients, Devis, Commandes, Factures, BL, BR, Avoirs, Colisage

### Configuration

`DOC_TYPES` : chaque type (`devis|commande|facture|bl|colisage|br|avoir`) porte
son onglet, un onglet détail (`Details_*`), un SS-ID détail (fallback vers un
classeur dédié), un préfixe (`DV|CMD|FA|BL|LC|BR|AV`) et un label. Résolution
tolérante des noms (alias `Bons de Livraison` → `Bons_Livraison`, normalisation
accents/casse).

### Fonctions serveur principales

| Fonction | Effet |
|---|---|
| `chargerDonneesVente(ssId)` | Batch dashboard : clients, stats globales, 10 docs récents |
| `_getVenteStats` | Compte clients actifs, devis, commandes (dont `En cours`), factures, BL, BR, avoirs |
| `getClients / getClientByNum / creerClient / modifierClient / supprimerClient` | CRUD Clients ; `creerClient` génère `CL10000+lastRow` |
| `getDocumentsParType(ssId,type,filtres)` | Liste doc avec filtres (etat, client, texte, dateDebut/Fin, `nonFacture` sur BL) |
| `getDocumentDetail(ssId,type,numDoc)` | Doc + lignes détail (multi-classeurs) + client + entêtes ; enrichit avec état OF si type commande |
| `getDocumentsClient(ssId,numClient)` | Regroupement par client tous types + colisage rattaché via `Id Commande` |
| `creerDocument(ssId,type,data)` | Crée entête (numéro auto ou fourni) + lignes détail avec calcul HT/TTC ligne par ligne |
| `modifierDocumentEtat / modifierDocumentEntete / supprimerDocument` | MàJ ciblée |
| `ajouterLigneDocument / modifierLigneDocument / supprimerLigneDocument` | CRUD ligne détail ; commandes : MàJ stock article si `Reserve` change (via `majStockArticleApresReservation`) |
| `facturerBLSelectionEnUneFacture(ssId,numsBL)` | Regroupe plusieurs BL du même client en 1 facture (agrégation par ref+modele+dim), inscrit `Num Facture` sur chaque BL, ajoute lignes personnalisation facturables |
| `_agregerLignesPourFacture_` | Fusion des lignes identiques (somme quantités) |
| `_prixVenteDepuisFicheProduit_ / _appliquerPrixVenteCatalogueAuxLignes_` | Récupère prix vente catalogue via `_buildRefToProduitEtPrix_`+`_refCanonStats_` sur `Ref Commercial` (fallback lecture `Articles`) ; ne remplace pas `_prixPersoManuel` |
| `genererProchainNumeroFacture_` | Applique pattern `NUM_FA` (`FA-{YYYYMM}{SEQ}`, seq 4 chiffres), scan factures du mois pour max séquence |
| `enregistrerFactureExportCommeFactureCommerciale` | Repromeut une facture d'export du colisage en facture comptable (lignes déduites des colis) |
| `convertirDocument(ssId,src,num,dest,options)` | Devis→Commande→BL→Facture par relecture des lignes source |
| `getParamVente / sauvegarderParamVente` | Lit/écrit `ScriptProperties` : TVA défaut, devise, société (nom/adresse/tel/email/MF/RIB/logo), patterns numérotation, template impression, accent, footer, conditions paiement, listes d'états |
| `initClientsFromCommandes / migrerDetailsVersConsolide / initDetailsHeaders` | Migrations / bootstrap |

### Modèle de données

**Clients** : `Num Client`, `Nom`, `Prénom`, `Société`, `Email`, `Téléphone`,
`Adresse`, `Ville`, `Pays` (défaut Tunisie), `SIRET`, `Notes`, `Date création`,
`Actif` (bool colonne finale).

**Entête doc générique** : `Etat`, `Date d'envoi`, `Num Commande|Devis|Facture`,
`Num Commande Client`, `Num Client`, `Somme de Qte commandé`, `Montant HT`,
`Montant TTC`, `TVA` (avec `%`), `Personnalisation`, `Étiquette`, `Emballage`,
`Autre Instruction`, `Objet`, `Notes`, `Facture Export` (BL/factures), `Num
Facture` (sur BL, lien facture).

**Détails ligne** : `Id Ligne Commande` (`OF######` séquentiel), `Num
Commande/Devis/Facture/BL`, `Ref Client`, `Ref Commercial`, `Produit`,
`Modèle`, `Type de Tissage`, `Dimensions`, `Type de Finition`, `Qte commandé`,
`Stock`, `Reserve`, `A Fabriquer`, `EAN`, `Personnalisation`, `Détails
Personnalisation`, `Ordre de Fabrication`, `Prix unitaire`, `Montant`, `TVA`,
`Montant TTC`, `Description`, `Facture Export`.

---

## 13_Impression.gs — Rendu PDF-ready

Trois entry-points serveur : `genererHTMLDevis`, `genererHTMLFacture`,
`genererHTMLBL`. Chacun appelle `_impPrepareData_(payload,label)` puis
`HtmlService.createTemplateFromFile('Template_*').evaluate().getContent()` :
rendu **côté serveur GAS**, pas de librairie PDF ; le HTML est renvoyé au
frontend qui déclenche `window.print()` (impression navigateur → PDF).
Pas de stockage Drive ni envoi email ici — l'utilisateur imprime/enregistre
manuellement.

`_impVisibleCols_` détecte automatiquement quelles colonnes ligne ont au moins
une valeur non vide parmi une liste candidate (Ref Commercial, Produit, Modele,
Tissage, Dimensions, Finition, QTE, Stock, Reservé, A Fabriquer, EAN,
Personnalisation, Ordre de Fabrication). `_impTotals_` somme `QTE Commandé` et
`A Fabriquer`.

---

## Synthèse fonctionnelle

### Catalogue

Deux niveaux : **Produit** (modèle générique : dimensions, tissage, finition,
nb couleur, prix référence) et **Article** (variante concrète, une par
combinaison de sélecteurs). Sélection article via filtres composables sur les
onglets paramétrage (nomenclatures). Prix vente stocké sur la fiche article, à
défaut sur la fiche produit. Variantes = jusqu'à 6 sélecteurs de couleur ;
`Ref Commercial` compressée (max 3 sélecteurs), `Ref Fabrication` complète
préfixée par un code cardinal (`U|B|T|Q|C|S` selon nombre de sélecteurs).

### Commande — cycle et drill-down

Cycle : **Devis → Commande → BL → Facture** via `convertirDocument`, avec
possibilité de créer directement chaque type. Validation = passage `Etat`
(brouillon → en cours → livrée → solder / annuler). Les lignes commande ne
génèrent pas un OF automatique dans `05_Commercial.gs` : l'OF est renseigné
manuellement dans la colonne `Ordre de Fabrication` du détail. Un OF stock
d'alimentation est déclenché depuis l'UI Fabrication (`creerOFStockAlimentation`,
module 10). Le drill-down UI (`JS_Commercial.html`, `pdFabStockModalCreerOF_`,
`pdAnCreerOFStock_`) lit une commande, une ligne, son état OF (synthèse
`etatSynth` + qté commandée / fabriquée / restante), puis appelle le module OF.
Colonne `Reserve` sur la ligne commande décrémente immédiatement le stock
article (`majStockArticleApresReservation`).

### Devis / BL / Facture — templates

Champs communs présents dans les 3 templates : logo + `socNom/adresse/tel/
email/mf`, badge type doc + N°, date, bloc Client (`clNom`, `clSociete`,
`clAdresse`, `clVille`, `clTel`, `clEmail`, `clNum`), bloc infos (`etat`,
`Ref client`, `Personnalisation`, `Étiquette`, `Emballage`, `Instruction`),
tableau lignes (colonnes dynamiques), pied `Total QTE | A Fabriquer`, footer
concaténé `Nom - MF: … - RIB: …`.

**Calculs HT/TVA/TTC** : dans `creerDocument`, `total = Σ prix × qte` (HT),
`totalTTC = total × (1 + tva/100)`. TVA par défaut 19 % (paramètre `VENTE_TVA`).
**Aucun timbre fiscal** ni **mention légale spécifique** codée : le footer est
uniquement `SOC_NOM - MF - RIB`. Devise `DT` par défaut. Les templates ne
recalculent rien, ils affichent QTE et « A Fabriquer » — **pas de total HT/TTC
imprimé** (limite legacy documentée).

### Numérotation

Patterns dans ScriptProperties, format `PRÉFIXE-{YYYYMM}{SEQ}` avec SEQ à 3
chiffres (via `1000 + lastRow`.substring(1)) sauf facture : `FA-{YYYYMM}` +
séquence 4 chiffres calculée par scan des factures du mois.
- Devis `DV-YYYYMM###`
- Commande `CMD-YYYYMM###`
- Facture `FA-YYYYMM####`
- BL `BL-YYYYMM###`
- BR `BR-YYYYMM###`
- Avoir `AV-YYYYMM###`
- Colisage `LC-…`

### Impression / génération PDF

`HtmlService.createTemplateFromFile` (moteur scriptlet GAS). **Pas de
librairie PDF**, pas de stockage Drive, pas d'envoi email. Templates A4,
polices Arial, accent couleur paramétrable `PRINT_ACCENT`, logo `PRINT_LOGO_URL`.
Le PDF est produit côté navigateur par `window.print()`. Trois templates
distincts : Devis (mise en page compacte), Facture (bandeau accent + badge),
BL (marges 10 mm, cellules bordurées).

### Multi-client / livraison croisée

**Non supporté**. `facturerBLSelectionEnUneFacture` **exige explicitement** le
même `Num Client` pour tous les BL sélectionnés — sinon erreur « Tous les BL
doivent concerner le même client ». Une commande porte un seul `Num Client`.
Pas de champ « adresse de livraison distincte du client facturé ». Le colisage
suit la commande, donc le client de facturation.

### Grilles tarifaires

**Aucune grille tarifaire structurée** dans le legacy. Le prix appliqué est
toujours **le prix de vente unitaire de la fiche Article** (catalogue) —
récupéré par `_prixVenteDepuisFicheProduit_` sur la clé canonique de la
`Ref Commercial`. Fallback sur la fiche `Produit` si l'article ne porte pas de
prix. Un flag `_prixPersoManuel` protège les lignes de personnalisation
(prix saisi à la main). Aucune notion de tarif par client, par volume, par
devise ou par période : c'est un point d'attention majeur pour la migration
qui devra introduire une vraie table `prices` avec grilles.
