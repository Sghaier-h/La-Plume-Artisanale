/**
 * TabletteMesDemandes (Phase C · §14quater.6-7 + hub §14ter.17c)
 *
 * Hub d'icônes après authentification PIN :
 *   - Demander une avance
 *   - Demander un congé
 *   - Demander un document (attestation / bulletin / autre)
 *   - Signaler un problème (RH / atelier / machine)
 *   - Voir mon planning (7 jours)
 *   - Mon compte (solde + bulletins)
 *
 * Section Alertes RH haute (si demandes en attente), bannière compte.
 * Signature tactile canvas, soumission → notification RH_MANAGER.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Coins as HandCoins, Palmtree, FileText, Wrench, Calendar, Wallet,
  AlertCircle, CheckCircle, Send, Eraser, ChevronLeft,
} from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import api from '../services/api';

const fmtMoney = (n: number) =>
  Number(n ?? 0).toLocaleString('fr-FR', {
    style: 'currency', currency: 'TND', maximumFractionDigits: 3,
  });

type Action = null | 'avance' | 'conge' | 'document' | 'probleme' | 'planning' | 'compte';

const TabletteMesDemandes: React.FC = () => {
  const [step, setStep] = useState<'matricule' | 'pin' | 'hub'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [compte, setCompte] = useState<any>(null);
  const [sent, setSent] = useState(false);

  const resolve = async () => {
    setError(null);
    try {
      const res = await api.get('/v2/rh/employes', { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      (window as any).__tabletteDemandeId = emp.id_employe;
      setStep('pin');
    } catch { setError('Erreur serveur'); }
  };

  const authPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabletteDemandeId;
      const auth = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      setSession(auth.data?.data);
      const [c, d] = await Promise.all([
        api.get(`/v2/rh/comptes-employes/${id_employe}/solde`),
        api.get('/v2/rh/demandes-rh', { params: { id_employe, limit: 50 } }),
      ]);
      setCompte(c.data?.data);
      setAlertCount(((d.data?.data || []) as any[]).filter((x) => ['demande', 'en_cours'].includes(x.statut)).length);
      setStep('hub');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  const exit = () => {
    setStep('matricule'); setMatricule(''); setPin('');
    setSession(null); setAction(null); setSent(false);
  };

  return (
    <TabletteKiosqueShell
      title="Mes demandes"
      subtitle="§14quater.6 · Avance · congé · document · signalement · planning"
      onExit={session ? exit : undefined}
      accent="terracotta"
    >
      {step === 'matricule' && (
        <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 'clamp(24px, 5vw, 60px)' }}>
          <h2 style={titleH2}>Saisir votre matricule</h2>
          <input value={matricule} onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                 onKeyDown={(e) => e.key === 'Enter' && resolve()} placeholder="EMP-001" autoFocus style={inputXl} />
          {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}
          <button type="button" onClick={resolve} style={btnXL}>Continuer</button>
        </div>
      )}

      {step === 'pin' && (
        <>
          <PinKeypad label="Code PIN" value={pin} onChange={setPin} onValidate={authPin} />
          {error && <div style={{ ...errMsg, justifyContent: 'center', marginTop: 20 }}><AlertCircle size={16} /> {error}</div>}
        </>
      )}

      {step === 'hub' && session && (
        <>
          {/* Section Alertes & urgences (contrat §14ter.17c) */}
          {alertCount > 0 && (
            <div
              style={{
                padding: 'clamp(10px, 2vw, 14px)',
                background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)',
                color: 'var(--accent-gold)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--accent-gold)',
                marginBottom: 'clamp(16px, 3vw, 24px)',
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              }}
            >
              <AlertCircle size={18} />
              <span style={{ fontWeight: 600 }}>{alertCount} demande(s) en attente / en cours.</span>
            </div>
          )}

          {/* Bannière accueil */}
          {!action && (
            <>
              <div style={{
                textAlign: 'center',
                padding: 'clamp(16px, 3vw, 32px)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'clamp(20px, 3vw, 32px)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                }}>
                  Bonjour, {session.user.prenom} {session.user.nom}
                </div>
                {compte && (
                  <div style={{ color: 'var(--fg-muted)', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
                    Solde : {fmtMoney(compte.solde_courant)}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'clamp(16px, 3vw, 24px)',
                }}
              >
                <HubIcon icon={<HandCoins size={56} />}  label="Demander une avance" tone="gold"       onClick={() => setAction('avance')} />
                <HubIcon icon={<Palmtree size={56} />}   label="Demander un congé"  tone="sage"       onClick={() => setAction('conge')} />
                <HubIcon icon={<FileText size={56} />}   label="Demander un document" tone="indigo"   onClick={() => setAction('document')} />
                <HubIcon icon={<Wrench size={56} />}     label="Signaler un problème" tone="rose"     onClick={() => setAction('probleme')} />
                <HubIcon icon={<Calendar size={56} />}   label="Voir mon planning"  tone="terracotta" onClick={() => setAction('planning')} />
                <HubIcon icon={<Wallet size={56} />}     label="Mon compte"         tone="sage"       onClick={() => setAction('compte')} />
              </div>
            </>
          )}

          {action && !sent && (
            <>
              <button type="button" onClick={() => setAction(null)} style={{ ...btnGhost, marginBottom: 20 }}>
                <ChevronLeft size={16} /> Retour
              </button>
              {action === 'avance'   && <FormDemande type="avance"             session={session} onSent={() => setSent(true)} />}
              {action === 'conge'    && <FormDemande type="conge"              session={session} onSent={() => setSent(true)} />}
              {action === 'document' && <FormDemande type="attestation_travail" session={session} onSent={() => setSent(true)} />}
              {action === 'probleme' && <FormDemande type="probleme_atelier"   session={session} onSent={() => setSent(true)} />}
              {action === 'planning' && <PlanningView session={session} />}
              {action === 'compte'   && <CompteView  compte={compte} session={session} />}
            </>
          )}

          {sent && (
            <div style={{ textAlign: 'center', paddingTop: 'clamp(40px, 8vw, 80px)' }}>
              <CheckCircle size={120} color="var(--accent-sage)" />
              <h2 style={{ ...titleH2, color: 'var(--accent-sage)', marginTop: 20 }}>Demande envoyée</h2>
              <p style={{ color: 'var(--fg-muted)' }}>Le service RH a été notifié.</p>
              <button type="button" onClick={() => { setSent(false); setAction(null); }} style={btnXL}>Retour au menu</button>
            </div>
          )}
        </>
      )}
    </TabletteKiosqueShell>
  );
};

