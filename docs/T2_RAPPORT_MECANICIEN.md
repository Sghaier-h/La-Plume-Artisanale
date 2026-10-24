# T2 — Rapport MECANICIEN (maintenance machines)

Date : 2026-10-24 — Compte testé : `mecanicien@entreprise.local` (role `MECANICIEN`, 7 permissions).

## Synthèse exécutive
Dashboard mécanicien **non branché au backend** (100 % mock), aucune API dédiée MTBF/MTTR/QR/manuels, workflow « panne → intervention → sortie pièce → remise en service » impossible de bout en bout. Le socle REST pour `machines` et `maintenance` existe mais sous-exploité.

## (A) Remarques UX — §14ter.18
- **UX1** `TableauBordMecanicien.tsx` : 1489 lignes, 16 `useState` initialisés avec données **codées en dur** (M2301…M2304, Ali Ben Salem, etc.) — **aucun `fetch`/`service.*`**. Toute action (créer demande, démarrer, terminer) ne persiste rien.
- **UX2** Pas d'indicateur « temps écoulé depuis panne » live (valeur statique `tempsArret: 125`), pas de rafraîchissement auto.
- **UX3** Navigation : le lien UserBar pointe sur `/dashboard-mecanicien` mais seule la route `/mecanicien` est utilisée dans certaines zones (vérifier redirection).
- **UX4** Aucune vue consolidée « Mes machines » filtrée par `assigned_to = user.id` — la liste `/api/v2/fabrication/machines` renvoie tout sans filtre technicien.
- **UX5** Fin d'intervention : actuellement **au moins 4 clics** (ouvrir intervention → bouton Terminer → modal commentaire → confirmer) — cible §14ter.18 : 2 clics max.
- **UX6** Pas de code couleur statut machine conforme (toutes `operationnelle` dans la base demo, pas de badge visuel panne/maintenance dans la liste).
- **UX7** Statut DB `operationnelle` vs libellé front `En marche`/`En panne` : vocabulaire non aligné.

## (B) Fonctionnalités manquantes
- **F1** Endpoint dashboard dédié : `GET /api/v2/dashboard/mecanicien` → **404**. Pas d'agrégation (pannes en cours, interventions J, pièces critiques).
- **F2** **Scan QR machine** : aucun endpoint (`/machines/:id/qr` 404), aucun composant frontend. Point attention explicite non traité.
- **F3** **Manuels / schémas machine** : aucun endpoint (`/machines/:id/manuels` 404), pas d'upload PDF, pas de visualiseur.
- **F4** **MTBF / MTTR** : aucun endpoint (`/machines/:id/mtbf` 404), aucune mention dans le code. Alertes « due date maintenance » absentes de la table (`date_prochaine_maintenance` toujours `null` en demo).
- **F5** **Gammes de maintenance préventive** : aucun endpoint `/preventif` ni `/maintenance/gammes` (404). Pas de planification récurrente.
- **F6** **Sortie pièce de rechange liée à intervention** : `POST /stock/pieces-rechange/sortie` et `/mouvements` → 404. Pas de décrément stock lors d'une intervention. Permission `piece_rechange:consulter` existe mais pas d'action possible.
- **F7** **Alertes rupture pièces critiques** : table `pieces_rechange` vide, aucun seuil minimum/alerte en base.
- **F8** Pas de pipe « réception alerte panne depuis Chef Production » (pas de notification/push, pas de WebSocket vu).
- **F9** Historique machine : `/maintenance/machine/:id` existe et répond `{items:[]}` mais aucun écran front ne l'affiche (point attention non couvert).
- **F10** Pas d'export rapport interventions (PDF/CSV).

## (C) Bugs
- **CRIT-M1** `POST /api/v2/fabrication/maintenance` avec payload minimal → `{"success":false,"error":{"message":"Référence invalide dans les données"}}`. Message générique, aucun indice sur champ manquant → scénario 5 (créer intervention) **bloqué**.
- **CRIT-M2** `GET /api/v2/fabrication/machines/1/planning` → **HTTP 500** (crash controller, kill subprocess observé pendant tests).
- **MAJ-M1** Toutes les machines demo ont `date_derniere_maintenance=null` et `date_prochaine_maintenance=null` → **aucune alerte maintenance due** calculable, scénario 11 vide.
- **MAJ-M2** `TableauBordMecanicien.tsx` : boutons « Démarrer / Terminer / Clôturer » callent `onClick` locaux (setState) → **aucune persistance** → sortie session = perte totale.
- **MAJ-M3** Permission backend `maintenance:ajouter` accordée mais `POST /maintenance` rejette la payload réaliste → incohérence RBAC/validation.
- **MIN-M1** Encodage mojibake dans `legacy-routes.js` (`Routes Maintenance â€”`, `Routes spÃ©cifiques`) — commentaires FR cassés UTF-8.
- **MIN-M2** `GET /api/v2/dashboards` et `/dashboard/mecanicien` renvoient page HTML Express 404 brute (pas de JSON standard) → clients front cassés par le parse.

## Verdict
Module mécanicien à l'état **PoC** : UI riche mais 0 % connectée, API squelette, points attention (QR, manuels, MTBF, pièces critiques) **non adressés**. Priorité : brancher `TableauBordMecanicien.tsx` sur `/fabrication/machines` + `/fabrication/maintenance`, corriger CRIT-M1/M2, ajouter endpoints MTBF, QR, gammes préventives.
