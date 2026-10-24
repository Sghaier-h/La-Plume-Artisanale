# publicite/comptes — Comptes publicitaires externes

**Table** : `comptes_pub_externes`
**Contrat** : `docs/domain.md §11quinquies.9`
**Route** : `/api/v2/publicite/comptes`

CRUD standard. Les champs `access_token` et `refresh_token` reçus en clair sont
chiffrés AES-256-GCM (clé `process.env.ENCRYPTION_KEY`), stockés dans
`access_token_encrypted` / `refresh_token_encrypted`, et masqués en sortie.

`service.getWithTokens(id)` déchiffre à usage interne (adapteur API pub).
