# Module comptabilite/caisse

**Domaine** : D (Ventes/Achats/Compta/RH/IA/Comms)
**Table principale** : `mouvements_caisse`
**Endpoint** : `/api/v2/comptabilite/caisse`
**Format enveloppe** : `{ success, data, error }`

## Endpoints par défaut
- `GET    /`         — liste (filtres via query)
- `GET    /:id`      — détail
- `POST   /`         — création
- `PUT    /:id`      — mise à jour
- `DELETE /:id`      — suppression

Voir `docs/domain.md` pour la spec fonctionnelle.
