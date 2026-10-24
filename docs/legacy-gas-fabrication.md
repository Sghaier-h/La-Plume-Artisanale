# Synthèse Fabrication — Legacy GAS

Analyse des modules `10_OrdreFabrication.gs`, `11_Ourdissage.gs`, `14_Tissage.gs`, `02_Coupe.gs` + vues HTML.

## Module 10 — Ordre de Fabrication

Source : classeur `OF_SS_ID`, 2 onglets fusionnés dynamiquement : « Ordre de Fabrication » (OF Commande : `ID Commande`, `Num Commande`, `Num Client`, `Date d'envoie`) et « Ordre de Fabrication Stock » (avec `Catalogue`, `Type`, N° OF `CAxxxx`).

En-têtes partagés : `Ref Commercial/Fabrication`, `Produit`, `Dimensions`, `Type de Finition`, `Nombre de couleur`, `Type de Fabrication`, `Code BOM Composant`, `Description`, `Dimensions/Personnalisation Composant`, `Qté Commandé Article Final/Composant`, `Qté Réservé`, `Qté Composant à Fabriquer`, `QTE Fabrique TOTAL`, `QTE Deuxieme Fabrication`, `Deuxieme Approuvee Interne`, `Ourlet Fabrication`, `QTE Deuxieme/Approuve Externe`, `Reste A Fabriquer`, `Surplus Fabrication`, `Num Machine`, `Ordre Planif Machine`, `Temps de production (h)`, `Compteur à Afficher`, `Etat Préparation MP/Tissage/Coupe`, `Largeur/Longueur Tissage`, `Métrage Fil Chaîne (m)`, `Duite par CM`, `Nb Duites Total Production`, puis six blocs S01→S06 (`Code Sxx`, `QR MP Réel Sxx`, `Besoin Sxx (kg)`, `Poids Consommé Sxx`, `Différence Sxx (kg)`) et totaux (`Total Besoin/Consommé/Différence Totale (kg)`).

Enums (`OF_ETATS`) :
- **prepMP** : `Non Préparé`, `Préparé`, `Préparé Partiel`, `Pas de Besoin`, `Manque Matiere`.
- **tissage** : `Attente`, `Planifier`, `Machine Alimentée`, `Départ`, `En cours`, `Pause`, `Terminé`, `Terminé Qte Manquante`.
- **coupe** : `Non Démarré`, `En cours`, `Pause`, `Terminé`, `Terminé Qte Manquante`.

