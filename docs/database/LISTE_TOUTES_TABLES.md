# 📋 Liste de Toutes les Tables de la Base de Données

Ce document liste toutes les tables définies dans les scripts SQL du projet.

## 📊 Scripts SQL Disponibles

### 1. Base et Sécurité (`01_base_et_securite.sql`)
- `parametres_systeme`
- `types_articles`
- `articles_catalogue`
- `selecteurs`
- `types_machines`
- `machines`
- `equipe_fabrication`
- `roles`
- `utilisateurs`
- `utilisateurs_roles`
- `logs_systeme`
- `fournisseurs`
- `types_mp`
- `matieres_premieres`
- `stock_mp`
- `inventaires_mp`
- `inventaires_mp_detail`
- `mouvements_mp`
- `demandes_ourdissage`
- `clients`
- `commandes`
- `articles_commande`
- `ordres_fabrication`
- `sous_of`
- `planning_machines`
- `preparation_mp`

### 2. Production et Qualité (`02_production_et_qualite.sql`)
- `ensouples`
- `ensouples_attributions`
- `controle_premiere_piece`
- `suivi_fabrication`
- `lots_coupe`
- `incidents_production`
- `arrets_production`
- `demandes_intervention`
- `demandes_achat_pieces`
- `sla_interventions`
- `types_non_conformites`
- `non_conformites`
- `procedures_nc`
- `types_alertes`
- `alertes_actives`
- `historique_alertes`
- `suivi_finition`
- `operations_finition`
- `sous_traitants`
- `mouvements_sous_traitance`
- `mouvements_st_detail`
- `stock_produits_finis`
- `inventaires_pf`
- `inventaires_pf_detail`
- `expeditions`
- `expedition_palettes`
- `expedition_colis`
- `expedition_colis_detail`

### 3. Flux et Traçabilité (`03_flux_et_tracabilite.sql`)
- Tables de flux et traçabilité (voir le fichier pour la liste complète)

### 4. Mobile Devices (`04_mobile_devices.sql`)
- Tables pour les appareils mobiles

### 5. Pointage TimeMoto (`backend/database/schema_pointage.sql`)
- `pointage` ⚠️ **À créer**
- `pointage_resume` ⚠️ **À créer**
- Colonnes ajoutées à `equipe`:
  - `timemoto_user_id` ⚠️ **À ajouter**
  - `temps_travaille_mois` ⚠️ **À ajouter**

### 6. Autres Modules
- Catalogue (`05_tables_catalogue.sql`)
- Attributs Articles (`05_attributs_articles.sql`)
- Sélecteurs (`06_tables_selecteurs.sql`)
- Stock Multi-Entrepôts (`07_tables_stock_multi_entrepots.sql`)
- Traçabilité Lots (`08_tables_tracabilite_lots.sql`)
- Communication et Tâches (`09_tables_communication_taches.sql`)
- Catalogue Produit (`10_tables_catalogue_produit.sql`)
- Modules Ventes (`11_modules_ventes.sql`)
- Modules Achats (`12_modules_achats.sql`)
- Stock Avancé (`13_modules_stock_avance.sql`)
- Comptabilité (`14_modules_comptabilite.sql`)
- CRM (`15_modules_crm.sql`)
- Point de Vente (`16_modules_point_de_vente.sql`)
- Maintenance (`17_modules_maintenance.sql`)
- Coûts (`18_modules_couts.sql`, `20_modules_couts.sql`)
- Qualité Avancée (`18_modules_qualite_avance.sql`, `23_amelioration_qualite_avancee.sql`)
- Planification Gantt (`19_modules_planification_gantt.sql`, `20_modules_gantt_planification.sql`)
- Multi-Société (`21_modules_multisociete.sql`)
- Communication Externe (`22_modules_communication_externe.sql`)
- E-commerce IA (`22_modules_ecommerce_ia.sql`, `23_modules_ecommerce_ia.sql`)

## ⚠️ Tables Importantes à Vérifier

### Tables de Base (Critiques)
- ✅ `equipe` / `equipe_fabrication`
- ✅ `utilisateurs`
- ✅ `roles`
- ✅ `utilisateurs_roles`

### Tables de Production
- ✅ `ordres_fabrication` / `of`
- ✅ `machines`
- ✅ `taches`
- ✅ `suivi_fabrication`

### Tables de Stock
- ✅ `stock_mp`
- ✅ `stock_produits_finis`
- ✅ `mouvements_mp`
- ✅ `entrepots`

### Tables de Pointage TimeMoto ⚠️
- ❌ `pointage` - **À créer**
- ❌ `pointage_resume` - **À créer**
- Colonnes `equipe`:
  - ❌ `timemoto_user_id` - **À ajouter**
  - ❌ `temps_travaille_mois` - **À ajouter**

### Tables Commerciales
- ✅ `clients`
- ✅ `commandes`
- ✅ `articles_commande`
- ✅ `fournisseurs`

## 🔍 Vérification

Pour vérifier quelles tables existent dans votre base de données :

```bash
# Sur le serveur
cd /opt/fouta-erp
bash scripts/verifier-tables-database.sh
```

Ou manuellement avec psql :

```bash
PGPASSWORD="votre_mot_de_passe" psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
"
```

## 📝 Notes

- Les tables marquées ✅ sont normalement créées par les scripts de base
- Les tables marquées ❌ nécessitent une création manuelle ou l'exécution d'un script spécifique
- Le script `schema_pointage.sql` n'a pas pu être exécuté à cause d'un problème de connexion à la base de données
