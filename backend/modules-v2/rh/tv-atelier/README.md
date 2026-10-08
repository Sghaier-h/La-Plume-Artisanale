# Module rh/tv-atelier

Écrans muraux d'atelier (55") — 2 par défaut : `tissage` et
`finition/preparation`. Diffuse en temps réel :
- Top 5 employés semaine (score cumulé)
- Horloge + KPI journée + KPI semaine
- Barre horaire idéal (100%) vs réel
- Perte déchet (kg + DT)
- Nombre 2ᵉ choix vs 1ᵉʳ choix

Spec : `docs/domain.md` §11bis.7bis.

- **Tables** : `tv_atelier_config`, `tv_atelier_snapshots`
- **Endpoint racine** : `/api/v2/rh/tv-atelier`

## Endpoints

| Méthode | Route                    | Auth        | Description |
|---------|--------------------------|-------------|-------------|
| GET     | `/tv/:url_token`         | **AUCUNE**  | Config + dernier snapshot (usage TV murale) |
| GET     | `/`                      | ADMIN\|RH   | Liste |
| GET     | `/:id`                   | ADMIN\|RH   | Détail |
| POST    | `/`                      | ADMIN\|RH   | Création (`url_token` auto-généré si absent) |
| PUT     | `/:id`                   | ADMIN\|RH   | Modification |
| DELETE  | `/:id`                   | ADMIN\|RH   | Suppression |
| POST    | `/:id/snapshot`          | ADMIN\|RH   | Force un nouveau snapshot immédiat |

## Token public

- `url_token` : 32 caractères hex (`crypto.randomBytes(16)`).
- Le token remplace l'authentification : à protéger comme un secret. Il est
  généré automatiquement à la création si non fourni.
- `derniere_connexion` et `ip_tv` sont mis à jour à chaque appel public.

## Snapshot

`POST /:id/snapshot` calcule et insère une ligne dans `tv_atelier_snapshots` :
- `top5_json` : SUM(`score_global`) par employé, ISO week courante, filtré
  `atelier` de l'écran, jointure `employes` pour `matricule/nom/prenom`.
- `horaire_ideal_pct` : `100` (référence contractuelle).
- `horaire_reel_pct` : `heures_travaillees_jour / (nb_presents × 8) × 100`.
- `perte_dechet_kg`  : `SUM(qte_rebut)` des `controles_qualite` du jour.
- `perte_dechet_dt`  : `perte_dechet_kg × PERTE_DECHET_DT_PAR_KG` (env,
  défaut 15 DT/kg — TODO câbler sur `produits.prix_moyen`).
- `nb_1er_choix` / `nb_2eme_choix` : `SUM(qte_1er_choix)` / `SUM(qte_2e_choix)`.
- `kpi_json` : dictionnaire libre (nb_presents, taux_2e_choix_pct, etc.).

Un job de purge intégré garde les **30 derniers snapshots** par écran pour
éviter que la table ne grossisse indéfiniment.

## Rafraîchissement toutes les 30 s

Le champ `refresh_seconds` (default `30`) est **descriptif** — l'écran client
est chargé de rappeler `GET /tv/:url_token` à cette cadence. La régénération
côté serveur peut être branchée sur :

```js
// pseudo-code — à placer côté job runner (ex: node-cron)
import cron from 'node-cron';
import { genererSnapshot } from './model.js';
cron.schedule('*/30 * * * * *', async () => {
  const ecrans = await pool.query(
    `SELECT id_ecran FROM tv_atelier_config WHERE actif = TRUE`
  );
  for (const { id_ecran } of ecrans.rows) {
    try { await genererSnapshot(id_ecran); }
    catch (e) { console.error('[tv-atelier snapshot]', id_ecran, e.message); }
  }
});
```

Ce job **n'est pas** monté ici (les modules v2 sont sans état) — à intégrer
dans `backend/src/jobs/` selon la convention runtime.
