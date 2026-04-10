# 📋 Liste Complète de Toutes les Tables du Système

Liste exhaustive de toutes les tables avec leurs colonnes principales et relations.

**Version** : 1.0  
**Date** : 2026-01-22

---

## 📊 Statistiques

- **Total de tables** : ~150+ tables
- **Modules documentés** : 28 modules
- **Relations** : ~200+ relations

---

## 🔍 Recherche Rapide par Module

| Module | Nombre de Tables | Fichier SQL |
|--------|------------------|-------------|
| Base et Sécurité | 20+ | `01_base_et_securite.sql` |
| Production et Qualité | 25+ | `02_production_et_qualite.sql` |
| Flux et Traçabilité | 15+ | `03_flux_et_tracabilite.sql` |
| Stock Multi-Entrepôts | 5+ | `07_tables_stock_multi_entrepots.sql` |
| Catalogue et Articles | 10+ | `05_tables_catalogue.sql`, `05_attributs_articles.sql` |
| Clients (CRM Enrichi) | 5 | `08_structure_clients_enrichie.sql` |
| Ventes | 7 | `11_modules_ventes.sql` |
| Achats | 7 | `12_modules_achats.sql` |
| Stock Avancé | 6 | `13_modules_stock_avance.sql` |
| Comptabilité | 5 | `14_modules_comptabilite.sql` |
| CRM (Opportunités) | 5 | `15_modules_crm.sql` |
| Point de Vente | 4 | `16_modules_point_de_vente.sql` |
| Maintenance | 3 | `17_modules_maintenance.sql` |
| Coûts | 4 | `18_modules_couts.sql` |
| Planification Gantt | 7 | `19_modules_planification_gantt.sql` |
| Qualité Avancée | 10+ | `18_modules_qualite_avance.sql` |
| Multi-Société | 3 | `21_modules_multisociete.sql` |
| E-commerce IA | 5+ | `22_modules_ecommerce_ia.sql` |
| Communication Externe | 5+ | `22_modules_communication_externe.sql` |
| Utilisateurs et Groupes | 4 | `05_structure_utilisateurs_groupes.sql` |
| Tracabilité Lots | 1 | `08_tables_tracabilite_lots.sql` |
| Communication et Tâches | 3 | `09_tables_communication_taches.sql` |
| Mobile Devices | 2+ | `04_mobile_devices.sql` |
| Paie Tunisie | 4 | `25_paie_tunisie.sql` |
| Comptabilité Tunisie | 5 | `26_comptabilite_tunisie.sql` |
| Entrepôt Complet | 10+ | `27_module_entrepot_complet.sql` |
| Sélecteurs | 2 | `06_tables_selecteurs.sql` |
| Catalogue Produit | 5+ | `10_tables_catalogue_produit.sql` |

---

## 📑 Liste Complète des Tables par Module

### Module Base et Sécurité

1. `parametres_systeme` - Paramètres système globaux
2. `types_articles` - Types d'articles
3. `articles_catalogue` - Articles du catalogue (structure de base + enrichie)
4. `selecteurs` - Sélecteurs pour machines
5. `types_machines` - Types de machines
6. `machines` - Machines de production
7. `equipe_fabrication` - Équipe de fabrication
8. `clients` - Clients (structure de base + enrichie)
9. `commandes` - Commandes clients
10. `articles_commande` - Lignes de commande
11. `ordres_fabrication` - Ordres de fabrication
12. `sous_of` - Sous-ordres de fabrication
13. `planning_machines` - Planning des machines
14. `fournisseurs` - Fournisseurs
15. `types_mp` - Types de matières premières
16. `matieres_premieres` - Matières premières
17. `stock_mp` - Stock de matières premières
18. `inventaires_mp` - Inventaires de matières premières
19. `inventaires_mp_detail` - Détails inventaires MP
20. `mouvements_mp` - Mouvements de matières premières
21. `demandes_ourdissage` - Demandes d'ourdissage
22. `preparation_mp` - Préparations de matières premières
23. `roles` - Rôles utilisateurs
24. `utilisateurs` - Utilisateurs du système
25. `utilisateurs_roles` - Relation utilisateurs ↔ rôles
26. `logs_systeme` - Logs système

