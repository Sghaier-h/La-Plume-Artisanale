# ecommerce/promo — Codes promo web

**Table** : `codes_promo_web`
**Contrat** : `docs/domain.md §11quinquies.8`
**Route** : `/api/v2/ecommerce/promo`

## Endpoints spécifiques

| Méthode | Chemin | Description |
|---|---|---|
| `POST` | `/valider`     | Valide un code au checkout (`{id_site, code, canal, montant_ht, id_compte}`) |
| `POST` | `/:id/utilise` | Incrémente `usage_courant` après application effective |

Réponse `/valider` :
```json
{ "valide": true, "id_promo": 12, "type_remise": "pct",
  "remise_ht": 25.500, "livraison_gratuite": false, "produit_offert": false,
  "usages_restants": 42 }
```
Motifs de refus : `introuvable_ou_expire`, `canal_incompatible`, `montant_min_non_atteint`, `quota_total_atteint`.
