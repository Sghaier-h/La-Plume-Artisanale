# Décisions et règles métier — héritage Google Apps Script

Source : `Google Apps Script/RECAP_DISCUSSION_ASSISTANT.md`, `TRANSCRIPT_DISCUSSION_COMPLET.md` (~910 tours), `Documents/*.md`, feuille `Societe`, échantillon `_local_data.json`. Synthèse à intégrer sans re-débattre pour la V2.

---

## 1. Décisions métier verrouillées

### 1.1 Fiscal (Tunisie)
- **Devise** : `DT` (dinar tunisien), format d'affichage `12,50 DT` (décimal virgule).
- **TVA par défaut** : `19 %`.
- **Timbre fiscal** : `1 DT` par document.
- **Pays société** : Tunisie ; matricule fiscal, RIB, RC sont stockés dans la feuille `Societe` (spreadsheet Paramétrage).

### 1.2 Formats de numérotation (feuille `Societe`)
Patrons canoniques `{YYYYMM}{SEQ}`, avec compteur mensuel :
- Devis : `DV-{YYYYMM}{SEQ}` — états `Brouillon / En cours / Accepté / Refusé`.
- Commande : `CMD-{YYYYMM}{SEQ}` — préfixe historique client accepté (`ABF-CM90043`, `CM-FT0014`) ; états `En cours / En cours partiel / Expédiée / Livrée / Annulée`.
- Facture : `FA-{YYYYMM}{SEQ}` — `Brouillon / Payée / Impayée`.
- Bon de livraison : `BL-{YYYYMM}{SEQ}` — `En cours / Expédiée / Livrée`.
- Avoir : `AV-{YYYYMM}{SEQ}`.
- Bon de retour : `BR-{YYYYMM}{SEQ}` — `En cours / Reçu`.
- **Client** : `CL` + 5 chiffres (ex. `CL00058`).
- **OF sur commande** : `OF` + 6 chiffres (ex. `OF250467`).
- **OF sur stock (fabrication anticipée)** : préfixe `CA` (ex. `CA250970`) — affiché sans le préfixe `OF`.
- **Numéro de colis** : `C` + 3 derniers chiffres du n° client + `-` + 3 derniers alphanum de l'ID commande + `-` + séquence 3 chiffres (`C058-043-001`). Ancien format `Cxxx-nnn` reste toléré en saisie manuelle.
- **Numéro de palette** : `PAL` + 2 chiffres de l'année + `-` + séquence (`PAL26-004`).
- **Étiquette de suivi OF** : `{NUM_OF}-{seq}` pour les lots standard, `-SUR01`, `-SUR02`… pour surplus, `-DEU01`, `-DEU02`… pour 2ᵉ choix.
- **Dérivation `Num OF de l'étiquette suivis`** (formule verrouillée) :
  `= SI(NumSuivi = ""; IDCommande; SI(sans "-"; NumSuivi; partie avant le premier "-"))`
  Cette règle est appliquée à la fois par la formule Sheet et par `deriveNumOfEtiquetteSuivis_` côté serveur.

### 1.3 Règles de prix et devis
- **Article dérive du modèle Produit** : `Prix de vente` et `Prix de reviens` d'un article proviennent obligatoirement de la ligne `Produit` correspondante (mêmes dimensions, tissage, finition, nombre de couleurs). Toute saisie manuelle est écrasée par le modèle.
- **Alias verrouillés** : la colonne s'écrit `Prix de reviens` (avec « s ») dans la feuille `Produit` ; alias reconnu au-dessus de `Prix de revient`.
- **CA d'une commande** : priorité au montant agrégé des lignes `Details_Commandes` ; à défaut `qté commandée × prix de vente catalogue`.
- **CA livré / marge estimée** : `qté livrée × (PV − prix de revient)` par référence. Si le PV catalogue est absent mais qu'un montant ligne existe, on utilise `montant ÷ qté` comme PV effectif.
- **Valeur du stock catalogue** : `Σ (stock article × PV article)`.

### 1.4 Règles de qualité (coupe)
- Trois sorties par OF :
  - **Standard** (`OF…-n`) : `1re + approuvée`, à imprimer à la **planification** pour la `Qté à fabriquer`.
  - **Surplus** (`OF…-SUR…`, barre bleue) : ce qui dépasse l'objectif.
  - **2ᵉ choix** (`OF…-DEU…`, barre violette) : rebus corrigés / secondes qualité.
