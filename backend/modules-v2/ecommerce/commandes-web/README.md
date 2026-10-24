# ecommerce/commandes-web — Réception & import commandes web

**Table** : `commandes_web` (+ `commandes` ERP côté sortie)
**Contrat** : `docs/domain.md §11quinquies.4`
**Route** : `/api/v2/ecommerce/commandes-web`

## Webhooks (body brut requis)

| Méthode | Chemin | En-tête HMAC |
|---|---|---|
| `POST` | `/webhook/:site_code`     | `X-Shopify-Hmac-Sha256` (base64) |
| `POST` | `/webhook-woo/:site_code` | `X-WC-Webhook-Signature` (base64) |

Le secret HMAC est chiffré dans `sites_ecommerce.webhook_secret_hmac`.
Un `express.raw()` local capture le body brut nécessaire à la vérification.

## Flux
1. Webhook reçu → HMAC vérifié → payload persisté en `statut_web = 'reçue'`
   (idempotent : `(id_site, reference_externe)` UNIQUE).
2. `POST /:id/convertir` → trouve/crée le compte CRM, insère la commande ERP
   (statut `brouillon`), passe la commande web à `statut_web = 'importee'` avec
   `id_commande_erp` renseigné. En cas d'erreur, statut `erreur` + `erreur_import`.
