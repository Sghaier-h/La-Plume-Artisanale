# Design System · La Plume Artisanale

> ERP de fabrication artisanale de foutas tunisiennes.
> Palette et typographie ancrées dans l'atelier — coton écru, terre cuite, sauge —
> pour un outil professionnel qui respire la matière.

**Source de vérité artifact** : [design-system-plume.html v36](https://claude.ai/artifact/UrmNYdWdeTxZQkvEDFj2Mh)
**Tokens CSS** : `frontend/src/styles/design-system.css`
**Thème ERP dérivé** : `frontend/src/styles/erp-theme.css`

---

## 1. Philosophie

- **Pas de violet, pas de bleu générique, pas de gradient tech.** La marque tient dans les couleurs qu'on trouve à l'atelier : crème parchemin, terre cuite, sauge (teinture végétale), indigo tunisien, or (fil doré).
- Le fond est **crème** (`#FBF8F3`, pas blanc pur). Le contraste vient des accents chauds, jamais d'un gradient vif.
- **Typo à trois voix** :
  - **Fraunces** italic 500 pour les titres qui portent l'identité (nom de la marque, titres de sections emblématiques, signatures).
  - **Inter** 400/500/600 pour le corps, les labels, les boutons, la navigation.
  - **JetBrains Mono** avec `tabular-nums` pour les chiffres qui s'alignent (montants, quantités, timers), les références et les IDs.
- **Composants inspirés de l'atelier** : bulletin de paie papier crème + cachet rond, tableau de fabrication style planning papier, TV mural horloge d'atelier, configurateur avec preview fouta bicolore.
- Aucun `#hex` hardcodé pour la palette : tout passe par `var(--*)` — condition pour supporter le dark mode et les évolutions.

---

## 2. Palette

### 2.1 Couleurs de fond (light mode)

| Token | Valeur | Usage |
| --- | --- | --- |
| `--bg-app` | `#FBF8F3` | Crème parchemin — fond principal de l'application |
| `--bg-canvas` | `#F5EFE5` | Beige plus dense — en-têtes de tableaux, zones d'accueil |
| `--bg-elevated` | `#FFFFFF` | Cartes, modals, dropdowns élevés |
| `--bg-hover` | `#F0E9DA` | État hover discret sur lignes / liens |
| `--bg-sunken` | `#EBE2CE` | Zones renfoncées (barres d'outil, aires de saisie) |

### 2.2 Texte

| Token | Valeur | Usage |
| --- | --- | --- |
| `--fg-primary` | `#2F1F12` | Espresso — titres, corps principal |
| `--fg-secondary` | `#6B4E31` | Brun tissage — sous-titres, texte secondaire |
| `--fg-muted` | `#9B8874` | Taupe — labels d'overline, hints, placeholders |
| `--fg-inverse` | `#FBF8F3` | Texte sur fond sombre (TV, boutons pleins) |

### 2.3 Bordures

| Token | Valeur | Usage |
| --- | --- | --- |
| `--border-subtle` | `#EDE3CE` | Séparateurs très légers, entre cartes contiguës |
| `--border-default` | `#DFD3B8` | Bordure standard sur inputs, cartes |
| `--border-strong` | `#C4B394` | Bordure accentuée sur focus non-primaire, séparateurs de section |

### 2.4 Accents marque

| Token | Valeur | Rôle |
| --- | --- | --- |
| `--accent-terracotta` | `#C8663D` | **Accent principal** — CTA, badges alertes chaleureuses, bordures gauches KPI |
| `--accent-gold` | `#C89B3C` | Fil d'or — warnings, mise en valeur, second accent chaud |
| `--accent-sage` | `#7A8C6A` | Teinture végétale — validation, statut positif, KPI production |
| `--accent-indigo` | `#4A5D75` | Indigo tunisien — info, refs mono, statut neutre |
| `--accent-rose` | `#B57B7B` | Garance — accent doux (RH, féminin), séparation graphiques |

### 2.5 Feedback

| Token | Valeur | Background |
| --- | --- | --- |
| `--color-success` | `#6B8E4E` | `--color-success-bg: #EFF3E7` |
| `--color-warning` | `#D4A038` | `--color-warning-bg: #FBF3DE` |
| `--color-danger` | `#B84A2F` | `--color-danger-bg: #FBEBE4` |
| `--color-info` | `#5C7A97` | `--color-info-bg: #E8EFF6` |

### 2.6 KPI chart palette

Six couleurs pour graphiques et séries — dans l'ordre :

| Token | Valeur | Sémantique par défaut |
| --- | --- | --- |
| `--kpi-1` | `#C8663D` (terracotta) | CA, ventes, série principale |
| `--kpi-2` | `#C89B3C` (or) | Marge, second axe |
| `--kpi-3` | `#7A8C6A` (sauge) | Production, cible atteinte |
| `--kpi-4` | `#4A5D75` (indigo) | Stock, référence neutre |
| `--kpi-5` | `#B57B7B` (rose) | RH, absences, secondaire |
| `--kpi-6` | `#8B6F47` (brun clair) | Autres / long tail |

### 2.7 Dark mode

Activé via `:root[data-theme="dark"]` ou `prefers-color-scheme: dark`. Les tokens sont remappés :

| Token | Dark |
| --- | --- |
| `--bg-app` | `#1A130C` |
| `--bg-canvas` | `#241A11` |
| `--bg-elevated` | `#2E2317` |
| `--bg-hover` | `#382B1D` |
| `--fg-primary` | `#F5EFE5` |
| `--fg-secondary` | `#D4C4A8` |
| `--accent-terracotta` | `#E27952` (plus lumineux) |
| `--accent-sage` | `#9BAD87` |
| `--accent-indigo` | `#7691AE` |

Les shadows deviennent plus profondes (`rgba(0,0,0,0.35+)`). Les backgrounds de feedback passent en semi-transparent (`rgba(color,0.15)`).

---

## 3. Typographie

| Token | Famille | Usage typique |
| --- | --- | --- |
| `--font-sans` | Inter, -apple-system, Segoe UI, system-ui | Corps, labels, boutons, nav |
| `--font-serif` | Fraunces, Georgia, Times New Roman | Titres d'identité, signatures, noms d'entités |
| `--font-mono` | JetBrains Mono, Fira Code, SF Mono, Menlo | Chiffres, refs produits, IDs, code |

Import Google Fonts déjà présent dans `design-system.css` :
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
```

### 3.1 Fraunces (serif d'identité)

- Utilisé pour : titres de page (Fraunces italic 500), noms d'entités (client, article), signatures manuscrites, éléments emblématiques (nom "La Plume Artisanale").
- Weights : `500` / `600` / `700`. **Italic 500 est le look emblématique** (nom de marque, watermark, en-têtes de bulletin).
- Fallback : `Georgia, 'Times New Roman', serif`.

### 3.2 Inter (sans-serif fonctionnelle)

- Utilisé pour : tout ce qui est fonctionnel — corps de texte, labels de formulaire, boutons, navigation, menus, breadcrumbs.
- Weights : `400` / `500` / `600` / `700`.
- Family par défaut du `<body>` via `--font-sans`.

### 3.3 JetBrains Mono (mono)

- Utilisé pour : chiffres qui s'alignent en colonnes (montants, quantités, timers, horloges TV), références produits, IDs, code SQL en devtools.
- Toujours activer `font-variant-numeric: tabular-nums` pour aligner en colonne.

### 3.4 Échelle typographique

| Token | Rem | Pixels |
| --- | --- | --- |
| `--text-xs` | `0.75rem` | 12 |
| `--text-sm` | `0.875rem` | 14 |
| `--text-base` | `1rem` | 16 |
| `--text-md` | `1.0625rem` | 17 |
| `--text-lg` | `1.25rem` | 20 |
| `--text-xl` | `1.5rem` | 24 |
| `--text-2xl` | `1.875rem` | 30 |
| `--text-3xl` | `2.25rem` | 36 |
| `--text-4xl` | `3rem` | 48 |

### 3.5 Line-heights

| Token | Valeur | Usage |
| --- | --- | --- |
| `--leading-tight` | `1.2` | Titres H1/H2 |
| `--leading-snug` | `1.35` | Sous-titres, cartes denses |
| `--leading-normal` | `1.55` | Corps de texte, prose |

---

## 4. Espacements, radius, shadows, z-index

### 4.1 Système 4-based (spacing)

| Token | Rem | Px | Usage |
| --- | --- | --- | --- |
| `--s-1` | `0.25rem` | 4 | Icone ↔ label, hairline |
| `--s-2` | `0.5rem` | 8 | Padding badge, gap tight |
| `--s-3` | `0.75rem` | 12 | Padding boutons, gap standard |
| `--s-4` | `1rem` | 16 | Padding carte, gap normal |
| `--s-5` | `1.25rem` | 20 | Padding section |
| `--s-6` | `1.5rem` | 24 | Padding page, gap loose |
| `--s-8` | `2rem` | 32 | Séparateur de section |
| `--s-10` | `2.5rem` | 40 | Marges de page |
| `--s-12` | `3rem` | 48 | Grand vide (hero, headers TV) |
| `--s-16` | `4rem` | 64 | Vide XXL |

### 4.2 Border-radius

| Token | Valeur | Usage |
| --- | --- | --- |
| `--radius-xs` | `4px` | Tags fins, séparateurs |
| `--radius-sm` | `8px` | Inputs, badges pill secondaires |
| `--radius-md` | `12px` | Cartes KPI, modals |
| `--radius-lg` | `16px` | Cartes principales, cards TV |
| `--radius-xl` | `24px` | Blocs héros, panels TV |
| `--radius-full` | `999px` | Boutons pill, badges statut, avatars |

### 4.3 Shadows (warm-toned)

| Token | Valeur | Usage |
| --- | --- | --- |
| `--shadow-xs` | `0 1px 2px rgba(75,45,20,0.06)` | Hover discret |
| `--shadow-sm` | `0 2px 4px + 0 1px 2px rgba(75,45,20,…)` | Cartes standard |
| `--shadow-md` | `0 4px 12px + 0 2px 4px` | Modals au repos |
| `--shadow-lg` | `0 12px 24px + 0 4px 8px` | Modals actifs, popovers |
| `--shadow-xl` | `0 24px 48px rgba(75,45,20,0.14)` | Overlays, cachets, bulletins |
| `--shadow-inner` | `inset 0 1px 2px rgba(75,45,20,0.05)` | Zones renfoncées |

Toutes les shadows utilisent une **teinte brune** (`rgba(75,45,20,…)`) — jamais du noir pur en light mode.

### 4.4 Z-index

| Token | Valeur |
| --- | --- |
| `--z-base` | `1` |
| `--z-elevated` | `10` |
| `--z-sticky` | `20` |
| `--z-dropdown` | `30` |
| `--z-modal` | `100` |
| `--z-toast` | `110` |

> **IMPORTANT — bug à ne pas reproduire** : ne **jamais** caster `var(--z-*)` en number en TypeScript (par exemple `var(--z-modal) as unknown as number` → produit `NaN` et écrase le stacking context, bug du popup sidebar). En React inline, écrire la valeur littérale (`zIndex: 1000`) ou ne pas définir `zIndex` du tout. Les tokens CSS `--z-*` ne sont utilisables qu'en CSS pur.

### 4.5 Transitions

| Token | Valeur |
| --- | --- |
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--duration-fast` | `120ms` |
| `--duration` | `180ms` |
| `--duration-slow` | `300ms` |

### 4.6 Layout

| Token | Valeur | Note |
| --- | --- | --- |
| `--header-h` | `64px` | Hauteur header sticky |
| `--sidebar-w` | `240px` | Sidebar plein — pages modernes utilisent `288px` (`w-72`) |
| `--sidebar-w-collapsed` | `64px` | Sidebar réduite (icônes seules) |
| `--container-max` | `1440px` | Largeur max contenu |
| `--content-gutter` | `var(--s-6)` (24px) | Gouttière latérale du contenu |

---

## 5. Composants réutilisables

### 5.1 KpiCard (fiche indicateur)

Carte KPI avec **bordure gauche colorée** (4px) qui code la sémantique. Le chiffre principal est en **Fraunces**, l'overline en **JetBrains Mono uppercase**, la ligne de contexte en Inter secondaire.

```tsx
<div style={{
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '4px solid var(--accent-terracotta)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--s-4)',
  boxShadow: 'var(--shadow-sm)',
}}>
  <div style={{
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--fg-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }}>
    CLIENTS ACTIFS
  </div>
  <div style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 500,
    color: 'var(--fg-primary)',
    marginTop: 'var(--s-1)',
    fontVariantNumeric: 'tabular-nums',
  }}>
    15
  </div>
  <div style={{
    color: 'var(--fg-secondary)',
    fontSize: 'var(--text-sm)',
    marginTop: 'var(--s-1)',
  }}>
    0 clients · 14 prospects
  </div>
</div>
```

**Variantes de bordure gauche** — coder la couleur par sens :
- Ventes / CA : `--accent-terracotta`
- Production / positif : `--accent-sage`
- Info / stock : `--accent-indigo`
- Warning / marge : `--accent-gold`
- Danger / perte : `--color-danger`
- RH / secondaire : `--accent-rose`

### 5.2 Badge de statut

Badge pill avec couleur codée. Utiliser fond wash + border + texte de la même famille.

| Statut | Fond | Border / Texte |
| --- | --- | --- |
| `validee` / `done` | `--color-success-bg` | `--color-success` |
| `en_cours` / `confirmed` | `--color-info-bg` | `--accent-indigo` |
| `brouillon` | `--bg-canvas` | `--fg-muted` |
| `verrouillee` | `--bg-sunken` | `--fg-primary` |
| `erreur` / `cancelled` | `--color-danger-bg` | `--color-danger` |
| `warning` | `--color-warning-bg` | `--color-warning` |

```tsx
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--s-1)',
  padding: '4px 12px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: 'var(--color-success-bg)',
  color: 'var(--color-success)',
  border: '1px solid var(--color-success)',
}}>
  Validée
</span>
```

### 5.3 Onglets pill

Tab actif = **fond terracotta plein, texte crème**. Inactif = transparent avec hover bordure basse.

```tsx
<button style={{
  padding: 'var(--s-2) var(--s-4)',
  borderRadius: 'var(--radius-full)',
  background: isActive ? 'var(--accent-terracotta)' : 'transparent',
  color: isActive ? '#FBF8F3' : 'var(--fg-secondary)',
  border: 'none',
  fontWeight: 600,
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
  transition: 'all var(--duration) var(--ease)',
}}>
  Sites e-commerce
</button>
```

### 5.4 Bouton primaire (CTA terracotta)

Le CTA canonique de l'app.

```tsx
<button style={{
  padding: 'var(--s-3) var(--s-6)',
  background: 'var(--accent-terracotta)',
  color: '#FBF8F3',
  border: 'none',
  borderRadius: 'var(--radius-full)',
  fontWeight: 600,
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(200,102,61,0.3)',
  transition: 'all var(--duration) var(--ease)',
}}>
  Créer un devis
</button>
```

Hover : `background: #A8552E`, `transform: translateY(-1px)`.

### 5.5 Bouton tablette XL

Pour les postes atelier (tablette tactile), boutons pleins couleur ~140px hauteur, icône Lucide + libellé.

```tsx
<button style={{
  minHeight: 140,
  minWidth: 220,
  padding: 'var(--s-4) var(--s-6)',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--accent-sage)',
  color: '#FBF8F3',
  border: 'none',
  fontFamily: 'var(--font-sans)',
  fontWeight: 700,
  fontSize: 'var(--text-lg)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--s-3)',
  boxShadow: 'var(--shadow-md)',
}}>
  <Package size={40} />
  Déclarer une pièce
</button>
```

Min hit-area 44px minimum. Utiliser les couleurs KPI pour distinguer les actions (`--accent-sage`, `--accent-indigo`, `--accent-terracotta`, `--accent-gold`).

### 5.6 Input

```tsx
<input style={{
  width: '100%',
  padding: 'var(--s-3) var(--s-4)',
  background: 'var(--bg-app)',
  color: 'var(--fg-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-sans)',
  transition: 'all var(--duration) var(--ease)',
}} />
```

Focus (via CSS ou pseudo `:focus`) :
```css
border-color: var(--accent-terracotta);
box-shadow: 0 0 0 4px rgba(200,102,61,0.18);
outline: none;
```

Placeholder `color: var(--fg-muted)`. Pour les chiffres, ajouter `fontFamily: 'var(--font-mono)'` et `textAlign: 'right'`.

### 5.7 Table

En-tête `--bg-canvas` avec **Fraunces italic 500** pour les libellés, lignes zébrées avec `--bg-app` alterné, hover `--bg-hover`.

```tsx
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead style={{ background: 'var(--bg-canvas)' }}>
    <tr>
      <th style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: 'var(--text-sm)',
        color: 'var(--fg-secondary)',
        padding: 'var(--s-3) var(--s-4)',
        textAlign: 'left',
        borderBottom: '1px solid var(--border-default)',
      }}>
        Article
      </th>
      {/* … */}
    </tr>
  </thead>
  <tbody>
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: 'var(--s-3) var(--s-4)' }}>Fouta beldi 100×200</td>
      <td style={{
        padding: 'var(--s-3) var(--s-4)',
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
      }}>
        42,000 DT
      </td>
    </tr>
  </tbody>
</table>
```

### 5.8 Modal

Overlay dim + backdrop-filter blur, container radius-lg, shadow-xl.

```tsx
{/* Overlay */}
<div style={{
  position: 'fixed',
  inset: 0,
  background: 'rgba(20,12,6,0.45)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  {/* Container */}
  <div style={{
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    padding: 'var(--s-8)',
    maxWidth: 560,
    width: 'calc(100% - 32px)',
  }}>
    {/* … */}
  </div>
</div>
```

### 5.9 Bulletin de paie PRO

Pattern extrait de `frontend/src/components/rh/BulletinPaiePro.tsx` — document imprimable style papier ancien.

Ingrédients :
- Fond : `linear-gradient(180deg, #FDFBF3 0%, #F7F1E2 100%)`
- Watermark : texte "La Plume Artisanale" Fraunces `rotate(-15deg)`, `fontSize: 96`, `color: #C8663D`, `opacity: 0.06`, `letterSpacing: 8`
- Bordure haute : `borderBottom: '2px solid #C8663D'`
- Cachet rond SVG terracotta (voir `<CachetRond />` §8.3)
- Signature calligraphique : Fraunces italic 500, `color: var(--accent-indigo)`, taille ~22-28px
- Perforations : bordure `dashed 2px var(--border-strong)` pour le talon détachable en bas
- Chiffres : `font-family: var(--font-mono)`, `tabular-nums`, alignés à droite

Padding généreux (`48px 56px`), maxWidth `900px`, box-shadow chaude `0 12px 40px rgba(74,93,117,0.15)`.

### 5.10 Écran TV mural (atelier)

Pattern extrait de `frontend/src/pages/TvAtelierScreen.tsx` — plein écran 1920×1080, sombre, KPI géants.

- Fond : `linear-gradient(135deg, #1C1917 0%, #3B4E68 100%)`, `min-height: 100vh`, `min-width: 100vw`
- Texte crème : `color: #FDFBF3`
- Décor : deux cercles `radial-gradient` diffus (terracotta top-right, sauge bottom-left, `opacity: 0.18-0.22`)
- Cartes glassmorphism : `background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`, `border: 1px solid rgba(255,255,255,0.08)`, `backdrop-filter: blur(8px)`, `borderRadius: 16-24`
- Horloge géante : JetBrains Mono, `fontSize: 56-72`, tabular-nums, secondes clignotantes
- Podium top 5 : médailles or / argent / bronze (positions 1/2/3), `--accent-gold` / `#C0C0C0` / `#CD7F32`
- Barre horaire idéal 100% : bar chart avec objectif en pointillé terracotta, réalisé plein sauge

### 5.11 Configurateur produit (fouta)

Pattern extrait de `frontend/src/pages/ConfigurateurPersonnalisation.tsx` — layout **3 colonnes** :
- **Colonne miniatures** : `80px` de largeur, thumbnails verticales des variantes
- **Preview grande** : `1.4fr` — SVG fouta bicolore 100% client-side (voir `<PreviewFouta />`)
- **Options** : `380px` — palette, dimensions, quantités, badges 24h

CSS grid :
```css
grid-template-columns: 80px 1.4fr 1.1fr; /* ~ 380px sur écran standard */
gap: var(--s-5);
```

- Palette : swatches ronds `radius-full` avec bordure `border-default`, actif = bordure `terracotta` + halo
- 6 dimensions standard en grille 3×2
- Badge « livraison 24h » : pill `--color-success-bg`
- Prix dégressif 4 paliers : tableau JetBrains Mono avec ligne active surlignée `--bg-hover`

---

## 6. Patterns page

### 6.1 Layout standard

- **Sidebar** : `288px` fixe à gauche (Tailwind `w-72`) — le token `--sidebar-w: 240px` reste la version compacte historique. Fond `--bg-elevated`, bordure droite `--border-subtle`.
- **Header** : `60-64px` sticky top, fond `--bg-elevated` avec shadow-sm.
- **Contenu principal** : `padding: var(--s-6)` (24px), fond `--bg-app` (le crème), max-width `--container-max`.
- **Breadcrumb** en haut du contenu : « Accueil › Section › Page » — JetBrains Mono 12px `--fg-muted`, séparateur `›` en `--fg-muted` opacity 0.5.

### 6.2 En-tête de section

Trois lignes empilées, en haut du contenu :

```tsx
<header style={{ marginBottom: 'var(--s-8)' }}>
  <div style={{
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--fg-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }}>
    RH · Bulletins de paie
  </div>
  <h1 style={{
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontWeight: 500,
    fontSize: 'var(--text-3xl)',
    color: 'var(--fg-primary)',
    margin: 'var(--s-2) 0 var(--s-1)',
  }}>
    Primes de rendement
  </h1>
  <p style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-md)',
    color: 'var(--fg-secondary)',
    margin: 0,
  }}>
    Cagnotte hebdo par atelier — hors bulletin.
  </p>
</header>
```

### 6.3 Sommaire filtrable (long screens)

Sur les pages inventaires / longues, prévoir une grille de cartes catégorie avec **barre gauche colorée** + liste de liens ancres. Champ de recherche fuzzy au-dessus filtre les items.

### 6.4 Dashboard §14

Structure canonique :
1. **Rangée KPI** : grille 4 colonnes (`.lp-metric-grid`, `minmax(240px, 1fr)`), gap `--s-5`
2. **Rangée charts** : grille 3 colonnes (`.lp-grid-3`), gap `--s-5`
3. **Zone actions rapides** en bas : boutons pill + liens rapides

Les utilities CSS existent déjà : `.lp-container`, `.lp-stack`, `.lp-row`, `.lp-metric-grid`, `.lp-grid-2`, `.lp-grid-3`.

### 6.5 Tablette atelier

- **Header** : icône poste + libellé + société + heure + notif + déconnexion
- 3-5 grands onglets (min 60px hauteur)
- Contenu : gros boutons XL (§5.5), KPI colorés, saisie chiffres avec pavé `+` / `-`
- Design tactile prioritaire, **min hit-area 44px**, pas de hover-only, feedback instantané au tap

### 6.6 Document (Devis / Commande / Facture / BL)

- **Papier crème** `#FBF8F3` avec bordure fine `--border-default`
- **En-tête** : logo `<PlumeLogo variant="full" />` à gauche + coordonnées société · à droite : type de document en Fraunces italic + numéro en JetBrains Mono
- **Bloc client** + adresse
- **Table articles** : chiffres en JetBrains Mono, alignés à droite, tabular-nums
- **Pied** : conditions + signature calligraphique Fraunces italic + cachet rond terracotta

---

## 7. Conventions React

### 7.1 Où mettre le style

- **Préférer les tokens `var(--*)`** en `style={{}}` inline (pattern utilisé par toutes les pages récentes : `EcommerceB2B`, `PrimesRendement`, `ConfigurateurPersonnalisation`).
- OU utiliser Tailwind pour la **structure** (`flex`, `grid`, `gap-4`, `w-72`) — mais **jamais Tailwind hex** pour les couleurs.
- Ne pas mélanger anarchie de styles inline hex + Tailwind hex sur le même composant.

### 7.2 Interdit

- `#hex` hardcodé pour couleurs de la palette : utiliser `var(--accent-terracotta)` **pas** `#C8663D` (sauf dans le cas particulier des composants SVG qui ne peuvent pas hériter des vars, comme `<CachetRond />`).
- Gradients bleu/violet génériques : **jamais** `from-blue-*`, `to-purple-*`, `from-indigo-500`, etc.
- Icônes autres que **Lucide-react**.
- Casts `var(--z-*) as unknown as number` → produit `NaN`. Écrire `1000` littéral, ou omettre `zIndex`.
- Emojis en production (accepté seulement en dev tools / démo).

### 7.3 Recommandé

- Icons Lucide-react avec taille explicite : `size={16}` (≈ `--text-xs`) ou `size={20}` (≈ `--text-md`).
- Structure de page : bloc header (§6.2), contenu principal, actions en pied si nécessaire.
- **Fallback mock data** via `Promise.allSettled` + helper `pick` (voir `EcommerceB2B.tsx:310-331`) :
  ```tsx
  const [sRes, cRes] = await Promise.allSettled([
    apiA.list(),
    apiB.list(),
  ]);
  const pick = <T,>(res: PromiseSettledResult<any>, path: string, fallback: T[]): T[] => {
    if (res.status !== 'fulfilled') return fallback;
    const d = res.value?.data?.data ?? res.value?.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d[path])) return d[path];
    return fallback;
  };
  setSites(pick<Site>(sRes, 'sites', MOCK_SITES));
  ```
  → l'écran reste utilisable en démo / hors ligne sans exception.

---

## 8. Iconographie et imagerie

### 8.1 Lucide-react uniquement

Bibliothèque unique. Quelques icônes contextuelles récurrentes :

| Contexte | Icône Lucide |
| --- | --- |
| Production / atelier | `Factory`, `Package`, `Scissors` |
| Équipes / RH | `Users`, `Award`, `UserCheck` |
| Ventes | `ShoppingCart`, `TrendingUp`, `Receipt` |
| Documents | `FileText`, `FileSpreadsheet`, `Printer` |
| Comptabilité | `Calculator`, `Wallet`, `DollarSign` |
| Actions rapides | `Zap`, `Plus`, `Search`, `Filter` |
| État | `CheckCircle`, `AlertTriangle`, `X`, `Info` |

### 8.2 À éviter

- Emojis dans les libellés production (uniquement démo/dev tools).
- Icônes génériques sans sens métier (`Star`, `Heart` non contextualisés).
- Deux bibliothèques d'icônes dans la même page.

### 8.3 SVG maison

Trois SVG signature à réutiliser plutôt que réinventer :

- **Logo Plume** : `frontend/src/components/PlumeLogo.tsx` — navette de tissage lenticulaire avec rayures fouta terracotta/indigo/or + plume stylisée. Variantes `icon` et `full` (avec nom en Fraunces italic 500).
- **Cachet rond** : `frontend/src/components/rh/CachetRond.tsx` — tampon administratif SVG terracotta, texte curviligne haut/bas via `<textPath>`, étoiles séparatrices, texte central italique. Utilisé sur BulletinPaiePro et avenants de contrat.
- **Preview fouta** : `frontend/src/components/configurateur/PreviewFouta.tsx` — rendu SVG paramétrique d'une fouta bicolore, 100% client-side, réagit aux changements de palette / dimensions en temps réel.

---

## 9. Checklist — une nouvelle page respecte-t-elle le système ?

Avant merge d'une nouvelle page ou d'un nouvel écran :

- [ ] Fond principal = `var(--bg-app)` ou hérité (jamais `#fff` blanc pur, jamais fond bleuté générique)
- [ ] Titre H1 en **Fraunces italic 500** (`fontFamily: var(--font-serif)`, `fontStyle: italic`, `fontWeight: 500`)
- [ ] Corps de texte en Inter (hérite via `--font-sans` du `body`)
- [ ] Chiffres alignés en JetBrains Mono avec `tabular-nums`
- [ ] Accent principal = terracotta (CTA, bordure gauche KPI dominant)
- [ ] **Aucun** `#hex` hardcodé de la palette dans les couleurs (SVG interne exempté)
- [ ] **Aucun** gradient `from-blue-*` / `to-purple-*` / `from-indigo-500`
- [ ] Icônes Lucide-react uniquement, taille `size={16}` ou `size={20}`
- [ ] Fonctionne à `400px` de largeur (responsive tablette / mobile)
- [ ] Dark mode supportée (via tokens `var(--*)`, pas de couleurs light-only)
- [ ] Aucun cast `var(--z-*) as unknown as number` — valeur littérale ou pas de `zIndex`
- [ ] Fallback mock data via `Promise.allSettled` + `pick` si data API
- [ ] Boutons tactiles ≥ 44px de hauteur si écran atelier
- [ ] Focus visible sur tous les éléments interactifs (bordure terracotta + halo `rgba(200,102,61,0.18)`)

---

## 10. Ressources

| Ressource | Chemin |
| --- | --- |
| Contrat métier | `docs/domain.md` (§ à jour v2.9) |
| Tokens CSS | `frontend/src/styles/design-system.css` |
| Thème ERP dérivé | `frontend/src/styles/erp-theme.css` |
| Composants réutilisables | `frontend/src/components/` |
| Artifact HTML de référence | `scratchpad/design-system-plume.html` (v36) — [claude.ai/artifact/UrmNYdWdeTxZQkvEDFj2Mh](https://claude.ai/artifact/UrmNYdWdeTxZQkvEDFj2Mh) |
| Logo Plume SVG | `frontend/src/components/PlumeLogo.tsx` |
| Cachet officiel SVG | `frontend/src/components/rh/CachetRond.tsx` |
| Bulletin de paie PRO | `frontend/src/components/rh/BulletinPaiePro.tsx` |
| Preview fouta SVG | `frontend/src/components/configurateur/PreviewFouta.tsx` |
| Écran TV atelier | `frontend/src/pages/TvAtelierScreen.tsx` (shell), `TvAtelierTissage.tsx`, `TvAtelierFinition.tsx` |

**Pages exemplaires** à copier pour démarrer :
- `frontend/src/pages/EcommerceB2B.tsx` — dashboard multi-onglets + KPIs + fallback mock
- `frontend/src/pages/PrimesRendement.tsx` — écran RH long, tables + modals
- `frontend/src/pages/ConfigurateurPersonnalisation.tsx` — layout 3 colonnes avec preview live
- `frontend/src/pages/TvAtelierTissage.tsx` — écran plein-écran mode sombre atelier

---

*Ce document est la référence obligatoire pour toute nouvelle page ou tout agent futur travaillant sur l'ERP La Plume Artisanale. En cas de conflit entre ce doc et l'artifact v36, l'artifact fait foi (source de vérité visuelle), et ce doc doit être remis à jour.*