### Module Production et Qualité

1. `ensouples` - Ensouples (bobines de fil)
2. `ensouples_attributions` - Attributions d'ensouples aux machines
3. `controle_premiere_piece` - Contrôle première pièce
4. `suivi_fabrication` - Suivi de fabrication
5. `lots_coupe` - Lots de coupe
6. `sous_traitants` - Sous-traitants
7. `mouvements_sous_traitance` - Mouvements de sous-traitance
8. `mouvements_st_detail` - Détails mouvements sous-traitance
9. `stock_produits_finis` - Stock produits finis
10. `expeditions` - Expéditions
11. `expedition_palettes` - Palettes d'expédition
12. `expedition_colis` - Colis d'expédition
13. `expedition_colis_detail` - Détails des colis
14. `inventaires_pf` - Inventaires produits finis
15. `inventaires_pf_detail` - Détails inventaires PF
16. `suivi_finition` - Suivi finition
17. `operations_finition` - Opérations de finition
18. `incidents_production` - Incidents de production
19. `arrets_production` - Arrêts de production
20. `demandes_intervention` - Demandes d'intervention
21. `demandes_achat_pieces` - Demandes d'achat de pièces
22. `types_non_conformites` - Types de non-conformités
23. `non_conformites` - Non-conformités
24. `procedures_nc` - Procédures de non-conformité
25. `types_alertes` - Types d'alertes
26. `alertes_actives` - Alertes actives
27. `historique_alertes` - Historique des alertes
28. `sla_interventions` - SLA des interventions

### Module Flux et Traçabilité

1. `demandes_mp_tisseur` - Demandes MP tisseur
2. `historique_livraisons_mp` - Historique livraisons MP
3. `demandes_retour_mp` - Demandes retour MP
4. `demandes_completion_commande` - Demandes completion commande
5. `demandes_finition` - Demandes finition
6. `demandes_controle_qualite` - Demandes contrôle qualité
7. `demandes_expedition` - Demandes expédition
8. `notifications_demandes` - Notifications demandes
9. `motifs_2eme_choix` - Motifs 2ème choix
10. `grille_prix_2eme_choix` - Grille prix 2ème choix
11. `conditions_acceptation_2eme_choix` - Conditions acceptation 2ème choix
12. `declarations_2eme_choix` - Déclarations 2ème choix
13. `historique_mouvements_2eme_choix` - Historique mouvements 2ème choix

### Module Stock Multi-Entrepôts

1. `entrepots` - Entrepôts
2. `stock_entrepots` - Stock par entrepôt
3. `transferts_entrepots` - Transferts entre entrepôts

### Module Catalogue et Articles

1. `parametres_modeles` - Modèles de base
2. `parametres_dimensions` - Dimensions
3. `parametres_finitions` - Types de finitions
4. `parametres_tissages` - Types de tissages
5. `parametres_couleurs` - Couleurs
6. `parametres_types_produits` - Types de produits
7. `parametres_nombre_couleurs` - Nombre de couleurs
8. `parametres_personnalisations` - Options personnalisation
9. `parametres_types_personnalisation` - Types de personnalisation (Broderie, Sérigraphie, Autre)
10. `nomenclature_selecteurs` - Nomenclature sélecteurs (BOM)
11. `dimensions_articles` - Dimensions articles
12. `couleurs_articles` - Couleurs articles
13. `finitions_articles` - Finitions articles
14. `articles_references` - Références d'articles
15. `articles_attributs` - Attributs multiples articles
16. `produits` - Produits (modèle de base)
17. `attributs_produit` - Attributs personnalisables
18. `produit_attributs` - Association produit-attributs
19. `variantes_produit` - Variantes produit
20. `product_category` - Catégories produits

### Module Clients (CRM Enrichi)

1. `clients` - Clients (enrichi)
2. `categories_clients` - Catégories clients
3. `types_commerciaux` - Types de commerciaux
4. `adresses_client` - Adresses multiples
5. `contacts_client` - Contacts multiples

### Module Ventes

