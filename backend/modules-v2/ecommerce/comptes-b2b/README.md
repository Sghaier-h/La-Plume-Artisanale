# ecommerce/comptes-b2b — Comptes B2B web + KYC

**Table** : `comptes_b2b_web`
**Contrat** : `docs/domain.md §11quinquies.1bis`
**Route** : `/api/v2/ecommerce/comptes-b2b`

## Endpoints spécifiques

| Méthode | Chemin | Description |
|---|---|---|
| `GET`  | `/kyc/pending` | Liste des dossiers KYC en attente / vérification |
| `POST` | `/:id/kyc/upload` | Enregistre l'URL d'un document (`{type: rc|mf|cin, url}`) |
| `POST` | `/:id/kyc/valider` | Valide le KYC (ADMIN ou COMMERCIAL) |
| `POST` | `/:id/kyc/refuser` | Refuse avec motif (ADMIN ou COMMERCIAL) |
| `POST` | `/:id/kyc/suspendre` | Suspend un compte déjà validé |

- Validation refuse si RC et MF manquants.
- Refus exige un motif ≥ 5 caractères.
- Le mot de passe entrant (`mot_de_passe`) est hashé scrypt et stocké dans `mot_de_passe_hash`.
