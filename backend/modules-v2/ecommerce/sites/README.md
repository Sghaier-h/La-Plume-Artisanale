# ecommerce/sites — Sites e-commerce

**Table** : `sites_ecommerce` (schema-v2/29_ecommerce.sql)
**Contrat** : `docs/domain.md §11quinquies.2`
**Route** : `/api/v2/ecommerce/sites`

CRUD standard sur les sites e-commerce (Shopify, WooCommerce, Next.js custom).
Les champs `api_key`, `api_secret`, `webhook_secret` reçus en clair sont chiffrés
AES-256-GCM (clé `process.env.ENCRYPTION_KEY`) avant persistance, et masqués en sortie.

Le service expose `getWithSecrets(id)` / `getByCodeWithSecrets(code)` pour un usage
interne (sync, réception webhooks) — jamais exposé via l'API HTTP.
