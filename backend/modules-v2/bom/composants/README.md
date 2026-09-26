# bom/composants — v2

CRUD lignes BOM (84 colonnes Excel BOM legacy, §7.2 domain.md).

**Calcul auto** :
- `poids_ourdissage_kg = (nb_fils_chaine × metres_chaine × 2) / (NM × 1000)` — §7.17
- `cout_ligne = quantite × prix_unitaire` si prix_unitaire fourni

Appliqués si non fournis explicitement dans le payload.
Endpoints CRUD standard sous `/api/v2/bom/composants`.
