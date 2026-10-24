/**
 * TabletteDemandeAttestation (Phase H · sous-écran §14quater.6)
 * Kiosque PIN strict · formulaire attestation (travail, salaire, détention, employeur).
 * Envoie dans `demandes_rh` avec type_demande = 'attestation'.
 */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Send, FileText } from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import api from '../services/api';

const TYPE_ATTESTATION = [
  { value: 'travail',     label: 'Attestation de travail' },
  { value: 'salaire',     label: 'Attestation de salaire' },
  { value: 'detention',   label: 'Attestation de détention' },
  { value: 'employeur',   label: 'Attestation employeur' },
];

const TabletteDemandeAttestation: React.FC = () => {
  const [step, setStep] = useState<'matricule'|'pin'|'form'|'sent'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [typeAttest, setTypeAttest] = useState('travail');
  const [motif, setMotif] = useState('');
  const [destinataire, setDestinataire] = useState('');

  const resolve = async () => {
    setError(null);
    try {
      const res = await api.get('/v2/rh/employes', { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      (window as any).__tabAttestId = emp.id_employe;
      setStep('pin');
    } catch { setError('Erreur serveur'); }
  };

  const authPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabAttestId;
      const auth = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      setSession(auth.data?.data);
      setStep('form');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  const submit = async () => {
    setError(null);
    try {
      await api.post('/v2/rh/demandes-rh', {
        id_employe: session.user.id_employe,
        type_demande: 'attestation',
        objet: `${TYPE_ATTESTATION.find((o) => o.value === typeAttest)?.label} — ${destinataire || 'non précisé'}`,
        description: `Type d'attestation : ${typeAttest}\n`
                   + `Destinataire : ${destinataire || '(non précisé)'}\n`
                   + `Motif : ${motif}`,
      });
      setStep('sent');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur envoi');
    }
  };

  const exit = () => {
    setStep('matricule'); setMatricule(''); setPin('');
    setSession(null); setError(null);
    setTypeAttest('travail'); setMotif(''); setDestinataire('');
  };

  return (
    <TabletteKiosqueShell
      title="Demande d'attestation"
      subtitle="§14quater.6 · attestation travail / salaire / détention / employeur"
      onExit={session ? exit : undefined}
      accent="indigo"
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

      {step === 'form' && session && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
          <div style={headerBanner}>
            <FileText size={28} color="var(--accent-indigo)" />
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
              }}>
                {session.user.prenom} {session.user.nom}
              </div>
              <div style={{ color: 'var(--fg-muted)', fontSize: 'clamp(0.8rem, 1.2vw, 1rem)' }}>
                Matricule : {session.user.matricule}
              </div>
            </div>
          </div>

          <label>
            <span style={lbl}>Type d'attestation</span>
            <select value={typeAttest} onChange={(e) => setTypeAttest(e.target.value)} style={inputXl}>
              {TYPE_ATTESTATION.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label>
            <span style={lbl}>Destinataire (banque, administration, autre)</span>
            <input value={destinataire} onChange={(e) => setDestinataire(e.target.value)} style={inputXl}
                   placeholder="Ex : Banque XYZ · Ministère de l'intérieur" />
          </label>

          <label>
            <span style={lbl}>Motif</span>
            <textarea
              value={motif} onChange={(e) => setMotif(e.target.value)} rows={4}
              placeholder="Précisez le motif de la demande."
              style={{ ...inputXl, fontFamily: 'var(--font-sans)', textAlign: 'left', letterSpacing: 0 }}
            />
          </label>

          {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}

          <button type="button" onClick={submit} style={{ ...btnXL, alignSelf: 'center' }}>
            <Send size={18} style={{ marginRight: 8 }} /> Envoyer la demande
          </button>
        </div>
      )}

      {step === 'sent' && (
        <div style={{ textAlign: 'center', paddingTop: 'clamp(40px, 8vw, 80px)' }}>
          <CheckCircle size={120} color="var(--accent-sage)" />
          <h2 style={{ ...titleH2, color: 'var(--accent-sage)', marginTop: 20 }}>Demande envoyée</h2>
          <p style={{ color: 'var(--fg-muted)' }}>
            Votre attestation sera prête sous 24 à 48 h. Vous pourrez la récupérer auprès du service RH.
          </p>
          <button type="button" onClick={exit} style={btnXL}>Terminer</button>
        </div>
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
  background: 'var(--accent-indigo)', color: '#FBF8F3',
  border: '2px solid var(--accent-indigo)',
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
const lbl: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
  color: 'var(--fg-muted)', textTransform: 'uppercase',
  letterSpacing: '0.05em', fontWeight: 600,
};
const headerBanner: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
  padding: 'clamp(14px, 2.5vw, 20px)',
  background: 'color-mix(in srgb, var(--accent-indigo) 10%, var(--bg-elevated))',
  border: '1px solid var(--accent-indigo)',
  borderRadius: 'var(--radius-md)',
  marginBottom: 'var(--s-3)',
};

export default TabletteDemandeAttestation;
