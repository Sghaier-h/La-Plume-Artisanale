# Phase E3 — Photos justificatives (§14quater.4)

**Date** : 2026-10-24 · **Branche** : `feature/backend-catalogue-dashboards-deploy`
**Contrat** : §14quater.4 — flux pièces reçues Teams / WhatsApp / Email.

## Objectif

Permettre d'envoyer une photo (facture, ticket caisse, chèque, reçu) via Teams, WhatsApp Business ou Email, puis la retrouver dans une « boîte à trier » pour la rattacher à une dépense espèces, facture fournisseur, apport gérant ou paiement.

## Livrables

### a) Schéma SQL
`database/schema-v2/40_photos_boite_tri.sql` :
- Table `photos_boite_tri` : FK `documents_archive`, enum `source` ∈ {teams, whatsapp, email, upload_direct}, expéditeur, `statut` ∈ {non_traite, en_cours, rattache, ignore}, `rattache_a_type` ∈ {depense_espece, facture_fournisseur, apport_gerant, paiement}, `rattache_a_id`, metadata JSONB.
- Index : source, statut, date_reception, composite (source, statut, date), expediteur, rattachement, metadata GIN.
- Trigger `trg_pbt_notify` : `pg_notify('photo_recue', …)` sur INSERT (push realtime sans polling).
- Vue `v_photos_boite_tri` : jointure prête-à-l'emploi photo + archive.

### b) Module backend v2
`backend/modules-v2/documents/photos-boite-tri/` :
- **`model.ingestPhoto`** : SHA-256 dédup → réutilise l'`id_document` existant ou insère dans `documents_archive` + écrit disque. Transaction unique.
- **Webhooks publics HMAC-SHA256** (header `X-Webhook-Signature` ou `X-Hub-Signature-256`, comparaison timing-safe) :
  - `POST /api/v2/webhooks/teams/photo` — base64 + metadata Teams.
  - `POST /api/v2/webhooks/whatsapp/photo` — `media_url` (téléchargé avec `WHATSAPP_TOKEN` optionnel) ou base64.
  - `POST /api/v2/webhooks/email/photo` — pièces jointes Mailgun/SendGrid.
  - `GET /api/v2/webhooks/health`.
- **Routes utilisateur** (JWT, perm `account.read`/`account.move.write`, ADMIN bypass) : list, count, getOne, rattacher (crée aussi `documents_liaisons`), ignorer, marquerEnCours, upload direct.
- Montage : `modules-v2/index.js` déclare `documents/photos-boite-tri` ; `src/server.js` monte le router webhooks hors `buildV2Router` (parser JSON local qui capture `req.rawBody`).

### c) Frontend
- Page `/documents/boite-tri` (`pages/documents/PhotosBoiteTri.tsx`) : KPIs par source, filtres (source + date), cards thumbnail + pastille colorée + message, modal « Rattacher à… » (type + ID + notes), actions ignorer/ouvrir. Protégée `['ADMIN','COMPTABLE']`.
- Widget `components/PhotoBoiteTriWidget.tsx` injecté dans la UserBar : badge rouge sur `count`, dropdown des 5 dernières photos, polling 30 s + listener `photo-recue` prêt pour SSE.
- Service `services/photosBoiteTriApi.ts` : types + méthodes alignées sur l'API.

### d) Config .env
`backend/.env.example` étendu avec `TEAMS_WEBHOOK_SECRET`, `WHATSAPP_WEBHOOK_SECRET`, `EMAIL_WEBHOOK_SECRET` (vides, commentaire d'usage, zéro valeur commitée).

## Déduplication

L'ingestion calcule SHA-256 ; si un `documents_archive` partage ce checksum, on réutilise l'id sans ré-écrire le fichier. Chaque réception crée malgré tout une ligne `photos_boite_tri` (traçabilité expéditeur), mais pointe sur le même document physique. Aucune nouvelle table de fichiers.

## Vérifications

- `npx tsc --noEmit` → **exit 0** ✓
- `import()` des 3 fichiers backend (model, routes, webhooks.routes) → chargement OK ✓
- `verifyHmac` testé en isolation : signature valide, préfixe `sha256=`, invalide, pas de secret, pas de header → tous conformes ✓
- Payload Teams signé + commande curl prête (scratchpad `test_hmac_payload.mjs`).

## Fichiers

**Créés** : `database/schema-v2/40_photos_boite_tri.sql`, `backend/modules-v2/documents/photos-boite-tri/{model,service,controller,routes,webhooks.routes}.js`, `frontend/src/{pages/documents/PhotosBoiteTri.tsx, components/PhotoBoiteTriWidget.tsx, services/photosBoiteTriApi.ts}`, ce rapport.

**Modifiés** : `backend/modules-v2/index.js`, `backend/src/server.js`, `backend/.env.example`, `frontend/src/App.tsx`, `frontend/src/components/UserBar.tsx`.
