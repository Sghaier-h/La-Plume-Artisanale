# Matrice de couverture — code actuel ↔ `docs/domain.md` v1.10 ↔ legacy GAS

Version : 1.0 · Date : 2026-09-23 · Auteur : audit read-only

Cette matrice compare :
- **Backend actuel** — `backend/modules/*` (75 dossiers) + `backend/src/server.js` (chargement dynamique via `moduleManager`).
- **Frontend actuel** — `frontend/src/pages/*.tsx` (~77 fichiers) + `frontend/src/pages/portail/*`.
- **DB** — `database/docs/LISTE_COMPLETE_TABLES.md` (~150 tables, 28 modules SQL).
- **Legacy GAS** — 15 modules `.gs` numérotés dans `Google Apps Script/`.
- **v1.10 domain.md** — Phases 1 · 2 · 2.5 · 2.7 · 3 · 3.5.

Légende statuts : ✅ complet · 🟡 partiel · 🔴 stub / squelette · ⚫ manquant · ❓ non vérifié.

---

## 1. Modules backend

Base URL calculée par convention `moduleManager` : `/api/<moduleName>` (ou `apiPaths` explicite dans le manifest).

| Module (`backend/modules/`) | Base URL | Rôle (manifest) | Statut vs v1.10 |
|---|---|---|---|
| `auth`, `social-auth`, `utilisateurs`, `account` | `/api/auth`, `/api/utilisateurs`, `/api/account` | Login JWT, comptes utilisateur, RBAC | 🟡 base OK, rôles v1.10 (13 rôles §1.4) pas encore mappés |
| `base` | `/api/*` | Contrôleurs génériques CRUD par table | 🟡 hérité, à limiter à Phase 1 |
| `clients` | `/api/clients` | Clients + adresses + contacts + commercial | 🟡 v1.10 exige renommage `clients`→`comptes`, ajout `statut_crm`, `consent_*` |
| `crm` | `/api/crm/leads`, `.../opportunities`, `.../activities`, `.../campaigns`, `.../stages` | Leads, opportunités, activités, pipeline | 🟡 `leads` OK, `interactions` v1.10 §2.5 pas mappée |
| `commercial` | `/api/commercial` | Gestion commerciaux, commissions | 🟡 commissions non alignées §6.1 |
| `modeles` | `/api/modeles` | Modèles produits parents | 🟡 pas de `code_modele`, pas de `type_produit`, pas de `format_ref_*` (§4.1, §4bis.0.1) |
| `articles` | `/api/articles` | Articles CRUD | 🟡 table `articles_catalogue` — v1.10 §4.4 exige rename → `articles`, ajout `ref_fabrication`, `ean_13`, poids/dim |
| `articles-catalogue`, `articles-generes`, `parametres-catalogue` | `/api/articles-catalogue`, `/api/parametres-catalogue` | Anciennes routes catalogue + génération variantes | 🟡 doublon avec `articles` — à consolider |
| `parametrage`, `parametres-catalogue` | `/api/parametrage`, `/api/parametres-catalogue` | Paramètres attributs (dimensions, couleurs…) | 🟡 v1.10 §4.6 exige `/api/parametres/{dimensions,couleurs,finitions,tissages,nombres-couleurs,personnalisations}` — endpoints non normalisés |
| `stock` | `/api/stock`, `/api/stock-warehouse`, `/api/stock-location`, `/api/stock-move`, `/api/stock-picking` | Stock multi-entrepôt (schéma Odoo `stock_*`) | 🟡 architecture Odoo, v1.10 §4bis exige `entrepots`, `emplacements`, `mouvements_stock`, `reservations_stock` |
| `entrepots` | `/api/entrepots` | Rétro-compat FE ancien | 🟡 manifest dit « rétro-compat » — à réécrire selon §4bis.1 |
| `inventaires` | `/api/inventaires` | Rétro-compat FE inventaires | 🟡 idem, à aligner §4bis.7 |
| `matieres-premieres` | `/api/matieres-premieres` | MP legacy (tables `matieres_premieres`, `stock_mp`) | 🔴 v1.10 §4bis.0.1 fusionne MP dans `modeles`/`articles` |
| `fournitures`, `fournisseurs` | `/api/fournitures`, `/api/fournisseurs` | Consommables + fournisseurs achats | 🟡 fournisseurs OK, `fournitures` à réingérer via `type_stock` |
| `bom` | `/api/bom` | Nomenclatures (BOM) | 🟡 stub — v1.10 §4ter.1 exige articles MP en composants avec `id_lot`, quantités kg/m |
| `of` | `/api/of` | Ordres de fabrication | 🟡 base OK, workflow §4ter.4 (statuts, sous-OF `.1`, catégorisation qualité) manquant |
| `suivi-fabrication` | `/api/suivi-fabrication` | Pointage temps réel | 🟡 v1.10 §4ter.5 exige pointages début/fin/incident |
| `qualite-avance`, `qualite-avancee`, `quality` | `/api/qualite-avance`, `/api/quality` | Contrôle qualité | 🟡 3 modules doublons — v1.10 §4ter.6 exige un module unifié + catégorisation 1er/2ᵉ choix/Déchet/Ourlet |
| `soustraitants` | `/api/soustraitants` | Sous-traitance | 🟡 v1.10 §4ter.7 exige bons sortie/retour + CQ retour |
| `machines`, `maintenance`, `selecteurs-machines` | `/api/machines`, `/api/maintenance` | Postes / machines / maintenance | 🟡 v1.10 §4ter.3 + §6.8 |
| `planification-gantt`, `planning-dragdrop` | `/api/planification-gantt`, `/api/planning-dragdrop` | Gantt & drag-drop planning | 🟡 v1.10 §4ter.8 + §6.13 |
| `couts` | `/api/couts` | Coûts OF | 🔴 stub, §4ter.9 exige coûts théoriques vs réels |
| `mrp`, `production` | `/api/mrp`, `/api/production` | MRP + suivi production (doublons) | 🔴 doublons avec `of`/`suivi-fabrication` — à supprimer |
| `devis`, `commandes`, `bons-livraison`, `factures`, `avoirs`, `bons-retour` | `/api/devis`, `/api/commandes`, `/api/bons-livraison`, `/api/factures`, `/api/avoirs`, `/api/bons-retour` | Documents Ventes (Phase 3) | 🟡 tables présentes, workflow §5.1 (transitions, `designation_snapshot`, réservation stock) à finir |
| `relances` | `/api/relances` | Relances factures | 🟡 §5.10 à cadrer |
| `sale`, `commercial` | `/api/sale` | Doublon Odoo `sale_*` | 🔴 doublon — à supprimer |
| `dashboard` | `/api/dashboard` | Dashboards KPIs | 🟡 v1.10 §6 exige 13 dashboards distincts par rôle |
| `communication`, `email`, `messages`, `whatsapp`, `notifications` | `/api/communication`, `/api/email`, etc. | Transactionnel + marketing | 🟡 v1.10 §8 exige distinction stricte transac vs marketing + §8.4 config perso |
| `documents`, `webhooks`, `reports`, `search`, `audit`, `hr`, `payroll-tunisia`, `accounting-tunisia`, `pos`, `ai`, `portail-client`, `mobile`, `pointage`, `taches`, `project`, `warehouse`, `multisociete`, `ecommerce`, `excel-import`, `migration`, `database`, `settings`, `purchase`, `purchase-requests`, `tracabilite-lots`, `produits`, `inventory` | divers | Modules hors périmètre v1.10 | ⚫ hors périmètre §9 → à masquer/supprimer sauf `documents`, `webhooks`, `search`, `audit`, `tracabilite-lots`, `settings` qui restent utiles |

