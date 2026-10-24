# backend/modules-v2 — Domaine D

Modules v2 du domaine **D : Ventes / Achats / Comptabilité / RH / IA / Comms**.
Aucun fichier de `backend/modules/` n'a été modifié.

## Groupes
- **ventes/** — devis, commandes, bl, factures, avoirs, paiements, colisage, palettes
- **achats/** — fournisseurs, bc, receptions, factures-ff
- **comptabilite/** — ecritures, tva, caisse, cloture
- **rh/** — employes, contrats, paie, pointage, conges, recrutement, cnss, irpp
- **ia-agents/** — config, runs, findings, scheduler
- **comms/** — messagerie, notifications, whatsapp, email

## Convention par module
```
routes.js       # Express router
controller.js   # Handlers HTTP (enveloppe { success, data, error })
service.js      # Logique métier
model.js        # Accès DB (pg pool)
manifest.js     # Métadonnées module
README.md
```

## Montage
```js
import buildV2Router from './modules-v2/index.js';
const v2 = await buildV2Router();
app.use(v2);
```

## Schémas SQL associés
Voir `database/schema-v2/15..27_*.sql` et seeds `database/seeds-v2/15..20_*.sql`.

## Points critiques implémentés
- **factures.calculerTotaux** : TVA multi-taux + timbre fiscal 1 DT (Tunisie) — test unitaire `ventes/factures/service.test.js`.
- **commandes.genererOFs** : auto-génération OF depuis commande validée, avec traçabilité ligne → OF (`commande_of_liens`).
- **colisage / palettes** : formats `C{XXX}-{YYY}-{NNN}` et `PAL{YY}-{seq}` — utilisent `NumeroSequenceService` s'il est présent, sinon fallback local.
- **ia-agents/scheduler** : cron par agent actif via `node-cron` (déclenchement + trace dans `agents_runs`).
