# 🔧 Résoudre le Blocage de psql (Mot de Passe)

## Le Problème

La commande `psql` se bloque car elle attend la saisie du mot de passe.

## Solution : Utiliser PGPASSWORD

### Option 1 : Depuis le .env (Recommandé)

```bash
cd /opt/fouta-erp/backend

# Charger toutes les variables (y compris DB_PASSWORD)
export $(cat .env | grep -v '^#' | xargs)

# Utiliser PGPASSWORD
export PGPASSWORD="$DB_PASSWORD"

# Exécuter le script
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
```

### Option 2 : Saisir le Mot de Passe Manuellement

Si `DB_PASSWORD` n'est pas dans `.env` ou si vous préférez :

```bash
cd /opt/fouta-erp/backend

# Charger les variables
export $(cat .env | grep -v '^#' | xargs)

# Exécuter (vous serez invité à saisir le mot de passe)
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
# Tapez le mot de passe quand demandé, puis appuyez sur Enter
```

### Option 3 : Utiliser un Fichier .pgpass (Sécurisé)

```bash
# Créer le fichier .pgpass dans le home
echo "$DB_HOST:5432:$DB_NAME:$DB_USER:$DB_PASSWORD" > ~/.pgpass
chmod 600 ~/.pgpass

# Maintenant psql peut se connecter sans demander le mot de passe
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql
```

---

## Si la Commande est Bloquée

**Interrompre** : Appuyez sur `Ctrl+C` pour annuler la commande en cours.

Puis utilisez l'une des solutions ci-dessus.
