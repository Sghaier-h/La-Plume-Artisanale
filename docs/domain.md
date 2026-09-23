# La Plume Artisanale — Contrat de domaine

Version : 1.1 · Statut : brouillon en validation

Ce document est la **source de vérité** pour le vocabulaire, les entités, les endpoints et les règles métier du projet.

Toute modification (ajout de champ, changement de règle, renommage d'endpoint) doit être ajoutée à la section [Changelog](#changelog) en bas — sinon elle n'existe pas.

Périmètre validé pour la remise à plat :

- **Phase 1** — CRM + Clients
- **Phase 2** — Produits (Modèle → Articles) + Catalogues web
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
| `image_url` | varchar(500) | photo générique du modèle |
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

### 4.3 `catalogues` et `article_catalogues`

Un **catalogue** est un regroupement d'articles publiable (interne, ou synchronisable vers un site web — ex : le catalogue *ALL BY FOUTA* se synchronise vers `allbyfouta.com`).

`catalogues` :

| Colonne | Type | Note |
|---|---|---|
| `id_catalogue` | serial PK | |
| `code` | varchar(50) unique | `ALLBYFOUTA`, `PRO`, `EXPORT_FR` |
| `libelle` | varchar(200) | |
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

| Colonne | Type | Note |
|---|---|---|
| `id_article` | serial PK | |
| `id_modele` | FK modeles | requis |
| `code_article` | varchar(50) unique | auto `<code_modele>-<D>-<C>-<F>` (ex `AR1020-B02-03`) |
| `designation` | varchar(300) | auto : `<libelle_modele> <dimension> <couleur>` |
| `image_url` | varchar(500) | photo spécifique de la variante |
| `id_dimension` | FK parametres_dimensions | |
| `id_couleur` | FK parametres_couleurs | |
| `id_finition` | FK parametres_finitions | |
| `id_tissage` | FK parametres_tissages | |
| `id_nombre_couleurs` | FK parametres_nombre_couleurs | |
| `id_personnalisation` | FK parametres_personnalisations | |
| `prix_reviens` | numeric(14,3) | coût de production de la variante |
| `prix_vente_ht` | numeric(14,3) | prix de base HT (surcharge par grille tarifaire) |
| `unite_vente` | varchar(10) | `pc`, `paire`, `kg` |
| `stock_total` | numeric(14,3) | maintenu par mouvements stock |
| `actif` | bool | |

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
```

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
| `numero_colis` | varchar(30) unique | **format `C<3 derniers chiffres id_client><3 derniers chiffres id_commande>-<NNN>`** (ex `C123456-001`) |
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
- **COMMERCIAL** : voit ses factures en lecture seule pour suivi paiement.

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

### 6.3 Dashboard Admin

Vue globale : tous les KPIs, tous les documents, gestion des utilisateurs, grilles tarifaires, commissions, paramètres société.

**L'admin voit tout** — pas d'onglets "Commercial" ou "Magasinier" séparés dans son menu (il accède à ces vues via une bascule "Voir en tant que…" si besoin d'audit).

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
- Destinataire : contact `est_principal=true`, éditable
- Message : template avec variables (`<client_nom>`, `<numero_doc>`, `<montant>`, `<echeance>`)
- PJ : PDF du document

Backend : service `communicationService.envoyer(...)` :

- Email → SMTP.
- WhatsApp → **Business API officielle** avec template approuvé. Fallback : lien `wa.me/<num>?text=<msg>`.
- Telegram → Bot API officiel.

Chaque envoi crée une `interaction`.

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
├─ Ventes
│    ├─ Devis
│    ├─ Commandes
│    ├─ Bons de livraison
│    ├─ Liste de colisage
│    ├─ Palettes
│    ├─ Suivi transporteurs
│    ├─ Factures                  ← ADMIN only
│    ├─ Avoirs                    ← ADMIN only
│    └─ Bons de retour
├─ Marketing                       ← ADMIN
│    ├─ Campagnes
│    └─ Segments
├─ Dashboards
│    ├─ Admin                      (ADMIN uniquement)
│    ├─ Commercial                 (COMMERCIAL uniquement)
│    └─ Magasinier Préparation     (MAGASINIER_PREPARATION uniquement)
└─ Paramètres                      ← ADMIN
     ├─ Paramètre Société          (§11)
     ├─ Paramètre CRM              (sources leads, canaux, statuts)
     ├─ Paramètre Produits         (dimensions, couleurs, finitions, tissages, ...)
     ├─ Paramètre Vente            (grilles tarifaires, tarifs transport, conditions paiement)
     ├─ Paramètre Transporteurs    (transporteurs + credentials API)
     ├─ Paramètre Commissions      (taux par commercial, grilles)
     ├─ Paramètre Communication    (templates email/WhatsApp/Telegram, SMTP, WA Business, bot Telegram)
     ├─ Paramètre Pays & TVA
     └─ Paramètre Utilisateurs & rôles
```

Tout le reste (RH, sous-traitants, maintenance, planning, Gantt, IA, e-commerce direct, dashboards atelier, tablettes, TimeMoto, portail client) : **masqué**.

---

## 10. Ordre d'exécution

1. **Contrat validé** (ce document).
2. **Cadre technique** : renommer `id_modeles` → `id_modele`, normaliser l'enveloppe API, masquer le menu hors périmètre.
3. **Phase 1** — CRM & Clients (comptes, contacts, adresses, leads, interactions, grilles tarif).
4. **Phase 2** — Modèles & articles (variant matrix, détection doublons, image article) + Catalogues + SEO web.
5. **Phase 3** — Ventes core : Devis → Commande → BL → Facture. Livraison croisée. RBAC. Envoi transactionnel.
6. **Phase 3.1** — Liste de colisage + Palettes + Transporteurs + Suivi API.
7. **Phase 3.5** — Dashboard Commercial (avec commissions) + Dashboard Magasinier Préparation.
8. **Phase 4** — Marketing (campagnes + segments).
9. Rouverture progressive des autres modules si besoin métier.

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
