/**
 * TabletteDemandeAvance (Phase C · §14quater.6)
 *
 * - Authentification tablette PIN.
 * - Saisie montant demandé + motif liste prédéfinie.
 * - Signature tactile canvas.
 * - POST demande RH + avance liée.
 *
 * §14quater.14 kiosque strict · responsive 400 px → 1920 px.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Coins as HandCoins, Send, AlertCircle, CheckCircle, Eraser } from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import api from '../services/api';

const MOTIFS = [
  'Frais médicaux',
  'Rentrée scolaire',
  'Déplacement familial',
  'Réparation véhicule',
  'Mariage',
  'Événement familial',
  'Autre',
];

const TabletteDemandeAvance: React.FC = () => {
  const [step, setStep] = useState<'matricule' | 'pin' | 'form' | 'done'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState(MOTIFS[0]);
  const [motifAutre, setMotifAutre] = useState('');
  const [modalite, setModalite] = useState('prochain_salaire');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const resolveMatricule = async () => {
    setError(null);
    try {
      const res = await api.get(`/v2/rh/employes`, { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      (window as any).__tabletteAvanceId = emp.id_employe;
      setStep('pin');
    } catch {
      setError('Erreur serveur');
    }
  };

  const validerPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabletteAvanceId;
      const res = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      setSession(res.data?.data);
      setStep('form');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  // Signature canvas
  useEffect(() => {
    if (step !== 'form' || !canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineCap = 'round';
  }, [step]);

  const pos = (e: any) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const touch = e.touches?.[0];
    const x = ((touch?.clientX ?? e.clientX) - rect.left) * (c.width / rect.width);
    const y = ((touch?.clientY ?? e.clientY) - rect.top) * (c.height / rect.height);
    return { x, y };
  };

  const start = (e: any) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: any) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => { drawing.current = false; };

  const clearSig = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
  };

  const envoyer = async () => {
    setError(null);
    if (!montant || Number(montant) <= 0) return setError('Montant invalide');
    const svg = canvasRef.current!.toDataURL('image/png');
    const motifFinal = motif === 'Autre' ? motifAutre : motif;
    try {
      await api.post('/v2/rh/demandes-rh', {
        id_employe: session.user.id_employe,
        type_demande: 'avance',
        objet: `Demande d'avance : ${motifFinal}`,
        description: motifFinal,
        montant_demande: Number(montant),
        signature_svg: svg,
      });
      await api.post('/v2/rh/avances', {
        id_employe: session.user.id_employe,
        montant_demande: Number(montant),
        motif: motifFinal,
        modalite_remboursement: modalite,
      });
      setStep('done');
      setTimeout(exit, 2500);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur envoi demande');
    }
  };

  const exit = () => {
    setStep('matricule');
    setMatricule('');
    setPin('');
    setSession(null);
    setMontant('');
    setMotif(MOTIFS[0]);
    setMotifAutre('');
  };

  return (
    <TabletteKiosqueShell
      title="Demander une avance"
      subtitle="§14quater.6 · Montant + motif + signature"
      onExit={session ? exit : undefined}
      accent="gold"
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

      {step === 'form' && session && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 3vw, 24px)' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={titleH2}>
              Bonjour, {session.user.prenom}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            <label style={fld}>
              <span style={lbl}>Montant demandé (DT)</span>
              <input value={montant} onChange={(e) => setMontant(e.target.value)} inputMode="decimal" style={inputXl} placeholder="0.000" />
            </label>
            <label style={fld}>
              <span style={lbl}>Motif</span>
              <select value={motif} onChange={(e) => setMotif(e.target.value)} style={inputXl}>
                {MOTIFS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            {motif === 'Autre' && (
              <label style={fld}>
                <span style={lbl}>Préciser</span>
                <input value={motifAutre} onChange={(e) => setMotifAutre(e.target.value)} style={inputXl} />
              </label>
            )}
            <label style={fld}>
              <span style={lbl}>Modalité remboursement</span>
              <select value={modalite} onChange={(e) => setModalite(e.target.value)} style={inputXl}>
                <option value="prochain_salaire">Prochain salaire</option>
                <option value="mensualites_2">2 mensualités</option>
                <option value="mensualites_3">3 mensualités</option>
                <option value="mensualites_6">6 mensualités</option>
                <option value="mensualites_12">12 mensualités</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={lbl}>Signature tactile (obligatoire)</span>
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              onMouseDown={start}
              onMouseMove={move}
              onMouseUp={end}
              onMouseLeave={end}
              onTouchStart={start}
              onTouchMove={move}
              onTouchEnd={end}
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'clamp(140px, 20vw, 220px)',
                background: '#FBF8F3',
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                touchAction: 'none',
              }}
            />
            <button type="button" onClick={clearSig} style={{ ...btnGhost, alignSelf: 'flex-start' }}>
              <Eraser size={14} /> Effacer la signature
            </button>
          </div>

          {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}

          <button type="button" onClick={envoyer} style={{ ...btnXL, alignSelf: 'center' }}>
            <Send size={18} style={{ marginRight: 8 }} />
            Envoyer la demande
          </button>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', paddingTop: 'clamp(60px, 10vw, 120px)' }}>
          <CheckCircle size={120} color="var(--accent-sage)" />
          <h2 style={{ ...titleH2, color: 'var(--accent-sage)', marginTop: 20 }}>
            Demande envoyée
          </h2>
          <p style={{ color: 'var(--fg-muted)' }}>Le service RH a été notifié.</p>
        </div>
      )}
    </TabletteKiosqueShell>
  );
};

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
  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
  color: 'var(--fg-primary)',
  minHeight: 48,
};
const btnXL: React.CSSProperties = {
  minHeight: 56,
  padding: 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 42px)',
  background: 'var(--accent-terracotta)',
  color: '#FBF8F3',
  border: '2px solid var(--accent-terracotta)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', minHeight: 36,
  background: 'transparent', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: '0.85rem', cursor: 'pointer',
};
const fld: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl: React.CSSProperties = {
  fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
  color: 'var(--fg-muted)', textTransform: 'uppercase',
  letterSpacing: '0.05em', fontWeight: 600,
};
const errMsg: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '12px 16px',
  background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
  color: 'var(--color-danger)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
};

export default TabletteDemandeAvance;
