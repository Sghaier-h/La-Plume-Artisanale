import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Image as ImageIcon, Layers, Package, Tag, Plus,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { modelesService, articlesCatalogueService } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────
interface Modele {
  id_modeles?: number;
  id_modele?: number;
  code_modele?: string;
  libelle?: string;
  designation?: string;
  description?: string;
  produit?: string;
  categorie?: string;
  image_url?: string | null;
  photo_modele?: string | null;
  actif?: boolean;
}

interface AttrOption {
  id: number;
  libelle: string;
  hex?: string;
}

interface AttributsDisponibles {
  dimensions: AttrOption[];
  couleurs: AttrOption[];
  finitions: AttrOption[];
  tissages: AttrOption[];
  personnalisations: AttrOption[];
  nombres_couleurs: AttrOption[];
}

interface Variante {
  id_article: number;
  code_article: string;
  designation?: string;
  id_dimension?: number | null;
  dimension_libelle?: string | null;
  id_couleur?: number | null;
  couleur_libelle?: string | null;
  couleur_hex?: string | null;
  id_finition?: number | null;
  finition_libelle?: string | null;
  id_tissage?: number | null;
  tissage_libelle?: string | null;
  id_personnalisation?: number | null;
  personnalisation_libelle?: string | null;
  id_nombre_couleurs?: number | null;
  nombre_couleurs_libelle?: string | null;
  prix_vente?: number | null;
  actif?: boolean;
}

// Envelope helper: { data: X } or { data: { data: X } } or X
const unwrap = <T,>(res: any): T => {
  const d = res?.data?.data ?? res?.data ?? res;
  if (d && typeof d === 'object' && 'data' in d && !Array.isArray(d)) {
    // ex: { data: { data: <bundle> } }
    const inner = (d as any).data;
    if (inner && typeof inner === 'object') return inner as T;
  }
  return d as T;
};

const emptyAttrs: AttributsDisponibles = {
  dimensions: [], couleurs: [], finitions: [], tissages: [],
  personnalisations: [], nombres_couleurs: []
};

const ModeleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modele, setModele] = useState<Modele | null>(null);
  const [attributs, setAttributs] = useState<AttributsDisponibles>(emptyAttrs);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire "Créer une nouvelle variante"
  const [sel, setSel] = useState<{
    id_dimension?: number;
    id_couleur?: number;
    id_finition?: number;
    id_tissage?: number;
    id_nombre_couleurs?: number;
    id_personnalisation?: number;
  }>({});
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const modeleId = (modele?.id_modeles ?? modele?.id_modele ?? (id ? parseInt(id, 10) : undefined));

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const numId = parseInt(id, 10);
    try {
      // 1) modele row (for header fallback)
      let modeleRow: Modele | null = null;
      try {
        const mRes = await modelesService.getModele(numId);
        modeleRow = unwrap<Modele>(mRes) || null;
      } catch (e) {
        // may still be recovered from /variantes payload below
      }

      // 2) modele + attributs_disponibles + variantes (main source of truth)
      try {
        const vRes = await modelesService.getVariantes(numId);
        const payload = unwrap<any>(vRes) || {};
        const attrs = payload?.attributs_disponibles || {};
        const normalizedAttrs: AttributsDisponibles = {
          dimensions: (Array.isArray(attrs.dimensions) ? attrs.dimensions : []).map((d: any) => ({
            id: d.id_dimension ?? d.id, libelle: d.libelle ?? ''
          })),
          couleurs: (Array.isArray(attrs.couleurs) ? attrs.couleurs : []).map((c: any) => ({
            id: c.id_couleur ?? c.id, libelle: c.libelle ?? c.nom ?? '', hex: c.hex ?? c.code_hex
          })),
          finitions: (Array.isArray(attrs.finitions) ? attrs.finitions : []).map((f: any) => ({
            id: f.id_finition ?? f.id, libelle: f.libelle ?? ''
          })),
          tissages: (Array.isArray(attrs.tissages) ? attrs.tissages : []).map((t: any) => ({
            id: t.id_tissage ?? t.id, libelle: t.libelle ?? ''
          })),
          personnalisations: (Array.isArray(attrs.personnalisations) ? attrs.personnalisations : []).map((p: any) => ({
            id: p.id_personnalisation ?? p.id, libelle: p.libelle ?? ''
          })),
          nombres_couleurs: (Array.isArray(attrs.nombres_couleurs) ? attrs.nombres_couleurs : []).map((n: any) => ({
            id: n.id_nombre_couleurs ?? n.id, libelle: n.libelle ?? ''
          }))
        };
        setAttributs(normalizedAttrs);
        setVariantes(Array.isArray(payload.variantes) ? payload.variantes : []);
        if (payload.modele) modeleRow = { ...modeleRow, ...payload.modele };
      } catch (e) {
        // Fallback pour les variantes si /variantes échoue
        try {
          const acRes = await articlesCatalogueService.getCatalogue({ id_modele: numId, limit: 200 });
          const list = unwrap<any>(acRes);
          const rows: any[] = Array.isArray(list) ? list : (Array.isArray(list?.data) ? list.data : []);
          setVariantes(rows as Variante[]);
        } catch {
          setVariantes([]);
        }
        setAttributs(emptyAttrs);
      }

      if (!modeleRow) {
        setError('Modèle introuvable');
      }
      setModele(modeleRow);
    } catch (err: any) {
      console.error('Erreur chargement modèle:', err);
      setError('Impossible de charger le modèle');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modeleId || !window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;
    try {
      await modelesService.deleteModele(modeleId);
      navigate('/modeles');
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // ─── Détection de doublon ─────────────────────────────────────────
  const combinaisonPartielle = useMemo(() => {
    return Object.entries(sel).some(([, v]) => v != null);
  }, [sel]);

  const varianteExistante = useMemo<Variante | null>(() => {
    if (!combinaisonPartielle) return null;
    // Comparaison sur les 6 identifiants; null/undefined dans `sel` = "non renseigné"
    const check = (a: number | null | undefined, b: number | undefined) =>
      (a ?? null) === (b ?? null);
    return variantes.find(v =>
      check(v.id_dimension, sel.id_dimension) &&
      check(v.id_couleur, sel.id_couleur) &&
      check(v.id_finition, sel.id_finition) &&
      check(v.id_tissage, sel.id_tissage) &&
      check(v.id_nombre_couleurs, sel.id_nombre_couleurs) &&
      check(v.id_personnalisation, sel.id_personnalisation)
    ) || null;
  }, [variantes, sel, combinaisonPartielle]);

  const canCreate = combinaisonPartielle && !varianteExistante;

  const buildAutoDesignation = (): string => {
    const parts: string[] = [];
    if (modele?.designation || modele?.libelle) parts.push(String(modele?.designation ?? modele?.libelle));
    const findLbl = (list: AttrOption[], id?: number) => id ? list.find(o => o.id === id)?.libelle : undefined;
    const lbls = [
      findLbl(attributs.dimensions, sel.id_dimension),
      findLbl(attributs.couleurs, sel.id_couleur),
      findLbl(attributs.finitions, sel.id_finition),
      findLbl(attributs.tissages, sel.id_tissage),
      findLbl(attributs.nombres_couleurs, sel.id_nombre_couleurs),
      findLbl(attributs.personnalisations, sel.id_personnalisation)
    ].filter(Boolean) as string[];
    return [...parts, ...lbls].join(' ').trim();
  };

  const buildAutoCode = (): string => {
    // TODO: laisser le backend générer si besoin — on tente un code basé sur le code modèle
    const base = modele?.code_modele || 'ART';
    const suffix = [
      sel.id_dimension, sel.id_couleur, sel.id_finition,
      sel.id_tissage, sel.id_nombre_couleurs, sel.id_personnalisation
    ].filter((v) => v != null).join('-');
    return `${base}-${suffix || Date.now()}`;
  };

  const handleCreate = async () => {
    if (!modeleId || !canCreate) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const payload: any = {
        id_modele: modeleId,
        ...(sel.id_dimension ? { id_dimension: sel.id_dimension } : {}),
        ...(sel.id_couleur ? { id_couleur: sel.id_couleur } : {}),
        ...(sel.id_finition ? { id_finition: sel.id_finition } : {}),
        ...(sel.id_tissage ? { id_tissage: sel.id_tissage } : {}),
        ...(sel.id_nombre_couleurs ? { id_nombre_couleurs: sel.id_nombre_couleurs } : {}),
        ...(sel.id_personnalisation ? { id_personnalisation: sel.id_personnalisation } : {}),
        designation: buildAutoDesignation() || 'Nouvelle variante',
        code_article: buildAutoCode(),
        actif: true
      };
      await articlesCatalogueService.createArticleCatalogue(payload);
      setCreateMsg({ type: 'success', text: 'Variante créée avec succès' });
      setSel({});
      await loadAll();
    } catch (err: any) {
      console.error('Erreur création variante:', err);
      const msg = err?.response?.data?.error?.message || err?.message || 'Erreur lors de la création';
      setCreateMsg({ type: 'error', text: msg });
    } finally {
      setCreating(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !modele) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Modèle non trouvé'}</p>
          <Link to="/modeles" className="mt-4 inline-block text-blue-600 hover:underline">
            &larr; Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const headerName = modele.designation || modele.libelle || '(sans nom)';
  const headerCode = modele.code_modele || '';
  const headerCat = modele.categorie || modele.produit || '';
  const headerDesc = modele.description || '';
  const headerImg = modele.image_url || modele.photo_modele || '';

  const renderAttrGroup = (title: string, items: AttrOption[], colorClass: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      {Array.isArray(items) && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <span key={`${title}-${it.id}`} className={`px-3 py-1 rounded text-sm ${colorClass}`}>
              {it.hex && (
                <span className="inline-block w-3 h-3 rounded-full mr-1 align-middle border border-gray-300"
                      style={{ backgroundColor: it.hex }} />
              )}
              {it.libelle}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Aucun</p>
      )}
    </div>
  );

  return (
    <div className="ml-64 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/modeles" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-3xl font-bold text-gray-900">{headerName}</h1>
          {headerCode && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">{headerCode}</span>
          )}
          {modele.actif ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Actif</span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">Inactif</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/modeles?edit=${modeleId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations générales + Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-1">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Image
            </h2>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {headerImg ? (
                <img src={headerImg} alt={headerName} className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md lg:col-span-2">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Informations générales
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code modèle</label>
                <p className="text-gray-900 font-mono">{headerCode || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <p className="text-gray-900">{headerCat || '—'}</p>
              </div>
            </div>
            {headerDesc && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{headerDesc}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attributs disponibles */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Attributs disponibles
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderAttrGroup('Dimensions', attributs.dimensions, 'bg-blue-100 text-blue-800')}
          {renderAttrGroup('Couleurs', attributs.couleurs, 'bg-pink-100 text-pink-800')}
          {renderAttrGroup('Finitions', attributs.finitions, 'bg-orange-100 text-orange-800')}
          {renderAttrGroup('Tissages', attributs.tissages, 'bg-green-100 text-green-800')}
          {renderAttrGroup('Nombres de couleurs', attributs.nombres_couleurs, 'bg-purple-100 text-purple-800')}
          {renderAttrGroup('Personnalisations', attributs.personnalisations, 'bg-yellow-100 text-yellow-800')}
        </div>
      </div>

      {/* Articles existants */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Articles existants (variantes)
          </h2>
          <span className="text-sm text-gray-500">{variantes.length} variante(s)</span>
        </div>
        <div className="overflow-x-auto">
          {variantes.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 italic">Aucune variante pour ce modèle.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dimension</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Couleur</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Finition</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tissage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nb couleurs</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Personnalisation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variantes.map((v) => (
                  <tr
                    key={v.id_article}
                    onClick={() => navigate(`/articles/${v.id_article}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-2 font-mono text-sm">{v.code_article}</td>
                    <td className="px-4 py-2 text-sm">{v.designation || '—'}</td>
                    <td className="px-4 py-2 text-sm">{v.dimension_libelle || '—'}</td>
                    <td className="px-4 py-2 text-sm">
                      {v.couleur_hex && (
                        <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle border border-gray-300"
                              style={{ backgroundColor: v.couleur_hex }} />
                      )}
                      {v.couleur_libelle || '—'}
                    </td>
                    <td className="px-4 py-2 text-sm">{v.finition_libelle || '—'}</td>
                    <td className="px-4 py-2 text-sm">{v.tissage_libelle || '—'}</td>
                    <td className="px-4 py-2 text-sm">{v.nombre_couleurs_libelle || '—'}</td>
                    <td className="px-4 py-2 text-sm">{v.personnalisation_libelle || '—'}</td>
                    <td className="px-4 py-2 text-sm">
                      {v.prix_vente != null ? `${Number(v.prix_vente).toFixed(2)} TND` : '—'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {v.actif ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Actif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Inactif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Créer une nouvelle variante */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Créer une nouvelle variante
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Dimension', key: 'id_dimension' as const, opts: attributs.dimensions },
              { label: 'Couleur', key: 'id_couleur' as const, opts: attributs.couleurs },
              { label: 'Finition', key: 'id_finition' as const, opts: attributs.finitions },
              { label: 'Tissage', key: 'id_tissage' as const, opts: attributs.tissages },
              { label: 'Nombre de couleurs', key: 'id_nombre_couleurs' as const, opts: attributs.nombres_couleurs },
              { label: 'Personnalisation', key: 'id_personnalisation' as const, opts: attributs.personnalisations }
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select
                  value={sel[key] ?? ''}
                  onChange={(e) => {
                    const v = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    setSel(prev => ({ ...prev, [key]: v }));
                    setCreateMsg(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!Array.isArray(opts) || opts.length === 0}
                >
                  <option value="">— Aucun —</option>
                  {Array.isArray(opts) && opts.map(o => (
                    <option key={o.id} value={o.id}>{o.libelle}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Warning doublon */}
          {varianteExistante && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span>
                Cet article existe déjà (code: <span className="font-mono font-semibold">{varianteExistante.code_article}</span>)
              </span>
            </div>
          )}

          {/* Message création */}
          {createMsg && (
            <div className={`p-3 rounded-lg ${
              createMsg.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {createMsg.text}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={!canCreate || creating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                canCreate && !creating ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {creating ? 'Création…' : 'Créer cet article'}
            </button>
            {!combinaisonPartielle && (
              <span className="text-sm text-gray-500">Sélectionnez au moins un attribut.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeleDetails;