// ───────────────────────────────────────────────────────────────
// Vues internes

const FormDemande: React.FC<{
  type: 'avance' | 'conge' | 'attestation_travail' | 'probleme_atelier';
  session: any;
  onSent: () => void;
}> = ({ type, session, onSent }) => {
  const [objet, setObjet] = useState('');
  const [desc, setDesc] = useState('');
  const [montant, setMontant] = useState('');
  const [dateD, setDateD] = useState('');
  const [dateF, setDateF] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const pos = (e: any) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const touch = e.touches?.[0];
    const x = ((touch?.clientX ?? e.clientX) - rect.left) * (c.width / rect.width);
    const y = ((touch?.clientY ?? e.clientY) - rect.top) * (c.height / rect.height);
    return { x, y };
  };
  const start = (e: any) => { drawing.current = true; const ctx = canvasRef.current!.getContext('2d')!; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1a1a1a'; };
  const move  = (e: any) => { if (!drawing.current) return; const ctx = canvasRef.current!.getContext('2d')!; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const end   = () => { drawing.current = false; };
  const clear = () => canvasRef.current!.getContext('2d')!.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

  const submit = async () => {
    setError(null);
    const signature_svg = canvasRef.current!.toDataURL('image/png');
    try {
      await api.post('/v2/rh/demandes-rh', {
        id_employe: session.user.id_employe,
        type_demande: type,
        objet: objet || LABELS[type],
        description: desc,
        montant_demande: montant ? Number(montant) : null,
        date_debut_conge: dateD || null,
        date_fin_conge: dateF || null,
        signature_svg,
      });
      onSent();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur envoi');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
      <h2 style={titleH2}>{LABELS[type]}</h2>

      <label style={fld}>
        <span style={lbl}>Objet</span>
        <input value={objet} onChange={(e) => setObjet(e.target.value)} style={inputXl} />
      </label>

      {type === 'avance' && (
        <label style={fld}>
          <span style={lbl}>Montant demandé (DT)</span>
          <input value={montant} onChange={(e) => setMontant(e.target.value)} inputMode="decimal" style={inputXl} />
        </label>
      )}

      {type === 'conge' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(10px, 2vw, 16px)' }}>
          <label style={fld}>
            <span style={lbl}>Du</span>
            <input type="date" value={dateD} onChange={(e) => setDateD(e.target.value)} style={inputXl} />
          </label>
          <label style={fld}>
            <span style={lbl}>Au</span>
            <input type="date" value={dateF} onChange={(e) => setDateF(e.target.value)} style={inputXl} />
          </label>
        </div>
      )}

      <label style={fld}>
        <span style={lbl}>Description</span>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ ...inputXl, fontFamily: 'var(--font-sans)', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', textAlign: 'left', letterSpacing: 0 }} />
      </label>

      <div style={fld}>
        <span style={lbl}>Signature</span>
        <canvas
          ref={canvasRef}
          width={800}
          height={180}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          style={{
            width: '100%', maxWidth: '100%',
            height: 'clamp(140px, 20vw, 200px)',
            background: '#FBF8F3',
            border: '2px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            touchAction: 'none',
          }}
        />
        <button type="button" onClick={clear} style={{ ...btnGhost, alignSelf: 'flex-start' }}>
          <Eraser size={14} /> Effacer
        </button>
      </div>

      {error && <div style={errMsg}><AlertCircle size={16} /> {error}</div>}

      <button type="button" onClick={submit} style={{ ...btnXL, alignSelf: 'center' }}>
        <Send size={18} style={{ marginRight: 8 }} /> Envoyer
      </button>
    </div>
  );
};

const PlanningView: React.FC<{ session: any }> = ({ session }) => {
  const [plan, setPlan] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/v2/rh/planning-employes/mon/${session.user.id_employe}`, { params: { jours: 7 } })
      .then((r) => setPlan(r.data?.data || []))
      .catch(() => setPlan([]));
  }, [session]);
  return (
    <>
      <h2 style={titleH2}>Mon planning (7 jours)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.length === 0 && <div style={{ color: 'var(--fg-muted)', textAlign: 'center' }}>Aucun planning sur les 7 prochains jours.</div>}
        {plan.map((p: any) => (
          <div key={p.id_planning} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'clamp(10px, 1.5vw, 14px)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', flexWrap: 'wrap', gap: 8,
          }}>
            <div>
              <div style={{ fontWeight: 700 }}>{new Date(p.date_planning).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
              <div style={{ color: 'var(--fg-muted)', fontSize: '0.85rem' }}>{p.type_shift}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {String(p.horaire_debut).slice(0, 5)} — {String(p.horaire_fin).slice(0, 5)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const CompteView: React.FC<{ compte: any; session: any }> = ({ compte, session }) => (
  <>
    <h2 style={titleH2}>Mon compte</h2>
    <div style={{
      padding: 'clamp(20px, 4vw, 40px)',
      background: 'var(--bg-elevated)',
      border: '2px solid var(--accent-sage)',
      borderRadius: 'var(--radius-md)', textAlign: 'center',
    }}>
      <div style={{ color: 'var(--fg-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.08em' }}>Solde actuel</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 700,
        color: Number(compte?.solde_courant || 0) >= 0 ? 'var(--accent-sage)' : 'var(--color-danger)',
        marginTop: 'clamp(10px, 2vw, 20px)',
      }}>
        {fmtMoney(compte?.solde_courant)}
      </div>
      <div style={{ color: 'var(--fg-muted)', marginTop: 12 }}>
        {session.user.matricule} · {compte?.banque || 'Banque non renseignée'}
      </div>
    </div>
  </>
);

const LABELS: Record<string, string> = {
  avance: 'Demander une avance',
  conge: 'Demander un congé',
  attestation_travail: 'Demander un document',
  probleme_atelier: 'Signaler un problème',
};

const HubIcon: React.FC<{ icon: React.ReactNode; label: string; tone: 'gold'|'sage'|'indigo'|'rose'|'terracotta'; onClick: () => void }> = ({ icon, label, tone, onClick }) => (
  <button type="button" onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 'clamp(8px, 1.5vw, 14px)',
    minHeight: 'clamp(140px, 18vw, 200px)',
    padding: 'clamp(16px, 3vw, 28px)',
    background: `color-mix(in srgb, var(--accent-${tone}) 10%, var(--bg-elevated))`,
    border: `2px solid var(--accent-${tone})`,
    borderRadius: 'var(--radius-lg)',
    color: `var(--accent-${tone})`,
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: 'clamp(1rem, 1.8vw, 1.3rem)',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'center',
    touchAction: 'manipulation',
  }}>
    {icon}
    {label}
  </button>
);

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
  background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '2px solid var(--accent-terracotta)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', minHeight: 36,
  background: 'transparent', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: '0.9rem', cursor: 'pointer',
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

export default TabletteMesDemandes;