Photos multi (§4.2bis), catalogues web-sync (§4.3), SEO (§4.5), grilles tarifaires (§3), lots MP (§4bis.0.2), transferts inter-entrepôts (§4bis.4), colisage/palettes/transporteurs (§5.6/§5.7) : **aucun module backend dédié** → ⚫ manquant.

---

## 2. Pages frontend

Tous chemins relatifs à `frontend/src/pages/`. La colonne « Fetch » indique l'endpoint principal (déduit par nom, non vérifié en profondeur).

| Page | Path | Rôle | Statut vs v1.10 |
|---|---|---|---|
| `Clients.tsx`, `ClientDetails.tsx` | `/clients` | Liste + détails clients | 🟡 renommer « Comptes » §9 |
| `CrmLeads.tsx`, `Opportunities.tsx`, `PipelineVente.tsx` | `/crm/*` | CRM Leads / Opportunités / Pipeline | 🟡 v1.10 §2 exige `interactions` séparées |
| `Communication.tsx` | `/communication` | Historique communication | 🟡 à distinguer transac vs marketing §8 |
| `Modeles.tsx`, `ModeleDetails.tsx` | `/modeles` | Modèles produits | 🟡 UI OK, absente : Photos multi §4.2bis |
| `Articles.tsx`, `ArticleDetails.tsx`, `ArticlesCatalogue.tsx`, `CatalogueArticles.tsx`, `CatalogueProduit.tsx` | `/articles*`, `/catalogue*` | Variantes + catalogues | 🟡 **doublons** — 5 pages pour un concept. À unifier |
| `ParametresCatalogue.tsx`, `ParametresProduitService.tsx`, `Parametrage.tsx`, `GestionAttributs.tsx`, `GestionPermissions.tsx` | `/parametres*` | Attributs + permissions | 🟡 à consolider selon menu §9 « Paramètres » |
| `Entrepot.tsx`, `Inventaire.tsx`, `Mouvement.tsx`, `MatieresPremieres.tsx`, `MatierePremiereStock.tsx`, `Fourniture.tsx` | `/stock/*` | Stock split par catégorie | 🟡 UI présente, arch §4bis à reconstruire |
| `ProduitFini.tsx`, `SemiFini.tsx` | `/stock/pf`, `/stock/sf` | Vues PF / SF | 🟡 §4bis.0 exige vue unifiée par `type_stock` |
| `Machines.tsx`, `Maintenance.tsx` | `/machines`, `/maintenance` | Postes & machines | 🟡 §4ter.3 |
| `OF.tsx`, `OFDetails.tsx`, `SuiviFabrication.tsx`, `TracabiliteLots.tsx` | `/of/*`, `/suivi-fabrication` | OF & suivi | 🟡 workflow §4ter.4 partiel |
| `PlanificationGantt.tsx`, `PlanningDragDrop.tsx` | `/planning/*` | Gantt & drag-drop | 🟡 v1.10 §6.13 |
| `Soustraitants.tsx` | `/soustraitants` | Sous-traitance | 🟡 §4ter.7 |
| `Couts.tsx`, `Reports.tsx` | `/couts`, `/reports` | Coûts + rapports | 🔴 stub §4ter.9 |
| `QualiteAvance.tsx` | `/qualite` | Contrôle qualité | 🟡 §4ter.6 |
| `Devis.tsx`, `Commandes.tsx`, `CommandeDetails.tsx`, `BonLivraison.tsx`, `Facture.tsx`, `Avoir.tsx`, `BonRetour.tsx`, `RelancesFactures.tsx` | `/ventes/*` | Documents ventes | 🟡 statuts §5.2 à normaliser |
| `ListeColisage.tsx`, `ListePalettes.tsx` | `/colisage`, `/palettes` | Colisage + palettes | 🟡 §5.6/§5.7 UI présente, backend absent |
| `Fournisseurs.tsx` | `/fournisseurs` | Fournisseurs | 🟡 hors périmètre v1.10 mais nécessaire aux MP |
| `Dashboard.tsx`, `DashboardAdministrateur.tsx`, `DashboardChefProduction.tsx`, `DashboardCommercial.tsx`, `DashboardControleCentral.tsx`, `DashboardMagasinierMP.tsx`, `DashboardMagasinierSoustraitants.tsx`, `DashboardPostCoupe.tsx`, `DashboardTisseur.tsx`, `ChefAtelierDashboard.tsx`, `ResponsableDashboard.tsx`, `TableauBordMagasinPF.tsx`, `TableauBordMecanicien.tsx` | `/dashboards/*` | 13 dashboards par rôle | 🟡 mapping vers §6.1–§6.13 à faire ; nomenclature à normaliser |
| `TabletteCoupeur.tsx`, `TabletteMagasinier.tsx`, `TabletteQualite.tsx`, `TabletteTisseur.tsx`, `PointageTimeMoto.tsx`, `Pointage.tsx`, `MessagesOperateurs.tsx`, `Equipe.tsx` | `/tablette/*` | Interfaces atelier tablette | 🟡 §6.6, §6.6bis, §6.7, §6.10 |
| `FoutaManagement.tsx`, `Services.tsx`, `Ecommerce.tsx`, `MultiSociete.tsx`, `RhRecrutement.tsx`, `ImportExcel.tsx` | divers | Hors périmètre v1.10 | ⚫ à masquer §9 |
| `Login.tsx` | `/login` | Login | ✅ |
| `portail/Portail*.tsx` (10 pages) | `/portail/*` | Portail client (masqué §9) | ⚫ hors périmètre |