1. `devis` - Devis clients
2. `lignes_devis` - Lignes de devis
3. `commandes_clients` / `commandes` - Commandes clients
4. `lignes_commande` / `articles_commande` - Lignes de commande
5. `livraisons` - Bons de livraison
6. `lignes_livraison` - Lignes de livraison
7. `factures_clients` - Factures clients
8. `lignes_facture` - Lignes de facture
9. `paiements_clients` - Paiements des factures

### Module Achats

1. `demandes_achat` - Demandes d'achat
2. `lignes_demande_achat` - Lignes de demande d'achat
3. `commandes_fournisseurs` - Commandes fournisseurs
4. `lignes_commande_fournisseur` - Lignes de commande fournisseur
5. `receptions` - Réceptions
6. `lignes_reception` - Lignes de réception
7. `factures_fournisseurs` - Factures fournisseurs
8. `lignes_facture_fournisseur` - Lignes de facture fournisseur
9. `paiements_fournisseurs` - Paiements fournisseurs

### Module Stock Avancé

1. `inventaires` - Inventaires
2. `lignes_inventaire` - Lignes d'inventaire
3. `mouvements_stock` - Mouvements de stock
4. `stock_reel` - Stock réel (vue matérialisée)
5. `reservations_stock` - Réservations de stock
6. `emplacements` - Emplacements dans entrepôts

### Module Comptabilité

1. `plan_comptable` - Plan comptable
2. `journaux_comptables` - Journaux comptables
3. `ecritures_comptables` - Écritures comptables
4. `lignes_ecriture` - Lignes d'écriture
5. `rapprochements_bancaires` - Rapprochements bancaires
6. `centres_analytiques` - Centres analytiques

### Module CRM (Opportunités)

1. `contacts` - Contacts (clients/fournisseurs)
2. `opportunites` - Opportunités
3. `activites_crm` - Activités CRM
4. `campagnes` - Campagnes marketing
5. `participants_campagne` - Participants aux campagnes

### Module Point de Vente

1. `caisses` - Caisses
2. `sessions_caisse` - Sessions de caisse
3. `ventes_caisse` - Ventes en caisse
4. `lignes_vente_caisse` - Lignes de vente caisse
5. `remboursements_caisse` - Remboursements caisse

### Module Maintenance

1. `types_maintenance` - Types de maintenance
2. `interventions_maintenance` - Interventions maintenance
3. `pieces_detachees` - Pièces détachées
4. `planification_maintenance` - Planification maintenance

### Module Coûts

1. `couts_of_theoriques` - Coûts OF théoriques vs réels
2. `couts_operation_theoriques` - Coûts opération théoriques
3. `couts_matiere_premiere` - Coûts matières premières
4. `budgets_production` - Budgets production

### Module Planification Gantt

1. `projets` - Projets
2. `taches_planification` - Tâches de planification
3. `ressources_planification` - Ressources de planification
4. `affectations_ressources` - Affectations ressources
5. `contraintes_planification` - Contraintes de planification
6. `optimisations_planification` - Optimisations planification
7. `vues_gantt` - Vues Gantt

### Module Qualité Avancée

1. `types_controles_qualite` - Types de contrôles qualité
2. `controles_qualite` - Contrôles qualité
3. `resultats_controle` - Résultats de contrôle
4. `certificats_qualite` - Certificats qualité
5. `non_conformites_qualite` - Non-conformités qualité
6. `actions_correctives` - Actions correctives
7. `audits_qualite` - Audits qualité

### Module Multi-Société

1. `societes` - Sociétés
2. `etablissements` - Établissements
3. `parametres_societe` - Paramètres par société

### Module E-commerce IA

1. `produits_ecommerce` - Produits e-commerce
2. `commandes_ecommerce` - Commandes e-commerce
3. `recommandations_ia` - Recommandations IA
4. `analyses_ventes_ia` - Analyses ventes IA

### Module Communication Externe

1. `campagnes_email` - Campagnes email
2. `messages_email` - Messages email
3. `templates_email` - Templates email
4. `integrations_api` - Intégrations API

### Module Utilisateurs et Groupes

1. `groupes` - Groupes (FAB, ATL, COM, SOU)
2. `utilisateurs_dashboards` - Relation utilisateurs ↔ dashboards
3. `dashboards` - Dashboards disponibles

### Module Tracabilité Lots

1. `lots_mp` - Lots matières premières

