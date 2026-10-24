/**
 * PhotosBoiteTri — §14quater.4 · Phase E3
 *
 * Liste des photos justificatives reçues via Teams / WhatsApp / Email,
 * en attente de rattachement à une pièce comptable. Chaque carte permet
 * d'ouvrir un modal "Rattacher à..." qui choisit le type (dépense espèces,
 * facture fournisseur, apport gérant, paiement) + saisit l'ID.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Mail,
  MessageSquare,
  Phone,
  Upload,
  Link2,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import {
  photosBoiteTriService,
  PhotoBoiteTri,
  PhotoSource,
  PhotoRattacheType,
} from '../../services/photosBoiteTriApi';

const SOURCE_LABEL: Record<PhotoSource, string> = {
  teams: 'Teams',
  whatsapp: 'WhatsApp',
  email: 'Email',
  upload_direct: 'App (upload)',
};

const SOURCE_COLOR: Record<PhotoSource, string> = {
  teams: '#5B5FC7',
  whatsapp: '#25D366',
  email: 'var(--accent-indigo, #4A5D75)',
  upload_direct: 'var(--accent-terracotta, #C8663D)',
};

const RATTACHE_LABEL: Record<PhotoRattacheType, string> = {
  depense_espece: 'Dépense espèces',
  facture_fournisseur: 'Facture fournisseur',
  apport_gerant: 'Apport gérant',
  paiement: 'Paiement',
};

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR') : '—');
const fmtKo = (n?: number) => (n ? `${Math.round(n / 1024)} ko` : '—');

const SourceIcon: React.FC<{ source: PhotoSource; size?: number }> = ({ source, size = 14 }) => {
  if (source === 'email') return <Mail size={size} />;
  if (source === 'whatsapp') return <Phone size={size} />;
  if (source === 'upload_direct') return <Upload size={size} />;
  return <MessageSquare size={size} />;
};

const PhotosBoiteTri: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoBoiteTri[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<PhotoSource | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [rattacheOpen, setRattacheOpen] = useState<PhotoBoiteTri | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const r = await photosBoiteTriService.list({
        statut: 'non_traite',
        source: filterSource || undefined,
        date_from: dateFrom || undefined,
      });
      setPhotos(r.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, [filterSource, dateFrom]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const counts = useMemo(() => {
    const total = photos.length;
    const bySource = photos.reduce<Record<string, number>>((acc, p) => {
      acc[p.source] = (acc[p.source] || 0) + 1;
      return acc;
    }, {});
    return { total, bySource };
  }, [photos]);

  const handleIgnorer = async (p: PhotoBoiteTri) => {
    if (!window.confirm(`Marquer la photo #${p.id_photo} comme ignorée ?`)) return;
    await photosBoiteTriService.ignorer(p.id_photo);
    fetchPhotos();
  };

  return (
    <DashboardShell
      eyebrow="§14quater.4 · Boîte à trier"
      title="Photos justificatives à rattacher"
      subtitle="Photos reçues via Teams / WhatsApp / Email ou upload direct. Rattachez-les à une dépense espèces, une facture fournisseur, un apport gérant ou un paiement."
      headerRight={
        <button type="button" onClick={fetchPhotos} style={btnPrimary}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          Actualiser
        </button>
      }
    >
      <div style={kpiGrid}>
        <KpiCard label="Non traité" value={String(counts.total)} tone="terracotta" loading={loading} />
        <KpiCard label="Teams" value={String(counts.bySource['teams'] || 0)} tone="indigo" loading={loading} />
        <KpiCard label="WhatsApp" value={String(counts.bySource['whatsapp'] || 0)} tone="sage" loading={loading} />
        <KpiCard label="Email" value={String(counts.bySource['email'] || 0)} tone="gold" loading={loading} />
      </div>

      <SectionCard title="Filtres" subtitle="Source + date de réception">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-3)' }}>
          <label style={lbl}>
            Source
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value as PhotoSource | '')} style={input}>
              <option value="">Toutes</option>
              <option value="teams">Teams</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="upload_direct">App (upload)</option>
            </select>
          </label>
          <label style={lbl}>
            Reçu depuis
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={input} />
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="button" onClick={fetchPhotos} style={btnPrimary}>
              <Filter size={14} style={{ marginRight: 6 }} />
              Appliquer
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Photos en attente" subtitle={`${counts.total} photo(s)`}>
        {loading ? (
          <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : photos.length === 0 ? (
          <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Aucune photo à trier. Les nouvelles pièces arriveront ici automatiquement.
          </div>
        ) : (
          <div style={cardGrid}>
            {photos.map((p) => (
              <article key={p.id_photo} style={cardStyle}>
                <div style={cardThumb}>
                  {p.mimetype?.startsWith('image/') && p.path_relatif ? (
                    <img
                      src={`/${p.path_relatif.replace(/^\/+/, '')}`}
                      alt={p.filename_original || `photo ${p.id_photo}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-xs)' }}>
                      {p.mimetype || 'fichier'}
                    </div>
                  )}
                </div>

                <div style={{ padding: 'var(--s-3)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ ...sourcePill, background: SOURCE_COLOR[p.source] }}>
                      <SourceIcon source={p.source} />
                      {SOURCE_LABEL[p.source]}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                      #{p.id_photo}
                    </span>
                  </div>

                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-primary)' }}>
                    {p.expediteur_nom || p.expediteur_identifiant || 'Expéditeur inconnu'}
                  </div>
                  {p.expediteur_identifiant && p.expediteur_nom && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                      {p.expediteur_identifiant}
                    </div>
                  )}
                  {p.expediteur_message && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', fontStyle: 'italic', lineHeight: 1.35 }}>
                      “{p.expediteur_message}”
                    </div>
                  )}

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                    {fmtDate(p.date_reception)} · {fmtKo(p.taille_octets)}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
                    <button type="button" onClick={() => setRattacheOpen(p)} style={btnPrimarySm}>
                      <Link2 size={14} /> Rattacher à…
                    </button>
                    {p.path_relatif && (
                      <a
                        href={`/${p.path_relatif.replace(/^\/+/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={btnGhostSm}
                        aria-label="Ouvrir la photo"
                      >
                        <Eye size={14} />
                      </a>
                    )}
                    <button type="button" onClick={() => handleIgnorer(p)} style={btnDangerSm} aria-label="Ignorer">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {rattacheOpen && (
        <RattacherModal
          photo={rattacheOpen}
          onClose={() => setRattacheOpen(null)}
          onSuccess={() => {
            setRattacheOpen(null);
            fetchPhotos();
          }}
        />
      )}
    </DashboardShell>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Modal "Rattacher à..." — choix du type + saisie ID + notes
// ─────────────────────────────────────────────────────────────────────
const RattacherModal: React.FC<{
  photo: PhotoBoiteTri;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ photo, onClose, onSuccess }) => {
  const [type, setType] = useState<PhotoRattacheType>('depense_espece');
  const [idPiece, setIdPiece] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const idNum = Number(idPiece);
    if (!idNum || !Number.isFinite(idNum)) {
      setError('ID de pièce invalide');
      return;
    }
    setSubmitting(true);
    try {
      await photosBoiteTriService.rattacher(photo.id_photo, {
        type,
        id: idNum,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={modalBackdrop} onMouseDown={onClose}>
      <div style={modalBox} onMouseDown={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20 }}>
            Rattacher la photo #{photo.id_photo}
          </h2>
          <button type="button" onClick={onClose} style={btnGhostSm} aria-label="Fermer">
            <XCircle size={16} />
          </button>
        </div>

        <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
            Expéditeur : <strong>{photo.expediteur_nom || photo.expediteur_identifiant || 'inconnu'}</strong>
            {' · '}
            Reçu le {fmtDate(photo.date_reception)}
          </div>

          <label style={lbl}>
            Type de pièce
            <select value={type} onChange={(e) => setType(e.target.value as PhotoRattacheType)} style={input}>
              {(Object.keys(RATTACHE_LABEL) as PhotoRattacheType[]).map((k) => (
                <option key={k} value={k}>{RATTACHE_LABEL[k]}</option>
              ))}
            </select>
          </label>

          <label style={lbl}>
            ID de la pièce
            <input
              type="number"
              min={1}
              value={idPiece}
              onChange={(e) => setIdPiece(e.target.value)}
              placeholder="ex: 1247"
              style={input}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 4 }}>
              Collez l'identifiant depuis l'écran Dépenses espèces / Factures fournisseur / Paiements.
            </span>
          </label>

          <label style={lbl}>
            Notes (optionnel)
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Précision sur le rattachement"
              style={{ ...input, resize: 'vertical' }}
            />
          </label>

          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>{error}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
            <button type="button" onClick={onClose} style={btnGhost}>Annuler</button>
            <button type="button" onClick={handleSubmit} disabled={submitting} style={btnPrimary}>
              {submitting ? 'Rattachement…' : 'Rattacher'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotosBoiteTri;

// ─── Styles ────────────────────────────────────────────────────────────
const kpiGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 'var(--s-4)',
  marginBottom: 'var(--s-4)',
};
const cardGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 'var(--s-4)',
};
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md, 8px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};
const cardThumb: React.CSSProperties = {
  width: '100%',
  aspectRatio: '4 / 3',
  background: 'var(--bg-canvas)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};
const sourcePill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  color: '#FFFFFF',
  borderRadius: 999,
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
};
const lbl: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 'var(--text-sm)',
  color: 'var(--fg-secondary)',
};
const input: React.CSSProperties = {
  padding: '10px 12px',
  minHeight: 44,
  background: 'var(--bg-canvas)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--fg-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-base)',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 16px',
  minHeight: 44,
  background: 'var(--accent-terracotta)',
  color: 'var(--bg-elevated)',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 600,
  cursor: 'pointer',
};
const btnPrimarySm: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 10px',
  background: 'var(--accent-terracotta)',
  color: 'var(--bg-elevated)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
  flex: 1,
  justifyContent: 'center',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 16px',
  minHeight: 44,
  background: 'transparent',
  color: 'var(--fg-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 600,
  cursor: 'pointer',
};
const btnGhostSm: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 8px',
  background: 'transparent',
  color: 'var(--fg-secondary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  textDecoration: 'none',
};
const btnDangerSm: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 8px',
  background: 'transparent',
  color: 'var(--color-danger, #B84A2F)',
  border: '1px solid var(--color-danger, #B84A2F)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
};
const modalBackdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 500,
  padding: 'var(--s-4)',
};
const modalBox: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  borderRadius: 'var(--radius-md, 8px)',
  width: '100%',
  maxWidth: 480,
  boxShadow: 'var(--shadow-xl, 0 20px 25px rgba(0,0,0,0.15))',
  overflow: 'hidden',
};
const modalHeader: React.CSSProperties = {
  padding: 'var(--s-3) var(--s-4)',
  borderBottom: '1px solid var(--border-subtle)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};
