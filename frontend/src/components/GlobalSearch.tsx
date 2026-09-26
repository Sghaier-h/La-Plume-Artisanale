/**
 * GlobalSearch - Recherche globale polie (Ctrl+K)
 * - Modal plein écran avec backdrop flouté
 * - Résultats groupés par type (Clients, Articles, Commandes, OF, Factures, BL, Utilisateurs)
 * - Debounce 250ms
 * - Navigation clavier (haut/bas, Entrée, Escape)
 * - Recent searches persistées dans localStorage
 * - Utilise les design tokens
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Search,
  X,
  FileText,
  Package,
  Users,
  ShoppingCart,
  Factory,
  Building2,
  Receipt,
  Truck,
  UserCircle2,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

type ResultGroupKey =
  | 'Clients'
  | 'Articles'
  | 'Commandes'
  | 'OF'
  | 'Factures'
  | 'BL'
  | 'Utilisateurs';

interface SearchResult {
  id: string | number;
  group: ResultGroupKey;
  label: string;
  description?: string;
  path: string;
}

const GROUP_ICONS: Record<ResultGroupKey, React.ComponentType<any>> = {
  Clients: Users,
  Articles: Package,
  Commandes: ShoppingCart,
  OF: Factory,
  Factures: Receipt,
  BL: Truck,
  Utilisateurs: UserCircle2,
};

const RECENT_KEY = 'lp_global_search_recent';
const MAX_RECENT = 6;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {}
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setActiveIdx(0);
  }, []);

  // Ctrl+K to open / Escape to close (global)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 20);
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await api.get(`/search`, { params: { q: query, limit: 20 } });
        const data = resp.data?.data ?? resp.data ?? {};
        const out: SearchResult[] = [];
        const pushGroup = (
          group: ResultGroupKey,
          arr: any[] | undefined,
          map: (row: any) => Omit<SearchResult, 'group'>
        ) => {
          (arr || []).forEach((r) => out.push({ group, ...map(r) }));
        };
        pushGroup('Clients', data.partners || data.clients, (r) => ({
          id: r.id_client ?? r.id,
          label: r.name || `${r.nom ?? ''} ${r.prenom ?? ''}`.trim(),
          description: r.email || r.telephone,
          path: `/clients/${r.id_client ?? r.id}`,
        }));
        pushGroup('Articles', data.products || data.articles, (r) => ({
          id: r.id_article ?? r.id,
          label: r.name || r.nom,
          description: r.default_code || r.reference,
          path: `/articles/${r.id_article ?? r.id}`,
        }));
        pushGroup('Commandes', data.sale_orders || data.commandes, (r) => ({
          id: r.id_commande ?? r.id,
          label: r.name || `Commande ${r.id_commande ?? r.id}`,
          description: r.partner_name || r.client,
          path: `/commandes/${r.id_commande ?? r.id}`,
        }));
        pushGroup('OF', data.productions || data.ordres_fabrication, (r) => ({
          id: r.id_of ?? r.id,
          label: r.name || `OF ${r.id_of ?? r.id}`,
          description: r.product_name || r.article,
          path: `/of/${r.id_of ?? r.id}`,
        }));
        pushGroup('Factures', data.factures || data.invoices, (r) => ({
          id: r.id_facture ?? r.id,
          label: r.numero || `Facture ${r.id_facture ?? r.id}`,
          description: r.client,
          path: `/factures/${r.id_facture ?? r.id}`,
        }));
        pushGroup('BL', data.bl || data.bons_livraison, (r) => ({
          id: r.id_bl ?? r.id,
          label: r.numero || `BL ${r.id_bl ?? r.id}`,
          description: r.client,
          path: `/bl/${r.id_bl ?? r.id}`,
        }));
        pushGroup('Utilisateurs', data.users || data.utilisateurs, (r) => ({
          id: r.id_user ?? r.id,
          label: r.name || `${r.prenom ?? ''} ${r.nom ?? ''}`.trim() || r.email,
          description: r.email || r.role,
          path: `/utilisateurs/${r.id_user ?? r.id}`,
        }));
        setResults(out);
        setActiveIdx(0);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Group results (preserving order)
  const grouped = useMemo(() => {
    const map = new Map<ResultGroupKey, SearchResult[]>();
    results.forEach((r) => {
      const arr = map.get(r.group) || [];
      arr.push(r);
      map.set(r.group, arr);
    });
    return Array.from(map.entries());
  }, [results]);

  const flatSelectable = results;

  const commitRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((x) => x !== t)].slice(0, MAX_RECENT);
    setRecent(next);
    saveRecent(next);
  };

  const handleSelect = (r: SearchResult) => {
    commitRecent(query);
    navigate(r.path);
    close();
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, flatSelectable.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = flatSelectable[activeIdx];
      if (r) handleSelect(r);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={open}
        aria-label="Ouvrir la recherche globale (Ctrl+K)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--s-2)',
          padding: '0 var(--s-3)',
          height: 36,
          minWidth: 260,
          maxWidth: 480,
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--fg-muted)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
          transition: 'all var(--duration) var(--ease)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-canvas)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <Search size={16} />
        <span style={{ flex: 1, textAlign: 'left' }}>Rechercher…</span>
        <kbd
          style={{
            padding: '2px 6px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 11,
            color: 'var(--fg-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Ctrl+K
        </kbd>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 12, 6, 0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10vh',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 92vw)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {/* Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s-3)',
                padding: 'var(--s-4)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Search size={20} style={{ color: 'var(--fg-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Rechercher… (Ctrl+K)"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--fg-primary)',
                  fontSize: 'var(--text-md)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Effacer"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--fg-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <X size={18} />
                </button>
              )}
              <kbd
                style={{
                  padding: '2px 6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 11,
                  color: 'var(--fg-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Esc
              </kbd>
            </div>

            {/* Body */}
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {query.trim().length < 2 ? (
                <div style={{ padding: 'var(--s-4)' }}>
                  {recent.length > 0 ? (
                    <>
                      <GroupLabel icon={<Clock size={14} />} label="Recherches récentes" />
                      {recent.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          style={rowStyle(false)}
                        >
                          <Clock size={16} style={{ color: 'var(--fg-muted)' }} />
                          <span style={{ flex: 1, textAlign: 'left', color: 'var(--fg-secondary)' }}>
                            {term}
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <EmptyState msg="Tapez au moins 2 caractères pour lancer une recherche." />
                  )}
                </div>
              ) : loading ? (
                <EmptyState msg="Recherche en cours…" />
              ) : results.length === 0 ? (
                <EmptyState msg="Aucun résultat trouvé." />
              ) : (
                <div style={{ padding: 'var(--s-2)' }}>
                  {(() => {
                    let flatIdx = 0;
                    return grouped.map(([group, rows]) => {
                      const Icon = GROUP_ICONS[group];
                      return (
                        <div key={group} style={{ padding: 'var(--s-2) 0' }}>
                          <GroupLabel
                            icon={<Icon size={14} />}
                            label={`${group}`}
                            count={rows.length}
                          />
                          {rows.map((r) => {
                            const idx = flatIdx++;
                            const active = idx === activeIdx;
                            return (
                              <button
                                key={`${group}-${r.id}`}
                                onClick={() => handleSelect(r)}
                                onMouseEnter={() => setActiveIdx(idx)}
                                style={rowStyle(active)}
                              >
                                <Icon size={16} style={{ color: 'var(--fg-muted)' }} />
                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                  <div
                                    style={{
                                      color: 'var(--fg-primary)',
                                      fontWeight: 500,
                                      fontSize: 'var(--text-sm)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {r.label}
                                  </div>
                                  {r.description && (
                                    <div
                                      style={{
                                        color: 'var(--fg-muted)',
                                        fontSize: 'var(--text-xs)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {r.description}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--s-4)',
                padding: 'var(--s-2) var(--s-4)',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                color: 'var(--fg-muted)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <span>&uarr;&darr; Naviguer</span>
              <span>&crarr; Ouvrir</span>
              <span>Esc Fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function rowStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--s-3)',
    padding: 'var(--s-2) var(--s-3)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: active ? 'var(--bg-hover)' : 'transparent',
    cursor: 'pointer',
    color: 'inherit',
    fontFamily: 'inherit',
    transition: 'background var(--duration-fast) var(--ease)',
  };
}

const GroupLabel: React.FC<{ icon?: React.ReactNode; label: string; count?: number }> = ({
  icon,
  label,
  count,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-2)',
      padding: 'var(--s-1) var(--s-3)',
      color: 'var(--fg-muted)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    }}
  >
    {icon}
    <span>{label}</span>
    {typeof count === 'number' && (
      <span
        style={{
          padding: '0 var(--s-2)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-canvas)',
          color: 'var(--fg-secondary)',
          fontSize: 10,
        }}
      >
        {count}
      </span>
    )}
  </div>
);

const EmptyState: React.FC<{ msg: string }> = ({ msg }) => (
  <div
    style={{
      padding: 'var(--s-8) var(--s-4)',
      textAlign: 'center',
      color: 'var(--fg-muted)',
      fontSize: 'var(--text-sm)',
    }}
  >
    {msg}
  </div>
);

export default GlobalSearch;
