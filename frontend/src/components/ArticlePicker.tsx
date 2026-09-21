import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, ArrowLeft, Package, AlertTriangle, Minus, Plus } from 'lucide-react';
import { modelesService } from '../services/api';

export interface PickedArticle {
  id_article: number;
  code_article: string;
  designation: string;
  prix_vente: number;
  stock_disponible: number;
  quantite: number;
}

interface ArticlePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (article: PickedArticle) => void;
  initialModeleId?: number;
}

interface Modele {
  id_modeles: number;
  code_modele?: string;
  libelle?: string;
  categorie?: string;
  image_url?: string;
}

interface Variante {
  id_article: number;
  code_article: string;
  designation: string;
  id_dimension?: number; dimension_libelle?: string;
  id_couleur?: number;   couleur_libelle?: string; couleur_hex?: string;
  id_finition?: number;  finition_libelle?: string;
  id_tissage?: number;   tissage_libelle?: string;
  id_personnalisation?: number; personnalisation_libelle?: string;
  id_nombre_couleurs?: number;  nombre_couleurs_libelle?: string;
  prix_vente: number;
  stock_actuel: number;
  stock_reserve: number;
  stock_disponible: number;
  qte_minimal_stock: number;
  stock_alerte: boolean;
  image_url?: string | null;
}

interface AttributList<T> { items: T[]; }
interface Attributs {
  dimensions: { id_dimension: number; libelle: string }[];
  couleurs: { id_couleur: number; libelle: string; hex?: string }[];
  finitions: { id_finition: number; libelle: string }[];
  tissages: { id_tissage: number; libelle: string }[];
  personnalisations: { id_personnalisation: number; libelle: string }[];
  nombres_couleurs: { id_nombre_couleurs: number; libelle: string }[];
}

const STOCK_BG_OK    = 'color-mix(in srgb, var(--color-success, #16a34a) 15%, var(--bg-elevated, #fff))';
const STOCK_BG_WARN  = 'color-mix(in srgb, var(--color-warning, #f59e0b) 15%, var(--bg-elevated, #fff))';
const STOCK_BG_ZERO  = 'color-mix(in srgb, var(--color-danger, #dc2626) 10%, var(--bg-elevated, #fff))';

const cellBg = (v?: { stock_disponible: number; alerte?: boolean } | Variante | null) => {
  if (!v) return 'var(--bg-muted, #f3f4f6)';
  if (v.stock_disponible <= 0) return STOCK_BG_ZERO;
  if ((v as any).alerte || (v as Variante).stock_alerte) return STOCK_BG_WARN;
  return STOCK_BG_OK;
};

