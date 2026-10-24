# Phase H — Tablette personnel étendue (rapport agent H)

Scope : avertissements auto RH (§11bis + §14ter.17c), recrutement candidat
tablette publique (§11bis.recrutement) et sous-écrans dédiés de la tablette
« Mes demandes » (§14quater.6).

## (a) Schémas SQL créés

| Fichier | Tables / colonnes |
| --- | --- |
| `database/schema-v2/42_rh_avertissements_auto.sql` | `avertissements_rh` (id, id_employe, type enum, niveau enum, message, periode_debut/fin, auto_genere, genere_par, statut, date_envoi/lu/accuse_reception, signature_svg, raison_contestation, id_societe, id_document_archive) · `avertissements_regles` (code enum unique par société, nom, actif, seuil_valeur, periode_jours, niveau_declenche, message_template). Index sur `id_employe`, `statut`, `date_envoi DESC`, `niveau`, `id_societe`. |
| `database/schema-v2/43_candidatures_tablette.sql` | `questions_recrutement` (poste_cible, question_type enum : texte/multi/test_logique/note, choix_json JSONB, bonne_reponse, poids, actif, ordre) · `candidatures_tablette_detail` (FK `candidatures.id_candidature`, poste_cible, identite_json/parcours_json/reponses_json/test_logique_json JSONB, attentes_salariales, signature_svg, score_total, duree_minutes, ip_source, user_agent). |

Tous les objets sont idempotents (`CREATE TABLE IF NOT EXISTS`, `ALTER … ADD
COLUMN IF NOT EXISTS`). Les mêmes schémas sont dupliqués en autonome dans
`backend/seeds/avertissements/00_schema.sql` et
`backend/seeds/recrutement-tablette/00_schema.sql`.

## (b) Modules backend v2 (routes exposées)

Enregistrés dans `backend/modules-v2/index.js` sous le groupe `rh` :

### `backend/modules-v2/rh/avertissements/` → `/api/v2/rh/avertissements`
- `GET  /`                         — liste + filtres (statut, niveau, type, employé, période)
- `GET  /kpi`                      — agrégation par niveau (total / non_lus / contestes)
- `GET  /mes`                      — self-service tablette (header `x-tablette-token`)
- `GET  /:id`                      — détail
- `POST /`                         — création manuelle
- `POST /:id/accuser-reception`    — body `{ signature_svg }` (ownership via token tablette)
- `POST /:id/contester`            — body `{ raison }`
- `POST /scan`                     — scanner cron-safe (règles sur `pointages_evenements` + `planning_employes`, dédup fenêtre `periode_jours`)

### `backend/modules-v2/rh/recrutement-tablette/` → `/api/v2/rh/recrutement-tablette`
- `GET  /questions-actives?poste=X` — public
- `POST /postuler`                  — public, rate-limit (5/15min/IP), crée `candidatures` + `candidatures_tablette_detail`, scoring via `test_logique`/`note` × `poids`
- `GET  /candidatures`              — admin (filtre source='tablette')
- `GET  /candidatures/:id`          — admin, join détail

## (c) Pages frontend créées

### Routes publiques tablette (kiosque strict)
- `frontend/src/pages/TabletteAvertissements.tsx` — PIN + liste + accusé réception (SignatureCanvas) + contestation
- `frontend/src/pages/TabletteDemandeConge.tsx` — PIN + formulaire congé (type enum, dates, motif, signature)
- `frontend/src/pages/TabletteDemandeAttestation.tsx` — PIN + attestation (travail/salaire/détention/employeur)
- `frontend/src/pages/TabletteConsultationBulletins.tsx` — PIN + 12 derniers bulletins + téléchargement PDF + accusé
- `frontend/src/pages/TabletteRecrutementCandidat.tsx` — **public, pas de PIN** — kiosque multi-écrans (accueil → identité → parcours → questionnaire 1 question/écran → test logique + attentes + signature → merci), auto-save `localStorage` (clé `tablette.recrutement.draft`), bouton « Recommencer » discret

