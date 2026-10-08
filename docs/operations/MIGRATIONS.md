# Convention de migrations SQL - La Plume Artisanale

Ce document fixe **la seule facon** d'ajouter ou modifier un fichier SQL
dans `database/schema-v2/` ou `database/seeds-v2/` sans risquer de casser
la prod OVH.

Toute la logique est appliquee automatiquement par
`backend/src/database/migrate.js` (voir `--dry-run` pour tester).

## 1. Numerotation

Chaque fichier suit le motif :

```
NN_description_courte.sql
```

- `NN` est un entier zero-padde a 2 chiffres, croissant sans trou
  (`01_`, `02_`, ... `33_`, prochain = `34_`).
- Description courte en snake_case, en francais.
- Un fichier = un theme (module ou seed d'un domaine).

Files existants (ne PAS renumeroter) :

- `00_migrations.sql` : table de tracking, execute en tout premier.
- `01_core.sql` -> `33_ia_corrections.sql` : deja deployes en prod.
- `seeds-v2/01_roles.sql` -> `seeds-v2/20_types_conges.sql`.

## 2. Regle d'or : immuabilite

**Une fois un fichier deploye en prod, on ne le modifie plus JAMAIS.**

Le script `migrate.js` calcule un `SHA-256` du contenu et le compare a
`schema_migrations.checksum_sha256`. Toute divergence :

- Affiche un warning rouge `[WARN!] checksum different`.
- **Skip** le fichier par defaut (protection).
- N'est reapplique qu'avec `--force` (a n'utiliser qu'en dev, jamais en
  prod sans backup complet).

Pour corriger un fichier deja deploye : creer un `NN+1_fix_xxx.sql`.

## 3. Idempotence obligatoire

Chaque nouveau fichier DOIT pouvoir se rejouer sans casser :

```sql
CREATE TABLE IF NOT EXISTS ...
ALTER TABLE mytable ADD COLUMN IF NOT EXISTS new_col TEXT;
CREATE INDEX IF NOT EXISTS idx_xxx ON ...
INSERT INTO ref_table (code, label) VALUES ('X','Y') ON CONFLICT (code) DO NOTHING;
CREATE OR REPLACE VIEW ...
CREATE OR REPLACE FUNCTION ...
```

Les seeds v2 utilisent `ON CONFLICT DO NOTHING` ou `ON CONFLICT ... DO UPDATE`.

## 4. Changements destructifs : procedure en 3 phases

### 4.1 Renommer une colonne

1. Deploiement N   : `ALTER TABLE t ADD COLUMN IF NOT EXISTS new_name ...;`
                     puis backfill `UPDATE t SET new_name = old_name WHERE new_name IS NULL;`
2. Deploiement N+1 : mettre a jour tout le code applicatif pour lire/ecrire `new_name`.
3. Deploiement N+2 : marquer `old_name` DEPRECATED en commentaire ; drop
                     uniquement quand plus aucun code prod ne l'utilise
                     (delai minimum 2 releases).

### 4.2 Renommer une table

1. `ALTER TABLE ancien_nom RENAME TO nouveau_nom;`
2. `CREATE OR REPLACE VIEW ancien_nom AS SELECT * FROM nouveau_nom;`

Le code applicatif continue de fonctionner pendant la transition. Retirer
la vue dans un deploiement ulterieur seulement.

### 4.3 Supprimer une colonne / table

Interdit tant que du code prod la lit. Etapes :

1. Retirer toutes les references dans le code (frontend + backend).
2. Deployer.
3. Attendre au moins une release stable.
4. Dans un fichier dedie `NN_drop_xxx.sql`, exposer un `DROP ... IF EXISTS`.

## 5. Transactions

`migrate.js` execute chaque fichier dans **sa propre transaction**
(`BEGIN ... COMMIT`). En cas d'erreur :

- ROLLBACK du fichier en cours (aucun objet cree).
- Les fichiers precedents restent commit.
- Le script s'arrete, exit code 3.
- L'echec est trace dans `schema_migrations` avec `success = FALSE` et
  `error_message`. Le script retente automatiquement ce fichier au
  prochain run.

## 6. Ne PAS mettre dans une migration

- Longues transactions bloquantes en prod : privilegier `CREATE INDEX
  CONCURRENTLY` (attention : requiert `-c` sans transaction wrapper --
  `migrate.js` execute avec `BEGIN` donc les index CONCURRENTLY
  necessitent un fichier a part, sans autre statement).
- Donnees confidentielles (mots de passe, clefs API) : passer par les
  variables d'env.
- Donnees synthetiques massives : reserver aux seeds locaux
  (`insert_donnees_test.sql`), pas de seeds `seeds-v2/`.

## 7. Cycle recommande pour un nouveau schema

```bash
# 1. Creer le fichier
touch database/schema-v2/34_nouveau_module.sql

# 2. Ecrire le DDL idempotent, tester en local sur fouta_dev
psql -U postgres -d fouta_dev -f database/schema-v2/34_nouveau_module.sql

# 3. Verifier ce que migrate.js va faire
cd backend && npm run migrate:dry

# 4. Appliquer en dev
cd backend && npm run migrate

# 5. Test integration (verifier que le backend / frontend fonctionne)

# 6. Commit + push. Le workflow deploy-safe.yml applique en prod avec
#    backup automatique et rollback en cas d'echec.
```

## 8. En cas de panique

- Le fichier `/var/backups/fouta-erp/last-backup-restore.sh` (genere par
  chaque `backup.sh`) restaure le dernier dump complet apres verification
  du SHA-256.
- Les backups anterieurs sont dans `/var/backups/fouta-erp/db_*.sql.zst`
  (ou `.gz`) avec leur checksum `.sha256`.
- Historique complet dans `schema_migrations` :
  ```sql
  SELECT filename, applied_at, applied_by, success, error_message
    FROM schema_migrations ORDER BY applied_at DESC LIMIT 30;
  ```