- **Total contrôle coupe** = `1re + 2ᵉ fab + déchet + ourlet`.
- **Quantité comptabilisée à l'ordre** = `1re + approuvée`.
- **Quantité « fabriquée » consolidée** (utilisée pour cadence machine, ourdissage, stock) = `1re + 2ᵉ + déchets + approuvée`, lue depuis la feuille `Fabrication` (repli sur colonnes OF si absente).
- **Objectif atteint** : dès que `1re + approuvée ≥ à fabriquer`, l'écran passe en mode « Surplus ». Le coupeur doit ensuite valider explicitement « Fabrication terminée » ; la modale « Fin de coupe — Surplus & 2e choix » demande la confirmation des quantités et déclenche l'impression des lots `SUR…` / `DEU…`.
- **Pièces par étiquette** : défaut global = **5**. Peut être surchargé par colonne `pieces par etiquette` sur l'OF, ou mémorisé côté serveur (`ETIQ_PIECES_PAR_LOT`).
- **Priorités affichées sur étiquette** : `Standard` (gris), `Urgent` (orange), `Prioritaire` (rouge).

### 1.5 Règles logistiques et alertes
- **Alerte tissage 500 m** : dès que `cible − compteurM` passe pour la première fois sous **500 m** (en restant > 0), une alerte automatique `tissage_restant_500m` part vers le poste `planification`. Bandeau orange sur la carte tant que reste ≤ 500 m.
- **Plafond ensouple ourdissage** : `OURD_METRAGE_MAX_ENSOUPLE = 5000 m`. Contrôlé dans `creerOrdrePreparation`, `corrigerMetrageEnsouple`, `receptionEnsouple` (attribut `max="5000"` en UI + toast).
- **Points de stock MP** : `E1`, `E2`, `E3`, `E4`, `Showroom`, `Usine`.
- **Points de consommation MP** : `Dimatex`, `Chokri Haddad` (sous-traitants historiques).
- **Livraison BL** : le récap colisage se choisit par commande + facture d'export ; le BL regroupe les produits ayant les mêmes paramètres (dimensions, tissage…) sur une seule ligne, le détail restant sur la liste de colisage.

### 1.6 Rôles et routage post-login
Redirection automatique selon le libellé du rôle (feuille `Utilisateurs` du Hub) :
`tissage → écran tissage`, `coupe → coupe`, `ourdissage → ourdissage`, `mag_mp / mag mp → préparation MP`, `mag_st / mag st → mouvements ST`, `export / colisage → colisage`, `sous-traitance → ST`, `planif → planification`. `admin`, `direction`, `fabrication` (générique) restent sur le tableau de bord.
Détection souple avec accents/underscores, mais rôles explicites recommandés pour éviter les faux positifs.

### 1.7 Résolution des IDs de spreadsheets (priorité croissante)
`Code.gs` (défaut) → `PARAM > Configuration` → `HUB > Configuration` → `HUB > Table` (source de vérité). Le module `_loadRuntimeIds_` fusionne dans cet ordre ; la Table Hub gagne toujours.

---

## 2. Terminologie récurrente

