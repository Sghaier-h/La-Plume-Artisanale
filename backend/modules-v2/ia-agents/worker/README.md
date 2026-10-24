# Worker IA — La Plume Artisanale

Implémentation Phase 5 des **agents IA autonomes** (§11ter + §14bis.6bis).

Ce dossier contient le worker Node.js qui :
1. Charge la config des 10 agents seed depuis `agents_config`
2. Exécute les requêtes SQL en **lecture seule** via un rôle Postgres dédié
3. Envoie prompt système + données au LLM (Claude / OpenAI)
4. Persiste les findings dans `agents_findings` (avec `sql_correction_proposee` optionnel)
5. Trace tokens & coûts dans `agents_runs`

Les corrections proposées par un agent **ne sont jamais appliquées automatiquement**. Elles suivent le workflow §14bis.6bis (proposition → validation humaine ADMIN → application transactionnelle → rollback 24 h).

---

## Fichiers

| Fichier | Rôle |
|---|---|
| `llm-client.js` | Client unifié Claude/OpenAI (auto-détection clé, calcul coût USD, `safeJsonParse`). |
| `db-readonly-client.js` | Pool PG lecture seule + garde SQL destructif (regex + `SET LOCAL default_transaction_read_only`). |
| `db-correction-client.js` | Pool PG correction (UPDATE/INSERT), refuse DROP/TRUNCATE, transaction avec audit `agents_ia_corrections_appliquees`. |
| `agent-runner.js` | Cœur : charge prompt, exécute blocs `sql`, appelle LLM, parse JSON, insère findings. Verrou anti-concurrence par agent. |
| `scheduler.js` | Boucle `setInterval` — chaque agent tourne selon `parametres.frequence_minutes`. |
| `start-scheduler.js` | Entrypoint standalone. Arrêt propre sur SIGINT/SIGTERM. |

---

## Variables d'environnement requises

### Obligatoires

| Nom | Description |
|---|---|
| `ANTHROPIC_API_KEY` **ou** `OPENAI_API_KEY` | Au moins une des deux ; le client détecte automatiquement. |
| `IA_READONLY_DATABASE_URL` | Chaîne de connexion PG vers le rôle `ia_readonly_bot` (SELECT only). |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Pool applicatif (déjà utilisé par le backend). |

### Requises uniquement pour appliquer des corrections

| Nom | Description |
|---|---|
| `IA_CORRECTION_DATABASE_URL` | Chaîne de connexion vers `ia_correction_bot` (UPDATE/INSERT granulaires). |

### Optionnelles (défauts raisonnables)

| Nom | Défaut | Rôle |
|---|---|---|
| `IA_LLM_TIMEOUT_MS` | 60000 | Timeout HTTP appel LLM. |
| `IA_AGENT_TIMEOUT_MS` | 90000 | Timeout global d'un run agent. |
| `IA_SCHEDULER_TICK_MS` | 60000 | Fréquence de la boucle scheduler. |
| `IA_READONLY_MAX_ROWS` | 5000 | Plafond de lignes retournées par requête. |
| `IA_READONLY_STMT_TIMEOUT_MS` | 15000 | Timeout PG côté rôle readonly. |
| `IA_CORRECTION_STMT_TIMEOUT_MS` | 30000 | Timeout PG côté rôle correction. |

---

## Commandes DBA (à exécuter une fois)

```sql
-- Rôle lecture seule (agents)
CREATE ROLE ia_readonly_bot LOGIN PASSWORD 'change-me';
GRANT CONNECT ON DATABASE laplume TO ia_readonly_bot;
GRANT USAGE ON SCHEMA public TO ia_readonly_bot;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ia_readonly_bot;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ia_readonly_bot;
-- Sécurité : REFUSE tout ce qui n'est pas SELECT au niveau rôle
ALTER ROLE ia_readonly_bot SET default_transaction_read_only = on;

-- Rôle correction (validé humain)
CREATE ROLE ia_correction_bot LOGIN PASSWORD 'change-me';
GRANT CONNECT ON DATABASE laplume TO ia_correction_bot;
GRANT USAGE ON SCHEMA public TO ia_correction_bot;
-- Grants granulaires — à ajuster selon les tables sur lesquelles on autorise les corrections.
-- Exemples types :
GRANT INSERT ON ecritures_comptables TO ia_correction_bot;                  -- écritures de régularisation
GRANT UPDATE (statut, notes_traitement) ON agents_findings TO ia_correction_bot;
-- ⚠️ Ne jamais donner DELETE / DROP / TRUNCATE / GRANT / REVOKE / ALTER ROLE.
```

