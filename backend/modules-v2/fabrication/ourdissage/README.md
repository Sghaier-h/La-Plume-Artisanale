# fabrication/ourdissage — Ourdissage & ensouples

Réf. §7.17. Seuil alerte 500 m, plafond ensouple 5000 m.

## Formule poids fil chaîne (§7.17 / §7.21)

```
poids_kg = (nb_fils × metres × 2) / (NM × 1000)
```

Implémentée dans `formule.js` (`calculPoidsChaineKg`), testée dans `__tests__/formule.test.js` (exécution : `node --test`).

## Endpoints (`/api/v2/fabrication/ourdissage`)

- `GET /` — lister ensouples (filtres `id_machine`, `statut`)
- `GET /:id` — détail
- `POST /` — créer ensouple (numérotation auto `OURD-YYYY-NNNNN`, calcul poids auto)
- `POST /simuler-poids` — utilitaire client (renvoie `poids_theorique_kg`)
- `POST /:id/receptionner` — réception physique + `metrage_reel_m`
- `PUT /:id/metrage` — MAJ métrage en cours