| Terme | Définition métier |
|---|---|
| `numOF` | Identifiant unique d'un ordre de fabrication (`OF250467` ou `CA250970` pour stock). |
| `typeLigne` | `Commande` (OF lié à une commande) vs `Stock` (fabrication anticipée, préfixe `CA`). |
| `ordrePlanifMachine` | Ordre séquentiel imposé à la machine ; sert au planning coupe et tissage. |
| `refCommercial` | Référence commerciale de l'article (visible client, ex. codes couleur + dimensions). |
| `refFabrication` | Référence interne de fabrication (peut différer de la réf. commerciale). |
| `refClient` | Code produit tel que nommé par le client final. |
| `numSuivi` | Étiquette code-barres/QR d'un lot (`OF250467-3`), scannée à chaque étape. |
| `numOfEtiquetteSuivis` | Racine du n° OF déduite du `numSuivi` (avant le premier `-`). Rattache un colis à l'OF même si seul le n° d'étiquette est saisi. |
| `afab` | Quantité à fabriquer (colonne `Qté composant à fabriquer` de l'OF). |
| `qtePrem` / `qteDeux` | Quantité 1ʳᵉ / 2ᵉ choix saisies à la coupe. |
| `approuve` / `deuxApprouveeInt` | Quantité 1ʳᵉ / 2ᵉ validées après contrôle qualité. |
| `surplusFab` | Sur-fabrication (au-delà de `afab`). |
| `piecesParEtiquette` | Nombre de pièces par étiquette suivi (défaut 5). |
| `ensouple` | Bobine ourdissage ; plafond 5000 m. |
| `NM` (numéro métrique) | Titre du fil (ex. 15, 20) ; entre dans le calcul du poids MP chaîne. |
| `nbFilsChaine` | Nombre de fils de chaîne d'un OF (utilisé pour poids MP). |
| `duiteParCM` | Densité de duites par cm de la trame. |
| `nbDuites` | Duites total = `longueurTissage × duiteParCM`. |
| `metrageFilChaine` | Métrage total du fil de chaîne consommé. |
| `compteur` / `compteurM` | Métrage effectivement tissé (m), saisi par le tisseur. |
| `sourceCoupe` | `fabrication` (cumul feuille Fabrication) ou `of` (repli colonnes OF). |

---

## 3. Historique des changements majeurs

- **v0 → v1 Hub monolithique** : `Hub.gs` (~700 lignes) contenait 5 fonctions dupliquées (`chargerAppData`, `getParametrageComplet`, `ajouterParametre`, `supprimerParametre`, `creerDocument`) — la 2ᵉ définition écrasait silencieusement la 1ʳᵉ.
- **v1 → v2 Architecture modulaire** : éclatement en `00_Cache.gs` (cache SS + helpers dates), `01_Config.gs`, `02_Coupe.gs`, `03_SousTraitance.gs`, `04_Catalogue.gs`, `05_Commercial.gs`, `06_Admin.gs`, puis `07_Stock`, `08_Equipement`, `09_BOM`, `10_OrdreFabrication`, `11_Ourdissage`, `12_RH`, `13_Impression`, `14_Tissage`, `15_Dashboard`. Introduction du cache `_ssCache` (15-20 `openById` → 4-5, gain 2-5 s / chargement).
- **Décomposition `Dashboard.html`** (766 Ko, 11 012 lignes, 494 fonctions JS) en `CSS_Main.html`, `HTML_Core.html`, `HTML_Modules_{Commercial,Production,ST_Stock}.html`, `JS_{Core,Commercial,Production,ST_Stock,Impression,OF,Coupe,Ourdissage,PrepMP_Tissage,BOM_Equip,EtiquettesOF}.html`. Lazy-loading via `getModuleHTML()`.
- **Consolidation détails commerciaux** : passage d'un spreadsheet par type à `DETAILS_COMMERCIAL_SS_ID` unique (feuilles `Details_Devis`, `Details_Commandes`, `Details_Factures`, `Details_BL`, `Details_BR`, `Details_Avoirs`).
- **BOM déplacé** du spreadsheet BOM dédié vers le catalogue (`CAT_SS_ID` = `BOM_SS_ID`) ; migration via `migrerBOMVersCatalogue`.
- **Timeout login** : 15 s → 45 s, puis lecture Hub `Utilisateurs` bornée en lignes pour éviter les `getDataRange().getValues()` sur des feuilles gonflées.
- **Source des cumuls coupe** : passage des colonnes OF vers la feuille `Fabrication` (somme réelle par OF), avec fallback OF. Impacte ourdissage (métrage tissé) et poids MP.
- **Renommages métier** : « Terrain (scan) » ambigu → « Stock produits finis » ; colonne « Modèle » → « Produit » dans les libellés UI et les priorités de lookup.
- **Alias tolérants** : `Num OF / N° OF / Numéro OF / num of` ; `Prix de reviens / Prix de revient` ; `pieces par etiquette / pièces par étiquette`.

---

## 4. Formules mathématiques

- **Métrage tissé (par OF)** : `métrageTisse = totalPiecesCoupe × longueurTissage_m`, avec `totalPiecesCoupe = 1re + 2e + déchets + approuvée`.
- **Cible métrage tissage** : convertit `longueurTissage` en mètres (`÷100` si valeur ≤ 2000, sinon déjà m).
- **Reste à tisser** : `resteM = cible − compteurM`. Alerte 500 m si `0 < resteM < 500` et transition depuis `resteM ≥ 500`.
- **Duite total** : `nbDuitesTotal = longueurTissage_cm × duiteParCM`. Réciproque : `longueur = total / duiteParCM` si la longueur est vide.
- **Poids MP chaîne (kg)** : `poidsMPkg = (nbFilsChaine × metresTisses × 2) / (NM × 1000)`.
- **Ensouple** : `metrageEnsouple ≤ 5000 m` (contrôle bloquant).
- **Prix article** : `prixVenteArticle = Produit.prixVente` (même modèle), `prixReviensArticle = Produit.prixReviens`.
- **CA commande (priorité)** : `CA = Σ montant_ligne` sinon `Σ qte × PV_catalogue`.
- **CA livré estimé** : `Σ qteLivree × PV_effectif`, avec `PV_effectif = montant_ligne / qte` si `PV_catalogue = 0`.
- **Marge livrée** : `margeLivree = Σ qteLivree × (PV − prixRevient)`.
- **Valeur stock** : `valeurStock = Σ stockArticle × PV`.
- **Coupe — objectif** : `objectifAtteint ⇔ (1re + approuvée) ≥ afab` ; `surplus = max(0, 1re + approuvée − afab)`.
- **Séquence colis** : incrément par couple `(client, commande)` ; formule dérivée `numOfEtiquette = split(numSuivi, "-")[0]` avec repli sur `IDCommande`.
- **Total palette** : `Nombre colis` recalculé automatiquement pour toutes les lignes du même `Num de Palette`.

---

## 5. Points de vigilance / bugs / limitations

- **Feuilles OF multi-onglets** : la fusion doit détecter `Num OF` par alias (`N° OF`, `Numéro OF`, `num of`) — sinon la liste globale est vide et tous les KPI tombent à zéro.
- **Filtre planning coupe** : ne pas exclure les OF sans machine ni les états « Attente » / « Pause » / « Non démarré », sous peine d'écran vide.
- **`textContent` vs `innerHTML`** : les entités HTML (`&#x2713;`) ne sont pas interprétées par `textContent` ; utiliser des échappements Unicode (`✓`).
- **Mojibake UTF-8/Windows-1252** : rester en UTF-8 côté fichiers HTML ; les scripts `fix_encoding*.py` corrigent les régressions.
- **Fichiers `.html` renommés `.gs`** : provoquent une `SyntaxError` bloquant tout le projet (Apps Script charge tous les `.gs` en un seul script).
- **`getDataRange()` sur Hub gonflé** : lignes vides tout en bas font exploser `getLastRow()` → timeout login. Limiter les plages lues et supprimer les lignes vides.
- **Stock affiché ≠ stock disponible** : les réservations (commandes en cours) ne sont pas retranchées automatiquement ; note UI le rappelle.
- **`_noAcc` côté client** : la fonction serveur (`_noAccGS`) doit avoir son pendant client dans `JS_Core.html`, sinon crash au rendu OF.
- **`majSurplusDeuxiemeOF`** : renvoie `skipped` (succès sans écriture) si les colonnes `Surplus fabrication` / `Qté deuxième fabrication` n'existent pas — à ajouter à la feuille OF pour persistance.
- **Feuille `Fabrication` obligatoire** : sans ligne, les cumuls coupe / ourdissage retombent sur les colonnes OF (précision moindre).

---

## 6. Roadmap / évolutions envisagées

- **Table de synthèse pré-calculée par référence** (`ref`, `qte cmd`, `qte BL`, `qte colisage`, etc.) alimentée par triggers Apps Script (~5 min + incrémental), pour soulager les tablettes sur réseau instable.
- **Bootstrap unique « hub fabrication »** : une seule requête serveur alimentant Prep MP + Tissage + Coupe, avec cache client.
- **Poste Magasinier MP** dédié : liste OF en attente, affectation lots, nuancier, validation « MP prêt » (chantier plus large, non fait).
- **Module Atelier Export** (`14_Atelier.gs` envisagé) : aujourd'hui l'export est redirigé vers `pgDocLC` (Colisage).
- **Compteur manuel ourdissage** (complément à l'alerte < 500 m ensouple existante).
- **Alerte tissage étendue** : diffuser aussi vers Ourdissage / Mag MP en plus de Planification (une ligne dans `envoyerAlerteUrgente`).
- **Soustraction automatique du stock réservé** (jointures commandes + colisage + OF).
- **Signature tablette + photo** pour livraisons sous-traitance (preuve de remise marchandise).
- **Enregistrement PDF automatique sur Drive** et liaison signature au champ de la feuille.
- **Nettoyage** : retrait des IDs details legacy de `Code.gs` après stabilisation, sauvegarde des anciens classeurs avant suppression.