Fonctions clés :
- `initEntetesOFSiVide` / `obtenirEntetesOFReference` : posent les en-têtes.
- `remplirOrdrePlanifMachine` : numérote 1..N par machine dans l'ordre des lignes.
- `_mergeOFSheetData_` : fusionne les 2 onglets (union des colonnes, dédoublonnage par `Num OF`/`ID Commande`, cache mémoire).
- `chargerOFs` → `{ total, termines, qteTotale, aFabriquer, heuresTotales, rows[] }`. `termines` = prep OK (`Préparé/Machine Alimentée/Pas de Besoin/vide`) + tissage `Terminé/Cloturé` + coupe `Terminé*`. Enrichit chaque ligne (Client via `Clients_Ref`, machine, codes S01–S06, priorité). Nb duites dérivé = `duite/cm × longueur tissage` si absent.
- `chargerOFsTermines` : filtre light des OF `terminé/cloturé/annulé`.
- `lancerOF` : initialise les 3 états à `Non Préparé / Attente / Non Démarré` si aucun n'est posé.
- `getOFStatus` : fiche complète (identifiants, quantités, `steps[]` avec `done=true` pour `terminé/préparé/terminé qte manquante`, `progress/progressPct`, `etatsDisponibles`).
- `modifierEtatOF(numOF, champ, valeur)` : écriture générique (match sans accents), invalide le cache.
- `sauvegarderActionTissageOF` : met à jour `Etat Tissage`, `Compteur à Afficher`, `Remarque/Photo Tissage`, `Saisi par`. Alerte `tissage_restant_500m` quand `cible − compteur` franchit 500 m à la baisse.
- `majSurplusDeuxiemeOF` : écrit `Surplus Fabrication` et `QTE Deuxieme Fabrication`.
- `attribuerMachineOF / changerMachineOF` : pose `Num Machine`, initialise Prep MP et Tissage si vides, appelle `_genererPrepMPPourOF`.
- `reordonnerPlanifMachine(machine, [ofIds])` : écrit `Ordre Planif Machine` = rang 1..N.
- `getOFSlotsPlanification` : lit sélecteurs S01→S06 dans le classeur externe **Prep MP Fabrication** (`Num Selecteur`, `Code Couleur Selecteur`, `Besoin (kg)`, `QR MP Planifie/Attribue/Reel`, `Poids Sorti/Retour/Consomme`, `Etat`).
- `_genererPrepMPPourOF` : lit `BOM Composant` + mouvements MP existants pour créer 1 ligne Prep MP par sélecteur.
- `majQRPlanifiePrepMP` : écrit `QR MP Planifie/Attribue`.
- `alimenterMachine / retourMP / _enregistrerMouvementMP` : ajoutent des mouvements MP (`Alimentation Fabrication` / `Retour Fabrication`).
- `demandeCompletMP` : passe Prep MP à `Manque Matiere` et pousse `demande_mp → magasinier`.
- `signalerCoupeTerminee(numOF, raison)` : écrit `Terminé` ou `Terminé Qte Manquante` sur `Etat Coupe`, alerte `tissage`.
- `marquerOFUrgent` : écrit `URGENT` dans `Priorite`, alerte `planning_urgent`.
- Messagerie interposte (`envoyerAlerteUrgente`, `lireAlertesUrgentes`, `envoyerMessageFabricationInterposte`, hub `Messages_Postes`) — catégories `demande | alerte | pret | info` ; destinations `magasinier, tissage, coupe, planification, ourdissage, export, mag_st, admin, tous`.
- `chargerPrepMP` : classe les OF en `attente / coupe / termines`.
- `prochainNumOFCA_`, `creerOFStockAlimentation`, `getOFResumeStockParRef_` : OF Stock (`CAxxxx`).
- `majEtatsOFDepuisDonneesReelles` : rafraîchit prep/coupe depuis Prep MP et Fabrication.

Règle métier : longueur cible en mètres = `Longueur Tissage` (÷100 si ≤ 2000, considérée cm sinon m).

## Module 11 — Ourdissage

Source : `OURD_SS_ID`, onglet `Ourdissage`. Seuil alerte machine = 500 m restants ; métrage max ensouple = 5000 m.

Colonnes : `Date`, `Sous Traitant`, `Code Couleur`, `Code Fabrication MP`, `Nom de Lot`, `Type (Ty)`, `Numero Metrique` (NM), `Laize`, `Nombre de fil chaîne`, `Métrage Ensouple`, `Poids Consommer`, `Date Nouage`, `Num Machine`.

Fonctions :
- `_ourdChainePoidsKg_(nbFil, m, nm)` : poids MP = `nbFil × m × 2 / (NM × 1000)`, NM = dernier nombre extrait (défaut 50).
- `chargerOurdissage()` → `{ ensouples[], machines{}, alertes[], ofsParMachine{}, mouvements[], metrageParDateJour[] }`. Par machine : `metrageTotal` (Σ ensouples), `metrageUtilise` = Σ (`qteCoupeTot × Longueur Tissage`) des OF affectés — `qteCoupeTot` calculé temps réel via `_coupeSumFabricationForOF_` sinon fallback OF (`QTE Fabrique + Deuxieme`). `metrageRestant = total − utilise`, `alerte=true` si < 500 m. Ventilation coupe (`coupePrem/Deux/Dechet/Approuve`) exposée par OF.
- `creerOrdrePreparation(data)` : ajoute la ligne (refus si métrage > 5000), calcule poids, enregistre mouvement MP `Préparation Ourdissage` (Stock→Ourdissage).
- `receptionEnsouple(rowNum, data)` : écrit `Date Nouage`, `Num Machine`, `Métrage Ensouple`.
- `corrigerMetrageEnsouple` : écrase le métrage (refus si > 5000).
- `_chargerMouvementsOurdissage / _enregistrerMouvementOurdissage` : lit/écrit dans MP les mouvements dont l'opération contient `ourdissage`.

## Module 14 — Tissage temps réel

