# fabrication/coupe — Coupe & journal pièces

Réf. §7.19. Catégories : `1er_choix`, `2e_choix`, `dechet`, `ourlet_retouche`, `approuve`.

## Endpoints (`/api/v2/fabrication/coupe`)

- `GET|POST /sessions` — sessions de coupe
- `POST /sessions/:id/cloturer` — clôture + décompte auto stock PF (mouvement `entree_fabrication`)
- `GET|POST /pieces` — journal pièces
- `GET /of/:id_of/stats` — formules §7.19 :
  - `total_controle = qte_prem+qte_deux+dechet+ourlet`
  - `fabrique = qte_prem+approuve`
  - `taux_2eme_choix`, `taux_dechet`
