# 📋 Traçage Utilisateur sur TOUTES les Tables

## 🎯 Objectif

Ajouter les champs `created_by` et `updated_by` à **TOUTES les tables** de la base de données pour une traçabilité complète.

---

## 📄 Script SQL

**Fichier :** `backend/database/add_created_updated_by_all_tables.sql`

Ce script :
- ✅ Détecte automatiquement toutes les tables de la base
- ✅ Ajoute `created_by` et `updated_by` à chaque table (si manquants)
- ✅ Exclut les tables système (commençant par `pg_`)
- ✅ Exclut certaines tables spéciales (`audit_log`, etc.)
- ✅ Ajoute des commentaires de documentation
- ✅ Affiche un résumé des modifications

---

## 🚀 Exécution

### Option 1 : Via pgAdmin (Recommandé)

1. Ouvrez pgAdmin
2. Connectez-vous à `ERP_La_Plume`
3. Ouvrez Query Tool
4. Ouvrez le fichier : `backend/database/add_created_updated_by_all_tables.sql`
5. Exécutez le script (F5)

### Option 2 : Via le Serveur SSH

```bash
ssh ubuntu@137.74.40.191
cd /opt/fouta-erp
git pull origin main
bash scripts/executer-add-created-updated-by-all-tables.sh
```

---

## ⚠️ Tables Exclues

Le script exclut automatiquement :
- Tables système PostgreSQL (commençant par `pg_`)
- `audit_log` (table d'audit elle-même)
- Tables de statistiques système
- Tables spatiales (si PostGIS est installé)

---

## 🔍 Vérification

Après l'exécution, vérifiez avec cette requête :

```sql
-- Voir toutes les tables avec created_by et updated_by
SELECT 
    table_name,
    COUNT(CASE WHEN column_name = 'created_by' THEN 1 END) as a_created_by,
    COUNT(CASE WHEN column_name = 'updated_by' THEN 1 END) as a_updated_by,
    CASE 
        WHEN COUNT(CASE WHEN column_name = 'created_by' THEN 1 END) = 1 
         AND COUNT(CASE WHEN column_name = 'updated_by' THEN 1 END) = 1 
        THEN '✅ Complet'
        ELSE '⚠️  Incomplet'
    END as statut
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('created_by', 'updated_by')
GROUP BY table_name
ORDER BY table_name;
```

---

## 📊 Résultat Attendu

Le script affichera un résumé dans les NOTICE PostgreSQL :

```
========================================
Résumé de l'ajout des champs de traçage:
  Tables totales avec champs audit: X
  Tables avec created_by ET updated_by: X
========================================
```

---

## ✅ Après l'Exécution

Une fois les colonnes ajoutées, vous devrez :

1. **Mettre à jour les contrôleurs backend** pour remplir automatiquement :
   - `created_by` lors des CREATE
   - `updated_by` lors des UPDATE

2. Les valeurs doivent venir de `req.user.id` après authentification.

---

## 🔄 Script Idempotent

Le script peut être exécuté plusieurs fois sans risque :
- Il vérifie si les colonnes existent avant de les ajouter
- Il n'ajoute pas de doublons
- Il est sûr de réexécuter
