# T2 — Rapport TISSEUR (tablette atelier)

**Rôle** : TISSEUR · **Compte** : `tisseur@entreprise.local` / `DevLocal2024!`
**Date** : 2026-10-24 · **Env** : back `:5000`, front `:3000`

## Contexte parcours

- Login via `/login` (**email + password**, pas de PIN). Après succès → redirection vers `/dashboard-tisseur` (dashboard "PC" dense), **pas** vers `/tablette/tisseur` (écran tablette simplifié).
- `/tablette/tisseur`, `/tablette/pointeuse`, `/tablette/demande-avance`, `/tablette/mon-compte`, `/tablette/avertissements` : routes existent, mais aucun lien n'est présenté depuis le dashboard du Tisseur ni depuis `TabletteLayout` (seul bouton = « Mon poste »).
- `TabletteLayout` respecte §14quater.14 : **pas** de `UserBar` ni `NavTopBar` pour rôle TISSEUR (vérifié `App.tsx` l.364 → `return <TabletteLayout>…`). Kiosque OK.

## (C) Bugs

- **CRIT · APIs cassées sur `TabletteTisseur`** : le front appelle `/api/taches/operateur/:id/day` et `/api/taches/:id/demarrer|terminer` → **404 Cannot GET/PUT**. Le bon préfixe est `/api/v2/fabrication/taches/...` (vérifié : renvoie `{items:[], total:0}`). Conséquence : page tisseur « Démarrer / Terminer » inopérante.
- **CRIT · Signalement défaut qualité absent** : aucun endpoint ni UI pour « défaut en cours ». `POST /api/v2/qualite/defauts` → 404. `TabletteTisseur` n'offre que « Signaler panne » (machine). Le contrôleur ne reçoit donc **aucune** alerte qualité du tisseur.
- **MAJ · Statuts machine incompatibles front/back** : `TabletteTisseur` envoie `PANNE | OPERATIONNELLE`, le back exige `operationnelle | en_maintenance | en_panne | arret | reservee` → `{error: "Statut invalide"}`. Signalement panne non enregistré.
- **MAJ · Workflow « Démarrer OF » du `DashboardTisseur`** : hydraté depuis `/v2/fabrication/of`, mais tous les OF reviennent avec `etat === 'En cours' | 'En attente' | 'Terminé'`. Le bouton n'apparaît que si `etat === 'Machine alimentée'` (jamais produit par le back). Démarrage impossible via dashboard.
- **MAJ · `handleConfirmerDemarrage` utilise `alert()`** (DashboardTisseur l.189) + mutation seulement locale (`setMesOF`). Aucun POST backend. Rien n'est persistant.
- **MIN · Login TISSEUR → `/dashboard-tisseur`** et non `/tablette/tisseur` : le poste atelier est confronté à un dashboard « PC » dense (3 onglets, KPI, modales incident, étiquette…) au lieu de l'écran kiosque simple attendu.
- **MIN · `PIN tablette` dissocié du JWT** : `/tablette/pointeuse` exige un re-login PIN (public route), alors que le TISSEUR vient d'authentifier son JWT. Le lien `user.id` ↔ `id_employe` n'existe pas (user 3 → aucun employé 3).

## (A) UX tablette §14ter.18

- **Boutons sous 72 px** partout : `TabletteLayout` 44 px, `TabletteTisseur` `minHeight: 48`, `DashboardTisseur` `padding 8×14 + text-xs` ≈ 28-32 px. Trop petit, surtout pour « Démarrer / Terminer / Signaler panne ».
- **Pas de scan QR OF** : aucun `BarcodeScanner`/`BrowserQRCodeReader` dans les pages tisseur (seul `TracabiliteLots.scanQR` existe). L'OF se tape ou se sélectionne dans une liste.
- **Clavier obligatoire** pour saisir : quantité produite, compteur machine, description incident (textarea), raison refus complément. Aucun pavé numérique XL ni dictée voix.
- **Signature tactile** : absente côté TISSEUR (présente côté HR tablettes). Pas de signature pour fin OF / fin poste.
- **Modales denses** (`DashboardTisseur`) : non adaptées 375 px — les boutons `btnPrimary` passent sous la pliure, le `select` du type d'incident est natif.
- **Pointage non 1-clic** : parcours matricule → PIN → hub → photo → check (4 écrans), le TISSEUR déjà JWT-logué devrait pointer en 1 geste.

## (B) Fonctionnalités manquantes

- **Pause OF** (panne machine / changement MP) : aucun bouton « Pause » / « Reprise ». Seule option = `Terminer`.
- **Compteur pièces produites** avec incrément/décrément tactile (actuellement : saisie clavier libre).
- **Scan QR OF** pour « prendre un OF » sans sélection liste.
- **Signalement défaut qualité rapide** : 1 photo + 1 bouton envoyant au `CONTROLEUR_QUALITE` en temps réel (Socket.IO existe déjà pour `tache:*`).
- **Hub tablette intégré** : depuis `/tablette/tisseur`, liens vers Pointeuse, Mon solde, Avertissements, Demande d'avance (actuellement cloisonnés + re-auth PIN).
- **Pointage sortie atelier** depuis l'écran tisseur (actuellement : il faut aller sur `/tablette/pointeuse` et refaire matricule + PIN).
- **Mapping `user.id ↔ id_employe`** pour éviter la double authentification JWT + PIN.

---
*Rapport établi sans modification du code (lecture seule). Longueur ≈ 480 mots.*
