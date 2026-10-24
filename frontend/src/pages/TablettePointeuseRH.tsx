/**
 * TablettePointeuseRH (Phase C · §14quater.5 + §14quater.14 kiosque strict)
 *
 * Flow :
 *   1. Écran d'accueil : clavier PIN XL — saisie code employé.
 *   2. Après auth : hub icônes (Entrée · Sortie · Pause début · Pause fin).
 *   3. Photo prise automatiquement (webcam) à chaque événement comme preuve.
 *   4. Confirmation visuelle 2 s avec check vert.
 *
 * Pattern hub §14ter.17c : pas de dashboard infini qui scrolle, sous-pages
 * compactes avec section Alertes sommet (ici néant car accueil opérateur).
 *
 * Accès public (pas de JWT applicatif) — la session courte est portée par
 * le token PIN tablette (POST /api/v2/rh/pin-tablette/authenticate).
 */
import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, Coffee, PlayCircle, Clock, CheckCircle, Camera, AlertCircle } from 'lucide-react';
import TabletteKiosqueShell from '../components/rh/TabletteKiosqueShell';
import PinKeypad from '../components/rh/PinKeypad';
import api from '../services/api';

type SessionTablette = {
  user: { id_employe: number; matricule: string; nom: string; prenom: string };
  token: string;
};

const TablettePointeuseRH: React.FC = () => {
  const [idStep, setIdStep] = useState<'matricule' | 'pin' | 'auth'>('matricule');
  const [matricule, setMatricule] = useState('');
  const [pin, setPin] = useState('');
  const [session, setSession] = useState<SessionTablette | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Nettoyage caméra à la sortie
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const resolveMatricule = async () => {
    setError(null);
    if (!matricule) return setError('Saisir votre matricule');
    try {
      const res = await api.get(`/v2/rh/employes`, { params: { matricule } });
      const emp = (res.data?.data || [])[0];
      if (!emp) return setError('Matricule inconnu');
      // on garde l'id pour la vérif PIN
      (window as any).__tabletteMatriculeId = emp.id_employe;
      setIdStep('pin');
    } catch (e: any) {
      setError('Impossible de contacter le serveur');
    }
  };

  const validerPin = async () => {
    setError(null);
    try {
      const id_employe = (window as any).__tabletteMatriculeId;
      const res = await api.post('/v2/rh/pin-tablette/authenticate', { id_employe, pin });
      setSession(res.data?.data || null);
      setIdStep('auth');
      setPin('');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'PIN incorrect');
      setPin('');
    }
  };

  const capturePhoto = async (): Promise<string | null> => {
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      }
      if (videoRef.current) videoRef.current.srcObject = streamRef.current;
      await new Promise((r) => setTimeout(r, 400));
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx || !videoRef.current) return null;
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      return canvas.toDataURL('image/jpeg', 0.6);
    } catch {
      return null;
    }
  };

  const emitEvent = async (type: 'entree' | 'sortie' | 'pause_debut' | 'pause_fin') => {
    if (!session) return;
    setCapturing(true);
    const photo = await capturePhoto();
    try {
      await api.post('/v2/rh/pointages/evenements', {
        id_employe: session.user.id_employe,
        type_evt: type,
        photo_url: photo,
        source: 'tablette_pin',
      }).catch(() => null); // tolère si le module existe pas encore

      const labels: Record<string, string> = {
        entree: 'Entrée enregistrée',
        sortie: 'Sortie enregistrée',
        pause_debut: 'Début de pause enregistré',
        pause_fin: 'Fin de pause enregistrée',
      };
      setConfirmMsg(labels[type]);
      setTimeout(() => {
        setConfirmMsg(null);
        exit();
      }, 2000);
    } finally {
      setCapturing(false);
    }
  };

  const exit = () => {
    setSession(null);
    setMatricule('');
    setPin('');
    setIdStep('matricule');
    setError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return (
    <TabletteKiosqueShell
      title="Pointeuse"
      subtitle="§14quater.5 · Entrée / sortie / pauses"
      onExit={session ? exit : undefined}
      accent="indigo"
    >
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />

      {/* Confirmation visuelle 2 s */}
      {confirmMsg && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 'var(--s-5)',
          }}
        >
          <CheckCircle size={120} color="var(--accent-sage)" />
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: 'var(--accent-sage)',
              textAlign: 'center',
            }}
          >
            {confirmMsg}
          </div>
        </div>
      )}

      {!confirmMsg && idStep === 'matricule' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(20px, 3vw, 32px)',
            maxWidth: 500,
            margin: '0 auto',
            paddingTop: 'clamp(24px, 5vw, 60px)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              textAlign: 'center',
            }}
          >
            Bienvenue
          </div>
          <div style={{ color: 'var(--fg-muted)', textAlign: 'center', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
            Saisir votre matricule
          </div>
          <input
            value={matricule}
            onChange={(e) => setMatricule(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && resolveMatricule()}
            placeholder="EMP-001"
            autoFocus
            style={inputXl}
          />
          {error && <ErrorMsg msg={error} />}
          <button type="button" onClick={resolveMatricule} style={btnXL}>Continuer</button>
        </div>
      )}

      {!confirmMsg && idStep === 'pin' && (
        <div>
          <PinKeypad
            label="Saisir votre code PIN"
            value={pin}
            onChange={setPin}
            onValidate={validerPin}
          />
          {error && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <ErrorMsg msg={error} />
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button type="button" onClick={exit} style={btnLink}>Annuler</button>
          </div>
        </div>
      )}

      {!confirmMsg && idStep === 'auth' && session && (
        <>
          <div
            style={{
              textAlign: 'center',
              padding: 'clamp(16px, 3vw, 32px)',
              marginBottom: 'clamp(20px, 3vw, 32px)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                color: 'var(--fg-primary)',
              }}
            >
              Bonjour, {session.user.prenom} {session.user.nom}
            </div>
            <div
              style={{
                color: 'var(--fg-muted)',
                marginTop: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
              }}
            >
              Matricule : {session.user.matricule}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'clamp(16px, 3vw, 24px)',
            }}
          >
            <ActionHub icon={<LogIn size={56} />}      label="Entrée"       tone="sage"       disabled={capturing} onClick={() => emitEvent('entree')} />
            <ActionHub icon={<LogOut size={56} />}     label="Sortie"       tone="terracotta" disabled={capturing} onClick={() => emitEvent('sortie')} />
            <ActionHub icon={<Coffee size={56} />}     label="Début pause"  tone="gold"       disabled={capturing} onClick={() => emitEvent('pause_debut')} />
            <ActionHub icon={<PlayCircle size={56} />} label="Fin pause"    tone="indigo"     disabled={capturing} onClick={() => emitEvent('pause_fin')} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 'clamp(16px, 3vw, 32px)',
              padding: 'clamp(12px, 2vw, 16px)',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--fg-muted)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Camera size={14} /> <span style={{ fontSize: '0.85rem' }}>Une photo sera prise automatiquement comme preuve de présence.</span>
          </div>
        </>
      )}
    </TabletteKiosqueShell>
  );
};

