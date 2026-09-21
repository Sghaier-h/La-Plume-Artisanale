# 🚀 Guide Rapide - Données de Test

## Installation Rapide

```bash
# 1. Se connecter à PostgreSQL
psql -U postgres -d la_plume_artisanale

# 2. Exécuter le script
\i database/insert_donnees_test.sql
```

Ou en une ligne :

```bash
psql -U postgres -d la_plume_artisanale -f database/insert_donnees_test.sql
```

## 📊 Données Créées

- ✅ **4 Utilisateurs** (Admin, Chef Prod, Opérateur, Commercial)
- ✅ **5 Clients** (Boutiques et export)
- ✅ **5 Machines** (Tissage, couture, finition, emballage)
- ✅ **5 Matières Premières** (Fils de coton, lin, bambou, lurex)
- ✅ **3 Articles** (Foutas ARTHUR)
- ✅ **1 Commande** avec lignes
- ✅ **2 Ordres de Fabrication** (en attente et en cours)
- ✅ **1 Suivi de Fabrication** (en cours)
- ✅ **2 Mouvements de Stock** (entrée/sortie)
- ✅ **1 Inventaire** (en attente)
- ✅ **3 Entrepôts** (Principal, Showroom, Réserve)
- ✅ **4 Fournitures** (Étiquettes, sacs, rubans, fils)
- ✅ **2 Contrôles Qualité** (en attente et validé)

## 🔑 Utilisateurs de Test

**⚠️ Important** : Les mots de passe sont hashés. Pour vous connecter :

1. **Créer un nouvel utilisateur via l'interface** (recommandé)
2. Ou modifier les mots de passe dans la base de données

## 📖 Documentation Complète

- **Guide détaillé** : `docs/GUIDE_DONNÉES_TEST.md`
- **Vérification systèmes** : `docs/VÉRIFICATION_SYSTÈMES.md`

## ✅ Vérification Rapide

```sql
-- Vérifier que les données sont créées
SELECT 'Utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
UNION ALL SELECT 'Clients', COUNT(*) FROM clients
UNION ALL SELECT 'Articles', COUNT(*) FROM articles_catalogue
UNION ALL SELECT 'OF', COUNT(*) FROM ordres_fabrication;
```

## 🧪 Tests Recommandés

1. **Se connecter** avec un utilisateur créé
2. **Naviguer** dans les différentes sections
3. **Cliquer sur les éléments** pour voir les pages de détails
4. **Créer un OF** depuis une commande
5. **Démarrer et terminer un OF** pour tester le workflow complet

---

**Fichiers créés** :
- `database/insert_donnees_test.sql` - Script SQL principal
- `docs/VÉRIFICATION_SYSTÈMES.md` - Documentation complète
- `docs/GUIDE_DONNÉES_TEST.md` - Guide d'utilisation détaillé
- `scripts/verifier_endpoints.js` - Script de vérification des endpoints
