/**
 * PhotoBoiteTriWidget — badge UserBar pour §14quater.4 (Boîte à trier).
 *
 * Affiche un bouton "Photos" avec un badge rouge contenant le nombre de
 * photos justificatives non traitées (Teams / WhatsApp / Email). Au clic,
 * un dropdown montre les 5 dernières photos + lien "Voir tout" vers la
 * page /documents/boite-tri.
 *
 * Polling léger (toutes les 30 s). Rafraîchit immédiatement sur l'event
 * global `photo-recue` (émis par un WebSocket/SSE lorsqu'il sera câblé).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, MessageSquare, Phone, Upload, ChevronDown } from 'lucide-react';
import { photosBoiteTriService, PhotoBoiteTri, PhotoSource } from '../services/photosBoiteTriApi';

const CREAM = '#FBF8F3';

const SOURCE_LABEL: Record<PhotoSource, string> = {
  teams: 'Teams',
  whatsapp: 'WhatsApp',
  email: 'Email',
  upload_direct: 'App',
};

const SOURCE_COLOR: Record<PhotoSource, string> = {
  teams: '#5B5FC7',
  whatsapp: '#25D366',
  email: 'var(--accent-indigo, #4A5D75)',
  upload_direct: 'var(--accent-terracotta, #C8663D)',
};

const SourceIcon: React.FC<{ source: PhotoSource; size?: number }> = ({ source, size = 12 }) => {
  if (source === 'email') return <Mail size={size} />;
  if (source === 'whatsapp') return <Phone size={size} />;
  if (source === 'upload_direct') return <Upload size={size} />;
  return <MessageSquare size={size} />;
};

const fmtRelative = (iso: string): string => {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return 'à l\'instant';
  if (diff < 3_600_000) return `il y a ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `il y a ${Math.floor(diff / 3_600_000)} h`;
  return new Date(iso).toLocaleDateString('fr-FR');
};

const PhotoBoiteTriWidget: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [photos, setPhotos] = React.useState<PhotoBoiteTri[]>([]);

  const fetchData = React.useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        photosBoiteTriService.list({ statut: 'non_traite', limit: 5 }),
        photosBoiteTriService.count({ statut: 'non_traite' }),
      ]);
      setPhotos(listRes.data?.data || []);
      setCount(countRes.data?.data?.count ?? 0);
    } catch {
      // Silencieux — le widget doit être tolérant à un backend indisponible
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    const handler = () => fetchData();
    window.addEventListener('photo-recue', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('photo-recue', handler);
    };
  }, [fetchData]);

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'var(--bg-canvas, #F5EFE5)',
    border: '1px solid var(--border-subtle, #EDE3CE)',
    borderRadius: 999,
    color: 'var(--fg-secondary, #6B4E31)',
    fontFamily: 'var(--font-sans, Inter, sans-serif)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    minHeight: 32,
    whiteSpace: 'nowrap',
    position: 'relative',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        aria-label={`${count} photo${count > 1 ? 's' : ''} à trier`}
        style={btnGhost}
      >
        <Camera size={14} />
        <span>Photos</span>
        {count > 0 && (
          <span
            style={{
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              background: 'var(--color-danger, #B84A2F)',
              color: CREAM,
              borderRadius: 8,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 9,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {count}
          </span>
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 340,
            maxHeight: 420,
            background: 'var(--bg-elevated, #FFFFFF)',
            border: '1px solid var(--border-default, #DFD3B8)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-xl, 0 20px 25px rgba(0,0,0,0.15))',
            zIndex: 210,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 15,
                color: 'var(--fg-primary)',
              }}
            >
              Boîte à trier
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
              }}
            >
              {count} non traité{count > 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {photos.length === 0 ? (
              <div style={{ padding: '18px 14px', color: 'var(--fg-muted)', fontSize: 12, textAlign: 'center' }}>
                Aucune photo en attente. Les pièces envoyées via Teams, WhatsApp ou email apparaîtront ici.
              </div>
            ) : (
              photos.map((p) => (
                <button
                  key={p.id_photo}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    navigate('/documents/boite-tri');
                  }}
                  style={{
                    display: 'flex',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    gap: 10,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                    cursor: 'pointer',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover, #F0E9DA)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: SOURCE_COLOR[p.source],
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                    title={SOURCE_LABEL[p.source]}
                  >
                    <SourceIcon source={p.source} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans, Inter, sans-serif)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--fg-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.expediteur_nom || p.expediteur_identifiant || 'Expéditeur inconnu'}
                    </div>
                    {p.expediteur_message && (
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--fg-secondary)',
                          marginBottom: 3,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.expediteur_message}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--fg-muted)',
                        fontFamily: 'var(--font-mono, monospace)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{fmtRelative(p.date_reception)}</span>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {SOURCE_LABEL[p.source]}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(false);
              navigate('/documents/boite-tri');
            }}
            style={{
              padding: '10px',
              background: 'var(--bg-canvas, #F5EFE5)',
              border: 'none',
              borderTop: '1px solid var(--border-subtle, #EDE3CE)',
              color: 'var(--accent-terracotta, #C8663D)',
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Voir toute la boîte à trier →
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoBoiteTriWidget;
