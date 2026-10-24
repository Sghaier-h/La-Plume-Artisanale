# T2 — Rapport CONTROLEUR_QUALITE

Session du 2026-10-24 — rôle `CONTROLEUR_QUALITE` (id 6).
Login OK uniquement avec `controleur.qualite@entreprise.local` (l'alias `qualite@entreprise.local` du brief n'existe pas).

## Scénarios exercés

| # | Scénario | État |
|---|---|---|
| 1 | Dashboard `/dashboard-controle-central` | KPIs OK (taux 100 %, 5 contrôles 30j, 0 NC, 0 alerte). 4 charts rendus (secteur / évolution / radar / incidents). |
| 2 | OF à contrôler après tissage/coupe/finition | **Aucune vue dédiée.** Pas de filtre `?statut=EN_CONTROLE` renseigné (0 résultat), pas d'onglet « lots en attente contrôle » dans le dashboard. |
| 3 | Faire un contrôle qualité | **Formulaire fictif.** Modal « Nouveau contrôle » ne fait **aucun POST** : juste `alert('Contrôle enregistré avec succès')` + close. Pas de scan QR, pas de sélection OF, pas de rework/rebut, pas de nb pièces, pas de gravité, pas de photo. |
| 4 | Signaler défaut avec photo | Endpoint `POST /v2/qualite/defauts/signales/:id/photos` existe mais inatteignable depuis l'UI contrôleur central. Le POST signal défaut échoue : `column "type_defaut" does not exist` (schéma `defauts_signales` désaligné). |
| 5 | Suivi défauts par ST / machine / tisseur | **Bug route** : `GET /v2/qualite/controles/par-soustraitant` → interprété comme `/:id` → `invalid input syntax for type bigint`. Aucune UI historique par ST. |
| 6 | Rapport mensuel (Pareto, radar, conformité) | `/rapports/mensuel` 404. Seuls `/taux-2e-choix-machines-7j` et `/defauts-par-type` existent, non reliés à une page « Rapport ». |
| 7 | Alertes rebut > 3 % / OF en attente | Non implémentées. `getAlertes()` renvoie `{items:[], total:0}`. Pas de seuil, pas de watcher. |
| 8 | Rework → atelier avec consignes | Aucune UI. Backend accepte `decision` mais pas de workflow renvoi atelier + commentaire consignes. |
| 9 | Rebut définitif + impact chiffré | Aucune UI ni calcul coût. |
| 10 | Historique par ST (meilleures finitions) | Non exposé (voir bug #5). |

## Points d'attention PO

- **§14ter.17c NON respecté.** Le dashboard est un long scroll (KPIs + 4 charts + tableau), **pas** un hub icônes + bandeau alertes séparé. Rôle CONTROLEUR_QUALITE prévu : `Lots à contrôler · Mes rapports · Signaler NC · Historique · Messagerie` → zéro icône.
- **§14ter.18 NON respecté.** Pas de scan QR/lot, pas d'autocomplétion OF, formulaire NC demande ID OF numérique à taper, aucun auto-save, « Enregistrer » ne persiste rien côté modal central.
- **Contrôle en < 1 min ? Non.** Dix clics par critère sur 5 critères (notation 1-10), pas de pré-remplissage, pas de « conforme en masse ».
- **Multi-photos / annotations : absent.**
- **Suggestions auto causes (défaut X récurrent sur machine Y) : absent.**
- **Charts Phase G1 alimentés ? Oui mais vides** : radar renvoie 5 critères à `value=0` (chart plat), incidents 30 j = 0, secteur = 1 barre `visuel`. Seed insuffisant pour validation visuelle réelle.
- **Alertes séparées en haut : non.** `KpiCard "Alertes ouvertes"` noyé parmi les KPIs métier (anti-pattern §14ter.17c).

## Bugs backend confirmés

1. `POST /v2/qualite/controles` avec `type_controle:"finition"` → `invalid input value for enum ctrl_type_enum`. Enum restrictif non documenté côté UI.
2. `POST /v2/qualite/defauts/signales` → `column "type_defaut" of defauts_signales does not exist`. Schéma/colonne divergents.
3. `GET /v2/qualite/controles/par-soustraitant` → collision route `/:id` (déclaration manquante avant la générique).
4. `TabletteQualite.tsx` consomme `/api/qualite-avance/*` (legacy), `DashboardControleCentral.tsx` consomme `/api/v2/qualite/*` → **deux systèmes qualité parallèles**, données non croisées.

Rien n'a été corrigé. Aucun commit git.