### Pages admin (`ADMIN`/`RH_MANAGER`)
- `frontend/src/pages/rh/AvertissementsRh.tsx` — KpiCards par niveau + filtres (statut/niveau/type) + tableau + bouton « Lancer scan maintenant »
- `frontend/src/pages/rh/CandidaturesTablette.tsx` — KpiCards (total/score moyen/7j/en attente) + tableau + modal détail JSON + action « Convertir en entretien »

### Patch sur page existante
- `frontend/src/pages/TabletteMesDemandes.tsx` — 6 icônes du hub ré-routées vers les sous-écrans dédiés (navigate) : avance, congé, attestation, bulletins, mon compte, pointeuse. L’ancien flux `FormDemande` interne reste présent (dead code toléré par `noUnusedLocals: false`) et pourra être retiré lors d’un refactor.

### Routes App.tsx ajoutées
```
/tablette/demande-conge
/tablette/demande-attestation
/tablette/bulletins
/tablette/avertissements
/tablette/recrutement-candidat        (public, pas de PrivateRoute)
/rh/avertissements                    (ADMIN/RH_MANAGER)
/rh/candidatures-tablette             (ADMIN/RH_MANAGER)
```

Mappings `components/Breadcrumbs.tsx` ajoutés pour les 7 routes.

## (d) Services dédiés créés

Services séparés pour éviter tout conflit avec `services/api.ts` (G1/G2/G3) et
`services/rhApi.ts` (G2) :

- `frontend/src/services/rhAvertissementsApi.ts` — list / getOne / kpi / mes
  (header x-tablette-token) / accuserReception / contester / create / scan.
- `frontend/src/services/rhRecrutementCandidatApi.ts` — questionsActives /
  postuler / listCandidatures / getCandidatureDetail.

Les deux services importent l’instance axios `api` sans modifier le fichier.

## (e) tsc final

```
cd frontend && npx tsc --noEmit  → EXIT=0
```

Compilation TypeScript propre après ajout de ~11 fichiers (pages + services +
imports App/Breadcrumbs). Aucune collision détectée avec les autres agents G.

## (f) Seeds & scripts

- `backend/seeds/avertissements/00_schema.sql` + `01_regles_demo.js` → 4 règles démo (retard_répété, absence_non_just, baisse_productivité, refus_consigne) + 3 avertissements démo préfixés `[DEMO]`.
- `backend/seeds/recrutement-tablette/00_schema.sql` + `01_questions_demo.js` → 15 questions `[DEMO]` (5 TISSEUR + 5 COUPEUR + 5 COMMERCIAL ; types texte/multi/note/test_logique).
- Scripts : `backend/scripts/seed-avertissements.js` et `seed-recrutement-tablette.js`.
- `backend/package.json` : nouvelles cibles `seed:avertissements[:dry]` et `seed:recrutement-tablette[:dry]`.

## (f) Reste à faire

1. **Tests end-to-end** du scanner — nécessite un dataset réel de `pointages_evenements` et `planning_employes` ; vérifier la fenêtre de dédoublonnage sur gros volumes.
2. **Cron scheduler** — brancher `POST /api/v2/rh/avertissements/scan` sur `node-cron` (déjà dépendance) à fréquence quotidienne (03:00) côté `src/server.js`.
3. **Vraie archivage document** — `avertissements_rh.id_document_archive` est stocké mais la génération PDF + rattachement à `documents_archive` reste à câbler (PDFKit déjà installé).
4. **Nettoyage dead code** dans `TabletteMesDemandes.tsx` — `FormDemande` / `PlanningView` / `CompteView` ne sont plus utilisés depuis que les icônes naviguent vers des pages dédiées. À retirer lors d’une passe de nettoyage.
5. **Convertir-en-entretien** utilise un fallback route (`/v2/rh/candidatures/entretiens` → `/v2/rh/entretiens`) ; aligner avec le contrat final du module `rh/entretiens` publié par G2.
6. **Upload photo CV** côté `TabletteRecrutementCandidat` — le champ `photo_cv_url` est prévu dans le payload mais aucun uploader n’est encore proposé (webcam ou pièce jointe tablette).
7. **i18n AR** — toutes les chaînes sont en français ; à propager quand le pack i18n sera activé.
