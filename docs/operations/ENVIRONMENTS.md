# Environnements DB - La Plume Artisanale

Trois environnements distincts, jamais melanges.

## DEV (poste local)

| Cle           | Valeur                                          |
|---------------|-------------------------------------------------|
| Serveur       | Postgres local (laptop)                         |
| DB name       | `fouta_dev`                                     |
| Donnees       | Synthetiques (`insert_donnees_test.sql`) + fixtures |
| Backup        | Non requis (jetable)                            |
| Reset         | `dropdb fouta_dev && createdb fouta_dev && npm run migrate` |
| Access        | Developpeur, `USE_MOCK_AUTH=true` autorise      |

`.env` local :
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fouta_dev
DB_USER=postgres
DB_PASSWORD=***
```

## STAGING (VPS OVH, base separee)

| Cle           | Valeur                                          |
|---------------|-------------------------------------------------|
| Serveur       | OVH CloudDB (meme cluster que prod)             |
| DB name       | `fouta_staging`                                 |
| Donnees       | Replique prod anonymisee (script a creer)       |
| Backup        | Quotidien (garde 3 jours)                       |
| Reset         | Autorise, refresh depuis prod anonymise         |
| Access        | Devs + QA                                       |

Anonymisation recommandee (script a ecrire dans `scripts/anonymize-staging.sh`) :

- Clients : `nom_client = 'Client ' || id`, `email = 'client'||id||'@example.tn'`, `telephone = '+21600000'||LPAD(id::text,3,'0')`.
- Employes : `nom = 'Nom' || id`, `prenom = 'Prenom' || id`, mots de passe hash reset a un mdp connu QA.
- Chiffres d'affaires : arrondis ou jitters +/- 15 %.
- Adresses, numeros de TVA : masques.

## PROD (VPS OVH)

| Cle           | Valeur                                          |
|---------------|-------------------------------------------------|
| Serveur       | OVH CloudDB (`*.clouddb.ovh.net`)               |
| DB name       | `fouta_erp` (ou `fouta_prod` selon setup)       |
| Donnees       | Reelles clients/commandes/employes              |
| Backup        | **Toutes les 6h** via cron (backup.sh)          |
| Retention     | 7 jours locale + snapshot OVH quotidien         |
| Modification  | **Jamais manuelle**. Uniquement via `deploy-safe.sh` |
| Access        | Restreint : allbyfouta@gmail.com + ops OVH      |

Cron recommande (crontab -e root sur VPS) :
```cron
# Backup DB toutes les 6h
0 */6 * * * /opt/laplume/scripts/backup.sh >> /var/log/fouta-backup.log 2>&1

# Cleanup logs mensuel
0 3 1 * * find /var/log/fouta-backup.log.* -mtime +30 -delete
```

## Isolation

- **Jamais** de `psql` prod depuis un poste dev en interactif.
- Une seule branche deploie en prod : `main`.
- Le workflow `.github/workflows/deploy-safe.yml` est le seul chemin
  autorise.
- La variable `DATABASE_URL` sur le VPS pointe sur `fouta_erp` prod ;
  sur staging, une variable distincte `STAGING_DATABASE_URL`.

## Passer un dump prod -> staging (rafraichir)

```bash
# Sur le VPS
BACKUP_DIR=/tmp/refresh-staging DB_NAME=fouta_erp bash scripts/backup.sh

# Recuperer le dump le plus recent, restaurer sur staging
LATEST=$(ls -t /tmp/refresh-staging/db_*.sql.zst | head -1)
zstd -d --stdout "$LATEST" | psql -U fouta_user -d fouta_staging

# Anonymiser
bash scripts/anonymize-staging.sh   # a creer
```

Ne JAMAIS faire l'inverse (staging -> prod).
