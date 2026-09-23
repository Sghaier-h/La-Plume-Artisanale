# La Plume Artisanale — Contrat de domaine

Version : **2.0** · Statut : brouillon en validation · Refonte complète intégrant toutes les analyses legacy.

Ce document est la **source de vérité** pour le vocabulaire, les entités, les endpoints et les règles métier du projet. Il remplace intégralement les versions 1.x.

Toute modification postérieure (ajout de champ, changement de règle, renommage d'endpoint) doit apparaître au [Changelog](#changelog) — sinon elle n'existe pas.

---

## Table des matières

1. [Introduction & périmètre](#1-introduction--périmètre)
2. [Règles transverses](#2-règles-transverses)
3. [CRM & Comptes](#3-crm--comptes-phase-1)
4. [Tarification](#4-tarification-phase-1)
5. [Produits](#5-produits-phase-2)
6. [Stock & Entrepôts](#6-stock--entrepôts-phase-25)
7. [Fabrication](#7-fabrication-phase-27)
8. [Ventes](#8-ventes-phase-3)
9. [Achats & Fournisseurs](#9-achats--fournisseurs-phase-32)
10. [Comptabilité](#10-comptabilité-phase-4)
11. [Communications](#11-communications)
12. [Messagerie inter-postes](#12-messagerie-inter-postes)
13. [Conformité fiscale par pays](#13-conformité-fiscale-par-pays)
14. [Dashboards](#14-dashboards)
15. [Menu](#15-menu)
16. [Paramètre société](#16-paramètre-société)
17. [Ordre d'exécution](#17-ordre-dexécution)

---

## 1. Introduction & périmètre

**Métier** : La Plume Artisanale fabrique et vend des textiles tunisiens (foutas, jetés, serviettes, ponchos, sacs) à des professionnels et particuliers, en Tunisie et à l'export UE. Fabrication à façon possible.

**Périmètre couvert par cette v2.0** :

| Phase | Domaine | Description courte |
|---|---|---|
| Phase 1 | CRM & Comptes | Clients, contacts, adresses, leads, interactions, grilles tarifaires |
| Phase 2 | Produits | Modèles → Articles (variantes), photos multi, EAN, SEO, catalogues web |
| Phase 2.5 | Stock & Entrepôts | 6 catégories (PF/SF/MP/Fournitures Fab/Fournitures Bureau/Emballage/Pièces Rechange), mouvements, lots, réservations, inventaires |
| Phase 2.7 | Fabrication | BOM Master/Composants, gammes, machines (Dornier), OF Commande + OF Stock, ourdissage, tissage, coupe, contrôle qualité 1er/2e/ourlet/déchet, sous-traitance, planning Gantt, coûts |
| Phase 3 | Ventes | Devis, Commande, BL, Colisage, Palettes, Transporteurs, Facture, Avoir, Bon retour, Paiements & Échéances, Relances |
| Phase 3.2 | Achats & Fournisseurs | Bons de commande fournisseur, réceptions, factures fournisseur, paiements |
| Phase 4 | Comptabilité | Plan de comptes SYSCOA, journal, TVA, fond de caisse, rapprochement bancaire, charges d'exploitation (loyer, électricité, eau, internet, salaires), immobilisations & amortissements, bilan, compte de résultat |
| Phase 4 | Marketing | Campagnes multi-canal, segments, comptes externes (Facebook, Instagram, Google Ads, Mailchimp…) |
| Transverse | Messagerie inter-postes | Alertes et messages entre postes atelier (500 m tissage, demande complément MP, coupe qté manquante…) |

**Sources de vérité analysées** :
- Legacy Google Apps Script (17 modules `.gs` + 14 spreadsheets Hub) — production actuelle
- Fichier BOM 2025-2026.xlsx (feuille `Base Commandes`, 84 colonnes)
- Fichier `references_articles.csv` (1531 articles réels)
- 4 dashboards TSX legacy (Chef Prod, Chef Atelier, Magasinier MP, Tisseur)
- Documents de discussion (`RECAP`, `TRANSCRIPT`)
- Code actuel du projet (`docs/coverage-matrix.md`)

**Hors périmètre v2.0 (masqué du menu)** : RH étendu, gestion des congés/sanctions, e-commerce direct, IA, portail client, dashboards tablettes déjà existants qui ne collent pas au périmètre.

---

## 2. Règles transverses

### 2.1 Nommage

- Une seule orthographe par identifiant : `id_client`, `id_contact`, `id_adresse`, `id_modele`, `id_article`, `id_devis`, `id_commande`, `id_bl`, `id_facture`, `id_avoir`, `id_retour`, `id_colis`, `id_palette`, `id_catalogue`, `id_transporteur`, `id_bom`, `id_of`, `id_entrepot`, `id_lot`, `id_mouvement`, `id_reservation`, `id_inventaire`, `id_fournisseur`, `id_bc` (bon commande), `id_reception`, `id_facture_fournisseur`, `id_ecriture`, `id_compte_comptable`. **Jamais** de pluriel dans les FK (`id_modeles` interdit).
- Colonnes datetime : `date_creation`, `date_modification`, `date_creation_of`, `date_expedition`, etc.
- Colonnes utilisateur : `cree_par` (id_utilisateur), `modifie_par`.
- Statuts : minuscule avec underscore (`en_attente`, `en_cours`, `livree`, `payee`). **Interdit** : `TRANSFORME`, `Solder`, `Terminé Qte Manquante` (utiliser `terminee_qte_manquante`).

### 2.2 Enveloppe API — unique

Toutes les réponses backend suivent :

```json
{ "success": true, "data": <payload>, "pagination"?: {...}, "message"?: "..." }
```

Erreur :

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

- Liste paginée → `data` = tableau, `pagination` = `{page, limit, total, total_pages}`.
- Objet unique → `data` = objet.
- **Interdit** : `data.data`, `data.items`, `data.matieres`, `data.rows` — un seul niveau.

### 2.3 Devise et arithmétique

- Devise par défaut : **TND** (Tunisie, symbole DT).
- Colonnes monétaires : PostgreSQL `NUMERIC(14,3)`. Frontend : **toujours** `Number(x || 0).toFixed(3)`.
- **TVA défaut Tunisie** : **19 %**. **Timbre fiscal** : **1 DT** par facture.
- UE B2B intra-communautaire : 0 % TVA + mention "Autoliquidation".

### 2.4 RBAC — rôles

| Rôle | Portée |
|---|---|
| `ADMIN` | Voit tout, peut tout. Seul habilité à créer/valider une facture, un avoir, une commission versée, une écriture comptable, une clôture d'exercice. |
| `COMMERCIAL` | Voit ses comptes uniquement (`id_commercial = <lui>`). Peut créer/modifier client, contact, devis, commande, BL. Voit son compte de commission. |
| `MAGASINIER_STOCK` | Gère les entrepôts (réceptions, sorties, transferts, inventaires). Toutes catégories sauf MP. |
| `MAGASINIER_MP` | Prépare les kits MP par sélecteur (S01–S08) pour chaque OF. Scan QR bobine. |
| `MAGASINIER_PREPARATION` | Prépare le colisage des commandes. Ne voit pas les prix. |
| `MAGASINIER_SOUSTRAITANTS` | Sortie/retour ST, contrôle qualité au retour, litiges. |
| `CHEF_PRODUCTION` | Planning Gantt global, création OF, dispatching machines. |
| `CHEF_ATELIER` | Pilotage terrain d'un atelier physique. |
| `OURDISSEUR` | Prépare les ensouples (chaîne) sur ourdissoir. |
| `TISSEUR` | Opère un métier à tisser. Tablette. |
| `COUPEUR` | Coupe rouleaux tissés. Tablette. |
| `CONTROLEUR_QUALITE` | Contrôle qualité par étape et global. |
| `MECANICIEN` | Maintenance machines curative et préventive. |
| `COMPTABLE` | Écritures, TVA, rapprochement, bilan. Ne modifie pas les factures émises. |

**Règle** : filtrage backend obligatoire. Le frontend n'est jamais autorité.

### 2.5 Numérotation officielle

Alignée sur le legacy pour rétrocompatibilité :

| Document | Format | Exemple | Notes |
|---|---|---|---|
| Devis | `DV-{YYYYMM}{SEQ3}` | `DV-2026090001` | SEQ mensuel |
| Commande | `CMD-{YYYYMM}{SEQ3}` | `CMD-2026090012` | SEQ mensuel |
| Facture | `FA-{YYYYMM}{SEQ4}` | `FA-20260900123` | SEQ **4 chiffres**, mensuel |
| Bon de livraison | `BL-{YYYYMM}{SEQ3}` | `BL-2026090005` | SEQ mensuel |
| Avoir | `AV-{YYYYMM}{SEQ3}` | `AV-2026090003` | SEQ mensuel |
| Bon de retour | `BR-{YYYYMM}{SEQ3}` | `BR-2026090002` | SEQ mensuel |
| OF Commande | `OF{6 chiffres}` | `OF249780` | SEQ global |
| OF Stock catalogue | `CA{4 chiffres}` | `CA0087` | SEQ global (stock catalogue) |
| Colis | `C{3 der. chiff. client}-{3 der. chiff. commande}-{NNN}` | `C234-567-001` | SEQ par commande |
| Palette | `PAL{YY}-{seq}` | `PAL26-042` | SEQ annuel |
| Étiquette lot | `<numOF>-<seq>` / `<numOF>-SUR<xx>` / `<numOF>-DEU<xx>` | `OF249780-3`, `OF249780-SUR01`, `OF249780-DEU02` | 5 pièces/étiquette défaut |
| Bon commande fournisseur | `BC-{YYYYMM}{SEQ3}` | `BC-2026090001` | SEQ mensuel |
| Réception fournisseur | `REC-{YYYYMM}{SEQ3}` | `REC-2026090001` | SEQ mensuel |
| Facture fournisseur (référence interne) | `FF-{YYYYMM}{SEQ4}` | `FF-20260900010` | La FF a aussi son numéro fournisseur |
| Écriture comptable | `EC-{YYYY}{SEQ6}` | `EC-2026000123` | SEQ annuel |
| Client (code) | `CLI-{YYYY}-{NNNN}` | `CLI-2026-0234` | Les 3 derniers chiffres alimentent le num colis |
| Bon sortie ST | `BSST-{YYYY}-{NNNNN}` | `BSST-2026-00042` | SEQ annuel |
| Bon retour ST | `BRST-{YYYY}-{NNNNN}` | `BRST-2026-00042` | SEQ annuel |

### 2.6 Bugs legacy identifiés à corriger

Ces défauts sont documentés — **notre v2.0 les corrige** :

- Stock réservé non déduit du stock disponible → notre `quantite_reservee` corrige (§6.4)
- Auth avec mot de passe en clair + session sessionStorage → bcrypt + JWT + refresh token
- Cache in-process sans invalidation → Redis + invalidation par événement métier
- Multi-classeurs Sheets avec IDs codés en dur → PostgreSQL unique + FK strictes
- Matching flexible colonnes (accents/casse) → schéma strict + validation
- Mojibake UTF-8 → UTF-8 strict backend + frontend
- Numérotation par balayage complet des feuilles → séquences PostgreSQL nativement atomiques
- Fonctions kilométriques mélangeant lecture Sheets / règles / UI → controllers séparés services séparés
- Absence litiges/2e choix ST → tables dédiées `litiges_st`

---

## 3. CRM & Comptes (Phase 1)

### 3.1 `comptes`

Un compte représente une société OU un particulier avec qui on fait du business.

| Colonne | Type | Note |
|---|---|---|
| `id_client` | serial PK | |
| `code_client` | varchar(32) unique | `CLI-{YYYY}-{NNNN}`, auto |
| `type_compte` | enum | `societe` \| `particulier` |
| `statut_crm` | enum | `lead` \| `prospect` \| `client` \| `archive` |
| `raison_sociale` | varchar(200) | requis si `societe` |
| `nom` / `prenom` | varchar(100) | requis si `particulier` |
| `pays` | char(2) ISO | `TN`, `FR`, `DE`... |
| `matricule_fiscal` | varchar(50) | Tunisie |
| `numero_tva_intracom` | varchar(20) | UE |
| `siret` | varchar(14) | France |
| `id_grille_tarif` | FK grilles_tarif | |
| `id_commercial` | FK utilisateurs | commercial référent |
| `source_lead` | varchar(50) | `email`, `pub_facebook`, `salon`, `referral`, `manual`, `import`… |
| `canal_prefere` | enum | `email` \| `whatsapp` \| `telegram` \| `telephone` |
| `consent_marketing_email` + `date_consent_email` | bool + timestamp | |
| `consent_marketing_whatsapp` + `date_consent_whatsapp` | bool + timestamp | |
| `consent_marketing_telegram` + `date_consent_telegram` | bool + timestamp | |
| `notes` | text | |
| `actif` | bool | |
| Champs audit | | `date_creation`, `cree_par`, `date_modification`, `modifie_par` |

**Règle** : 1 seul `id_commercial` référent par compte. À la création par un COMMERCIAL, `id_commercial = <lui>`. ADMIN peut réassigner.

### 3.2 `contacts`

Personne physique attachée à UN compte.

| Colonne | Type | Note |
|---|---|---|
| `id_contact` | serial PK | |
| `id_client` | FK comptes | ON DELETE CASCADE |
| `role` | enum | `responsable` \| `acheteur` \| `commercial_client` \| `technique` \| `comptabilite` \| `autre` |
| `civilite` | enum | `M` \| `Mme` |
| `nom` / `prenom` | varchar(100) | |
| `fonction` | varchar(100) | |
| `email` | varchar(150) | |
| `telephone` | varchar(30) | E.164 |
| `whatsapp` | varchar(30) | E.164 |
| `est_principal` | bool | 1 seul par compte |
| `actif` | bool | |

### 3.3 `adresses`

Un compte peut avoir N adresses.

| Colonne | Type | Note |
|---|---|---|
| `id_adresse` | serial PK | |
| `id_client` | FK comptes | |
| `libelle` | varchar(100) | `Siège`, `Entrepôt Sfax`… |
| `types_adresse` | enum multi | `facturation` \| `livraison` \| `siege` |
| `rue` / `complement` / `code_postal` / `ville` / `region` / `pays` | | |
| `contact_livraison_nom` | varchar(150) | |
| `contact_livraison_telephone` | varchar(30) | |
| `est_defaut_facturation` / `est_defaut_livraison` | bool | 1 seul défaut par type |

### 3.4 `leads` — funnel d'entrée

| Colonne | Type | Note |
|---|---|---|
| `id_lead` | serial PK | |
| `canal` | enum | `email_recu` \| `formulaire_web` \| `pub_facebook` \| `pub_google` \| `salon` \| `whatsapp` \| `telegram` \| `telephone` \| `referral` |
| `source_detail` | varchar(200) | URL, campagne, salon… |
| `nom_prospect`, `email`, `telephone`, `societe` | | libres |
| `message` | text | |
| `id_utilisateur_assigne` | FK utilisateurs | |
| `statut` | enum | `nouveau` \| `en_traitement` \| `converti` \| `perdu` |
| `id_client_converti` | FK comptes | |
| `motif_perte` | varchar(200) | |
| `date_capture` / `date_conversion` | | |

### 3.5 `interactions` — journal CRM

| Colonne | Type | Note |
|---|---|---|
| `id_interaction` | serial PK | |
| `id_client` | FK comptes | nullable |
| `id_lead` | FK leads | nullable |
| `id_contact` | FK contacts | |
| `type` | enum | `appel_entrant` \| `appel_sortant` \| `email_recu` \| `email_envoye` \| `whatsapp` \| `telegram` \| `rdv` \| `note` |
| `sujet` / `contenu` | | |
| `direction` | enum | `entrant` \| `sortant` \| `interne` |
| `id_utilisateur` | FK | qui a fait l'action |
| `date_interaction` | timestamp | |

### 3.6 Machine d'états CRM

```
Lead brut (leads)
      │ qualification manuelle commercial
      ▼
Compte statut=lead
      │ premier devis envoyé
      ▼
Compte statut=prospect
      │ devis accepté OU commande créée
      ▼
Compte statut=client  ◀── création directe (ADMIN ou COMMERCIAL)
      │ inactivité 24 mois OU archivage manuel
      ▼
Compte statut=archive
```

---

## 4. Tarification (Phase 1)

**Lacune legacy** : le système actuel n'a **pas de grilles tarifaires**. Le prix est unique par article. Notre v2.0 ajoute ce concept.

### 4.1 `grilles_tarif`

Grille nommée et configurable par l'ADMIN.

| Colonne | Type | Note |
|---|---|---|
| `id_grille` | serial PK | |
| `code` | varchar(30) unique | `PART`, `GC`, `DIST`, `EXP_FR`… |
| `libelle` | varchar(100) | |
| `type` | enum | `remise_globale_pct` \| `prix_par_article` \| `palier_quantite` |
| `remise_pct` | numeric(5,2) | si `remise_globale_pct` |
| `devise` | char(3) | |
| `taux_tva_defaut` | numeric(5,2) | 19 TN, 0 UE B2B, 20 FR B2C… |
| `actif` | bool | |

### 4.2 `grille_tarif_lignes`

| Colonne | Type | Note |
|---|---|---|
| `id_ligne` | serial PK | |
| `id_grille` | FK | |
| `id_article` | FK articles | |
| `quantite_min` | int | palier |
| `prix_unitaire_ht` | numeric(14,3) | |
| `remise_pct` | numeric(5,2) | optionnel supplémentaire |

### 4.3 Attribution & calcul de prix

Ordre :
1. Ligne spécifique `grille_tarif_lignes` (article + grille + quantité ≥ palier) → prend ce prix.
2. Sinon : `article.prix_vente_ht × (1 − grille.remise_pct/100)`.
3. TVA = `grille.taux_tva_defaut` sauf override manuel sur ligne devis/commande.

**ADMIN** crée/modifie/supprime des grilles. **COMMERCIAL** applique une grille existante à ses comptes.

---

## 5. Produits (Phase 2)

### 5.1 `modeles`

Le produit parent — porte les attributs autorisés pour ses variantes.

**Pas de prix au niveau modèle** : les prix vivent sur les articles.

| Colonne | Type | Note |
|---|---|---|
| `id_modele` | serial PK | (renommé depuis `id_modeles`) |
| `code_modele` | varchar(30) unique | `AR` (ARTHUR), `IB` (IBIZA), `EPU` (EPONGE UNI), `PACKCHI` (PACK CHIC)… |
| `libelle` | varchar(200) | |
| `description` | text | |
| `image_url_principale` | varchar(500) | dérivée de `photos` (§5.3) |
| `id_categorie` | FK categories_produits | Fouta, Serviette, Écharpe, Poncho, Sac, Pack… |
| `type_produit` | enum | `produit_fini` \| `semi_fini` \| `matiere_premiere` \| `fourniture_fabrication` \| `fourniture_bureau` \| `emballage` \| `piece_rechange` |
| `format_ref_commerciale` | varchar(200) | template génération auto ref commerciale |
| `format_ref_fabrication` | varchar(200) | idem ref fabrication |
| `actif` | bool | |

### 5.2 `modele_attributs`

Table pivot : quels attributs sont autorisés pour ce modèle.

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_modele` | FK | |
| `type_attribut` | enum | `dimension` \| `couleur` \| `finition` \| `tissage` \| `nombre_couleurs` \| `personnalisation` \| `numero_metrique` \| `composition` \| `torsion` \| `grammage` |
| `id_valeur` | int | FK vers `parametres_<type>` |

**Tables paramètres** (structure minimale `id, code, libelle, actif, ordre_affichage`) :
- `parametres_dimensions`
- `parametres_couleurs` (avec `code_hex`)
- `parametres_finitions` (Frange, Frange Croisé, Frange Court, Ourlet, Couture)
- `parametres_tissages` (Jacquard, Bonas, Grosse…)
- `parametres_nombres_couleurs` (U/B/T/Q/C/S/Sept/Huit — 1 à 8)
- `parametres_personnalisations`
- `parametres_numeros_metriques` (NM05, NM15, NM20, NM25, NM30…) — pour MP fil
- `parametres_compositions` (100% coton, 100% polyester, 80/20 CO/PES, lin, lurex…)
- `parametres_torsions` (S, Z, faible, forte)
- `parametres_grammages` (g/m²)

ADMIN peut CRUD sur toutes ces tables via §5.7 endpoints.

### 5.3 `photos` — table polymorphique

Un modèle, un article, un catalogue peut avoir **1 à 5 photos**.

| Colonne | Type | Note |
|---|---|---|
| `id_photo` | serial PK | |
| `type_entite` | enum | `modele` \| `article` \| `catalogue` |
| `id_entite` | int | FK logique |
| `url` | varchar(500) | S3 ou disque local |
| `libelle` | varchar(150) | alt text |
| `ordre` | int | 0 = principale |
| `est_principale` | bool | 1 seule par entité — sert de miniature |
| `taille_octets` | int | |
| `mime_type` | varchar(50) | `image/jpeg`, `image/png`, `image/webp` |
| `date_upload` / `upload_par` | | |

Miniature `image_url_principale` dénormalisée sur `modeles`, `articles`, `catalogues` via trigger DB. Redimensionnement auto (thumbnail 200×200, medium 800×800, full).

### 5.4 `catalogues` + `article_catalogues`

Regroupement d'articles publiable, éventuellement synchronisable vers un site web (ALL BY FOUTA → Shopify).

`catalogues` :

| Colonne | Type | Note |
|---|---|---|
| `id_catalogue` | serial PK | |
| `code` | varchar(50) unique | `ALLBYFOUTA`, `PRO`, `EXPORT_FR`, `OUTLET`… |
| `libelle` | varchar(200) | |
| `image_url_principale` | varchar(500) | couverture, dérivée de `photos` |
| `description` | text | positionnement marketing |
| `url_site` | varchar(500) | site cible |
| `type_sync` | enum | `interne` \| `shopify` \| `woocommerce` \| `custom_api` |
| `credentials_json` | jsonb (chiffré) | clés API cible |
| `derniere_sync` | timestamp | |
| `actif` | bool | |

`article_catalogues` (pivot) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_article` | FK | |
| `id_catalogue` | FK | |
| `publie` | bool | |
| `date_publication` | timestamp | |

Le catalogue **`OUTLET`** est réservé aux articles `qualite = 'second_choix'` (§7.10) — vente à prix réduit.

### 5.5 `articles` — variantes concrètes

Combinaison unique d'attributs d'un modèle = article sellable.

**3 références** :

- **`code_article`** = clé technique système, unique, jamais montrée client.
- **`ref_fabrication`** = référence atelier (imprimée sur OF, cartes production, étiquettes lot). Contient tous les codes couleur détaillés.
- **`ref_commerciale`** = référence catalogue vente (visible devis/facture/site web). Format compressé (max 3 sélecteurs).

**Règle de génération** (issue des 1531 articles réels) :

`ref_commerciale` :
```
<CODE_MODELE><DIM4>-<LETTRE_NB_COULEURS><CODE_COULEUR_BASE>-<SUFFIXE_NUANCE>[-<CODES_ADD>]
```

- `DIM4` = largeur/10 (2 chiffres pad) + longueur/10 (2 chiffres pad). Ex `100/200 CM` → `1020`, `90/190` → `0919`, `50/70` → `0507`. Non numérique → code alpha (ADU, KID).
- `LETTRE_NB_COULEURS` : **`U`** (uni, 1 couleur) — **absent** dans la ref écrite / `B` (bi/2) / `T` (tri/3) / `Q` (quadri/4) / `C` (cinq/5) / `S` (six/6) / `SP` (sept/7) / `H` (huit/8).
- `CODE_COULEUR_BASE` : 2 chiffres id couleur principale.
- `SUFFIXE_NUANCE` : 2 chiffres — 01 = pleine, autres = variantes rayées.
- `CODES_ADD` : 2-3 codes couleur supplémentaires (2 chiffres) pour Q/C/S/SP/H.

Exemples réels :
- `AR1020-B02-03` (ARTHUR 100×200, bicolore, base 02, nuance 03)
- `EPU0919-19` (EPONGE UNI 90×190, uni, couleur 19 — pas de lettre car uni)
- `BA1020-C15-01-25` (BASQUE 100×200, 5 couleurs, 15+01+25)
- `ST2020-S15-07-17` (ST TROPEZ 200×200, 6 couleurs)
- `LIL1020-B11-LuAr` (matière spéciale Lurex Argenté)

`ref_fabrication` = idem avec **tiret après la lettre nombre couleurs** + codes couleurs de trame étendus :

| ref_commerciale | ref_fabrication |
|---|---|
| `AR1020-B02-03` | `AR1020-B-02-03` |
| `BA1020-C15-01-25` | `BA1020-C-15-01-25-10-23` |
| `ST2020-S15-07-17` | `ST2020-S-15-07-17-06-18-03` |

**EAN-13** obligatoire, auto-généré à la création selon `parametres_ean` (préfixe GS1 + compteur + check digit). Modifiable manuellement par ADMIN.

Schéma `articles` :

| Colonne | Type | Note |
|---|---|---|
| `id_article` | serial PK | |
| `id_modele` | FK modeles | requis |
| `code_article` | varchar(80) unique | technique auto |
| `ref_fabrication` | varchar(80) unique | atelier auto (surchargeable) |
| `ref_commerciale` | varchar(80) unique | catalogue auto (surchargeable ADMIN) |
| `designation` | varchar(300) | `<libelle_modele> <dimension> <couleur> <finition>` |
| `image_url_principale` | varchar(500) | dérivée `photos` |
| `id_dimension` | FK parametres_dimensions | |
| `id_couleur` | FK parametres_couleurs | |
| `id_finition` | FK parametres_finitions | |
| `id_tissage` | FK parametres_tissages | |
| `id_nombre_couleurs` | FK parametres_nombres_couleurs | |
| `id_personnalisation` | FK parametres_personnalisations | |
| `id_numero_metrique` | FK parametres_numeros_metriques | MP uniquement |
| `id_composition` | FK parametres_compositions | MP uniquement |
| `type_stock` | enum | miroir de `modeles.type_produit` (dénormalisé) |
| `ean_13` | varchar(13) unique | code-barres retail |
| `ean_8` | varchar(8) unique | option petits emballages |
| `qr_code` | varchar(50) | pour MP surtout — format `CC_XXX_XXX_Lot` compat legacy |
| `qualite` | enum | `premier_choix` \| `second_choix` — les 2e choix exposés uniquement catalogue OUTLET |
| `prix_reviens` | numeric(14,3) | coût production |
| `prix_vente_ht` | numeric(14,3) | prix base HT (surchargé par grille) |
| `prix_moyen_pondere_kg` | numeric(14,3) | PMP MP uniquement — MAJ à chaque réception |
| `unite_vente` | varchar(10) | `pc`, `paire`, `kg`, `m` |
| `poids_net_g` | numeric(10,2) | pour transport |
| `poids_brut_g` | numeric(10,2) | pour transport + calcul frais port |
| `longueur_cm` / `largeur_cm` / `hauteur_cm` | numeric(8,2) | dimensions emballées |
| `volume_cm3` | numeric(12,2) | calculé (L×l×H) |
| `fragile` | bool | majoration transport |
| `stock_total` | vue agrégée | calculé depuis `stock_article_entrepot` |
| `id_fournisseur_defaut` | FK fournisseurs | achat récurrent |
| `actif` | bool | |

**Contrainte unique** : `(id_modele, id_dimension, id_couleur, id_finition, id_tissage, id_nombre_couleurs, id_personnalisation, id_numero_metrique, id_composition)`. C'est cette contrainte qui permet la détection "cet article existe déjà" à la création d'une variante.

### 5.6 `article_seo`

Champs SEO par article × catalogue.

| Colonne | Type | Note |
|---|---|---|
| `id_article` | FK PK | |
| `id_catalogue` | FK PK | |
| `slug_url` | varchar(200) | `fouta-arthur-blanc-rouge-100x200` |
| `titre_seo` | varchar(160) | balise `<title>` |
| `meta_description` | varchar(320) | |
| `mots_cles` | text[] | |
| `description_longue` | text | HTML riche |
| `images_url` | text[] | photos multi pour fiche produit |
| `attributs_open_graph` | jsonb | OG image/title/desc |
| `score_seo` | int | note calculée |

### 5.7 Endpoints Produits

```
GET     /api/modeles                                — liste
GET     /api/modeles/:id                            — détail + attributs disponibles + variantes
POST    /api/modeles                                — créer
PUT     /api/modeles/:id                            — modifier
DELETE  /api/modeles/:id                            — soft delete

GET     /api/articles?id_modele=&id_catalogue=      — variantes
GET     /api/articles/:id                           — détail
POST    /api/articles                               — créer variante (409 si combinaison existe)
PUT     /api/articles/:id                           — modifier
DELETE  /api/articles/:id                           — soft delete

GET     /api/catalogues                             — liste
POST    /api/catalogues                             — créer
POST    /api/catalogues/:id/synchroniser            — push articles publiés vers site cible

GET     /api/articles/:id/seo?id_catalogue=         — récup SEO
PUT     /api/articles/:id/seo                       — MAJ SEO

GET     /api/parametres/attributs                   — bundle {dimensions, couleurs, finitions, ...}

Attributs CRUD (ADMIN) :
GET|POST|PUT|DELETE  /api/parametres/dimensions/:id?
GET|POST|PUT|DELETE  /api/parametres/couleurs/:id?
GET|POST|PUT|DELETE  /api/parametres/finitions/:id?
GET|POST|PUT|DELETE  /api/parametres/tissages/:id?
GET|POST|PUT|DELETE  /api/parametres/nombres-couleurs/:id?
GET|POST|PUT|DELETE  /api/parametres/personnalisations/:id?
GET|POST|PUT|DELETE  /api/parametres/numeros-metriques/:id?
GET|POST|PUT|DELETE  /api/parametres/compositions/:id?
GET|POST|PUT|DELETE  /api/parametres/torsions/:id?
GET|POST|PUT|DELETE  /api/parametres/grammages/:id?

GET|POST|PUT|DELETE  /api/photos     (multipart pour POST)
```

---

## 6. Stock & Entrepôts (Phase 2.5)

### 6.1 Catégories de stock (7)

| Catégorie | `type_stock` | Description |
|---|---|---|
| Produits finis | `produit_fini` | Foutas, jetés, ponchos… — sellables |
| Produits semi-finis | `semi_fini` | Tissu tissé non fini (avant frange/finition) |
| Matières premières | `matiere_premiere` | Fils coton/polyester, MP |
| Fournitures fabrication | `fourniture_fabrication` | Aiguilles, huile, ciseaux, navettes |
| Fournitures bureau | `fourniture_bureau` | Papier, cartouches |
| Emballage | `emballage` | Cartons, sachets, étiquettes |
| Pièces de rechange | `piece_rechange` | Courroies, cames, roulements, cartes électroniques Dornier |

### 6.2 `entrepots`

| Colonne | Type | Note |
|---|---|---|
| `id_entrepot` | serial PK | |
| `code` | varchar(20) unique | `USINE`, `E1`, `E2`, `E3`, `E4`, `SHOWROOM`, `ATELIER_PREP`, `MAG_TUNIS`, `HUB_MARSEILLE`, `ST_DIMATEX`, `ST_CHOKRI_HADDAD`… |
| `libelle` | varchar(150) | |
| `type` | enum | `usine` \| `entrepot_principal` \| `entrepot_secondaire` \| `atelier_preparation` \| `magasin_vente` \| `hub_transit` \| `sous_traitant` |
| `id_societe_adresse` | FK societe_adresses | adresse physique (§16) |
| `responsable_id_utilisateur` | FK | |
| `capacite_m3` | numeric | |
| `permet_vente` | bool | vente directe depuis ici possible |
| `actif` | bool | |

**Seed initial** (issu du legacy) : `USINE`, `E1`, `E2`, `E3`, `E4`, `SHOWROOM`, `ATELIER_PREP`, `ST_DIMATEX`, `ST_CHOKRI_HADDAD`.

### 6.3 `emplacements`

Optionnel — subdivision d'entrepôt (allée-rack-niveau).

| Colonne | Type | Note |
|---|---|---|
| `id_emplacement` | serial PK | |
| `id_entrepot` | FK | |
| `code` | varchar(30) | `A-01-02` |
| `libelle` | varchar(150) | |
| `capacite_max_articles` | int | |
| `actif` | bool | |

### 6.4 `stock_article_entrepot`

Snapshot dénormalisé (article × entrepôt × emplacement × lot).

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_article` | FK | |
| `id_entrepot` | FK | |
| `id_emplacement` | FK | nullable |
| `id_lot` | FK lots_articles | **obligatoire pour MP**, optionnel autres |
| `quantite_physique` | numeric(14,3) | physiquement présent |
| `quantite_reservee` | numeric(14,3) | commandes non expédiées (§8) |
| `quantite_en_colisage` | numeric(14,3) | déjà mis en colis mais BL pas expédié |
| `quantite_en_reception` | numeric(14,3) | attendue mais pas validée |
| `quantite_en_transfert_sortant` | numeric(14,3) | partant vers autre entrepôt |
| `quantite_disponible` | computed | `physique − reservee − en_colisage − en_transfert_sortant` |
| `quantite_libre` | computed | = `quantite_disponible` (alias legacy) |
| `date_derniere_maj` | timestamp | |

Contrainte unique : `(id_article, id_entrepot, id_emplacement, id_lot)`.

### 6.5 `mouvements_stock`

**3 grands types UI** exposés côté écran :

- **Réception** : marchandise / MP qui entre depuis extérieur (fournisseur) ou atelier (production finie)
- **Sortie** : marchandise qui quitte un entrepôt (expédition commande, consommation OF, rebut)
- **Transfert** : entre deux entrepôts internes — pas de sortie patrimoine

**10 sous-types techniques** :

| Type | Sens | Description |
|---|---|---|
| `reception_fournisseur` | + | matière première ou marchandise arrivée fournisseur |
| `entree_fabrication` | + | OF terminé → article entre en stock (avec `id_lot` généré) |
| `sortie_vente` | − | BL expédié |
| `sortie_of` | − | MP consommée par un OF |
| `transfert_entrepot` | ±0 | entre 2 entrepôts (source + dest) |
| `reservation` | 0 | réservation logique — pas de mouvement physique |
| `liberation_reservation` | 0 | annule une réservation |
| `ajustement_positif` | + | correction manuelle (excès inventaire) |
| `ajustement_negatif` | − | correction manuelle (perte, casse, vol) |
| `retour_client` | + | marchandise revenue client (peut aller zone rebut) |
| `mise_au_rebut` | − | article endommagé |

Schéma :

| Colonne | Type | Note |
|---|---|---|
| `id_mouvement` | serial PK | |
| `numero_mouvement` | varchar(30) unique | `MVT-YYYYMMDD-NNNNN` |
| `type_mouvement` | enum | voir tableau |
| `id_article` | FK | |
| `quantite` | numeric(14,3) | |
| `id_lot` | FK lots_articles | obligatoire MP |
| `qr_mp_reel` | varchar(50) | trace bobine (format `CC_XXX_XXX_Lot`) |
| `id_entrepot_source` | FK | nullable |
| `id_emplacement_source` | FK | nullable |
| `id_entrepot_destination` | FK | nullable |
| `id_emplacement_destination` | FK | nullable |
| `id_document_lie` | int | id du doc déclencheur |
| `type_document_lie` | enum | `bl` \| `commande` \| `of` \| `bon_reception` \| `transfert` \| `ajustement` \| `inventaire` \| `retour` |
| `motif` | varchar(200) | pour ajustements |
| `date_mouvement` | timestamp | |
| `effectue_par` | FK utilisateurs | |
| `valide_par` | FK utilisateurs | pour transferts |
| `statut` | enum | `en_attente` \| `valide` \| `annule` |

Table immuable (INSERT only sauf champ `statut`).

### 6.6 `lots_articles`

**Obligatoire pour MP** — traçabilité amont totale.

| Colonne | Type | Note |
|---|---|---|
| `id_lot` | serial PK | |
| `numero_lot` | varchar(30) unique | `LOT-YYYYMMDD-NNNN` (interne) OU numéro fournisseur |
| `id_article` | FK articles | |
| `id_of` | FK ordres_fabrication | si issu fabrication |
| `date_fabrication` | date | |
| `date_peremption` | date | pour catégories concernées |
| `quantite_initiale` | numeric(14,3) | fabriquée / reçue |
| `quantite_restante` | numeric(14,3) | encore en stock |
| `numero_lot_fournisseur` | varchar(50) | pour MP |
| `id_fournisseur` | FK fournisseurs | pour MP |
| `date_reception` | date | pour MP |
| `certificat_conformite_url` | varchar(500) | PDF fournisseur MP |
| `couleur_hex_mesure` | varchar(7) | spectrocolorimètre pour MP couleur |
| `poids_bobine_moyen_kg` | numeric | pour MP |
| `notes` | text | |

### 6.7 `reservations_stock`

Créées automatiquement à la validation d'une commande.

| Colonne | Type | Note |
|---|---|---|
| `id_reservation` | serial PK | |
| `id_commande` | FK commandes | |
| `id_ligne_commande` | FK commandes_lignes | |
| `id_article` | FK | |
| `id_entrepot` | FK | où réservé |
| `id_lot` | FK lots_articles | |
| `quantite` | numeric(14,3) | |
| `date_reservation` | timestamp | |
| `date_expiration` | timestamp | nullable — auto-libération |
| `statut` | enum | `active` \| `expediee` \| `annulee` \| `expiree` |

### 6.8 `inventaires`

Deux modes :

- **`ajustement_delta`** (défaut, recommandé) : génère mouvements `ajustement_+/−` par écart. Historique préservé.
- **`reset_absolu`** (option héritée legacy) : remplace le stock théorique par le compté. Perte de l'historique.

| Colonne | Type | Note |
|---|---|---|
| `id_inventaire` | serial PK | |
| `numero_inventaire` | varchar(30) unique | `INV-YYYYMMDD-NN` |
| `id_entrepot` | FK | |
| `mode` | enum | `ajustement_delta` \| `reset_absolu` |
| `date_debut` / `date_fin` | date | |
| `statut` | enum | `en_preparation` \| `en_cours` \| `valide` \| `annule` |
| `responsable_id_utilisateur` | FK | |
| `notes` | text | |

`inventaire_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne` | serial PK | |
| `id_inventaire` | FK | |
| `id_article` | FK | |
| `id_emplacement` | FK | |
| `id_lot` | FK | |
| `quantite_theorique` | numeric(14,3) | |
| `quantite_comptee` | numeric(14,3) | |
| `ecart` | computed | |
| `note` | text | motif écart |
| `compte_par` | FK utilisateurs | |
| `date_comptage` | timestamp | |

### 6.9 Alertes stock

`article_seuils_alerte` :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_article` | FK | |
| `id_entrepot` | FK | seuil par entrepôt |
| `stock_minimum` | numeric(14,3) | |
| `stock_alerte_orange` | numeric(14,3) | |
| `stock_alerte_rouge` | numeric(14,3) | rupture |

Job cron quotidien compare `stock_article_entrepot.quantite_disponible` vs seuils → `alertes_stock` + notification responsable entrepôt + admin.

### 6.10 Écran Stock — flux UI

```
1. Liste Entrepôts (7 seed + créés)
   └─► clic entrepôt
2. Vue Entrepôt : liste articles en stock (paginée, filtrable, recherche)
     Colonnes : ref_commerciale · designation · photo · dispo · réservé · en colisage · emplacement · lot
   └─► clic article
3. Vue Article dans Entrepôt : détail + historique
     - KPI : dispo / réservé / valeur stock
     - Timeline des mouvements (type, qté, source/dest, doc lié, utilisateur, date)
     - Onglet "Par lot" (obligatoire pour MP)
     - Onglet "Alertes" (seuils actifs)
```

### 6.11 Endpoints Stock

```
Entrepôts     GET|POST|PUT|DELETE  /api/entrepots  (ADMIN)
              GET /api/entrepots/:id/articles      — liste articles ici
              GET /api/entrepots/:id/statistiques  — KPIs

Emplacements  GET|POST|PUT|DELETE  /api/entrepots/:id/emplacements

Stock         GET /api/stock?id_article=&id_entrepot=
              GET /api/stock/article/:id           — consolidé
              GET /api/stock/article/:id/mouvements
              GET /api/stock/valorisation?id_entrepot=

Mouvements    GET|POST  /api/mouvements-stock
              POST /api/mouvements-stock/:id/valider     — transferts en attente
              POST /api/mouvements-stock/:id/annuler     — création mouvement compensatoire

Transferts    POST /api/transferts
              POST /api/transferts/:id/confirmer

Lots          GET|POST|PUT  /api/lots
              GET /api/lots/:id                    — détail + articles issus

Réservations  GET /api/reservations?id_commande=

Inventaires   GET|POST  /api/inventaires
              GET|POST|PUT  /api/inventaires/:id/lignes
              POST /api/inventaires/:id/valider    — génère ajustements

Alertes       GET /api/alertes-stock?niveau=
              POST /api/alertes-stock/:id/traiter
```

### 6.12 Impacts sur les autres phases

- **§5.5 articles** : `stock_total` = vue agrégée `SUM(stock_article_entrepot.quantite_disponible)` — pas dupliqué.
- **§8.2 commandes** : validation → création `reservations_stock` (bug legacy corrigé : le stock réservé est bien déduit du disponible).
- **§8.6 colisage** : scan article dans colis crée `mouvement_stock` `sortie_vente` + décrémente `quantite_reservee` et `quantite_en_colisage`.
- **§7 fabrication** : OF consomme MP (`sortie_of`) et produit PF (`entree_fabrication`) avec `id_lot`.

---

## 7. Fabrication (Phase 2.7)

### 7.1 Vocabulaire fouta

| Terme | Sens |
|---|---|
| **BOM Master** | Nomenclature du produit vendu (article final). Auto-code : `<code_produit><code_dim>(<code_finition>)-<code_nb_couleurs>` |
| **BOM Composant** | Nomenclature d'un composant fabriqué (souvent = article lui-même si `Type de Fabrication = Unique`) |
| **Gamme** | Séquence des étapes de fabrication |
| **Poste** | Type de travail (Bobinage, Tissage, Coupe, Frange…) |
| **Machine** | Équipement physique |
| **OF** (Ordre de Fabrication) | Instruction concrète de produire N unités |
| **Étape OF** | Instance d'une étape de gamme dans un OF |
| **Ratière** | Sous-mécanisme du métier qui pilote les fils de trame |
| **Sélecteur couleur** | Positions de fils trame simultanés (S01–S08, legacy 6 max effectif — **contrat 8 pour extension**) |
| **Ensouple** | Rouleau de chaîne préparée sur ourdissoir, monté sur métier |
| **Duite** | Un passage de fil de trame — cadence machine = duites/minute |
| **Métrage** | Longueur de tissu tissé (mètres) |

### 7.2 BOM Master / Composants

Concept legacy conservé.

`bom` (en-tête) :

| Colonne | Type | Note |
|---|---|---|
| `id_bom` | serial PK | |
| `id_article` | FK articles | article produit |
| `code_bom_master` | varchar(50) unique | auto : `<code_produit><code_dim>(<code_finition>)-<code_nb_couleurs>` |
| `version` | int | pour évolutions |
| `est_active` | bool | 1 seule active par article |
| `type_fabrication` | enum | `unique` (auto-création composant) \| `multi_composants` (Pack, Poncho…) |
| `perte_theorique_pct` | numeric(5,2) | |
| `notes` | text | |
| Champs audit | | |

`bom_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne_bom` | serial PK | |
| `id_bom` | FK | |
| `id_article_composant` | FK articles | MP, SF, fourniture ou emballage |
| `quantite` | numeric(14,4) | pour 1 unité produite |
| `unite` | varchar(10) | `g`, `kg`, `m`, `pc` (attention : **grammes** dans legacy, kg dans notre nouveau système) |
| `id_etape_gamme` | FK gamme_etapes | à quelle étape consommé |
| `role` | enum | `chaine` \| `trame` \| `fourniture` \| `emballage` \| `etiquette` |
| `numero_selecteur` | int | 1-8 pour rôle `trame` |
| `remplacements_possibles` | int[] | ids articles substituables |

**Exemple BOM ARTHUR 100/200 blanc/rouge (`AR1020-B02-03`)** :

| Composant | Rôle | Sélecteur | Quantité |
|---|---|---|---|
| Fil coton NM15 blanc (`NM15-01.00`) | chaîne | S01 | 0.28 kg |
| Fil coton NM15 rouge (`NM15-03.00`) | trame | S02 | 0.12 kg |
| Étiquette tissée logo | fourniture | – | 1 pc |
| Sachet kraft M | emballage | – | 1 pc |

### 7.3 `gammes` et `gamme_etapes`

Séquence type par catégorie de produit (Fouta, Jeté, Serviette, Poncho, Pack).

`gamme_etapes` — colonnes principales : `id_gamme`, `ordre`, `code` (`OURDISSAGE`, `TISSAGE`, `COUPE`, `FRANGE`…), `libelle`, `id_poste`, `duree_standard_sec`, `est_bloquante`, `necessite_ctrl_qualite`, `permet_sous_traitance`.

### 7.4 Postes & Machines

**Vocabulaire aligné legacy** :

| Terme legacy | Terme domain | Description |
|---|---|---|
| `Largeur de Foyer` | `laize_machine_cm` | largeur utile |
| `Vibration bielle/min` | `vitesse_max_duite_min` | cadence mécanique |
| `Type de Programme` | `type_ratiere` | Jacquard, Bonas, Grosse |

`postes_travail` (colonnes : `id_poste`, `code`, `libelle`, `categorie` (`preparation`/`production`/`finition`/`controle`/`logistique`), `id_entrepot`, `capacite_horaire_theorique`, `taux_horaire_mo`, `actif`).

**19 postes standard (seed)** :

| Code | Libellé | Catégorie |
|---|---|---|
| PREPARATION_MP | Préparation matière première | preparation |
| BOBINAGE | Bobinage | preparation |
| OURDISSAGE | Ourdissage / Chaînage | preparation |
| ENCOLLAGE | Encollage chaîne | preparation |
| NOUAGE_CHAINE | Nouage chaîne | preparation |
| TISSAGE | Tissage | production |
| COUPE | Coupe | production |
| POST_COUPE_FRANGE | Post-coupe frange | finition |
| POST_COUPE_OURLET | Post-coupe ourlet | finition |
| POST_COUPE_COUTURE | Couture assemblage | finition |
| ETIQUETAGE | Étiquetage | finition |
| IMPRESSION_LOGO | Sérigraphie | finition |
| BRODERIE | Broderie | finition |
| LAVAGE | Lavage | finition |
| REPASSAGE | Repassage | finition |
| CTRL_QUALITE | Contrôle qualité final | controle |
| PLIAGE | Pliage | logistique |
| EMBALLAGE_UNIT | Emballage unitaire | logistique |
| ATELIER_PREPARATION | Atelier préparation commandes | logistique |
| EXPEDITION | Zone expédition | logistique |

`machines` :

| Colonne | Type | Note |
|---|---|---|
| `id_machine` | serial PK | |
| `code_machine` | varchar(20) unique | `M2301`, `BOB-01`, `COUPE-A` |
| `libelle` | varchar(200) | |
| `id_poste` | FK | |
| `type_machine` | enum | `metier_tisser` \| `bobinoir` \| `ourdissoir` \| `coupe` \| `frange` \| `couture` \| `lavage` \| `repassage` \| `emballage` \| `impression` \| `autre` |
| `numero_serie` | varchar(50) | |
| `type_ratiere` | varchar(50) | `Staubli 2666`, `Bonas`, `Grosse` |
| `nb_couleurs_selecteur` | int | 1-8 |
| `laize_machine_cm` | numeric(6,2) | |
| `laize_actuelle_cm` | numeric(6,2) | |
| `nb_fils_par_cm` | numeric | densité chaîne |
| `nb_fils_chaine_total` | int | |
| `longueur_peigne_cm` | numeric(6,2) | |
| `type_programme` | varchar(50) | technologie |
| `vitesse_max_duite_min` | int | cadence max |
| `rapport_compteur` | numeric | facteur unité compteur (pièces vs mètres) |
| `unite_compteur` | enum | `pieces` \| `metres` |
| `etat` | enum | `en_service` \| `en_maintenance` \| `en_panne` \| `arret` |
| `id_parc_machines` | FK | Usine, Atelier |
| `date_derniere_maintenance` / `date_prochaine_maintenance` | date | |
| `actif` | bool | |

### 7.5 `ordres_fabrication` — schéma commun

**Deux types distincts** (préfixes différents) :

- **OF Commande** — `OF{6chiffres}`, `id_commande` + `id_ligne_commande` renseignés
- **OF Stock (catalogue)** — `CA{4chiffres}`, `id_commande` NULL, `id_catalogue` renseigné

| Colonne | Type | Note |
|---|---|---|
| `id_of` | serial PK | |
| `numero_of` | varchar(30) unique | `OF...` ou `CA...` |
| `type_of` | enum | `commande` \| `stock` \| `complement` \| `rework` \| `prototype` |
| `id_of_parent` | FK | renseigné pour `complement` (sous-OF `.1`) |
| `id_article` | FK | article produit |
| `id_bom` | FK bom | version snapshot |
| `id_gamme` | FK gammes | gamme snapshot |
| `id_commande` / `id_ligne_commande` | FK | commande source (OF Commande) |
| `id_catalogue` | FK catalogues | OF Stock |
| `quantite_prevue` | numeric(14,3) | |
| `quantite_produite` | numeric(14,3) | maj en direct |
| `quantite_rebut` | numeric(14,3) | |
| `qte_1er_choix` / `qte_2e_choix` / `qte_ourlet` / `qte_dechet` | numeric(14,3) | catégorisation qualité |
| `priorite` | enum | `urgente` \| `haute` \| `normale` \| `basse` |
| `statut` | enum | voir §7.14 |
| `etat_preparation_mp` | enum | `Non Préparé` \| `Préparé Partiel` \| `Préparé` \| `Manque Matiere` \| `Pas de Besoin` |
| `etat_tissage` | enum | `Attente` \| `Planifier` \| `Machine Alimentée` \| `Départ` \| `En cours` \| `Pause` \| `Terminé` \| `Terminé Qte Manquante` |
| `etat_coupe` | enum | `Non Démarré` \| `En cours` \| `Pause` \| `Terminé` \| `Terminé Qte Manquante` |
| `id_machine_prevue` | FK | |
| `temps_production_prevu_sec` | int | |
| `compteur_machine_affichage` | int | valeur légale à afficher sur métier |
| `largeur_tissu_cm` / `longueur_tissu_m` | numeric | |
| `metrage_fil_chaine_m` | numeric | pour ligne chaîne |
| `duite_par_cm` | numeric | densité tissage |
| `nb_duites_total_production` | int | |
| `qr_mp_final` | varchar(50) | code global traçabilité assemblé |
| `date_creation_of` / `date_planification` / `date_debut_reel` / `date_fin_prevue` / `date_fin_reel` | timestamp | |
| `cout_theorique_ht` | numeric(14,3) | |
| `cout_reel_ht` | numeric(14,3) | calculé à clôture |
| `id_lot_produit` | FK lots_articles | lot généré à la clôture |
| `chef_production_id_utilisateur` | FK | |
| `notes_speciales` | text | affichées magasinier prépa (§14.3) |
| `est_sous_traite` | bool | |
| `id_soustraitant` | FK soustraitants | |
| `motif_refus_complement` | text | si complément refusé par tisseur |
| `ordre_planif_machine` | int | renuméroté par machine |

### 7.6 `of_etapes`

| Colonne | Type | Note |
|---|---|---|
| `id_of_etape` | serial PK | |
| `id_of` | FK | |
| `id_etape_gamme` | FK | template |
| `ordre` | int | |
| `id_machine` | FK | |
| `duree_estimee_sec` / `duree_reelle_sec` | int | |
| `date_debut_prevue` / `date_debut_reel` / `date_fin_prevue` / `date_fin_reel` | timestamp | |
| `operateur_principal_id_utilisateur` | FK | |
| `statut` | enum | `a_faire` \| `en_cours` \| `en_pause` \| `termine` \| `bloque_qc` \| `annule` |
| `quantite_produite` / `quantite_rebut` | numeric | |
| `est_deuxieme_passe` | bool | frange/ourlet/lavage post-tissage |
| `est_sous_traitee` | bool | |
| `quantite_approuvee_interne` | numeric | validation qualité interne avant sortie ST |
| `commentaire` | text | |

### 7.7 `of_consommations` — BOM éclaté effectif

MP + fournitures + emballage.

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_of` | FK | |
| `id_of_etape` | FK | étape |
| `id_article_composant` | FK articles | composant consommé |
| `role` | enum | `chaine` \| `trame` \| `fourniture` \| `emballage` \| `etiquette` |
| `numero_selecteur` | int | 1-8 pour trame |
| `id_lot` | FK lots_articles | lot MP puisé |
| `qr_mp_reel` | varchar(50) | QR bobine effectivement scannée |
| `quantite_theorique` | numeric(14,4) | BOM × quantite_prevue |
| `quantite_reelle` | numeric(14,4) | consommée (Poids Consommé Sxx) |
| `ecart_absolu` | numeric(14,4) | `reelle - theorique` (Différence Sxx) |
| `ecart_pct` | numeric(6,2) | |
| `id_mouvement_stock` | FK | mouvement `sortie_of` |
| `date_consommation` | timestamp | |

### 7.8 `of_pointages` — suivi temps réel

| Colonne | Type | Note |
|---|---|---|
| `id_pointage` | serial PK | |
| `id_of_etape` | FK | |
| `id_utilisateur` | FK | opérateur |
| `id_machine` | FK | |
| `type_event` | enum | `debut` \| `pause` \| `reprise` \| `fin` \| `changement_operateur` \| `panne_machine` \| `attente_mp` \| `casse_fil` \| `nettoyage` \| `maintenance` \| `changement_fil` \| `ensouple` \| `fin_poste` |
| `horodatage` | timestamp | précis seconde |
| `quantite_intermediaire` | numeric | compteur machine si dispo |
| `duree_arret_sec` | int | pour événements de pause |
| `motif_arret` | varchar(200) | |
| `notes` | text | |

### 7.9 Contrôle qualité avec catégorisation

`controles_qualite` :

| Colonne | Type | Note |
|---|---|---|
| `id_ctrl` | serial PK | |
| `id_of` | FK | |
| `id_of_etape` | FK | nullable si global |
| `id_controleur_utilisateur` | FK | |
| `date_controle` | timestamp | |
| `type_controle` | enum | `visuel` \| `dimensionnel` \| `colorimetrique` \| `resistance` \| `poids` \| `retour_soustraitance` |
| `qte_1er_choix` | numeric(14,3) | conforme prix plein |
| `qte_2e_choix` | numeric(14,3) | défaut mineur — sellable moins cher (catalogue OUTLET) |
| `qte_ourlet` | numeric(14,3) | inclus dans 1er choix |
| `qte_rebut` | numeric(14,3) | non sellable |
| `type_defaut` | enum | `tache` \| `couture_irreguliere` \| `fil_casse` \| `dimension_incorrecte` \| `couleur_non_conforme` \| `frange_defectueuse` \| `autre` |
| `decision` | enum | `laisser_passer_1c` \| `passer_2c` \| `rework` \| `rebut` |
| `defauts_json` | jsonb | mesures libres |
| `photos_urls` | text[] | |
| `est_bloquant` | bool | si vrai → OF bascule `statut='bloque_qc'` |
| `commentaire` | text | |

### 7.10 Sous-traitance de fabrication

Voir §7.11 pour bons de sortie/retour ST — modélisation persistante avec numéros, signatures, litiges, quality control retour.

`of_sous_traitance` = pivot entre OF et bons ST (référence §8.7).

### 7.11 Bons sortie/retour Sous-Traitance

**Lacune legacy corrigée** : dans le legacy le bon de sortie était juste un HTML imprimé, non persistant. Notre v2.0 le persiste avec numéro, signatures, historique.

`bons_sortie_st` :

| Colonne | Type | Note |
|---|---|---|
| `id_bon_sortie` | serial PK | |
| `numero_bon` | varchar(30) unique | `BSST-{YYYY}-{NNNNN}` |
| `id_soustraitant` | FK soustraitants | |
| `date_sortie` | timestamp | |
| `id_utilisateur_expedition` | FK | magasinier ST |
| `signature_expediteur_url` | varchar(500) | canvas + photo (hérité legacy) |
| `signature_receveur_url` | varchar(500) | rempli au retour signé |
| `photos_urls` | text[] | preuves photos expédition |
| `date_retour_prevue` | date | **obligatoire** (manquait legacy) |
| `statut` | enum | `en_preparation` \| `expedie` \| `chez_st` \| `en_retour_partiel` \| `retour_complet` \| `litige` |
| `notes` | text | |

`bons_sortie_st_lignes`, `retours_st`, `retours_st_lignes`, `litiges_st` — voir schéma détaillé sur `docs/legacy-gas-soustraitance.md`.

Chaque retour peut déclencher un `controle_qualite` de type `retour_soustraitance`.

### 7.12 Planification atelier

Écran Gantt drag-drop (§14.15) machines × créneaux. Contraintes auto :

- Compatibilité laize machine ↔ laize article
- Nb couleurs OF ≤ nb sélecteurs machine
- MP disponible aux dates prévues (sinon warning MP manquante)
- Machine en panne → blocage drop

`planning_slots` (dénormalisé) : `id_slot`, `id_machine`, `id_of_etape`, `date_debut`, `date_fin`, `statut` (`prevu` / `en_cours` / `termine` / `deplace`).

### 7.13 Coûts fabrication

À la clôture d'un OF :

```
cout_reel_ht =
  Σ (of_consommations.quantite_reelle × mp.prix_moyen_pondere_kg)
+ Σ (of_pointages.duree × poste.taux_horaire_mo)
+ Σ (of_sous_traitance.cout_prestation_ht)
+ ventilation frais fixes atelier (amortissement machines, énergie, frais généraux)
```

`of_couts` snapshot : `cout_mp_reel_ht`, `cout_mo_reel_ht`, `cout_ss_traitance_reel_ht`, `cout_frais_fixes_ht`, `cout_total_reel_ht`, `cout_theorique_ht`, `ecart_ht`, `ecart_pct`, `cout_unitaire_reel_ht`.

Alimente rétroactivement `articles.prix_reviens` (moyenne mobile ou PMP configurable).

### 7.14 Cycle de vie complet OF

```
CREATION (par CHEF_PRODUCTION ou auto depuis §8.9 commande validée)
        │  BOM figée, gamme copiée, of_consommations initialisées
        ▼
brouillon → planifie (attribution machine + génération slots Prep MP)
        │
        ▼
en_attente_mp (si MP manque)
        │  Attribution auto FIFO + Préparation MP par Magasinier MP
        │  scan QR bobines par sélecteur S01–S08
        ▼
Etat Prep MP = Préparé, Etat Tissage = Attente
        │  Tisseur démarre le métier
        ▼
Etat Tissage = Départ → En cours (pointages: pause, panne, casse, changement fil, ensouple…)
        │  Alerte automatique si compteur passe sous 500m restants
        ▼
Etat Tissage = Terminé
        │  Rouleau arrive au poste Coupe
        ▼
Etat Coupe = En cours → Terminé (comptages: 1re, 2e, ourlet, déchet)
        │  Étiquettes lot imprimées (§7.20)
        ▼
OF terminé
        │  Génération lot produit + mouvement entree_fabrication
        │  Calcul cout_reel + MAJ prix_reviens
        ▼
CLÔTURÉ (immuable)
```

### 7.15 Compléments (sous-OF `.1`)

Si qté 1er choix < qté commandée, le CHEF_ATELIER demande un complément :
- Sous-OF créé avec `numero_of` = OF parent + `.1` (ex `OF249780.1`)
- `type_of='complement'`, `id_of_parent` renseigné
- Priorité forcée `urgente`, `ordre_planif_machine = 0` (tête de file)
- Refus possible par TISSEUR avec `motif_refus_complement`

### 7.16 Attribution & Préparation MP

**Attribution** (auto) :
- FIFO sur lots disponibles (le plus ancien d'abord)
- Ou proximité colorimétrique (continuité chromatique)
- Réattribuable manuellement par MAGASINIER_MP
- Crée `reservations_stock` sur lots choisis

**Préparation** (physique — Magasinier MP §14.4) :
1. Ouvre l'OF → liste bobines attribuées avec emplacement
2. Scan QR bobine → vérification code cohérent
3. Rassemble kit dans atelier prep MP
4. "Kit prêt" → OF passe `etat_preparation_mp = Préparé` → tissage débloqué
5. Génère `mouvement_stock` `transfert_entrepot` MP → poste tissage

### 7.17 Ourdissage

**Constantes** :
- Alerte machine à **< 500 m restants** (seuil `OURD_SEUIL_ALERTE`)
- Plafond ensouple **5000 m** (`OURD_METRAGE_MAX_ENSOUPLE`)

**Formule poids fil chaîne** :

```
poids_kg = (nb_fils_chaine × metres × 2) / (NM × 1000)
```

Où NM = numéro métrique (grosseur), extrait comme dernier entier du code (ex `NM2/50` → 50, défaut 50).

**Workflow** :
1. Chef Prod / Ourdisseur ouvre l'onglet Ourdissage
2. Sur machine en alerte → clic "Préparer Ensouple"
3. Sélection lot MP, saisie sous-traitant / NM / métrage cible (≤ 5000)
4. Poids consommé calculé auto côté client
5. Soumission → sortie MP (Stock → Ourdissage)
6. Retour physique ensouple → réception avec métrage effectif + machine + date nouage
7. Consommation progressive à mesure que les OF de la machine avancent
8. Alerte quand restant < 500 m

**Liaison ensouple ↔ OF** : implicite via `id_machine`. Les OF de cette machine consomment le métrage préparé.

### 7.18 Tissage

**Snapshot temps réel `OFs_Tissage`** (37 colonnes dénormalisées) — pattern architectural clé :
- Pré-calculé pour dashboards temps réel
- Contient : numOF, machine, ordre, produit, dimensions, client, qtés (à fab / fabriquée / restante), unité compteur, longueur, compteur, états Prep MP / Tissage / Coupe, Coupe Confirme, vitesse, duites/cm, laize, machines compatibles, notes

**Rafraîchi** par `rafraichirSnapshotOFsTissage` déclenché sur pointages et modifications OF.

**Formules opérationnelles** :

```
duites_restantes = nb_duites_total × (quantite_restante / quantite_prevue)
temps_restant_min = arrondi(duites_restantes / vitesse_machine_duite_min)
metres_restants = longueur_cible − compteur_actuel
```

Alerte automatique si `metres_restants` passe sous **500 m** tout en étant au-dessus avant → messagerie inter-postes `type=tissage_restant_500m`, destination `planification` (§12).

### 7.19 Coupe

**Journal de pièces** — pas de rouleaux, pas de longueurs, pas de rendement matière.

Ligne coupe = `{numOF, operateur, date, qte_prem, qte_deux, dechet, approuve, ourlet, type, terminal, etat, photoUrl}`.

**Calculs fiche OF** :

```
total_controle = qte_prem + qte_deux + dechet + ourlet
qte_acceptee = qte_prem + approuve
fabrique = qte_prem + approuve
reste = max(0, qte_a_fab − fabrique)
surplus = max(0, fabrique − qte_a_fab)
taux_2eme_choix = qte_deux / qte_prem
taux_dechet = dechet / qte_prem
```

**Signalements urgents** vers tissage :
- `qte_manquante` — coupe finit avec `Terminé Qte Manquante` → demande complément (§7.15)
- `fab_changee` — article coupé ≠ article planifié

**Fin de coupe** enchaîne :
1. `maj_surplus_deuxieme_of` (surplus + qte_deux stockés)
2. `etat_coupe = Terminé`
3. Optionnel `etat_tissage = Terminé` (demander clôture tissage)
4. Impression étiquettes lot (§7.20)

### 7.20 Étiquettes lot

**Composant réutilisable** (déjà existant legacy `EtiquettesSuiviOF.html`) :

- **Format A4 : 2 × 4 = 8 étiquettes/page**, marge 4 mm
- Génération QR via **QRious v4.0.2** (lib JS) + fallback `api.qrserver.com`
- **5 pièces / étiquette** par défaut, configurable via ScriptProperty `ETIQ_PIECES_PAR_LOT`

**Structure étiquette** :
- Bandeau : identifiant lot (numOF + suffixe), modèle vertical, QR central, quantité, ref commerciale
- Barre statut : séq · type (Standard/Urgent/Prioritaire/Surplus/2ᵉ choix couleurs dédiées) · cumul/total
- Corps : cases Contrôle Qualité, Num Client, Num Cmd, Modèle, Ref Com, Dim, ligne jaune Person
- Pied : libellé produit

**Suffixes numSuivi** :
- `-1, -2, ...` : standard
- `-SUR01, -SUR02` : surplus
- `-DEU01, -DEU02` : 2ᵉ choix

**Quand imprimées** :
- Fin de coupe (modal `coupeFinEtiquettesModal`) : surplus + 2ᵉ choix
- Fin de fabrication (modal `coupeSaisieFinModal`) : standard + surplus + 2ᵉ choix
- Depuis la planification (`planImprimerEtiquettesFab`) : pré-impression standard

### 7.21 Formules opérationnelles récap

| Concept | Formule |
|---|---|
| Poids fil chaîne (kg) | `(nb_fils × metres × 2) / (NM × 1000)` |
| Duites restantes | `nb_duites × (qte_restante / qte_prevue)` |
| Temps restant tissage (min) | `duites_restantes / vitesse_machine_duite_min` |
| Mètres tissés OF | `qte_coupe_totale × longueur_tissage` |
| Métrage restant machine | `Σ ensouples − Σ OFs consommés` |
| Alerte tissage | `metres_restants < 500` |
| Plafond ensouple | `metrage ≤ 5000` |
| Total coupe | `qte_prem + qte_deux + dechet + ourlet` |
| Qte acceptée | `qte_prem + approuvee` |
| Besoin sélecteur (kg) | `bom_ligne.quantite × of.quantite_prevue` (arrondi 3 déc.) |
| Écart consommation | `poids_reel − poids_theorique` |
| Progression OF (%) | `round(etapes_done / 3 × 100)` — 3 étapes clés (Prep MP, Tissage, Coupe) |
| Coût réel OF | `Σ MP réelles + Σ MO pointages + Σ ST + frais fixes ventilés` |

### 7.22 Endpoints Fabrication

```
BOM         GET|POST|PUT|DELETE  /api/bom
            GET  /api/articles/:id/bom           — BOM active

Gammes      GET|POST|PUT|DELETE  /api/gammes
            GET|POST|PUT|DELETE  /api/gammes/:id/etapes

Machines    GET|POST|PUT|DELETE  /api/machines
            GET  /api/machines/:id/planning      — créneaux
            GET  /api/machines/:id/etat          — état + dernier op

OF          GET|POST|PUT|DELETE  /api/of
            GET  /api/of/:id                     — détail complet
            POST /api/of/:id/lancer              — brouillon → planifie
            POST /api/of/:id/attribuer-machine   — assigne machine + génère slots MP
            POST /api/of/:id/alimenter-machine   — MAJ slots MP (Magasinier MP)
            POST /api/of/:id/retour-mp
            POST /api/of/:id/reordonner-planif
            POST /api/of/:id/terminer            — calcul cout + génère lot
            GET|POST  /api/of/:id/etapes
            GET|POST  /api/of/:id/consommations
            GET       /api/of/:id/pointages
            POST      /api/of-etapes/:id/pointer

Contrôle Q  GET|POST  /api/of/:id/controles
            POST      /api/controles-qualite/:id/action

Sous-trait  POST      /api/of/:id/sous-traiter
            GET|POST|PUT  /api/bons-sortie-st
            POST      /api/bons-sortie-st/:id/expedier
            POST      /api/bons-sortie-st/:id/retour
            GET       /api/litiges-st

Planning    GET       /api/planning              — période + filtres
            PUT       /api/of-etapes/:id/replanifier   — drag-drop
            GET       /api/of-tissage-snapshot   — temps réel

Ourdissage  GET       /api/ourdissage
            POST      /api/ourdissage/ordre       — créer ordre préparation
            POST      /api/ourdissage/:id/receptionner
            PUT       /api/ourdissage/:id/metrage

Étiquettes  POST      /api/etiquettes/generer     — génère PDF étiquettes lot

Coûts       GET       /api/of/:id/couts
            GET       /api/rapports/ecarts-cout
```

---

## 8. Ventes (Phase 3)

### 8.1 Documents et transitions

```
Devis ─(accepté)─▶ Commande ─(préparée)─▶ Liste colisage ─▶ Bon livraison ─(livré)─▶ Facture ─(payée)─▶ ✓
                        │                                                                   │
                        └─▶ Palette (regroupement)                                          ├─▶ Avoir
                                                                                            └─▶ Bon de retour
```

### 8.2 Statuts par document

- **Devis** : `brouillon` → `envoye` → `accepte` \| `refuse` \| `expire` \| `transforme`
- **Commande** : `en_attente` → `validee` → `en_preparation` → `pretes_a_expedier` → `expediee` → `livree_partiel` → `livree` \| `annulee`
- **BL** : `brouillon` → `en_preparation` → `pret` → `expedie` → `livre` \| `retour_partiel`
- **Colis** : `en_preparation` → `emballe` → `pese` → `expedie` → `livre` \| `perdu` \| `retour`
- **Palette** : `en_composition` → `fermee` → `expediee` → `arrivee_hub_marseille` → `redistribuee`
- **Facture** : `brouillon` → `emise` → `payee_partiel` → `payee` \| `annulee`
- **Avoir** : `brouillon` → `emis` → `applique` \| `annule`
- **Bon retour** : `brouillon` → `en_traitement` → `traite` \| `refuse`

### 8.3 Livraison croisée (client A commande, client B reçoit)

Sur `commandes` et `bons_livraison` :
- `id_client` = qui commande / qui est facturé
- `id_adresse_facturation` = adresse facturation
- `id_client_livraison` = qui reçoit (nullable, défaut = id_client)
- `id_adresse_livraison` = adresse chez id_client_livraison

BL affiche "Livré à : <nom_livraison> — <adresse>".
Facture ne concerne QUE `id_client`.

### 8.4 Lignes de document

Toutes les `<doc>_lignes` (devis, commandes, BL, factures, avoirs, retours) :

| Colonne | Type | Note |
|---|---|---|
| `id_article` | FK | |
| `designation_snapshot` | varchar(300) | copie immuable après validation |
| `quantite` | numeric(14,3) | |
| `prix_unitaire_ht` | numeric(14,3) | après grille tarifaire |
| `remise_pct` | numeric(5,2) | ligne |
| `taux_tva` | numeric(5,2) | |
| `montant_ht` / `montant_tva` / `montant_ttc` | numeric(14,3) | calculés |

### 8.5 Frais de port

En-tête de document :

| Colonne | Type | Note |
|---|---|---|
| `frais_port_ht` | numeric(14,3) | |
| `taux_tva_port` | numeric(5,2) | |
| `frais_port_ttc` | numeric(14,3) | |
| `id_transporteur` | FK transporteurs | |
| `mode_transport` | enum | `routier` \| `maritime` \| `aerien` \| `express` |
| `type_conditionnement` | enum | `colis` \| `palette` \| `groupage` |
| `montant_ht_total` | numeric(14,3) | Σ lignes HT (base commission) |
| `montant_ttc_total` | numeric(14,3) | |
| `timbre_fiscal_dt` | numeric | 1 DT (facture Tunisie) |

`tarifs_transport` (grille configurable ADMIN) :

| Colonne | Type | Note |
|---|---|---|
| `id_tarif_transport` | serial PK | |
| `id_transporteur` | FK | |
| `mode` | enum | |
| `zone` | enum | `tunisie_france` \| `france_domicile` \| `europe` \| `international` |
| `poids_min_kg` / `poids_max_kg` | numeric | palier poids |
| `prix_ht` | numeric(14,3) | |
| `actif` | bool | |

### 8.6 Liste de colisage

Chaque BL a une liste de colisage.

`colis` :

| Colonne | Type | Note |
|---|---|---|
| `id_colis` | serial PK | |
| `numero_colis` | varchar(30) unique | `C{3 der. chiff. client}-{3 der. chiff. commande}-{NNN}` (ex `C234-567-001`) |
| `id_bl` | FK bons_livraison | |
| `id_palette` | FK palettes | nullable |
| `id_client_final` | FK comptes | destinataire final |
| `poids_kg` | numeric(10,3) | pesée expédition |
| `dimensions_cm` | varchar(50) | LxlxH |
| `photo_url` | varchar(500) | **obligatoire** (photo colis) |
| `numero_suivi_transporteur` | varchar(80) | tracking GLS / Chronopost |
| `id_transporteur` | FK | |
| `statut` | enum | |
| `date_expedition` / `date_livraison` | timestamp | |

`colis_articles` (scan) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_colis` | FK | |
| `id_article` | FK | |
| `id_lot` | FK lots_articles | |
| `quantite` | numeric(14,3) | |
| `id_ligne_bl` | FK | rapprochement |
| `scanne_par` | FK utilisateurs | |
| `scanne_le` | timestamp | |

**Workflow magasinier prépa** :
1. Ouvre commande → mag prépa liste articles à préparer
2. Crée un colis (numéro auto)
3. Sélectionne un article, **scan** son code, saisit qté, prend **photo obligatoire**
4. Répète jusqu'à couverture des lignes
5. Ferme colis (poids/dimensions)
6. Regroupe colis d'un envoi en palette si besoin

### 8.7 Palettes & Transporteurs

`palettes` :

| Colonne | Type | Note |
|---|---|---|
| `id_palette` | serial PK | |
| `numero_palette` | varchar(30) unique | `PAL{YY}-{seq}` (SEQ annuel) |
| `id_transporteur_amont` | FK | Vectorys / Dachser / Germanetti (TN → Marseille) |
| `numero_suivi_amont` | varchar(80) | |
| `hub_arrivee` | varchar(100) | `Marseille` |
| `date_expedition` / `date_arrivee_hub` | date | |
| `statut` | enum | |
| `poids_kg` | numeric(10,3) | |

`transporteurs` :

| Colonne | Type | Note |
|---|---|---|
| `id_transporteur` | serial PK | |
| `code` | varchar(30) unique | `GLS`, `DHL`, `UPS`, `COLISSIMO`, `BESSON`, `MAZET`, `VECTORYS`, `DACHSER`, `GERMANETTI` |
| `libelle` | varchar(100) | |
| `mode` | enum | `routier` \| `maritime` \| `aerien` \| `express` |
| `type` | enum | `colis` \| `palette` \| `groupage` |
| `zone_geographique` | enum | `tunisie_france` \| `france_domicile` \| `europe` \| `international` |
| `api_url_suivi` | varchar(300) | |
| `api_auth_type` | enum | `none` \| `api_key` \| `oauth` |
| `api_credentials_json` | jsonb (chiffré) | |
| `format_num_suivi` | varchar(50) | regex |
| `actif` | bool | |

**Seed transporteurs** : VECTORYS / DACHSER / GERMANETTI (tunisie_france groupage) · GLS (principal) / DHL / UPS / COLISSIMO (france_domicile colis) · BESSON / MAZET (france_domicile palette).

**Suivi automatique** : job cron interroge périodiquement API transporteurs pour colis/palettes en cours → MAJ statut + date_livraison.

### 8.8 Transformation ligne commande → OF

À la validation d'une commande, système analyse chaque ligne :

1. `qte_stock` (réservable immédiatement) + `qte_of_existants` + `qte_a_fabriquer`
2. Écran "Aperçu OF" : plan par ligne, ajustable, regroupement multi-lignes, priorité, date fab
3. Validation → création `reservations_stock` + nouveaux OF en `brouillon`
4. Le chef prod planifie ensuite (§7.12)

Drill-down commercial : commande → ligne → OF → étape → poste → machine.

### 8.9 Facturation — règles strictes

- **Seul un ADMIN** peut :
  - Passer un devis à `accepte`
  - Émettre une facture (`brouillon` → `emise`)
  - Émettre un avoir
  - Marquer une commission versée
- **COMMERCIAL** voit ses factures + paiements + échéances en lecture seule pour suivi

**Facturation multi-BL** : plusieurs BL du **même client** peuvent être regroupés dans une facture unique (`facturer_bl_selection_en_une_facture`).

**Timbre fiscal** : 1 DT ajouté automatiquement sur factures Tunisie (§13.1).

### 8.10 Paiements & Échéances

`echeances` (échéances prévues d'une facture) :

| Colonne | Type | Note |
|---|---|---|
| `id_echeance` | serial PK | |
| `id_facture` | FK | |
| `numero_echeance` | int | 1, 2, 3… |
| `date_echeance` | date | |
| `montant_du` | numeric(14,3) | TTC prévu |
| `mode_paiement_prevu` | enum | `virement` \| `cheque` \| `especes` \| `traite` \| `carte` |
| `statut` | enum | `a_payer` \| `paye_partiel` \| `paye` \| `en_retard` \| `annule` |
| `montant_paye` | numeric(14,3) | Σ paiements associés |
| `date_derniere_relance` | timestamp | |
| `nb_relances` | int | |
| `note` | text | |

Génération auto à l'émission facture selon `conditions_paiement` client (config Paramètre Vente).

`paiements` :

| Colonne | Type | Note |
|---|---|---|
| `id_paiement` | serial PK | |
| `id_client` | FK | |
| `date_paiement` | date | |
| `montant` | numeric(14,3) | TTC reçu |
| `mode_paiement` | enum | |
| `reference_paiement` | varchar(100) | n° chèque, virement, traite |
| `id_bancaire` | FK societe_bancaires | compte crédité (§16) |
| `note` | text | |
| `piece_jointe_url` | varchar(500) | scan preuve |
| `enregistre_par` | FK | ADMIN |

`paiement_echeances` (imputation N-N).

`relances` : historique auto/manuel avec niveaux (`rappel` / `relance` / `mise_en_demeure`), canal, template, réponse client.

Job cron quotidien : échéances en retard → relance auto selon politique.

### 8.11 Endpoints Ventes

```
Devis         : /api/devis         GET|POST|PUT|DELETE
                POST /api/devis/:id/envoyer /:id/transformer /:id/pdf

Commandes     : /api/commandes     GET|POST|PUT|DELETE
                POST /api/commandes/:id/valider    — crée réservations + analyse OF
                POST /api/commandes/:id/generer-of — création OF depuis lignes
                POST /api/commandes/:id/generer-bl
                POST /api/commandes/:id/pdf

BL            : /api/bl            GET|POST|PUT|DELETE
                POST /api/bl/:id/expedier /:id/livrer /:id/generer-facture /:id/pdf

Colisage      : /api/colis         GET|POST|PUT|DELETE
                POST /api/colis/:id/ajouter-article (scan)
                POST /api/colis/:id/photo (upload)
                POST /api/colis/:id/refresh-tracking

Palettes      : /api/palettes      GET|POST|PUT|DELETE
                POST /api/palettes/:id/ajouter-colis
                POST /api/palettes/:id/fermer /:id/expedier

Transporteurs : /api/transporteurs GET|POST|PUT|DELETE (ADMIN)
                /api/tarifs-transport (grille poids × zone × mode)

Facture       : /api/factures      GET|POST|PUT|DELETE (POST/PUT/DELETE ADMIN)
                POST /api/factures/:id/emettre /:id/payer /:id/pdf
                POST /api/factures/regrouper-bl

Avoir         : /api/avoirs        ADMIN only pour POST/PUT/DELETE

Bon retour    : /api/retours       GET|POST|PUT|DELETE
                POST /api/retours/:id/traiter /:id/generer-avoir

Paiements     : POST /api/paiements
                GET  /api/paiements?id_client=&periode=
                POST /api/paiements/:id/imputer

Échéances     : GET  /api/echeances?statut=en_retard&id_client=
                GET  /api/factures/:id/echeances
                POST /api/echeances/:id/relancer

État compte   : GET  /api/clients/:id/etat-compte
```

---

## 9. Achats & Fournisseurs (Phase 3.2)

### 9.1 `fournisseurs`

| Colonne | Type | Note |
|---|---|---|
| `id_fournisseur` | serial PK | |
| `code_fournisseur` | varchar(20) unique | `FRN-{YYYY}-{NNNN}` |
| `raison_sociale` | varchar(200) | |
| `type_fournisseur` | enum | `matiere_premiere` \| `fourniture_fabrication` \| `fourniture_bureau` \| `emballage` \| `piece_rechange` \| `service` \| `sous_traitant` \| `mixte` |
| `pays` | char(2) | |
| `matricule_fiscal` / `numero_tva_intracom` / `siret` | | selon pays |
| `adresses` | via table `fournisseur_adresses` | |
| `contacts` | via table `fournisseur_contacts` | |
| `id_bancaire_defaut` | FK fournisseur_bancaires | |
| `conditions_paiement` | varchar(100) | ex `30j fin de mois` |
| `delai_moyen_livraison_jours` | int | |
| `notation` | int (1-5) | qualité + délai + prix combinés |
| `actif` | bool | |

### 9.2 `demandes_achat`

Émise par le magasinier stock, magasinier MP ou mécanicien lorsqu'un seuil alerte est atteint.

| Colonne | Type | Note |
|---|---|---|
| `id_demande_achat` | serial PK | |
| `numero_demande` | varchar(30) unique | `DA-{YYYYMM}{SEQ3}` |
| `demandee_par` | FK utilisateurs | |
| `date_demande` | date | |
| `motif` | text | rupture stock, réappro, urgent maintenance |
| `id_article` | FK | |
| `quantite_demandee` | numeric(14,3) | |
| `date_besoin` | date | |
| `id_fournisseur_suggere` | FK | souvent fournisseur défaut de l'article |
| `statut` | enum | `en_attente` \| `approuvee` \| `transformee_bc` \| `refusee` \| `annulee` |
| `id_bc` | FK bons_commande_fournisseur | si transformée |
| `approuvee_par` | FK utilisateurs | ADMIN |

### 9.3 `bons_commande_fournisseur` (BC)

| Colonne | Type | Note |
|---|---|---|
| `id_bc` | serial PK | |
| `numero_bc` | varchar(30) unique | `BC-{YYYYMM}{SEQ3}` |
| `id_fournisseur` | FK | |
| `id_adresse_livraison` | FK entrepots | où sera livré |
| `date_commande` | date | |
| `date_livraison_prevue` | date | |
| `mode_transport` | enum | |
| `id_transporteur_prevu` | FK | |
| `frais_port_ht` | numeric(14,3) | |
| `taux_tva_port` | numeric(5,2) | |
| `conditions_paiement` | varchar(100) | héritée fournisseur |
| `montant_ht` / `montant_tva` / `montant_ttc` | numeric | Σ lignes |
| `statut` | enum | `brouillon` \| `envoye` \| `confirme` \| `partiel` \| `livre` \| `annule` |
| `cree_par` | FK | |
| `notes` | text | |

`bc_lignes` : `id_ligne_bc`, `id_bc`, `id_article`, `designation_snapshot`, `quantite_commandee`, `quantite_recue` (cumulée), `prix_unitaire_ht`, `remise_pct`, `taux_tva`, `montant_ht`.

### 9.4 `receptions_fournisseur` (BL entrant)

Ce que le fournisseur livre effectivement.

| Colonne | Type | Note |
|---|---|---|
| `id_reception` | serial PK | |
| `numero_reception` | varchar(30) unique | `REC-{YYYYMM}{SEQ3}` |
| `id_bc` | FK | (peut être NULL si réception hors BC) |
| `id_fournisseur` | FK | |
| `id_entrepot_reception` | FK | où réceptionné |
| `date_reception` | date | |
| `numero_bl_fournisseur` | varchar(50) | référence fournisseur |
| `receptionne_par` | FK utilisateurs | magasinier |
| `signature_receptionnaire_url` | varchar(500) | signature canvas |
| `photos_urls` | text[] | preuves réception |
| `statut` | enum | `en_cours` \| `valide` \| `litige` |
| `notes` | text | |

`reception_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne_reception` | serial PK | |
| `id_reception` | FK | |
| `id_ligne_bc` | FK | rapprochement BC |
| `id_article` | FK | |
| `quantite_recue` | numeric(14,3) | effective |
| `quantite_conforme` | numeric(14,3) | après contrôle qualité entrant |
| `quantite_rebut` | numeric(14,3) | |
| `id_lot` | FK lots_articles | lot créé automatiquement pour MP |
| `numero_lot_fournisseur` | varchar(50) | pour MP |
| `date_peremption` | date | |
| `notes_qualite` | text | |

**Impact stock** : validation réception crée `mouvement_stock` `reception_fournisseur` avec `id_lot` généré (obligatoire MP).

### 9.5 `factures_fournisseur` (FF)

| Colonne | Type | Note |
|---|---|---|
| `id_facture_fournisseur` | serial PK | |
| `numero_ff_interne` | varchar(30) unique | `FF-{YYYYMM}{SEQ4}` |
| `numero_facture_fournisseur` | varchar(50) | numéro fournisseur |
| `id_fournisseur` | FK | |
| `date_facture` | date | date émission fournisseur |
| `date_reception_facture` | date | quand nous l'avons reçue |
| `date_echeance` | date | |
| `montant_ht` / `montant_tva` / `montant_ttc` | numeric | |
| `devise` | char(3) | pour import EUR |
| `taux_change` | numeric | vers TND si import |
| `montant_ht_tnd` | numeric(14,3) | conversion |
| `statut` | enum | `en_attente_paiement` \| `payee_partiel` \| `payee` \| `en_litige` \| `annulee` |
| `pdf_facture_url` | varchar(500) | scan ou PDF fournisseur |
| `id_ecriture` | FK ecritures_comptables | comptabilisation |
| `notes` | text | |

`ff_lignes` : mêmes colonnes que BC lignes + rapprochement avec `reception_lignes` correspondantes.

### 9.6 Rapprochement BC ↔ réception ↔ FF

Écran de rapprochement (comptable + magasinier) :

- **3 vues** : BC prévus / receptions effectuées / factures reçues
- **Rapprochement 3-way** : quantité BC = quantité reçue = quantité facturée
- **Écarts** : alerte automatique si > 2 % → passe en `litige`
- Facture ne peut passer à `payee` que si `receptions_valides` couvrent le montant

### 9.7 Paiements fournisseurs

Similaire aux paiements clients mais inversés.

`paiements_fournisseurs` :

| Colonne | Type | Note |
|---|---|---|
| `id_paiement_fournisseur` | serial PK | |
| `id_fournisseur` | FK | |
| `id_facture_fournisseur` | FK | nullable si acompte |
| `date_paiement` | date | |
| `montant` | numeric(14,3) | |
| `mode_paiement` | enum | |
| `reference_paiement` | varchar(100) | n° chèque, virement… |
| `id_bancaire_source` | FK societe_bancaires | notre compte débité |
| `piece_jointe_url` | varchar(500) | |
| `valide_par` | FK | ADMIN |
| `id_ecriture` | FK ecritures_comptables | comptabilisation |

### 9.8 Achats de services

Un fournisseur peut vendre non seulement des biens mais aussi des **services** : sous-traitance broderie/sérigraphie/laser, transport, entretien machines, honoraires (comptable, avocat, consultant), formations, hébergement web, licences logiciel, télécoms…

`fournisseurs.type_fournisseur` inclut la valeur **`service`** ou **`mixte`** (bien + service).

Les factures de services suivent le même flux que les achats de biens (§9.5) avec quelques particularités :

- **Pas de réception physique** — la case "Réception" est skippée pour les services purs.
- **Compte comptable** ciblé automatiquement : classe 61/62 (services extérieurs) au lieu de 601 (achats MP).
- **TVA récupérable** normale sur les services professionnels (à l'exception des restaurants, hôtels…).
- **Rapprochement** simplifié : BC de service → Facture directement, pas de BL.

Table `contrats_services` (optionnel — pour contrats récurrents type entretien, maintenance annuelle) :

| Colonne | Type | Note |
|---|---|---|
| `id_contrat_service` | serial PK | |
| `id_fournisseur` | FK | |
| `libelle` | varchar(200) | ex "Maintenance annuelle métiers Dornier" |
| `date_debut` / `date_fin` | date | période contractuelle |
| `montant_annuel_ht` | numeric(14,3) | |
| `periodicite_facturation` | enum | `mensuelle` \| `trimestrielle` \| `annuelle` \| `a_la_demande` |
| `id_compte_comptable_charge` | FK | |
| `numero_contrat` | varchar(100) | référence fournisseur |
| `pdf_contrat_url` | varchar(500) | |
| `renouvellement_auto` | bool | |
| `date_prochaine_facturation_prevue` | date | |
| `actif` | bool | |

### 9.9 Achats espèces non comptabilisés (fond de dépenses courantes)

Certains **petits achats** au comptant (café, papeterie de dépannage, transport local occasionnel, pourboires magasinier, petites pièces urgentes chez le quincaillier du coin) sont réglés en espèces **sans facture formelle** — ils n'entrent PAS dans le circuit comptable classique mais doivent être tracés pour justifier la sortie de caisse.

Deux traitements possibles :

**A) Non comptabilisés (hors circuit fiscal)** :

`depenses_courantes_espece` — journal informel séparé de la compta officielle :

| Colonne | Type | Note |
|---|---|---|
| `id_depense` | serial PK | |
| `date_depense` | date | |
| `id_caisse` | FK caisses | |
| `montant` | numeric(14,3) | |
| `categorie` | enum | `pourboire` \| `transport_local` \| `petite_fourniture` \| `restauration_atelier` \| `divers` |
| `description` | text | "3 baguettes + 2 café ouvriers" |
| `photo_ticket_url` | varchar(500) | photo du ticket ou reçu si dispo |
| `saisi_par` | FK utilisateurs | |
| `valide_par` | FK utilisateurs | ADMIN pour au-delà d'un seuil |

**Impact caisse** : ces dépenses créent bien un `mouvement_caisse` type `frais` (§10.4) qui décrémente le solde physique, MAIS ne génèrent PAS d'écriture comptable (`id_ecriture = NULL`).

**Reporting mensuel** : liste ces dépenses par catégorie, montant total. Sert pour transparence interne, pas pour le fisc.

**B) Comptabilisés a posteriori** :

Si le comptable décide de régulariser un mois de dépenses courantes en fin de mois (pour cohérence bilan), il peut :
1. Sélectionner un lot de `depenses_courantes_espece` du mois
2. Bouton "Comptabiliser en bloc" → génère UNE écriture globale (par exemple débit compte 6252 "Petites dépenses" / crédit 531 "Caisse") avec libellé récapitulatif
3. Les dépenses concernées se voient renseigner `id_ecriture` — passent de "non comptabilisé" à "comptabilisé en bloc"

Écran comptable filtre : `non_comptabilise` / `comptabilise_bloc` / `comptabilise_individuel`.

**Règle** : par défaut les achats > 100 DT au comptant doivent générer une facture ET une écriture. Le seuil est configurable en Paramètre Comptabilité.

### 9.10 Endpoints Achats

```
Fournisseurs    : /api/fournisseurs           GET|POST|PUT|DELETE
                  /api/fournisseurs/:id/etat-compte
                  /api/fournisseurs/:id/statistiques

Demandes achat  : /api/demandes-achat         GET|POST|PUT
                  POST /api/demandes-achat/:id/approuver
                  POST /api/demandes-achat/:id/transformer-bc

Bons commande   : /api/bc                     GET|POST|PUT|DELETE
                  POST /api/bc/:id/envoyer     — envoi email/WA
                  POST /api/bc/:id/confirmer
                  POST /api/bc/:id/pdf

Réceptions      : /api/receptions             GET|POST|PUT
                  POST /api/receptions/:id/valider     — génère mouvement stock
                  POST /api/receptions/:id/photo

Factures fourn  : /api/factures-fournisseur   GET|POST|PUT|DELETE (ADMIN)
                  POST /api/ff/:id/comptabiliser        — génère écritures
                  POST /api/ff/:id/payer

Paiements       : /api/paiements-fournisseurs GET|POST

Rapprochement   : /api/rapprochement/bc-rec-ff/:id_bc

Contrats service: /api/contrats-services      GET|POST|PUT|DELETE
                  GET  /api/contrats-services/echeances-proches?jours=7

Dépenses espèce : /api/depenses-espece        GET|POST|PUT|DELETE
                  POST /api/depenses-espece/comptabiliser-bloc   — sélection + génère 1 écriture
                  GET  /api/depenses-espece/rapport?periode=&categorie=
```

---

## 10. Comptabilité (Phase 4)

### 10.1 Plan de comptes (SYSCOA simplifié adapté Tunisie)

`comptes_comptables` :

| Colonne | Type | Note |
|---|---|---|
| `id_compte_comptable` | serial PK | |
| `numero_compte` | varchar(20) unique | numérotation SYSCOA |
| `libelle` | varchar(200) | |
| `type_compte` | enum | `actif` \| `passif` \| `charges` \| `produits` |
| `classe` | int | 1-8 SYSCOA |
| `sous_type` | enum | ex `capitaux_propres`, `dettes_fournisseurs`, `banque`, `caisse`, `ventes`, `achats`, `charges_externes` |
| `est_analytique` | bool | pour comptes de résultat |
| `est_tva` | bool | tag pour comptes TVA collectée/déductible |
| `actif` | bool | |

**Plan par défaut (seed)** — 8 classes SYSCOA :

- Classe 1 : Capitaux — 10 Capital, 12 Résultat, 13 Subventions, 16 Emprunts
- Classe 2 : Immobilisations — 21 Immo incorp, 22 Immo corp (dont 2131 Bâtiments, 2154 Matériel industriel), 26 Titres
- Classe 3 : Stocks — 31 MP, 32 Autres appro, 33 SF, 35 PF, 37 Marchandises
- Classe 4 : Tiers — 40 Fournisseurs, 41 Clients, 42 Personnel, 43 État, 44 État TVA (44551 collectée / 44561 déductible)
- Classe 5 : Financiers — 51 Banques (5111 CTA TND, 5112 CTA EUR…), 53 Caisse, 58 Virements internes
- Classe 6 : Charges — 60 Achats (601 MP, 607 marchandises), 61 Services extérieurs (611 sous-traitance, 613 locations = **loyer**, 6161 assurance), 62 Autres services (621 transport, 622 personnel intérimaire, 625 déplacements, 626 postes/télécom, **6281 électricité**, 6282 eau), 63 Impôts et taxes, 64 Charges de personnel (641 rémunérations, 645 charges sociales), 65 Autres charges, 67 Charges financières, 68 Amortissements et provisions
- Classe 7 : Produits — 70 Ventes (701 PF, 706 prestations), 74 Subventions, 76 Produits financiers, 78 Reprises amortissements

### 10.2 `ecritures_comptables` — journal

| Colonne | Type | Note |
|---|---|---|
| `id_ecriture` | serial PK | |
| `numero_ecriture` | varchar(30) unique | `EC-{YYYY}{SEQ6}` |
| `date_ecriture` | date | |
| `date_piece` | date | date document source |
| `libelle` | varchar(300) | |
| `id_journal` | FK journaux | code journal |
| `id_piece_source` | int | id doc source |
| `type_piece_source` | enum | `facture` \| `avoir` \| `paiement` \| `facture_fournisseur` \| `paiement_fournisseur` \| `salaire` \| `manuel` |
| `montant_total` | numeric(14,3) | |
| `statut` | enum | `brouillon` \| `validee` \| `cloturee` |
| `saisi_par` / `valide_par` | FK | |

`ecritures_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne` | serial PK | |
| `id_ecriture` | FK | |
| `id_compte_comptable` | FK | |
| `libelle` | varchar(200) | |
| `debit` | numeric(14,3) | |
| `credit` | numeric(14,3) | (soit débit soit crédit non nul par ligne) |
| `id_tiers` | int | id_client ou id_fournisseur si compte de tiers |
| `type_tiers` | enum | `client` \| `fournisseur` \| `personnel` |

**Contrainte** : Σ débits = Σ crédits par écriture.

`journaux` — codes standard : `VE` (ventes), `AC` (achats), `BQ1` (banque TND), `BQ2` (banque EUR), `CA` (caisse), `OD` (opérations diverses), `PA` (paie).

### 10.3 TVA

**TVA collectée** (comptes `44551`) — à la vente. Automatiquement générée par les factures clients selon `taux_tva`.

**TVA déductible** (comptes `44561`) — sur achats et charges. Automatiquement générée par factures fournisseurs.

**Déclaration mensuelle TVA** : écran comptable qui agrège par période :

- Σ TVA collectée (comptes 44551 pour la période)
- Σ TVA déductible (44561)
- TVA due = collectée − déductible
- Génère une déclaration PDF (formulaire tunisien standard)

`declarations_tva` :

| Colonne | Type | Note |
|---|---|---|
| `id_declaration` | serial PK | |
| `periode` | varchar(7) | `2026-09` |
| `date_declaration` | date | |
| `tva_collectee` | numeric(14,3) | |
| `tva_deductible` | numeric(14,3) | |
| `tva_due` | numeric(14,3) | |
| `date_paiement` | date | quand payée au Trésor |
| `statut` | enum | `en_preparation` \| `soumise` \| `payee` |
| `pdf_url` | varchar(500) | |

### 10.4 Fond de caisse

Suivi de la trésorerie liquide (billets/pièces).

`caisses` (une ou plusieurs caisses possibles — siège, showroom, magasin) :

| Colonne | Type | Note |
|---|---|---|
| `id_caisse` | serial PK | |
| `code` | varchar(20) unique | `CAISSE_SIEGE`, `CAISSE_SHOWROOM` |
| `libelle` | varchar(100) | |
| `id_compte_comptable` | FK | compte 531 ou 532 |
| `solde_theorique` | numeric(14,3) | maintenu par mouvements |
| `responsable_id_utilisateur` | FK | |
| `actif` | bool | |

`mouvements_caisse` :

| Colonne | Type | Note |
|---|---|---|
| `id_mouvement_caisse` | serial PK | |
| `id_caisse` | FK | |
| `date_mouvement` | timestamp | |
| `type_mouvement` | enum | `encaissement_client` \| `decaissement_fournisseur` \| `salaire_liquide` \| `frais` \| `versement_banque` \| `retrait_banque` \| `ajustement_+` \| `ajustement_-` |
| `montant` | numeric(14,3) | signé selon type |
| `motif` | text | |
| `id_paiement` / `id_paiement_fournisseur` | FK | si lié à un paiement |
| `piece_jointe_url` | varchar(500) | reçu, ticket |
| `id_ecriture` | FK | comptabilisation |
| `saisi_par` | FK | |

**Clôture caisse quotidienne** : comptage physique le soir → génère un ajustement si écart.

### 10.5 Rapprochement bancaire

`releves_bancaires` (import PDF ou CSV du relevé banque) :

| Colonne | Type | Note |
|---|---|---|
| `id_releve` | serial PK | |
| `id_bancaire` | FK societe_bancaires | |
| `periode` | varchar(7) | `2026-09` |
| `solde_debut` / `solde_fin` | numeric(14,3) | selon banque |
| `date_import` | date | |
| `fichier_import_url` | varchar(500) | |

`lignes_releve_bancaire` (une ligne = une écriture banque) :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne_releve` | serial PK | |
| `id_releve` | FK | |
| `date_operation` | date | |
| `libelle_bancaire` | varchar(300) | |
| `montant_debit` / `montant_credit` | numeric(14,3) | |
| `reference_operation` | varchar(100) | |
| `id_ecriture_rapprochee` | FK ecritures_comptables | nullable — lien après matching |
| `statut` | enum | `non_rapprochee` \| `rapprochee` \| `en_litige` |
| `notes` | text | |

**Écran rapprochement** : liste des lignes non rapprochées côté banque et côté compta → matching manuel ou auto (par montant + date + référence).

### 10.6 Charges d'exploitation (loyer, électricité, eau, internet…)

Les charges récurrentes (loyer, électricité, eau, internet, ménage, assurances…) sont gérées comme des **factures fournisseurs récurrentes**.

`abonnements_recurrents` — pour automatiser :

| Colonne | Type | Note |
|---|---|---|
| `id_abonnement` | serial PK | |
| `libelle` | varchar(200) | `Loyer usine Sfax`, `STEG électricité usine`, `Sonede eau siège`, `Ooredoo internet`, `Assurance civile pro`… |
| `id_fournisseur` | FK | STEG, Sonede, propriétaire, Ooredoo, assureur… |
| `id_compte_comptable_charge` | FK | 613 loyer / 6281 électricité / 6282 eau / 626 télécom / 616 assurance |
| `montant_ht_habituel` | numeric | pour anticipation |
| `taux_tva` | numeric | |
| `periodicite` | enum | `mensuelle` \| `bimestrielle` \| `trimestrielle` \| `annuelle` |
| `date_prochaine_echeance` | date | |
| `mode_paiement` | enum | `virement_permanent` \| `prelevement_auto` \| `cheque` \| `especes` |
| `actif` | bool | |

Job cron mensuel : alerte comptable des échéances abonnements dans les 7 jours.

Chaque paiement d'un abonnement crée une facture fournisseur classique (§9.5).

### 10.7 Immobilisations & amortissements

`immobilisations` — biens durables (machines Dornier, bâtiment, véhicules, matériel bureau).

| Colonne | Type | Note |
|---|---|---|
| `id_immobilisation` | serial PK | |
| `numero_immo` | varchar(30) unique | `IMMO-{YYYY}{SEQ3}` |
| `libelle` | varchar(200) | ex "Métier Dornier M2301" |
| `id_compte_comptable_immo` | FK | classe 2 (21xx / 22xx) |
| `id_compte_comptable_amort` | FK | 281x / 282x |
| `id_compte_comptable_dotation` | FK | 6811x |
| `date_acquisition` | date | |
| `valeur_acquisition_ht` | numeric(14,3) | |
| `taux_amortissement_pct` | numeric(5,2) | ex 10 % (10 ans) |
| `duree_amortissement_annees` | int | |
| `methode` | enum | `lineaire` \| `degressif` |
| `date_mise_en_service` | date | |
| `date_fin_amortissement` | date | calc |
| `valeur_residuelle` | numeric | |
| `id_machine` | FK machines | nullable — pour machines |
| `id_entrepot` | FK | localisation |
| `numero_serie` | varchar(100) | |
| `fournisseur_origine_id` | FK | |
| `id_facture_fournisseur` | FK | facture d'acquisition |
| `actif` | bool | |

Job annuel : génère automatiquement la dotation aux amortissements (écriture comptable `681x → 281x`) à la clôture d'exercice.

### 10.8 Compte de résultat & bilan

**Compte de résultat** (classes 6 et 7) :

- Chiffre d'affaires (70)
- − Achats consommés (60 corrigé de la variation de stock)
- − Services extérieurs (61 + 62 : sous-traitance, loyer, transport, électricité, télécom, assurance, entretien)
- − Impôts et taxes (63)
- − Charges de personnel (64)
- − Autres charges (65)
- **= Résultat d'exploitation**
- − Charges financières (67)
- + Produits financiers (76)
- − Dotations amortissements (68)
- **= Résultat net**

**Bilan** (classes 1 à 5) :

- **Actif** : Immobilisations nettes (classe 2 − amortissements) + Stocks (classe 3) + Créances clients (411) + Trésorerie (51, 53)
- **Passif** : Capitaux propres (10, 12) + Dettes financières (16) + Dettes fournisseurs (401) + Dettes fiscales (44) + Dettes sociales (42)

Écran comptable **édition** : sélection période → génère PDF résultat + bilan.

### 10.9 Clôture d'exercice

Exercice = 1er janvier → 31 décembre.

Procédure de clôture (ADMIN + COMPTABLE) :

1. Validation de toutes les écritures brouillon
2. Génération dotations aux amortissements (§10.7)
3. Génération écritures de variation de stock (compte 6031/6091 vs 31/32/33/35/37 par différence entre stocks début et fin d'exercice)
4. Calcul du résultat (produits − charges) → écriture `120 Résultat` au bilan
5. Génération PDF bilan + compte de résultat + annexes
6. Verrouillage : `statut='cloturee'` sur toutes les écritures de l'exercice — plus modifiables
7. Report à nouveau : reprise des soldes classe 1 et 2 sur l'exercice suivant

### 10.10 Endpoints Comptabilité

```
Plan comptes  : /api/comptes-comptables     GET|POST|PUT|DELETE (ADMIN)

Écritures     : /api/ecritures              GET|POST|PUT (ADMIN, COMPTABLE)
                POST /api/ecritures/:id/valider
                POST /api/ecritures/:id/annuler   — création écriture inverse

Journaux      : /api/journaux                GET|POST|PUT
                GET  /api/journaux/:code/ecritures?periode=

TVA           : GET  /api/tva/declaration?periode=
                POST /api/tva/declaration/:periode/generer
                POST /api/tva/declaration/:periode/payer

Caisses       : /api/caisses                 GET|POST|PUT|DELETE
                /api/caisses/:id/mouvements   GET|POST
                POST /api/caisses/:id/cloturer-jour

Rapprochement : POST /api/releves-bancaires  — import PDF/CSV
                GET  /api/releves-bancaires/:id/lignes-non-rapprochees
                POST /api/rapprochement/matcher

Abonnements   : /api/abonnements-recurrents  GET|POST|PUT|DELETE
                GET  /api/abonnements/echeances-proches?jours=7

Immobilisations : /api/immobilisations      GET|POST|PUT|DELETE
                  POST /api/immobilisations/generer-dotations-annuelles

Rapports      : GET /api/rapports/compte-resultat?exercice=
                GET /api/rapports/bilan?exercice=
                GET /api/rapports/grand-livre?compte=&periode=
                GET /api/rapports/balance?periode=
                GET /api/rapports/journal?journal=&periode=

Clôture       : POST /api/exercices/:annee/cloturer   (ADMIN)
                POST /api/exercices/:annee/rouvrir
```

---

## 11. Communications

### 11.1 Transactionnel — envoi document

Bouton "Envoyer" sur chaque document (devis, commande, BL, facture, avoir, BR, BC fournisseur) :

- Canal : `email` \| `whatsapp` \| `telegram`
- Expéditeur : **utilisateur connecté** (§11.2)
- Destinataire : contact principal (éditable)
- Template avec variables (`<client_nom>`, `<numero_doc>`, `<montant>`, `<echeance>`)
- PJ : PDF du document

Backend : `communicationService.envoyer({user_id, doc_type, doc_id, canal, ...})`.

Chaque envoi crée une `interaction` avec `id_utilisateur = <expéditeur>`.

### 11.2 Configuration email/WhatsApp par utilisateur

Chaque utilisateur peut brancher son SMTP + WhatsApp Business perso pour envoyer depuis son adresse/numéro.

`utilisateur_config_email` et `utilisateur_config_whatsapp` — voir schéma dans domain v1.2.

**Fallback** : si utilisateur non configuré → config société par défaut.

### 11.3 Marketing — campagnes de masse

`campagnes_marketing`, `segments_clients` — envoi email/WhatsApp/Telegram groupé avec templates approuvés, stats (envoyés/ouverts/clics), opt-in obligatoire.

### 11.4 Comptes marketing externes

`comptes_marketing_externes` : sites web, Facebook, Instagram, TikTok, LinkedIn, Google Ads, Meta Ads, GA4, Search Console, Mailchimp, SendGrid. Connecteurs OAuth + sync stats/leads.

### 11.5 Consentement légal

- Opt-in obligatoire (`consent_marketing_*` sur `comptes`).
- Lien désinscription obligatoire dans chaque email marketing.
- WhatsApp Business : templates approuvés Meta hors fenêtre 24h.

---

## 12. Messagerie inter-postes

Système existant dans le legacy (`Hub > Messages_Postes`) — à répliquer.

`messages_postes` :

| Colonne | Type | Note |
|---|---|---|
| `id_message` | serial PK | |
| `date_envoi` | timestamp | |
| `categorie` | enum | `demande` \| `alerte` \| `pret` \| `info` |
| `type` | varchar(50) | ex `tissage_restant_500m`, `demande_mp`, `coupe_qte_manquante`, `coupe_fab_changee`, `planning_urgent` |
| `source` | enum | `planification` \| `magasinier` \| `tissage` \| `coupe` \| `ourdissage` \| `export` \| `mag_st` \| `admin` \| `systeme` |
| `destination` | enum | `planification` \| `magasinier` \| `tissage` \| `coupe` \| `ourdissage` \| `export` \| `mag_st` \| `admin` \| `tous` |
| `id_of` | FK | |
| `ref_fab` | varchar(80) | |
| `message` | text | |
| `details_json` | jsonb | payload structuré |
| `lu` | bool | |
| `date_lecture` | timestamp | |

**Alertes automatiques (déclencheurs)** :

| Événement | Type | Source → Destination |
|---|---|---|
| Compteur tissage passe sous 500 m restants | `tissage_restant_500m` | `tissage` → `planification` |
| MP manque en cours tissage | `demande_mp` | `tissage` → `magasinier` |
| Coupe finit avec qté manquante | `coupe_qte_manquante` | `coupe` → `tissage` |
| Coupe détecte article différent du planifié | `coupe_fab_changee` | `coupe` → `tissage` |
| OF marqué urgent par ADMIN | `planning_urgent` | `admin` → `tous` |
| Machine tombe en panne | `machine_panne` | `mecanicien` → `planification` |
| Alerte stock bas | `stock_bas` | `systeme` → `magasinier` |
| Litige ST ouvert | `litige_st` | `mag_st` → `admin` |

Endpoints :

```
GET  /api/messages-postes?destination=<poste>&lu=false
POST /api/messages-postes
POST /api/messages-postes/:id/marquer-lu
POST /api/alertes/envoyer-urgente
```

---

## 13. Conformité fiscale par pays

### 13.1 Tunisie (`TN`) — pays par défaut

- Requis société : `matricule_fiscal`
- TVA : 19 % standard, 13 %, 7 %, 0 %
- Timbre fiscal : **1 DT** par facture
- Numérotation factures : continue annuelle `FA-{YYYYMM}{SEQ4}`

### 13.2 France (`FR`)

- Requis société : `siret` (14 ch.) + `numero_tva_intracom` (`FR` + 11 ch.)
- Particulier : rien
- TVA : 20 %, 10 %, 5.5 %, 2.1 %
- B2B UE avec TVA valide : HT sans TVA + mention "Autoliquidation — Art. 283-2 CGI"
- B2C FR : TVA française

### 13.3 Autres UE

- Requis société : `numero_tva_intracom`
- B2B intracom valide : HT sans TVA + "Reverse charge — Art. 138 EU VAT Directive"

### 13.4 Export hors UE

- Sans TVA. "Exportation exonérée"

### 13.5 Règle automatique

`computeTvaRule(compte, article)` — dérivée de `pays` + `type_compte` + `numero_tva_intracom`.

---

## 14. Dashboards

### 14.1 Admin

Vue globale : tous KPIs, tous documents, gestion utilisateurs, grilles tarifaires, commissions, paramètres société. L'admin voit tout — pas d'onglets séparés.

### 14.2 Commercial (`COMMERCIAL`)

Vue SES clients uniquement.

- KPI : clients actifs, devis en cours, CA mois, pipeline
- Liste devis en attente, commandes en préparation
- Pipeline funnel
- **Compte de commissions** :
  - Taux paramétrable par utilisateur + surchargeable par grille tarifaire
  - Base : HT hors frais de port
  - Prévue / Réelle / Versée / Restant à payer
- Actions : Nouveau client, contact, devis, interaction

### 14.3 Magasinier Préparation (`MAGASINIER_PREPARATION`)

- Commandes `validee`/`en_preparation`/`pretes_a_expedier` uniquement
- Colonnes : num client + commande + commande client + date envoi visée + priorité + notes + articles par état (en stock, en fabrication, manquant)
- Bouton "Demander transfert" → workflow §6.5
- Écran colisage direct (§8.6)
- Pas de prix visible

### 14.4 Magasinier MP (`MAGASINIER_MP`)

- File OF en attente préparation MP (triés date tissage)
- Pour chaque OF : liste 8 sélecteurs S01–S08 avec code MP + qté + entrepôt source + lot suggéré
- Bouton "Préparer kit" → réserve bobines
- Scan QR bobines, contrôle cohérence
- Bouton "Kit prêt" → transfert stock, débloque tissage
- Alertes MP : ruptures, écart lot, quantités insuffisantes → génère demande achat

### 14.5 Magasinier Stock (`MAGASINIER_STOCK`)

- KPI valeur stock, ruptures, alertes, mouvements du jour
- 3 onglets : Réceptions / Sorties / Transferts
- Écrans Réception fournisseur, Sortie, Transfert, Inventaire, Alertes
- Voit prix reviens, pas prix vente

### 14.6 Magasinier Sous-Traitants (`MAGASINIER_SOUSTRAITANTS`)

- KPI : nb OF en ST, sorties, retours, conformité
- File d'attente sortie, en cours chez ST, retours à traiter
- Performance ST : taux 2ème choix (seuils 5/7 %), délai, coût
- Litiges
- Bons sortie persistants avec signature obligatoire (§7.11)

### 14.7 Chef de Production (`CHEF_PRODUCTION`)

- KPI atelier : OF en cours, en retard, bloqués QC, TRS, charge machines, MP rupture
- Planning Gantt interactif (§14.15)
- Liste OF à planifier, en cours, bloqués QC
- Vue machines temps réel
- Actions : Créer OF, sous-traiter étape, débloquer OF

### 14.8 Chef d'Atelier (`CHEF_ATELIER`)

Opérationnel terrain (issu du legacy `chef_atelier_dashboard v11.tsx`).

- **Par Opération** : compteurs par poste finition (Frange, Pliage, Étiquetage, Couture, Repassage, Emballage, Ourlet)
- **Par Commande** : arbo commande → article → numSuivi → matrice opérations (qteSortie/qteRetour/qteEnCours)
- **Alertes** : demandes magasinier, dates envoi proches, OF en retard
- **Maintenance** : demandes mécanicien
- **Analyse 2ème choix** : taux par ST + répartition types défauts

Actions : Scanner numSuivi, Déclarer 2ème (qté + défaut + décision), Demander complément, Demande maintenance.

### 14.9 Tisseur (`TISSEUR`) — tablette

- Kit MP reçu (8 sélecteurs)
- Mes OF triés par priorité + date planifiée
- OF en cours : compteur duites machine, cadence temps réel vs prévue
- Boutons pointage : Démarrer / Pause (motif : casse fil / attente MP / autre) / Reprendre / Terminer
- Signaler défaut (photo + type)
- Historique jour : OF terminés, duites totales, cadence moyenne
- **Rendement** temps + production + 1er/2e choix + valeur perte

### 14.10 Coupeur (`COUPEUR`) — tablette

- File OF sortis tissage (etat_tissage = terminee)
- OF en cours : rouleau à couper, largeur/longueur, nombre foutas
- Scan QR rouleau → matière + lot auto
- Compteur pièces coupées, saisie rebuts
- Boutons pointage identiques Tisseur

### 14.11 Ourdisseur (`OURDISSEUR`) — tablette

- Vue machines : ensouples préparées vs consommées, alerte < 500 m
- Bouton "Préparer ensouple" → sélection lot MP + saisie sous-traitant + NM + métrage (≤5000)
- Poids calculé auto : `(nb_fils × metres × 2)/(NM × 1000)` kg
- Bouton "Réceptionner ensouple" (retour physique)
- Correction métrage effectif

### 14.12 Contrôleur Qualité (`CONTROLEUR_QUALITE`)

- KPI : contrôles jour, taux conformité, top 5 défauts fréquents, OF bloqués
- File étapes OF nécessitant contrôle
- Écran saisie : type, mesures, photos, catégorisation 1er/2e/ourlet/déchet, décision
- Historique filtres par article / machine / opérateur / défaut

### 14.13 Mécanicien (`MECANICIEN`)

Curatif + préventif.

- Cartes machines (état, dernière intervention, prochaine échéance)
- Bouton "Signaler panne" → notifie chef prod, bloque OF
- Bouton "Démarrer intervention"
- Plan maintenance préventive : `plan_maintenance` + `interventions_maintenance` (pièces consommées, coût, MTBF/MTTR)
- Stock pièces détachées (lien §6.1 catégorie `piece_rechange`)

### 14.14 Comptable (`COMPTABLE`)

- KPI : CA du mois, trésorerie, TVA due, factures fournisseur à payer, échéances client à recevoir
- Journal du jour
- Écran rapprochement bancaire
- Écran déclaration TVA en cours de préparation
- Alertes échéances abonnements récurrents
- Boutons : nouvelle écriture, valider écriture, imprimer bilan/compte de résultat

### 14.15 Écran Planification & Suivis (module central)

- Gantt drag-drop machines × créneaux
- Contraintes auto (laize, nb couleurs, MP dispo)
- Modal Attribution QR MP au drop
- Panneau latéral : file d'attente OF à planifier
- Panneau bas : OF en cours / en retard / incidents

---

## 15. Menu

```
Accueil
├─ CRM & Clients
│    ├─ Comptes
│    ├─ Leads
│    ├─ Contacts
│    └─ Interactions
├─ Produits
│    ├─ Modèles
│    ├─ Articles (variantes)
│    ├─ Catalogues
│    └─ SEO produits web
├─ Stock
│    ├─ Entrepôts
│    ├─ Vue par catégorie (PF / SF / MP / Fournitures Fab / Bureau / Emballage / Pièces rechange)
│    ├─ Mouvements (Réceptions / Sorties / Transferts)
│    ├─ Réservations
│    ├─ Lots & traçabilité
│    ├─ Inventaires
│    └─ Alertes stock
├─ Fabrication
│    ├─ BOM (nomenclatures)
│    ├─ Gammes
│    ├─ Postes de travail
│    ├─ Machines + Maintenance
│    ├─ Ordres de fabrication (OF)
│    ├─ OF Stock catalogue (CA)
│    ├─ Ourdissage
│    ├─ Préparation MP
│    ├─ Planning atelier (Gantt)
│    ├─ Suivi temps réel
│    ├─ Contrôle qualité
│    ├─ Sous-traitance (bons sortie/retour, litiges)
│    └─ Analyse des coûts
├─ Ventes
│    ├─ Devis
│    ├─ Commandes
│    ├─ Bons de livraison
│    ├─ Liste de colisage
│    ├─ Palettes
│    ├─ Suivi transporteurs
│    ├─ Factures                       ← ADMIN
│    ├─ Paiements & Échéances          ← ADMIN saisie / COMMERCIAL suivi
│    ├─ Relances                       ← ADMIN + COMMERCIAL
│    ├─ Avoirs                         ← ADMIN
│    └─ Bons de retour
├─ Achats & Fournisseurs
│    ├─ Fournisseurs
│    ├─ Demandes d'achat
│    ├─ Bons de commande
│    ├─ Réceptions fournisseur
│    ├─ Factures fournisseur           ← ADMIN
│    ├─ Contrats de services           (maintenance, honoraires, télécoms…)
│    ├─ Dépenses espèces courantes     (non comptabilisées ou comptabilisées en bloc)
│    ├─ Paiements fournisseurs         ← ADMIN
│    └─ Rapprochement BC ↔ BL ↔ FF
├─ Comptabilité                        ← ADMIN + COMPTABLE
│    ├─ Plan de comptes
│    ├─ Journal & écritures
│    ├─ Rapprochement bancaire
│    ├─ Fond de caisse
│    ├─ Abonnements récurrents
│    ├─ Immobilisations & amortissements
│    ├─ TVA (déclarations)
│    ├─ Rapports (Résultat, Bilan, Grand livre, Balance)
│    └─ Clôture d'exercice
├─ Marketing                            ← ADMIN
│    ├─ Campagnes
│    ├─ Segments
│    ├─ Comptes externes (sites, RS, ads)
│    └─ Stats & performance
├─ Messagerie inter-postes             (tous rôles, filtre par poste)
├─ Dashboards
│    ├─ Admin                         (ADMIN)
│    ├─ Commercial                    (COMMERCIAL)
│    ├─ Magasinier Préparation
│    ├─ Magasinier MP
│    ├─ Magasinier Stock
│    ├─ Magasinier Sous-Traitants
│    ├─ Chef Production
│    ├─ Chef Atelier
│    ├─ Tisseur / Coupeur / Ourdisseur   (tablette)
│    ├─ Contrôle Qualité
│    ├─ Mécanicien / Maintenance
│    ├─ Comptable
│    └─ Planification & Suivis        (outil partagé)
├─ Mon compte                          (tous)
│    ├─ Profil
│    ├─ Paramètre Email                (SMTP perso)
│    └─ Paramètre WhatsApp             (WA Business perso)
└─ Paramètres                          ← ADMIN
     ├─ Paramètre Société             (§16)
     ├─ Paramètre CRM
     ├─ Paramètre Produits            (dimensions, couleurs, finitions, tissages, NM, compositions)
     ├─ Paramètre Vente               (grilles tarifaires, conditions paiement, échéances, relances)
     ├─ Paramètre Achats & Fournisseurs
     ├─ Paramètre Comptabilité        (plan comptes, journaux, exercices, TVA)
     ├─ Paramètre Stock               (entrepôts, seuils alerte, PMP/FIFO)
     ├─ Paramètre Fabrication         (gammes types, postes, taux horaires MO, frais fixes)
     ├─ Paramètre Transporteurs
     ├─ Paramètre Commissions
     ├─ Paramètre Communication
     ├─ Paramètre Marketing
     ├─ Paramètre Pays & TVA
     └─ Paramètre Utilisateurs & rôles
```

Tout ce qui n'apparaît pas → **masqué**.

---

## 16. Paramètre Société

`parametres_societe` (singleton) — informations sur documents.

| Colonne | Type | Note |
|---|---|---|
| `id_societe` | serial PK | 1 par défaut |
| `raison_sociale` | varchar(200) | |
| `forme_juridique` | varchar(50) | SARL, SUARL, SA, EI |
| `capital_social` | numeric(14,3) | |
| `devise_capital` | char(3) | |
| `matricule_fiscal` | varchar(50) | |
| `code_tva` | varchar(30) | |
| `rc` | varchar(50) | Registre Commerce |
| `logo_url` | varchar(500) | |
| `site_web` | varchar(200) | |
| `email_contact` | varchar(150) | |
| `telephone_contact` / `whatsapp_contact` | varchar(30) | |
| `smtp_defaut_*` | | fallback si utilisateur non configuré |
| `whatsapp_defaut_*` | | fallback |
| `mentions_legales_pdf` | text | pied documents |
| `conditions_generales_vente` | text | annexe |

`societe_adresses` (multi) : type (`siege_social` / `usine` / `depot` / `bureau_commercial`), adresse complète, `est_principale`.

`societe_bancaires` (multi comptes) : libellé, banque, agence, RIB, IBAN, BIC, devise, `est_defaut`.

Endpoints :

```
GET  /api/parametres/societe        — singleton + adresses + bancaires
PUT  /api/parametres/societe
GET|POST|PUT|DELETE  /api/parametres/societe/adresses/:id
GET|POST|PUT|DELETE  /api/parametres/societe/bancaires/:id
POST /api/parametres/societe/logo   — upload multipart
```

---

## 17. Ordre d'exécution

1. **Validation contrat** (ce document).
2. **Cadre technique** :
   - Rename `id_modeles` → `id_modele` en DB + code
   - Uniformisation enveloppe API (§2.2)
   - Masquage menu hors périmètre
   - Suppression doublons backend (`stock`/`entrepots`, `mrp`/`production`/`of`, `sale`/`purchase`, `quality`/`qualite-avancee`, `articles-catalogue`/`articles-generes`)
   - Suppression doublons frontend (4 pages articles → 1, 5 pages stock → 1, 4 pages paramètres → 1)
3. **Phase 1 — CRM & Comptes** (§3) + Tarification (§4)
4. **Phase 2 — Produits** (§5) : modèles, articles avec 3 refs, photos multi, catalogues, SEO
5. **Phase 2.5 — Stock** (§6) : entrepôts, mouvements, lots (MP obligatoire), réservations, inventaires, alertes
6. **Phase 2.7 — Fabrication** (§7) : BOM, gammes, machines, OF Commande + OF Stock CA, ourdissage, tissage, coupe, contrôle qualité 1er/2e/ourlet/déchet, sous-traitance persistante, planning Gantt, coûts, tablettes ateliers
7. **Phase 3 — Ventes** (§8) : Devis → Commande → BL → Facture, colisage, palettes, transporteurs, paiements & échéances, relances
8. **Phase 3.2 — Achats & Fournisseurs** (§9)
9. **Phase 4 — Comptabilité** (§10) : plan comptes, journal, TVA, caisse, rapprochement, immobilisations
10. **Phase 4 bis — Marketing** (§11.3-11.4)
11. **Phase 5 — Réouverture progressive** des autres modules si besoin métier (RH étendu, POS, e-commerce…)

À chaque phase :
- Écran fonctionne bout-en-bout dans navigateur avant passage suivante
- Tests curl documentés dans `docs/tests.md`
- Changelog mis à jour

---

## Changelog

- `2026-09-23` — **v2.0.1** : ajouts sur Achats & Comptabilité :
  - §9.8 **Achats de services** — type_fournisseur `service`/`mixte`, pas de réception physique, compte 61/62, table `contrats_services` pour récurrents (maintenance, télécoms, honoraires).
  - §9.9 **Achats espèces non comptabilisés** — nouvelle table `depenses_courantes_espece` (journal informel : pourboires, café ouvriers, dépannage). Décrémente la caisse (mouvement type `frais`) mais pas d'écriture comptable par défaut. Option "Comptabiliser en bloc" en fin de mois génère UNE écriture globale. Seuil configurable (défaut 100 DT) au-dessus duquel une facture + écriture sont obligatoires.
  - Menu §15 : "Contrats de services" et "Dépenses espèces courantes" ajoutés au bloc Achats.
- `2026-09-23` — **v2.0** : refonte complète.
  - Restructuration en 17 sections claires, numérotation propre.
  - **Nouveauté majeure** : Phase 3.2 Achats & Fournisseurs (§9) et Phase 4 Comptabilité (§10) complètes — plan SYSCOA simplifié, journal, TVA, caisse, rapprochement bancaire, abonnements récurrents (loyer, électricité, eau, internet, assurance), immobilisations & amortissements, bilan, compte de résultat, clôture d'exercice.
  - **Rôle `COMPTABLE`** ajouté.
  - **Intégration exhaustive du legacy** (17 modules `.gs` analysés) :
    - Numérotation officielle alignée (DV, CMD, FA sur 4 chiffres, BL, AV, BR, OF sur 6 chiffres, CA sur 4 chiffres OF Stock, colis `C{XXX}-{YYY}-{NNN}`, palette `PAL{YY}-{seq}`, étiquettes `-SUR`/`-DEU`)
    - Constantes fixées : TVA 19 %, timbre 1 DT, alerte tissage 500 m, plafond ensouple 5000 m, 5 pièces/étiquette défaut
    - États OF précis (`OF_ETATS`) : Prep MP (`Non Préparé` / `Préparé Partiel` / `Préparé` / `Pas de Besoin` / `Manque Matiere`), Tissage (`Attente` / `Planifier` / `Machine Alimentée` / `Départ` / `En cours` / `Pause` / `Terminé` / `Terminé Qte Manquante`), Coupe (`Non Démarré` / `En cours` / `Pause` / `Terminé` / `Terminé Qte Manquante`)
    - Formules calcul MP chaîne : `(nb_fils × m × 2) / (NM × 1000)`
    - Snapshot temps réel `OFs_Tissage` (37 colonnes) — pattern architectural retenu
    - Journal coupe (`total = 1re + 2e + déchet + ourlet`, `qte_acceptee = 1re + approuvee`)
    - Étiquettes lot A4 2×4 = 8/page, QRious v4.0.2 + fallback
    - BOM Master + Composants avec auto-création si `Type de Fabrication = Unique`
    - Sélecteurs S01–S08 (legacy 6, contrat 8 pour extension)
    - Lettre `U` (uni) ajoutée aux nomenclatures nb couleurs (U/B/T/Q/C/S/Sept/Huit)
    - Vocab machines aligné : `Largeur de Foyer`, `Vibration bielle/min`, `Type de Programme`
    - Format QR MP `CC_XXX_XXX_Lot` conservé pour compat physique
    - Ourdissage : formule poids, seuil 500 m, plafond 5000 m, liaison implicite ensouple ↔ OF via machine
  - **Messagerie inter-postes** (§12) complète — remplace `Hub > Messages_Postes` avec 8 postes source/destination, 4 catégories, alertes automatiques
  - **OF Stock CA** (§7.5) distinct des OF Commande — préfixe `CA{4chiffres}`
  - **Complément de fabrication** (sous-OF `.1`) modélisé avec `id_of_parent`, refus tisseur possible
  - **Catégorisation qualité** 1er choix / 2e choix / Ourlet / Déchet dans `controles_qualite` avec `type_defaut` (tache, couture, fil cassé, dimension, couleur, frange, autre)
  - **Sous-traitance persistante** (§7.11) — bons sortie/retour avec signature obligatoire, numéros, litiges (lacune legacy comblée)
  - **Stock réservé maintenant déduit du disponible** (bug legacy corrigé) — `quantite_reservee` + `quantite_en_colisage` séparés
  - **Bugs legacy corrigés** listés en §2.6
  - Suppression du concept "grilles tarifaires optionnelles" — les grilles sont désormais une entité de base (§4), la vente sans grille utilise une grille défaut `PART` (Particulier).

Historique v1.0–1.10 conservé sur git (branches et commits antérieurs). Voir aussi : `docs/coverage-matrix.md`, `docs/legacy-*.md` pour les analyses détaillées ayant nourri cette v2.0.
