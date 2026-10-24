# Legacy Google Apps Script — Admin / RH / Config / Core

Analyse du GAS legacy : bootstrap, config, cache, admin, RH et BDD.

## Module `Code.gs` — Bootstrap & constantes globales

**Constantes** (IDs Spreadsheets « source active » codés en dur) :
`HUB_SS_ID`, `PARAM_SS_ID`, `CAT_SS_ID`/`CATALOGUE_SS_ID`, `COMMANDES_SS_ID`, `MP_SS_ID`, `FAB_SS_ID`, `EQUIP_SS_ID`, `BOM_SS_ID` (= Catalogue), `COMMERCIAL_SS_ID`, `LISTE_COLISAGE_SS_ID`, `PREP_MP_SS_ID`, `OF_SS_ID`, `OURD_SS_ID`, `STOCK_PF_SS_ID`, `ST_SS_ID`, `MVT_SS_ID`, plus les classeurs Détails documents (`DETAILS_DEVIS_SS_ID`, `DETAILS_FACTURES_SS_ID`, `DETAILS_BR_SS_ID`, `DETAILS_AVOIRS_SS_ID`, `DETAILS_COMMERCIAL_SS_ID` = Commercial).

**Fonctions serveur** :
- `doGet(e)` — sert le template `Dashboard.html`, mode XFrame `ALLOWALL`, titre « La Plume ERP ». C'est l'unique route Web App ; pas de `doPost`.
- `include(filename)` — lit un fichier HTML partiel via `HtmlService.createHtmlOutputFromFile(...)`. Filet de sécurité : si `HTML_Core` est absent/vide, renvoie `getHtmlCoreFallback_()` (un mini écran de login inline).
- `getModuleHTML(moduleId)` — mapping alias→fichier (`commercial`→`HTML_Modules_Commercial`, `production`→`HTML_Modules_Production`, `ststock`→`HTML_Modules_ST_Stock`). Sert le lazy-loading côté client depuis `JS_Core`.
- `pingLpa()` — heartbeat renvoyant `{ok:true, t:Date.now()}` (utilisé pour tester `google.script.run` avant login).
- `chargerAppData()` — renvoie `{config: _loadRuntimeIds_(), stats:{produits, commandes}}` ; lit `Produits` (getLastRow seulement) et `Commandes` plafonné à 12 000 lignes.
- `getAlertes()` — lit l'onglet `Alertes` du Hub, filtre `actif`, retourne `[{message, priorite}]`.
- `syncPeriodiqueERP()` — trigger horaire : appelle `majEtatsOFDepuisDonneesReelles()` ; enveloppe try/catch.
- `installerTriggersERP()`, `desinstallerTriggersERP()` — pose/retire le trigger horaire.

⚠️ NB : `chargerAppData()` est redéfinie ici après celle de `01_Config.gs` — la version de `Code.gs` gagne à l'exécution.

## Module `00_Cache.gs` — Cache Spreadsheets et résolution runtime

**Variables** : `_ssCache` (map ID→Spreadsheet), `_runtimeIdsCache` (map clé canonique→ID). Plafonds : `_RUNTIME_HUB_CFG_MAX_ROWS = 400`, `_RUNTIME_HUB_TABLE_MAX_ROWS = 4000`, `_RUNTIME_PARAM_CFG_MAX_ROWS = 400`, `_SHEET_DATA_DEFAULT_MAX_ROWS = 15 000`.

**Fonctions serveur** :
- `_runtimeDefaultIdsMap_()` — map par défaut (clé canonique → constante `Code.gs`).
- `_runtimeAliasKey_(rawKey)` — normalisation (accents, ponctuation) + table d'alias (`hub`, `param`, `cat`, `fab`, `mp`, `bom`, `of`, `ourd`, `st_mvt`, `stock_produit_finis`, `matiere_premiere`, `equipement`, `sous_traitance`, `details_devis_ss`, `details_factures_ss`, `details_br_ss`, `details_avoirs_ss`, `details_commercial_ss`, `liste_colisage`…).
- `_loadRuntimeIds_()` — merge en trois passes : 1) `PARAM_SS_ID > Configuration` (openById direct, hors cache pour éviter récursion) ; 2) Hub > `Configuration` ; 3) Hub > `Table` (source de vérité, priorité finale). Résultat mémoïsé dans `_runtimeIdsCache`.
- `clearRuntimeIdsCache_()` — invalidation manuelle (appelée après `sauvegarderConfiguration`).
- `getRuntimeSsIdByKey_(key, fallback)`, `_resolveRuntimeSpreadsheetId_(inputId)` — traduction ID par défaut → ID runtime effectif.
- `getSpreadsheet_(id)`, `getSheet_(ssId, sheetName)` — accès avec cache instance.
- `getSheetData_`, `getSheetDataMaxRows_` — lecture avec plafond de lignes, renvoie `{sheet, headers, headersLower, rows, raw}`.
- Helpers : `resolveCols_(headers, aliases)`, `formatDateSafe_`, `weekLabel_`, `monthLabel_`, `buildRowFromMap_`, `getColMap_`, `ensureSheet_` (crée feuille si absente + entêtes bleu foncé `#1B4332`), `_serializeValue`/`_serializeRows` (dates → `dd/MM/yyyy` GMT+1).
- `buildOFLookupShared_()` / `buildOFLookupSafe_()` — lookup partagé OF pour Coupe/ST/Ourdissage : matérialise pour chaque `Num OF` un objet client/modèle/dimensions/machine/qtés/états/type fabrication/finition/tissage/personnalisation/temps.

