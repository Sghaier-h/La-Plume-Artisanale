# Phase F4 — Design artisanal tunisien

Enrichissement du design system `La Plume Artisanale` avec textures discrètes
(lin, papier recyclé, trait pinceau), icônes métier textile et micro-animations
élégantes. Zéro régression attendue sur les thèmes light/dark, les tablettes
tactiles et le mode offline.

## 1. Design system — nouvelles vars (`styles/design-system.css`)

Append-only (490 → 653 lignes). Rien de l'existant n'a été remplacé.

### Textures SVG inline (data-URI, chacune < 1 Ko)
- `--texture-lin` : trame diagonale 45° (`stroke 0.5` + opacité 0.18) sur
  tuile 48×48. Pour cards hero / bandeaux KPI.
- `--texture-papier` : grain papier recyclé (15 cercles irréguliers 0.3–0.7 px,
  opacité 0.14) sur tuile 120×120. Fond login + cards admin.
- `--texture-brush` : trait pinceau organique (chemin Bézier `Q`) 120×6, pour
  soulignements H1-H2 et `border-image` séparateurs.

### Accents
- `--accent-terracotta-dark: #A04A28` (hover intense), dark : `#C45E3C`.
- `--accent-sage-light: #C8D6BE`, dark : `#6E8661`.
- `--accent-gold-shimmer` : gradient 135° or clair → or lumineux → or clair.

### Keyframes (toutes `ease-out` ≤ 420 ms)
- `@keyframes lp-brush-draw` : `clip-path: inset(0 100% 0 0 → 0 0 0 0)` +
  opacité 0 → 1 sur 900 ms (soulignement titres).
- `@keyframes lp-weave` : `background-position` scroll 16 px, 3.5 s linear
  infinite (badge « en fabrication »).
- `@keyframes lp-ink-fade-in` : opacité + `translateY(4px)` + `blur(2px)` →
  net sur 420 ms (apparition cartes).

### Classes utilitaires
- `.la-plume-card` : texture papier `!important` sur `background-image` pour
  surcharger les styles inline des composants partagés (KpiCard, …) sans
  les refactorer. Blend `multiply` light / `screen` dark.
- `.la-plume-separator` : `<hr>` avec `border-image: var(--texture-brush)`.
- `.la-plume-title-brush` : `::after` animé par `lp-brush-draw`.
- `.la-plume-weave-badge` : fond tissage diagonal animé `lp-weave`.
- `.la-plume-ink-in` : apparition encre.
- `.la-plume-paper-bg` : wrapper fond papier (`::before`, `mix-blend` adapté).
- Bloc `@media (prefers-reduced-motion: reduce)` qui coupe toutes les
  animations et fige le brush-draw à l'état final.

## 2. Icônes métier (`components/ui/IconsLaPlume.tsx` — nouveau fichier)

12 icônes SVG inline, viewBox 24×24, stroke 1.5, `currentColor` :

`IconFouta` (silhouette rectangulaire + 8 franges), `IconMetierATisser`
(bâti + chaîne + navette), `IconChaine` (5 fils verticaux), `IconTrame`
(5 fils horizontaux), `IconOurdissage` (3 bobines → ensouple),
`IconFrange` (6 fils torsadés), `IconNavette` (amande + canette),
`IconBobine` (flasques + enroulement), `IconDecoupe` (ciseaux croisés
+ rivet), `IconEtiquette` (tag + œillet), `IconColis` (paquet ficelé
avec nœud, pas carton générique), `IconNouage` (deux fils + nœud ovale).

Props : `size`, `title` (a11y), héritage de tous les `SVGProps`.

## 3. Pages patchées

| Page | Patch |
|------|-------|
| `pages/Login.tsx` | Wrapper `.la-plume-paper-bg`, H1 → `.la-plume-title-brush`, halo gold-shimmer autour de `PlumeLogo`. |
| `pages/DashboardAdministrateur.tsx` | `titleBrush` sur `DashboardShell`, 4 KPIs primaires passés en `.la-plume-card`, grille animée `.la-plume-ink-in`. |
| `pages/Articles.tsx` | KPI « Articles actifs » : `IconFouta` remplace `Package`. H1 « Articles » → `.la-plume-title-brush`. |
| `pages/OF.tsx` | H1 : `IconMetierATisser` remplace `FileText` + `.la-plume-title-brush`. Nouveau chip header « En fabrication » (compteur temps réel) avec `.la-plume-weave-badge` + `IconMetierATisser`. |
| `pages/sous-traitants/SoustraitantsListe.tsx` | `titleBrush`. Mapping `TYPE_ACTIVITE_ICON` : icônes métier dédiées sur chaque tuile de répartition et sur `<TypeBadge>` (frange → `IconFrange`, nouage → `IconNouage`, ourdissage/tissage/couture/teinture/broderie/finition → icônes correspondantes, fallback `Scissors`). |

### Modifications transverses mineures (append-only)
- `components/dashboard/DashboardShell.tsx` : nouveau prop `titleBrush?: boolean`
  (par défaut `false` → aucun impact sur les autres dashboards).
- `components/dashboard/KpiCard.tsx` : nouveau prop `className?: string`
  (merge non-destructif).

## 4. Contraintes respectées

- Thèmes light + dark : textures via blend-mode adapté (`multiply` / `screen`),
  accents dark mode définis.
- Pages tablette : non touchées (`components/*Tablette*`, `pages/tablette/*`).
- Mode offline : non touché (`src/offline/*`).
- Pattern dashboard-hub §14ter.17c : préservé (`DashboardShell` reste
  rétro-compatible, `titleBrush` optionnel).
- `services/api.ts` : non touché.
- `components/ui/Table/Toast/Skeleton/EmptyState` : non touchés (le dossier
  `components/ui` ne contenait rien ; seul `IconsLaPlume.tsx` y a été créé).
- Pas de git commit.
- `prefers-reduced-motion` : toutes les animations désactivées.

## 5. tsc

```
cd frontend && npx tsc --noEmit
EXIT=0
```

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
