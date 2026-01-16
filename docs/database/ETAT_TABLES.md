# 📊 État des Tables de la Base de Données

## 📋 Fichiers SQL Disponibles

### Tables de Base
- ✅ `01_base_et_securite.sql` - 26 tables (utilisateurs, sécurité, etc.)
- ✅ `02_production_et_qualite.sql` - 28 tables (production, qualité)
- ✅ `03_flux_et_tracabilite.sql` - 13 tables (flux, traçabilité)

### Modules Spécialisés
- ✅ `04_mobile_devices.sql` - 2 tables (appareils mobiles)
- ✅ `05_attributs_articles.sql` - 5 tables (attributs produits)
- ✅ `05_tables_catalogue.sql` - 6 tables (catalogue)
- ✅ `06_tables_selecteurs.sql` - 2 tables (sélecteurs machines)
- ✅ `07_tables_stock_multi_entrepots.sql` - 3 tables (stock multi-entrepôts)
- ✅ `08_tables_tracabilite_lots.sql` - 1 table (traçabilité lots)
- ✅ `09_tables_communication_taches.sql` - 3 tables (communication, tâches)
- ✅ `10_tables_catalogue_produit.sql` - 5 tables (catalogue produit)

### Modules Métier
- ✅ `11_modules_ventes.sql` - 9 tables (ventes)
- ✅ `12_modules_achats.sql` - 9 tables (achats)
- ✅ `13_modules_stock_avance.sql` - 7 tables (stock avancé)
- ✅ `14_modules_comptabilite.sql` - 6 tables (comptabilité)
- ✅ `15_modules_crm.sql` - 5 tables (CRM)
- ✅ `16_modules_point_de_vente.sql` - 5 tables (point de vente)
- ✅ `17_modules_maintenance.sql` - 6 tables (maintenance)
- ✅ `18_modules_couts.sql` - 6 tables (coûts)
- ✅ `18_modules_qualite_avance.sql` - 8 tables (qualité avancée)
- ✅ `19_modules_multisociete.sql` - 5 tables (multi-société)
- ✅ `19_modules_planification_gantt.sql` - 7 tables (planification Gantt)
- ✅ `20_modules_couts.sql` - 7 tables (coûts - doublon ?)
- ✅ `20_modules_gantt_planification.sql` - 6 tables (Gantt - doublon ?)
- ✅ `21_modules_communication_externe.sql` - 7 tables (communication externe)
- ✅ `21_modules_multisociete.sql` - 6 tables (multi-société - doublon ?)
- ✅ `22_modules_communication_externe.sql` - 7 tables (communication - doublon ?)
- ✅ `22_modules_ecommerce_ia.sql` - 7-8 tables (e-commerce IA)
- ✅ `23_amelioration_qualite_avancee.sql` - 6 tables (qualité avancée)
- ✅ `23_modules_ecommerce_ia.sql` - 7 tables (e-commerce IA - doublon ?)

## ⚠️ Fichiers en Doublon à Vérifier

- `20_modules_couts.sql` et `18_modules_couts.sql`
- `19_modules_planification_gantt.sql` et `20_modules_gantt_planification.sql`
- `19_modules_multisociete.sql` et `21_modules_multisociete.sql`
- `21_modules_communication_externe.sql` et `22_modules_communication_externe.sql`
- `22_modules_ecommerce_ia.sql` et `23_modules_ecommerce_ia.sql`

## 📊 Total Estimé

- **~221 tables** créées au total
- **30 fichiers SQL** dans le dossier `database/`

## ✅ Vérification dans la Base de Données

Pour vérifier quelles tables existent réellement dans la base de données :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## 🚀 Exécution des Scripts

Les scripts doivent être exécutés dans l'ordre :

1. `01_base_et_securite.sql`
2. `02_production_et_qualite.sql`
3. `03_flux_et_tracabilite.sql`
4. Puis les autres modules selon les besoins