---

## 3. Tables DB (extrait — voir `database/docs/LISTE_COMPLETE_TABLES.md`)

Sur ~150 tables recensées, mapping aux entités v1.10 :

| Table actuelle | Colonnes clés | Rôle métier | Utilisée en v1.10 ? |
|---|---|---|---|
| `clients` (enrichie) | `id_client`, `raison_sociale`, `id_commercial` | Comptes | 🟡 rename → `comptes` + ajouter §2.1 champs |
| `adresses_client`, `contacts_client` | `id_client`, `type_adresse` | Adresses / contacts | ✅ mapping direct §2.2/§2.3 |
| `opportunites`, `activites_crm`, `campagnes` | | Pipeline / interactions | 🟡 renommer `activites_crm`→`interactions` |
| `articles_catalogue` | `code_article`, refs, prix | Articles (variantes) | 🟡 rename → `articles`, ajouter `ref_fabrication`, `ean_*`, poids §4.4 |
| `parametres_modeles`, `parametres_dimensions`, `parametres_couleurs`, `parametres_finitions`, `parametres_tissages`, `parametres_nombre_couleurs`, `parametres_personnalisations`, `parametres_types_produits` | | Attributs modèles | ✅ §4.1/§4.2 (ajouter `numeros_metriques`, `compositions`, `torsions`, `grammages` §4bis.0.1) |
| `entrepots`, `stock_entrepots`, `transferts_entrepots` | | Multi-entrepôt legacy | 🟡 §4bis.1/§4bis.3 |
| `stock_warehouse`, `stock_location`, `stock_quant`, `stock_move`, `stock_picking` | | Stock Odoo | 🟡 **doublon** avec les tables ci-dessus — arbitrer |
| `stock_mp`, `matieres_premieres`, `mouvements_mp`, `inventaires_mp*`, `lots_mp` | | MP séparées | 🔴 §4bis.0.1 fusionne MP dans `articles` |
| `ordres_fabrication`, `sous_of`, `suivi_fabrication`, `lots_coupe`, `ensouples*`, `preparation_mp` | | Fabrication | 🟡 §4ter.4 |
| `non_conformites`, `controle_premiere_piece`, `controles_qualite`, `resultats_controle`, `certificats_qualite`, `motifs_2eme_choix`, `declarations_2eme_choix` | | Qualité | 🟡 §4ter.6 |
| `devis`, `lignes_devis`, `commandes`, `articles_commande`, `livraisons`, `lignes_livraison`, `factures_clients`, `lignes_facture`, `paiements_clients` | | Ventes | 🟡 §5 (ajout `designation_snapshot`, réservation stock, transporteurs) |
| `expeditions`, `expedition_palettes`, `expedition_colis`, `expedition_colis_detail` | | Colisage/palettes | 🟡 §5.6/§5.7 données OK, workflow à refaire |
| `machines`, `types_machines`, `planning_machines`, `interventions_maintenance`, `pieces_detachees` | | Machines & maintenance | 🟡 §4ter.3 + §6.8 |
| `sous_traitants`, `mouvements_sous_traitance`, `mouvements_st_detail` | | Sous-traitance | 🟡 §4ter.7 |
| `couts_of_theoriques`, `couts_operation_theoriques`, `couts_matiere_premiere`, `budgets_production` | | Coûts | 🟡 §4ter.9 |
| `taches`, `notifications`, `messages_postes`, `campagnes_email`, `messages_email`, `templates_email` | | Communication | 🟡 §8 |
| `parametres_societe`, `societes`, `etablissements` | | Société singleton | 🟡 §11 |
| `res_currency*`, `product_pricelist*`, `res_partner`, `account_move_line`, `sale_report` | | Odoo héritage | 🔴 doublons avec `comptes`, `grilles_tarif` → à supprimer |
| Absentes | — | `grilles_tarif` (§3), `grille_tarif_lignes`, `photos` polymorphique (§4.2bis), `catalogues`+`article_catalogues` (§4.3), `article_seo` (§4.5), `parametres_ean` (§4.4), `reservations_stock` §4bis.6 (existe partiellement en table Odoo mais non modélisée), `article_seuils_alerte` §4bis.9, `parametres_numeros_metriques/compositions/torsions/grammages`, `article_couleurs_tissage` §4.4bis, `tarifs_transport` §5.5, `transporteurs` (config API), `commissions` §6.1 | ⚫ à créer |

