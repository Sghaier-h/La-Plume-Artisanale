# Synthèse du legacy Google Apps Script — La Plume Artisanale

Source : `D:\OneDrive - FLYING TEX\Projet Logiciel\Google Apps Script\` (17 modules `.gs`, ~24 000 lignes, 60 fichiers).
Base : classeurs Google Sheets fédérés par un Hub (IDs codés en dur dans `Code.gs`, alias runtime via feuille `Configuration`/`Table` du Hub). Application exposée en Web App Apps Script (`doGet` → `Dashboard.html`).

---

### Module 01_Config.gs
**Rôle** : Résolution des IDs de spreadsheets (source active : constantes `Code.gs` + surcharge Hub), synchronisation des tables de référence, chargement AppData.
**Fonctions principales** :
- `_getConfig()` — assemble map `ss_*` (hub, catalogue, commercial, commandes, MP, fabrication, OF, ourdissage, ST, colisage…).
- `synchroniserClientsRefHub()` / `_syncClientsRefFromCommercialInternal_()` — reconstruit `Hub!Clients_Ref` depuis `Commercial!Clients`.
- `rebuildAllRefs()` — orchestre les rebuilds de références.
- `lireTableSSIds()` — lit la feuille `Hub!Table` (clé → SS ID).
- `chargerAppData()` — payload initial UI (config, société, IDs, listes distinctes).
**Feuilles utilisées** : `Configuration`, `Table`, `Clients_Ref` (Hub).
**Interactions** : socle utilisé par TOUS les autres modules via `getSpreadsheet_/getSheetData_` (00_Cache.gs).

### Module 02_Coupe.gs
**Rôle** : Saisie et analyse de la coupe (poste atelier « fabrication »).
**Fonctions clés** : `ajouterLigneCoupe`, `modifierLigneCoupe`, `supprimerLigneCoupe`, `getDonneesRapidesCoupe`, `getDonneesRecentesCoupe`, `getStatusOFCoupe`, `getDetailsForPeriodeCoupe`, `getRecapJourneeCoupe`, `getDonneesDoublonsCoupe`, `remettreDoublonCoupe`, `onEditFabricationTrigger`, `peuplerDetailsFabrication`.
**Feuilles** : `Fabrication`, `Details_Fabrication`, `Doublons_Fabrication`, `Analyse_Jour/Semaine/Mois/Operateur`, `TriggerLog` (classeur `ss_fabrication`).
**Concepts** : distinction Qté Première / Deuxième / Déchet / Approuvé / Ourlet ; agrégation par OF et par période ; onEdit trigger de recalcul.
**Interactions** : consommé par `10_OrdreFabrication` (statut OF), Dashboard, StockPF.

### Module 03_SousTraitance.gs
**Rôle** : Registre sous-traitants, mouvements ST (envois/retours), grilles de prix service, bilans.
**Fonctions clés** : `getDonneesMouvST`, `getMouvementsParST`, `getMouvementsSTParSuiviEtOF`, `ajouterMouvST/modifierMouvST/supprimerMouvST`, `enregistrerRetourSTColisage`, `getSousTraitants/ajouter/modifier`, `getBilanParService`, `getRapportSousTraitantParPeriode`, `getPrixServiceData/majPrixServiceLigne`, `genererGrillePrixServiceFrange`.
**Feuilles** : `Sous Traitant`, `Prix service` (ss_sous_traitant) ; `Sortis Sous Traitant` / `Retours Sous Traitant` / `Mouvement ST` (ss_st_mvt).
**Concepts** : normalisation d'identification (nom, prénom, ID), matching mouvement ↔ ST tolérant, agrégation par période/service.
**Interactions** : lié à Colisage (retour depuis ST), OF (Num OF sur mouvement), Catalogue (grille de prix par produit).

### Module 04_Catalogue.gs
**Rôle** : Gros module — Catalogue Produits/Articles + BOM Master, paramétrage (couleurs, dimensions, finitions…), analyse stock/ventes, alimentation, page « Fabrication Stock ».
**Fonctions clés** : `chargerDonneesInitialesCat`, `getProduits_cat/getArticles_cat`, `ajouter/modifier/supprimer/dupliquer Produit/Article`, `rechercherArticles/rechercherProduits`, `getValeursDistinctesProduits`, `getAlertesStock`, `mettreAJourStock`, `synchroniserStockArticlesDepuisCalculStock`, `getStatsCatalogue`, `import/exportArticlesCSV`, `getParametrageComplet`, `getPageFabricationStock`, `getAnalyseStockBasAlimentation`, `getStatsVentesArticle`, `getTopArticlesVendus`, `getAnalyseProduitsVente`, `getStockDetailPourRef`, `recalculerToutStock`, `initCataloguesFromArticles`, `getStockArticlesBadgeMap`.
**Feuilles** : `Produit`, `Articles`, `BOM Master`, `Catalogues`, `Opération`, plus feuilles Paramétrage (Couleur, Type de Tissage, Type de Finition, Dimensions…).
**Concepts** : Modèle→Articles (variantes dim/couleur/finition), stock 1ère vs 2ème choix, stock catalogue vs fabrication vs usine, réservations calculées côté détails commandes.
**Interactions** : central — consommé par Commercial, OF, StockPF, BOM, Colisage, Dashboard.

### Module 05_Commercial.gs
**Rôle** : Documents commerciaux (Devis, Commandes, Factures, BL, BR, Avoirs), clients, conversions, facturation multi-BL.
**Fonctions clés** : `getClients/getClientByNum/creer/modifier/supprimerClient`, `chargerDonneesVente`, `getDocumentsParType`, `getDocumentDetail`, `getDocumentsClient`, `creerDocument`, `modifierDocumentEntete/Etat`, `ajouter/modifier/supprimerLigneDocument`, `facturerBLSelectionEnUneFacture`, `enregistrerFactureExportCommeFactureCommerciale`, `convertirDocument`, `getParamVente/sauvegarderParamVente`, `getStatsCommercial`, `migrerDetailsVersConsolide`, `initClientsFromCommandes`.
**Feuilles** : `Clients`, `Devis`, `Commandes`, `Factures`, `Bons_Livraison`, `Bons_Retour`, `Avoirs`, `Details_*` (consolidés dans classeur Commercial).
**Concepts** : entête + détails ligne consolidés ; agrégation lignes multi-BL vers 1 facture ; prix depuis fiche produit (catalogue) ou facture export.
**Interactions** : source des OF (Commande→OF), source du Colisage, cible du Prix Vente (Catalogue).

### Module 06_Admin.gs
**Rôle** : Authentification, gestion utilisateurs, autorisations, paramétrage société.
**Fonctions clés** : `login`, `getUtilisateursEtAutorisations`, `sauvegarderAutorisations`, `sauvegarderAccesModules`, `sauvegarder/modifier/supprimerUtilisateur`, `toggleUtilisateurActif`, `getParametrageSociete/sauvegarder`, `uploadPhotoToDrive`, `chargerDataMP`.
**Feuilles** : `Utilisateurs`, `Autorisations` (Hub), `Societe` (Paramétrage).
**Concepts** : login redirige selon rôle (routage par poste après login — cf. RECAP), matrice module×droit.

### Module 07_Stock.gs
**Rôle** : Stock Matière Première (fils), lots, mouvements, ordres d'alimentation usine.
**Fonctions clés** : `getStockMP`, `getEtatStockMPParEntrepot`, `listerTousMouvementsMP`, `getMouvementsMP(qrMP)`, `ajouter/modifier/supprimerMouvementMP`, `ajouter/modifierLotMP`, `enregistrerOrdreAlimentUsine`, `listerOrdresAlimentUsine`, `executerTransfertAlimentUsine`, `getHeadersListeMP/MvtMP`.
**Feuilles** : `Liste Matière Première`, `Matière premiere` (mouvements), `Ordres Alimentation Usine`.
**Concepts** : identifiant `QR MP` (code MP unique), couples (Code Couleur, Numéro Métrique), stock minimal, transferts inter-entrepôts.

### Module 08_Equipement.gs
**Rôle** : CRUD machines/équipements.
**Fonctions** : `getEquipements`, `ajouter/modifier/supprimer/changerEtatEquipement`.
**Feuille** : `Equipement` (Nom Machine, Type, État, Maintenance).
**Interactions** : machines référencées par OF (Num Machine) et Tissage.

### Module 09_BOM.gs
**Rôle** : Nomenclature — BOM Master (recette produit) et BOM Composant (consommations par sélecteur S01–S06, longueur/largeur/duites).
**Fonctions clés** : `getBOMMaster`, `creerBOMMasterFromProduit`, `ajouter/modifier/supprimerBOMComposant`, `_creerComposantAuto`, `getBOMComplet`, `uploadBATImage`, `migrerBOMVersCatalogue`.
**Feuilles** : `BOM Master`, `BOM Composant` (dans classeur Catalogue).
**Concepts** : recette avec consommation par sélecteur MP (S01…S06), duite par cm, machines compatibles, image BAT.

### Module 10_OrdreFabrication.gs
**Rôle** : Module le plus volumineux — cycle de vie OF, préparation MP, tissage (compteur, alertes), planification machines, étiquettes, messagerie inter-postes.
**Fonctions clés** : `chargerOFs`, `lancerOF`, `getOFStatus`, `modifierEtatOF`, `sauvegarderActionTissageOF` (compteur mètres + alerte 500 m), `majSurplusDeuxiemeOF`, `attribuerMachineOF/changerMachineOF`, `reordonnerPlanifMachine`, `terrainPlanificationChargerBootstrap`, `terrainPlanificationChargerOFsEtEtiquettes`, `getParam/sauvegarderParamEtiquettesOF`, `chargerPrepMP`, `_genererPrepMPPourOF`, `majQRPlanifiePrepMP`, `alimenterMachine/retourMP` + `_enregistrerMouvementMP`, `envoyerAlerteUrgente`, `lireMessages/lireMessagesHistorique/marquerAlerteLue`, `envoyerMessageFabricationInterposte`, `demandeCompletMP`, `signalerCoupeTerminee`, `marquerOFUrgent`, `getOFSuiviComplet`, `creerOFStockAlimentation`, `prochainNumOFCA_`, `majEtatsOFDepuisDonneesReelles`.
**Feuilles** : `Ordre de Fabrication`, `Ordre de Fabrication Stock`, `Prep MP` / `Préparation MP`, `Parametrage Fabrication`, `Equipe Fabrication`, `Messages` (Hub).
**Concepts** : OF Commande vs OF Stock (CA…), sélecteurs S01–S06 pour QR MP réel, alerte 500 m tissage automatique, messagerie Hub persistée + cache 6 h, planification par machine.

### Module 11_Ourdissage.gs
**Rôle** : Gestion ourdissage (chaînes, ensouples).
**Fonctions** : `chargerOurdissage`, `creerOrdrePreparation`, `receptionEnsouple`, `corrigerMetrageEnsouple`, `_chargerMouvementsOurdissage`, `_enregistrerMouvementOurdissage`, `_ourdChainePoidsKg_`.
**Feuilles** : `Ourdissage`, `Réception Ensouple`, `Mouvements Ourdissage`.
**Concepts** : calcul poids chaîne (Nm, nb fils, métrage), alerte matière restante ensouple.

### Module 12_RH.gs
**Rôle** : RH minimal — employés, congés, présences, salaires.
**Fonctions** : `initRHSheets`, `getRHDashboardData`, `ajouter/modifier/supprimerEmployeRH`, `ajouterConge/Presence/SalaireRH`, `modifier/supprimerCongeRH`, `getEmployeByMatricule`, `calculerSoldeConges`.
**Feuilles Hub** : `RH_Employes`, `RH_Conges`, `RH_Presences`, `RH_Salaires`.

### Module 13_Impression.gs
**Rôle** : Génération HTML des documents PDF (Devis, Facture, BL).
**Fonctions** : `genererHTMLDevis`, `genererHTMLFacture`, `genererHTMLBL`, `_impPrepareData_`, `_impRenderTemplate_`, `_impBuildRowsHtml_`, `_impTotals_`, `_impVisibleCols_`.
**Interactions** : injecte les templates `Template_Devis.html`, `Template_Facture.html`, `Template_BL.html`.

### Module 14_Tissage.gs
**Rôle** : Vue temps-réel tissage et analyse.
**Fonctions** : `chargerEtatsTissageTempsReel`, `chargerAnalyseTissage(periode, de, a)`, `_chargerMachinesEquip`, `_chargerQteFabTissage`, `_trouverMachineDeOF`.
**Feuilles** : `OFs_Tissage` (snapshot dédié), `Equipement`, `Details_Fabrication`, `Operations`, `Fabrication`.
**Concepts** : état par machine (En cours / Attente démarrage / Cassé / Panne / Terminé), snapshot pour Dashboard.

### Module 15_Dashboard.gs
**Rôle** : KPI globaux multi-modules.
**Fonction** : `chargerKPIDashboard()` — agrège commercial, fabrication, tissage, coupe, ST, stock MP/PF, RH.

---

### Section "Setup / Config"
- **`Setup_Database.gs`** : `setupDatabase()` crée 14 spreadsheets (Hub, Paramétrage, Catalogue, Commercial, Commandes, Fabrication, Ordres de Fabrication, Matière Première, Ourdissage, Sous-Traitants, Mouvements ST, Stock PF, Équipement, Colisage). Chaque spreadsheet contient plusieurs feuilles avec en-têtes prédéfinis. Écrit les IDs dans `Hub!Table`.
- **`01_Config.gs` / `Code.gs`** : constantes globales (HUB_SS_ID, CATALOGUE_SS_ID, COMMERCIAL_SS_ID, COMMANDES_SS_ID, FAB_SS_ID, OF_SS_ID, OURD_SS_ID, MP_SS_ID, ST_SS_ID, MVT_SS_ID, STOCK_PF_SS_ID, LISTE_COLISAGE_SS_ID, EQUIP_SS_ID, DETAILS_*). Résolution runtime : constantes ← surcharge Hub `Configuration`/`Table`.
- **`00_Cache.gs`** : couche d'accès unifiée (`getSpreadsheet_`, `getSheetData_`, `resolveCols_`, `ensureSheet_`, `buildOFLookupShared_`), aliasing de clés d'IDs, gestion tolérante des en-têtes.

### Section "Terminologie et conventions"
- **Sheets récurrents** : `Configuration`, `Table`, `Clients_Ref`, `Messages`, `Utilisateurs`, `Autorisations`, `Produit`, `Articles`, `BOM Master`, `BOM Composant`, `Clients`, `Devis`, `Commandes`, `Factures`, `Bons_Livraison`, `Details_*`, `Fabrication`, `Details_Fabrication`, `Ordre de Fabrication`, `Ordre de Fabrication Stock`, `Prep MP`, `Liste Matière Première`, `Matière premiere`, `Ourdissage`, `Sous Traitant`, `Mouvement ST`, `Prix service`, `Entrepot`, `Mouvement Stock`, `Liste de Colisage`, `Liste des palettes`, `Equipement`, `OFs_Tissage`.
- **Identifiants** :
  - `Num OF` (ordre fabrication), `Num OF Stock` préfixe CA…
  - `Num Client`, `Num Commande`, `Num Devis`, `Num Facture`, `Num BL`, `Num BR`, `Num Avoir`
  - `Ref Commercial` (article vendu), `Ref Fabrication` (variante fabrication), `Ref Client`
  - `Code Article`, `Code Produit`, `Code BOM Master`, `Code BOM Composant`
  - `QR MP` (identifiant unique lot MP), `Code Fabrication MP`, `Code Couleur`, `Numero Métrique`, `Num de Lot`
  - `Num de Suivi` (ST), `Num de Colis`, `Num de Palette`, `Num Suivis`, « Num OF de l'étiquette Suivis »
  - Sélecteurs MP : `S01`…`S06` avec triplet `Code S0n / QR MP Réel S0n / Besoin S0n (kg) / Poids Consommé S0n / Différence S0n (kg)`.
- **Enums statuts observés** :
  - OF : `Planifié`, `En cours`, `Terminé`, `Urgent`, `En attente MP`.
  - Étape OF : `Etat Préparation MP`, `Etat Tissage`, `Etat Coupe` (Préparé/Alimenté, En cours, Terminé, Casse chaîne, Panne).
  - Tissage : `En cours`, `Attente démarrage`, `Casse chaîne`, `Panne`, `Terminé`.
  - Documents commercial : `Brouillon`, `Confirmé`, `Facturé`, `Livré`, `Annulé`.
  - Mouvement ST : `Départ` / `Retour` (par sens Départ→Destination).
- **Champs récurrents** : `Ref Commercial`, `Ref Fabrication`, `Num Machine`, `S01..S06`, `QR MP`, `QR MP Réel Sxx`, `Qté Commandé`, `Qté Réservé`, `Reste A Fabriquer`, `Surplus Fabrication`, `Qté Deuxième Fabrication`.

### Section "Flux métier clés observés dans le code"
1. **Commande → OF → Fabrication → Livraison** : `Commercial.creerDocument` (Commande) → `10_OrdreFabrication.creerOFStockAlimentation`/`_genererPrepMPPourOF` (attribution S01–S06, QR MP planifiés) → `07_Stock.executerTransfertAlimentUsine` (transfert MP) → `10_OrdreFabrication.alimenterMachine` → `11_Ourdissage.creerOrdrePreparation`/`receptionEnsouple` → `14_Tissage.sauvegarderActionTissageOF` (compteur mètres) → `02_Coupe.ajouterLigneCoupe` (1ère/2ème/déchet) → `ColisageListe.colisageAjouterLigne` (palettes/colis) → `05_Commercial.facturerBLSelectionEnUneFacture`.
2. **Sous-traitance** : `03_SousTraitance.ajouterMouvST` (Départ vers ST) → suivi sur `Num de Suivi`/`Num OF` → `enregistrerRetourSTColisage` (Retour) → mise à jour bilan.
3. **Planification tissage** : `attribuerMachineOF` / `reordonnerPlanifMachine` → snapshot `OFs_Tissage` → alerte auto 500 m sous cible dans `sauvegarderActionTissageOF` (Hub!Messages).
4. **Messagerie inter-postes** : `envoyerAlerteUrgente`/`envoyerMessageFabricationInterposte` → `Hub!Messages` + cache 6h → polling `lireMessages(destination)` par poste.
5. **Facture Export** : `enregistrerFactureExportCommeFactureCommerciale` + agrégation `ColisageListe.colisageDonneesFactureExportPourCompta`.

### Section "Documents PDF générés"
- **`Template_Devis.html`** : société+logo, client (Nom, Société, Num, Adresse, Ville, Tél, Email), Num Devis, Date, État, Ref client, Personnalisation, Étiquette, Emballage, Instruction, table lignes (Ref/Modèle/Type Tissage/Dimensions/Type Finition/Qté/PU/Montant), totaux HT/TVA/TTC.
- **`Template_Facture.html`** : idem Devis + colonne TVA par ligne, badge type document (couleur d'accent société), Montant TTC.
- **`Template_BL.html`** : format A4 compact, société, client, livraison (Transporteur, État), table (Ref/Modèle/Dimensions/Qté), infos étiquette/emballage/instruction, personnalisation.
- **`EtiquettesSuiviOF.html`** : 8 étiquettes par page A4, QR (via QRious offline + fallback QRserver), types suffixés `-SUR01…` (surplus) / `-DEU01…` (deuxième), règles coupe affichées (Qté 1ère+approuvé pour l'OF, total contrôle 1ère+2e+déchet+ourlet).

### Section "Concepts déjà présents dans le legacy à réutiliser tel quel"
- Modèle **Produit → Articles (variantes dimension/finition/nombre de couleur)** + **BOM Master/Composant** avec sélecteurs de MP S01…S06 : correspond à Phase 2.5/2.7 domain.
- Séparation **OF Commande / OF Stock (CA)** + calcul `Reste A Fabriquer` / `Surplus Fabrication` / `Qté Deuxième`.
- **Trace consommation MP par sélecteur** : `Besoin Sxx (kg)`, `Poids Consommé Sxx`, `Différence Sxx (kg)` — modèle solide pour le pointage MP.
- **Registre ST unifié** (identification + Num de Suivi + Num OF) avec grille de prix par service.
- **Messagerie inter-postes persistée** (feuille Hub + cache) — bon patron pour notification atelier.
- **Numérotation Colis / Palette** avec préfixes annuels et compteurs (`_colisagePaletteHighSuffix_`).
- **Snapshot `OFs_Tissage`** dédié pour dashboards temps-réel (évite recalcul).
- **Alerte 500 m tissage** transactionnelle sur cible dérivée `Longueur Tissage`.

### Section "Concepts à éviter"
- **IDs de spreadsheets codés en dur** dans `Code.gs` + surcharge fragile via Hub — remplacer par variables d'environnement / config typée côté ERP moderne.
- **Multi-classeurs séparés** (Fabrication, Commandes, Commercial, MP, OF, Colisage…) : recompositions coûteuses, jointures manuelles répétées, cache maison (`00_Cache.gs`) — migrer vers base relationnelle unique.
- **En-têtes dupliqués / alias tolérants** (`_stColIndexFlexible_`, `_findCol_`, `getSheetByName` avec 3-4 orthographes possibles : `Sous-traitants`/`Sous_Traitants`/`Sous Traitants`) : symptôme de schema drift Sheets — remplacer par migrations DB versionnées.
- **Détails_* consolidés dans plusieurs SS** (`DETAILS_DEVIS_SS_ID`, `DETAILS_FACTURES_SS_ID`, `DETAILS_BR_SS_ID`, `DETAILS_AVOIRS_SS_ID`) — migration entamée mais partiellement retirée.
- **onEdit triggers** (`onEditFabricationTrigger`) et scripts `TriggerLog` : à remplacer par API events côté backend.
- **Recalcul complet du stock** (`recalculerToutStock`) à la demande : mouvement de stock immuable + vue matérialisée côté ERP.
- **Fonctions kilométriques** (10_OrdreFabrication ~3 100 l., 04_Catalogue ~3 500 l., StockProduitFinis ~2 900 l.) mélangeant lecture Sheets, règles métier et formatage UI — séparer domaine/persistance/API.
- **Modèle d'auth basé sur `Hub!Utilisateurs` + colonnes booléennes par module** : remplacer par RBAC.
- **Logo/photo en Base64 stockés dans Drive via `uploadPhotoToDrive`/`uploadBATImage`** — utiliser stockage objet.
- **Numérotation Facture / OF via balayage complet** (`genererProchainNumeroFacture_`, `prochainNumOFCA_`) — utiliser séquences DB.
