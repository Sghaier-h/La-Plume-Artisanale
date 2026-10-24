# fabrication/mrp — v2

MRP (Manufacturing Resource Planning). Handlers legacy portés verbatim
(Phase G3) depuis `backend/modules/mrp/` (supprimé).

Ressources exposées sous `/api/v2/fabrication/mrp/*` :

| Ressource     | Chemin                  |
| :------------ | :---------------------- |
| Productions   | `/productions`          |
| BOMs          | `/boms`                 |
| Work centers  | `/work-centers`         |
| Work orders   | `/work-orders`          |
| Routings      | `/routings`             |

Pour chacune : CRUD standard + endpoints spécifiques (voir chaque fichier
`mrp_<ressource>.routes.js`).