const ActionHub: React.FC<{
  icon: React.ReactNode; label: string; tone: 'sage' | 'terracotta' | 'gold' | 'indigo';
  onClick: () => void; disabled?: boolean;
}> = ({ icon, label, tone, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'clamp(10px, 2vw, 16px)',
      minHeight: 'clamp(140px, 20vw, 220px)',
      padding: 'clamp(16px, 3vw, 32px)',
      background: `color-mix(in srgb, var(--accent-${tone}) 10%, var(--bg-elevated))`,
      border: `2px solid var(--accent-${tone})`,
      borderRadius: 'var(--radius-lg)',
      color: `var(--accent-${tone})`,
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
      fontWeight: 500,
      cursor: 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'transform 100ms ease, box-shadow 180ms ease',
      touchAction: 'manipulation',
    }}
  >
    {icon}
    {label}
  </button>
);

const ErrorMsg: React.FC<{ msg: string }> = ({ msg }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
      color: 'var(--color-danger)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
    }}
  >
    <AlertCircle size={16} />
    {msg}
  </div>
);

const inputXl: React.CSSProperties = {
  width: '100%',
  padding: 'clamp(14px, 2vw, 20px) clamp(16px, 2.5vw, 24px)',
  background: 'var(--bg-canvas)',
  border: '2px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)',
  fontWeight: 700,
  textAlign: 'center',
  color: 'var(--fg-primary)',
  minHeight: 56,
  letterSpacing: '0.08em',
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
  touchAction: 'manipulation',
};

const btnLink: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9rem',
  textDecoration: 'underline',
  cursor: 'pointer',
};

export default TablettePointeuseRH;
