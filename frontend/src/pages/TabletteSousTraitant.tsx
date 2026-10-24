/**
 * TabletteSousTraitant (Phase B §14quater.3 — mode tablette atelier)
 *
 * Hub tactile grosse ergonomie :
 *   · Scan QR MP (bon de sortie)
 *   · Nouveau bon sortie
 *   · Retour marchandise + contrôle qualité express
 *   · Mon planning
 *   · Mon compte
 *   · Alertes bons litigieux / retards
 *
 * Design strict La Plume + boutons tactiles min 72px (XL atelier).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, PackagePlus, PackageCheck, ClipboardCheck,
  Clock, Coins, AlertTriangle, ArrowRight, Scissors, Camera,
} from 'lucide-react';
import SignatureCanvas from '../components/sous-traitants/SignatureCanvas';
import {
  bonsSTApi, soustraitantsApi, BonST, AnomalieST,
  TYPE_ACTIVITE_LABEL, fmtDate, fmtInt,
} from '../services/soustraitanceApi';

type Mode = 'hub' | 'scan' | 'sortie' | 'retour' | 'planning' | 'compte';

const TabletteSousTraitant: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('hub');
  const [bons, setBons] = useState<BonST[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalieST[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [currentBon, setCurrentBon] = useState<BonST | null>(null);
  const [qteSaisie, setQteSaisie] = useState<number | ''>('');
  const [sigRecepteur, setSigRecepteur] = useState('');
  const [sigRetour, setSigRetour] = useState('');
  const [controleOk, setControleOk] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const [b, a] = await Promise.all([
          bonsSTApi.list().catch(() => []),
          soustraitantsApi.anomalies({ resolu: false }).catch(() => []),
        ]);
        setBons(Array.isArray(b) ? b : []);
        setAnomalies(a || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const bonsRetard = bons.filter(b =>
    b.date_retour_prevue && new Date(b.date_retour_prevue) < new Date()
    && ['expedie', 'chez_st', 'en_retour_partiel'].includes(b.statut)
  );
  const bonsLitige = bons.filter(b => b.statut === 'litige');

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    const found = bons.find(b => b.numero_bon === scanInput.trim());
    setCurrentBon(found || null);
    if (found) setMode(['expedie','chez_st','en_retour_partiel'].includes(found.statut) ? 'retour' : 'sortie');
  };

  const validerSortie = async () => {
    if (!currentBon || !sigRecepteur) return;
    await bonsSTApi.signer(currentBon.id_of_st, 'recepteur', sigRecepteur);
    setMode('hub');
    setCurrentBon(null);
    setSigRecepteur('');
  };

  const validerRetour = async () => {
    if (!currentBon) return;
    await bonsSTApi.controle(currentBon.id_of_st, {
      quantite_retournee: qteSaisie === '' ? undefined : Number(qteSaisie),
      controle_qualite: {
        defauts_couture: !!controleOk.couture,
        defauts_teinture: !!controleOk.teinture,
        defauts_dimension: !!controleOk.dimension,
        defauts_autre: !!controleOk.autre,
      },
      signature_retour_svg: sigRetour || undefined,
    });
    setMode('hub');
    setCurrentBon(null);
    setQteSaisie('');
    setSigRetour('');
    setControleOk({});
  };

  // ─── HUB ──────────────────────────────────────────────────
  if (mode === 'hub') {
    const HUB_ITEMS = [
      { icon: <QrCode size={36} />,          label: 'Scanner un bon', tone: 'terracotta', onClick: () => setMode('scan') },
      { icon: <PackagePlus size={36} />,     label: 'Nouveau bon sortie', tone: 'sage',   onClick: () => navigate('/sous-traitants') },
      { icon: <PackageCheck size={36} />,    label: 'Retour marchandise', tone: 'indigo', onClick: () => setMode('retour') },
      { icon: <ClipboardCheck size={36} />,  label: 'Contrôle qualité',   tone: 'gold',   onClick: () => setMode('retour') },
      { icon: <Clock size={36} />,           label: 'Mon planning',       tone: 'rose',   onClick: () => setMode('planning') },
      { icon: <Coins size={36} />,           label: 'Mon compte',         tone: 'brown',  onClick: () => setMode('compte') },
    ];
    return (
      <ShellTablette title="Tablette atelier · Sous-traitants">
        {/* ALERTES */}
        <div style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginBottom: 24,
        }}>
          <AlerteBox
            icon={<AlertTriangle size={24} />}
            tone="var(--color-danger)"
            title="Bons litigieux"
            count={bonsLitige.length}
            onClick={() => navigate('/sous-traitants?tab=bons')}
          />
          <AlerteBox
            icon={<Clock size={24} />}
            tone="var(--accent-gold)"
            title="Retours en retard"
            count={bonsRetard.length}
            onClick={() => navigate('/sous-traitants?tab=bons')}
          />
          <AlerteBox
            icon={<AlertTriangle size={24} />}
            tone="var(--accent-terracotta)"
            title="Anomalies"
            count={anomalies.length}
            onClick={() => navigate('/sous-traitants?tab=anomalies')}
          />
        </div>

        {/* HUB GRID */}
        <div style={{
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}>
          {HUB_ITEMS.map(it => (
            <button key={it.label} type="button" onClick={it.onClick} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 16, padding: 'clamp(20px, 4vw, 36px)',
              minHeight: 180,
              background: 'var(--bg-elevated)',
              border: '2px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'transform 160ms ease, border-color 160ms ease',
            }}
            onTouchStart={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'}
            onTouchEnd={e => (e.currentTarget as HTMLButtonElement).style.transform = ''}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `color-mix(in srgb, var(--accent-${it.tone}) 20%, transparent)`,
                color: `var(--accent-${it.tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{it.icon}</div>
              <span style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                color: 'var(--fg-primary)', textAlign: 'center',
              }}>{it.label}</span>
            </button>
          ))}
        </div>
      </ShellTablette>
    );
  }

  // ─── SCAN ─────────────────────────────────────────────────
  if (mode === 'scan') {
    return (
      <ShellTablette title="Scanner un bon" onBack={() => setMode('hub')}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 200, height: 200, margin: '0 auto',
            background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border-default)',
            color: 'var(--fg-muted)',
          }}>
            <QrCode size={120} />
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Numéro du bon (BSST-YYYY-NNNNN)
            </span>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
                   placeholder="BSST-2026-00001"
                   style={{
                     padding: '18px 20px', fontSize: 'var(--text-lg)',
                     fontFamily: 'var(--font-mono)',
                     background: 'var(--bg-elevated)',
                     border: '1px solid var(--border-subtle)',
                     borderRadius: 'var(--radius-md)',
                     color: 'var(--fg-primary)',
                     minHeight: 72,
                   }} />
          </label>
          <button type="button" onClick={handleScan} style={bigBtn}>
            <Camera size={20} /> Chercher ce bon
          </button>
        </div>
      </ShellTablette>
    );
  }

  // ─── SORTIE (sign récepteur) ──────────────────────────────
  if (mode === 'sortie' && currentBon) {
    return (
      <ShellTablette title={`Bon ${currentBon.numero_bon}`} onBack={() => setMode('hub')}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <InfoBig label="Sous-traitant" value={currentBon.sous_traitant_nom} />
          <InfoBig label="Activité" value={currentBon.type_activite ? (TYPE_ACTIVITE_LABEL as Record<string, string>)[currentBon.type_activite] : '—'} />
          <InfoBig label="Qté à sortir" value={`${fmtInt(currentBon.quantite_envoyee)}`} mono />
          <SignatureCanvas
            label="Signature récepteur"
            onChange={(svg, empty) => setSigRecepteur(empty ? '' : svg)}
          />
          <button type="button" disabled={!sigRecepteur} onClick={validerSortie} style={bigBtn}>
            Valider la sortie →
          </button>
        </div>
      </ShellTablette>
    );
  }

  // ─── RETOUR (contrôle qualité express + signature) ─────────
  if (mode === 'retour') {
    return (
      <ShellTablette title={currentBon ? `Retour ${currentBon.numero_bon}` : 'Retour marchandise'} onBack={() => setMode('hub')}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!currentBon && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={bigLabel}>Numéro du bon à contrôler</span>
                <input value={scanInput} onChange={e => setScanInput(e.target.value)}
                       placeholder="BSST-2026-00001"
                       style={bigInput} />
              </label>
              <button type="button" onClick={handleScan} style={bigBtn}>
                Chercher ce bon
              </button>
            </>
          )}
          {currentBon && (
            <>
              <InfoBig label="Sous-traitant" value={currentBon.sous_traitant_nom} />
              <InfoBig label="Qté envoyée" value={fmtInt(currentBon.quantite_envoyee)} mono />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={bigLabel}>Qté retournée</span>
                <input type="number" value={qteSaisie}
                       onChange={e => setQteSaisie(e.target.value === '' ? '' : Number(e.target.value))}
                       style={bigInput} />
              </label>
              <div>
                <div style={bigLabel}>Contrôle qualité express</div>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 8 }}>
                  {[
                    { k: 'couture',   l: 'Défauts couture' },
                    { k: 'teinture',  l: 'Défauts teinture' },
                    { k: 'dimension', l: 'Défauts dimension' },
                    { k: 'autre',     l: 'Autre défaut' },
                  ].map(c => (
                    <button key={c.k} type="button"
                            onClick={() => setControleOk({ ...controleOk, [c.k]: !controleOk[c.k] })}
                            style={{
                              padding: '16px 20px',
                              background: controleOk[c.k] ? 'var(--color-danger-bg)' : 'var(--bg-canvas)',
                              color: controleOk[c.k] ? 'var(--color-danger)' : 'var(--fg-secondary)',
                              border: `2px solid ${controleOk[c.k] ? 'var(--color-danger)' : 'var(--border-subtle)'}`,
                              borderRadius: 'var(--radius-sm)',
                              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)',
                              fontWeight: 600, cursor: 'pointer', minHeight: 72, textAlign: 'left',
                            }}>
                      {controleOk[c.k] ? '✓ ' : '○ '}{c.l}
                    </button>
                  ))}
                </div>
              </div>
              <SignatureCanvas
                label="Signature de retour"
                onChange={(svg, empty) => setSigRetour(empty ? '' : svg)}
              />
              <button type="button" onClick={validerRetour} style={bigBtn}>
                Enregistrer le retour
              </button>
            </>
          )}
        </div>
      </ShellTablette>
    );
  }

  // ─── PLANNING ─────────────────────────────────────────────
  if (mode === 'planning') {
    return (
      <ShellTablette title="Mon planning" onBack={() => setMode('hub')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bons.filter(b => ['expedie', 'chez_st', 'en_retour_partiel'].includes(b.statut)).map(b => (
            <div key={b.id_of_st} style={{
              padding: 16, background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--fg-primary)' }}>{b.numero_bon}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                {b.sous_traitant_nom} · Retour prévu {fmtDate(b.date_retour_prevue)} · Qté {fmtInt(b.quantite_envoyee)}
              </div>
            </div>
          ))}
          {!bons.length && <p style={{ color: 'var(--fg-muted)' }}>Aucun bon en cours.</p>}
        </div>
      </ShellTablette>
    );
  }

  // ─── COMPTE ──────────────────────────────────────────────
  return (
    <ShellTablette title="Mon compte" onBack={() => setMode('hub')}>
      <p style={{ color: 'var(--fg-muted)' }}>Consultez le détail de votre compte via la liste principale.</p>
      <button type="button" onClick={() => navigate('/sous-traitants')} style={bigBtn}>
        Voir les comptes sous-traitants <ArrowRight size={16} />
      </button>
    </ShellTablette>
  );
};

const ShellTablette: React.FC<{ title: string; onBack?: () => void; children: React.ReactNode }>
  = ({ title, onBack, children }) => (
  <div style={{
    background: 'var(--bg-app)', minHeight: '100vh',
    color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)',
    padding: 'clamp(16px, 4vw, 32px)',
  }}>
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap', marginBottom: 24,
      paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Scissors size={22} color="var(--accent-terracotta)" />
        <h1 style={{
          margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--fg-primary)',
        }}>{title}</h1>
      </div>
      {onBack && (
        <button type="button" onClick={onBack} style={{
          padding: '12px 20px', background: 'var(--bg-canvas)',
          color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
          borderRadius: 999, fontSize: 'var(--text-md)', cursor: 'pointer', minHeight: 56,
        }}>← Accueil</button>
      )}
    </header>
    {children}
  </div>
);

const AlerteBox: React.FC<{
  icon: React.ReactNode; tone: string; title: string; count: number; onClick?: () => void;
}> = ({ icon, tone, title, count, onClick }) => (
  <button type="button" onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: 'clamp(16px, 3vw, 24px)',
    background: 'var(--bg-elevated)',
    border: `2px solid ${count > 0 ? tone : 'var(--border-subtle)'}`,
    borderLeft: `6px solid ${tone}`,
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer', textAlign: 'left', minHeight: 96,
  }}>
    <div style={{ color: tone }}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
        {title}
      </span>
      <span style={{
        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: tone, fontWeight: 700,
      }}>{fmtInt(count)}</span>
    </div>
  </button>
);

const InfoBig: React.FC<{ label: string; value?: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div style={{
    padding: 16, background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  }}>
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
      {label}
    </div>
    <div style={{
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-serif)',
      fontStyle: mono ? 'normal' : 'italic',
      fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
      color: 'var(--fg-primary)',
    }}>{value || '—'}</div>
  </div>
);

const bigBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  padding: '18px 32px', background: 'var(--accent-terracotta)',
  color: '#FBF8F3', border: '1px solid var(--accent-terracotta)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-lg)', fontWeight: 700,
  cursor: 'pointer', minHeight: 72, width: '100%',
};
const bigLabel: React.CSSProperties = {
  fontSize: 'var(--text-sm)', color: 'var(--fg-muted)',
  textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em',
};
const bigInput: React.CSSProperties = {
  padding: '18px 20px', fontSize: 'var(--text-lg)',
  fontFamily: 'var(--font-mono)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--fg-primary)', minHeight: 72,
};

export default TabletteSousTraitant;
