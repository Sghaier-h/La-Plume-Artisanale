# Phase F1 — Loading skeletons + Empty states

## Objectif

Remplacer les spinners/"Chargement…" basiques et les lignes vides `<tr><td colSpan>Aucune donnée</td></tr>` par une expérience plus soignée :
- Squelettes animés (shimmer gradient terracotta/sage) pendant les chargements liste.
- États vides illustrés avec icône, titre Fraunces italic et bouton d'action contextuel.

## Composants créés

Dans `frontend/src/components/ui/` :

- **`Skeleton.tsx`** — exporte 5 composants :
  - `Skeleton` : bloc générique `<div>` avec gradient shimmer animé (keyframes injectés une seule fois).
  - `SkeletonCard` : carte avec header + 3 lignes de texte.
  - `SkeletonKpiRow` : 4 cartes KPI squelettes (grid responsive 1/2/4).
  - `SkeletonTable` : table squelette (`rows`, `cols` configurables, largeurs pseudo-aléatoires).
  - `PageSkeleton` : page complète (header + KPI row + table) pour remplacer les spinners plein écran.
- **`EmptyState.tsx`** — composant centré (icône 72px dans cercle teinté + titre Fraunces + description `fg-muted` + CTA pill) avec 3 variantes : `default` (terracotta), `search-no-result` (indigo), `error` (danger).
- **`index.ts`** — barrel export (préserve l'export `DataTable` existant).

Palette : CSS vars La Plume (`--accent-terracotta`, `--accent-sage`, `--accent-indigo`, `--color-danger`, `--font-serif`, etc.). Compatible mode sombre.

## Pages patchées (20 / 20)

| # | Page | Loading | Empty state |
|---|------|---------|-------------|
| 1 | `pages/Clients.tsx` | PageSkeleton | ✔ (filtres + CTA nav) |
| 2 | `pages/Commandes.tsx` | PageSkeleton | ✔ |
| 3 | `pages/Devis.tsx` | PageSkeleton | ✔ |
| 4 | `pages/Facture.tsx` | PageSkeleton | ✔ (via `emptyState` DataTable) |
| 5 | `pages/BonLivraison.tsx` | PageSkeleton | ✔ |
| 6 | `pages/BonRetour.tsx` | PageSkeleton | ✔ |
| 7 | `pages/Avoir.tsx` | PageSkeleton | ✔ |
| 8 | `pages/Articles.tsx` | PageSkeleton | ✔ (via `emptyState` DataTable) |
| 9 | `pages/Opportunities.tsx` | SkeletonTable inline | ✔ + variante error |
| 10 | `pages/CrmLeads.tsx` | SkeletonTable inline | ✔ + variante error |
| 11 | `pages/OF.tsx` | PageSkeleton | ✔ (via `emptyState` DataTable) |
| 12 | `pages/sous-traitants/SoustraitantsListe.tsx` | SkeletonTable inline | ✔ |
| 13 | `pages/sous-traitants/TravauxSoustraitantsListe.tsx` | SkeletonTable inline | ✔ |
| 14 | `pages/achats/BonsCommande.tsx` | PageSkeleton | ✔ (via `emptyState` DataTable) |
| 15 | `pages/achats/FacturesFournisseur.tsx` | PageSkeleton | ✔ |
| 16 | `pages/rh/AvancesSalaires.tsx` | — (pas de state) | ✔ |
| 17 | `pages/rh/ComptesEmployes.tsx` | SkeletonTable inline (tbody) | ✔ |
| 18 | `pages/comptabilite/Caisses.tsx` | Skeletons grille + variante error | ✔ |
| 19 | `pages/comptabilite/DepensesEspeces.tsx` | SkeletonTable inline | ✔ |
| 20 | `pages/documents/ArchiveDocuments.tsx` | SkeletonTable inline | ✔ |

Deux patterns utilisés selon la structure existante :
- Pages à `if (loading) return <spinner>` : remplacement par `<PageSkeleton kpiCount cols rows />`.
- Pages à loading inline (DashboardShell/SectionCard) : rendu conditionnel `loading ? <SkeletonTable> : filtered.length === 0 ? <EmptyState> : <table>`.

Les lignes `<tr><td colSpan>Aucune donnée</td></tr>` ont été remplacées par un `EmptyState` positionné en frère du tableau (ou dans le `emptyState` prop du DataTable existant). Les filtres et actions existants sont préservés : chaque CTA de l'état vide (recherche active) réinitialise `search` + `filters` locaux.

## Contraintes respectées

- Dashboards opérateur et pages `/tablette/*` **non modifiés**.
- Comportement existant (filtres, modales, actions) préservé.
- Design system respecté : Fraunces italic sur titres, Inter sur texte, palette terracotta/sage/indigo/gold, shadows et radius du design-system.css.
- Aucun commit git créé.

## Vérification

`cd frontend && npx tsc --noEmit` → **exit code 0**.
