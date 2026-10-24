/**
 * OfflineBanner — bannière sticky indiquant l'état réseau + outbox.
 * §14ter.19 — ERP La Plume Artisanale
 *
 * États :
 *   - vert (sage)       : "✓ En ligne" (+ nb actions synchronisées récentes)
 *   - orange (gold)     : "⚠ Hors ligne — N actions en attente"
 *   - bleu (indigo)     : "⚡ Synchronisation en cours..."
 *
 * Click → ouvre un drawer latéral listant les entrées outbox avec
 * statut + bouton « Réessayer ».
 *
 * Monté dans TabletteLayout + TabletteKiosqueShell.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useOnlineStatus } from '../offline/useOnlineStatus';
import { listAll, remove, updateStatus, type OutboxEntry } from '../offline/outbox';
import { flushOutbox } from '../offline/syncWorker';

const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, lastSyncAt, retry } = useOnlineStatus();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [entries, setEntries] = useState<OutboxEntry[]>([]);

  const refreshEntries = useCallback(async () => {
    try { setEntries(await listAll()); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (open) void refreshEntries();
    const h = () => { if (open) void refreshEntries(); };
    window.addEventListener('outbox:changed', h);
    return () => window.removeEventListener('outbox:changed', h);
  }, [open, refreshEntries]);

  const handleRetry = async () => {
    setSyncing(true);
    try {
      await flushOutbox();
      await retry();
      await refreshEntries();
    } finally {
      setSyncing(false);
    }
  };

  const handleRetryOne = async (id: number) => {
    await updateStatus(id, 'pending');
    await handleRetry();
  };

  const handleRemove = async (id: number) => {
    await remove(id);
    await refreshEntries();
  };

  // Détermine la couleur et le label
  const status: 'syncing' | 'offline' | 'online' = syncing
    ? 'syncing'
    : !isOnline
      ? 'offline'
      : 'online';

  const bg =
    status === 'syncing' ? 'var(--accent-indigo, #3B5B8C)'
    : status === 'offline' ? 'var(--accent-gold, #C89B3C)'
    : 'var(--accent-sage, #6B8E6F)';

  const label =
    status === 'syncing' ? '⚡ Synchronisation en cours…'
    : status === 'offline'
      ? `⚠ Hors ligne — ${pendingCount} action${pendingCount > 1 ? 's' : ''} en attente`
      : pendingCount > 0
        ? `✓ En ligne — ${pendingCount} à synchroniser`
        : '✓ En ligne';

  const lastSyncText = lastSyncAt > 0
    ? ` · dernière synchro ${formatRelative(lastSyncAt)}`
    : '';

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        onClick={() => setOpen(true)}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          minHeight: 32,
          background: bg,
          color: '#FBF8F3',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans, Inter, sans-serif)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.02em',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <span>{label}{lastSyncText}</span>
        {(pendingCount > 0 || !isOnline) && (
          <span style={{ opacity: 0.85, fontSize: 11, fontWeight: 500 }}>
            (clic pour détail)
          </span>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="File d'attente offline"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(420px, 90vw)',
              height: '100%',
              background: 'var(--bg-elevated, #FFFFFF)',
              padding: 20,
              overflowY: 'auto',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{
                margin: 0,
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontStyle: 'italic',
                fontSize: 20,
                color: 'var(--fg-primary, #2F1F12)',
              }}>
                File offline
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                style={{
                  width: 36, height: 36,
                  border: '1px solid var(--border-subtle, #EDE3CE)',
                  background: 'transparent',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >×</button>
            </header>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleRetry}
                disabled={syncing || !isOnline}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: isOnline ? 'var(--accent-terracotta, #C8663D)' : 'var(--bg-canvas, #F5EFE5)',
                  color: isOnline ? '#FBF8F3' : 'var(--fg-muted, #9B8874)',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: isOnline && !syncing ? 'pointer' : 'not-allowed',
                  minHeight: 44,
                }}
              >
                {syncing ? 'Synchronisation…' : 'Tout retenter'}
              </button>
            </div>

            {entries.length === 0 && (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--fg-muted, #9B8874)',
                fontSize: 14,
              }}>
                Aucune action en file.
              </div>
            )}

            {entries.map((e) => (
              <div
                key={e.id}
                style={{
                  border: '1px solid var(--border-subtle, #EDE3CE)',
                  borderRadius: 10,
                  padding: 12,
                  background: 'var(--bg-canvas, #F5EFE5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{ fontSize: 13, color: 'var(--fg-primary, #2F1F12)' }}>
                    {e.metadata?.label || `${e.method} ${e.url}`}
                  </strong>
                  <StatusChip status={e.status} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted, #9B8874)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {new Date(e.createdAt).toLocaleString('fr-FR')}
                </div>
                {e.reason && (
                  <div style={{ fontSize: 12, color: 'var(--color-danger, #B84A2F)' }}>
                    {e.reason}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {(e.status === 'failed' || e.status === 'pending') && (
                    <button
                      type="button"
                      onClick={() => e.id != null && handleRetryOne(e.id)}
                      disabled={!isOnline || syncing}
                      style={smallBtn(isOnline)}
                    >
                      Réessayer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => e.id != null && handleRemove(e.id)}
                    style={{ ...smallBtn(true), color: 'var(--color-danger, #B84A2F)' }}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const smallBtn = (enabled: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  border: '1px solid var(--border-default, #DFD3B8)',
  background: 'transparent',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.5,
});

const StatusChip: React.FC<{ status: OutboxEntry['status'] }> = ({ status }) => {
  const map: Record<OutboxEntry['status'], { bg: string; fg: string; label: string }> = {
    pending: { bg: '#F5EFE5', fg: '#6B4E31', label: 'En attente' },
    syncing: { bg: '#DCE4F0', fg: '#3B5B8C', label: 'Envoi…' },
    failed:  { bg: '#FBEBE4', fg: '#B84A2F', label: 'Erreur' },
    done:    { bg: '#DAEBD7', fg: '#4C6B4F', label: 'OK' },
  };
  const s = map[status];
  return (
    <span style={{
      background: s.bg,
      color: s.fg,
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {s.label}
    </span>
  );
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export default OfflineBanner;
