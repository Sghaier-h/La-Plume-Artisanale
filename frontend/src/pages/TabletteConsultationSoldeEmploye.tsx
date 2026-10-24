/**
 * TabletteConsultationSoldeEmploye (Phase C · §14quater.7)
 *
 * Design type ATM : rassurant, confirmé par icône, PAS DE boutons d'action.
 * 3 écrans après auth PIN :
 *   1. Solde courant
 *   2. Dernier bulletin
 *   3. Historique mouvements (5 derniers)
 */
import React, { useEffect, useState } from 'react';
import { Wallet, FileText, History, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import api from '../services/api';

const fmtMoney = (n: number) =>
  Number(n ?? 0).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 3,
  });

const TabletteConsultationSoldeEmploye: React.FC = () => {
  const [step, setStep] = useState<'matricule' | 'pin' | 'solde' | 'bulletin' | 'mouvements'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [compte, setCompte] = useState<any>(null);
  const [bulletin, setBulletin] = useState<any>(null);
  const [mouvements, setMouvements] = useState<any[]>([]);

  const resolveMatricule = async () => {
    setError(null);
    try {
      const res = await api.get(`/v2/rh/employes`, { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      (window as any).__tabletteSoldeId = emp.id_employe;
      setStep('pin');
    } catch {
      setError('Erreur serveur');
    }
  };

  const validerPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabletteSoldeId;
      const auth = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      setSession(auth.data?.data);

      const [c, m, b] = await Promise.all([
        api.get(`/v2/rh/comptes-employes/${id_employe}/solde`),
        api.get(`/v2/rh/comptes-employes/${id_employe}/mouvements`, { params: { limit: 5 } }),
        api.get(`/v2/rh/paies`, { params: { id_employe, limit: 1 } }).catch(() => ({ data: { data: [] } })),
      ]);
      setCompte(c.data?.data);
      setMouvements(m.data?.data || []);
      setBulletin((b.data?.data || [])[0] || null);
      setStep('solde');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  const exit = () => {
    setStep('matricule');
    setMatricule(''); setPin(''); setSession(null);
    setCompte(null); setBulletin(null); setMouvements([]);
  };

  const screens = ['solde', 'bulletin', 'mouvements'] as const;
  const screenIndex = screens.indexOf(step as any);
  const next = () => { const i = screenIndex + 1; if (i < screens.length) setStep(screens[i]); };
  const prev = () => { const i = screenIndex - 1; if (i >= 0) setStep(screens[i]); };

  return (
    <TabletteKiosqueShell
      title="Mon compte"
      subtitle="§14quater.7 · Consultation (lecture seule)"
      onExit={session ? exit : undefined}
      accent="sage"
    >
      {step === 'matricule' && (
        <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 'clamp(24px, 5vw, 60px)' }}>
          <h2 style={titleH2}>Saisir votre matricule</h2>
          <input
            value={matricule}
            onChange={(e) => setMatricule(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && resolveMatricule()}
            placeholder="EMP-001"
            autoFocus
            style={inputXl}
          />
          {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}
          <button type="button" onClick={resolveMatricule} style={btnXL}>Continuer</button>
        </div>
      )}

      {step === 'pin' && (
        <>
          <PinKeypad label="Code PIN" value={pin} onChange={setPin} onValidate={validerPin} />
          {error && <div style={{ ...errMsg, justifyContent: 'center', marginTop: 20 }}><AlertCircle size={16} /> {error}</div>}
        </>
      )}

      {screenIndex >= 0 && session && (
        <div>
          {/* Pastilles de navigation ATM */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            {screens.map((s, i) => (
              <span
                key={s}
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i === screenIndex ? 'var(--accent-sage)' : 'var(--border-subtle)',
                }}
              />
            ))}
          </div>

          {step === 'solde' && compte && (
            <AtmCard icon={<Wallet size={80} />} title="Solde courant" tone="sage">
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
                  fontWeight: 700,
                  color: Number(compte.solde_courant) >= 0 ? 'var(--accent-sage)' : 'var(--color-danger)',
                }}
              >
                {fmtMoney(compte.solde_courant)}
              </div>
              <div style={{ color: 'var(--fg-muted)', marginTop: 'clamp(8px, 1.5vw, 16px)' }}>
                {compte.date_dernier_mouvement
                  ? `Mis à jour le ${new Date(compte.date_dernier_mouvement).toLocaleDateString('fr-FR')}`
                  : 'Aucun mouvement enregistré'}
              </div>
            </AtmCard>
          )}

          {step === 'bulletin' && (
            <AtmCard icon={<FileText size={80} />} title="Dernier bulletin" tone="indigo">
              {bulletin ? (
                <>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 4vw, 2.75rem)', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                    {fmtMoney(bulletin.net_a_payer)}
                  </div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', marginTop: 'clamp(8px, 1.5vw, 16px)' }}>
                    Période {String(bulletin.periode_mois).padStart(2, '0')}/{bulletin.periode_annee}
                  </div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)', marginTop: 4 }}>
                    Brut {fmtMoney(bulletin.salaire_brut)} · CNSS {fmtMoney(bulletin.cnss_employe)} · IRPP {fmtMoney(bulletin.irpp)}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--fg-muted)' }}>Aucun bulletin disponible pour le moment.</div>
              )}
            </AtmCard>
          )}

          {step === 'mouvements' && (
            <AtmCard icon={<History size={80} />} title="Historique récent" tone="terracotta">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', textAlign: 'left' }}>
                {mouvements.length === 0 && <div style={{ color: 'var(--fg-muted)', textAlign: 'center' }}>Aucun mouvement.</div>}
                {mouvements.map((m: any) => (
                  <div key={m.id_mouvement_emp} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'clamp(8px, 1.5vw, 12px)', background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap', gap: 8,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>{m.libelle || m.type_mvt}</div>
                      <div style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.8rem)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(m.date_mouvement).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: m.sens === 'C' ? 'var(--accent-sage)' : 'var(--color-danger)',
                      fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                    }}>
                      {m.sens === 'C' ? '+' : '−'} {fmtMoney(m.montant)}
                    </div>
                  </div>
                ))}
              </div>
            </AtmCard>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 'clamp(12px, 2vw, 20px)',
            marginTop: 'clamp(20px, 3vw, 32px)', flexWrap: 'wrap',
          }}>
            <button type="button" onClick={prev} disabled={screenIndex === 0} style={{ ...btnXL, background: 'var(--bg-canvas)', color: 'var(--fg-primary)', opacity: screenIndex === 0 ? 0.4 : 1, border: '2px solid var(--border-subtle)' }}>
              <ChevronLeft size={20} /> Précédent
            </button>
            <button type="button" onClick={next} disabled={screenIndex === screens.length - 1} style={{ ...btnXL, opacity: screenIndex === screens.length - 1 ? 0.4 : 1 }}>
              Suivant <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </TabletteKiosqueShell>
  );
};