**Cache — TTL & invalidation** : purement in-process (durée d'une exécution serveur). Pas de `CacheService`. Invalidation manuelle via `clearRuntimeIdsCache_()`. Un cache client de 90 s existe côté navigateur (`_fabOfCache`, `_fabPlanBootstrapCache`) pour les lignes OF.

## Module `01_Config.gs` — Configuration & synchro des références

**Fonctions serveur** :
- `_getConfig()` — lit Hub > `Configuration` (clé/valeur) puis surcharge par les IDs runtime résolus.
- `_syncClientsRefFromCommercialInternal_()` / `synchroniserClientsRefHub()` / `initClientsRefFromCommercial()` — copie `Commercial > Clients` (Num Client, Nom, Ville, Tel, Email, Actif) vers `Hub > Clients_Ref`, triée, avec entêtes gras.
- `rebuildAllRefs()` — point d'entrée unique de reconstruction des références critiques (aujourd'hui seul `synchroniserClientsRefHub` est câblé).
- `lireTableSSIds()` — merge Hub `Configuration` + Hub `Table` (variantes de nom testées : `Table`, `TABLE`, `Table SS`, `SS IDs`, `Inventaire IDs`).
- `getRuntimeIdsSource()` — pour l'écran admin : pour chaque IDs (`ss_hub`, `ss_catalogue`, `ss_commandes`, `ss_commercial`, `ss_fabrication`, `ss_st_mvt`, `ss_sous_traitant`, `ss_stock_produit_finis`, `ss_matiere_premiere`, `ss_parametrage`, `ss_equipement`, `ss_bom`, `ss_of`, `details_commercial_ss`, `ourd_ss`, `details_devis_ss`/`_factures_ss`/`_br_ss`/`_avoirs_ss`), indique source (`Table Hub` > `Configuration` > `Code.gs`).
- `sauvegarderConfiguration(cfg)` — réécrit Hub > `Configuration` (clearContents + setValues), invalide cache.
- `chargerAppData()` — variante retournant `{config, stats}` (produits/articles/commandes en cours) ; écrasée par `Code.gs`.

**Config globale** : les valeurs métier (devise, TVA, formats numérotation, timbre fiscal, RIB, logo, matricule fiscal, modèle document) sont stockées dans Hub > `Societe` sous forme clé/valeur ; champs standardisés listés dans `sauvegarderParametrageSociete` : « Nom société », Adresse, Code postal, Ville, Pays, Téléphone, Email, Site web, Matricule Fiscal, RIB Bancaire, RC, Logo URL, TVA défaut, Devise, Timbre fiscal, Format Devis/Commande/Facture/BL/Avoir/Bon Retour, Modèle document. Les langues, seuils, séquences détaillées ne sont pas codés en constantes : ils vivent en cellules.

## Module `06_Admin.gs` — Utilisateurs, autorisations, société, upload

**Authentification** :
- `login(username, password)` : ouvre Hub via `openById` direct (bypass `_loadRuntimeIds_` pour éviter les 30–60 s de blocage). Cherche feuille `Utilisateurs`|`Utilisateur`|`Users`|`users`. Lit lignes plafonnées à 6 000. Détection d'en-têtes par score (mots-clés `username`, `password`, `role`, `email`, `actif`) ; sinon défaut `['Username','Password','Nom','Prenom','Role','Email','Actif']`. Compare username/password en clair (⚠️ pas de hash). Vérifie `Actif`. Construit `access = {erp, commercial, fabrication, sous_traitance_erp, comptabilite, stock, matiere_premiere, tissage, coupe, sous_traitance, magasin_export}` par colonnes booléennes. Refuse si aucun module accessible. Retourne `{ok, user:{username, nom, prenom, email, role, access}, access}`.

