# produits/articles — v2

CRUD articles catalogue (§5.5 domain.md).

Génération auto des références :
- `ref_commerciale` = `{MODELE}{DIM4}-{LETTRE}{CODE_COULEUR}-{SUFFIXE_NUANCE}[-{CODES_ADD}]`
- `ref_fabrication` = idem avec tiret entre lettre et code_couleur
- `code_article` = préfixe technique auto

Réponse 409 sur violation contrainte unique (`VARIANTE_DEJA_EXISTANTE`).

Endpoints : `GET / GET/:id / POST / PUT/:id / DELETE/:id`.