const ArticlePicker: React.FC<ArticlePickerProps> = ({ isOpen, onClose, onSelect, initialModeleId }) => {
  const [step, setStep] = useState<1 | 2>(initialModeleId ? 2 : 1);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [loadingModeles, setLoadingModeles] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedModeleId, setSelectedModeleId] = useState<number | undefined>(initialModeleId);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [attributs, setAttributs] = useState<Attributs | null>(null);
  const [modele, setModele] = useState<Modele | null>(null);
  const [loadingVar, setLoadingVar] = useState(false);
  const [view, setView] = useState<'matrix' | 'list'>('matrix');
  const [selectedVariant, setSelectedVariant] = useState<Variante | null>(null);
  const [qte, setQte] = useState<number>(1);
  const [filters, setFilters] = useState<{ finition?: number; tissage?: number; perso?: number; nbc?: number }>({});

  useEffect(() => {
    if (!isOpen) return;
    setStep(initialModeleId ? 2 : 1);
    setSelectedModeleId(initialModeleId);
    setSelectedVariant(null);
    setQte(1);
    setFilters({});
    if (!initialModeleId) loadModeles();
  }, [isOpen, initialModeleId]);

  useEffect(() => {
    if (selectedModeleId && isOpen) loadVariantes(selectedModeleId);
  }, [selectedModeleId, isOpen]);

  const loadModeles = async () => {
    setLoadingModeles(true);
    try {
      const r = await modelesService.getModeles({ actif: 'true' });
      const items = r.data?.data?.items || r.data?.items || r.data?.data || [];
      setModeles(Array.isArray(items) ? items : []);
    } catch { setModeles([]); }
    finally { setLoadingModeles(false); }
  };

  const loadVariantes = async (id: number) => {
    setLoadingVar(true); setSelectedVariant(null);
    try {
      const r = await modelesService.getVariantes(id);
      const payload = r.data?.data || r.data || {};
      setModele(payload.modele || null);
      setVariantes(payload.variantes || []);
      setAttributs(payload.attributs_disponibles || null);
    } catch {
      setVariantes([]); setAttributs(null); setModele(null);
    } finally { setLoadingVar(false); }
  };

  const filteredModeles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return modeles;
    return modeles.filter((m) =>
      (m.libelle || '').toLowerCase().includes(q) ||
      (m.code_modele || '').toLowerCase().includes(q) ||
      (m.categorie || '').toLowerCase().includes(q)
    );
  }, [modeles, search]);

  const filteredVariantes = useMemo(() => {
    return variantes.filter((v) =>
      (!filters.finition || v.id_finition === filters.finition) &&
      (!filters.tissage || v.id_tissage === filters.tissage) &&
      (!filters.perso || v.id_personnalisation === filters.perso) &&
      (!filters.nbc || v.id_nombre_couleurs === filters.nbc)
    );
  }, [variantes, filters]);

  const matrix = useMemo(() => {
    if (!attributs) return { dims: [], cols: [], grid: [] as (Variante | null)[][] };
    const dims = attributs.dimensions;
    const cols = attributs.couleurs;
    const grid = cols.map((c) =>
      dims.map((d) =>
        filteredVariantes.find((v) => v.id_couleur === c.id_couleur && v.id_dimension === d.id_dimension) || null
      )
    );
    return { dims, cols, grid };
  }, [attributs, filteredVariantes]);

  if (!isOpen) return null;

  const handlePick = () => {
    if (!selectedVariant) return;
    onSelect({
      id_article: selectedVariant.id_article,
      code_article: selectedVariant.code_article,
      designation: selectedVariant.designation,
      prix_vente: Number(selectedVariant.prix_vente) || 0,
      stock_disponible: selectedVariant.stock_disponible,
      quantite: Math.max(0.01, qte || 1),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'color-mix(in srgb, #000 40%, transparent)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'stretch', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg-base, #fff)',
          color: 'var(--text-base, #111)',
          width: 'min(1200px, 100%)',
          height: '100%',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          animation: 'slideIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderBottom: '1px solid var(--border-muted, #e5e7eb)',
          background: 'var(--bg-elevated, #fafafa)',
        }}>
          {step === 2 && (
            <button onClick={() => { setStep(1); setSelectedVariant(null); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ArrowLeft size={20} />
            </button>
          )}
          <Package size={22} style={{ color: 'var(--color-accent, #b45309)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {step === 1 ? 'Choisir un modèle' : (modele?.libelle || 'Variantes')}
            </div>
            {step === 2 && modele && (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {modele.code_modele} · {variantes.length} variante(s)
              </div>
            )}
          </div>
          <button onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {step === 1 && (
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              <div style={{ position: 'relative', maxWidth: 480, marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', top: 12, left: 12, opacity: 0.5 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un modèle..."
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    border: '1px solid var(--border-base, #d1d5db)', borderRadius: 8,
                    background: 'var(--bg-elevated, #fff)', color: 'inherit',
                  }}
                />
              </div>
              {loadingModeles ? (
                <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>Chargement…</div>
              ) : filteredModeles.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>Aucun modèle trouvé.</div>
              ) : (
                <div style={{
                  display: 'grid', gap: 16,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                }}>
                  {filteredModeles.map((m) => (
                    <button
                      key={m.id_modeles}
                      onClick={() => { setSelectedModeleId(m.id_modeles); setStep(2); }}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 10,
                        padding: 14, textAlign: 'left', cursor: 'pointer',
                        background: 'var(--bg-elevated, #fff)',
                        border: '1px solid var(--border-muted, #e5e7eb)',
                        borderRadius: 12, color: 'inherit',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      <div style={{
                        aspectRatio: '4 / 3', width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'color-mix(in srgb, var(--color-accent, #b45309) 8%, var(--bg-muted, #f3f4f6))',
                        borderRadius: 8, fontSize: 40, overflow: 'hidden',
                      }}>
                        {m.image_url
                          ? <img src={m.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span>🧵</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.libelle || m.code_modele}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{m.code_modele}</div>
                        {m.categorie && (
                          <span style={{
                            display: 'inline-block', marginTop: 6, padding: '2px 8px',
                            fontSize: 11, borderRadius: 999,
                            background: 'color-mix(in srgb, var(--color-accent, #b45309) 15%, transparent)',
                            color: 'var(--color-accent, #b45309)',
                          }}>{m.categorie}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                {/* Filtres chips */}
                {attributs && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {[
                      { list: attributs.finitions, key: 'finition' as const, idKey: 'id_finition', label: 'Finition' },
                      { list: attributs.tissages, key: 'tissage' as const, idKey: 'id_tissage', label: 'Tissage' },
                      { list: attributs.personnalisations, key: 'perso' as const, idKey: 'id_personnalisation', label: 'Personnalisation' },
                      { list: attributs.nombres_couleurs, key: 'nbc' as const, idKey: 'id_nombre_couleurs', label: 'Nb couleurs' },
                    ].filter((g) => g.list.length > 0).map((g) => (
                      <select key={g.key}
                        value={(filters as any)[g.key] || ''}
                        onChange={(e) => setFilters({ ...filters, [g.key]: e.target.value ? Number(e.target.value) : undefined })}
                        style={{
                          padding: '6px 10px', borderRadius: 999,
                          border: '1px solid var(--border-base, #d1d5db)',
                          background: 'var(--bg-elevated, #fff)', color: 'inherit', fontSize: 12,
                        }}
                      >
                        <option value="">{g.label} : Tous</option>
                        {g.list.map((x: any) => (
                          <option key={x[g.idKey]} value={x[g.idKey]}>{x.libelle}</option>
                        ))}
                      </select>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--bg-muted,#f3f4f6)', borderRadius: 8, padding: 2 }}>
                      {(['matrix', 'list'] as const).map((v) => (
                        <button key={v} onClick={() => setView(v)}
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 500,
                            background: view === v ? 'var(--bg-elevated, #fff)' : 'transparent',
                            color: 'inherit', boxShadow: view === v ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                          }}>
                          {v === 'matrix' ? 'Matrice' : 'Liste'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loadingVar ? (
                  <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>Chargement des variantes…</div>
                ) : variantes.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>Aucune variante pour ce modèle.</div>
                ) : view === 'matrix' && matrix.dims.length > 0 && matrix.cols.length > 0 ? (
                  <div style={{ overflow: 'auto', border: '1px solid var(--border-muted, #e5e7eb)', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: 10, background: 'var(--bg-muted,#f3f4f6)', position: 'sticky', top: 0, left: 0, zIndex: 2 }}></th>
                          {matrix.dims.map((d) => (
                            <th key={d.id_dimension} style={{
                              padding: 10, background: 'var(--bg-muted,#f3f4f6)',
                              position: 'sticky', top: 0, zIndex: 1,
                              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                            }}>{d.libelle}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matrix.cols.map((c, rIdx) => (
                          <tr key={c.id_couleur}>
                            <th style={{
                              padding: 10, background: 'var(--bg-muted,#f3f4f6)',
                              position: 'sticky', left: 0, textAlign: 'left',
                              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                            }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  width: 14, height: 14, borderRadius: '50%',
                                  background: c.hex || '#ccc', border: '1px solid rgba(0,0,0,0.1)',
                                }} />
                                {c.libelle}
                              </span>
                            </th>
                            {matrix.dims.map((d, cIdx) => {
                              const v = matrix.grid[rIdx][cIdx];
                              const isSel = selectedVariant?.id_article === v?.id_article;
                              return (
                                <td key={d.id_dimension} style={{ padding: 4 }}>
                                  {v ? (
                                    <button
                                      onClick={() => { setSelectedVariant(v); setQte(1); }}
                                      style={{
                                        width: '100%', padding: 8, cursor: 'pointer',
                                        background: cellBg(v),
                                        border: isSel
                                          ? '2px solid var(--color-accent, #b45309)'
                                          : '1px solid var(--border-muted, #e5e7eb)',
                                        borderRadius: 6, textAlign: 'center',
                                        color: 'inherit', fontSize: 12,
                                      }}
                                    >
                                      <div style={{ fontWeight: 600 }}>
                                        {v.stock_disponible}
                                        {v.stock_alerte && v.stock_disponible > 0 && (
                                          <AlertTriangle size={11} style={{ marginLeft: 4, verticalAlign: 'middle', color: 'var(--color-warning,#f59e0b)' }} />
                                        )}
                                      </div>
                                      <div style={{ opacity: 0.7, fontSize: 11 }}>
                                        {Number(v.prix_vente).toFixed(2)}
                                      </div>
                                    </button>
                                  ) : (
                                    <div style={{
                                      width: '100%', padding: 8, textAlign: 'center',
                                      background: 'var(--bg-muted,#f3f4f6)', borderRadius: 6,
                                      opacity: 0.4, fontSize: 12,
                                    }}>—</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ overflow: 'auto', border: '1px solid var(--border-muted, #e5e7eb)', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-muted,#f3f4f6)' }}>
                          {['Code', 'Désignation', 'Dimension', 'Couleur', 'Finition', 'Tissage', 'Prix', 'Stock dispo', ''].map((h) => (
                            <th key={h} style={{ padding: 10, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVariantes.map((v) => (
                          <tr key={v.id_article} style={{
                            borderTop: '1px solid var(--border-muted,#e5e7eb)',
                            background: selectedVariant?.id_article === v.id_article ? 'color-mix(in srgb, var(--color-accent,#b45309) 8%, transparent)' : 'transparent',
                          }}>
                            <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>{v.code_article}</td>
                            <td style={{ padding: 8 }}>{v.designation}</td>
                            <td style={{ padding: 8 }}>{v.dimension_libelle}</td>
                            <td style={{ padding: 8 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {v.couleur_hex && <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.couleur_hex, border: '1px solid rgba(0,0,0,0.1)' }} />}
                                {v.couleur_libelle}
                              </span>
                            </td>
                            <td style={{ padding: 8 }}>{v.finition_libelle}</td>
                            <td style={{ padding: 8 }}>{v.tissage_libelle}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>{Number(v.prix_vente).toFixed(2)}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12,
                                background: cellBg(v),
                              }}>
                                {v.stock_disponible}
                              </span>
                            </td>
                            <td style={{ padding: 8 }}>
                              <button onClick={() => { setSelectedVariant(v); setQte(1); }}
                                style={{
                                  padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                                  background: 'var(--color-accent, #b45309)', color: '#fff',
                                  border: 'none', borderRadius: 6,
                                }}>
                                Choisir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Panneau détail à droite */}
              {selectedVariant && (
                <div style={{
                  width: 340, borderLeft: '1px solid var(--border-muted, #e5e7eb)',
                  background: 'var(--bg-elevated, #fafafa)',
                  padding: 20, overflow: 'auto',
                  animation: 'slideInRight 0.2s ease-out',
                }}>
                  <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'monospace' }}>
                    {selectedVariant.code_article}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, margin: '4px 0 12px' }}>
                    {selectedVariant.designation}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    <StatChip label="Prix" value={`${Number(selectedVariant.prix_vente).toFixed(2)} TND`} />
                    <StatChip label="Stock dispo" value={String(selectedVariant.stock_disponible)}
                      bg={cellBg(selectedVariant)} />
                    <StatChip label="Réservé" value={String(selectedVariant.stock_reserve)} />
                    <StatChip label="Seuil min." value={String(selectedVariant.qte_minimal_stock)} />
                  </div>

                  <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>Quantité</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 8 }}>
                    <button onClick={() => setQte((q) => Math.max(0.01, +(q - 1).toFixed(2)))}
                      style={{ padding: 8, border: '1px solid var(--border-base,#d1d5db)', borderRadius: 6, background: 'var(--bg-base,#fff)', cursor: 'pointer' }}>
                      <Minus size={14} />
                    </button>
                    <input type="number" min={0.01} step={0.01} value={qte}
                      onChange={(e) => setQte(parseFloat(e.target.value) || 0)}
                      style={{
                        flex: 1, padding: 8, textAlign: 'center', fontSize: 16, fontWeight: 600,
                        border: '1px solid var(--border-base,#d1d5db)', borderRadius: 6,
                        background: 'var(--bg-base,#fff)', color: 'inherit',
                      }} />
                    <button onClick={() => setQte((q) => +(q + 1).toFixed(2))}
                      style={{ padding: 8, border: '1px solid var(--border-base,#d1d5db)', borderRadius: 6, background: 'var(--bg-base,#fff)', cursor: 'pointer' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  {qte > selectedVariant.stock_disponible && (
                    <div style={{
                      padding: 8, borderRadius: 6, marginBottom: 8,
                      background: STOCK_BG_WARN, fontSize: 12,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <AlertTriangle size={14} />
                      Quantité supérieure au stock disponible ({selectedVariant.stock_disponible})
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => setSelectedVariant(null)}
                      style={{
                        flex: 1, padding: 10, borderRadius: 8, cursor: 'pointer',
                        border: '1px solid var(--border-base,#d1d5db)',
                        background: 'var(--bg-base,#fff)', color: 'inherit',
                      }}>
                      Annuler
                    </button>
                    <button onClick={handlePick}
                      style={{
                        flex: 2, padding: 10, borderRadius: 8, cursor: 'pointer',
                        background: 'var(--color-accent, #b45309)', color: '#fff',
                        border: 'none', fontWeight: 600,
                      }}>
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(30px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
    </div>
  );
};

const StatChip: React.FC<{ label: string; value: string; bg?: string }> = ({ label, value, bg }) => (
  <div style={{
    padding: 8, borderRadius: 6,
    background: bg || 'var(--bg-base,#fff)',
    border: '1px solid var(--border-muted,#e5e7eb)',
  }}>
    <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
    <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
  </div>
);

export default ArticlePicker;