---

## 4. Matrice couverture par domaine v1.10

| Domaine v1.10 | Sous-section | Legacy GAS (`.gs`) | Backend actuel | Frontend actuel | Statut |
|---|---|---|---|---|---|
| Phase 1 — CRM & Clients | §2.1 Comptes | `05_Commercial`, `06_Admin` | `clients`, `crm` | `Clients`, `ClientDetails` | 🟡 |
| | §2.2/§2.3 Contacts/Adresses | `05_Commercial` | `clients` (sous-tables) | onglets `ClientDetails` | 🟡 |
| | §2.4 Leads | `05_Commercial` | `crm/crm_lead` | `CrmLeads` | 🟡 |
| | §2.5 Interactions | — | `crm/crm_activity` (mal nommé) | `Communication` | 🟡 |
| Phase 2 — Produits | §4.1 Modèles | `04_Catalogue` | `modeles` | `Modeles`, `ModeleDetails` | 🟡 |
| | §4.2 Attributs | `04_Catalogue` | `parametrage`, `parametres-catalogue` | `Parametrage`, `GestionAttributs` | 🟡 |
| | §4.2bis Photos multi | — | ⚫ | ⚫ | ⚫ |
| | §4.3 Catalogues web-sync | `04_Catalogue` (partiel) | `articles-catalogue` (nom trompeur) | `CatalogueArticles`, `CatalogueProduit` | 🔴 |
| | §4.4 Articles variantes + refs + EAN + poids | `04_Catalogue`, `09_BOM` | `articles`, `articles-generes` | `Articles`, `ArticleDetails` | 🟡 |
| | §4.5 SEO article×catalogue | — | ⚫ | ⚫ | ⚫ |
| Phase 2.5 — Stock | §4bis.0 Catégories | `07_Stock`, `StockProduitFinis` | 5 modules doublons (`stock`, `entrepots`, `inventaires`, `warehouse`, `inventory`) | `Entrepot`, `Inventaire`, `ProduitFini`, `SemiFini`, `MatieresPremieres`, `Fourniture`, `Mouvement`, `TracabiliteLots` | 🟡 |
| | §4bis.0.1 MP as modèles | `07_Stock`, `11_Ourdissage` | `matieres-premieres` (schéma séparé) | `MatieresPremieres` | 🔴 |
| | §4bis.0.2 Lots MP obligatoires | `07_Stock` | `tracabilite-lots` | `TracabiliteLots` | 🔴 |
| | §4bis.4 Mouvements | `07_Stock` | `stock_move` (Odoo) + `mouvements_mp` | `Mouvement` | 🟡 |
| | §4bis.6 Réservations | — | ⚫ (partiel via Odoo) | ⚫ | ⚫ |
| | §4bis.7 Inventaires | `07_Stock`, `inventaires_mp*` | `inventaires` | `Inventaire` | 🟡 |
| | §4bis.9 Alertes | — | ⚫ | ⚫ | ⚫ |
| Phase 2.7 — Fabrication | §4ter.1 BOM | `09_BOM` | `bom` | ⚫ page | 🔴 |
| | §4ter.2 Gammes | `10_OrdreFabrication` | ⚫ | ⚫ | ⚫ |
| | §4ter.3 Postes/machines | `08_Equipement` | `machines`, `selecteurs-machines` | `Machines` | 🟡 |
| | §4ter.4 OF + sous-OF `.1` | `10_OrdreFabrication`, `02_Coupe`, `14_Tissage`, `13_Impression` | `of`, `mrp`, `production` (doublons) | `OF`, `OFDetails` | 🟡 |
| | §4ter.4ter Prep MP OF | `11_Ourdissage` | `matieres-premieres` (preparation_mp) | `DashboardMagasinierMP` | 🟡 |
| | §4ter.4quinquies Catégorisation 1er/2ᵉ/Déchet/Ourlet | Motifs 2ᵉ choix (tables) | `qualite-avance*` | `QualiteAvance` | 🟡 |
| | §4ter.5 Suivi pointage | `02_Coupe`, `14_Tissage` | `suivi-fabrication`, `pointage` | `SuiviFabrication`, `TabletteTisseur/Coupeur`, `Pointage` | 🟡 |
| | §4ter.6 Contrôle qualité | — (peu couvert legacy) | `qualite-avance`, `quality` (3 doublons) | `QualiteAvance`, `TabletteQualite` | 🟡 |
| | §4ter.7 Sous-traitance | `03_SousTraitance` | `soustraitants` | `Soustraitants` | 🟡 |
| | §4ter.8 Planning Gantt | `15_Dashboard` (partiel) | `planification-gantt`, `planning-dragdrop` | `PlanificationGantt`, `PlanningDragDrop` | 🟡 |
| | §4ter.9 Coûts | — | `couts` (stub) | `Couts` | 🔴 |
| Phase 3 — Ventes | §5.1 Cycle documents | `05_Commercial` | `devis`, `commandes`, `bons-livraison`, `factures`, `avoirs`, `bons-retour` | pages homonymes | 🟡 |
| | §5.4 Lignes (snapshot) | `05_Commercial` | tables `articles_commande` etc. | `CommandeDetails` | 🟡 |
| | §5.5 Frais de port | — | ⚫ | ⚫ | ⚫ |
| | §5.6 Colisage | `ColisageListe.gs` | tables `expedition_colis*` (pas de module dédié) | `ListeColisage` | 🟡 |
| | §5.7 Palettes + transporteurs API | — | tables `expedition_palettes` | `ListePalettes` | 🟡 |
| | §5.9 Facturation stricte ADMIN | `06_Admin` | `factures` | `Facture` | 🟡 |
| | §5.10 Paiements & Relances | — | `relances`, table `paiements_clients` | `RelancesFactures` | 🟡 |
| Phase 3.5 — Dashboards | §6.1 Commercial | `15_Dashboard` | `dashboard` | `DashboardCommercial` | 🟡 |
| | §6.2 Magasinier Prep | `15_Dashboard` | `dashboard` | `TabletteMagasinier`, `TableauBordMagasinPF` | 🟡 |
| | §6.3 Magasinier Stock | `15_Dashboard`, `07_Stock` | `dashboard` | ⚫ (à créer explicite) | 🔴 |
| | §6.5 Chef Production | `15_Dashboard` | `dashboard` | `DashboardChefProduction` | 🟡 |
| | §6.6/§6.6bis Tisseur/Coupeur tablette | `14_Tissage`, `02_Coupe` | `dashboard` | `TabletteTisseur`, `TabletteCoupeur`, `DashboardTisseur`, `DashboardPostCoupe` | 🟡 |
| | §6.7 Contrôle Qualité | — | `qualite-avance` | `TabletteQualite` | 🟡 |
| | §6.8 Mécanicien | — | `maintenance` | `TableauBordMecanicien` | 🟡 |
| | §6.9 Admin | `06_Admin`, `15_Dashboard` | `dashboard` | `DashboardAdministrateur`, `DashboardControleCentral` | 🟡 |
| | §6.10 Magasinier MP | `11_Ourdissage` | `matieres-premieres` | `DashboardMagasinierMP` | 🟡 |
| | §6.11 Chef d'Atelier | `15_Dashboard` | `dashboard` | `ChefAtelierDashboard`, `ResponsableDashboard` | 🟡 |
| | §6.12 Magasinier ST | `03_SousTraitance` | `soustraitants` | `DashboardMagasinierSoustraitants` | 🟡 |
| | §6.13 Planification centrale | `15_Dashboard` | `planification-gantt` | `PlanificationGantt` | 🟡 |
| Phase 4 — Marketing | §8.2 Campagnes | — | `communication`, `crm/campaign` | ⚫ page dédiée | 🔴 |
| Paramètres | §11 Société / §3 Grilles tarif / §5.5 Transporteurs / §6.1 Commissions | `01_Config` | `settings`, `multisociete` | `Parametrage`, `MultiSociete` | 🟡 |