**Fonctions serveur** :
- `_getUsersSheetForLogin_`, `_adminHubFirstSheet_(names)`, `_getUsersDataSheet_(createIfMissing)`, `_readUsersFromHubSheet_`, `_readAutorisationsFromHubSheet_` — helpers.
- `getUtilisateursEtAutorisations()` → `{users, autorisations}` — `Autorisations` = matrice Username × modules (Dashboard, Commercial, Production, Stock, Catalogue, RH, Admin).
- `sauvegarderAutorisations(username, autorisations)` — upsert dans `Autorisations`.
- `sauvegarderAccesModules(username, accessByCol)` — met à jour directement les colonnes booléennes de la ligne utilisateur (crée la colonne si absente).
- `sauvegarderUtilisateur(data)` — append user, refuse doublon Username, rôle défaut `Fabrication`.
- `modifierUtilisateur(rowNum, data)`, `toggleUtilisateurActif(rowNum)`, `supprimerUtilisateur(rowNum)`.
- `getParametrageSociete()` / `sauvegarderParametrageSociete(data)` — CRUD Hub > `Societe`.
- `uploadPhotoToDrive(base64Data, fileName, folderName)` — décode base64, dépose dans dossier Drive (défaut `Photos_Fabrication`), partage `ANYONE_WITH_LINK`/VIEW, renvoie URL `drive.google.com/uc?id=`.
- `chargerDataMP(ssId)` — comptage rapide de lignes MP.

## Module `12_RH.gs` — Ressources humaines

Stocké dans le Hub (`RH_SS_ID = HUB_SS_ID`). Onglets : `RH_Employes`, `RH_Conges`, `RH_Presences`, `RH_Salaires`.

**Modèle de données** :
- Employés : Matricule, Nom, Prenom, Poste, Date Embauche, Actif.
- Congés : ID, Matricule, Nom, Type Conge, Date Debut, Date Fin, Statut, Commentaire, Date Saisie.
- Présences (pointage) : ID, Matricule, Nom, Date, Heure Entree, Heure Sortie, Heures, Statut.
- Salaires (paie) : ID, Matricule, Nom, Mois, Salaire Base, Primes, Retenues, Net, Statut. Net calculé `base + primes − retenues`. Pas de sanctions modélisées comme entité distincte : les retenues font office. Pas de gestion primes séparée.

**Fonctions serveur** : `initRHSheets()`, `getRHDashboardData()` (KPIs : totalEmployes, employesActifs, congesEnCours, presencesSaisies, salairesValides), `ajouterCongeRH(data)` (ID `CG<timestamp>`), `ajouterPresenceRH(data)` (ID `PR<ts>`), `ajouterSalaireRH(data)` (ID `SL<ts>`, calcule net), `ajouterEmployeRH(data)` (matricule auto `EMP<6 derniers>`), `modifierEmployeRH`/`supprimerEmployeRH`, `modifierCongeRH`/`supprimerCongeRH`, `getEmployeByMatricule(matricule)`, `calculerSoldeConges(matricule)` (droit annuel constant `30` jours, décompte selon statut `valide|accepte|termine`).

## Front-end noyau — `HTML_Core.html` + `JS_Core.html`

`Dashboard.html` inclut `HTML_Core` (login `#pg-login` + sélecteur de module `#moduleSelectorWrap` + iframe hôte `#moduleIframeWrap` + `#erpWrap` avec sidebar) puis `JS_Core`.

**Flux de session** :
1. Au load, `JS_Core` appelle `_ensureLoginShell()` (crée un shell si HTML partiel), puis lit `sessionStorage.lpa_u`. Si présent → `enterApp()` ; sinon `showLogin()`.
2. `doLogin()` : d'abord un `pingLpa()` (timeout 15 s), puis `login(u,p)` (timeout 45 s). Succès → `sessionStorage.setItem('lpa_u', user)` et `lpa_pwd` (pour SSO iframe vers modules externes en `?auth=base64(u:p)`).
3. `applyPostLoginRoute()` route selon `role` (normalisé sans accents) : `admin|direction|superadmin` → `goHome` ; `export|colis|emball|finition` → colisage ; `ourd`, `tiss`, `coupe`, `mag_st`, `sous trait`, `mag_mp|prep|matiere`, `planif` → écran dédié.
4. `logout()` supprime `lpa_u` et retourne à login.
5. Chargement lazy des modules : `_lazyPageModule` mappe pageId (`pgCoupe`, `pgClients`, `pgST`, `pgMouvStock`, …) → un des trois bundles HTML servi par `getModuleHTML`. Un cache client 90 s couvre les listes OF/planif.

