# Module rh/primes-cagnottes

Cagnottes hebdomadaires par atelier — enveloppe globale répartie selon les scores
individuels (§11bis.7bis de `docs/domain.md`). Base d'entrée du dispositif
**prime de rendement HORS BULLETIN** (compte 648, non-CNSS, IRPP séparé).

- **Table** : `primes_cagnottes_semaine`
- **Endpoint racine** : `/api/v2/rh/primes-cagnottes`
- **Auth** : `ADMIN | RH_MANAGER` sur toutes les mutations.

## Endpoints

| Méthode | Route                        | Rôle        | Description |
|---------|------------------------------|-------------|-------------|
| GET     | `/`                          | public v2   | Liste (filtres `annee`, `numero_semaine`, `atelier`, `statut`) |
| GET     | `/:id`                       | public v2   | Détail |
| POST    | `/`                          | ADMIN\|RH   | Création (`annee`, `numero_semaine`, `atelier`, `montant_dt` requis) |
| PUT     | `/:id`                       | ADMIN\|RH   | Modif (bloqué si `payee`) |
| DELETE  | `/:id`                       | ADMIN\|RH   | Suppression (bloquée si `statut != ouverte`) |
| POST    | `/:id/calculer`              | ADMIN\|RH   | Agrège `primes_scores_journaliers` sur la semaine → `total_scores_equipe`, `nb_employes_eligibles`, `statut='calculee'` |
| POST    | `/:id/valider`               | ADMIN\|RH   | Génère un bordereau par employé éligible (montant = score/total × cagnotte), `statut='validee'` |
| POST    | `/:id/marquer-payee`         | ADMIN\|RH   | `statut='payee'` + `date_paiement`, `paye_par` |

## Formule de répartition

```
montant_bordereau = (score_semaine_employe / total_scores_equipe) × montant_cagnotte
```

La somme est stockée dans `primes_cagnottes_semaine.montant_reparti_dt` après
validation (arrondi à 3 décimales). Un léger delta d'arrondi vs `montant_dt` est
possible et documenté par le champ.

## Workflow

```
ouverte  ── POST /calculer ──▶  calculee
                                   │
                                   ▼
                     POST /valider (crée bordereaux)
                                   │
                                   ▼
                                validee
                                   │
                                   ▼
                     POST /marquer-payee
                                   │
                                   ▼
                                 payee
```

## ISO Week

L'agrégation des scores utilise `EXTRACT(ISOYEAR)` + `EXTRACT(WEEK)` sur
`date_journee` pour rester compatible avec la contrainte
`numero_semaine BETWEEN 1 AND 53`.