Ensuite, dans `IA_CORRECTION_DATABASE_URL` et `IA_READONLY_DATABASE_URL`, encoder les URL correspondantes :
```
postgres://ia_readonly_bot:change-me@localhost:5432/laplume?sslmode=require
postgres://ia_correction_bot:change-me@localhost:5432/laplume?sslmode=require
```

---

## Lancement

```bash
# 1. Appliquer le schéma
psql "$DATABASE_URL" -f database/schema-v2/26_ia_agents.sql
psql "$DATABASE_URL" -f database/schema-v2/33_ia_corrections.sql
psql "$DATABASE_URL" -f database/seeds-v2/19_agents_ia.sql

# 2. Configurer l'env (voir ci-dessus), puis démarrer le worker :
node backend/modules-v2/ia-agents/worker/start-scheduler.js
```

Le worker tourne indéfiniment. Journalise :
```
[worker-ia] scheduler { started: true, tick_ms: 60000 }
[ia-scheduler] ✓ STOCK_MONITOR — 3 findings — 4210 ms
[ia-scheduler] ✓ FINANCE_MONITOR — 0 findings — 3100 ms
```

Pour un run ponctuel manuel (hors scheduler), appeler l'API :
```
POST /api/v2/ia-agents/scheduler/trigger/:idAgent
```

---

## Prompts

Les 10 prompts vivent dans `../prompts/*.md` — un fichier par agent seed. Chacun contient :
- rôle métier
- blocs ```` ```sql name=... ```` (les blocs sont extraits, exécutés en readonly, injectés dans le contexte user)
- format JSON attendu
- 2-3 exemples de findings

Un prompt peut aussi être persisté dans `agents_prompts.contenu` (multi-version). Si `agents_config.id_prompt_actif` est renseigné, il prime sur le fichier `.md`.

---

## Sécurité — résumé

1. **Lecture seule stricte** : rôle PG `ia_readonly_bot` + `default_transaction_read_only=on` + regex client-side qui refuse INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER/CREATE/GRANT/REVOKE/COPY/…
2. **Une seule instruction par appel** — la présence d'un `;` en dehors du terminateur est refusée (anti multi-statement).
3. **Plafond de lignes** (défaut 5000) et **statement_timeout** PG (défaut 15 s).
4. **Budget tokens** contrôlé par `agents_config.budget_tokens` + `max_tokens` passé au LLM.
5. **Timeout agent** global (défaut 90 s) — au-delà, le run est marqué `timeout`.
6. **Validation humaine obligatoire** pour toute correction (endpoint `POST /findings/:id/valider-correction`, rôle ADMIN).
7. **Rollback 24 h** matérialisé par `date_rollback_limite` (colonne générée) — au-delà : régularisation manuelle avec motif (§14bis.6bis).
8. **DROP/TRUNCATE/GRANT/REVOKE** refusés même via le rôle correction (défense double).
9. **Trace complète** : `agents_runs`, `agents_findings`, `agents_ia_corrections_appliquees` — snapshot avant/après en JSONB.

---

## Développement

- Aucun appel LLM réel n'a lieu tant que les clés ne sont pas définies. En dev sans clé, `askLLM` lève.
- Le pool readonly refuse de démarrer sans `IA_READONLY_DATABASE_URL` — permet de tester le module (imports) sans DB.
- Tester la garde SQL : `import { _internal } from './db-readonly-client.js'; _internal.assertReadOnly("DROP TABLE users")` → lève.