Session = purement `sessionStorage` client + credentials rejoués à chaque appel : pas de token serveur, pas d'expiration côté serveur, mot de passe stocké en clair côté navigateur.

## Structure BDD créée par `Setup_Database.gs`

14 spreadsheets créés (headers en gras `#1e3a5f`) :

1. **Hub** (`ss_hub`) — `La Plume — Hub` : `Configuration` (Clé, Valeur), `Table` (Clé, Valeur), `Clients_Ref`, `Alertes` (Message, Priorité, Actif), `Messages` (ID, De, Vers, Module, Sujet, Corps, Date, Lu), `Utilisateurs`, `Autorisations` (Username + Dashboard, Commercial, Production, Stock, Catalogue, RH, Admin), `RH_Employes`, `RH_Conges`, `RH_Presences`, `RH_Salaires`.
2. **Paramétrage** (`ss_parametrage`) : `Configuration`, `Couleur` (Nom, Code, Famille, Hex), `Societe`.
3. **Catalogue** (`ss_catalogue`, = BOM) : `Produit`, `Articles`, `BOM Master`, `BOM Composant` (avec consommations sélecteurs 01–06, laize, duites, machines compatibles, temps fabrication, BAT image).
4. **Commercial** (`ss_commercial`) : `Clients`, `Devis`, `Factures`, `Bons_Livraison`, `Bons_Retour`, `Avoirs`, `Paramétrage Vente`, plus les `Details_Devis`, `Details_Factures`, `Details_BL`, `Details_BR`, `Details_Avoirs` (colonnes ID Ligne, doc, Num Client, Ref Commercial, Modèle, Dimensions, Qte, Prix, Montant…).
5. **Commandes** (`ss_commandes`) : `Commandes` (ID, Num, Client, Ref, Date, Etat, Qté, HT, TVA, TTC, Étiquette, Emballage, Instruction, Personnalisation) + `Details_Commandes` (Ref Client, Ref Commercial, Produit, Dimensions, Stock, Reserve, A Fabriquer, EAN, Personnalisation, Ordre de Fabrication).
6. **Fabrication** (`ss_fabrication`) : `Fabrication`, `Doublons_Fabrication`, `Details_Fabrication`, `TriggerLog`, `Analyse_Jour`, `Analyse_Semaine`, `Analyse_Mois`, `Analyse_Operateur`.
7. **Ordres de Fabrication** (`of_ss`) : `Ordre de Fabrication` + `Ordre de Fabrication Stock` (tail commun ~70 colonnes : ref, produit, dimensions, type finition/fabrication, qtés commandé/réservé/à fabriquer/fabriqué/deuxième/approuvé/ourlet/reste/surplus, machine, temps, états Prep MP/Tissage/Coupe, largeur/longueur/métrage tissage, duites, puis 6 blocs sélecteurs S01–S06 avec Code, QR MP Réel, Besoin kg, Poids Consommé, Différence kg, + totaux besoin/consommé/différence) ; `Parametrage Fabrication` ; `Equipe Fabrication`.
8. **Matière Première** (`ss_matiere_premiere`) : `Liste Matière Première`, `Matière premiere` (mouvements), `Ordres Alimentation Usine`.
9. **Ourdissage** (`ourd_ss`) : `Ourdissage`, `Réception Ensouple`, `Mouvements Ourdissage`.
10. **Sous-traitants** (`ss_sous_traitant`) : `Sous Traitant`, `Prix service`.
11. **Mouvements ST** (`ss_st_mvt`) : `Mouvement ST` (Num Suivi, Opération, Départ, Destination, Qté, Num OF, Photo, ST Identification/Nom…).
12. **Stock PF** (`ss_stock_produit_finis`) : `Entrepot`, `Mouvement Stock`.
13. **Équipement** (`ss_equipement`) : `Equipement` (Nom, Type, Marque, Modèle, Etat, dates maintenance, photo).
14. **Colisage** (`ss_liste_colisage`) : `Liste de Colisage`, `Liste des palettes`.

`setupDatabase()` crée le classeur, écrit les entêtes stylés, log les IDs, et à la fin `_writeIdsToHub()` peuple Hub > `Table` (avec alias `ss_bom` → id Catalogue). `previewDatabase()` affiche la structure sans créer les classeurs.
