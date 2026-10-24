# fabrication/finition — Postes finition

Opère sur `of_postes.code_poste = 'finition'`. Couvre ourlet, frange, lavage, repassage, sérigraphie (§7.4).

## Endpoints (`/api/v2/fabrication/finition`)

- `GET /postes` — filtres `id_of`, `id_operateur`, `statut`
- `GET /postes/:id`
- `POST /postes/:id/demarrer` — passe `statut=en_cours` + horodatage
- `POST /postes/:id/terminer` — passe `statut=termine` + quantités
