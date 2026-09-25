import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Package, Calendar, Clock, AlertCircle, TrendingUp, CheckCircle, Play, Square, Settings, User, BarChart3, Factory, X, DollarSign, Boxes, ShieldAlert, ArrowLeftCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { ofService, suiviFabricationService } from '../services/api';

interface LigneOF {
  id_operation?: number;
  id_machine?: number;
  designation_operation?: string;
  machine_designation?: string;
  temps_unitaire?: number;
  temps_preparation?: number;
  ordre?: number;
}

interface OF {
  id_of?: number;
  numero_of: string;
  id_commande?: number;
  numero_commande?: string;
  id_article: number;
  article_designation?: string;
  code_article?: string;
  ref_commercial?: string;
  quantite_a_produire: number;
  quantite_produite?: number;
  statut: string;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  date_debut_reelle?: string;
  date_fin_reelle?: string;
  id_machine?: number;
  machine_designation?: string;
  priorite?: string;
  observations?: string;
  lignes_operations?: LigneOF[];
  date_creation?: string;
}

const OFDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [of, setOf] = useState<OF | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suivis, setSuivis] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    loadOF();
  }, [id]);

  // Socket.IO refresh
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const socketUrl = (process.env.REACT_APP_SOCKET_URL as string) ||
      (window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000');
    let s: Socket | null = null;
    try {
      s = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
      const refresh = () => loadOF();
      s.on('of:updated', refresh);
      s.on('production:updated', refresh);
      s.on('suivi:created', refresh);
      s.on(`of:${id}:updated`, refresh);
    } catch { /* silent */ }
    return () => { try { s?.close(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOF = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Endpoint enrichi
      try {
        const dr = await ofService.getDetailComplet(parseInt(id));
        const dd = dr.data?.data || dr.data;
        setDetail(dd);
        setOf(dd?.of || null);
        setSuivis(dd?.suivis || []);
      } catch {
        const response = await ofService.getOF(parseInt(id));
        setOf(response.data.data || response.data);
        try {
          const suivisRes = await suiviFabricationService.getSuivisFabrication({ id_of: id });
          setSuivis((() => {
            const _r = suivisRes.data?.data;
            if (Array.isArray(_r)) return _r;
            if (_r && Array.isArray(_r.data)) return _r.data;
            if (_r && typeof _r === 'object') {
              for (const k of Object.keys(_r)) if (Array.isArray((_r as any)[k])) return (_r as any)[k];
            }
            return [];
          })());
        } catch (err) {
          console.warn('Erreur chargement suivis:', err);
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement OF:', err);
      setError('Impossible de charger l\'ordre de fabrication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!of?.id_of || !window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) {
      return;
    }

    // Note: deleteOF n'est peut-être pas disponible dans l'API actuelle
    // Dans ce cas, on peut annuler l'OF ou gérer autrement
    try {
      // Tenter d'annuler l'OF si deleteOF n'est pas disponible
      if (of.statut === 'en_attente' || of.statut === 'planifie') {
        // Optionnel : mettre à jour le statut à 'annule' au lieu de supprimer
        // await ofService.updateOF(of.id_of, { statut: 'annule' });
        alert('La suppression directe des OF n\'est pas disponible. Utilisez la fonction Annuler dans la liste.');
      }
      navigate('/of');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDemarrer = async () => {
    if (!of?.id_of || !window.confirm('Démarrer cet ordre de fabrication ?\n\nCeci va créer automatiquement un suivi de fabrication.')) {
      return;
    }
    try {
      await ofService.demarrerOF(of.id_of);
      loadOF();
      alert('OF démarré avec succès');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Erreur lors du démarrage');
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: { [key: string]: { color: string; icon: any; label: string } } = {
      'en_attente': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'En attente' },
      'attribue': { color: 'bg-[#F5EFE5] text-[#4A5D75]', icon: FileText, label: 'Attribué' },
      'en_cours': { color: 'bg-yellow-100 text-yellow-800', icon: Play, label: 'En cours' },
      'termine': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terminé' },
      'suspendu': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Suspendu' },
      'annule': { color: 'bg-red-100 text-red-800', icon: X, label: 'Annulé' }
    };
    const badge = badges[statut.toLowerCase()] || badges['en_attente'];
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]"></div>
      </div>
    );
  }

  if (error || !of) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Ordre de fabrication non trouvé'}</p>
          <Link to="/of" className="mt-4 inline-block text-[#C8663D] hover:underline">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const quantiteRestante = Math.max(0, of.quantite_a_produire - (of.quantite_produite || 0));
  const pourcentageAvancement = of.quantite_a_produire > 0
    ? ((of.quantite_produite || 0) / of.quantite_a_produire) * 100
    : 0;
  const enRetard = !!(detail?.of?.en_retard);
  const timeline: any[] = detail?.timeline || [];
  const machineInfo = detail?.machine;
  const operateurInfo = detail?.operateur;
  const couts = detail?.couts;
  const lots: any[] = detail?.lots || [];
  const ncs: any[] = detail?.non_conformites || [];
  const mp: any[] = detail?.mp_consommees || [];
  const idCommandeLink = (of as any).id_commande || detail?.of?.id_commande;

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated, #fff)',
    borderRadius: 'var(--radius-lg, 12px)',
    padding: 'var(--s-4, 16px)',
    marginBottom: 'var(--s-4, 16px)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
  };
  const kpiStyle: React.CSSProperties = {
    background: 'var(--bg-elevated, #fff)',
    borderRadius: 'var(--radius-md, 8px)',
    padding: 'var(--s-4, 16px)',
    border: '1px solid var(--border-subtle)',
    textAlign: 'center',
  };

  return (
    <div className="ml-64 p-6">
      {/* Header avec boutons d'action */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/of"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#C8663D]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{of.numero_of}</h1>
              <p className="text-sm text-gray-500">{of.article_designation || of.code_article}</p>
            </div>
          </div>
          {getStatutBadge(of.statut)}
        </div>
        <div className="flex gap-2">
          {of.statut === 'en_attente' || of.statut === 'attribue' ? (
            <button
              onClick={handleDemarrer}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              Démarrer
            </button>
          ) : null}
          <button
            onClick={() => navigate(`/of?edit=${of.id_of}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#a55231]"
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

      {idCommandeLink && (
        <div style={{ marginBottom: 'var(--s-3, 12px)' }}>
          <Link to={`/commandes/${idCommandeLink}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--accent-terracotta, #d97757)', fontSize: 'var(--text-sm, 0.875rem)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            <ArrowLeftCircle size={16} /> Retour à la commande {of.numero_commande || `#${idCommandeLink}`}
          </Link>
        </div>
      )}

      {enRetard && (
        <div style={{
          background: 'var(--bg-danger-subtle, #fee2e2)', color: 'var(--color-danger, #b91c1c)',
          padding: 'var(--s-3, 12px)', borderRadius: 'var(--radius-md, 8px)',
          marginBottom: 'var(--s-4, 16px)', display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 500,
        }}>
          <AlertCircle size={18} /> Cet OF est en retard par rapport à la date de fin prévue.
        </div>
      )}

      {/* Row 1 — KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--s-3, 12px)', marginBottom: 'var(--s-4, 16px)',
      }}>
        <div style={kpiStyle}>
          <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>Avancement</div>
          <div style={{ fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 700, color: 'var(--accent-terracotta, #d97757)' }}>
            {(detail?.of?.avancement_pct ?? pourcentageAvancement).toFixed(1)}%
          </div>
          <div style={{
            width: '100%', height: 6, background: 'var(--bg-subtle, #e5e7eb)',
            borderRadius: 999, overflow: 'hidden', marginTop: 6,
          }}>
            <div style={{
              width: `${Math.min(100, pourcentageAvancement)}%`, height: '100%',
              background: enRetard ? 'var(--color-danger, #dc2626)' : 'var(--accent-terracotta, #d97757)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>Produit / Total</div>
          <div style={{ fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 700, color: 'var(--fg-default)' }}>
            {of.quantite_produite || 0} / {of.quantite_a_produire}
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>Coût estimé</div>
          <div style={{ fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 700, color: 'var(--fg-default)' }}>
            {couts?.cout_estime != null ? Number(couts.cout_estime).toFixed(2)
              : ((of as any).cout_estime != null ? Number((of as any).cout_estime).toFixed(2) : '—')}
          </div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>Coût réel</div>
          <div style={{ fontSize: 'var(--text-2xl, 1.5rem)', fontWeight: 700, color: 'var(--accent-sage, #4a9d5e)' }}>
            {couts?.cout_reel != null ? Number(couts.cout_reel).toFixed(2)
              : ((of as any).cout_reel != null ? Number((of as any).cout_reel).toFixed(2) : '—')}
          </div>
        </div>
      </div>

      {/* Row 2 — Timeline + Machine */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 'var(--s-4, 16px)', marginBottom: 'var(--s-4, 16px)',
      }}>
        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} /> Timeline
          </h3>
          {timeline.length === 0 ? (
            <div style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm, 0.875rem)' }}>Aucun événement enregistré.</div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '2px solid var(--border-subtle)' }}>
              {timeline.map((ev, i) => (
                <li key={i} style={{ position: 'relative', paddingLeft: 'var(--s-4, 16px)', paddingBottom: 'var(--s-3, 12px)' }}>
                  <span style={{
                    position: 'absolute', left: -6, top: 4, width: 10, height: 10, borderRadius: '50%',
                    background: ev.type === 'non_conformite' ? 'var(--color-danger, #dc2626)'
                      : ev.type === 'fin' ? 'var(--color-success, #16a34a)'
                      : 'var(--accent-terracotta, #d97757)',
                  }} />
                  <div style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--fg-default)', fontWeight: 500 }}>{ev.label}</div>
                  <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>
                    {ev.date ? new Date(ev.date).toLocaleString('fr-FR') : '—'}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Factory size={16} /> Machine & Opérateur
          </h3>
          {machineInfo ? (
            <>
              <div style={{ fontSize: 'var(--text-sm, 0.875rem)' }}>
                <strong>{machineInfo.numero_machine}</strong>
                {machineInfo.marque && <span style={{ color: 'var(--fg-muted)' }}> — {machineInfo.marque}</span>}
              </div>
              {machineInfo.modele && <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>{machineInfo.modele}</div>}
              <div style={{ marginTop: 6, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>
                Statut: {machineInfo.statut || '—'}
              </div>
            </>
          ) : <div style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm, 0.875rem)' }}>Aucune machine assignée</div>}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--s-3, 12px) 0' }} />
          {operateurInfo ? (
            <div style={{ fontSize: 'var(--text-sm, 0.875rem)' }}>
              <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              {operateurInfo.prenom} {operateurInfo.nom}
            </div>
          ) : <div style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm, 0.875rem)' }}>Aucun opérateur</div>}
        </div>
      </div>

      {/* Row 3 — Suivis production */}
      {suivis.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} /> Suivis de production ({suivis.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 'var(--text-sm, 0.875rem)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle, #f3f4f6)' }}>
                  <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Opérateur</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Produit</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Bon</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Rebut</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Rendement</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>TRS</th>
                </tr>
              </thead>
              <tbody>
                {suivis.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 8 }}>{s.date_debut || s.date_creation ? new Date(s.date_debut || s.date_creation).toLocaleString('fr-FR') : '—'}</td>
                    <td style={{ padding: 8 }}>{[s.operateur_prenom, s.operateur_nom].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{s.quantite_produite || 0}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: 'var(--color-success, #16a34a)' }}>{s.quantite_bonne || 0}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: 'var(--color-danger, #dc2626)' }}>{s.quantite_rebut || 0}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{s.rendement != null ? `${Number(s.rendement).toFixed(1)}%` : '—'}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{s.trs != null ? `${Number(s.trs).toFixed(1)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 4 — Non-conformités */}
      {ncs.length > 0 && (
        <div style={{ ...cardStyle, borderLeft: '4px solid var(--color-danger, #dc2626)' }}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-danger, #b91c1c)' }}>
            <ShieldAlert size={16} /> Non-conformités ({ncs.length})
          </h3>
          {ncs.map((nc, i) => (
            <div key={i} style={{
              padding: 'var(--s-2, 8px)', borderBottom: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-sm, 0.875rem)',
            }}>
              <div><strong>{nc.description || 'NC'}</strong> — <span style={{ color: 'var(--fg-muted)' }}>{nc.statut || 'ouverte'}</span></div>
              <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)' }}>
                Qté affectée: {nc.quantite_affectee || 0} · Cause: {nc.cause_racine || '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Row 5 — Lots produits */}
      {lots.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Boxes size={16} /> Lots produits ({lots.length})
          </h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--s-2, 8px)',
          }}>
            {lots.map((l, i) => (
              <div key={i} style={{
                padding: 'var(--s-3, 12px)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm, 4px)', background: 'var(--bg-canvas, #fafafa)',
                fontSize: 'var(--text-xs, 0.75rem)',
              }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.numero_lot || `Lot #${l.id_lot_coupe}`}</div>
                <div style={{ color: 'var(--fg-muted)', marginTop: 4 }}>Qté: {l.quantite || l.quantite_coupee || 0}</div>
                <div style={{ color: 'var(--fg-muted)' }}>{l.statut || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 6 — Coûts détail */}
      {couts && (
        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DollarSign size={16} /> Détail des coûts
          </h3>
          <table style={{ width: '100%', fontSize: 'var(--text-sm, 0.875rem)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle, #f3f4f6)' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>Poste</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Estimé</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Réel</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Écart</th>
              </tr>
            </thead>
            <tbody>
              {['matieres', 'main_oeuvre', 'machine', 'indirect'].map(k => {
                const est = Number(couts[`cout_${k}_estime`] || 0);
                const reel = Number(couts[`cout_${k}_reel`] || 0);
                const ecart = reel - est;
                return (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 8, textTransform: 'capitalize' }}>{k.replace('_', ' ')}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{est.toFixed(2)}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{reel.toFixed(2)}</td>
                    <td style={{
                      padding: 8, textAlign: 'right',
                      color: ecart > 0 ? 'var(--color-danger, #dc2626)' : 'var(--color-success, #16a34a)',
                    }}>{ecart >= 0 ? '+' : ''}{ecart.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Row 7 — MP consommées */}
      {mp.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: 'var(--s-3, 12px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={16} /> Matières premières consommées ({mp.length})
          </h3>
          <table style={{ width: '100%', fontSize: 'var(--text-sm, 0.875rem)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle, #f3f4f6)' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>Code</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Désignation</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Qté</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {mp.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: 8, fontFamily: 'monospace' }}>{m.code_mp || '—'}</td>
                  <td style={{ padding: 8 }}>{m.mp_designation || '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{m.quantite || 0} {m.mp_unite || ''}</td>
                  <td style={{ padding: 8 }}>{m.date_mouvement ? new Date(m.date_mouvement).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations générales
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro OF</label>
                  <p className="text-gray-900 font-mono font-semibold">{of.numero_of}</p>
                </div>
                {of.numero_commande && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commande associée</label>
                    <Link to={`/commandes?search=${of.numero_commande}`} className="text-[#C8663D] hover:underline font-mono">
                      {of.numero_commande}
                    </Link>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{of.article_designation || of.code_article}</p>
                  {of.id_article && (
                    <Link to={`/articles/${of.id_article}`} className="text-[#C8663D] hover:underline text-sm">
                      Voir l'article
                    </Link>
                  )}
                </div>
                {of.ref_commercial && (
                  <p className="text-sm text-gray-500 mt-1 font-mono">{of.ref_commercial}</p>
                )}
              </div>
              {of.observations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{of.observations}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progression
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Avancement</span>
                  <span className="text-sm font-semibold text-gray-900">{pourcentageAvancement.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-[#C8663D] h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(100, pourcentageAvancement)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{of.quantite_produite || 0}</p>
                  <p className="text-xs text-gray-500">Produite</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{quantiteRestante}</p>
                  <p className="text-xs text-gray-500">Restante</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#C8663D]">{of.quantite_a_produire}</p>
                  <p className="text-xs text-gray-500">Totale</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lignes d'opérations */}
          {of.lignes_operations && of.lignes_operations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Lignes d'opérations
                </h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ordre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opération</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temps unitaire</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temps préparation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {of.lignes_operations.map((ligne, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.ordre || idx + 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.designation_operation || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.machine_designation || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.temps_unitaire || 0} min</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.temps_preparation || 0} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Suivis de fabrication */}
          {suivis.length > 0 && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Suivis de fabrication
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {suivis.map((suivi, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{suivi.numero_suivi || `Suivi ${idx + 1}`}</p>
                          {suivi.machine_designation && (
                            <p className="text-sm text-gray-600">Machine: {suivi.machine_designation}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          suivi.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                          suivi.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {suivi.statut || 'EN_ATTENTE'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-gray-500">Quantité produite</p>
                          <p className="font-semibold">{suivi.quantite_produite || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantité bonne</p>
                          <p className="font-semibold text-green-600">{suivi.quantite_bonne || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rendement</p>
                          <p className="font-semibold">{suivi.rendement ? `${suivi.rendement.toFixed(1)}%` : '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale - Informations complémentaires */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Dates
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {of.date_debut_prevue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début prévu</label>
                  <p className="text-gray-900">{new Date(of.date_debut_prevue).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {of.date_fin_prevue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin prévue</label>
                  <p className="text-gray-900">{new Date(of.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {of.date_debut_reelle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début réel</label>
                  <p className="text-gray-900 text-green-600">{new Date(of.date_debut_reelle).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {of.date_fin_reelle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin réelle</label>
                  <p className="text-gray-900 text-green-600">{new Date(of.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Machine assignée */}
          {of.machine_designation && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Machine assignée
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-900 font-medium">{of.machine_designation}</p>
                {of.id_machine && (
                  <Link to={`/machines/${of.id_machine}`} className="mt-2 inline-block text-sm text-[#C8663D] hover:underline">
                    Voir la machine
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Informations */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Informations
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Priorité</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  of.priorite === 'haute' ? 'bg-red-100 text-red-800' :
                  of.priorite === 'normale' ? 'bg-[#F5EFE5] text-[#4A5D75]' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {of.priorite || 'normale'}
                </span>
              </div>
              {of.date_creation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de création</span>
                  <span className="font-medium">
                    {new Date(of.date_creation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Actions rapides
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {of.id_article && (
                <Link
                  to={`/articles/${of.id_article}`}
                  className="block w-full text-left px-4 py-2 text-sm text-[#C8663D] hover:bg-[#F5EFE5] rounded"
                >
                  Voir l'article
                </Link>
              )}
              <Link
                to={`/suivi-fabrication?of=${of.id_of}`}
                className="block w-full text-left px-4 py-2 text-sm text-[#C8663D] hover:bg-[#F5EFE5] rounded"
              >
                Voir les suivis de fabrication
              </Link>
              {of.id_commande && (
                <Link
                  to={`/commandes?search=${of.numero_commande}`}
                  className="block w-full text-left px-4 py-2 text-sm text-[#C8663D] hover:bg-[#F5EFE5] rounded"
                >
                  Voir la commande
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OFDetails;
