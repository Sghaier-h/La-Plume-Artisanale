# 🔧 Correction du Script SQL d'Index

## Erreur Rencontrée

```
ERROR:  column "ordre_affichage" does not exist
SQL state: 42703
```

## Cause

Le script essayait de créer un index sur la colonne `ordre_affichage` qui n'existe pas dans la table `articles_catalogue`.

## Solution

Le script a été corrigé pour vérifier l'existence de la colonne avant de créer l'index.

---

## Correction Appliquée

### Avant (ligne ~193)
```sql
CREATE INDEX IF NOT EXISTS idx_articles_ordre_affichage ON articles_catalogue(ordre_affichage, actif);
```

### Après (corrigé)
```sql
-- Articles par ordre d'affichage (vérifier si colonne existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'articles_catalogue' 
        AND column_name = 'ordre_affichage'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_articles_ordre_affichage ON articles_catalogue(ordre_affichage, actif);
    END IF;
END $$;
```

---

## Exécuter le Script Corrigé

```bash
cd /opt/fouta-erp/backend
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
```

Le script devrait maintenant s'exécuter sans erreur. Les index existants seront ignorés (NOTICE), et l'index sur `ordre_affichage` ne sera créé que si la colonne existe.

---

## Résultat Attendu

- ✅ Tous les index créés/vérifiés (NOTICE pour ceux qui existent déjà)
- ✅ Pas d'erreur `column does not exist`
- ✅ Message `Query returned successfully`
