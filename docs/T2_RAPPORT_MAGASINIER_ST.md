# T2 — Rapport simulation MAGASINIER_SOUSTRAITANTS

**Date** : 2026-10-24 · **User** : `magasinier.st@entreprise.local` (id=12) · **Route** : `/dashboard-magasinier-soustraitants`

## 1. Dashboard — Vue d'ensemble
Login OK. Dashboard rendu (`DashboardMagasinierSoustraitants.tsx`), 4 KPIs principaux (ST actifs / mouvements en cours / retards / retournés) + 4 secondaires (messages, OF à prioriser, alertes qualité, OF actifs), 5 onglets. Les alertes qualité (ST < 90% ou > 2 retards) + alertes retards (`date_retour_prevue < today`) remontent correctement. 15 ST actifs chargés, 50 travaux visibles.

## 2. Workflows exercés
| # | Scénario | Résultat |
|---|---|---|
| 1 | Dashboard | OK — `/dashboard-magasinier-soustraitants` |
| 2 | Voir ordres de sortie à préparer | OK — colonne « OF à sortir en priorité » |
| 3 | Filtre par `type_activite` | **API OK** (`?type_activite=frange` = 5 ST retournés) mais **non exposé dans l'UI** |
| 4 | Préparer bon sortie (scanner lots, peser, instructions, signature) | **Partiel** — voir §3 |
| 5 | `POST /api/v2/sous-traitance/bons` | **OK** → `BST-20261024-0001` créé |
| 6 | Réception retour (scan QR, compter, contrôle qualité) | **Partiel** — voir §3 |
| 7 | `POST /api/v2/sous-traitance/retours` | **OK** → `RST-20261024-0001` créé (signature SVG stockée en `observations`) |
| 8 | Compte ST courant | **OK** — `GET /comptes` liste 15 comptes avec soldes TND ; `GET /comptes/:id/mouvements` OK |
| 9 | Payer un ST (caisse) | **ABSENT du dashboard ST** — aucun bouton « Payer » |
| 10 | Signaler anomalie | **CASSÉ** — `POST /sous-traitants/:id/anomalies` → 404 route inexistante |
| 11 | Alertes retard / soldes | Retards OK ; solde élevé **non détecté** (pas de seuil) |

## 3. UX §14ter.18 — manques & bugs détectés

**Bugs backend**
- `GET /api/v2/sous-traitance/bons` → *column `ost.id_soustraitant` does not exist* (model `bons/model.js:9`) → **toute la liste BonsST est cassée**.
- `GET /api/v2/sous-traitance/sous-traitants/:id/bons` → même erreur SQL (`sous-traitants/model.js:77`, table `of_sous_traitance` désalignée).
- `GET /api/v2/sous-traitance/retours` → 404 (seul `POST /:id/receptionner` monté).
- `GET /api/v2/sous-traitance/sous-traitants/stats/global` → 404.
- `POST /sous-traitants/:id/anomalies` → 404 (modèle `anomalieInsert` existe, route jamais exposée).

**UX bloquante**
- **Modale « Nouvelle sortie » = redirection fantôme** : saisie (ST + OF + QR + quantité + obs) **perdue** → `handleEnregistrerSortie` redirige vers `/sous-traitants/:id` sans transmettre les champs (`DashboardMagasinierSoustraitants.tsx:325-329`). Même pattern pour `Enregistrer retour` → `/bons-retour-st/:id`. Le magasinier retape tout.
- **Bouton Scan QR mort** : `<button style={btnGhost}><Scan /></button>` sans `onClick` (lignes 1073, 1129). Aucune intégration caméra / ZXing / clavier douchette dédiée.
- **Pas de pesée / comptage lot-niveau** : la modale sortie expose un unique champ `quantite` numérique — ni poids kg, ni compteur lots, ni liste scannée.
- **Pas de champ « Instructions spéciales »** sur sortie : seulement `observations` texte libre.
- **Pas de signature tactile sur les modales** du dashboard. Les `SignatureCanvas` existent uniquement sur les fiches `BonSortieST` / `BonRetourST` (après redirection). → **≥ 4 clics** pour choisir ST + atteindre la fiche + signer, au lieu d'un flux unique.
- **Choix ST non filtré par activité OF** : `<select>` liste les 15 ST, aucun filtre `type_activite`. Un magasinier qui envoie des franges voit aussi Ourdissage, Teinture, Finition.
- **Multi-activité ignorée** : `activites_secondaires` (ex. Adel Chakroun = couture + frange) **non affiché** sur les cartes ni dans le select.
- **Pas de bouton « Payer »** depuis fiche ST ni dashboard — le MAG ST doit aller sur le dashboard Caissière, rupture de workflow.
- **Pas de « Signaler anomalie »** côté UI (alors que la permission `anomalie_soustraitant:gerer` est au token).
- **Historique par ST pauvre** : qualité moyenne et délai moyen affichés mais pas d'évolution dans le temps, pas de nb travaux total, pas de délai réel vs prévu.
- **Alerte « solde élevé »** manquante : Adel Chakroun 14 187 TND, Ali Thabet 16 976 TND, Dimatex 34 280 TND — aucune alerte seuil.

## 4. Score UX
Workflows essentiels (sortie, retour, filtre activité, scan, pesée, signature, paiement, anomalie) : **4/11 vraiment opérationnels bout-en-bout**. Dashboard esthétique mais actions principales redirigent vers des fiches v2 au lieu d'une saisie en-ligne — perte de rapidité critique au comptoir ST.
