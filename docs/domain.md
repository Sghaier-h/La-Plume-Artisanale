# La Plume Artisanale — Contrat de domaine

Version : 1.10 · Statut : brouillon en validation

Ce document est la **source de vérité** pour le vocabulaire, les entités, les endpoints et les règles métier du projet.

Toute modification (ajout de champ, changement de règle, renommage d'endpoint) doit être ajoutée à la section [Changelog](#changelog) en bas — sinon elle n'existe pas.

Périmètre validé pour la remise à plat :

- **Phase 1** — CRM + Clients
- **Phase 2** — Produits (Modèle → Articles) + Catalogues web
- **Phase 2.5** — **Stock & Entrepôts** : entrepôts, stock par article/entrepôt, mouvements, réservations, inventaires
- **Phase 2.7** — **Fabrication** : BOM, gamme, OF, suivi temps réel, contrôle qualité, sous-traitance, coûts, dashboards ateliers
- **Phase 3** — Ventes : Devis · Commande · Bon de livraison · **Liste de colisage · Transporteur & suivi** · Facture · Avoir · Bon de retour
- **Phase 3.5** — Dashboard Magasinier Préparation + Dashboard Commercial (avec commissions)

Tout ce qui n'est pas dans ce périmètre est **masqué du menu** jusqu'à nouvel ordre.

---

## 1. Règles transverses

### 1.1 Nommage

- Une seule orthographe par identifiant : `id_client`, `id_modele`, `id_article`, `id_devis`, `id_commande`, `id_bl`, `id_facture`, `id_avoir`, `id_retour`, `id_colis`, `id_palette`, `id_catalogue`, `id_transporteur`. **Jamais** de pluriel (`id_modeles` interdit).
- Colonnes datetime : `date_creation`, `date_modification`.
- Colonnes utilisateur : `cree_par` (id_utilisateur), `modifie_par`.
- Statuts : minuscule avec underscore (`en_attente`, `en_cours`, `livree`, `payee`). **Jamais** `TRANSFORME` en majuscule ou `Solder` avec majuscule française.

### 1.2 Enveloppe API — unique

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
- Interdit : `data.data`, `data.items`, `data.matieres`, etc. — un seul niveau.

### 1.3 Devise et arithmétique

- Devise par défaut : **TND** (Tunisie). Commande peut porter une devise explicite.
- Colonnes monétaires : PostgreSQL `NUMERIC(14,3)`. Frontend : **toujours** `Number(x || 0).toFixed(3)` (jamais `x.toFixed` sec).
- TVA par défaut Tunisie : 19 %. UE : selon règle intra-communautaire (voir §7).

### 1.4 RBAC

Rôles Phase 1 :

- `ADMIN` — voit tout, peut tout. Seul rôle habilité à **créer/valider une facture, un avoir, une commission versée**.
- `COMMERCIAL` — voit uniquement **ses** comptes (`id_commercial = <lui>`) et leurs documents. Peut créer/modifier **client, contact, devis, commande, BL**. Ne peut pas créer de facture ni d'avoir. Voit son propre compte de commission.
- `MAGASINIER_PREPARATION` — voit toutes les commandes à préparer, gère colisage + palettes. Dashboard dédié. Ne voit pas les prix.
- `MAGASINIER_STOCK` — gère les entrepôts (réceptions, sorties, transferts, inventaires) pour PF, SF, MP et fournitures. Dashboard dédié. Ne voit pas les prix de vente ni les commissions.
- `CHEF_PRODUCTION` — pilote l'atelier : crée/planifie les OF, dispatche sur les machines, valide les étapes clés, gère la sous-traitance. Dashboard dédié (§6.5). Ne voit pas les prix de vente.
- `TISSEUR` — opérateur sur métier à tisser. Voit ses OF assignés, pointe début/fin d'étape, saisit défauts. Dashboard atelier tablette dédié (§6.6). Ne voit ni prix ni clients.
- `COUPEUR` / `POST_COUPE` — opérateur coupe & finition (frange, ourlet). Même logique que TISSEUR sur son poste. Dashboard tablette (§6.6).
- `CONTROLEUR_QUALITE` — enregistre les contrôles qualité par étape et par OF. Dashboard dédié (§6.7). Peut bloquer un OF.
- `MAGASINIER_MP` — prépare les kits matières premières (fils chaîne + fils par sélecteur trame S01→S08) pour chaque OF, avant que le tissage puisse démarrer. Scan QR bobine, transfert vers poste tissage. Dashboard dédié (§6.10).
- `CHEF_ATELIER` — pilotage terrain d'un atelier physique (usine, ateliers spécialisés). Voit l'état de toutes les machines de son atelier, l'avancement des OF en cours, réaffecte opérateurs. Distinct de `CHEF_PRODUCTION` qui pilote la stratégie globale. Dashboard dédié (§6.11).
- `MAGASINIER_SOUSTRAITANTS` — pilote la sortie/retour marchandise vers les sous-traitants (broderie, sérigraphie, laser, franging externe). Voit les OF sous-traités, prépare les bons de sortie, réceptionne, contrôle qualité au retour. Dashboard dédié (§6.12).
- `MECANICIEN` — maintenance machines. Voit toutes les machines, leur état, planifie interventions. Dashboard dédié (§6.8).

Filtrage backend obligatoire — jamais côté frontend seul.

### 1.5 Communications

Voir §8. Distinction stricte transactionnel vs marketing.

---

## 2. Entités CRM & Clients

### 2.1 `comptes` (le "client" au sens large)

Un compte représente une société ou un particulier avec qui on peut faire du business.

| Colonne | Type | Note |
|---|---|---|
| `id_client` | serial PK | |
| `code_client` | varchar(32) unique | auto-généré `CLI-YYYY-NNNN` (les 3 derniers chiffres alimentent le num de colis) |
| `type_compte` | enum | `societe` ou `particulier` |
| `statut_crm` | enum | `lead` / `prospect` / `client` / `archive` |
| `raison_sociale` | varchar(200) | requis si `societe` |
| `nom` / `prenom` | varchar(100) | requis si `particulier` |
| `pays` | char(2) ISO | ex `TN`, `FR`, `DE` |
| `matricule_fiscal` | varchar(50) | Tunisie |
| `numero_tva_intracom` | varchar(20) | UE |
| `siret` | varchar(14) | FR |
| `id_grille_tarif` | FK grilles_tarif | tarification appliquée par défaut |
| `id_commercial` | FK utilisateurs | commercial référent |
| `source_lead` | varchar(50) | `email`, `pub_facebook`, `salon`, `referral`, `manual`, `import`... |
| `canal_prefere` | enum | `email` / `whatsapp` / `telegram` / `telephone` |
| `consent_marketing_email` + `date_consent_email` | bool + timestamp | voir §8 |
| `consent_marketing_whatsapp` + `date_consent_whatsapp` | bool + timestamp | |
| `consent_marketing_telegram` + `date_consent_telegram` | bool + timestamp | |
| `notes` | text | |
| `actif` | bool | |
| `date_creation` / `cree_par` / `date_modification` / `modifie_par` | | |

**Règle** : un compte a **un seul** `id_commercial` référent. Le commercial peut créer un client ou un contact — le client est alors automatiquement rattaché à lui. L'ADMIN peut réassigner à tout moment.

### 2.2 `contacts`

Une personne physique attachée à UN compte.

| Colonne | Type | Note |
|---|---|---|
| `id_contact` | serial PK | |
| `id_client` | FK comptes | requis, `ON DELETE CASCADE` |
| `role` | enum | `responsable` / `acheteur` / `commercial_client` / `technique` / `comptabilite` / `autre` |
| `civilite` | enum | `M` / `Mme` / null |
| `nom` / `prenom` | varchar(100) | |
| `fonction` | varchar(100) | |
| `email` | varchar(150) | |
| `telephone` | varchar(30) | E.164 (`+21620...`) |
| `whatsapp` | varchar(30) | |
| `est_principal` | bool | un seul principal par compte |
| `actif` | bool | |

### 2.3 `adresses`

Un compte peut avoir N adresses.

| Colonne | Type | Note |
|---|---|---|
| `id_adresse` | serial PK | |
| `id_client` | FK comptes | |
| `libelle` | varchar(100) | `Siège`, `Entrepôt Sfax`, `Boutique Tunis`... |
| `type_adresse` | enum multi | `facturation` / `livraison` / `siege` |
| `rue` / `complement` / `code_postal` / `ville` / `region` / `pays` | | |
| `contact_livraison_nom` | varchar(150) | nom à afficher sur le BL, si différent du compte |
| `contact_livraison_telephone` | varchar(30) | |
| `est_defaut_facturation` / `est_defaut_livraison` | bool | 1 seul défaut par type par compte |

### 2.4 `leads` (funnel d'entrée)

| Colonne | Type | Note |
|---|---|---|
| `id_lead` | serial PK | |
| `canal` | enum | `email_recu` / `formulaire_web` / `pub_facebook` / `pub_google` / `salon` / `whatsapp` / `telegram` / `telephone` / `referral` |
| `source_detail` | varchar(200) | url landing, nom campagne, numéro salon... |
| `nom_prospect` / `email` / `telephone` / `societe` | | libres, non normalisés |
| `message` | text | contenu du contact initial |
| `id_utilisateur_assigne` | FK utilisateurs | à qui traiter |
| `statut` | enum | `nouveau` / `en_traitement` / `converti` / `perdu` |
| `id_client_converti` | FK comptes | rempli si converti |
| `motif_perte` | varchar(200) | si perdu |
| `date_capture` / `date_conversion` | | |

### 2.5 `interactions`

Traces CRM chronologiques.

| Colonne | Type | Note |
|---|---|---|
| `id_interaction` | serial PK | |
| `id_client` | FK | nullable si attaché à un id_lead |
| `id_lead` | FK | nullable |
| `id_contact` | FK | qui a été contacté |
| `type` | enum | `appel_entrant` / `appel_sortant` / `email_recu` / `email_envoye` / `whatsapp` / `telegram` / `rdv` / `note` |
| `sujet` / `contenu` | | |
| `direction` | enum | `entrant` / `sortant` / `interne` |
| `id_utilisateur` | FK | qui a fait l'action |
| `date_interaction` | | |

### 2.6 Machine d'états CRM

```
Lead brut (table leads)
      │  qualification manuelle du commercial
      ▼
Compte statut=lead
      │  premier devis envoyé
      ▼
Compte statut=prospect
      │  devis accepté OU commande créée
      ▼
Compte statut=client  ◀────  création directe (ADMIN ou COMMERCIAL)
      │  aucune activité 24 mois OU archivage manuel
      ▼
Compte statut=archive
```

---

## 3. Tarification

### 3.1 `grilles_tarif`

Grille tarifaire nommée (ex : "Particulier", "Grand compte", "Distributeur", "Export FR"). **Configurable et extensible** : l'ADMIN peut ajouter autant de grilles que nécessaire, chacune attribuable à un client via `comptes.id_grille_tarif`.

| Colonne | Type | Note |
|---|---|---|
| `id_grille` | serial PK | |
| `code` | varchar(30) unique | `PART`, `GC`, `DIST`, `EXP_FR`, ... |
| `libelle` | varchar(100) | |
| `type` | enum | `remise_globale_pct` / `prix_par_article` / `palier_quantite` |
| `remise_pct` | numeric(5,2) | si `type='remise_globale_pct'` |
| `devise` | char(3) | |
| `taux_tva_defaut` | numeric(5,2) | 19 pour Tunisie, 0 pour export UE B2B, 20 pour France B2C... |
| `actif` | bool | |

### 3.2 `grille_tarif_lignes`

| Colonne | Type | Note |
|---|---|---|
| `id_ligne` | serial PK | |
| `id_grille` | FK | |
| `id_article` | FK | l'article porte la variante et son prix — voir §4 |
| `quantite_min` | int | pour paliers, défaut 1 |
| `prix_unitaire_ht` | numeric(14,3) | |
| `remise_pct` | numeric(5,2) | supplémentaire, optionnel |

### 3.3 Attribution

Chaque `compte.id_grille_tarif` pointe vers une grille. À la création d'un devis :

1. Ligne spécifique dans `grille_tarif_lignes` pour cet article + cette grille + quantité ≥ palier → prend le prix.
2. Sinon : `article.prix_vente_ht × (1 - grille.remise_pct/100)`.
3. La TVA appliquée = `grille.taux_tva_defaut` sauf override manuel.

**ADMIN** peut créer/modifier/supprimer une grille. **COMMERCIAL** peut appliquer une grille existante à ses comptes, pas en créer.

---

## 4. Produits (Phase 2)

### 4.1 `modeles`

Le produit **parent**. Ex : "ARTHUR", "IBIZA". Porte les attributs disponibles pour ses variantes. **Pas de prix** au niveau modèle : un modèle a plusieurs dimensions/finitions, les prix vivent sur `articles` (§4.4).

| Colonne | Type | Note |
|---|---|---|
| `id_modele` | serial PK | renommer depuis `id_modeles` |
| `code_modele` | varchar(30) unique | `AR`, `IB` — préfixe des articles |
| `libelle` | varchar(200) | |
| `description` | text | |
| `image_url_principale` | varchar(500) | photo principale (miniature liste) — dérivée de `modele_photos` |
| `id_categorie` | FK categories_produits | ex Fouta, Serviette, Écharpe |
| `actif` | bool | |

### 4.2 `modele_attributs`

Table pivot : quels attributs sont autorisés pour ce modèle.

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_modele` | FK | |
| `type_attribut` | enum | `dimension` / `couleur` / `finition` / `tissage` / `nombre_couleurs` / `personnalisation` |
| `id_valeur` | int | FK vers `parametres_<type>` |

### 4.2bis Photos (modèles, articles, catalogues)

Chaque modèle, chaque article et chaque catalogue peut porter **plusieurs photos** (typiquement 2 à 5), avec un ordre d'affichage et un flag `est_principale` pour la miniature.

Une seule table pivot polymorphique `photos` :

| Colonne | Type | Note |
|---|---|---|
| `id_photo` | serial PK | |
| `type_entite` | enum | `modele` / `article` / `catalogue` |
| `id_entite` | int | FK logique (id_modele / id_article / id_catalogue) |
| `url` | varchar(500) | chemin fichier (S3 ou disque local) |
| `libelle` | varchar(150) | alt text |
| `ordre` | int | ordre d'affichage (0 = principale par convention) |
| `est_principale` | bool | 1 seule par entité — sert de miniature |
| `taille_octets` | int | pour quotas |
| `mime_type` | varchar(50) | `image/jpeg`, `image/png`, `image/webp` |
| `date_upload` | timestamp | |
| `upload_par` | FK utilisateurs | |

**Règles** :
- Miniature `image_url_principale` sur `modeles.image_url_principale`, `articles.image_url_principale` et `catalogues.image_url_principale` est **calculée** à partir de `photos WHERE est_principale = true` — dénormalisée pour perf. Trigger DB ou hook applicatif la maintient à jour.
- Upload via multipart : redimensionnement auto (thumbnail 200×200, medium 800×800, full original).
- Formats acceptés : JPEG, PNG, WebP. Max 5 MB par photo.
- Nombre max recommandé : **5 photos** par entité (3 par défaut à l'UI).

Endpoints :

```
GET  /api/photos?type_entite=article&id_entite=42
POST /api/photos                                — upload (multipart)
PUT  /api/photos/:id                            — MAJ (libelle, ordre, est_principale)
DELETE /api/photos/:id
```

### 4.3 `catalogues` et `article_catalogues`

Un **catalogue** est un regroupement d'articles publiable (interne, ou synchronisable vers un site web — ex : le catalogue *ALL BY FOUTA* se synchronise vers `allbyfouta.com`).

`catalogues` :

| Colonne | Type | Note |
|---|---|---|
| `id_catalogue` | serial PK | |
| `code` | varchar(50) unique | `ALLBYFOUTA`, `PRO`, `EXPORT_FR` |
| `libelle` | varchar(200) | |
| `image_url_principale` | varchar(500) | photo principale (couverture catalogue) — dérivée de `photos` §4.2bis |
| `description` | text | pitch marketing / positionnement |
| `url_site` | varchar(500) | URL du site cible si synchronisable |
| `type_sync` | enum | `interne` / `shopify` / `woocommerce` / `custom_api` |
| `credentials_json` | jsonb | clés API du site (chiffré) |
| `derniere_sync` | timestamp | |
| `actif` | bool | |

`article_catalogues` (pivot, un article peut appartenir à N catalogues) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_article` | FK | |
| `id_catalogue` | FK | |
| `publie` | bool | visible sur le canal du catalogue |
| `date_publication` | timestamp | |

### 4.4 `articles` (variantes concrètes)

Une combinaison unique d'attributs d'un modèle = un article sellable. Table actuelle `articles_catalogue` → **renommer** en `articles`.

#### Règles de génération des références (issues de l'existant, `docs/references/references_articles.csv` — 1531 articles)

Trois références coexistent — définies pour **coller aux codes déjà utilisés en production** :

**A. `code_article`** — clé interne système
- = `ref_commerciale` (même valeur). Sert de clé de scan et jointures.

**B. `ref_commerciale`** — visible sur devis, facture, site web, rayonnage.

Format : `<CODE_MODELE><CODE_DIMENSION>-<LETTRE_NB_COULEURS><CODE_COULEUR_BASE>-<SUFFIXE_NUANCE>[-<CODES_ADDITIONNELS>]`

| Segment | Règle | Exemples |
|---|---|---|
| `CODE_MODELE` | 2-7 lettres majuscules — colonne `modeles.code_modele` | `AR` (ARTHUR), `ANA` (ARTISANAT), `EPU` (EPONGE UNI), `PACKCHI` (PACK CHIC) |
| `CODE_DIMENSION` | Largeur + longueur chacun sur **2 chiffres**, padding 0. Si dimension non numérique → code alpha court (ADU, KID). Séparateur `/` supprimé. | `100/200 CM` → `1020` · `240/260 CM` → `2426` · `90/190 CM` → `0919` · `50/70 CM` → `0507` · `ADULT` → `ADU` |
| `LETTRE_NB_COULEURS` | Lettre = nombre de couleurs. **Absente** si uni. | `B` (bicolore) · `T` (tricolore) · `Q` (quadricolore) · `C` (5 couleurs / cinq) · `S` (6 couleurs / six) |
| `CODE_COULEUR_BASE` | 2 chiffres — id de la couleur principale (`parametres_couleurs.code_commercial` → 01–99) | `02`, `15`, `26` |
| `SUFFIXE_NUANCE` | 2 chiffres — nuance ou rayure. `01` = couleur pleine, autres = variantes rayées | `01`, `03`, `17` |
| `CODES_ADDITIONNELS` | 2-3 codes couleur supplémentaires (2 chiffres chacun), un par couleur secondaire | présents pour `Q`, `C`, `S` |

Exemples réels :
- `AR1020-B02-03` = ARTHUR 100×200 CM, bicolore, base 02, nuance 03
- `EPU0919-19` = EPONGE UNI 90×190 CM, uni, couleur 19 (pas de lettre nb couleurs, pas de suffixe séparé — motif "modele+dim+couleur")
- `BA1020-C15-01-25` = BASQUE 100×200 CM, 5 couleurs, base 15 + 01 + 25
- `INS1824-Q19-02-03` = INSPIRATION 180×240 CM, quadricolore, 19+02+03
- `ST2020-S15-07-17` = ST TROPEZ 200×200 CM, 6 couleurs, 15+07+17
- `LIL1020-B11-LuAr` = LILI LUREX bicolore, matière spéciale (Lurex Argenté) → suffixe alpha spécial autorisé pour matières particulières

**C. `ref_fabrication`** — visible sur OF, cartes atelier, ordres de tissage.

Format identique à ref_commerciale **avec un tiret séparateur inséré après la lettre de nombre de couleurs** ET **codes couleurs additionnels étendus** pour donner toutes les nuances nécessaires à l'atelier de tissage.

| ref_commerciale | ref_fabrication |
|---|---|
| `AR1020-B02-03` | `AR1020-B-02-03` |
| `BA1020-C15-01-25` | `BA1020-C-15-01-25-10-23` |
| `ST2020-S15-07-17` | `ST2020-S-15-07-17-06-18-03` |
| `EPU0919-19` | `EPU0919-19` (pas de lettre nb couleurs → identique) |

**Règle de calcul** :

- Insertion d'un tiret entre `LETTRE_NB_COULEURS` et `CODE_COULEUR_BASE`.
- Ajout des codes couleurs de trame/rayure supplémentaires stockés dans `article_couleurs_tissage` (voir table pivot §4.4bis) — une entrée par nuance/rayure additionnelle.

#### Génération automatique + surcharge manuelle

- À la création d'un article, le backend calcule les 3 refs à partir des ids d'attributs sélectionnés + config d'ordre stockée en `parametres_generation_refs`.
- L'ADMIN peut surcharger manuellement `ref_commerciale` et `ref_fabrication` (utile pour cas spéciaux type Lurex `LuAr`).
- `code_article` = clé technique, non modifiable après création (impacts sur les scans).
- `ref_commerciale` modification → propagation snapshot dans documents en cours de brouillon uniquement, jamais sur documents validés (les `designation_snapshot` protègent l'historique).

#### EAN — code-barres retail

Chaque article a un **code EAN-13** pour scanner en caisse / rayon boutique / site e-commerce.

- **Auto-généré** à la création selon `parametres_ean` (préfixe GS1 société + compteur incrémental interne + chiffre de contrôle EAN-13 calculé).
- **Modifiable manuellement** par ADMIN (utile si l'article vient d'un fournisseur avec son propre EAN).
- Colonne dédiée `ean_13`, unique.
- Un article peut aussi avoir un **EAN-8** court (colonne `ean_8`) pour très petits emballages.

`parametres_ean` (singleton config) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `prefixe_gs1` | varchar(3) | ex `619` (Tunisie), `327` (France) — attribué par GS1 |
| `code_entreprise` | varchar(6) | attribué par GS1 après souscription — total prefixe+code = 9 chiffres |
| `compteur_actuel` | int | incrément interne 000000-999999 (3-4 chiffres selon longueur code entreprise) |
| `format_ean_defaut` | enum | `ean_13` / `ean_8` |
| `auto_generer` | bool | true = calcul auto à la création |

**Calcul chiffre de contrôle EAN-13** : algo standard (poids 1/3 alternés, complément à 10) — implémenté côté backend.

| Colonne | Type | Note |
|---|---|---|
| `id_article` | serial PK | |
| `id_modele` | FK modeles | requis |
| `code_article` | varchar(80) unique | technique, auto — `<code_modele>-D<id>-C<id>-F<id>-T<id>-N<id>` |
| `ref_fabrication` | varchar(80) unique | auto — pour l'atelier (voir ci-dessus) |
| `ref_commerciale` | varchar(80) unique | auto puis surchargeable ADMIN — pour clients |
| `designation` | varchar(300) | auto : `<libelle_modele> <dimension> <couleur> <finition>` |
| `image_url_principale` | varchar(500) | photo principale de la variante — dérivée de `article_photos` |
| `id_dimension` | FK parametres_dimensions | |
| `id_couleur` | FK parametres_couleurs | |
| `id_finition` | FK parametres_finitions | |
| `id_tissage` | FK parametres_tissages | |
| `id_nombre_couleurs` | FK parametres_nombre_couleurs | |
| `id_personnalisation` | FK parametres_personnalisations | |
| `ean_13` | varchar(13) unique | code EAN-13, auto ou manuel (voir plus haut) |
| `ean_8` | varchar(8) unique | code EAN-8 court optionnel |
| `prix_reviens` | numeric(14,3) | coût de production de la variante |
| `prix_vente_ht` | numeric(14,3) | prix de base HT (surcharge par grille tarifaire) |
| `unite_vente` | varchar(10) | `pc`, `paire`, `kg` |
| **`poids_net_g`** | numeric(10,2) | poids **net** de l'article fini en grammes (sans emballage) |
| **`poids_brut_g`** | numeric(10,2) | poids **brut** avec emballage standard (utilisé pour calcul frais port) |
| **`longueur_cm`** | numeric(8,2) | dimension physique — longueur emballée |
| **`largeur_cm`** | numeric(8,2) | dimension physique — largeur emballée |
| **`hauteur_cm`** | numeric(8,2) | dimension physique — épaisseur emballée |
| **`volume_cm3`** | numeric(12,2) | volume calculé (colonne générée : L×l×H) |
| **`fragile`** | bool | true = manutention spéciale, majoration transport |
| `stock_total` | numeric(14,3) | maintenu par mouvements stock |
| `actif` | bool | |

Les 4 champs poids/dimensions **alimentent** :
- **Calcul frais de port** : `sum(ligne.qte × article.poids_brut_g)` → poids total commande → lookup `tarifs_transport` (§5.5).
- **Pesée automatique du colis** : quand le magasinier ajoute un article scanné à un colis (§5.6), `colis.poids_kg` peut être pré-rempli à partir de `sum(article.poids_brut_g)` (le magasinier confirme/ajuste au moment de la pesée réelle).
- **Choix du transporteur** : palette vs colis selon poids seuil (ex `>30 kg` → palette).
- **Facturation transport** au client (poids taxable = max(poids_brut, poids_volumétrique où poids_vol = volume_cm3 / 5000)).

**Contrainte unique** : `(id_modele, id_dimension, id_couleur, id_finition, id_tissage, id_nombre_couleurs, id_personnalisation)`. C'est ce qui permet la détection "cet article existe déjà".

### 4.5 `article_seo` (référencement web)

Un article publié sur un catalogue web-sync a besoin de champs SEO. Table séparée car facultative.

| Colonne | Type | Note |
|---|---|---|
| `id_article` | FK PK | 1-N (une entrée SEO par article × catalogue) |
| `id_catalogue` | FK PK | SEO peut varier par catalogue |
| `slug_url` | varchar(200) | ex `fouta-arthur-blanc-rouge-100x200` |
| `titre_seo` | varchar(160) | balise `<title>` |
| `meta_description` | varchar(320) | balise meta description |
| `mots_cles` | text[] | keywords ciblés |
| `description_longue` | text | contenu HTML riche (positionnement Google) |
| `images_url` | text[] | plusieurs photos pour la fiche produit web |
| `attributs_open_graph` | jsonb | OG image, OG title, partage réseaux sociaux |
| `score_seo` | int | note calculée pour aider à améliorer position |

### 4.6 Endpoints Produits

```
GET    /api/modeles                           — liste
GET    /api/modeles/:id                       — détail + attributs disponibles + variantes
POST   /api/modeles                           — créer
PUT    /api/modeles/:id                       — modifier
DELETE /api/modeles/:id                       — soft delete

GET    /api/articles?id_modele=&id_catalogue= — variantes
GET    /api/articles/:id                      — détail
POST   /api/articles                          — créer variante (409 si combinaison existe)
PUT    /api/articles/:id                      — modifier
DELETE /api/articles/:id                      — soft delete

GET    /api/catalogues                        — liste
POST   /api/catalogues                        — créer
POST   /api/catalogues/:id/synchroniser       — push articles publiés vers site cible

GET    /api/articles/:id/seo?id_catalogue=    — récup SEO
PUT    /api/articles/:id/seo                  — MAJ SEO

GET    /api/parametres/attributs              — bundle {dimensions, couleurs, finitions, tissages, personnalisations, nombres_couleurs}

Attributs (CRUD ADMIN pour chaque type) :
GET|POST|PUT|DELETE  /api/parametres/dimensions/:id?
GET|POST|PUT|DELETE  /api/parametres/couleurs/:id?
GET|POST|PUT|DELETE  /api/parametres/finitions/:id?
GET|POST|PUT|DELETE  /api/parametres/tissages/:id?
GET|POST|PUT|DELETE  /api/parametres/nombres-couleurs/:id?
GET|POST|PUT|DELETE  /api/parametres/personnalisations/:id?
```

---

## 4bis. Stock & Entrepôts (Phase 2.5)

Chaque article physique existe **quelque part** : dans un entrepôt, à un emplacement précis, avec un statut (disponible, réservé, en préparation). Toute évolution du stock passe par un **mouvement** — traçabilité complète.

### 4bis.0 Catégories de stock

Le stock porte sur **4 catégories distinctes** — chacune avec ses écrans, ses règles et ses paramètres, mais toutes suivent le même moteur de mouvements :

| Catégorie | Description | Exemples | Table source |
|---|---|---|---|
| **Produits finis (PF)** | Articles sellables prêts à expédier | `AR1020-B02-03` — Fouta ARTHUR blanc/rayé | `articles.type_stock='produit_fini'` |
| **Produits semi-finis (SF)** | Étape intermédiaire de fabrication | Tissu tissé non coupé, fouta non frangée | `articles.type_stock='semi_fini'` |
| **Matières premières (MP)** | Fil, coton, chimie — entrantes fournisseur. **Même architecture modèle-parent + variantes que les PF** (voir §4bis.0.1) | Modèle `Fil coton blanc` → variantes NM15 · NM20 · NM25 (grosseurs) × composition 100% coton / 80-20 / etc. | `articles.type_stock='matiere_premiere'` avec attributs dédiés |
| **Fournitures fabrication** | Consommables ateliers (non incorporés au produit) | Aiguilles, huile machine, ciseaux, navettes | `articles.type_stock='fourniture_fabrication'` |
| **Pièces de rechange** | Composants machines pour maintenance | Courroies métier, cames ratière, roulements, cartes électroniques, aiguilles Dornier, cordes satin | `articles.type_stock='piece_rechange'` |
| **Fournitures bureau** | Consommables bureau | Papier, cartouches, stylos | `articles.type_stock='fourniture_bureau'` |
| **Emballage** | Boîtes, sachets, étiquettes | Cartons GLS taille M, sachets kraft | `articles.type_stock='emballage'` |

Ajout colonne sur `articles` :

| Colonne | Type | Note |
|---|---|---|
| `type_stock` | enum | `produit_fini` / `semi_fini` / `matiere_premiere` / `fourniture_fabrication` / `fourniture_bureau` / `emballage` / `piece_rechange` |
| `categorie_analytique` | varchar(50) | pour valorisation comptable |

#### 4bis.0.1 Matière première — même architecture Modèle → Articles que les PF

**Décision** : les MP réutilisent les tables `modeles` + `articles` (§4.1 / §4.4). Pas de table séparée. La distinction se fait par `modeles.type_produit = 'matiere_premiere'` et `articles.type_stock = 'matiere_premiere'`. On profite alors du même moteur de refs, EAN, poids/dimensions, photos, catalogues, stock, mouvements.

**Modèle MP** = un couple (matière + couleur) décrit à haut niveau — ex `Fil coton blanc`, `Fil polyester ecru`, `Fil lin naturel`.

**Article MP** (variante concrète) = une combinaison précise d'attributs — ex `Fil coton blanc en NM15 en 100% coton`, `Fil coton blanc en NM20 en 80/20 coton-polyester`.

**Ajout colonne sur `modeles`** :

| Colonne | Type | Note |
|---|---|---|
| `type_produit` | enum | `produit_fini` / `semi_fini` / `matiere_premiere` / `fourniture_fabrication` / `fourniture_bureau` / `emballage` |
| `format_ref_commerciale` | varchar(200) | template de génération spécifique au type (défaut hérité — voir §4.4) |
| `format_ref_fabrication` | varchar(200) | idem pour ref_fabrication |

**Types d'attributs élargis** pour supporter les MP — §4.2 `modele_attributs.type_attribut` :

| Type attribut | Utilisé par | Table paramètre |
|---|---|---|
| `dimension` | PF, SF | `parametres_dimensions` |
| `couleur` | PF, SF, MP | `parametres_couleurs` (partagée) |
| `finition` | PF | `parametres_finitions` |
| `tissage` | PF | `parametres_tissages` |
| `nombre_couleurs` | PF | `parametres_nombre_couleurs` |
| `personnalisation` | PF | `parametres_personnalisations` |
| **`numero_metrique`** | **MP** (fils) | **`parametres_numeros_metriques`** (NM05, NM10, NM15, NM20, NM25, NM30, NM40...) — grosseur/finesse du fil |
| **`composition`** | **MP, PF si étiquetage** | **`parametres_compositions`** (100% coton, 100% polyester, 80/20 CO/PES, 70/30, 100% lin, 100% viscose, lurex, mélanges spéciaux) |
| **`torsion`** | **MP** (fils) | **`parametres_torsions`** (S, Z, faible, forte) — sens et intensité |
| **`grammage`** | **MP** (tissus, non-tissés) | **`parametres_grammages`** (g/m²) |

Chaque table paramètre a la même structure minimale : `id, code, libelle, actif, ordre_affichage` + colonnes spécifiques (ex `parametres_numeros_metriques.nombre_metres_par_kg` pour conversion poids/longueur).

**Format des refs MP** (par convention issue du BOM existant `NM15-01.00`) :

- `ref_commerciale` MP = `<CODE_NUM_METRIQUE>-<CODE_COULEUR><SUFFIXE>` — ex `NM15-01.00` (fil NM15 blanc pur), `NM20-15.03` (fil NM20 lagon rayé)
- `ref_fabrication` MP = même chose (le format court est déjà lisible atelier).
- Le champ `format_ref_commerciale` sur `modeles` permet de configurer le template par modèle. Défaut par `type_produit` :
  - PF : cf §4.4 (`<CODE_MODELE><DIM4>-<LETTRE><C2>-<N2>`)
  - MP : `<CODE_NUM_METRIQUE>-<CODE_COULEUR><SUFFIXE>`
  - Fournitures : `<CODE_MODELE>-<CODE_VARIANTE>` (générique)

**Consommation MP → OF** : le BOM d'un OF liste les articles MP nécessaires (id + quantité en kg ou mètres). L'exécution génère `mouvements_stock` `sortie_of` (sur les MP) puis `entree_fabrication` (sur l'article PF/SF produit).

**Champs additionnels sur `articles` (utiles surtout aux MP)** :

| Colonne | Type | Note |
|---|---|---|
| `qr_code` | varchar(50) | QR code étiquette bobine/rouleau (généré à réception, imprimé) |
| `id_fournisseur_defaut` | FK fournisseurs | achat récurrent pour ce référencement |
| `prix_moyen_pondere_kg` | numeric(14,3) | PMP pour valorisation stock (mis à jour à chaque réception fournisseur) |

#### 4bis.0.2 Lot obligatoire pour MP (traçabilité amont)

**Chaque quantité de MP en stock est attachée à un `id_lot`** — pas d'exception. La règle est stricte car la traçabilité amont (numéro de lot fournisseur, date fabrication, certificat conformité) est exigée pour :

- Rappels fournisseur (batch défectueux).
- Reproductibilité couleur (deux lots de "blanc" peuvent avoir un delta chromatique — l'atelier doit savoir quel lot il consomme).
- Traçabilité aval : sur un OF terminé, on peut remonter aux lots MP consommés → au fournisseur → à sa date de livraison.

Extension de §4bis.5 `lots_articles` pour MP :

| Colonne additionnelle MP | Type | Note |
|---|---|---|
| `numero_lot_fournisseur` | varchar(50) | tel qu'indiqué sur le bordereau amont |
| `id_fournisseur` | FK fournisseurs | de qui vient ce lot |
| `date_reception` | date | |
| `certificat_conformite_url` | varchar(500) | PDF fournisseur |
| `couleur_hex_mesure` | varchar(7) | mesure spectro colorimétrique (contrôle nuance) |
| `poids_bobine_moyen_kg` | numeric(10,3) | pour reconditionnement |

**Contrainte** : pour un `article` de `type_stock='matiere_premiere'`, chaque ligne de `stock_article_entrepot` a `id_lot NOT NULL` — le stock est granulaire au niveau lot.

**Mouvements MP** : identiques aux PF (`mouvements_stock`), mais chaque mouvement porte obligatoirement `id_lot`.

**Écran "vue par lot"** dans le Dashboard Magasinier Stock : liste des lots MP par article + fournisseur, quantité restante, date réception, traçabilité descendante (quels OF ont consommé ce lot).

### 4bis.1 `entrepots`

Un entrepôt = un lieu physique de stockage.

| Colonne | Type | Note |
|---|---|---|
| `id_entrepot` | serial PK | |
| `code` | varchar(20) unique | `USINE`, `E1`, `E2`, `E3`, `ATELIER_PREP`, `MAGASIN_TUNIS`, `HUB_MARSEILLE`... |
| `libelle` | varchar(150) | |
| `type` | enum | `usine` / `entrepot_principal` / `entrepot_secondaire` / `atelier_preparation` / `magasin_vente` / `hub_transit` / `sous_traitant` |
| `id_societe_adresse` | FK societe_adresses | l'adresse physique de l'entrepôt (§11) |
| `responsable_id_utilisateur` | FK utilisateurs | qui gère cet entrepôt |
| `capacite_m3` | numeric(10,2) | volume total (info) |
| `permet_vente` | bool | true = stock d'ici peut être vendu directement |
| `actif` | bool | |

**Types d'entrepôts métier** :
- `usine` — sortie de production, dépôt matière première
- `entrepot_principal` — stock disponible pour vente
- `atelier_preparation` — pool temporaire pour préparation commandes (magasinier §6.2)
- `magasin_vente` — point de vente physique
- `hub_transit` — plateforme intermédiaire (ex Marseille) pour redistribution
- `sous_traitant` — stock déposé chez un sous-traitant

### 4bis.2 `emplacements` (optionnel — subdivisions d'entrepôt)

| Colonne | Type | Note |
|---|---|---|
| `id_emplacement` | serial PK | |
| `id_entrepot` | FK entrepots | |
| `code` | varchar(30) unique par entrepôt | ex `A-01-02` (Allée A, Rack 01, Niveau 02) |
| `libelle` | varchar(150) | |
| `capacite_max_articles` | int | |
| `actif` | bool | |

Facultatif — utile pour grand entrepôt. Sinon le stock est directement au niveau `id_entrepot`.

### 4bis.3 `stock_article_entrepot` (vue matérialisée / table dénormalisée)

Snapshot du stock par (article × entrepôt × emplacement) à tout instant. Maintenue par chaque `mouvement_stock`.

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_article` | FK articles | |
| `id_entrepot` | FK entrepots | |
| `id_emplacement` | FK emplacements | nullable |
| `id_lot` | FK lots_articles | nullable — traçabilité par lot de fabrication |
| `quantite_disponible` | numeric(14,3) | dispo pour vente |
| `quantite_reservee` | numeric(14,3) | promise à des commandes non expédiées |
| `quantite_en_reception` | numeric(14,3) | attendue mais pas encore validée |
| `quantite_en_transfert_sortant` | numeric(14,3) | partant vers un autre entrepôt |
| `quantite_totale` | numeric(14,3) | calculé — `disponible + reservee` |
| `date_derniere_maj` | timestamp | |

**Contrainte unique** : `(id_article, id_entrepot, id_emplacement, id_lot)`.

### 4bis.4 `mouvements_stock`

**3 grands types de mouvement** exposés côté UI (regroupent les sous-types) :

- **Réception** : marchandise ou MP qui **entre** dans un entrepôt depuis l'extérieur (fournisseur) OU depuis l'atelier (production terminée).
- **Sortie** : marchandise qui **quitte** un entrepôt vers l'extérieur (expédition commande) ou vers l'atelier (consommation OF) ou hors circuit (rebut).
- **Transfert** : mouvement **entre deux entrepôts** internes — pas de sortie du patrimoine.

Chaque grand type éclate en sous-types techniques ci-dessous.

**Traçabilité complète** — chaque changement de stock est une ligne, immuable.

| Colonne | Type | Note |
|---|---|---|
| `id_mouvement` | serial PK | |
| `numero_mouvement` | varchar(30) unique | `MVT-YYYYMMDD-NNNNN` |
| `type_mouvement` | enum | voir ci-dessous |
| `id_article` | FK | |
| `quantite` | numeric(14,3) | positif |
| `id_lot` | FK lots_articles | nullable |
| `id_entrepot_source` | FK entrepots | nullable (null pour réception fournisseur) |
| `id_emplacement_source` | FK emplacements | nullable |
| `id_entrepot_destination` | FK entrepots | nullable (null pour sortie vente) |
| `id_emplacement_destination` | FK emplacements | nullable |
| `id_document_lie` | int | nullable — id du document déclencheur |
| `type_document_lie` | enum | `bl` / `commande` / `of` / `bon_reception` / `transfert` / `ajustement` / `inventaire` / `retour` |
| `motif` | varchar(200) | libre pour ajustements |
| `date_mouvement` | timestamp | |
| `effectue_par` | FK utilisateurs | |
| `valide_par` | FK utilisateurs | nullable, pour transferts nécessitant validation |
| `statut` | enum | `en_attente` / `valide` / `annule` |

**Types de mouvement (`type_mouvement`)** :

| Type | Sens | Description |
|---|---|---|
| `reception_fournisseur` | + | matière première ou marchandise arrivée d'un fournisseur |
| `entree_fabrication` | + | OF terminé → l'article entre en stock |
| `sortie_vente` | − | BL expédié → l'article quitte le stock |
| `transfert_entrepot` | ±0 | passe d'un entrepôt à un autre (2 lignes complémentaires ou 1 avec source+dest) |
| `reservation` | 0 | pas de sortie physique — bascule `disponible` → `reservee` |
| `liberation_reservation` | 0 | annule une réservation |
| `ajustement_positif` | + | correction manuelle (trouvé en trop lors inventaire) |
| `ajustement_negatif` | − | correction manuelle (perte, casse, vol) |
| `retour_client` | + | retour marchandise → re-entrée en stock (ou zone rebut) |
| `mise_au_rebut` | − | article endommagé sorti du stock vendable |

**Règle clé** : chaque mouvement met à jour `stock_article_entrepot` de manière atomique dans une transaction. Impossible de sortir plus que `disponible`.

### 4bis.5 `lots_articles` (traçabilité optionnelle par lot)

| Colonne | Type | Note |
|---|---|---|
| `id_lot` | serial PK | |
| `numero_lot` | varchar(30) unique | `LOT-YYYYMMDD-NNNN` (généré à la fabrication) |
| `id_article` | FK articles | |
| `id_of` | FK ordres_fabrication | OF d'origine (si issu de fabrication interne) |
| `date_fabrication` | date | |
| `date_peremption` | date | pour catégories concernées |
| `quantite_initiale` | numeric(14,3) | fabriquée |
| `quantite_restante` | numeric(14,3) | encore en stock |
| `notes` | text | |

### 4bis.6 `reservations_stock`

Une commande validée réserve du stock jusqu'à expédition (évite double vente).

| Colonne | Type | Note |
|---|---|---|
| `id_reservation` | serial PK | |
| `id_commande` | FK commandes | |
| `id_ligne_commande` | FK commandes_lignes | granularité ligne |
| `id_article` | FK articles | |
| `id_entrepot` | FK entrepots | où c'est réservé |
| `id_lot` | FK lots_articles | nullable |
| `quantite` | numeric(14,3) | |
| `date_reservation` | timestamp | |
| `date_expiration` | timestamp | nullable — auto-libération si non expédiée |
| `statut` | enum | `active` / `expediee` / `annulee` / `expiree` |

**Workflow** : Commande passe à `validee` → système crée les réservations dans l'entrepôt principal (ou celui indiqué). Quand BL expédié → réservation → mouvement `sortie_vente`. Si commande annulée → `liberation_reservation`.

### 4bis.7 `inventaires` (comptage physique)

Comptage périodique pour rapprocher stock théorique / stock réel.

| Colonne | Type | Note |
|---|---|---|
| `id_inventaire` | serial PK | |
| `numero_inventaire` | varchar(30) unique | `INV-YYYYMMDD-NN` |
| `id_entrepot` | FK entrepots | inventaire par entrepôt |
| `date_debut` / `date_fin` | date | |
| `statut` | enum | `en_preparation` / `en_cours` / `valide` / `annule` |
| `responsable` | FK utilisateurs | |
| `notes` | text | |

`inventaire_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne` | serial PK | |
| `id_inventaire` | FK | |
| `id_article` | FK | |
| `id_emplacement` | FK | nullable |
| `id_lot` | FK | nullable |
| `quantite_theorique` | numeric(14,3) | ce que dit le système |
| `quantite_comptee` | numeric(14,3) | ce que le magasinier a compté |
| `ecart` | numeric(14,3) | calculé |
| `note` | text | motif d'écart |
| `compte_par` | FK utilisateurs | |
| `date_comptage` | timestamp | |

**Validation** : à la clôture, le système génère automatiquement les `mouvements_stock` de type `ajustement_positif` / `ajustement_negatif` pour aligner le stock théorique sur le compté.

### 4bis.8 Écran Stock — navigation demandée

Le flux UI est explicite :

```
1. Liste Entrepôts
   └─► clic sur un entrepôt
2. Vue Entrepôt : liste des articles en stock (paginée, recherche, filtres)
     Colonnes : ref_commerciale · designation · photo · dispo · réservé · en réception · emplacement
   └─► clic sur un article
3. Vue Article dans Entrepôt : détail + historique complet
     - Cartes KPI : dispo / réservé / valeur en stock
     - Timeline des mouvements (avec type, quantité, source/dest, document lié, utilisateur, date)
     - Onglet "Par lot" si l'article est traçé par lot
```

### 4bis.9 Alertes stock

- Chaque article a un `stock_minimum` (par entrepôt via `article_seuils_alerte(id_article, id_entrepot, stock_min)`).
- Job cron quotidien : compare `stock.quantite_disponible` vs `stock_minimum` → crée `alertes` (à intégrer à un dashboard).
- Alerte remonte au responsable de l'entrepôt et à l'admin.

### 4bis.10 Endpoints Stock

```
Entrepôts     : /api/entrepots                        GET|POST|PUT|DELETE  (ADMIN)
                /api/entrepots/:id/articles           — liste articles en stock ici
                /api/entrepots/:id/statistiques       — KPIs (valeur totale, nb refs, ruptures)

Emplacements  : /api/entrepots/:id/emplacements       GET|POST|PUT|DELETE

Stock         : /api/stock?id_article=&id_entrepot=   — vue courante
                /api/stock/article/:id                — vue consolidée cet article partout
                /api/stock/article/:id/mouvements     — historique mouvements
                /api/stock/valorisation?id_entrepot=  — valeur totale du stock

Mouvements    : /api/mouvements-stock                 GET|POST
                /api/mouvements-stock/:id/valider     — pour transferts en attente
                /api/mouvements-stock/:id/annuler     — création mouvement compensatoire

Transferts    : /api/transferts                       POST — crée un transfert (mouvement en_attente)
                /api/transferts/:id/confirmer         — magasinier destinataire confirme réception

Lots          : /api/lots                             GET|POST|PUT
                /api/lots/:id                         — détail + articles issus

Réservations  : /api/reservations?id_commande=        GET
                (créées automatiquement par la validation de commande)

Inventaires   : /api/inventaires                      GET|POST
                /api/inventaires/:id/lignes           GET|POST|PUT
                /api/inventaires/:id/valider          POST — génère les ajustements

Alertes       : /api/alertes-stock?niveau=            GET
                /api/alertes-stock/:id/traiter        POST
```

### 4bis.11 Impacts sur les autres phases

- **§4.4 articles** : la colonne `stock_total` devient une **vue agrégée** (`SUM(stock_article_entrepot.quantite_disponible) WHERE id_article`). Pas de duplication.
- **§5.2 statuts commande** : la validation d'une commande crée des `reservations_stock`.
- **§5.6 colisage** : le scan d'un article dans un colis crée un `mouvement_stock` de type `sortie_vente` depuis `atelier_preparation` (là où le magasinier a préparé la commande après transfert depuis l'entrepôt d'origine).
- **§6.2 dashboard Magasinier** : le bouton "Demander transfert" crée un `mouvement_stock` de type `transfert_entrepot` avec `statut='en_attente'` — le magasinier de l'entrepôt source valide.

---

## 4ter. Fabrication (Phase 2.7)

La Plume Artisanale **fabrique** des textiles (foutas, jetés, serviettes, ponchos, sacs) — le cœur métier. Cette phase couvre la nomenclature, la gamme opératoire, l'ordre de fabrication (OF), le suivi temps réel des opérateurs, le contrôle qualité, la sous-traitance et le calcul des coûts réels.

### 4ter.0 Vocabulaire

| Terme | Sens |
|---|---|
| **BOM** (Bill of Material) | Nomenclature — liste des matières premières et fournitures nécessaires pour produire un article, avec quantités théoriques. |
| **Gamme** | Séquence ordonnée des étapes de fabrication (bobinage → chainage → tissage → coupe → frange → contrôle → finition → emballage). |
| **Poste** | Type de travail (ex "Tissage", "Coupe", "Frange", "Contrôle qualité"). |
| **Machine** | Équipement physique rattaché à un poste (ex métier `M2301`, bobinoir `BOB-01`). |
| **OF** (Ordre de Fabrication) | Instruction concrète de produire N unités d'un article, avec date de début, machines assignées, MP réservées. |
| **Étape OF** | Instance d'une étape de gamme dans un OF concret. |
| **Ratière** | Sous-mécanisme du métier à tisser qui pilote les fils de trame — chaque modèle a un programme ratière spécifique. |
| **Sélecteur couleur** | Nombre de couleurs que la machine peut alterner en trame. Une fouta bicolore nécessite au moins un sélecteur 2 couleurs. |

### 4ter.1 `bom` — Nomenclature par article

Chaque `article` (variante PF ou SF) a une BOM qui liste ses MP + fournitures.

`bom` (en-tête) :

| Colonne | Type | Note |
|---|---|---|
| `id_bom` | serial PK | |
| `id_article` | FK articles | l'article produit |
| `version` | int | pour évolutions BOM (v1 obsolète, v2 courante) |
| `est_active` | bool | 1 seule active par article |
| `perte_theorique_pct` | numeric(5,2) | perte globale prévue (chutes, casse) |
| `notes` | text | |
| `date_creation` / `cree_par` | | |

`bom_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_ligne_bom` | serial PK | |
| `id_bom` | FK | |
| `id_article_composant` | FK articles | MP, SF ou fourniture — pointe vers un article `type_stock IN ('matiere_premiere', 'semi_fini', 'fourniture_*', 'emballage')` |
| `quantite` | numeric(14,4) | pour 1 unité d'article produit |
| `unite` | varchar(10) | `kg` / `m` / `pc` / `g` |
| `id_etape_gamme` | FK gamme_etapes | à quelle étape ce composant est consommé (permet consommation partielle) |
| `role` | enum | `chaine` / `trame` / `fourniture` / `emballage` |
| `remplacements_possibles` | int[] | ids d'articles substituables (ex fil blanc NM15 ↔ NM20 en cas de rupture) |

**Exemple BOM** — Fouta ARTHUR 100/200 blanc/rouge (`AR1020-B02-03`) :

| Composant | Rôle | Quantité | Étape |
|---|---|---|---|
| Fil coton NM15 blanc (`NM15-01.00`) | chaîne | 0.28 kg | Chainage |
| Fil coton NM15 rouge (`NM15-03.00`) | trame | 0.12 kg | Tissage |
| Étiquette tissée logo (`ETIQ-TIS-01`) | fourniture | 1 pc | Frange |
| Sachet kraft M (`EMB-SAK-M`) | emballage | 1 pc | Emballage |

### 4ter.2 `gammes` et `gamme_etapes`

Une **gamme** = séquence type d'étapes. Souvent 1 gamme par catégorie de produit (Fouta / Jeté / Serviette / Poncho) ; peut être surchargée par modèle.

`gammes` :

| Colonne | Type | Note |
|---|---|---|
| `id_gamme` | serial PK | |
| `code` | varchar(20) unique | `GAM_FOUTA_STD`, `GAM_JETE_JQ`... |
| `libelle` | varchar(150) | |
| `id_categorie` | FK categories_produits | à quelle catégorie applicable |
| `actif` | bool | |

`gamme_etapes` :

| Colonne | Type | Note |
|---|---|---|
| `id_etape` | serial PK | |
| `id_gamme` | FK | |
| `ordre` | int | séquence |
| `code` | varchar(30) | `BOBIN`, `CHAIN`, `TISSAGE`, `COUPE`, `FRANGE`, `CTRL_Q`, `LAVAGE`, `REPASS`, `EMBALL` |
| `libelle` | varchar(150) | |
| `id_poste` | FK postes_travail | poste par défaut |
| `duree_standard_sec` | int | par unité produite |
| `est_bloquante` | bool | true = doit être validée avant étape suivante |
| `necessite_ctrl_qualite` | bool | true = un contrôle QC est requis en fin |
| `permet_sous_traitance` | bool | peut être externalisée |
| `sous_type` | enum | pour analyses (`preparation` / `production` / `finition` / `controle` / `logistique`) |

`article_gamme` (assignation) — chaque article référence sa gamme (ou hérite de sa catégorie modèle) :

| Colonne | Type | Note |
|---|---|---|
| `id_article` | FK PK | |
| `id_gamme` | FK | |

### 4ter.3 `postes_travail` et `machines`

`postes_travail` :

| Colonne | Type | Note |
|---|---|---|
| `id_poste` | serial PK | |
| `code` | varchar(20) unique | ex `TISSAGE`, `COUPE`, `FRANGE`, `CTRL_Q` (voir liste ci-dessous) |
| `libelle` | varchar(150) | |
| `categorie` | enum | `preparation` / `production` / `finition` / `controle` / `logistique` |
| `id_entrepot` | FK entrepots | où est physiquement le poste (usine, atelier) |
| `capacite_horaire_theorique` | numeric(10,2) | unités/h pour dimensionnement planning |
| `taux_horaire_mo` | numeric(10,3) | main d'œuvre standard TND/h (pour calcul coût §4ter.9) |
| `actif` | bool | |

#### Liste standard des postes fouta (seed initial)

| Code | Libellé | Catégorie | Sous-type gamme | Rôle métier |
|---|---|---|---|---|
| `PREPARATION_MP` | Préparation matière première | preparation | preparation | Piloté par `MAGASINIER_MP`. Sort les bobines chaîne + trame (jusqu'à 8 sélecteurs S01→S08) des entrepôts, scanne les QR bobines, transfère le kit vers le métier. |
| `BOBINAGE` | Bobinage | preparation | preparation | Prépare les bobines de trame par couleur à partir de MP fil. Sur bobinoir. |
| `OURDISSAGE` | Ourdissage / Chaînage | preparation | preparation | Prépare la chaîne (assemblage des fils longitudinaux) sur ourdissoir. |
| `ENCOLLAGE` | Encollage chaîne | preparation | preparation | (Optionnel) Renforce la chaîne avec apprêt pour tissage. |
| `NOUAGE_CHAINE` | Nouage chaîne | preparation | preparation | Rattache la nouvelle chaîne au métier après changement de rouleau. |
| `TISSAGE` | Tissage | production | production | Cœur de la production — sur métiers Dornier/Picanol avec ratière. Chaque duite = 1 passage trame. |
| `COUPE` | Coupe | production | production | Sépare les foutas individuelles du rouleau tissé. Ciseaux industriels ou coupe automatique. |
| `POST_COUPE_FRANGE` | Post-coupe — Frange | finition | finition | Nouage/tressage/franging des extrémités (spécificité fouta). Peut être manuel ou franging machine. |
| `POST_COUPE_OURLET` | Post-coupe — Ourlet | finition | finition | Alternative à la frange (bordure cousue) pour certains modèles. Machine à coudre. |
| `POST_COUPE_COUTURE` | Couture assemblage | finition | finition | Pour ponchos, sacs, packs : assemblage multi-pièces. Peut aussi porter des étiquettes tissées (voir `ETIQUETAGE`). |
| `ETIQUETAGE` | Étiquetage | finition | finition | Apposition étiquettes tissées (couture), autocollantes (collage), carton papier (accrochage), code-barres/EAN (impression). Peut être fusionné avec `POST_COUPE_COUTURE` ou `POST_COUPE_OURLET` selon organisation atelier. |
| `IMPRESSION_LOGO` | Impression / Sérigraphie | finition | finition | Personnalisation client (souvent sous-traité). |
| `BRODERIE` | Broderie | finition | finition | Idem — souvent sous-traité. |
| `LAVAGE` | Lavage / Blanchissage | finition | finition | Enlève l'apprêt, adoucit. Batch par lot. |
| `REPASSAGE` | Repassage / Pressage | finition | finition | Pressage à chaud pour finition visuelle. |
| `CTRL_QUALITE` | Contrôle qualité final | controle | controle | Poste dédié au contrôleur qualité (§6.7). |
| `PLIAGE` | Pliage | logistique | logistique | Mise en forme avant emballage. |
| `EMBALLAGE_UNIT` | Emballage unitaire | logistique | logistique | Sachet + étiquette par article. |
| `ATELIER_PREPARATION` | Atelier de préparation commandes | logistique | logistique | **Distinct du poste production** : zone où le MAGASINIER_PREPARATION (§6.2) rassemble les articles d'une commande et fait le colisage (§5.6). Alimenté par transferts stock depuis les entrepôts. |
| `EXPEDITION` | Zone expédition | logistique | logistique | Colis fermés en attente enlèvement transporteur. |

**Note importante — distinction entre "Atelier de préparation commandes" et "Ateliers de fabrication"** :

- **Ateliers de fabrication** = les zones physiques où sont installées les machines de production (bobinoirs, ourdissoirs, métiers, coupe, franging, lavage, repassage). Portent des postes de type `preparation` / `production` / `finition`. Sont pilotés par le `CHEF_PRODUCTION` (§6.5) et les opérateurs (§6.6).
- **Atelier de préparation commandes** = une zone logistique **en aval de la fabrication** où le `MAGASINIER_PREPARATION` (§6.2) reçoit les articles finis + les sortis de stock, les assemble par commande, et fait le colisage. Modélisé comme un `entrepot` de type `atelier_preparation` (§4bis.1) + le poste `ATELIER_PREPARATION` (logistique).

L'article "termine" un OF → entre dans un entrepôt de type `entrepot_principal` ou directement dans `atelier_preparation` si commande client en attente → magasinier prépa fait le colisage → BL → expédition.



`machines` (étend le concept `postes_travail` avec l'aspect physique) :

| Colonne | Type | Note |
|---|---|---|
| `id_machine` | serial PK | |
| `code_machine` | varchar(20) unique | `M2301`, `BOB-01`, `COUPE-A` |
| `libelle` | varchar(200) | ex "Métier Dornier A2301 à ratière" |
| `id_poste` | FK postes_travail | |
| `type_machine` | enum | `metier_tisser` / `bobinoir` / `ourdissoir` / `coupe` / `frange` / `couture` / `lavage` / `repassage` / `emballage` / `impression` / `autre` |
| `numero_serie` | varchar(50) | |
| `type_ratiere` | varchar(50) | pour métiers à tisser (`Staubli 2666`, `Bonas`, `Grosse`) |
| `nb_couleurs_selecteur` | int | 1-8 — nombre de couleurs de trame simultanées |
| `laize_machine_cm` | numeric(6,2) | largeur utile |
| `laize_actuelle_cm` | numeric(6,2) | réglage courant (peut différer selon config produit) |
| `nb_fils_par_cm` | numeric(6,2) | densité chaîne |
| `nb_fils_chaine_total` | int | |
| `longueur_peigne_cm` | numeric(6,2) | |
| `type_programme` | varchar(50) | technologie (`AGA-8`, `Bonas`, `Jacquard`) |
| `vitesse_max_duite_min` | int | duites par minute (cadence max) |
| `etat` | enum | `en_service` / `en_maintenance` / `en_panne` / `arret` |
| `id_parc` | FK parcs_machines | Usine / Atelier |
| `date_derniere_maintenance` | date | |
| `date_prochaine_maintenance` | date | |
| `actif` | bool | |

### 4ter.4 `ordres_fabrication` (OF)

#### Ce qu'un OF fige au moment de sa création

À la création d'un OF, le système **fige (snapshot) 4 choses** — même si les référentiels (BOM, gamme, prix MP) évoluent ensuite, l'OF reste piloté par ce qui a été gelé au démarrage :

1. **La gamme** — la séquence ordonnée des postes à exécuter (bobinage → tissage → coupe → frange → étiquetage → contrôle → emballage). Copiée dans `of_etapes` avec `duree_estimee_sec`, `id_machine` assigné, `id_poste` correspondant.
2. **La BOM matières premières** — les articles MP nécessaires avec quantités théoriques. Copiées dans `of_consommations` avec `role='chaine'` / `'trame'`.
3. **Les fournitures et l'emballage** — étiquettes tissées, étiquettes carton, sachets, cartons, adhésifs… Copiées dans `of_consommations` avec `role='fourniture'` / `'emballage'`.
4. **Les affectations planning** — machines et opérateurs prévus par étape (§4ter.8 planning).

Cette approche garantit que **l'OF est reproductible et auditable** : on peut recalculer un coût, refaire le même produit avec les mêmes réglages 6 mois plus tard, tracer précisément ce qui a été consommé.

#### Fiche OF — écran chef de production

L'écran de création / consultation d'un OF présente ces 4 blocs distincts en onglets ou sections :

- **Onglet Article** : quel article produire, quantité, priorité, date livraison prévue, commande liée.
- **Onglet Postes à faire** (= gamme instanciée) : liste ordonnée des étapes, chacune avec machine assignée, poste, durée estimée, opérateur prévu, dépendances. Modifiable avant lancement.
- **Onglet BOM (matières premières)** : liste des MP nécessaires avec quantité par unité produite + quantité totale + coût théorique. Vérification dispo stock en temps réel.
- **Onglet Fournitures & emballage** : étiquettes (tissées/carton/EAN), sachets, cartons, adhésifs, hangtags… mêmes colonnes que BOM.
- **Bandeau récapitulatif** : coût théorique total, date fin prévue calculée, alerte si MP manquante.

`ordres_fabrication` :

| Colonne | Type | Note |
|---|---|---|
| `id_of` | serial PK | |
| `numero_of` | varchar(30) unique | `OF-YYYYMMDD-NNNN` |
| `id_article` | FK articles | article à produire |
| `id_bom` | FK bom | version BOM utilisée (snapshot) |
| `id_gamme` | FK gammes | gamme utilisée |
| `quantite_prevue` | numeric(14,3) | |
| `quantite_produite` | numeric(14,3) | maj au fil du suivi |
| `quantite_rebut` | numeric(14,3) | pièces non conformes |
| `id_commande` | FK commandes | commande à l'origine (nullable si stock prévisionnel) |
| `id_ligne_commande` | FK commandes_lignes | ligne précise |
| `priorite` | enum | `urgente` / `haute` / `normale` / `basse` |
| `statut` | enum | `brouillon` / `planifie` / `en_attente_mp` / `en_cours` / `en_pause` / `pret` (fini, en attente entrée stock) / `termine` / `annule` |
| `date_creation_of` | timestamp | |
| `date_planification` | date | quand démarrer |
| `date_debut_reel` | timestamp | premier pointage |
| `date_fin_prevue` | date | |
| `date_fin_reel` | timestamp | dernier pointage clôture |
| `cout_theorique_ht` | numeric(14,3) | somme (BOM × PMP MP + main-d'œuvre standard) |
| `cout_reel_ht` | numeric(14,3) | calculé à la clôture |
| `id_lot_produit` | FK lots_articles | lot généré à la clôture (traçabilité descendante) |
| `chef_production_id_utilisateur` | FK utilisateurs | responsable |
| `notes_speciales` | text | affichées au magasinier prépa (§6.2) |
| `est_sous_traite` | bool | tout ou partie externalisé |
| `id_soustraitant` | FK soustraitants | si sous-traité |

`of_etapes` (instance de gamme dans l'OF) :

| Colonne | Type | Note |
|---|---|---|
| `id_of_etape` | serial PK | |
| `id_of` | FK | |
| `id_etape_gamme` | FK gamme_etapes | référence template |
| `ordre` | int | copie de l'étape gamme (peut être réordonné) |
| `id_machine` | FK machines | assignation planning |
| `duree_estimee_sec` | int | |
| `duree_reelle_sec` | int | calculée à partir des pointages |
| `date_debut_prevue` | timestamp | |
| `date_debut_reel` | timestamp | premier pointage |
| `date_fin_prevue` | timestamp | |
| `date_fin_reel` | timestamp | |
| `operateur_principal_id_utilisateur` | FK utilisateurs | |
| `statut` | enum | `a_faire` / `en_cours` / `en_pause` / `termine` / `bloque_qc` / `annule` |
| `quantite_produite` | numeric(14,3) | à cette étape (peut être partiel) |
| `quantite_rebut` | numeric(14,3) | rebuts à cette étape |
| `commentaire` | text | libre |

`of_consommations` (BOM éclaté effectif — MP **et** fournitures et emballage) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_of` | FK | |
| `id_of_etape` | FK | à quelle étape |
| `id_article_composant` | FK articles | la MP / fourniture / emballage consommé |
| `role` | enum | `chaine` / `trame` / `fourniture` / `emballage` / `etiquette` |
| `numero_selecteur` | int | pour les fils trame : 1-8 (S01→S08, aligné avec le sélecteur couleur du métier — voir §4ter.4bis) |
| `id_lot` | FK lots_articles | lot MP puisé (traçabilité) |
| `qr_mp_reel` | varchar(50) | QR bobine réellement utilisée (peut différer du prévu) |
| `quantite_theorique` | numeric(14,4) | issue de la BOM (colonne `Besoin S0X (kg)` du legacy) |
| `quantite_reelle` | numeric(14,4) | ce que l'opérateur a réellement pris/consommé (colonne `Poids Consommé S0X`) |
| `ecart_absolu` | numeric(14,4) | calculé (`quantite_reelle - quantite_theorique`) — colonne `Différence S0X` du legacy |
| `ecart_pct` | numeric(6,2) | calculé |
| `id_mouvement_stock` | FK mouvements_stock | mouvement `sortie_of` correspondant |
| `date_consommation` | timestamp | |

### 4ter.4ter Attribution et préparation matière première

Deux étapes distinctes, dans cet ordre, entre la validation d'un OF et le démarrage du tissage.

#### Attribution MP (automatique + affinage manuel)

Dès qu'un OF passe en `planifie`, le système **attribue** un lot de MP à chaque ligne `of_consommations` :

- Règle par défaut : le **premier lot dispo FIFO** (le plus ancien en stock) qui couvre la quantité théorique.
- Alternative : lot le plus **proche colorimétriquement** d'un lot déjà utilisé sur un OF antérieur du même modèle (continuité chromatique).
- Le magasinier MP peut **réattribuer** manuellement un autre lot (par exemple pour vider une bobine presque finie).
- L'attribution crée une **réservation stock** (§4bis.6) sur le lot choisi, empêchant sa consommation par un autre OF.

Champs concernés : `of_consommations.id_lot`, `qr_mp_reel` (renseigné à la préparation).

#### Préparation MP (physique — Magasinier MP §6.10)

Le magasinier MP prend la liste attribuée et prépare physiquement le kit :

1. Ouvre l'OF → voit la liste des bobines attribuées avec leur emplacement (entrepôt + emplacement).
2. Pour chaque ligne : va chercher la bobine, la scanne (QR).
3. Le système vérifie **cohérence** :
   - Code MP scanné = code MP attendu → OK, coche verte.
   - Divergence (par ex ECRU au lieu de BLANC) → alerte rouge, refuse tant que corrigé.
   - Lot différent de celui attribué → demande confirmation (l'attribution devient le lot réellement scanné).
4. Le kit est **rassemblé physiquement** dans l'atelier de préparation MP (un chariot ou étagère marquée du numéro OF).
5. Bouton "Kit prêt" → l'OF passe en `etat_preparation_mp = terminee`, le tissage devient débloqué.
6. Génère un `mouvement_stock` `transfert_entrepot` : entrepôt MP source → entrepôt "poste tissage" (virtuel) du métier assigné.

Le tisseur (§6.6) voit alors sur sa tablette que le kit est prêt, avec les codes S01→S08 réels sur ses sélecteurs.

### 4ter.4quater Complément de fabrication (sous-OF `.1`)

Si à la fin d'un OF, la quantité 1ᵉʳ choix produite est inférieure à la quantité commandée (à cause du rebut, 2ᵉ choix, casse), le Chef d'Atelier peut demander un **complément**. Système hérité du legacy :

- Nouveau **sous-OF** créé avec `numero_of` = OF parent + `.1` (ex `OF-2026-0812.1`).
- `id_of_parent` FK sur l'OF principal.
- Statut priorité forcé à `urgente` (le complément passe devant les autres).
- `ordrePlanification = 0` → apparaît en tête du planning.
- **Refus possible** par le TISSEUR avec motif obligatoire (cause : MP manquante, machine indisponible, cadence non tenable, autre) → notifie CHEF_PRODUCTION pour arbitrage.

Ajouts sur `ordres_fabrication` :

| Colonne | Type | Note |
|---|---|---|
| `id_of_parent` | FK ordres_fabrication | nullable ; renseigné pour un complément |
| `type_of` | enum | `standard` / `complement` / `rework` / `prototype` |
| `motif_refus_complement` | text | nullable ; renseigné si tisseur refuse |

### 4ter.4quinquies Catégorisation qualité (1er choix / 2ᵉ choix / Déchet / Ourlet)

Le legacy sépare les catégories finales de production :

| Catégorie | Sens | Impact stock |
|---|---|---|
| **1er choix** | Conforme, sellable au prix plein | Entrée stock normal PF |
| **2ème choix** | Défaut mineur — sellable en second choix (site outlet, dépannage) à prix réduit | Entrée stock PF avec `qualite='second_choix'` |
| **Ourlet** | Sous-catégorie incluse dans 1er choix (foutas ourletées vs frangées) | Idem 1er choix |
| **Déchet / Rebut** | Non sellable | `mise_au_rebut` (§4bis.4) |

Extension `controles_qualite` (§4ter.6) :

| Colonne | Type | Note |
|---|---|---|
| `qte_premier_choix` | numeric(14,3) | |
| `qte_second_choix` | numeric(14,3) | |
| `qte_ourlet` | numeric(14,3) | inclus dans premier choix |
| `qte_rebut` | numeric(14,3) | |
| `type_defaut` | enum | `tache` / `couture_irreguliere` / `fil_casse` / `dimension_incorrecte` / `couleur_non_conforme` / `frange_defectueuse` / `autre` |
| `decision` | enum | `laisser_passer_1c` / `passer_2c` / `rework` / `rebut` |

Un article a une colonne `qualite` (`premier_choix` / `second_choix`) qui influe sur le prix affichable et la vente possible. Les articles second choix ne sont pas exposés au portail client standard mais accessibles via un catalogue "Outlet" (§4.3).

### 4ter.4bis Modèle de BOM/OF hérité — parité fonctionnelle avec le legacy Google Apps

Le projet Google Apps Script existant (fichier source `docs/archive/erp-all-by-fouta-legacy/developpement/BOM 2025-2026.xlsx` — feuille `Base Commandes` avec 84 colonnes) a validé plusieurs concepts métier qu'on **reprend intégralement** :

#### Structure BOM à 8 sélecteurs

Les métiers à tisser Dornier ont un **sélecteur de couleur trame de 1 à 8 positions** (`nb_couleurs_selecteur` sur `machines`). Chaque position = un fil MP disponible pendant le tissage.

Pour un OF, la BOM MP se décompose donc en jusqu'à **8 lignes trame** (S01 → S08) + **1 ligne chaîne** :

| Ligne BOM | Colonne legacy | Modèle nouveau (`of_consommations`) |
|---|---|---|
| Chaîne | `Métrage Fil Chaîne (m)` | 1 ligne `role='chaine'`, quantité en mètres puis convertie en kg |
| Trame S01 | `Code S01`, `QR MP Réel S01`, `Besoin S01 (kg)`, `Poids Consommé S01`, `Différence S01 (kg)` | 1 ligne `role='trame'`, `numero_selecteur=1` |
| Trame S02 | idem S02 | 1 ligne `role='trame'`, `numero_selecteur=2` |
| ... | ... | ... |
| Trame S08 | idem S08 | 1 ligne `role='trame'`, `numero_selecteur=8` |
| Fournitures | (colonnes libres selon modèle) | N lignes `role='fourniture'` / `'etiquette'` |
| Emballage | (colonnes libres selon modèle) | N lignes `role='emballage'` |

Totaux BOM (colonnes `Total Besoin (kg)`, `Total Consommé (kg)`, `Différence Totale (kg)`) sont **calculés à la volée** (pas stockés), à partir de la somme des `of_consommations`.

#### Champs tissage spécifiques à ajouter sur `ordres_fabrication`

| Colonne à ajouter | Type | Source legacy |
|---|---|---|
| `id_machine_prevue` | FK machines | `Num Machine` |
| `temps_production_prevu_sec` | int | `Temps de production` (converti) |
| `compteur_machine_affichage` | int | `Compteur à Afficher` (utile pour l'opérateur sur le métier) |
| `largeur_tissu_cm` | numeric(6,2) | `Largeur Tissu` |
| `longueur_tissu_m` | numeric(10,2) | `Longueur Tissu` (m) |
| `metrage_fil_chaine_m` | numeric(10,2) | `Métrage Fil Chaîne (m)` — pour la ligne chaîne |
| `duite_par_cm` | numeric(6,2) | `Duite par CM` |
| `nb_duites_total_production` | int | `Nb Duites Total Production` |
| `qr_mp_final` | varchar(50) | `QR MP` — code global de traçabilité assemblée |

#### États d'avancement multi-phases

Le legacy suit 3 sous-états séparés (colonnes `Etat Préparation MP`, `Etat Tissage`, `Etat Coupe`). On les modélise en tant que colonnes distinctes sur `ordres_fabrication`, **en complément** du `statut` global :

| Colonne | Enum | Note |
|---|---|---|
| `etat_preparation_mp` | `a_faire` / `en_cours` / `terminee` / `bloquee` | statut du travail Magasinier MP (§6.10) |
| `etat_tissage` | idem | statut du poste tissage |
| `etat_coupe` | idem | statut du poste coupe |

**Règle** : les 3 états sont dérivés automatiquement des `of_etapes.statut` associés aux postes `BOBINAGE`/`OURDISSAGE` (→ prep MP), `TISSAGE` (→ tissage), `COUPE` (→ coupe). C'est une vue rapide pour dashboards ; la source de vérité reste `of_etapes`.

#### Deuxième fabrication (2ᵉ passe finition)

Le legacy distingue `QTE Fabriquer Coupe` de `QTE Deuxieme Fab` (avec `Deuxieme Approuvee Interne`, `Qte Deu Ext` — externe/sous-traitée). Ce sont typiquement les foutas qui retournent pour **frange + ourlet + lavage** après une première passe (tissage + coupe).

On modélise cela avec :

- Un OF principal (tissage + coupe) → produit un article `type_stock = 'semi_fini'` (SF).
- Un OF secondaire (frange + finition + emballage) qui **consomme** le SF (via BOM `role='chaine'` ou pivot spécial) → produit le PF final.
- OU (plus simple pour l'utilisateur) : un OF unique avec plusieurs étapes gamme, dont certaines flaggées `deuxieme_passe = true`. Colonne `est_deuxieme_passe` sur `of_etapes`.

**Choix retenu Phase 2.7** : OF unique avec étapes marquées → moins d'entités à gérer. On pourra migrer vers 2 OF si besoin.

Ajouts sur `of_etapes` :

| Colonne | Type | Note |
|---|---|---|
| `est_deuxieme_passe` | bool | true = étape post-coupe (frange/ourlet/lavage) |
| `est_sous_traitee` | bool | true = externalisée (§4ter.7) |
| `quantite_approuvee_interne` | numeric(14,3) | equivalent `Deuxieme Approuvee Interne` — validation qualité interne avant sortie externe |

#### Préparation matière première — poste et rôle dédiés

Le **poste `PREPARATION_MP`** (à ajouter à la liste standard §4ter.3) précède le tissage. Il est piloté par un rôle dédié :

- `MAGASINIER_MP` — sort les bobines des entrepôts, prépare le kit MP pour un OF (fils chaîne + fils trame par sélecteur), scanne les QR bobines pour tracer, transfère vers le poste tissage.

Dashboard dédié (§6.10 ci-après).

#### Planification — écran opérationnel

L'écran **Planification** (§4ter.8 Gantt) est la vue centrale du chef de production. Il fait 3 choses :

1. **Assignation machine × créneaux** : les OF (ou étapes tissage) sont posés sur les créneaux de chaque métier.
2. **Vérification contraintes** : compatibilité laize / nb couleurs / dispo MP.
3. **Séquencement Prep MP → Tissage → Coupe → 2ᵉ passe** : le système ordonne automatiquement les dépendances (l'étape tissage attend la fin de la prep MP, la coupe attend le tissage, etc.).



### 4ter.5 Suivi temps réel (pointages opérateurs)

`of_pointages` — chaque tisseur/coupeur scanne son badge (ou saisit sur tablette) début / pause / reprise / fin. Timeline précise du travail.

| Colonne | Type | Note |
|---|---|---|
| `id_pointage` | serial PK | |
| `id_of_etape` | FK | |
| `id_utilisateur` | FK utilisateurs | opérateur |
| `id_machine` | FK machines | machine utilisée à ce moment |
| `type_event` | enum | `debut` / `pause` / `reprise` / `fin` / `changement_operateur` / `panne_machine` / `attente_mp` |
| `horodatage` | timestamp | précis à la seconde |
| `quantite_intermediaire` | numeric(14,3) | quantité produite lors du pointage (compteur machine si dispo) |
| `notes` | text | ex "arrêt casse fil trame" |

**Écran opérateur tablette** (§6.6) : liste ses OF assignés, boutons Démarrer / Pause / Reprendre / Terminer. Scanne QR de la MP entrante pour la consommer proprement.

### 4ter.6 Contrôle qualité (§4ter.CQ)

Chaque étape peut avoir un contrôle qualité obligatoire (`necessite_ctrl_qualite`). Le contrôleur enregistre ses mesures.

`controles_qualite` (par OF étape ou en fin d'OF) :

| Colonne | Type | Note |
|---|---|---|
| `id_ctrl` | serial PK | |
| `id_of` | FK | |
| `id_of_etape` | FK | nullable si contrôle global final |
| `id_controleur_utilisateur` | FK utilisateurs | |
| `date_controle` | timestamp | |
| `type_controle` | enum | `visuel` / `dimensionnel` / `colorimetrique` / `resistance` / `poids` |
| `resultat` | enum | `conforme` / `non_conforme_mineur` / `non_conforme_majeur` / `bloquant` |
| `quantite_controlee` | numeric(14,3) | |
| `quantite_rebut` | numeric(14,3) | |
| `defauts_json` | jsonb | ex `{"trous": 2, "tache": 1, "delta_couleur": 3.5}` — libre |
| `photos_urls` | text[] | preuves photo |
| `action` | enum | `laisser_passer` / `rework` / `mise_au_rebut` |
| `commentaire` | text | |

**Règle** : un contrôle `bloquant` bloque l'OF (`statut='bloque_qc'`), notifie le chef de production. Reprise après validation ADMIN/CHEF_PRODUCTION.

### 4ter.7 Sous-traitance de fabrication

Une étape (ou tout un OF) peut être externalisée.

Existant : `soustraitants` déjà en périmètre. Étendre :

| Colonne additionnelle | Type | Note |
|---|---|---|
| `specialite` | enum | `broderie` / `sérigraphie` / `laser` / `finition` / `emballage` / `tissage_complementaire` |
| `capacite_hebdomadaire_pieces` | int | |
| `delai_moyen_jours` | int | |
| `taux_qualite_pct` | numeric(5,2) | historique |
| `id_grille_tarif_ss_traitance` | FK | prix par prestation |

`of_sous_traitance` (mouvement sortie/entrée avec un sous-traitant) :

| Colonne | Type | Note |
|---|---|---|
| `id_ss_of` | serial PK | |
| `id_of` | FK | |
| `id_of_etape` | FK | quelle étape est sous-traitée |
| `id_soustraitant` | FK | |
| `numero_bon_sortie` | varchar(30) | ex `BSST-YYYY-NNN` |
| `date_sortie` | date | envoi chez le sous-traitant |
| `quantite_envoyee` | numeric(14,3) | |
| `date_retour_prevue` | date | |
| `date_retour_reelle` | date | |
| `quantite_retournee_conforme` | numeric(14,3) | |
| `quantite_retournee_rebut` | numeric(14,3) | |
| `cout_prestation_ht` | numeric(14,3) | |
| `statut` | enum | `envoye` / `en_cours` / `retour_partiel` / `retourne` / `litige` |

Interaction stock : la sortie chez le sous-traitant est un `mouvement_stock` `transfert_entrepot` vers l'entrepôt virtuel du sous-traitant (§4bis.1 type `sous_traitant`). Le retour crée un mouvement inverse + un `entree_fabrication`.

### 4ter.8 Planning de fabrication

Le CHEF_PRODUCTION dispose d'un **écran de planning** de type Gantt/Kanban :

- Colonnes = machines · Lignes = créneaux horaires (jour/semaine).
- OF planifiés = cartes déplaçables par drag-and-drop → mise à jour `of_etapes.id_machine` + `date_debut_prevue`.
- Contraintes automatiques vérifiées : capacité machine (nb couleurs, laize compatible), disponibilité MP réservée, dispo opérateur.
- Filtre par priorité, par date livraison commande liée.

`planning_slots` (dénormalisé pour perf) :

| Colonne | Type | Note |
|---|---|---|
| `id_slot` | serial PK | |
| `id_machine` | FK | |
| `id_of_etape` | FK | |
| `date_debut` / `date_fin` | timestamp | |
| `statut` | enum | `prevu` / `en_cours` / `termine` / `deplace` |

### 4ter.9 Coûts de fabrication

À la clôture d'un OF, on calcule le coût réel et on le compare au coût théorique.

**Formule coût réel HT** :

```
cout_reel_ht =
  SUM(of_consommations_mp.quantite_reelle × mp.prix_moyen_pondere_kg)
+ SUM(of_pointages temps × poste.taux_horaire_main_oeuvre)
+ SUM(of_sous_traitance.cout_prestation_ht)
+ ventilation frais fixes atelier (amortissement machines, énergie, etc.) — clé de répartition par heure machine
```

`postes_travail.taux_horaire_main_oeuvre` (config Paramètre Fabrication).

**Écart** : `cout_reel - cout_theorique` — analyse en dashboard.

`of_couts` (snapshot à clôture) :

| Colonne | Type | Note |
|---|---|---|
| `id_of` | FK PK | |
| `cout_mp_reel_ht` | numeric(14,3) | |
| `cout_mo_reel_ht` | numeric(14,3) | main d'œuvre |
| `cout_ss_traitance_reel_ht` | numeric(14,3) | |
| `cout_frais_fixes_ht` | numeric(14,3) | |
| `cout_total_reel_ht` | numeric(14,3) | |
| `cout_theorique_ht` | numeric(14,3) | |
| `ecart_ht` | numeric(14,3) | |
| `ecart_pct` | numeric(6,2) | |
| `cout_unitaire_reel_ht` | numeric(14,3) | `cout_total / quantite_produite` |

Ce coût unitaire réel alimente rétroactivement `articles.prix_reviens` (moyenne mobile ou PMP configurable).

### 4ter.10 Cycle de vie complet d'un OF

```
CREATION (par CHEF_PRODUCTION ou auto depuis §5.2 commande validée)
        │
        │  BOM figée, gamme copiée, etapes créées
        ▼
BROUILLON → PLANIFIE
        │
        │  Vérification MP dispo (via §4bis.6 réservations)
        ▼
EN_ATTENTE_MP (si manque) ─ MP livrées ► PLANIFIE
        │
        │  Démarrage 1er pointage
        ▼
EN_COURS
        │  Étapes séquentielles avec pointages tisseurs/coupeurs
        │  Consommations MP en temps réel
        │  Contrôles qualité aux jalons
        │  Éventuellement sous-traitance (§4ter.7)
        ▼
PRET (dernière étape finie, en attente entrée stock)
        │
        │  Génération lot produit (id_lot) + mouvement `entree_fabrication`
        ▼
TERMINE
        │
        │  Calcul cout_reel, mise à jour prix_reviens article
        ▼
CLÔTURÉ (immutable)
```

### 4ter.11 Endpoints Fabrication

```
BOM         : /api/bom                       GET|POST|PUT|DELETE
              /api/bom/:id/lignes            CRUD
              /api/bom/:id/activer           POST (rend cette version active)
              /api/articles/:id/bom          GET (BOM active)

Gammes      : /api/gammes                    GET|POST|PUT|DELETE
              /api/gammes/:id/etapes         CRUD

Machines    : /api/machines                  GET|POST|PUT|DELETE
              /api/machines/:id/planning     GET (créneaux)
              /api/machines/:id/etat         GET (dernière panne, dernier op)

OF          : /api/of                        GET|POST|PUT|DELETE
              /api/of/:id                    GET (détail complet)
              /api/of/:id/lancer             POST (planifie → en_cours)
              /api/of/:id/pause / :id/reprendre / :id/annuler
              /api/of/:id/terminer           POST (calcule cout, génère lot)
              /api/of/:id/etapes             CRUD
              /api/of/:id/consommations      GET|POST (saisie manuelle si scanner HS)
              /api/of/:id/pointages          GET
              POST /api/of-etapes/:id/pointer  (opérateur tablette : type_event)

Contrôle Q  : /api/of/:id/controles          GET|POST
              /api/of-etapes/:id/controles   CRUD
              /api/controles-qualite/:id/action  POST (laisser_passer / rework / rebut)

Sous-trait  : /api/of/:id/sous-traiter       POST
              /api/of-sous-traitance         GET|POST|PUT
              /api/of-sous-traitance/:id/retour  POST

Planning    : /api/planning                  GET (période + filtres)
              PUT /api/of-etapes/:id/replanifier  (drag-drop)

Coûts       : /api/of/:id/couts              GET
              /api/rapports/ecarts-cout      GET (dashboard analyse)
```

### 4ter.12 Impacts sur les autres phases

- **§4bis Stock** : OF consomme MP (mouvement `sortie_of`) et produit PF (mouvement `entree_fabrication`) avec `id_lot` généré. `stock_article_entrepot` mis à jour atomiquement.
- **§5.2 Ventes** : si la commande validée requiert un article non-en-stock, le système propose de créer un OF (workflow existant à réutiliser). L'OF terminé alimente le stock et libère la sortie vente.
- **§6.2 Magasinier Préparation** : les articles en fabrication apparaissent à l'état `en_fabrication` avec avancement (%) et OF cliquable → détail.
- **§8 Communications** : chaque changement de statut OF peut déclencher une notification (ex `bloque_qc` → chef de production + admin).

---

## 5. Ventes (Phase 3)

### 5.1 Documents et transitions

```
Devis ─(accepté)─▶ Commande ─(préparée)─▶ Liste colisage ─▶ Bon de livraison ─(livré)─▶ Facture ─(payée)─▶ ✓
                        │                                                                 │
                        └─▶ Palette (regroupement)                                        ├─▶ Avoir
                                                                                          └─▶ Bon de retour
```

### 5.2 Statuts par document

- **Devis** : `brouillon` → `envoye` → `accepte` / `refuse` / `expire` / `transforme`
- **Commande** : `en_attente` → `validee` → `en_preparation` → `pretes_a_expedier` → `expediee` → `livree_partiel` → `livree` / `annulee`
- **BL** : `brouillon` → `en_preparation` → `pret` → `expedie` → `livre` / `retour_partiel`
- **Colis** : `en_preparation` → `emballe` → `pese` → `expedie` → `livre` / `perdu` / `retour`
- **Palette** : `en_composition` → `fermee` → `expediee` → `arrivee_hub_marseille` → `redistribuee`
- **Facture** : `brouillon` → `emise` → `payee_partiel` → `payee` / `annulee`
- **Avoir** : `brouillon` → `emis` → `applique` / `annule`
- **Bon de retour** : `brouillon` → `en_traitement` → `traite` / `refuse`

### 5.2bis Transformation d'une ligne de commande en OF

À la validation d'une commande, le système analyse **chaque ligne** et propose une action.

#### Étape 1 — analyse stock automatique (côté backend)

Pour chaque ligne `id_article + quantite_commandee` :

1. Lit `stock_article_entrepot` : quelle quantité disponible immédiatement dans les entrepôts autorisés (typiquement `entrepot_principal`) ?
2. Lit `ordres_fabrication` en cours pour cet article : quelle quantité arrive bientôt ?
3. Calcule `qte_a_fabriquer = quantite_commandee - qte_reservable_stock - qte_of_en_cours_disponible`.
4. Retourne pour chaque ligne un **plan proposé** :
   - `qte_depuis_stock` (à réserver immédiatement)
   - `qte_depuis_of_existants` (à réserver sur OF non encore engagés)
   - `qte_a_fabriquer` (nouveau OF à créer)

#### Étape 2 — écran "Aperçu OF" (côté commercial ou ADMIN)

Une modale présente le plan par ligne :

| Ligne | Article | Qté cmdée | Qté stock | Qté OF existant | Qté à fabriquer | Action |
|---|---|---|---|---|---|---|
| 1 | `AR1020-B02-03` | 100 | 40 (réservable) | 20 (OF-2026-0812) | 40 | Créer OF |
| 2 | `AR1020-B04-01` | 50 | 50 | 0 | 0 | Tout en stock ✓ |
| 3 | `IB2020-B06-01` | 30 | 0 | 0 | 30 | Créer OF |

L'utilisateur peut :

- **Ajuster** la répartition (par ex forcer 20 unités de plus depuis stock si dispo, ou tout mettre en OF neuf pour date meilleure).
- **Regrouper** plusieurs lignes du même article dans **un seul OF** (batching) — utile si 3 clients commandent le même article la même semaine.
- **Choisir la priorité** de l'OF (`normale` / `haute` / `urgente`) — souvent héritée de la commande, mais surchargeable.
- **Choisir la date de fabrication prévue** (auto-calculée à partir de `date_livraison_prevue` de la commande − buffer transport + délai fab).

#### Étape 3 — validation → création des OF

Au clic "Valider le plan", le système :

1. Crée les **réservations stock** (§4bis.6) sur les quantités venant du stock ou des OF existants.
2. Crée les **nouveaux OF** en statut `brouillon` avec :
   - `id_commande`, `id_ligne_commande` (rétro-lien).
   - `id_article`, `quantite_prevue`.
   - `id_bom` = BOM active de l'article (snapshot §4ter.4).
   - `id_gamme` = gamme active de l'article.
   - `priorite`, `date_fin_prevue` calculée.
   - Etapes copiées, BOM et fournitures snapshotées dans `of_consommations`.
3. Retourne au chef de production, qui planifie (§4ter.8) puis lance (`brouillon` → `planifie` → `en_attente_mp`).

#### Étape 4 — pilotage ligne par ligne côté commande (drill-down)

Sur la fiche commande, chaque ligne affiche **son état de fabrication** en direct :

- ✓ En stock (dispo, prêt à expédier).
- ⏳ Réservé sur OF `OF-XXXX` (avancement 45 %).
- 🏭 Nouveau OF `OF-YYYY` (statut `en_attente_mp`, avancement 0 %).
- ⚠️ Retard prévu (OF en retard vs date livraison) → alerte au commercial.

**Drill-down** — la ligne est cliquable :

- 1er clic → carte détaillée : liste des OF couvrant la ligne, avancement de chacun sous forme de barre (0-100 %), étape en cours (`Prep MP` / `Tissage` / `Coupe` / `Frange` / `Contrôle` / `Emballage`), date fin prévue, écarts avec date livraison client.
- 2ème clic sur un OF → fiche OF complète (§4ter.4) avec toutes les étapes, le kit MP, les pointages, les contrôles qualité, l'affectation machine.

Le commercial voit ainsi **de la commande jusqu'à la ligne, jusqu'au poste de travail**, sans avoir besoin de contacter l'atelier.

**Règles** :

- 1 ligne commande peut être couverte par **plusieurs OF** (si batching partiel) OU 1 OF unique.
- 1 OF peut couvrir **plusieurs lignes** de commandes différentes (batching multi-clients) — le PF produit est ensuite réparti à l'expédition selon les réservations.
- L'annulation d'une commande **ne** supprime **pas** un OF en cours (perte fabrication) — la production continue et le PF entre en stock disponible.

### 5.3 Livraison croisée (client A commande, client B reçoit)

Sur `commandes` et `bons_livraison` :

- `id_client` = qui commande / qui est facturé (par défaut).
- `id_adresse_facturation` = adresse de facturation.
- `id_client_livraison` = qui reçoit (nullable, défaut = `id_client`).
- `id_adresse_livraison` = adresse chez `id_client_livraison`.

Affichage BL : "Livré à : <nom_client_livraison> — <adresse_livraison>" bien visible.
Affichage facture : ne concerne QUE `id_client`.

### 5.4 Lignes de document

Toutes les tables `<doc>_lignes` :

| Colonne | Type | Note |
|---|---|---|
| `id_article` | FK | requis |
| `designation_snapshot` | varchar(300) | copie à l'instant t (immuable après validation) |
| `quantite` | numeric(14,3) | |
| `prix_unitaire_ht` | numeric(14,3) | après grille tarifaire |
| `remise_pct` | numeric(5,2) | ligne spécifique |
| `taux_tva` | numeric(5,2) | |
| `montant_ht` | numeric(14,3) | calculé |
| `montant_tva` | numeric(14,3) | |
| `montant_ttc` | numeric(14,3) | |

### 5.5 Frais de port

Chaque en-tête de document (`devis`, `commandes`, `factures`, `avoirs`) porte les frais de port **hors HT article** — important car les commissions se calculent sur le HT hors port.

| Colonne | Type | Note |
|---|---|---|
| `frais_port_ht` | numeric(14,3) | montant HT du transport |
| `taux_tva_port` | numeric(5,2) | TVA appliquée au port |
| `frais_port_ttc` | numeric(14,3) | calculé |
| `id_transporteur` | FK transporteurs | transporteur prévu (voir §5.7) |
| `mode_transport` | enum | `routier` / `maritime` / `aerien` / `express` |
| `type_conditionnement` | enum | `colis` / `palette` / `groupage` |
| `montant_ht_total` | numeric(14,3) | somme lignes HT (base commission) |
| `montant_ttc_total` | numeric(14,3) | `montant_ht_total + frais_port_ht + toutes TVA` |

Table `tarifs_transport` (grille configurable, ADMIN) :

| Colonne | Type | Note |
|---|---|---|
| `id_tarif_transport` | serial PK | |
| `id_transporteur` | FK | |
| `mode` | enum | `routier`... |
| `zone` | enum | `tunisie_france` / `france_domicile` / `europe` / ... |
| `poids_min_kg` / `poids_max_kg` | numeric(10,3) | palier de poids |
| `prix_ht` | numeric(14,3) | |
| `actif` | bool | |

### 5.6 Liste de colisage

Chaque BL a une **liste de colisage** = les colis (ou palettes) qui composent physiquement l'envoi.

`colis` :

| Colonne | Type | Note |
|---|---|---|
| `id_colis` | serial PK | |
| `numero_colis` | varchar(30) unique | **format `C<3 derniers chiffres id_client>-<3 derniers chiffres id_commande>-<NNN>`** (ex `C234-567-001`) |
| `id_bl` | FK bons_livraison | |
| `id_palette` | FK palettes | nullable — colis peut être groupé dans une palette |
| `id_client_final` | FK comptes | destinataire final (peut différer de bl.id_client_livraison en cas de dispatch Marseille) |
| `poids_kg` | numeric(10,3) | pesée à l'expédition |
| `dimensions_cm` | varchar(50) | LxlxH |
| `photo_url` | varchar(500) | photo obligatoire du colis (contenu ou emballage) |
| `numero_suivi_transporteur` | varchar(80) | tracking GLS / Chronopost / etc. |
| `id_transporteur` | FK transporteurs | |
| `statut` | enum | voir §5.2 |
| `date_expedition` | timestamp | |
| `date_livraison` | timestamp | |

`colis_articles` (contenu d'un colis, saisi par scan) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_colis` | FK | |
| `id_article` | FK | article scanné |
| `quantite` | numeric(14,3) | |
| `id_ligne_bl` | FK | rapprochement automatique colis ↔ ligne BL |
| `scanne_par` | FK utilisateurs | |
| `scanne_le` | timestamp | |

**Workflow magasinier** :
1. Ouvre une commande à préparer.
2. Crée un colis (numéro auto), sélectionne un article, **scanne** son code, saisit la quantité, prend une photo.
3. Répète jusqu'à couverture des lignes commande.
4. Ferme le colis (poids/dimensions). Le système marque la couverture.
5. Peut regrouper plusieurs colis d'un même envoi dans une **palette** (§5.7).

### 5.7 Palettes & Transporteurs

**Cas d'usage typique** : un client français commande, mais fait livrer ses propres clients en France/Europe. Envoi groupé sur palette Tunisie→Marseille, puis redistribution en colis depuis Marseille.

`palettes` :

| Colonne | Type | Note |
|---|---|---|
| `id_palette` | serial PK | |
| `numero_palette` | varchar(30) unique | `PAL-YYYY-NNNN` |
| `id_transporteur_amont` | FK transporteurs | Vectorys, Dachser, Germanetti (TN → Marseille) |
| `numero_suivi_amont` | varchar(80) | |
| `hub_arrivee` | varchar(100) | `Marseille` |
| `date_expedition` | date | |
| `date_arrivee_hub` | date | |
| `statut` | enum | voir §5.2 |
| `poids_kg` | numeric(10,3) | |

`transporteurs` :

| Colonne | Type | Note |
|---|---|---|
| `id_transporteur` | serial PK | |
| `code` | varchar(30) unique | `GLS`, `DHL`, `UPS`, `COLISSIMO`, `BESSON`, `MAZET`, `VECTORYS`, `DACHSER`, `GERMANETTI` |
| `libelle` | varchar(100) | |
| `mode` | enum | `routier` / `maritime` / `aerien` / `express` |
| `type` | enum | `colis` / `palette` / `groupage` |
| `zone_geographique` | enum | `tunisie_france` / `france_domicile` / `europe` / `international` |
| `api_url_suivi` | varchar(300) | endpoint API de tracking |
| `api_auth_type` | enum | `none` / `api_key` / `oauth` |
| `api_credentials_json` | jsonb | secret chiffré |
| `format_num_suivi` | varchar(50) | regex de validation |
| `actif` | bool | |

**Suivi transporteur** : job planifié `node-cron` qui interroge périodiquement l'API de chaque transporteur pour les colis/palettes en cours et met à jour `statut` + `date_livraison`. Endpoint manuel `POST /api/colis/:id/refresh-tracking` pour forcer.

**Transporteurs pré-remplis** (seed initial) :

| Code | Mode | Type | Zone |
|---|---|---|---|
| VECTORYS | routier | groupage | tunisie_france |
| DACHSER | routier | groupage | tunisie_france |
| GERMANETTI | routier | groupage | tunisie_france |
| GLS | routier | colis | france_domicile (principal) |
| DHL | express | colis | france_domicile |
| UPS | express | colis | france_domicile |
| COLISSIMO | routier | colis | france_domicile |
| BESSON | routier | palette | france_domicile |
| MAZET | routier | palette | france_domicile |

### 5.8 Endpoints Ventes

```
Devis         : /api/devis                 GET|POST|PUT|DELETE
                /api/devis/:id/envoyer /:id/transformer /:id/pdf

Commande      : /api/commandes             GET|POST|PUT|DELETE
                /api/commandes/:id/valider /:id/generer-bl /:id/pdf

BL            : /api/bl                    GET|POST|PUT|DELETE
                /api/bl/:id/expedier /:id/livrer /:id/generer-facture /:id/pdf

Colisage      : /api/colis                 GET|POST|PUT|DELETE
                /api/colis/:id/ajouter-article  (scan)
                /api/colis/:id/photo            (upload)
                /api/colis/:id/refresh-tracking

Palettes      : /api/palettes              GET|POST|PUT|DELETE
                /api/palettes/:id/ajouter-colis
                /api/palettes/:id/fermer /:id/expedier

Transporteurs : /api/transporteurs         GET|POST|PUT|DELETE  (ADMIN)

Frais port    : /api/tarifs-transport      GET|POST|PUT|DELETE  (ADMIN)
                (grille : mode × zone × poids → tarif)

Facture       : /api/factures              GET|POST|PUT|DELETE  (POST/PUT/DELETE ADMIN)
                /api/factures/:id/emettre /:id/payer /:id/pdf

Avoir         : /api/avoirs                ADMIN only pour POST/PUT/DELETE

Bon de retour : /api/retours               GET|POST|PUT|DELETE
                /api/retours/:id/traiter /:id/generer-avoir
```

### 5.9 Facturation — règle stricte

- **Seul un ADMIN** peut :
  - passer un devis à `accepte` définitif
  - émettre une facture (`brouillon` → `emise`)
  - émettre un avoir
  - marquer une commission comme versée (§6)
  - enregistrer un paiement client (§5.10)
- **COMMERCIAL** : voit ses factures + paiements + échéances en lecture seule pour suivi.

### 5.10 Paiements & Échéances

Chaque facture peut être payée en une ou plusieurs fois (échéances). Le système suit qui a payé quoi, quand, ce qui reste, et déclenche des relances automatiques.

`echeances` (échéances prévues d'une facture) :

| Colonne | Type | Note |
|---|---|---|
| `id_echeance` | serial PK | |
| `id_facture` | FK factures | |
| `numero_echeance` | int | 1, 2, 3... pour une facture multi-échéances |
| `date_echeance` | date | date à laquelle le paiement est dû |
| `montant_du` | numeric(14,3) | montant TTC prévu pour cette échéance |
| `mode_paiement_prevu` | enum | `virement` / `cheque` / `especes` / `traite` / `carte` |
| `statut` | enum | `a_payer` / `paye_partiel` / `paye` / `en_retard` / `annule` |
| `montant_paye` | numeric(14,3) | somme des paiements associés (dénormalisé) |
| `date_derniere_relance` | timestamp | |
| `nb_relances` | int | |
| `note` | text | |

**Génération automatique** : à l'émission d'une facture, on crée les échéances selon les conditions de paiement du client (`conditions_paiement` — table configurable en Paramètre Vente). Ex : "30 % à la commande, 70 % à 30 jours" → 2 échéances.

`paiements` (paiements réels reçus) :

| Colonne | Type | Note |
|---|---|---|
| `id_paiement` | serial PK | |
| `id_client` | FK comptes | qui a payé |
| `date_paiement` | date | date d'encaissement |
| `montant` | numeric(14,3) | montant TTC reçu |
| `mode_paiement` | enum | `virement` / `cheque` / `especes` / `traite` / `carte` |
| `reference_paiement` | varchar(100) | n° chèque, n° virement, n° traite |
| `id_bancaire` | FK societe_bancaires | compte crédité (voir §11) |
| `note` | text | |
| `piece_jointe_url` | varchar(500) | scan chèque, avis de virement |
| `enregistre_par` | FK utilisateurs | ADMIN qui a saisi |

`paiement_echeances` (répartition d'un paiement sur des échéances — un paiement peut couvrir plusieurs échéances OU une échéance peut nécessiter plusieurs paiements partiels) :

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_paiement` | FK | |
| `id_echeance` | FK | |
| `montant_impute` | numeric(14,3) | portion du paiement allouée à cette échéance |

**Relances** :

`relances` (historique) :

| Colonne | Type | Note |
|---|---|---|
| `id_relance` | serial PK | |
| `id_echeance` | FK | |
| `niveau` | enum | `rappel` (0-7j retard) / `relance` (8-30j) / `mise_en_demeure` (>30j) |
| `canal` | enum | `email` / `whatsapp` / `courrier` |
| `template_utilise` | varchar(50) | référence template |
| `envoye_le` | timestamp | |
| `envoye_par` | FK utilisateurs | ou 'auto' si job planifié |
| `contenu_snapshot` | text | contenu envoyé |
| `reponse_client` | text | si retour |

**Job cron** (`node-cron`) tourne quotidiennement, sélectionne les échéances en retard non payées, applique la politique de relance configurée en Paramètre Vente (délais + templates), envoie l'email (ou WhatsApp), crée la ligne `relances`, crée une `interaction`.

**Vue "État de compte client"** (accessible par commercial pour SES clients, par admin partout) :

- Liste factures : émise, date, montant total, montant payé, montant restant, statut échéances.
- Filtrable : `impayees_seulement`, `en_retard`, `payees`, `periode`.
- Bouton "Enregistrer paiement" (ADMIN) → modal saisie paiement + répartition auto/manuelle sur échéances.
- Bouton "Relancer maintenant" (ADMIN & COMMERCIAL sur ses clients) → choix template + canal + envoi immédiat.

**Endpoints** :

```
GET  /api/echeances?statut=en_retard&id_client=          — liste
GET  /api/factures/:id/echeances                          — échéances d'une facture

POST /api/paiements                                       — enregistrer un paiement (ADMIN)
GET  /api/paiements?id_client=&periode=                   — liste
POST /api/paiements/:id/imputer                           — répartir sur échéances

POST /api/echeances/:id/relancer                          — envoyer relance manuelle
GET  /api/relances?id_echeance=                           — historique

GET  /api/clients/:id/etat-compte                         — vue consolidée (impayés, prévus, historique)
```

---

## 6. Dashboards

### 6.1 Dashboard Commercial (`COMMERCIAL`)

Vue de SES clients uniquement (filtre backend `WHERE id_commercial = <user_id>`).

**Sections** :

- KPI : nb clients actifs, nb devis en cours, CA du mois (devis acceptés), pipeline (devis envoyés non répondus).
- Liste devis en attente (par le client).
- Liste commandes en préparation / expédiées.
- Pipeline visuel (funnel : lead → prospect → client).
- Actions rapides : "Nouveau client", "Nouveau contact", "Nouveau devis" (pré-filtré sur ses clients), "Nouvelle interaction".

**Compte de commissions** — onglet dédié :

- **Taux de commission** paramétrable par utilisateur (colonne `utilisateurs.taux_commission_pct`) et surchargeable par grille tarifaire du client (table `commercial_grilles_commission`).
- Base de calcul = **HT hors frais de port** de chaque facture émise sur ses clients.
- **Commission prévue** = Σ (facture.montant_ht_total × taux) sur toutes ses factures **émises** (payées ou non).
- **Commission réelle** = Σ (facture.montant_ht_total × taux) sur ses factures **payées**.
- **Commission déjà versée** = Σ des versements enregistrés (table `commissions_versements`).
- **Commission restant à payer** = Commission réelle − Commission déjà versée.
- Vue "État de compte" : ligne par facture avec statut paiement + statut commission versée.
- Vue "Clients payés / non payés" : liste + relance rapide.

Table `commissions_versements` :

| Colonne | Type | Note |
|---|---|---|
| `id_versement` | serial PK | |
| `id_commercial` | FK utilisateurs | |
| `montant` | numeric(14,3) | |
| `date_versement` | date | |
| `mode_paiement` | enum | `virement` / `especes` / `cheque` |
| `factures_couvertes` | int[] | ids factures incluses |
| `note` | text | |
| `verse_par` | FK utilisateurs | ADMIN qui a validé |

### 6.2 Dashboard Magasinier Préparation (`MAGASINIER_PREPARATION`)

**Périmètre visible** :

- Uniquement les commandes `validee`, `en_preparation`, `pretes_a_expedier`.
- **Ne voit pas** les commandes `livree`, `annulee`, `solde`.
- **Ne voit jamais** les prix, montants, commissions.

**Colonnes visibles** :

- Num client + num commande + num commande client (référence commande côté client)
- Date d'envoi visée = date livraison client − 1 semaine (calculé auto, mis en évidence si proche/dépassée)
- **Priorité** (`urgente` / `haute` / `normale`) — commandes urgentes en tête
- **Notes spéciales** / instructions saisies au devis/commande
- Articles avec leur **état** par ligne :
  - `en_stock_disponible` — quantité dispo dans un entrepôt
  - `en_stock_partiel` — dispo partielle, complément à fabriquer
  - `en_fabrication` — OF lancé, avec sous-état (`planifie`, `en_cours`, `pret`, etc.)
  - `manquant` — ni stock ni OF
- Click "voir plus" sur une ligne → détail : quel entrepôt, quel emplacement, quel OF, avancement.
- **Bouton "Demander transfert"** si l'article est dans un autre entrepôt → crée un `mouvement_stock_transfert` de l'entrepôt vers l'atelier de préparation, workflow de confirmation.

**Actions** :

- "Commencer préparation" → commande `validee` → `en_preparation`, s'assigne au magasinier.
- Écran de colisage (§5.6) accessible directement depuis chaque commande en cours.
- "Marquer prêt à expédier" → commande `pretes_a_expedier`, BL brouillon généré, palette optionnelle.

### 6.3 Dashboard Magasinier Stock (`MAGASINIER_STOCK`)

**Périmètre** : gestion des flux entrants, sortants, transferts, inventaires sur les 5 catégories (PF / SF / MP / fournitures fab / fournitures bureau / emballage).

**Vue d'ensemble** :

- KPI en tête : valeur totale du stock · nb articles en rupture · nb alertes stock bas · mouvements aujourd'hui.
- **3 onglets d'action** correspondant aux 3 grands types de mouvement :
  1. **Réceptions** — bordereaux fournisseurs à saisir, OF terminés à valider en stock, retours clients à réintégrer.
  2. **Sorties** — commandes en préparation qui vont sortir, OF planifiés qui vont consommer MP, rebuts.
  3. **Transferts** — demandes de transfert en attente de validation (envoyées par le Magasinier Préparation §6.2), transferts partis à confirmer réception.
- Filtres par catégorie (PF/SF/MP/…), par entrepôt, par période.

**Écrans détaillés accessibles depuis le dashboard** :

- Liste des entrepôts (§4bis.8 workflow).
- Écran Réception fournisseur : saisie d'un bordereau → génère les mouvements `reception_fournisseur`.
- Écran Sortie : liste des BL prêts à expédier, validation crée les `sortie_vente`.
- Écran Transfert : liste des demandes → validation crée le mouvement en `en_attente`, la contre-partie confirme réception.
- Écran Inventaire : lance un comptage, saisit les quantités comptées, clôture (génère ajustements).
- Écran Alertes stock : liste articles sous seuil minimum, action rapide "Créer bon de réception fournisseur".

**Ne voit pas** : prix de vente client, marges, commissions, factures. Voit les **prix de reviens** et la valorisation stock.

### 6.5 Dashboard Chef de Production (`CHEF_PRODUCTION`)

**Périmètre** : pilotage de l'atelier de fabrication.

- KPI en tête : nb OF en cours · OF en retard · OF bloqués QC · TRS moyen atelier · charge machines (%) · MP en rupture bloquant OF.
- **Planning Gantt** interactif (§4ter.8) : drag-drop des OF sur les machines.
- Liste OF à planifier (issus des commandes validées).
- Liste OF en cours avec avancement + alertes (retard, blocage QC).
- Vue machines : état temps réel, panne, opérateur courant.
- Actions rapides : "Créer OF", "Sous-traiter étape", "Débloquer OF" (après revue QC).
- Ne voit pas les prix de vente ni les commissions. Voit les coûts fabrication.

### 6.6 Dashboard Tisseur (`TISSEUR`) — tablette

- Header : nom opérateur, machine assignée (`Num Machine`), poste = TISSAGE.
- **Kit MP reçu** : liste des 8 sélecteurs S01→S08 avec le fil monté (QR bobine scannée par le Magasinier MP §6.10). Alerte visuelle si un sélecteur est vide ou incompatible.
- Liste "Mes OF" en attente de tissage — triée par priorité + date planifiée.
- **OF en cours** — grande carte centrale :
  - Article + quantité prévue, quantité produite en direct.
  - Compteur de duites (auto depuis machine si connectée, sinon saisie manuelle par batch).
  - Cadence temps réel vs cadence prévue.
  - Temps écoulé, temps restant estimé.
  - Boutons pointage : `Démarrer` / `Pause` (motif : casse fil / attente MP / pause opérateur / autre) / `Reprendre` / `Terminer`.
  - Bouton "Signaler défaut" → capture rapide photo + type de défaut → déclenche contrôle QC.
- Historique de la journée : nb OF terminés, duites totales, cadence moyenne, temps arrêt.

### 6.6bis Dashboard Coupeur (`COUPEUR`, `POST_COUPE`) — tablette

- Header : nom opérateur, poste = COUPE ou POST_COUPE.
- **File d'attente** : liste des OF sortis du tissage (`etat_tissage = terminee`) en attente coupe.
- **OF en cours** : rouleau à couper, largeur/longueur tissu, nombre de foutas à découper, dimensions cible.
- Scan QR du rouleau entrant → renseigne automatiquement la matière et le lot.
- Compteur pièces coupées, saisie rebuts éventuels.
- Boutons pointage identiques au Tisseur.
- Si **`POST_COUPE`** (frange/ourlet/couture) : liste les étapes finition à faire par article (par sous-lot), scan QR sortant vers étape suivante (lavage, contrôle qualité).

**Tisseur et Coupeur** ne voient jamais : prix, clients, montants commande. Voient uniquement leurs OF, articles, MP, sélecteurs, quantités, machines.

### 6.7 Dashboard Contrôleur Qualité (`CONTROLEUR_QUALITE`)

- KPI : contrôles du jour · taux conformité · défauts fréquents (top 5) · OF bloqués en attente contrôle.
- Liste des étapes OF terminées nécessitant un contrôle (`necessite_ctrl_qualite`).
- Écran de saisie contrôle (§4ter.6) : type, mesures, photos, action (laisser passer / rework / rebut).
- Historique contrôles avec filtre par article / machine / opérateur / défaut.
- Peut bloquer un OF (`bloque_qc`) — notifie chef production.

### 6.8 Dashboard Mécanicien / Maintenance (`MECANICIEN`)

Suivi **curatif** (pannes) et **préventif** (entretien planifié) des machines et équipements.

**Vue Machines** :

- Cartes machines avec état (en_service, en_panne, en_maintenance), dernière intervention, prochaine échéance.
- Bouton "Signaler panne" → change `machines.etat` en `en_panne`, journalise arrêt, notifie chef production + chef atelier, bloque les OF en cours sur cette machine.
- Bouton "Démarrer intervention" → passe en `en_maintenance`, journalise.
- Bouton "Machine remise en service" → repasse en `en_service`, débloque les OF.

**Maintenance préventive (plan d'entretien)** — nouveau bloc :

`plan_maintenance` (récurrences par machine) :

| Colonne | Type | Note |
|---|---|---|
| `id_plan` | serial PK | |
| `id_machine` | FK | |
| `type_intervention` | enum | `graissage` / `nettoyage` / `changement_courroie` / `verification_electrique` / `revision_generale` / `changement_pieces_usure` / `autre` |
| `frequence_type` | enum | `heures_production` / `nb_duites` / `calendrier` |
| `frequence_valeur` | int | ex 500 h ou 10 000 000 duites ou 90 jours |
| `duree_estimee_min` | int | |
| `pieces_necessaires` | jsonb | `[{code_piece, quantite}]` |
| `procedure_url` | varchar(500) | PDF procédure |
| `dernier_execute` | timestamp | |
| `prochain_du` | timestamp | calculé — auto-alerte quand ≤ 7j |

`interventions_maintenance` :

| Colonne | Type | Note |
|---|---|---|
| `id_intervention` | serial PK | |
| `id_machine` | FK | |
| `id_plan` | FK plan_maintenance | nullable — si intervention curative hors plan |
| `type` | enum | `preventive` / `curative` / `revision` / `installation` |
| `date_debut` / `date_fin` | timestamp | |
| `id_mecanicien` | FK utilisateurs | |
| `description_panne` | text | si curatif |
| `actions_effectuees` | text | ce qui a été fait |
| `pieces_consommees` | jsonb | pour valorisation |
| `cout_intervention` | numeric(14,3) | pièces + MO |
| `photos_urls` | text[] | avant/après |
| `duree_arret_machine_min` | int | pour calcul MTBF/MTTR |
| `statut` | enum | `planifiee` / `en_cours` / `terminee` / `annulee` |

**Sections dashboard** :

- KPI : MTBF (Mean Time Between Failures) par machine, MTTR (Mean Time To Repair), taux disponibilité, coût maintenance mensuel.
- **Alertes préventives** : liste des `plan_maintenance` dont `prochain_du` est ≤ 7 jours — action rapide "Planifier".
- **Interventions à faire** : file d'attente (panne signalée, maintenance planifiée).
- **Historique** : filtre par machine, par type, par période, par mécanicien.
- Graph "Pannes récurrentes" : top 5 causes de pannes par machine (utile pour identifier problèmes chroniques).
- **Stock pièces détachées** : lien vers §4bis stock (fournitures fabrication) pour les pièces usure (courroies, aiguilles, cames, etc.) avec seuils alerte.

Endpoints :

```
GET|POST|PUT  /api/plan-maintenance
GET  /api/plan-maintenance/dus?jours_avant=7   — alertes préventives
GET|POST|PUT  /api/interventions-maintenance
POST /api/machines/:id/signaler-panne
POST /api/machines/:id/demarrer-intervention
POST /api/machines/:id/remettre-en-service
GET  /api/maintenance/kpi?id_machine=&periode=  — MTBF/MTTR/dispo
```

### 6.10 Dashboard Magasinier MP (`MAGASINIER_MP`)

Prépare les kits matières premières pour chaque OF, en amont du tissage.

**Sections** :

- Liste des OF à l'état `en_attente_mp` ou `planifie` — triés par date de tissage prévue.
- Pour chaque OF : liste des fils requis avec `numero_selecteur` (S01 → S08) + code MP + quantité prévue en kg + entrepôt source + numéro de lot suggéré.
- Bouton "Préparer le kit" → passe l'OF en `etat_preparation_mp = en_cours`, réserve les bobines.
- **Scan QR bobine** : le magasinier scanne chaque bobine physique → renseigne `of_consommations.qr_mp_reel` et `id_lot`. Contrôle automatique : cohérence code MP scanné vs code MP prévu, alerte si divergence (par ex ECRU au lieu de BLANC).
- Bouton "Kit prêt — transférer vers atelier tissage" → génère `mouvement_stock` `transfert_entrepot` vers l'entrepôt du poste tissage. Passe l'OF en `etat_preparation_mp = terminee`, débloque l'étape tissage.
- Vue "Bobines en préparation" : ce qui est en cours de sortie, où c'est physiquement dans l'atelier prep MP.
- Vue "Alertes MP" : ruptures, écart lot suggéré vs stock réel, quantités insuffisantes → génère automatiquement une demande d'achat vers le Magasinier Stock ou fournisseur.

**Ne voit pas** : prix de vente, clients, commissions. Voit prix de reviens MP pour valorisation.

### 6.11 Dashboard Chef d'Atelier (`CHEF_ATELIER`)

Pilotage terrain d'un atelier physique (usine ou atelier de finition), plus opérationnel que le Chef Production (qui pilote la stratégie et le Gantt global).

**Sections** (structure issue du legacy `chef_atelier_dashboard v11.tsx`) :

- **Onglet Par Opération** : 6 opérations de finition (Frange, Pliage, Étiquetage, Couture, Repassage, Emballage) avec compteurs `en_attente / en_cours / termine` par opération. Vue synthétique de la charge par poste finition.
- **Onglet Par Commande** — drill-down arborescent :
  ```
  Commande CM-FTxxxx
    └─ Article ARxxxx-Byy-zz
         └─ Suivi (numSuivi = lot coupe, ex OF244984-1)
              └─ Matrice Opérations (qte_sortie / qte_retour / qte_en_cours)
  ```
  Un `numSuivi` regroupe typiquement 5 pièces par étiquette lot coupe.
- **Onglet Alertes** :
  - Demandes magasinier (transferts en attente validation, ruptures signalées).
  - Dates envoi client proches (< J-3).
  - OF en retard.
- **Onglet Maintenance** : demandes envoyées au mécanicien avec statut/priorité/équipement.
- **Onglet Analyse 2ème choix** : taux par sous-traitant + répartition types défauts (voir §4ter.6 étendu ci-dessous).

**Actions** :

- Scanner un `numSuivi` et l'affecter à une opération.
- Déclarer 2ème choix (qté + type défaut + décision : rework / rebut / vendre en second choix).
- Demander un **complément de fabrication** au tisseur si `qte_1er_choix < qte_commandee` — génère un sous-OF `.1` (voir §4ter.4quater).
- Envoyer une demande de maintenance au mécanicien.
- Imprimer les feuilles de tournée par opération.

### 6.12 Dashboard Magasinier Sous-Traitants (`MAGASINIER_SOUSTRAITANTS`)

Gestion des flux matière/produits vers/depuis les sous-traitants (broderie, sérigraphie, laser, franging externe, etc.).

**Sections** :

- **KPI** : nb OF en sous-traitance actuellement, quantité sortie totale, quantité retournée conforme/rebut, taux conformité global.
- **File d'attente sortie** : lignes `of_sous_traitance` à statut `envoye` → à préparer physiquement.
- **En cours chez sous-traitant** : liste avec délai restant, alerte si date retour dépassée.
- **Retours à traiter** : marchandise revenue, à contrôler → saisie `quantite_retournee_conforme` + `quantite_retournee_rebut` + décision.
- **Analyse performance ST** :
  - Taux 2ème choix par sous-traitant (seuils 5 % vert / 7 % orange / >7 % rouge).
  - Délai moyen respecté vs promis.
  - Coût moyen par prestation type.
  - Répartition types défauts par ST (aide à la sanction / rupture contrat).
- **Litiges** : liste des dossiers ouverts (rebut anormal, perte, retard chronique).

**Actions** :

- Préparer bon de sortie sous-traitant (article + quantité + date retour prévue + prix accord).
- Réceptionner retour → contrôle rapide → validation ou litige.
- Ouvrir un litige (formulaire : type, quantité, coût, preuves photos).
- Facturation ST (pré-remplir facture fournisseur — voir Phase Achats).

**Ne voit pas** : prix de vente client, commissions. Voit : prix de reviens MP consommée, coût prestation ST.

### 6.13 Écran Planification & Suivis (module central — accessible CHEF_PRODUCTION + ADMIN)

Écran de planification opérationnelle — distinct des dashboards role (c'est un **outil de pilotage** partagé).

**Vue principale — Gantt drag-and-drop** :

- Axe horizontal : jours ouvrés (semaine par défaut, zoom mois possible).
- Axe vertical : machines (M2301, M2302…), regroupées par atelier/parc.
- Blocs = OF planifiés, colorés par priorité (rouge = urgent, orange = haut, gris = normal). Complément tissage = jaune vif avec pastille `.1`.
- **Contraintes vérifiées à chaque drag** :
  - Compatibilité laize machine ↔ laize article.
  - Nb couleurs OF ≤ nb sélecteurs machine.
  - MP disponible aux dates prévues (sinon warning "MP manquante à J+2, attribuer transferts ?").
  - Machine en panne → blocage drop, message d'erreur.
- Au moment du drop → modal **Attribution QR MP** : cases à cocher pour chaque sélecteur × entrepôt où sont les bobines suggérées → l'utilisateur valide → attribution `of_consommations.id_lot` réservée.

**Panneau latéral gauche — File d'attente** :

- OF à planifier (statut `brouillon` ou `planifie` sans machine assignée).
- Trié par : priorité DESC, date livraison ASC.
- Filtres : article, catégorie, priorité, période.

**Panneau bas — Suivis temps réel** :

- Onglet "OF en cours" : temps écoulé vs prévu, cadence temps réel, progression étape courante.
- Onglet "OF en retard" : pourquoi (arrêt machine, attente MP, blocage QC…).
- Onglet "Incidents ouverts" : liste incidents déclarés par tisseurs, en attente résolution.

**Actions rapides** :

- Créer OF (bouton).
- Déplacer OF (drag).
- Réaffecter opérateur (dropdown).
- Notifier magasinier MP qu'un OF est planifié (auto sinon manuel).

### 6.9 Dashboard Admin

Vue globale : tous les KPIs, tous les documents, gestion des utilisateurs, grilles tarifaires, commissions, paramètres société.

**L'admin voit tout** — pas d'onglets Commercial / Magasinier Prépa / Magasinier Stock / Chef Production / Ateliers / QC / Mécanicien séparés dans son menu (il accède à ces vues via une bascule "Voir en tant que…" si besoin d'audit).

---

## 7. Conformité fiscale par pays

### 7.1 Tunisie (`TN`) — pays par défaut

- Requis : `matricule_fiscal` sur toute société.
- TVA : 19 % (standard), 13 %, 7 %, 0 %.
- Factures : numérotation continue annuelle `FAC-YYYY-NNNNNN`.
- Timbre fiscal : 1 TND à générer.

### 7.2 France (`FR`)

- Requis pour société : `siret` (14 chiffres) ET `numero_tva_intracom` (`FR` + 11 chiffres).
- Particulier : pas de champ fiscal requis.
- TVA : 20 % standard, 10 %, 5,5 %, 2,1 %.
- B2B intra-UE (client FR société avec TVA valide) : **facturation HT sans TVA** + mention "Autoliquidation — Art. 283-2 du CGI".
- B2C FR : TVA française appliquée.

### 7.3 Autres UE

- Requis pour société : `numero_tva_intracom`.
- Validation format côté frontend, validation VIES optionnelle (Phase 3+).
- B2B avec TVA intracom valide : HT sans TVA + mention "Reverse charge — Art. 138 EU VAT Directive".

### 7.4 Export hors UE

- Sans TVA. Mention "Exportation exonérée".
- Documents douaniers hors périmètre Phase 3.

### 7.5 Règle automatique

La règle TVA est **dérivée** de `pays` + `type_compte` + `numero_tva_intracom`. Fonction `computeTvaRule(compte, article)` centralise cette logique.

---

## 8. Communications (transactionnel + marketing)

### 8.1 Transactionnel — envoi de document

Chaque document a un bouton **"Envoyer"** ouvrant un modal :

- Canal : `email` / `whatsapp` / `telegram`
- Expéditeur : **l'utilisateur connecté** (chaque utilisateur a sa propre config email/WhatsApp — voir §8.4)
- Destinataire : contact `est_principal=true`, éditable
- Message : template avec variables (`<client_nom>`, `<numero_doc>`, `<montant>`, `<echeance>`)
- PJ : PDF du document

Backend : service `communicationService.envoyer({user_id, doc_type, doc_id, canal, ...})` — récupère la config perso de l'utilisateur puis :

- Email → SMTP perso de l'utilisateur (ou SMTP société par défaut si non configuré).
- WhatsApp → **compte WhatsApp Business perso de l'utilisateur** (chacun peut avoir son numéro), avec template approuvé Meta. Fallback : lien `wa.me/<num>?text=<msg>` qui ouvre le WhatsApp du commercial.
- Telegram → Bot API officiel (partagé société).

Chaque envoi crée une `interaction` avec `id_utilisateur = <expéditeur>`.

### 8.4 Configuration email/WhatsApp par utilisateur

Chaque utilisateur peut brancher son propre compte email et son propre WhatsApp Business — les documents partent alors de son adresse et son numéro, pas d'un compte générique société.

`utilisateur_config_email` :

| Colonne | Type | Note |
|---|---|---|
| `id_utilisateur` | FK PK | 1-1 |
| `email_expediteur` | varchar(150) | ex `salima@laplume.tn` |
| `nom_expediteur` | varchar(100) | ex "Salima — La Plume" |
| `smtp_host` | varchar(150) | ex `smtp.gmail.com` |
| `smtp_port` | int | |
| `smtp_user` | varchar(150) | |
| `smtp_password_encrypted` | text | chiffré |
| `smtp_secure` | bool | TLS |
| `signature_html` | text | signature auto en pied de mail |
| `actif` | bool | |
| `date_dernier_test` | timestamp | dernier test de connexion réussi |

`utilisateur_config_whatsapp` :

| Colonne | Type | Note |
|---|---|---|
| `id_utilisateur` | FK PK | 1-1 |
| `mode` | enum | `business_api` (Meta officiel) / `lien_wa_me` (fallback simple) |
| `numero_whatsapp` | varchar(30) | E.164 |
| `wa_phone_id` | varchar(100) | Meta Business — id du numéro |
| `wa_token_encrypted` | text | Meta Business — token API |
| `wa_business_account_id` | varchar(100) | |
| `template_defaut` | varchar(80) | template Meta approuvé par défaut |
| `actif` | bool | |
| `date_dernier_test` | timestamp | |

**Fallback** : si un utilisateur n'a pas configuré son email ou son WhatsApp, on utilise la config société (§11) — ADMIN décide via `parametres_societe.smtp_defaut` et `parametres_societe.whatsapp_defaut`.

Écran "Mon compte" pour chaque utilisateur (accessible depuis avatar en haut à droite) permet de renseigner ces credentials.

### 8.2 Marketing — campagnes de masse

`campagnes_marketing` :

| Colonne | Type | Note |
|---|---|---|
| `id_campagne` | serial PK | |
| `nom` | varchar(200) | |
| `type` | enum | `newsletter` / `lancement_produit` / `promo` / `relance` |
| `canal` | enum | `email` / `whatsapp` / `telegram` / `multi` |
| `sujet` | varchar(200) | si email |
| `contenu_html` | text | template |
| `id_segment` | FK segments_clients | |
| `date_planifiee` | timestamp | |
| `statut` | enum | `brouillon` / `planifiee` / `en_cours` / `envoyee` / `annulee` |
| `stats_envoyes` / `stats_ouverts` / `stats_clics` | int | |

`segments_clients` : requête sauvegardée (statut, pays, grille tarif, tag, dernière commande...).

**Légal** :

- Opt-in obligatoire (`consent_marketing_*` sur `comptes`).
- Lien de désinscription obligatoire dans chaque email.
- WhatsApp Business : templates approuvés uniquement hors fenêtre 24 h.

### 8.3 Comptes marketing externes (sites, réseaux sociaux, publicité)

Pour piloter les campagnes multi-canal et récupérer les stats (impressions, clics, leads), on connecte les comptes externes.

`comptes_marketing_externes` :

| Colonne | Type | Note |
|---|---|---|
| `id_compte_externe` | serial PK | |
| `type` | enum | `site_web` / `facebook_page` / `instagram` / `tiktok` / `linkedin` / `youtube` / `pinterest` / `google_business` / `google_ads` / `meta_ads` / `tiktok_ads` / `google_analytics` / `google_search_console` / `mailchimp` / `sendgrid` |
| `libelle` | varchar(150) | ex "Page FB All By Fouta" |
| `url` | varchar(500) | url publique du compte / site |
| `identifiant_externe` | varchar(200) | ID Facebook page, ID GA4, tag GTM... |
| `oauth_token_encrypted` | text | pour APIs qui l'exigent |
| `api_key_encrypted` | text | pour clés simples |
| `refresh_token_encrypted` | text | |
| `date_expiration_token` | timestamp | |
| `metadata_json` | jsonb | infos spécifiques au type (property_id, ad_account_id...) |
| `actif` | bool | |
| `date_derniere_sync` | timestamp | |

**Cas d'usage** :

- **Sites web** : lien vers catalogue synchronisé (§4.3) — traçage des ventes issues du site.
- **Réseaux sociaux** (Facebook, Instagram, TikTok, LinkedIn) : publication de campagnes de lancement produit + récupération des leads (formulaires Facebook Lead Ads → alimentent `leads` §2.4).
- **Google Ads / Meta Ads / TikTok Ads** : lancement, budget, remontée des stats de campagne dans `campagnes_marketing.stats_*`.
- **Google Analytics / Search Console** : suivi trafic sites vers pages produit, mesure du SEO article (§4.5).
- **Mailchimp / SendGrid** : envoi de campagnes email de masse via ESP dédié (recommandé au-delà de ~500 destinataires — dépasse SMTP).

**Endpoints** :

```
GET|POST|PUT|DELETE  /api/comptes-marketing-externes/:id?  (ADMIN)
POST /api/comptes-marketing-externes/:id/oauth-connect     — lance flow OAuth
POST /api/comptes-marketing-externes/:id/test              — test connexion
POST /api/comptes-marketing-externes/:id/sync              — pull stats / leads
```

**Job de synchronisation** planifié : quotidien pour stats ads, temps réel (webhook) pour leads Facebook.

---

## 9. Menu — ce qui reste visible

```
Accueil
├─ CRM & Clients
│    ├─ Comptes (clients + prospects)
│    ├─ Leads
│    ├─ Contacts
│    └─ Interactions
├─ Produits
│    ├─ Modèles
│    ├─ Articles (variantes)
│    ├─ Catalogues
│    └─ SEO produits web
├─ Fabrication                     (Phase 2.7)
│    ├─ BOM (nomenclatures)
│    ├─ Gammes
│    ├─ Postes de travail
│    ├─ Machines
│    │    └─ Maintenance
│    ├─ Ordres de fabrication (OF)
│    ├─ Planning atelier            (Gantt)
│    ├─ Suivi temps réel
│    ├─ Contrôle qualité
│    ├─ Sous-traitance
│    └─ Analyse des coûts
├─ Stock
│    ├─ Entrepôts
│    ├─ Vue par catégorie
│    │    ├─ Produits finis
│    │    ├─ Produits semi-finis
│    │    ├─ Matières premières
│    │    ├─ Fournitures fabrication
│    │    ├─ Fournitures bureau
│    │    └─ Emballage
│    ├─ Mouvements
│    │    ├─ Réceptions
│    │    ├─ Sorties
│    │    └─ Transferts
│    ├─ Réservations
│    ├─ Lots & traçabilité
│    ├─ Inventaires
│    └─ Alertes stock
├─ Ventes
│    ├─ Devis
│    ├─ Commandes
│    ├─ Bons de livraison
│    ├─ Liste de colisage
│    ├─ Palettes
│    ├─ Suivi transporteurs
│    ├─ Factures                  ← ADMIN only
│    ├─ Paiements & Échéances     ← ADMIN (saisie) / COMMERCIAL (suivi ses clients)
│    ├─ Relances                  ← ADMIN + COMMERCIAL (ses clients)
│    ├─ Avoirs                    ← ADMIN only
│    └─ Bons de retour
├─ Marketing                       ← ADMIN
│    ├─ Campagnes
│    ├─ Segments
│    ├─ Comptes externes           (sites, réseaux sociaux, ads)
│    └─ Stats & performance
├─ Dashboards
│    ├─ Admin                      (ADMIN uniquement)
│    ├─ Commercial                 (COMMERCIAL uniquement)
│    ├─ Magasinier Préparation     (MAGASINIER_PREPARATION uniquement)
│    ├─ Magasinier Stock           (MAGASINIER_STOCK uniquement)
│    ├─ Chef Production            (CHEF_PRODUCTION uniquement)
│    ├─ Tisseur / Coupeur          (tablette — TISSEUR / COUPEUR)
│    ├─ Contrôle Qualité           (CONTROLEUR_QUALITE uniquement)
│    └─ Mécanicien / Maintenance   (MECANICIEN uniquement)
├─ Mon compte                      (tous rôles — sa config perso)
│    ├─ Profil
│    ├─ Paramètre Email            (SMTP perso — §8.4)
│    └─ Paramètre WhatsApp         (WA Business perso — §8.4)
└─ Paramètres                      ← ADMIN
     ├─ Paramètre Société          (§11)
     ├─ Paramètre CRM              (sources leads, canaux, statuts)
     ├─ Paramètre Produits         (dimensions, couleurs, finitions, tissages — CRUD)
     ├─ Paramètre Vente            (grilles tarifaires, tarifs transport, conditions paiement, échéances, relances)
     ├─ Paramètre Stock             (entrepôts, seuils alerte, types stock, valorisation PMP/FIFO)
     ├─ Paramètre Fabrication      (gammes types, postes, taux horaires MO, frais fixes atelier, règles ratière)
     ├─ Paramètre Transporteurs    (transporteurs + credentials API)
     ├─ Paramètre Commissions      (taux par commercial, grilles)
     ├─ Paramètre Communication    (templates email/WhatsApp/Telegram, SMTP société défaut, WA Business société défaut, bot Telegram)
     ├─ Paramètre Marketing        (comptes externes — sites, RS, ads — §8.3)
     ├─ Paramètre Pays & TVA
     └─ Paramètre Utilisateurs & rôles
```

Tout le reste (RH, sous-traitants, maintenance, planning, Gantt, IA, e-commerce direct, dashboards atelier, tablettes, TimeMoto, portail client) : **masqué**.

---

## 10. Ordre d'exécution

1. **Contrat validé** (ce document).
2. **Cadre technique** : renommer `id_modeles` → `id_modele`, normaliser l'enveloppe API, masquer le menu hors périmètre.
3. **Phase 1** — CRM & Clients (comptes, contacts, adresses, leads, interactions, grilles tarif).
4. **Phase 2** — Modèles & articles (variant matrix, détection doublons, image article, EAN, poids/dim) + Catalogues + SEO web + Photos multi.
5. **Phase 2.5** — Stock & Entrepôts : entrepôts, catégories (PF/SF/MP/fournitures/emballage), mouvements (réception/sortie/transfert), lots, réservations, inventaires, alertes, Dashboard Magasinier Stock.
6. **Phase 2.7** — Fabrication : BOM, gammes, postes, machines, OF, suivi opérateurs (tablette), contrôle qualité, sous-traitance, planning Gantt, coûts, Dashboards Chef Prod / Tisseur / Coupeur / QC / Mécanicien.
7. **Phase 3** — Ventes core : Devis → Commande (avec réservation stock + création OF si non-en-stock) → BL → Facture. Livraison croisée. RBAC. Envoi transactionnel.
8. **Phase 3.1** — Liste de colisage + Palettes + Transporteurs + Suivi API.
9. **Phase 3.5** — Dashboard Commercial (avec commissions) + Dashboard Magasinier Préparation.
10. **Phase 4** — Marketing (campagnes + segments).
11. Rouverture progressive des autres modules si besoin métier.

À chaque phase :

- Écran fonctionne bout-en-bout dans le navigateur avant de passer à la suivante.
- Tests curl documentés dans `docs/tests.md`.
- Changelog mis à jour.

---

## 11. Paramètre Société

Les informations société apparaissent sur **tous les documents** (devis, factures, BL, avoirs...), alimentent l'en-tête PDF, le site web et les templates emails.

`parametres_societe` (ligne unique — enregistrement singleton) :

| Colonne | Type | Note |
|---|---|---|
| `id_societe` | serial PK | 1 par défaut (multi-société hors périmètre Phase 1) |
| `raison_sociale` | varchar(200) | |
| `forme_juridique` | varchar(50) | `SARL`, `SA`, `SUARL`, `EI`... |
| `capital_social` | numeric(14,3) | |
| `devise_capital` | char(3) | |
| `matricule_fiscal` | varchar(50) | Tunisie |
| `code_tva` | varchar(30) | numéro TVA |
| `rc` | varchar(50) | Registre du commerce |
| `logo_url` | varchar(500) | logo pour PDF / site |
| `site_web` | varchar(200) | |
| `email_contact` | varchar(150) | |
| `telephone_contact` | varchar(30) | |
| `whatsapp_contact` | varchar(30) | |
| `mentions_legales_pdf` | text | pied de page des PDF |
| `conditions_generales_vente` | text | CGV (annexe des devis/factures) |

`societe_adresses` (plusieurs adresses possibles) :

| Colonne | Type | Note |
|---|---|---|
| `id_adresse` | serial PK | |
| `type` | enum | `siege_social` / `usine` / `depot` / `bureau_commercial` |
| `libelle` | varchar(100) | |
| `rue` / `complement` / `code_postal` / `ville` / `region` / `pays` | | |
| `est_principale` | bool | 1 seule principale (affichée sur documents) |

`societe_bancaires` (plusieurs comptes possibles) :

| Colonne | Type | Note |
|---|---|---|
| `id_bancaire` | serial PK | |
| `libelle` | varchar(100) | "Compte principal TND", "Compte export EUR"... |
| `banque` | varchar(150) | |
| `agence` | varchar(150) | |
| `rib` | varchar(30) | |
| `iban` | varchar(40) | |
| `bic_swift` | varchar(15) | |
| `devise` | char(3) | |
| `est_defaut` | bool | compte affiché par défaut sur factures |
| `actif` | bool | |

Endpoints :

```
GET  /api/parametres/societe            — singleton + adresses + bancaires
PUT  /api/parametres/societe            — MAJ singleton
GET|POST|PUT|DELETE  /api/parametres/societe/adresses/:id
GET|POST|PUT|DELETE  /api/parametres/societe/bancaires/:id
POST /api/parametres/societe/logo       — upload logo (multipart)
```

---

## Changelog

- `2026-09-22` — v1.0. Création du document. Périmètre CRM + Produits + Ventes fixé.
- `2026-09-23` — v1.10. Enrichissement dashboards + qualité + pièces rechange :
  - §1.4 : ajout des rôles `CHEF_ATELIER`, `MAGASINIER_SOUSTRAITANTS`.
  - §4bis.0 : ajout catégorie **`piece_rechange`** (courroies, cames ratière, roulements, cartes électroniques, aiguilles Dornier, cordes satin).
  - §4ter.3 : poste `PREPARATION_MP` ajouté à la liste standard (piloté par MAGASINIER_MP).
  - §4ter.4quater **nouveau** : concept de **complément de fabrication** (sous-OF `.1`) — quand qté 1er choix < qté commandée, création auto d'un sous-OF avec priorité urgente et ordre planification 0. Peut être refusé par le TISSEUR avec motif. Colonnes ajoutées sur `ordres_fabrication` : `id_of_parent`, `type_of`, `motif_refus_complement`.
  - §4ter.4quinquies **nouveau** : catégorisation **qualité 1er choix / 2ème choix / Ourlet / Déchet**. Extension `controles_qualite` avec `qte_premier_choix`, `qte_second_choix`, `qte_ourlet`, `qte_rebut`, `type_defaut` (tache/couture/fil_casse/dimension/couleur/frange/autre), `decision`. Colonne `qualite` sur `articles` (premier_choix / second_choix) — les seconds choix exposés uniquement sur catalogue "Outlet".
  - §4ter.4ter **nouveau** : Attribution MP (auto FIFO ou proximité colorimétrique + réattribution manuelle) puis Préparation MP physique (scan QR bobines, vérification cohérence, transfert vers poste tissage). 
  - §5.2bis **nouveau** : transformation ligne commande → OF. Analyse stock automatique, écran "Aperçu OF" avec plan par ligne (qte_stock / qte_of_existants / qte_a_fabriquer), regroupement multi-lignes, choix priorité et date. Drill-down commercial de la commande vers l'OF vers le poste de travail.
  - §6.6 Tisseur enrichi : kit MP reçu (8 sélecteurs), compteur duites machine, boutons pointage détaillé (Pause avec motif).
  - §6.6bis **nouveau** : Dashboard Coupeur / Post-Coupe distinct.
  - §6.8 Mécanicien **complètement réécrit** : plan de maintenance préventive (fréquence heures/duites/calendrier, pièces nécessaires, procédure PDF), interventions curatives/préventives avec pièces consommées et coût, KPI MTBF/MTTR/dispo, lien stock pièces détachées.
  - §6.10 **nouveau** : Dashboard Magasinier MP — file OF, scan QR bobines par sélecteur, contrôle cohérence, transfert vers tissage, alertes rupture MP.
  - §6.11 **nouveau** : Dashboard Chef d'Atelier — onglets Par Opération / Par Commande (drill-down commande→article→numSuivi→matrice opérations) / Alertes / Maintenance / Analyse 2ème choix.
  - §6.12 **nouveau** : Dashboard Magasinier Sous-Traitants — sorties, en cours ST, retours, analyse perf ST (taux 2ème choix, délai, coût), litiges.
  - §6.13 **nouveau** : Écran Planification & Suivis (Gantt drag-drop machines×créneaux, contraintes auto laize/couleurs/MP, modal Attribution QR MP au drop, panneaux latéral file d'attente + bas OF en cours/retard/incidents).
- `2026-09-23` — v1.9. Parité BOM legacy Google Apps + Préparation MP :
  - §4ter.4 : "Fiche OF" clarifiée — l'OF fige 4 choses au démarrage : gamme (postes) + BOM MP + fournitures/emballage + affectations planning. Écran chef prod à 4 onglets (Article, Postes à faire, BOM MP, Fournitures & emballage).
  - §4ter.4 : `of_consommations_mp` renommé `of_consommations` — couvre MP + fournitures + emballage + étiquettes via `role` enum (chaîne / trame / fourniture / emballage / etiquette). Ajout `numero_selecteur` (1-8) pour aligner sur les sélecteurs machine.
  - §4ter.4bis **nouvelle section** : parité fonctionnelle avec le fichier legacy `BOM 2025-2026.xlsx` feuille `Base Commandes` (84 colonnes). Structure à 8 sélecteurs (S01→S08) documentée. Mapping colonne legacy ↔ colonne nouvelle. Champs tissage ajoutés sur `ordres_fabrication` : `id_machine_prevue`, `temps_production_prevu_sec`, `compteur_machine_affichage`, `largeur_tissu_cm`, `longueur_tissu_m`, `metrage_fil_chaine_m`, `duite_par_cm`, `nb_duites_total_production`, `qr_mp_final`. États multi-phase séparés : `etat_preparation_mp`, `etat_tissage`, `etat_coupe`.
  - §4ter.4bis : concept "2ème fabrication" — étape post-tissage (frange/ourlet/lavage), soit modélisée sur un OF unique via flag `est_deuxieme_passe` sur `of_etapes`, soit via un OF secondaire consommant un SF (à trancher).
  - §4ter.4bis : poste `PREPARATION_MP` ajouté à la liste standard §4ter.3 + rôle dédié `MAGASINIER_MP` (§1.4) — prépare les kits MP par sélecteur avant tissage.
  - §4ter.4bis : rôle Planification clarifié — assignation machine × créneaux, vérification contraintes (laize, nb couleurs, MP dispo), séquencement automatique Prep MP → Tissage → Coupe → 2ᵉ passe.
- `2026-09-23` — v1.8. Ajout poste Étiquetage :
  - §4ter.3 : ajout du poste `ETIQUETAGE` (finition) — étiquettes tissées cousues, autocollantes, carton papier, code-barres/EAN. Note : peut être fusionné avec Couture ou Ourlet selon organisation.
- `2026-09-23` — v1.7. Postes atelier explicités :
  - §4ter.3 : colonnes `categorie` + `taux_horaire_mo` ajoutées à `postes_travail`.
  - §4ter.3 : **liste standard de 18 postes fouta** (seed initial) — Bobinage, Ourdissage, Encollage, Nouage chaîne, Tissage, Coupe, Post-coupe Frange/Ourlet/Couture, Impression, Broderie, Lavage, Repassage, Contrôle qualité, Pliage, Emballage unitaire, Atelier préparation commandes, Expédition — chacun avec catégorie + sous-type gamme + rôle métier.
  - §4ter.3 : **clarification** de la distinction entre "Ateliers de fabrication" (machines production, pilotés par CHEF_PRODUCTION + opérateurs) et "Atelier de préparation commandes" (zone logistique aval, entrepôt type `atelier_preparation`, piloté par MAGASINIER_PREPARATION).
- `2026-09-23` — v1.6. Phase 2.7 Fabrication :
  - §1.4 nouveaux rôles : `CHEF_PRODUCTION`, `TISSEUR`, `COUPEUR`, `CONTROLEUR_QUALITE`, `MECANICIEN`.
  - §4ter **nouveau chapitre complet** — 12 sous-sections :
    - 4ter.0 Vocabulaire (BOM, gamme, poste, machine, OF, étape, ratière, sélecteur couleur).
    - 4ter.1 `bom` + `bom_lignes` (nomenclature versionnée par article, avec rôles chaîne/trame/fourniture/emballage et remplacements possibles).
    - 4ter.2 `gammes` + `gamme_etapes` (séquence type par catégorie, config bloquante/QC/sous-traitance).
    - 4ter.3 `postes_travail` + `machines` (Dornier, ratière, sélecteur couleur, laize, nb fils, cadence, état).
    - 4ter.4 `ordres_fabrication` + `of_etapes` + `of_consommations_mp` (BOM figée + gamme copiée, cout théorique/réel, lot produit).
    - 4ter.5 `of_pointages` (suivi temps réel opérateurs avec type_event début/pause/reprise/fin/panne + machine + quantité).
    - 4ter.6 `controles_qualite` (par étape ou global, mesures json, photos, action laisser passer/rework/rebut, blocage OF).
    - 4ter.7 Sous-traitance (extension `soustraitants` + `of_sous_traitance` avec bons de sortie/retour + interaction stock via entrepôt virtuel sous-traitant).
    - 4ter.8 Planning atelier (Gantt drag-drop, contraintes machine, `planning_slots`).
    - 4ter.9 Coûts (formule MP+MO+ST+frais fixes, `of_couts` snapshot, alimente rétroactivement `articles.prix_reviens`).
    - 4ter.10 Cycle de vie OF (BROUILLON → PLANIFIE → EN_ATTENTE_MP → EN_COURS → PRET → TERMINE → CLÔTURÉ).
    - 4ter.11 Endpoints (BOM, gammes, machines, OF, contrôles, sous-traitance, planning, coûts).
    - 4ter.12 Impacts sur autres phases (mouvements stock, création OF depuis commande, magasinier prépa voit avancement, notifications blocage).
  - §6.5 nouveau Dashboard **Chef de Production** : KPI atelier, planning Gantt, OF à planifier / en cours / bloqués.
  - §6.6 nouveaux Dashboards **Opérateurs (Tisseur / Coupeur)** — tablette : mes OF, scan QR MP, boutons pointage, saisie défauts.
  - §6.7 nouveau Dashboard **Contrôleur Qualité** : contrôles à faire, saisie mesures + photos + action, historique défauts.
  - §6.8 nouveau Dashboard **Mécanicien / Maintenance** : état machines, alertes préventives, interventions, MTBF/MTTR.
  - §6.9 Dashboard Admin renuméroté.
  - §9 menu : nouvelle branche "Fabrication" (BOM, Gammes, Postes, Machines+Maintenance, OF, Planning, Suivi temps réel, Contrôle qualité, Sous-traitance, Analyse coûts) + Dashboards ateliers (Chef Prod / Tisseur-Coupeur / QC / Mécanicien) + Paramètre Fabrication.
  - §10 ordre d'exécution : Phase 2.7 insérée entre Stock (2.5) et Ventes (3).
- `2026-09-23` — v1.5. Unification MP dans le modèle Modèle → Articles :
  - §4bis.0.1 **réécrit** — les MP réutilisent les tables `modeles` + `articles`. Pas de table `matieres_premieres` séparée.
  - `modeles.type_produit` ajouté (`produit_fini` / `semi_fini` / `matiere_premiere` / `fourniture_fabrication` / `fourniture_bureau` / `emballage`).
  - `modeles.format_ref_commerciale` + `.format_ref_fabrication` — template configurable par modèle (défaut par type_produit).
  - Types d'attributs élargis : ajout `numero_metrique`, `composition`, `torsion`, `grammage` avec leurs tables `parametres_*` dédiées.
  - Format ref MP : `<CODE_NUM_METRIQUE>-<CODE_COULEUR><SUFFIXE>` (ex `NM15-01.00`) — issu du BOM existant.
  - Colonnes `articles` additionnelles utiles MP : `qr_code`, `id_fournisseur_defaut`, `prix_moyen_pondere_kg`.
  - §4bis.0.2 **nouveau** — **lot obligatoire** pour tout article MP en stock. Champs additionnels sur `lots_articles` (numéro lot fournisseur, id_fournisseur, date_reception, certificat_conformite, couleur mesurée, poids bobine). Chaque `stock_article_entrepot` d'un MP a `id_lot NOT NULL`. Mouvements MP portent obligatoirement `id_lot`. Écran vue par lot dans Dashboard Magasinier Stock.
- `2026-09-23` — v1.4. Ajout Phase 2.5 Stock & Entrepôts :
  - §4bis **nouveau chapitre** complet :
    - 4bis.0 : 5 catégories de stock — Produits finis, Semi-finis, Matières premières (schéma dédié §4bis.0.1 avec numéro métrique + code fabrication issu du BOM Excel), Fournitures fabrication, Fournitures bureau, Emballage.
    - 4bis.1 `entrepots` : type (usine / principal / atelier_preparation / magasin_vente / hub_transit / sous_traitant).
    - 4bis.2 `emplacements` (subdivision facultative).
    - 4bis.3 `stock_article_entrepot` : dénormalisé (dispo / réservé / en réception / total).
    - 4bis.4 `mouvements_stock` : 3 grands types UI (Réception, Sortie, Transfert) + 10 sous-types (reception_fournisseur, entree_fabrication, sortie_vente, transfert_entrepot, reservation, liberation_reservation, ajustement_+/−, retour_client, mise_au_rebut). Immuable, transactionnel.
    - 4bis.5 `lots_articles` : traçabilité par lot fabrication.
    - 4bis.6 `reservations_stock` : commande validée → réservation auto → sortie à l'expédition.
    - 4bis.7 `inventaires` + `inventaire_lignes` : comptage + génération ajustements à clôture.
    - 4bis.8 **workflow UI demandé** : Entrepôts → Vue Entrepôt → Vue Article → historique mouvements + par lot.
    - 4bis.9 alertes stock bas (job cron).
    - 4bis.10 endpoints complets.
    - 4bis.11 impacts sur §4.4 (`stock_total` = vue agrégée), §5.2 (réservation auto), §5.6 (scan colisage crée mouvement), §6.2 (transfert magasinier prépa).
  - §1.4 nouveau rôle `MAGASINIER_STOCK` (distinct de MAGASINIER_PREPARATION).
  - §6.3 **nouveau Dashboard Magasinier Stock** : KPI stock, 3 onglets Réceptions / Sorties / Transferts, filtres par catégorie et entrepôt, écran inventaire, alertes. Ne voit pas les prix de vente ni commissions mais voit prix de reviens et valorisation.
  - §6.4 renuméroté Dashboard Admin.
  - §9 menu réorganisé : nouvelle branche "Stock" avec sous-menus (Entrepôts, Vue par catégorie, Mouvements ×3, Réservations, Lots, Inventaires, Alertes) + branche "Dashboards" enrichie de Magasinier Stock. Ajout "Paramètre Stock".
  - §10 ordre d'exécution : Phase 2.5 insérée entre Produits et Ventes.
- `2026-09-23` — v1.3. 3ème passe retours utilisateur :
  - §4.4 : **règles de génération des refs réécrites d'après les 1531 articles réels** (`docs/references/references_articles.csv`) :
    - `ref_commerciale` : `<CODE_MODELE><DIM4>-<LETTRE_NB_COULEURS><COULEUR2>-<NUANCE2>[-<CODES_ADD>]` (ex `AR1020-B02-03`, `BA1020-C15-01-25`, `EPU0919-19`).
    - `ref_fabrication` : idem + tiret après lettre nb couleurs + codes couleurs de trame étendus (ex `AR1020-B-02-03`, `ST2020-S-15-07-17-06-18-03`).
    - Dimension = largeur+longueur en 2 chiffres chacun (`100/200` → `1020`, `90/190` → `0919`). Non-numérique : code alpha (ADU, KID).
    - Lettres nombre couleurs : B(2) T(3) Q(4) C(5) S(6). Absente si uni.
    - `code_article` = `ref_commerciale`, non modifiable après création.
    - Surcharge manuelle ADMIN autorisée pour ref_commerciale/ref_fabrication (utile cas matières spéciales `LuAr`, `lin`).
  - §4.4 : **EAN-13 + EAN-8** — auto-généré (préfixe GS1 société + compteur + check digit), modifiable manuellement. Config dans `parametres_ean`.
  - §4.4 : **poids et dimensions physiques** de l'article fini (`poids_net_g`, `poids_brut_g`, `longueur_cm`, `largeur_cm`, `hauteur_cm`, `volume_cm3`, `fragile`) → alimente calcul frais port, pesée colis auto, choix transporteur, poids volumétrique.
  - §4.2bis **nouvelle section** — table `photos` polymorphique pour 1-N photos par modele/article/catalogue avec `est_principale` + ordre + redimensionnement auto.
  - §4.1 / §4.3 / §4.4 : `image_url` remplacé par `image_url_principale` (dénormalisée depuis §4.2bis).
  - §4.3 : ajout `description` sur catalogue.
- `2026-09-23` — v1.2. 2ème passe retours utilisateur :
  - §4.4 : **3 références** définies (code_article technique / ref_fabrication atelier / ref_commerciale client) + règles de génération auto + surchargeable ADMIN.
  - §4.6 : endpoints CRUD explicites pour chaque type d'attribut (dimensions, couleurs, finitions, tissages, nombres-couleurs, personnalisations) — ADMIN peut ajouter/modifier les attributs.
  - §5.6 : format numero_colis corrigé avec tiret → `C<3chif>-<3chif>-<NNN>` (ex `C234-567-001`).
  - §5.10 **nouvelle section** Paiements & Échéances : tables `echeances`, `paiements`, `paiement_echeances`, `relances`. Job cron relances auto. Vue "État de compte client" filtrable. Endpoints paiements/relances/état-compte.
  - §6.1 : taux commission — par utilisateur ET surchargeable par grille tarifaire (double niveau).
  - §8.1 : envoi document part depuis **l'utilisateur connecté** (son email, son WhatsApp).
  - §8.3 **nouvelle section** Comptes marketing externes : sites, Facebook, Instagram, TikTok, LinkedIn, Google Ads, Meta Ads, GA, Search Console, Mailchimp, SendGrid — connecteurs OAuth + sync stats/leads.
  - §8.4 **nouvelle section** Configuration email/WhatsApp par utilisateur — tables `utilisateur_config_email`, `utilisateur_config_whatsapp`. Fallback config société.
  - §9 menu : ajout "Paiements & Échéances", "Relances", "Comptes externes marketing", "Stats & performance", "Mon compte" (config perso). "Paramètre Marketing" ajouté au bloc paramètres.
- `2026-09-23` — v1.1. Intégration des retours utilisateur :
  - Périmètre Phase 3 : ajout **Liste de colisage** + **Transporteur & suivi**.
  - §3.1 : précision — grilles tarifaires extensibles et attribuables par client.
  - §4.1 : **suppression** des colonnes `prix_reviens_base` / `prix_vente_base` du modèle (les prix vivent sur `articles`).
  - §4.3 : **nouvelle section** `catalogues` + `article_catalogues` (regroupement + sync web type Shopify/WooCommerce, ex ALL BY FOUTA).
  - §4.4 : ajout `image_url` par article.
  - §4.5 : **nouvelle section** `article_seo` pour référencement web.
  - §5.5 : **nouvelle section** frais de port (ligne à part, hors HT article — base de commission).
  - §5.6 : **nouvelle section** liste de colisage (numéro `C<3chif_client><3chif_cmd>-<NNN>`, scan article, photo colis).
  - §5.7 : **nouvelle section** palettes + transporteurs (Vectorys, Dachser, Germanetti, GLS, Besson, Mazet, Colissimo…) + suivi API.
  - §5.8 : endpoints ventes complétés (colisage, palettes, transporteurs, tarifs transport).
  - §6.1 : Dashboard Commercial enrichi — création client/contact, compte de commissions (prévue / réelle / versée / restant), taux paramétrable.
  - §6.2 : renommé "Magasinier Préparation" ; champs visibles précisés (num client, dates, priorité, notes, état articles) ; workflow transfert entrepôt ; ne voit pas soldée/livrée ni prix.
  - §6.3 : Admin ne voit pas Dashboard Commercial / Magasinier en tant qu'onglets séparés dans son menu.
  - §9 : menu Paramètres réorganisé, chaque section nommée `Paramètre <domaine>` (uniformisation).
  - §11 : **nouvelle section** Paramètre Société (multi-adresses, multi-comptes bancaires, logo, capital, CGV…).
