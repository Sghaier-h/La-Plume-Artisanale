# 📊 Résumé des Tables de la Base de Données

## ✅ Tables Créées

D'après l'analyse des fichiers SQL, **~221 tables** sont définies dans **30 fichiers SQL**.

### 📁 Fichiers SQL par Catégorie

#### 🔐 Base et Sécurité (3 fichiers)
- `01_base_et_securite.sql` - 26 tables (utilisateurs, rôles, permissions)
- `02_production_et_qualite.sql` - 28 tables (production, qualité)
- `03_flux_et_tracabilite.sql` - 13 tables (flux, traçabilité)

#### 📱 Mobile et Catalogue (7 fichiers)
- `04_mobile_devices.sql` - 2 tables
- `05_attributs_articles.sql` - 5 tables
- `05_tables_catalogue.sql` - 6 tables
- `06_tables_selecteurs.sql` - 2 tables
- `07_tables_stock_multi_entrepots.sql` - 3 tables
- `08_tables_tracabilite_lots.sql` - 1 table
- `09_tables_communication_taches.sql` - 3 tables
- `10_tables_catalogue_produit.sql` - 5 tables

#### 💼 Modules Métier (13 fichiers)
- `11_modules_ventes.sql` - 9 tables
- `12_modules_achats.sql` - 9 tables
- `13_modules_stock_avance.sql` - 7 tables
- `14_modules_comptabilite.sql` - 6 tables
- `15_modules_crm.sql` - 5 tables
- `16_modules_point_de_vente.sql` - 5 tables
- `17_modules_maintenance.sql` - 6 tables
- `18_modules_couts.sql` - 6 tables
- `18_modules_qualite_avance.sql` - 8 tables
- `19_modules_multisociete.sql` - 5 tables
- `19_modules_planification_gantt.sql` - 7 tables
- `20_modules_couts.sql` - 7 tables (⚠️ doublon possible)
- `20_modules_gantt_planification.sql` - 6 tables (⚠️ doublon possible)
- `21_modules_communication_externe.sql` - 7 tables
- `21_modules_multisociete.sql` - 6 tables (⚠️ doublon possible)
- `22_modules_communication_externe.sql` - 7 tables (⚠️ doublon possible)
- `22_modules_ecommerce_ia.sql` - 7-8 tables
- `23_amelioration_qualite_avancee.sql` - 6 tables
- `23_modules_ecommerce_ia.sql` - 7 tables (⚠️ doublon possible)

## ⚠️ Fichiers en Doublon à Vérifier

Certains fichiers semblent être des doublons ou des versions différentes :

1. **Coûts** : `18_modules_couts.sql` et `20_modules_couts.sql`
2. **Gantt** : `19_modules_planification_gantt.sql` et `20_modules_gantt_planification.sql`
3. **Multi-société** : `19_modules_multisociete.sql` et `21_modules_multisociete.sql`
4. **Communication** : `21_modules_communication_externe.sql` et `22_modules_communication_externe.sql`
5. **E-commerce IA** : `22_modules_ecommerce_ia.sql` et `23_modules_ecommerce_ia.sql`

**Recommandation** : Vérifier le contenu de ces fichiers pour déterminer lesquels utiliser.

## 🚀 Ordre d'Exécution Recommandé

```bash
# 1. Base et sécurité (OBLIGATOIRE)
psql -U user -d db -f database/01_base_et_securite.sql
psql -U user -d db -f database/02_production_et_qualite.sql
psql -U user -d db -f database/03_flux_et_tracabilite.sql

# 2. Catalogue et attributs
psql -U user -d db -f database/05_attributs_articles.sql
psql -U user -d db -f database/05_tables_catalogue.sql
psql -U user -d db -f database/06_tables_selecteurs.sql
psql -U user -d db -f database/10_tables_catalogue_produit.sql

# 3. Stock et traçabilité
psql -U user -d db -f database/07_tables_stock_multi_entrepots.sql
psql -U user -d db -f database/08_tables_tracabilite_lots.sql

# 4. Modules métier (selon besoins)
psql -U user -d db -f database/11_modules_ventes.sql
psql -U user -d db -f database/12_modules_achats.sql
# ... etc
```

## ✅ Vérification dans la Base de Données

Pour vérifier quelles tables existent réellement :

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Compter les tables
SELECT COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

## 📝 Notes

- Les fichiers `parametrage_initial.sql` et `script tableau.sql` sont des scripts utilitaires
- Le fichier `liste table.sql` contient une requête pour lister les tables
- Certains fichiers peuvent contenir des `CREATE OR REPLACE` au lieu de `CREATE TABLE`