---

## 5. Modules & pages **obsolètes / hors périmètre** v1.10 à masquer ou supprimer

D'après §9 « Menu — ce qui reste visible » et §2395 (« Tout le reste : masqué »).

### Backend
- `hr`, `payroll-tunisia`, `pointage` (partie RH) — RH masqué.
- `pos`, `ecommerce` — hors périmètre (le canal web passe par §4.3 catalogues sync).
- `ai` — masqué.
- `portail-client` — masqué.
- `mobile` — masqué.
- `taches`, `messages` (partie communication interne opérateurs) — non prévu §9.
- `project` — hors périmètre.
- `sale`, `purchase`, `purchase-requests`, `inventory`, `warehouse` — doublons Odoo à retirer au profit de `stock`/`entrepots` normalisés v1.10.
- `mrp`, `production` — doublons de `of`/`suivi-fabrication`.
- `accounting-tunisia` (`account_*`) — Odoo héritage, hors périmètre Phase 3.
- `articles-generes`, `articles-catalogue` (route) — doublons de `articles`.
- `qualite-avancee` (avec deux `e`) et `quality` — doublons de `qualite-avance`.
- `matieres-premieres` — fusionner dans `articles` via `type_stock` (§4bis.0.1).

### Frontend
- `FoutaManagement.tsx`, `Services.tsx`, `Ecommerce.tsx`, `MultiSociete.tsx`, `RhRecrutement.tsx`, `ImportExcel.tsx` — hors périmètre.
- `portail/*` (10 fichiers) — masqué §9.
- Doublons articles/catalogues : `Articles.tsx` **et** `ArticlesCatalogue.tsx` **et** `CatalogueArticles.tsx` **et** `CatalogueProduit.tsx` → n'en garder qu'un (`Articles`) + un pour catalogues.
- `ProduitFini.tsx` + `SemiFini.tsx` + `MatieresPremieres.tsx` + `MatierePremiereStock.tsx` + `Fourniture.tsx` → à fusionner en une seule vue paramétrée par `type_stock`.
- `Parametrage.tsx` + `ParametresCatalogue.tsx` + `ParametresProduitService.tsx` + `GestionAttributs.tsx` → un seul écran Paramètres §9.
- `PointageTimeMoto.tsx`, `Pointage.tsx` — pointage RH masqué (garder pointage OF via §4ter.5).