### Module Communication et Tâches

1. `taches` - Tâches inter-postes
2. `notifications` - Notifications utilisateurs
3. `messages_postes` - Messages entre postes

### Module Mobile Devices

1. `devices_mobiles` - Appareils mobiles
2. `sessions_mobiles` - Sessions mobiles

### Module Paie Tunisie

1. `hr_salary_rule` - Règles de salaire
2. `hr_payroll_structure` - Structures de paie
3. `hr_payslip_line` - Lignes de bulletin de paie
4. `hr_contract` - Contrats de travail

### Module Comptabilité Tunisie

1. `account_tax` - Taxes comptables
2. `account_fiscal_position` - Positions fiscales
3. `account_fiscal_position_rule` - Règles positions fiscales
4. `account_withholding_tax` - Retenues à la source
5. `account_tax_report` - Déclarations fiscales

### Module Entrepôt Complet

1. `stock_warehouse` - Entrepôts (structure complète)
2. `stock_location` - Emplacements hiérarchiques
3. `stock_quant` - Quantités par produit/emplacement
4. `stock_move` - Mouvements de stock
5. `stock_picking` - Réceptions/Livraisons
6. `stock_picking_type` - Types d'opérations
7. `stock_picking_move_rel` - Relation picking/mouvements
8. `stock_route` - Routes logistiques
9. `stock_rule` - Règles de réapprovisionnement
10. `stock_removal` - Stratégies d'enlèvement
11. `stock_putaway` - Stratégies de rangement

### Module Sélecteurs

1. `config_selecteurs_machines` - Configuration sélecteurs par machine
2. `config_of_selecteurs` - Configuration sélecteurs par OF

### Module Commercial Multi-tarif Multi-devise

1. `res_currency` - Devises
2. `res_currency_rate` - Taux de change
3. `product_pricelist` - Listes de prix
4. `product_pricelist_item` - Lignes de liste de prix
5. `res_partner` - Partenaires (clients/fournisseurs)
6. `account_move_line` - Lignes d'écriture comptable
7. `sale_report` - Rapports de vente

---

## 🔗 Relations Principales

### Relations Clients
```
clients (1) ──< (N) adresses_client
clients (1) ──< (N) contacts_client
clients (1) ──< (N) commandes
clients (1) ──< (N) factures_clients
clients (1) ──< (N) opportunites
```

### Relations Commandes
```
commandes (1) ──< (N) articles_commande
commandes (1) ──< (N) ordres_fabrication
commandes (1) ──< (N) livraisons
commandes (1) ──< (N) factures_clients
```

### Relations Production
```
ordres_fabrication (1) ──< (N) sous_of
ordres_fabrication (1) ──< (N) suivi_fabrication
ordres_fabrication (1) ──< (N) lots_coupe
ordres_fabrication (1) ──< (N) non_conformites
machines (1) ──< (N) sous_of
machines (1) ──< (N) ensouples_attributions
```

### Relations Stock
```
articles_catalogue (1) ──< (N) stock_reel
articles_catalogue (1) ──< (N) mouvements_stock
articles_catalogue (1) ──< (N) reservations_stock
entrepots (1) ──< (N) stock_reel
entrepots (1) ──< (N) emplacements
```

### Relations Utilisateurs
```
utilisateurs (N) ──< (N) utilisateurs_roles ──> (N) roles
utilisateurs (N) ──< (N) utilisateurs_dashboards
utilisateurs (1) ──< (N) clients (id_commercial)
groupes (1) ──< (N) utilisateurs
```

---

## 📄 Pages Frontend par Module

### Module Clients
- `Clients.tsx` - Liste et gestion clients
- `ClientDetails.tsx` - Détails client avec onglets

### Module Ventes
- `Devis.tsx` - Gestion devis
- `Commandes.tsx` - Gestion commandes
- `CommandeDetails.tsx` - Détails commande
- `Facture.tsx` - Gestion factures
- `Avoir.tsx` - Gestion avoirs
- `BonLivraison.tsx` - Gestion bons de livraison
- `BonRetour.tsx` - Gestion retours