const AtmCard: React.FC<{ icon: React.ReactNode; title: string; tone: string; children: React.ReactNode }> = ({ icon, title, tone, children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 'clamp(20px, 4vw, 48px)',
    background: 'var(--bg-elevated)',
    border: `2px solid var(--accent-${tone})`,
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
  }}>
    <div style={{ color: `var(--accent-${tone})`, marginBottom: 'clamp(12px, 2vw, 24px)' }}>{icon}</div>
    <h3 style={{
      fontFamily: 'var(--font-serif)', fontStyle: 'italic',
      fontSize: 'clamp(1.25rem, 3vw, 2rem)', margin: 0, marginBottom: 'clamp(12px, 2vw, 20px)',
      color: 'var(--fg-primary)',
    }}>
      {title}
    </h3>
    {children}
  </div>
);

const titleH2: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: 'clamp(1.25rem, 3vw, 2rem)',
  textAlign: 'center',
  marginBottom: 'clamp(16px, 2vw, 24px)',
};
const inputXl: React.CSSProperties = {
  width: '100%',
  padding: 'clamp(12px, 2vw, 18px) clamp(14px, 2vw, 20px)',
  background: 'var(--bg-canvas)',
  border: '2px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(1rem, 2vw, 1.75rem)',
  textAlign: 'center',
  color: 'var(--fg-primary)',
  minHeight: 48,
  letterSpacing: '0.08em',
};
const btnXL: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  minHeight: 56,
  padding: 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 42px)',
  background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '2px solid var(--accent-terracotta)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, cursor: 'pointer',
};
const errMsg: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '12px 16px',
  background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
  color: 'var(--color-danger)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
};

export default TabletteConsultationSoldeEmploye;
