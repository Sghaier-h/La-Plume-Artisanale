/**
 * TabletteAvertissements (Phase H · §11bis + §14ter.17c · kiosque PIN)
 *
 * Self-service tablette : liste des avertissements du salarié authentifié
 * par PIN, actions "Accuser réception" (signature SVG) et "Contester".
 */
import React, { useEffect, useState } from 'react';
import {
  AlertCircle, CheckCircle, FileSignature, MessageSquare,
  ShieldAlert, ChevronLeft,
} from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import SignatureCanvas from '../components/sous-traitants/SignatureCanvas';
import api from '../services/api';
import rhAvertissementsApi, {
  Avertissement,
} from '../services/rhAvertissementsApi';

type Mode = null | 'accuser' | 'contester';

const NIVEAU_COLOR: Record<Avertissement['niveau'], string> = {
  info:       'var(--accent-indigo)',
  attention:  'var(--accent-gold)',
  grave:      'var(--accent-terracotta)',
  sanction:   'var(--color-danger)',
};

const TYPE_LABEL: Record<Avertissement['type'], string> = {
  retard_repete:        'Retards répétés',
  absence_non_just:     'Absence non justifiée',
  baisse_productivite:  'Baisse de productivité',
  refus_consigne:       'Refus de consigne',
  autre:                'Autre',
};