### Module Articles
- `Articles.tsx` - Gestion articles
- `ArticleDetails.tsx` - Détails article
- `ArticlesCatalogue.tsx` - Catalogue articles
- `CatalogueArticles.tsx` - Vue catalogue
- `CatalogueProduit.tsx` - Catalogue produit
- `Modeles.tsx` - Gestion modèles
- `ModeleDetails.tsx` - Détails modèle
- `ParametresCatalogue.tsx` - Paramètres catalogue
- `GestionAttributs.tsx` - Gestion attributs

### Module Production
- `OF.tsx` - Ordres de fabrication
- `OFDetails.tsx` - Détails OF
- `Productions.tsx` - Suivi production
- `SuiviFabrication.tsx` - Suivi fabrication
- `QualiteAvance.tsx` - Qualité avancée
- `Soustraitants.tsx` - Gestion sous-traitants

### Module Stock
- `Entrepot.tsx` - Gestion entrepôts
- `Inventaire.tsx` - Inventaires
- `Mouvement.tsx` - Mouvements stock
- `MatierePremiereStock.tsx` - Stock MP
- `ProduitFini.tsx` - Produits finis
- `SemiFini.tsx` - Semi-finis
- `Fourniture.tsx` - Fournitures
- `StockPickings.tsx` - Picking stock

### Module Achats
- `PurchaseOrders.tsx` - Commandes fournisseurs
- `Fournisseurs.tsx` - Gestion fournisseurs

### Module Comptabilité
- `AccountMoves.tsx` - Écritures comptables

### Module CRM
- `CRMLeads.tsx` - Leads et opportunités

### Module Point de Vente
- `SaleOrders.tsx` - Ventes caisse

### Module Planification
- `PlanificationGantt.tsx` - Planification Gantt
- `PlanningDragDrop.tsx` - Planning drag & drop

### Module Maintenance
- `Maintenance.tsx` - Gestion maintenance

### Module Coûts
- `Couts.tsx` - Analyse des coûts

### Module Utilisateurs
- `Equipe.tsx` - Gestion équipe
- `Login.tsx` - Connexion

### Dashboards
- `Dashboard.tsx` - Dashboard principal
- `DashboardAdministrateur.tsx` - Dashboard admin
- `DashboardChefProduction.tsx` - Dashboard chef production
- `DashboardGPAO.tsx` - Dashboard GPAO
- `DashboardControleCentral.tsx` - Dashboard contrôle
- `DashboardMagasinierMP.tsx` - Dashboard magasinier MP
- `DashboardMagasinierSoustraitants.tsx` - Dashboard magasinier sous-traitants
- `DashboardPostCoupe.tsx` - Dashboard post coupe
- `DashboardTisseur.tsx` - Dashboard tisseur
- `ChefAtelierDashboard.tsx` - Dashboard chef atelier
- `ResponsableDashboard.tsx` - Dashboard responsable
- `TableauBordMagasinPF.tsx` - Tableau de bord magasin PF
- `TableauBordMecanicien.tsx` - Tableau de bord mécanicien

### Tablettes
- `TabletteTisseur.tsx` - Tablette tisseur
- `TabletteCoupeur.tsx` - Tablette coupeur
- `TabletteQualite.tsx` - Tablette qualité
- `TabletteMagasinier.tsx` - Tablette magasinier

### Autres
- `Parametrage.tsx` - Paramétrage
- `ParametresProduitService.tsx` - Paramètres produit/service
- `ImportExcel.tsx` - Import Excel
- `Communication.tsx` - Communication
- `MessagesOperateurs.tsx` - Messages opérateurs
- `MultiSociete.tsx` - Multi-société
- `Ecommerce.tsx` - E-commerce
- `Products.tsx` - Produits
- `Services.tsx` - Services
- `FoutaManagement.tsx` - Gestion fouta
- `Machines.tsx` - Gestion machines
- `MatieresPremieres.tsx` - Gestion matières premières

---

## 📚 Documentation Complète

Pour la documentation détaillée avec toutes les colonnes de chaque table, consultez :
- **`DOCUMENTATION_COMPLETE_SYSTEME.md`** - Documentation complète par module
- **`DOCUMENTATION_MODULES.md`** - Documentation des modules principaux

---

**Dernière mise à jour** : 2026-01-22
