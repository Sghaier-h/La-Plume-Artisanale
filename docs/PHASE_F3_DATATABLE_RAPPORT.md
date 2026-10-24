# Phase F3 — DataTable réutilisable

## Composant créé

**`frontend/src/components/ui/DataTable.tsx`** — composant générique
`DataTable<T>` paramétré par `columns`, `data`, `rowKey`, exposant :

- **Tri colonnes** 3-états au clic (`asc → desc → off`) via header, avec
  icônes `ArrowUp` / `ArrowDown` / `ArrowUpDown`. Chaque colonne peut
  définir `sortable`, `value(row)` (valeur brute si différente du
  rendu), `render`, `align`, `width`, `exportable`.
- **Pagination** interne : sélecteur `pageSize` (10 / 25 / 50 / 100 par
  défaut), navigation `← 1 2 3 … N →`, compteur `start–end sur total`.
- **Sélection multi** (`selectable`) : checkbox header "tout
  sélectionner" (état indéterminé géré) + checkbox par ligne. Barre
  d'actions groupées sticky en haut quand ≥ 1 ligne sélectionnée
  (`"{N} sélectionnées : [actions]"`, actions via prop `bulkActions`).
- **Export CSV** (`;` séparateur + BOM UTF-8 pour Excel) via Blob + a
  download. **Export XLSX** via la lib `xlsx` déjà installée (fallback
  client) ; appel API `exportApiUrl` prioritaire si fourni.
- **Loading** : skeleton rows (5) avec animation `lp-pulse`.
- **EmptyState** paramétrable (fallback texte neutre).
- **Click row** → `onRowClick`, highlight ligne sélectionnée + hover
  `--bg-hover`, scroll horizontal mobile (`overflow-x: auto`).
- **Clavier** : `↑ / ↓` déplacent le focus de ligne, `Space` toggle la
  checkbox courante.

Export index : `frontend/src/components/ui/index.ts` ré-exporte
`DataTable` + types `Column`, `BulkAction`, `DataTableProps`.

## Pages migrées (10 / 10)

| Page | Fichier | Export CSV/XLSX | Pagination |
|---|---|---|---|
| Clients | `pages/Clients.tsx` | OK | 25 |
| Commandes | `pages/Commandes.tsx` | OK | 25 |
| Devis | `pages/Devis.tsx` | OK | 25 |
| Factures | `pages/Facture.tsx` | OK | 25 |
| Articles | `pages/Articles.tsx` | OK | 25 |
| Ordres de fabrication | `pages/OF.tsx` | OK | 25 |
| Sous-traitants | `pages/sous-traitants/SoustraitantsListe.tsx` | OK | 25 |
| Bons de commande | `pages/achats/BonsCommande.tsx` | OK | 25 |
| Avances salaires | `pages/rh/AvancesSalaires.tsx` | OK | 25 |
| Journal écritures | `pages/comptabilite/JournalEcritures.tsx` | OK | 25 |

Dans chaque page :

- Les filtres existants (KpiCards cliquables Phase T5, selects statut,
  recherche texte, etc.) restent intacts : la table reçoit le dataset
  déjà filtré (`clients`, `filteredDevis`, `filtered`, `rows.filter…`,
  etc.).
- Les actions bouton par ligne (`edit`, `delete`, `download PDF`,
  `démarrer OF`, `valider`, `payer`, `rembourser`…) sont câblées via
  colonnes `_actions` avec `render:` custom + `e.stopPropagation()`
  pour ne pas déclencher `onRowClick`.
- Les modales de détail (`selectedCommande`, `selectedFacture`,
  `selectedDevis`, `selected` BC) restent préservées.
- Mode catalogue / grille (Clients, Articles) conservé en branche
  alternative : `DataTable` n'est utilisé que pour le mode `ligne`.

## tsc

`npx tsc --noEmit` → **exit 0**, 0 erreur, 0 warning.

## Pattern à suivre pour les autres pages

```tsx
import { DataTable, Column } from '../components/ui/DataTable';

<DataTable<MonType>
  columns={[
    { key: 'code', label: 'Code', sortable: true,
      render: (r) => <span className="font-mono">{r.code}</span> },
    { key: 'montant', label: 'Montant', sortable: true, align: 'right',
      value: (r) => Number(r.montant) || 0,
      render: (r) => `${Number(r.montant).toFixed(2)} TND` },
    { key: '_actions', label: 'Actions', sortable: false,
      exportable: false, render: (r) => (
      <div onClick={(e) => e.stopPropagation()}>
        <button onClick={(e) => { e.stopPropagation(); edit(r); }}>…</button>
      </div>
    ) },
  ] as Column<MonType>[]}
  data={filtered}                           // filtres KPI appliqués en amont
  rowKey={(r) => r.id}
  onRowClick={(r) => navigate(`/.../${r.id}`)}
  pageSize={25}
  exportable
  exportFilename="mon_entite"
  loading={loading}
/>
```

Règles :

1. Pour les colonnes numériques triables, fournir `value` (nombre brut)
   et un `render` lisible (`toFixed`, unité).
2. Les colonnes d'actions / icônes passent `sortable: false` et
   `exportable: false`.
3. Appliquer `onClick={(e) => e.stopPropagation()}` sur le wrapper des
   boutons pour préserver le click row.
4. Ne jamais câbler la pagination côté page : laisser `DataTable` la
   gérer en interne (évite les double-pagination).
5. Pour l'export XLSX via backend, passer
   `exportApiUrl="/api/v2/export/<entity>/xlsx"` — fallback automatique
   client-side (`xlsx`) si l'appel échoue.
