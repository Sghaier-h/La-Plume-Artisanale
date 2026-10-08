# 📋 Commandes SQL à Exécuter sur le Serveur

## Exécuter le Script d'Index

Depuis `/opt/fouta-erp/backend`, exécuter :

```bash
# 1. Charger les variables d'environnement (si pas déjà chargées)
export $(cat .env | grep -v '^#' | xargs)

# 2. Vérifier les variables
echo "DB_HOST=$DB_HOST"
echo "DB_USER=$DB_USER"
echo "DB_NAME=$DB_NAME"

# 3. Exécuter le script SQL
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
```

**Note :** Vous serez invité à saisir le mot de passe PostgreSQL.

---

## Alternative : Si les variables ne sont pas chargées

```bash
# Vérifier d'abord les valeurs dans .env
cat .env | grep DB_

# Puis exécuter avec les valeurs explicites
psql -h [VOTRE_HOST] -U [VOTRE_USER] -d [VOTRE_DB] -f database/add_missing_indexes.sql
```

---

## Exemple Complet

```bash
# Depuis /opt/fouta-erp/backend
cd /opt/fouta-erp/backend

# Charger les variables
export $(cat .env | grep -v '^#' | xargs)

# Exécuter le script
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
```

**Vous serez invité à saisir le mot de passe.**
