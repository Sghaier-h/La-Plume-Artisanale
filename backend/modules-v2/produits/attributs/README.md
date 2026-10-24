# produits/attributs — v2

Paramètres catalogue : dimensions, couleurs, finitions, tissages, modèles,
nombre de couleurs, types de personnalisation. Handlers legacy portés verbatim
(Phase G3) depuis `backend/modules/parametres-catalogue/` (supprimé).

Endpoints sous `/api/v2/produits/attributs` :
- `GET /complet` → tout le paramétrage en une requête
- `GET|POST|PUT|DELETE /:type(dimensions|couleurs|finitions|tissages|modeles|nombre-couleurs)`
- CRUD générique sur `parametres_catalogue` (compat legacy)
