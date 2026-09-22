# La Plume Artisanale — Contrat de domaine

Version : 1.0 · Statut : brouillon en validation

Ce document est la **source de vérité** pour le vocabulaire, les entités, les endpoints et les règles métier du projet.

Toute modification (ajout de champ, changement de règle, renommage d'endpoint) doit être ajoutée à la section [Changelog](#changelog) en bas — sinon elle n'existe pas.

Périmètre validé pour la remise à plat :
- Phase 1 — CRM + Clients
- Phase 2 — Produits (Modèle → Articles)
- Phase 3 — Ventes : Devis · Commande · BL (+ dashboard Magasinier) · Facture · Avoir · Bon de retour

Tout ce qui n'est pas dans ce périmètre est **masqué du menu** jusqu'à nouvel ordre.

---

## 1. Règles transverses

### 1.1 Nommage
- Une seule orthographe par identifiant : `id_client`, `id_modele`, `id_article`, `id_devis`, `id_commande`, `id_bl`, `id_facture`, `id_avoir`, `id_retour`. **Jamais** de pluriel (`id_modeles` interdit).
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
- `ADMIN` — voit tout, peut tout. Seul rôle habilité à **créer/valider une facture, un avoir**.
- `COMMERCIAL` — voit uniquement les comptes où `id_commercial = <lui>` et leurs documents. Peut créer/modifier **devis, commande, BL**. Ne peut **pas** créer de facture ni d'avoir.
- `MAGASINIER` — voit toutes les commandes validées, prépare les BL. Dashboard Magasinier dédié. Ne voit pas les prix.

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
| `code_client` | varchar(32) unique | auto-généré `CLI-YYYY-NNNN` |
| `type_compte` | enum | `societe` \| `particulier` |
| `statut_crm` | enum | `lead` \| `prospect` \| `client` \| `archive` |
| `raison_sociale` | varchar(200) | requis si `societe` |
| `nom` / `prenom` | varchar(100) | requis si `particulier` |
| `pays` | char(2) ISO | ex `TN`, `FR`, `DE` |
| `matricule_fiscal` | varchar(50) | Tunisie : MF. UE : voir §7 |
| `numero_tva_intracom` | varchar(20) | UE uniquement |
| `siret` | varchar(14) | FR uniquement |
| `id_grille_tarif` | FK grilles_tarif | tarification appliquée par défaut |
| `id_commercial` | FK utilisateurs | commercial référent (nullable pour ADMIN direct) |
| `source_lead` | varchar(50) | `email`, `pub_facebook`, `salon`, `referral`, `manual`, `import`... |
| `canal_prefere` | enum | `email` \| `whatsapp` \| `telegram` \| `telephone` |
| `notes` | text | |
| `actif` | bool | |
| `date_creation` / `cree_par` / `date_modification` / `modifie_par` | | |

**Règle** : un compte a **un seul** `id_commercial` référent. L'ADMIN peut réassigner à tout moment.

### 2.2 `contacts`
Une personne physique attachée à UN compte (pas de partage entre comptes en Phase 1 — révisable plus tard).

| Colonne | Type | Note |
|---|---|---|
| `id_contact` | serial PK | |
| `id_client` | FK comptes | requis, `ON DELETE CASCADE` |
| `role` | enum | `responsable` \| `acheteur` \| `commercial_client` \| `technique` \| `comptabilite` \| `autre` |
| `civilite` | enum | `M` \| `Mme` \| null |
| `nom` / `prenom` | varchar(100) | |
| `fonction` | varchar(100) | |
| `email` | varchar(150) | |
| `telephone` | varchar(30) | E.164 recommandé (`+21620...`) |
| `whatsapp` | varchar(30) | idem, pour envoi doc |
| `est_principal` | bool | un seul principal par compte |
| `actif` | bool | |

### 2.3 `adresses`
Un compte peut avoir N adresses. Une commande peut choisir une adresse de facturation ET une adresse de livraison différentes (voir §5.3).

| Colonne | Type | Note |
|---|---|---|
| `id_adresse` | serial PK | |
| `id_client` | FK comptes | |
| `libelle` | varchar(100) | `Siège`, `Entrepôt Sfax`, `Boutique Tunis`... |
| `type_adresse` | enum multi | `facturation` \| `livraison` \| `siege` (bitmask ou table pivot — au choix impl) |
| `rue` / `complement` / `code_postal` / `ville` / `region` / `pays` | | |
| `contact_livraison_nom` | varchar(150) | nom à afficher sur le BL, si différent du compte |
| `contact_livraison_telephone` | varchar(30) | |
| `est_defaut_facturation` / `est_defaut_livraison` | bool | 1 seul défaut par type par compte |

### 2.4 `leads` (funnel d'entrée)
Un lead brut capté depuis un canal. Devient un `compte.statut_crm='lead'` dès qualification.

| Colonne | Type | Note |
|---|---|---|
| `id_lead` | serial PK | |
| `canal` | enum | `email_reçu`, `formulaire_web`, `pub_facebook`, `pub_google`, `salon`, `whatsapp`, `telegram`, `telephone`, `referral` |
| `source_detail` | varchar(200) | ex : url landing, nom campagne, numéro salon |
| `nom_prospect` / `email` / `telephone` / `societe` | | libres, non normalisés |
| `message` | text | contenu du contact initial |
| `id_utilisateur_assigné` | FK utilisateurs | à qui traiter |
| `statut` | enum | `nouveau` \| `en_traitement` \| `converti` \| `perdu` |
| `id_client_converti` | FK comptes | rempli si `converti` |
| `motif_perte` | varchar(200) | si `perdu` |
| `date_capture` / `date_conversion` | | |

### 2.5 `interactions`
Traces CRM chronologiques (appels, emails, notes, RDV).

| Colonne | Type | Note |
|---|---|---|
| `id_interaction` | serial PK | |
| `id_client` | FK | nullable si attaché à un `id_lead` |
| `id_lead` | FK | nullable |
| `id_contact` | FK | qui a été contacté (optionnel) |
| `type` | enum | `appel_entrant` \| `appel_sortant` \| `email_recu` \| `email_envoye` \| `whatsapp` \| `telegram` \| `rdv` \| `note` |
| `sujet` / `contenu` | | |
| `direction` | enum | `entrant` \| `sortant` \| `interne` |
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
Conversion **automatique** lead → prospect à la création du 1er devis. Conversion **automatique** prospect → client au 1er devis accepté OU 1re commande. Un ADMIN/COMMERCIAL peut forcer un statut à tout moment.

---

## 3. Tarification

### 3.1 `grilles_tarif`
Grille tarifaire nommée (ex : "Particulier", "Grand compte", "Distributeur", "Export FR"). Configurable.

| Colonne | Type | Note |
|---|---|---|
| `id_grille` | serial PK | |
| `code` | varchar(30) unique | `PART`, `GC`, `DIST`, `EXP_FR` |
| `libelle` | varchar(100) | |
| `type` | enum | `remise_globale_pct` \| `prix_par_article` \| `palier_quantite` |
| `remise_pct` | numeric(5,2) | si `type='remise_globale_pct'` |
| `devise` | char(3) | |
| `taux_tva_defaut` | numeric(5,2) | 19 pour Tunisie, 0 pour export UE B2B, 20 pour France B2C... |
| `actif` | bool | |

### 3.2 `grille_tarif_lignes` (si `type='prix_par_article'` ou `palier_quantite`)
| Colonne | Type | Note |
|---|---|---|
| `id_ligne` | serial PK | |
| `id_grille` | FK | |
| `id_article` | FK | ou `id_modele` pour un prix modèle générique |
| `quantite_min` | int | pour paliers, défaut 1 |
| `prix_unitaire_ht` | numeric(14,3) | |
| `remise_pct` | numeric(5,2) | supplémentaire, optionnel |

### 3.3 Attribution
Chaque `compte.id_grille_tarif` pointe vers une grille. À la création d'un devis, le prix se calcule dans cet ordre :

1. Ligne spécifique dans `grille_tarif_lignes` pour cet article + cette grille + quantité ≥ palier → prend le prix.
2. Sinon : `article.prix_unitaire_ht_base × (1 - grille.remise_pct/100)`.
3. La TVA appliquée = `grille.taux_tva_defaut` sauf override manuel sur la ligne.

**ADMIN** peut créer/modifier/supprimer une grille. **COMMERCIAL** peut appliquer une grille existante à ses comptes, pas en créer.

---

## 4. Produits (Phase 2)

### 4.1 `modeles`
Le produit **parent**. Ex : "ARTHUR", "IBIZA". Porte les attributs disponibles pour ses variantes.

| Colonne | Type | Note |
|---|---|---|
| `id_modele` | serial PK | (⚠ renommer depuis `id_modeles`) |
| `code_modele` | varchar(30) unique | `AR`, `IB` — préfixe des articles |
| `libelle` | varchar(200) | |
| `description` | text | |
| `image_url` | varchar(500) | |
| `id_categorie` | FK categories_produits | ex Fouta, Serviette, Écharpe |
| `prix_reviens_base` | numeric(14,3) | pour marges |
| `prix_vente_base` | numeric(14,3) | référence avant grille |
| `actif` | bool | |

### 4.2 `modele_attributs`
Table pivot : quels attributs sont autorisés pour ce modèle.

| Colonne | Type | Note |
|---|---|---|
| `id` | serial PK | |
| `id_modele` | FK | |
| `type_attribut` | enum | `dimension` \| `couleur` \| `finition` \| `tissage` \| `nombre_couleurs` \| `personnalisation` |
| `id_valeur` | int | FK vers `parametres_<type>` |

### 4.3 `articles` (variantes concrètes)
Une combinaison unique d'attributs d'un modèle = un article sellable.
Table actuelle : `articles_catalogue` → **renommer** en `articles` pour cohérence.

| Colonne | Type | Note |
|---|---|---|
| `id_article` | serial PK | |
| `id_modele` | FK modeles | requis |
| `code_article` | varchar(50) unique | auto `<code_modele>-<D>-<C>-<F>` (ex `AR1020-B02-03`) |
| `designation` | varchar(300) | auto : `<libelle_modele> <dimension> <couleur>` |
| `id_dimension` | FK parametres_dimensions | |
| `id_couleur` | FK parametres_couleurs | |
| `id_finition` | FK parametres_finitions | |
| `id_tissage` | FK parametres_tissages | |
| `id_nombre_couleurs` | FK parametres_nombre_couleurs | |
| `id_personnalisation` | FK parametres_personnalisations | |
| `prix_reviens` | numeric(14,3) | |
| `prix_vente_ht` | numeric(14,3) | prix de base, override par grille |
| `unite_vente` | varchar(10) | `pc`, `paire`, `kg` |
| `stock_total` | numeric(14,3) | maintenu par mouvements stock |
| `actif` | bool | |

**Contrainte** : unique `(id_modele, id_dimension, id_couleur, id_finition, id_tissage, id_nombre_couleurs, id_personnalisation)`. C'est ce qui permet la détection "cet article existe déjà".

### 4.4 Endpoints Produits
```
GET    /api/modeles                       — liste
GET    /api/modeles/:id                   — détail (modele + attributs disponibles + variantes)
POST   /api/modeles                       — créer
PUT    /api/modeles/:id                   — modifier
DELETE /api/modeles/:id                   — supprimer (soft = actif=false)

GET    /api/articles?id_modele=&search=   — variantes
GET    /api/articles/:id                  — détail
POST   /api/articles                      — créer variante (409 si combinaison existe)
PUT    /api/articles/:id                  — modifier
DELETE /api/articles/:id                  — soft delete

GET    /api/parametres/attributs          — bundle {dimensions, couleurs, finitions, tissages, personnalisations, nombres_couleurs} (renommé depuis /api/produits/attributs)
```

---

## 5. Ventes (Phase 3)

### 5.1 Documents et transitions
```
Devis ─(accepté)─▶ Commande ─(préparée)─▶ Bon de livraison ─(livré)─▶ Facture ─(payée)─▶ ✓
                                                                        │
                                                                        ├─▶ Avoir (annulation partielle ou totale)
                                                                        └─▶ Bon de retour (marchandise retournée)
```

Chaque document a `id_client_facture` et `id_client_livraison` (peuvent être différents, cf §5.3).

### 5.2 Statuts par document
- **Devis** : `brouillon` → `envoye` → `accepte` \| `refuse` \| `expire` \| `transforme`
- **Commande** : `en_attente` → `validee` → `en_preparation` → `pretes_a_expedier` → `livree_partiel` → `livree` \| `annulee`
- **BL** : `brouillon` → `en_preparation` → `pret` → `expedie` → `livre` \| `retour_partiel`
- **Facture** : `brouillon` → `emise` → `payee_partiel` → `payee` \| `annulee`
- **Avoir** : `brouillon` → `emis` → `applique` \| `annule`
- **Bon de retour** : `brouillon` → `en_traitement` → `traite` \| `refuse`

### 5.3 Livraison croisée (client A commande, client B reçoit)
Sur `commandes` et `bons_livraison` :
- `id_client` = qui commande / qui est facturé (par défaut).
- `id_adresse_facturation` = adresse de facturation (par défaut compte de l'`id_client`).
- `id_client_livraison` = qui reçoit (nullable, défaut = `id_client`).
- `id_adresse_livraison` = adresse chez `id_client_livraison`.

Affichage BL : "Livré à : <nom_client_livraison> — <adresse_livraison>" bien visible.
Affichage facture : ne concerne QUE `id_client`.

### 5.4 Lignes de document
`devis_lignes`, `commandes_lignes`, `bons_livraison_lignes`, `factures_lignes`, `avoirs_lignes`, `bons_retour_lignes` — même structure de base :
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

### 5.5 Endpoints Ventes
```
Devis         : /api/devis      GET|POST|PUT|DELETE  +  /:id/envoyer /:id/transformer /:id/pdf
Commande      : /api/commandes  GET|POST|PUT|DELETE  +  /:id/valider /:id/generer-bl /:id/pdf
BL            : /api/bl         GET|POST|PUT|DELETE  +  /:id/expedier /:id/livrer /:id/generer-facture /:id/pdf
Facture       : /api/factures   GET|POST|PUT|DELETE  +  /:id/emettre /:id/payer /:id/pdf
                (POST/PUT/DELETE réservés ADMIN)
Avoir         : /api/avoirs     idem, ADMIN only pour POST/PUT/DELETE
Bon de retour : /api/retours    GET|POST|PUT|DELETE  +  /:id/traiter /:id/generer-avoir
```

### 5.6 Facturation — règle stricte
- **Seul un ADMIN** peut :
  - passer un devis à `accepte` (et donc déclencher création facture éventuelle)
  - émettre une facture (`brouillon` → `emise`)
  - émettre un avoir
- **COMMERCIAL** peut créer/envoyer/modifier des devis et commandes, générer des BL, mais l'écran Facture est en lecture seule pour lui (il voit ses factures pour suivi, ne les crée pas).

---

## 6. Dashboards

### 6.1 Dashboard Commercial (`COMMERCIAL`)
Vue de SES clients uniquement (filtre backend `WHERE id_commercial = <user_id>`) :
- KPI : nb clients actifs, nb devis en cours, CA du mois (devis acceptés), pipeline (devis envoyés non répondus).
- Liste devis en attente d'accepter (par le client)
- Liste commandes en préparation
- Pipeline visuel (funnel : lead → prospect → client)
- Bouton rapide : "Nouveau devis" (pré-filtré sur ses clients), "Nouvelle interaction"

### 6.2 Dashboard Magasinier (`MAGASINIER`)
- Liste des commandes `validee` + `en_preparation` triées par date livraison prévue croissante.
- Pour chaque commande : liste des articles, quantités, emplacement stock si connu.
- Bouton "Commencer préparation" → passe la commande en `en_preparation`, l'assigne au magasinier.
- Bouton "Marquer prêt" → passe en `pretes_a_expedier`, crée un BL brouillon.
- Pas de prix affichés, pas de données commerciales.

### 6.3 Dashboard Admin
Vue globale : tous les KPIs, tous les documents, gestion des utilisateurs, grilles tarifaires, paramètres.

---

## 7. Conformité fiscale par pays

### 7.1 Tunisie (`TN`) — pays par défaut
- Requis : `matricule_fiscal` sur toute société.
- TVA : 19 % (standard), 13 %, 7 %, 0 % selon articles.
- Factures : numérotation continue annuelle `FAC-YYYY-NNNNNN`.
- Timbre fiscal : 1 TND (à générer sur facture).

### 7.2 France (`FR`)
- Requis pour société : `siret` (14 chiffres) ET `numero_tva_intracom` (`FR` + 11 chiffres).
- Particulier : pas de champ fiscal requis.
- TVA : 20 % standard, 10 %, 5,5 %, 2,1 %.
- B2B intra-UE (client FR société avec TVA valide) : **facturation HT sans TVA** avec mention "Autoliquidation — Art. 283-2 du CGI".
- B2C FR : TVA française appliquée.

### 7.3 Autres UE (`DE`, `ES`, `IT`, `BE`...)
- Requis pour société : `numero_tva_intracom` (préfixe pays + n°).
- Validation format côté frontend, validation VIES (optionnel Phase 3+).
- B2B avec TVA intracom valide : HT sans TVA + mention "Reverse charge — Art. 138 EU VAT Directive".

### 7.4 Export hors UE
- Sans TVA. Mention "Exportation exonérée — Art. 294 du CGI (ou équivalent tunisien)".
- Nécessite documents douaniers (hors périmètre Phase 3).

### 7.5 Champ `pays` → règle automatique
La règle TVA est **dérivée** de `pays` + `type_compte` + `numero_tva_intracom`. À stocker dans la vue métier, pas dans une colonne dupliquée. Une fonction `computeTvaRule(compte, article)` centralise cette logique.

---

## 8. Communications (transactionnel + marketing)

### 8.1 Transactionnel — envoi de document
Chaque document (devis, commande, BL, facture, avoir, BR) a un bouton **"Envoyer"** ouvrant un modal :
- Canal : `email` \| `whatsapp` \| `telegram`
- Destinataire : contact par défaut (`est_principal = true`) du compte, éditable
- Message : template pré-rempli (variables : `<client_nom>`, `<numero_doc>`, `<montant>`, `<echeance>`)
- PJ : PDF du document généré à la volée

Backend : service `communicationService.envoyer({doc_type, doc_id, canal, destinataire, message})` qui appelle :
- Email → SMTP (config env : `SMTP_HOST`, `SMTP_USER`...)
- WhatsApp → **Business API officielle** (compte + template validé côté Meta). Coût par message. Config `WA_PHONE_ID`, `WA_TOKEN`. Fallback : lien `wa.me/<num>?text=<msg>` (le user envoie manuellement).
- Telegram → **Bot API** (bot officiel). Config `TG_BOT_TOKEN`. Le destinataire doit avoir démarré le bot au moins une fois.

Chaque envoi crée une `interaction` (type = `email_envoye` / `whatsapp` / `telegram`, direction = `sortant`) attachée au compte.

### 8.2 Marketing — campagnes de masse
**Nouvelle entité `campagnes_marketing`** :

| Colonne | Type | Note |
|---|---|---|
| `id_campagne` | serial PK | |
| `nom` | varchar(200) | |
| `type` | enum | `newsletter` \| `lancement_produit` \| `promo` \| `relance` |
| `canal` | enum | `email` \| `whatsapp` \| `telegram` \| `multi` |
| `sujet` | varchar(200) | si email |
| `contenu_html` | text | template avec variables |
| `id_segment` | FK segments_clients | qui reçoit |
| `date_planifiee` | timestamp | |
| `statut` | enum | `brouillon` \| `planifiee` \| `en_cours` \| `envoyee` \| `annulee` |
| `stats_envoyes` / `stats_ouverts` / `stats_clics` | int | KPIs |

**`segments_clients`** : critères pour cibler (statut, pays, grille tarifaire, tag, dernière commande...). Un segment est une requête sauvegardée.

Écran dédié `/marketing/campagnes` réservé ADMIN. Chaque envoi crée des `interactions` groupées.

**Contraintes légales** :
- Opt-in obligatoire pour marketing : colonne `comptes.consent_marketing_email`, `consent_marketing_whatsapp`, `consent_marketing_telegram` avec date de recueil.
- Lien de désinscription obligatoire dans chaque email marketing.
- WhatsApp Business : uniquement templates approuvés par Meta hors fenêtre de 24 h après contact client.

---

## 9. Menu — ce qui reste visible

Pendant la remise à plat, le menu affiche uniquement :
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
│    └─ Attributs (paramètres)
├─ Ventes
│    ├─ Devis
│    ├─ Commandes
│    ├─ Bons de livraison
│    ├─ Factures                  ← ADMIN only
│    ├─ Avoirs                    ← ADMIN only
│    └─ Bons de retour
├─ Tarification                    ← ADMIN
│    └─ Grilles tarifaires
├─ Marketing                       ← ADMIN
│    ├─ Campagnes
│    └─ Segments
├─ Dashboards
│    ├─ Admin                      ← ADMIN
│    ├─ Commercial                 ← COMMERCIAL + ADMIN
│    └─ Magasinier                 ← MAGASINIER + ADMIN
└─ Paramètres                      ← ADMIN
     ├─ Utilisateurs & rôles
     ├─ Pays & TVA
     └─ Templates emails/WhatsApp
```

Tout le reste (RH, sous-traitants, maintenance, planning, Gantt, IA, e-commerce, comptabilité, dashboards role atelier, tablettes, TimeMoto, portail client) : **masqué**. Ne sera réactivé que quand ces phases seront saines et validées.

---

## 10. Ordre d'exécution

1. **Contrat validé** (ce document, sur ta relecture).
2. **Cadre technique** : renommer `id_modeles` → `id_modele`, normaliser l'enveloppe API, cacher le menu hors périmètre.
3. **Phase 1** — CRM & Clients (comptes, contacts, adresses, leads, interactions, grilles tarif). Aucun autre écran touché en parallèle.
4. **Phase 2** — Modèles & articles (relations propres, variant matrix, détection doublons). Article picker se branche dessus.
5. **Phase 3** — Ventes (Devis → Commande → BL → Facture, avec livraison croisée, RBAC, envoi transactionnel).
6. Dashboards (Commercial, Magasinier).
7. Marketing (campagnes + segments).
8. Rouverture progressive des autres modules si nécessaire.

À chaque phase :
- Écran fonctionne bout-en-bout dans le navigateur avant de passer à la suivante.
- Tests curl documentés dans `docs/tests.md`.
- Changelog mis à jour.

---

## Changelog

- `2026-09-22` — Création du document. Périmètre CRM + Produits + Ventes fixé. Attente validation utilisateur.
