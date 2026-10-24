# fabrication/ordres — Ordres de Fabrication

Réf. `docs/domain.md` §7.5, §7.14, §7.15.

## Endpoints (`/api/v2/fabrication/ordres`)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/` | Lister OF (filtres `statut`, `id_machine_prevue`, `id_commande`) |
| GET | `/:id` | Détail OF |
| POST | `/` | Créer OF — numéro auto via `NumeroSequenceService` |
| POST | `/auto-depuis-commande/:id_commande` | Auto-création OF depuis commande validée |
| POST | `/:id/statut` | Changer statut + journal `of_status_transitions` |
| PUT | `/:id` | Mise à jour partielle |
| DELETE | `/:id` | Suppression |

## Numérotation

- `type_of=commande`  → `OF{6chiffres}`
- `type_of=stock`     → `CA{4chiffres}`
- `type_of=complement` → `<parent>.<n>` (§7.15, `priorite=urgente`, `ordre_planif_machine=0`)

## Enveloppe

Toutes les réponses suivent `{ success, data, meta, error }`.