Source : `TISSAGE_SS_ID_ERP`, onglet `OFs_Tissage` (snapshot 37 colonnes construit par l'app terrain : Num OF, Machine, Ordre, Produit, Dimensions, Ref Fab/Com, Client, Commande, quantités, Etats, Vitesse, Duite/cm, Nb Duites Total, Largeur, Machines Compatibles, BAT, Notes, MAJ).

- `chargerEtatsTissageTempsReel()` : exclut les lignes `planifi*`. `dureeRestanteMin = (nbDuites × qteRestante / qteAFab) / vitesse`. Classe par machine, agrège `statsMachines` (`nbActifs, nbAttDem, nbPause, nbAttMP, nbTermine, nbQteManq`, `totalMin/enCoursMin/planMin`). « Actif » = état contenant `cours/depart/aliment/casse/arret/panne/ensouple/changement fil/nettoyage/maintenance/fin poste`.
- `chargerAnalyseTissage(periode, de, a)` : lit `Operations` (durées pause/panne/ensouple/nettoyage/maintenance) et `Fabrication` (production) sur jour/semaine/mois/custom. Rattache la production à la machine via `_trouverMachineDeOF`.
- `_chargerMachinesEquip()` / `_chargerQteFabTissage()` : lit vitesse/unité par machine et cumul production par OF.

## Module 02 — Coupe

Source : `FAB_SS_ID`, onglets `Fabrication`, `Details_Fabrication`, `Doublons_Fabrication`, `Analyse_Jour/Semaine/Mois/Operateur`, `TriggerLog`.

Colonnes `Fabrication` (via `COL_ALIASES_COUPE`) : `Num OF`, `Operateur`, `Date Fabrication`, `Qte Premiere`, `Qte Deuxieme`, `Dechet`, `Qte Deuxieme Approuvee`, `Ourlet`, `Type`, `Terminal`, `Etat`, `Date systeme`, `Photo`.

- `installerDeclencheurCoupe / onEditFabricationTrigger` : édition journalisée dans `TriggerLog` (module, action, statut, source, user, Num OF, row, message, payload).
- `_coupeSumFabricationForOF_` : agrège `{qtePrem, qteDeux, dechet, approuve, ourlet}` par OF (clé canon : préfixe `OF` retiré).
- `_coupeFabriqueTotale_` = `qtePrem + qteDeux + approuve + dechet`.
- `_coupeCountLignesDeuxiemePourOF_` : nb saisies où `Qte Deuxieme > 0` (une étiquette « NumOF-Deu » par ligne).
- `getStatusOFCoupe` : cumul + croisement OF (`buildOFLookupSafe_`). Renvoie `surplus = max(0, fabrique − qteAFab)`, `resteAFab = max(0, qteAFab − fabrique)`, `objectifAtteint`, infos commande/client/ref/machine.
- CRUD : `ajouterLigneCoupe` (état défaut `En Cours`, photo RichText), `modifierLigneCoupe`, `supprimerLigneCoupe`, `remettreDoublonCoupe`.
- Lectures : `getDonneesRecentesCoupe`, `getDetailsForPeriodeCoupe`, `getRecapJourneeCoupe`.
- `peuplerDetailsFabrication` : agrège par Num OF, croise avec `chargerOFs`, calcule `QTE Acceptee = qtePrem + approuve`, `Reste = max(0, aFab − qtePrem)`, `Surplus = max(0, qtePrem − aFab)`. `Etat Coupe` auto : « Non Démarré » / « En cours » / « Terminé » si `qtePrem ≥ aFab` — conserve l'état OF s'il diffère de « Non Démarré ». Ligne `TOTAL` finale.

## Synthèse transverse

### Machine à états d'un OF
1. **Création** : ligne posée dans OF Commande ou OF Stock (`CAxxxx` via `prochainNumOFCA_`). 3 états vides.
2. **Lancement** (`lancerOF`) : Prep=`Non Préparé`, Tissage=`Attente`, Coupe=`Non Démarré`.
3. **Attribution machine** (`attribuerMachineOF`) : `Num Machine` écrit, sélecteurs Prep MP générés depuis BOM Composant.
4. **Préparation MP** : `Non Préparé → Préparé Partiel → Préparé` (ou `Pas de Besoin` shortcut). `Manque Matiere` bloquant → alerte `demande_mp`.
5. **Tissage** : `Attente → Planifier → Machine Alimentée → Départ → En cours ⇄ Pause → Terminé | Terminé Qte Manquante`. Le compteur mètres tissés déclenche alerte à 500 m restants.
6. **Coupe** : `Non Démarré → En cours ⇄ Pause → Terminé | Terminé Qte Manquante`. Termine quand `qtePrem ≥ qteAFab`.
7. **Clôture** : prep OK + tissage `Terminé*` + coupe `Terminé*`.

### BOM et sélecteurs MP
Le BOM composant se traduit via 6 blocs S01–S06 sur la ligne OF. Chaque bloc : `Code Sxx`, `QR MP Réel Sxx`, `Besoin Sxx (kg)` (besoin théorique BOM × quantité composant à fabriquer), `Poids Consommé Sxx` (= poids sorti − poids retour), `Différence Sxx (kg)`. Le classeur externe **Prep MP Fabrication** porte la vue opérationnelle une-ligne-par-sélecteur (`Num Selecteur`, `Code Couleur Selecteur`, `Besoin`, `QR MP Planifie/Attribue/Reel`, `Poids Sorti/Retour/Consomme`, `Etat`).

### Workflow Ourdissage
`creerOrdrePreparation` crée une ligne ensouple (≤ 5000 m) + mouvement MP Stock→Ourdissage. `receptionEnsouple` renseigne date de nouage et machine. Métrage utilisé/machine = Σ (`qteCoupeTot × Longueur Tissage`) des OF affectés ; alerte si restant < 500 m.

### Workflow Tissage (tablettes)
L'app Tissage rafraîchit `OFs_Tissage`, puis `sauvegarderActionTissageOF` écrit `Etat Tissage`, `Compteur à Afficher`, `Remarque/Photo Tissage`, `Saisi par`. Actions boutons : `Machine Alimentée`, `Départ`, `Pause`, `En cours`, `Casse Trame/Chaîne/Ensouple`, `Panne`, `Changement Fil`, `Nettoyage`, `Maintenance`, `Fin Poste`, `Terminé`, `Terminé Qte Manquante`. Analyses croisent `Operations` (arrêts) et `Fabrication` (production).

### Workflow Coupe et étiquettes
Chaque saisie `Fabrication` = 1 lot coupé (opérateur, quantités 1ʳᵉ/2ᵉ/dechet/approuvée/ourlet, photo). Étiquettes générées via `EtiqSuiviApp` avec `piecesParEtiquette` (défaut 5, ScriptProperty `ETIQ_PIECES_PAR_LOT`). Une saisie `Qte Deuxieme > 0` crée un incrément d'étiquette `NumOF-Deu`. Rattachement PF via `Num Suivis` étiquette (chaîne `Num OF étiquette → Num Suivis → ID Commande → OF`, préfixe `OF` retiré, base retrouvée avant `-suffixe`).

### Interactions Fabrication ↔ Stock
- **MP** : mouvements écrits dans `MP_SS_ID` avec opération = `Préparation Ourdissage / Alimentation Fabrication / Alimentation Surplus / Préparation Fabrication / Retour Fabrication`, colonnes `Depart`, `Destination`, `Poids`, `QR MP`, `Code Fabrication MP`, `Num OF`, `Num Selecteur`. `alimenterMachine`/`retourMP` peuplent Prep MP et écrivent les mouvements. Poids consommé/sélecteur = `poidsSorti − poidsRetour`.
- **PF** : la coupe alimente `Details_Fabrication` (agrégé), Colisage/Stock PF croisent par `Num OF` (canon) via `Num Suivis`/`ID Commande` pour incrémenter les colis produits (`colisParOf`). `getOFResumeParRefFabricationStock_` regroupe les OF Stock (CAxx) par référence de fabrication pour piloter la couverture stock.
- **Messagerie** : hub `Messages_Postes` — `demande_mp` (tissage→magasinier), `coupe_qte_manquante/coupe_fab_changee` (coupe→tissage), `tissage_restant_500m`, `planning_urgent`, + messages libres via `envoyerMessageFabricationInterposte`.
