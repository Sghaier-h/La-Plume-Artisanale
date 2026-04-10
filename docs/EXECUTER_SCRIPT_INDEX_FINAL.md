# 📋 Exécuter le Script SQL d'Index - Commande Correcte

## Problème

Les variables d'environnement (`$DB_HOST`, `$DB_USER`, `$DB_NAME`) ne sont pas chargées.

## Solution

### Option 1 : Charger les Variables d'Environnement

```bash
cd /opt/fouta-erp/backend

# Charger les variables depuis .env
export $(cat .env | grep -v '^#' | xargs)

# Vérifier que les variables sont chargées
echo "DB_HOST=$DB_HOST"
echo "DB_USER=$DB_USER"
echo "DB_NAME=$DB_NAME"

# Exécuter le script
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
```

### Option 2 : Utiliser les Valeurs Directement

Si les variables ne se chargent pas, utilisez les valeurs directement :

```bash
cd /opt/fouta-erp/backend

# Voir les valeurs dans .env
cat .env | grep DB_

# Puis utiliser directement (remplacer avec vos vraies valeurs)
psql -h [VOTRE_HOST_OVH] -U [VOTRE_USER] -d [VOTRE_DB] -f database/add_missing_indexes.sql
```

---

## Résultat Attendu

- ✅ Des NOTICE pour les index existants (normal)
- ✅ Pas d'erreur `column "ordre_affichage" does not exist` (corrigé)
- ✅ Message `Query returned successfully` à la fin