const TabletteAvertissements: React.FC = () => {
  const [step, setStep] = useState<'matricule' | 'pin' | 'liste'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [rows, setRows] = useState<Avertissement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Avertissement | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [signature, setSignature] = useState<string>('');
  const [raison, setRaison] = useState<string>('');
  const [done, setDone] = useState(false);

  const resolve = async () => {
    setError(null);
    try {
      const res = await api.get('/v2/rh/employes', { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      (window as any).__tabAvertId = emp.id_employe;
      setStep('pin');
    } catch { setError('Erreur serveur'); }
  };

  const authPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabAvertId;
      const auth = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      const data = auth.data?.data;
      setSession(data);
      setToken(data?.token || '');
      const mesRows = await rhAvertissementsApi.mes(data?.token);
      setRows(mesRows);
      setStep('liste');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  const exit = () => {
    setStep('matricule'); setMatricule(''); setPin('');
    setSession(null); setToken(''); setRows([]);
    setSelected(null); setMode(null); setSignature(''); setRaison(''); setDone(false);
  };

  const openAccuser = (a: Avertissement) => { setSelected(a); setMode('accuser'); setSignature(''); };
  const openContester = (a: Avertissement) => { setSelected(a); setMode('contester'); setRaison(''); };

  const submitAccuser = async () => {
    if (!selected) return;
    if (!signature) { setError('Signature requise'); return; }
    try {
      await rhAvertissementsApi.accuserReception(
        selected.id_avertissement, { signature_svg: signature }, token,
      );
      const next = await rhAvertissementsApi.mes(token);
      setRows(next); setDone(true); setMode(null); setSelected(null);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur accusé réception');
    }
  };
  const submitContester = async () => {
    if (!selected) return;
    if (!raison.trim()) { setError('Raison requise'); return; }
    try {
      await rhAvertissementsApi.contester(
        selected.id_avertissement, { raison }, token,
      );
      const next = await rhAvertissementsApi.mes(token);
      setRows(next); setDone(true); setMode(null); setSelected(null);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur contestation');
    }
  };

  return (
    <TabletteKiosqueShell
      title="Mes avertissements"
      subtitle="§11bis + §14ter.17c · consultation et accusé de réception"
      onExit={session ? exit : undefined}
      accent="gold"
    >
      {step === 'matricule' && (
        <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 'clamp(24px, 5vw, 60px)' }}>
          <h2 style={titleH2}>Saisir votre matricule</h2>
          <input
            value={matricule}
            onChange={(e) => setMatricule(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && resolve()}
            placeholder="EMP-001"
            autoFocus
            style={inputXl}
          />
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
          {!mode && (
            <>
              <div style={headerBanner}>
                <ShieldAlert size={28} color="var(--accent-gold)" />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
                  }}>
                    {session.user.prenom} {session.user.nom}
                  </div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.8rem, 1.2vw, 1rem)' }}>
                    {rows.length} avertissement(s) · {rows.filter((r) => r.statut === 'nouveau').length} non lu(s)
                  </div>
                </div>
              </div>

              {done && (
                <div style={{
                  padding: 'clamp(10px, 2vw, 14px)',
                  background: 'color-mix(in srgb, var(--accent-sage) 15%, transparent)',
                  color: 'var(--accent-sage)',
                  border: '1px solid var(--accent-sage)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--s-4)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <CheckCircle size={18} /> Enregistré. Merci.
                </div>
              )}

              {rows.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: 'clamp(40px, 8vw, 80px) 0' }}>
                  <CheckCircle size={64} color="var(--accent-sage)" />
                  <p style={{ marginTop: 16 }}>Aucun avertissement actif. Félicitations !</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 16px)' }}>
                {rows.map((a) => (
                  <div key={a.id_avertissement} style={{
                    padding: 'clamp(14px, 2.5vw, 20px)',
                    background: 'var(--bg-elevated)',
                    border: `2px solid ${NIVEAU_COLOR[a.niveau]}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', flexDirection: 'column',
                    gap: 'clamp(8px, 1.5vw, 14px)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: NIVEAU_COLOR[a.niveau] }}>
                          {a.niveau.toUpperCase()} · {TYPE_LABEL[a.type]}
                        </div>
                        <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.75rem, 1.1vw, 0.9rem)' }}>
                          Envoyé le {new Date(a.date_envoi).toLocaleDateString('fr-FR')}
                          {' '}· Statut : {a.statut}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', whiteSpace: 'pre-wrap' }}>
                      {a.message}
                    </div>
                    {a.statut !== 'traitee' && a.statut !== 'classee' && a.statut !== 'contestee' && (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => openAccuser(a)} style={btnPrimary}>
                          <FileSignature size={16} /> Accuser réception
                        </button>
                        <button type="button" onClick={() => openContester(a)} style={btnDanger}>
                          <MessageSquare size={16} /> Contester
                        </button>
                      </div>
                    )}
                    {a.statut === 'traitee' && (
                      <div style={{ color: 'var(--accent-sage)', fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)' }}>
                        <CheckCircle size={14} style={{ verticalAlign: 'middle' }} /> Accusé de réception signé le{' '}
                        {a.date_accuse_reception
                          && new Date(a.date_accuse_reception).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {a.statut === 'contestee' && (
                      <div style={{ color: 'var(--accent-terracotta)', fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)' }}>
                        Contestation enregistrée le{' '}
                        {a.date_contestation
                          && new Date(a.date_contestation).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === 'accuser' && selected && (
            <>
              <button type="button" onClick={() => { setMode(null); setSelected(null); }} style={btnGhost}>
                <ChevronLeft size={14} /> Retour
              </button>
              <h2 style={{ ...titleH2, marginTop: 20 }}>Accuser réception</h2>
              <div style={quoteBox}>{selected.message}</div>
              <div style={{ marginTop: 20 }}>
                <SignatureCanvas
                  label="Votre signature"
                  onChange={(svg, empty) => setSignature(empty ? '' : svg)}
                  width={800}
                  height={180}
                />
              </div>
              {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}
              <button type="button" onClick={submitAccuser} style={{ ...btnXL, marginTop: 20 }}>
                Valider la signature
              </button>
            </>
          )}

          {mode === 'contester' && selected && (
            <>
              <button type="button" onClick={() => { setMode(null); setSelected(null); }} style={btnGhost}>
                <ChevronLeft size={14} /> Retour
              </button>
              <h2 style={{ ...titleH2, marginTop: 20 }}>Contester cet avertissement</h2>
              <div style={quoteBox}>{selected.message}</div>
              <label style={{ display: 'block', marginTop: 20 }}>
                <span style={lbl}>Motif de la contestation</span>
                <textarea
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  rows={5}
                  placeholder="Expliquez votre point de vue (date, contexte, preuves éventuelles)."
                  style={{
                    ...inputXl,
                    fontFamily: 'var(--font-sans)',
                    textAlign: 'left',
                    letterSpacing: 0,
                  }}
                />
              </label>
              {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}
              <button type="button" onClick={submitContester} style={{ ...btnXL, marginTop: 20, background: 'var(--accent-terracotta)' }}>
                Envoyer la contestation
              </button>
            </>
          )}
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
  background: 'var(--accent-sage)', color: '#FBF8F3',
  border: '2px solid var(--accent-sage)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, cursor: 'pointer',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '12px 18px', background: 'var(--accent-sage)',
  color: '#FBF8F3', border: 'none', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
  cursor: 'pointer',
};
const btnDanger: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '12px 18px', background: 'transparent',
  color: 'var(--color-danger)', border: '2px solid var(--color-danger)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontWeight: 600, fontSize: 'clamp(0.9rem, 1.4vw, 1rem)', cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', minHeight: 36,
  background: 'transparent', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: '0.9rem', cursor: 'pointer',
};
const errMsg: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '12px 16px', marginTop: 10,
  background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
  color: 'var(--color-danger)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
};
const lbl: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
  color: 'var(--fg-muted)', textTransform: 'uppercase',
  letterSpacing: '0.05em', fontWeight: 600,
};
const headerBanner: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
  padding: 'clamp(14px, 2.5vw, 20px)',
  background: 'color-mix(in srgb, var(--accent-gold) 10%, var(--bg-elevated))',
  border: '1px solid var(--accent-gold)',
  borderRadius: 'var(--radius-md)',
  marginBottom: 'var(--s-5)',
};
const quoteBox: React.CSSProperties = {
  padding: 'clamp(12px, 2vw, 18px)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  fontStyle: 'italic', color: 'var(--fg-secondary)',
  whiteSpace: 'pre-wrap',
  marginTop: 10,
};

export default TabletteAvertissements;
