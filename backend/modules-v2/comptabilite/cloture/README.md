# Module comptabilite/cloture

**Domaine** : D (Ventes/Achats/Compta/RH/IA/Comms)
**Table principale** : `cloture_periodes`
**Endpoint** : `/api/v2/comptabilite/cloture`
**Format enveloppe** : `{ success, data, error }`

## Endpoints par défaut
- `GET    /`         — liste (filtres via query)
- `GET    /:id`      — détail
- `POST   /`         — création
- `PUT    /:id`      — mise à jour
- `DELETE /:id`      — suppression

Voir `docs/domain.md` pour la spec fonctionnelle.