Composants `frontend/src/components/erp/*` (fields/forms/views génériques Odoo) : garder si utilisés par `base` générique, sinon supprimer.

---

## 6. Priorités de refonte (Top 10 en ordre de dépendance)

1. **Normaliser le contrat API + le renommage `id_modele`** (§10 étape 2 et §1.1) — préalable à tout le reste. Impacte tous modules.
2. **`Paramètres` unifié + tables `parametres_*` complétées** — ajouter `parametres_numeros_metriques`, `_compositions`, `_torsions`, `_grammages`, `parametres_ean`, `parametres_generation_refs` (§4bis.0.1, §4.4).
3. **Refonte `clients` → `comptes`** avec `statut_crm`, `consent_*`, `id_grille_tarif`, `source_lead`, `canal_prefere` + tables `grilles_tarif` / `grille_tarif_lignes` (Phase 1 §2.1, §3).
4. **Refonte `articles` (rename table + ajouts)** : `ref_fabrication`, `ean_13/8`, poids/dim, `type_stock`, `type_produit` sur `modeles`, table pivot `article_couleurs_tissage`, générateur de refs (§4.4).
5. **Table polymorphique `photos` + endpoints `/api/photos`** (§4.2bis). Remplace `image_url` sec sur 3 entités.
6. **Fusion MP dans `articles`** avec attributs élargis + `lots_articles` MP obligatoire (§4bis.0.1, §4bis.0.2). Suppression des tables `matieres_premieres`, `stock_mp`, `inventaires_mp*`, `mouvements_mp` après migration.
7. **Refonte Stock v1.10** : `entrepots`, `emplacements`, `stock_article_entrepot`, `mouvements_stock` unifié (10 sous-types), `reservations_stock`, `inventaires` + endpoints §4bis.10. Suppression doublons `stock_*` Odoo (`stock_warehouse`, `stock_quant`…).
8. **Catalogues + SEO web** : tables `catalogues`, `article_catalogues`, `article_seo` + endpoint sync (§4.3, §4.5). Prépare vitrine `allbyfouta.com`.
9. **Cycle Ventes complet** : Devis→Commande→BL→Facture/Avoir avec `designation_snapshot`, réservation stock, transitions §5.2, `tarifs_transport`, `transporteurs` (§5.4–§5.10). Fournit le socle §6.1/§6.2.
10. **Fabrication v1.10** : BOM (avec MP+lot), gammes, OF, sous-OF `.1`, pointage tablette, contrôle qualité 1er/2ᵉ/Déchet/Ourlet, sous-traitance, coûts théoriques vs réels (§4ter.1–§4ter.9). Débloque dashboards §6.5–§6.13.

Dashboards (§6) sont **derniers** — ils consomment ce qui est produit par 3-9.

---

## Notes d'incertitude

- Le mapping `backend/modules/*` → base URL a été inféré depuis `server.js` (convention `/api/<moduleName>`). Certaines routes utilisent `apiPaths` explicite dans le manifest (ex `bom` → `/api/bom`) : vérification à faire fichier par fichier au moment de l'implémentation.
- Le comptage « ~150 tables » vient de `LISTE_COMPLETE_TABLES.md` v1.0 (janvier 2026). L'état réel PostgreSQL peut différer (`backend/prisma/`, `backend/migrations/` non ouverts).
- Statuts 🟡 signifient : « quelque chose existe qui traite le sujet » — pas garantie que le comportement corresponde à v1.10. Un audit fichier par fichier est nécessaire au moment de refactoriser chaque phase.
- Les 15 fichiers `.gs` legacy ont été mappés par leur nom uniquement (contrainte de l'audit) — le mapping fin sera confirmé par les 6 agents parallèles GAS.
