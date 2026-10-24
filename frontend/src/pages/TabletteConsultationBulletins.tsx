/**
 * TabletteConsultationBulletins (Phase H · sous-écran §14quater.6)
 * Kiosque PIN strict · liste des 12 derniers bulletins de paie de l'employé
 * authentifié, action "Télécharger PDF" + "Accuser réception".
 */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Download, FileText } from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import api from '../services/api';

interface Bulletin {
  id_paie?: number;
  id_bulletin?: number;
  periode?: string;
  mois?: string | number;
  annee?: string | number;
  net_a_payer?: number;
  salaire_net?: number;
  pdf_url?: string;
  statut?: string;
  accuse_recu?: boolean;
}

const fmtMoney = (n: number) =>
  Number(n ?? 0).toLocaleString('fr-FR', {
    style: 'currency', currency: 'TND', maximumFractionDigits: 3,
  });

const TabletteConsultationBulletins: React.FC = () => {
  const [step, setStep] = useState<'matricule'|'pin'|'liste'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<any>(null);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resolve = async () => {
    setError(null);
    try {
      const res = await api.get('/v2/rh/employes', { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      (window as any).__tabBulletinsId = emp.id_employe;
      setStep('pin');
    } catch { setError('Erreur serveur'); }
  };

  const authPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabBulletinsId;
      const auth = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      setSession(auth.data?.data);
      await loadBulletins(id_employe);
      setStep('liste');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  const loadBulletins = async (idEmploye: number) => {
    try {
      const res = await api.get('/v2/rh/paies', { params: { id_employe: idEmploye, limit: 12 } });
      setBulletins(res.data?.data || []);
    } catch (e: any) {
      setBulletins([]);
    }
  };

  const telecharger = (b: Bulletin) => {
    if (b.pdf_url) {
      window.open(b.pdf_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('PDF non disponible pour ce bulletin.');
    }
  };

  const accuser = async (b: Bulletin) => {
    const id = b.id_paie || b.id_bulletin;
    if (!id) return;
    try {
      // On passe par le canal `demandes_rh` (type='accuse_bulletin') pour
      // tracer l'accusé sans dépendre d'une table dédiée.
      await api.post('/v2/rh/demandes-rh', {
        id_employe: session.user.id_employe,
        type_demande: 'accuse_bulletin',
        objet: `Accusé de réception bulletin ${b.periode || `${b.mois}/${b.annee}` || '#' + id}`,
        description: `Bulletin ID: ${id}`,
      });
      alert('Accusé de réception enregistré. Merci.');
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Erreur accusé');
    }
  };

  const exit = () => {
    setStep('matricule'); setMatricule(''); setPin('');
    setSession(null); setBulletins([]); setError(null);
  };

  return (
    <TabletteKiosqueShell
      title="Mes bulletins de paie"
      subtitle="§14quater.6 · 12 derniers bulletins · téléchargement + accusé"
      onExit={session ? exit : undefined}
      accent="gold"
    >
      {step === 'matricule' && (
        <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 'clamp(24px, 5vw, 60px)' }}>
          <h2 style={titleH2}>Saisir votre matricule</h2>
          <input value={matricule} onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                 onKeyDown={(e) => e.key === 'Enter' && resolve()}
                 placeholder="EMP-001" autoFocus style={inputXl} />
          {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}
          <button type="button" onClick={resolve} style={btnXL}>Continuer</button>
        </div>
      )}

      {step === 'pin' && (
        <>
          <PinKeypad label="Code PIN" value={pin} onChange={setPin} onValidate={authPin} />
          {error && (
            <div style={{ ...errMsg, justifyContent: 'center', marginTop: 20 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </>
      )}

      {step === 'liste' && session && (
        <>
          <div style={headerBanner}>
            <FileText size={28} color="var(--accent-gold)" />
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
              }}>
                {session.user.prenom} {session.user.nom}
              </div>
              <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.8rem, 1.2vw, 1rem)' }}>
                {bulletins.length} bulletin(s) disponible(s)
              </div>
            </div>
          </div>

          {bulletins.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: 'clamp(40px, 8vw, 80px) 0' }}>
              <p>Aucun bulletin de paie disponible.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 16px)' }}>
            {bulletins.map((b) => {
              const id = b.id_paie || b.id_bulletin;
              const label = b.periode || (b.mois && b.annee ? `${b.mois}/${b.annee}` : `Bulletin #${id}`);
              const net = Number(b.net_a_payer ?? b.salaire_net ?? 0);
              return (
                <div key={id} style={{
                  padding: 'clamp(14px, 2.5vw, 20px)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 'var(--s-3)',
                  flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                                  fontSize: 'clamp(1rem, 1.8vw, 1.3rem)' }}>
                      {label}
                    </div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
                                  fontFamily: 'var(--font-mono)' }}>
                      Net à payer : <strong>{fmtMoney(net)}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => telecharger(b)} style={btnPrimary}>
                      <Download size={16} /> Télécharger PDF
                    </button>
                    <button type="button" onClick={() => accuser(b)} style={btnGhost}>
                      <CheckCircle size={16} /> Accuser réception
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </TabletteKiosqueShell>
  );
};

const titleH2: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'clamp(1.25rem, 3vw, 2rem)',
  textAlign: 'center', marginBottom: 'clamp(16px, 2vw, 24px)',
};
const inputXl: React.CSSProperties = {
  width: '100%',
  padding: 'clamp(10px, 2vw, 16px) clamp(14px, 2vw, 20px)',
  background: 'var(--bg-canvas)',
  border: '2px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(1rem, 2vw, 1.3rem)',
  color: 'var(--fg-primary)',
  minHeight: 48,
};
const btnXL: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minHeight: 56,
  padding: 'clamp(12px, 2vw, 18px) clamp(28px, 4vw, 42px)',
  background: 'var(--accent-gold)', color: '#1a1a1a',
  border: '2px solid var(--accent-gold)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, cursor: 'pointer',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 16px', background: 'var(--accent-gold)',
  color: '#1a1a1a', border: 'none', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
  cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 14px', background: 'transparent',
  color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', cursor: 'pointer',
};
const errMsg: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '12px 16px',
  background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
  color: 'var(--color-danger)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
};
const headerBanner: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
  padding: 'clamp(14px, 2.5vw, 20px)',
  background: 'color-mix(in srgb, var(--accent-gold) 10%, var(--bg-elevated))',
  border: '1px solid var(--accent-gold)',
  borderRadius: 'var(--radius-md)',
  marginBottom: 'var(--s-4)',
};

export default TabletteConsultationBulletins;
