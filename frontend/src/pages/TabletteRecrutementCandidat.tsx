/**
 * TabletteRecrutementCandidat (Phase H · §11bis.recrutement extension)
 *
 * Route PUBLIQUE (/tablette/recrutement-candidat?poste=TISSEUR) · pas d'auth.
 * Mode kiosque strict · auto-save localStorage · 1 question / écran.
 *
 *  Écran 1 : accueil + choix poste (si pas en query)
 *  Écran 2 : identité
 *  Écran 3 : parcours
 *  Écrans 4..N : questions dynamiques (par poste)
 *  Écran N+1 : test logique 3 Q + attentes salariales + signature
 *  Écran final : merci
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Send, Sparkles, Eraser } from 'lucide-react';
import SignatureCanvas from '../components/sous-traitants/SignatureCanvas';
import rhRecrutementCandidatApi, {
  QuestionRecrutement, Reponse, IdentiteCandidat, ParcoursCandidat,
} from '../services/rhRecrutementCandidatApi';

const LS_KEY = 'tablette.recrutement.draft';
const POSTES_DISPO = ['TISSEUR', 'COUPEUR', 'COMMERCIAL'];

const TabletteRecrutementCandidat: React.FC = () => {
  const [params] = useSearchParams();
  const posteInit = params.get('poste') || '';

  const [screen, setScreen] = useState<'accueil' | 'identite' | 'parcours'
                                     | 'question' | 'final' | 'merci'>('accueil');
  const [poste, setPoste] = useState<string>(posteInit);
  const [identite, setIdentite] = useState<IdentiteCandidat>({});
  const [parcours, setParcours] = useState<ParcoursCandidat>({});
  const [questions, setQuestions] = useState<QuestionRecrutement[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<number, string>>({});
  const [testLogique, setTestLogique] = useState<Record<number, string>>({});
  const [attentesSalariales, setAttentesSalariales] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [startAt] = useState<number>(Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        poste, identite, parcours, reponses, testLogique, attentesSalariales,
      }));
    } catch { /* ignore */ }
  }, [poste, identite, parcours, reponses, testLogique, attentesSalariales]);

  // Restaure brouillon
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!posteInit && d.poste) setPoste(d.poste);
      if (d.identite) setIdentite(d.identite);
      if (d.parcours) setParcours(d.parcours);
      if (d.reponses) setReponses(d.reponses);
      if (d.testLogique) setTestLogique(d.testLogique);
      if (d.attentesSalariales) setAttentesSalariales(d.attentesSalariales);
    } catch { /* ignore */ }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  // Charge questions du poste
  const loadQuestions = async (p: string) => {
    try {
      const list = await rhRecrutementCandidatApi.questionsActives(p);
      // Séparer : les 3 dernières test_logique vont dans écran final
      const normal = list.filter((q) => q.question_type !== 'test_logique');
      const test = list.filter((q) => q.question_type === 'test_logique').slice(0, 3);
      setQuestions([...normal, ...test]);
    } catch (e) {
      setQuestions([]);
    }
  };

  const questionsNormal = useMemo(
    () => questions.filter((q) => q.question_type !== 'test_logique'),
    [questions]
  );
  const questionsTest = useMemo(
    () => questions.filter((q) => q.question_type === 'test_logique'),
    [questions]
  );

  const recommencer = () => {
    if (!window.confirm('Recommencer la candidature ? Toutes les saisies seront effacées.')) return;
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    setPoste(posteInit); setIdentite({}); setParcours({});
    setQuestions([]); setQIndex(0); setReponses({}); setTestLogique({});
    setAttentesSalariales(''); setSignature('');
    setScreen('accueil');
  };

  const goParcours = () => setScreen('parcours');
  const startQuestions = async () => {
    if (!poste) return setError('Choisir un poste');
    await loadQuestions(poste);
    setQIndex(0);
    setScreen('question');
  };

  const nextQuestion = () => {
    if (qIndex + 1 < questionsNormal.length) {
      setQIndex(qIndex + 1);
    } else {
      setScreen('final');
    }
  };
  const prevQuestion = () => {
    if (qIndex > 0) setQIndex(qIndex - 1);
    else setScreen('parcours');
  };

  const submit = async () => {
    if (!signature) { setError('Signature requise'); return; }
    if (!identite.nom && !identite.prenom) { setError('Nom ou prénom requis'); return; }
    setSending(true); setError(null);
    try {
      const reponsesArr: Reponse[] = Object.entries(reponses).map(([id, v]) => ({
        id_question: Number(id), reponse: v,
      }));
      const testArr: Reponse[] = Object.entries(testLogique).map(([id, v]) => ({
        id_question: Number(id), reponse: v,
      }));
      const duree = Math.round((Date.now() - startAt) / 60000);
      await rhRecrutementCandidatApi.postuler({
        identite, parcours, poste_cible: poste,
        questionnaire_reponses: reponsesArr,
        test_logique_reponses: testArr,
        attentes_salariales: attentesSalariales ? Number(attentesSalariales) : undefined,
        signature_svg: signature,
        duree_minutes: duree,
      });
      try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
      setScreen('merci');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur envoi candidature');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={shellStyle}>
      <header style={headerSty}>
        <div>
          <div style={titleStyle}>Rejoignez La Plume Artisanale</div>
          <div style={subtitleStyle}>
            Candidature {poste ? `— ${poste}` : '— tablette accueil'}
          </div>
        </div>
        <button type="button" onClick={recommencer} style={btnDiscret}>
          <Eraser size={12} /> Recommencer
        </button>
      </header>

      <main style={mainStyle}>
        {screen === 'accueil' && (
          <div style={{ textAlign: 'center' }}>
            <Sparkles size={64} color="var(--accent-terracotta)" />
            <h2 style={titleH2}>Bienvenue</h2>
            <p style={pStyle}>
              Cette tablette vous permet de déposer votre candidature en 5 minutes.
              Choisissez le poste qui vous intéresse pour commencer.
            </p>
            <div style={{
              display: 'grid', gap: 'clamp(10px, 2vw, 16px)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              maxWidth: 600, margin: '20px auto',
            }}>
              {POSTES_DISPO.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPoste(p)}
                  style={{
                    ...posteCardSty,
                    background: poste === p
                      ? 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))'
                      : 'var(--bg-elevated)',
                    borderColor: poste === p ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => poste && setScreen('identite')}
                    disabled={!poste} style={btnXL}>
              Commencer <ChevronRight size={18} />
            </button>
          </div>
        )}

        {screen === 'identite' && (
          <>
            <h2 style={titleH2}>Vos informations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <L lab="Nom"><input value={identite.nom || ''} onChange={(e) => setIdentite({ ...identite, nom: e.target.value })} style={inputXl} /></L>
              <L lab="Prénom"><input value={identite.prenom || ''} onChange={(e) => setIdentite({ ...identite, prenom: e.target.value })} style={inputXl} /></L>
              <L lab="CIN / Passeport"><input value={identite.cin || ''} onChange={(e) => setIdentite({ ...identite, cin: e.target.value })} style={inputXl} /></L>
              <L lab="Téléphone"><input value={identite.telephone || ''} onChange={(e) => setIdentite({ ...identite, telephone: e.target.value })} style={inputXl} inputMode="tel" /></L>
              <L lab="Email"><input value={identite.email || ''} onChange={(e) => setIdentite({ ...identite, email: e.target.value })} style={inputXl} inputMode="email" /></L>
              <L lab="Date de naissance"><input type="date" value={identite.date_naissance || ''} onChange={(e) => setIdentite({ ...identite, date_naissance: e.target.value })} style={inputXl} /></L>
              <L lab="Adresse" full>
                <textarea rows={2} value={identite.adresse || ''} onChange={(e) => setIdentite({ ...identite, adresse: e.target.value })}
                          style={{ ...inputXl, fontFamily: 'var(--font-sans)', textAlign: 'left', letterSpacing: 0 }} />
              </L>
            </div>
            <Nav onBack={() => setScreen('accueil')} onNext={goParcours} />
          </>
        )}

        {screen === 'parcours' && (
          <>
            <h2 style={titleH2}>Votre parcours</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <L lab="Expériences professionnelles">
                <textarea rows={4} value={parcours.experiences || ''}
                          onChange={(e) => setParcours({ ...parcours, experiences: e.target.value })}
                          style={{ ...inputXl, fontFamily: 'var(--font-sans)', textAlign: 'left', letterSpacing: 0 }} />
              </L>
              <L lab="Formations / diplômes">
                <textarea rows={3} value={parcours.formations || ''}
                          onChange={(e) => setParcours({ ...parcours, formations: e.target.value })}
                          style={{ ...inputXl, fontFamily: 'var(--font-sans)', textAlign: 'left', letterSpacing: 0 }} />
              </L>
              <L lab="Langues parlées">
                <input value={parcours.langues || ''}
                       onChange={(e) => setParcours({ ...parcours, langues: e.target.value })}
                       style={inputXl} />
              </L>
            </div>
            <Nav onBack={() => setScreen('identite')} onNext={startQuestions} />
          </>
        )}

        {screen === 'question' && questionsNormal.length > 0 && (
          <>
            <div style={{ color: 'var(--fg-muted)', textAlign: 'center',
                          fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)' }}>
              Question {qIndex + 1} / {questionsNormal.length}
            </div>
            <QuestionBlock
              question={questionsNormal[qIndex]}
              value={reponses[questionsNormal[qIndex].id_question] || ''}
              onChange={(v) => setReponses({ ...reponses, [questionsNormal[qIndex].id_question]: v })}
            />
            <Nav
              onBack={prevQuestion}
              onNext={nextQuestion}
              nextLabel={qIndex + 1 === questionsNormal.length ? 'Terminer' : 'Suivant'}
            />
          </>
        )}

        {screen === 'final' && (
          <>
            <h2 style={titleH2}>Test de logique & finalisation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {questionsTest.map((q) => (
                <QuestionBlock
                  key={q.id_question}
                  question={q}
                  value={testLogique[q.id_question] || ''}
                  onChange={(v) => setTestLogique({ ...testLogique, [q.id_question]: v })}
                />
              ))}
              <L lab="Attentes salariales (TND mensuel)">
                <input value={attentesSalariales} onChange={(e) => setAttentesSalariales(e.target.value)}
                       inputMode="decimal" style={inputXl} />
              </L>
              <div>
                <span style={lblSty}>Votre signature</span>
                <SignatureCanvas
                  width={800} height={180}
                  onChange={(svg, empty) => setSignature(empty ? '' : svg)}
                />
              </div>
            </div>
            {error && <div style={errMsg}>{error}</div>}
            <Nav
              onBack={() => setScreen('question')}
              onNext={submit}
              nextLabel={sending ? 'Envoi…' : 'Envoyer ma candidature'}
              nextIcon={<Send size={18} />}
              disabled={sending}
            />
          </>
        )}

        {screen === 'merci' && (
          <div style={{ textAlign: 'center', paddingTop: 'clamp(40px, 8vw, 80px)' }}>
            <Check size={120} color="var(--accent-sage)" />
            <h2 style={{ ...titleH2, color: 'var(--accent-sage)' }}>Candidature envoyée</h2>
            <p style={pStyle}>
              Merci. Vous serez recontacté(e) par le service RH dans les prochains jours.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// ───────────────── Composants internes ─────────────────

const QuestionBlock: React.FC<{
  question: QuestionRecrutement;
  value: string;
  onChange: (v: string) => void;
}> = ({ question, value, onChange }) => {
  if (question.question_type === 'multi' || question.question_type === 'test_logique') {
    const choix = (question.choix_json as any) || [];
    return (
      <div>
        <div style={questionLabel}>{question.question_text}</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {choix.map((c: string) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              style={{
                textAlign: 'left',
                padding: 'clamp(12px, 2vw, 18px)',
                background: value === c
                  ? 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))'
                  : 'var(--bg-elevated)',
                border: `2px solid ${value === c ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                color: 'var(--fg-primary)',
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (question.question_type === 'note') {
    return (
      <div>
        <div style={questionLabel}>{question.question_text}</div>
        <input type="range" min={0} max={10} value={value || '5'}
               onChange={(e) => onChange(e.target.value)}
               style={{ width: '100%' }} />
        <div style={{ fontFamily: 'var(--font-mono)', textAlign: 'center',
                      fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--accent-terracotta)' }}>
          {value || '5'} / 10
        </div>
      </div>
    );
  }
  // 'texte'
  return (
    <div>
      <div style={questionLabel}>{question.question_text}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{ ...inputXl, fontFamily: 'var(--font-sans)', textAlign: 'left', letterSpacing: 0 }}
      />
    </div>
  );
};

const L: React.FC<{ lab: string; full?: boolean; children: React.ReactNode }> = ({ lab, full, children }) => (
  <label style={{ gridColumn: full ? '1 / -1' : undefined }}>
    <span style={lblSty}>{lab}</span>
    {children}
  </label>
);

const Nav: React.FC<{
  onBack: () => void; onNext: () => void;
  nextLabel?: string; nextIcon?: React.ReactNode; disabled?: boolean;
}> = ({ onBack, onNext, nextLabel = 'Suivant', nextIcon = <ChevronRight size={18} />, disabled }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10,
                marginTop: 'clamp(20px, 3vw, 32px)', flexWrap: 'wrap' }}>
    <button type="button" onClick={onBack} style={btnGhost}>
      <ChevronLeft size={16} /> Précédent
    </button>
    <button type="button" onClick={onNext} disabled={disabled} style={btnXL}>
      {nextLabel} {nextIcon}
    </button>
  </div>
);

// ───────────────── Styles ─────────────────

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg-app)',
  color: 'var(--fg-primary)',
  fontFamily: 'var(--font-sans)',
  display: 'flex', flexDirection: 'column',
};
const headerSty: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: 'clamp(14px, 2.5vw, 22px) clamp(16px, 3vw, 32px)',
  background: 'var(--bg-elevated)',
  borderBottom: '2px solid var(--accent-terracotta)',
};
const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
};
const subtitleStyle: React.CSSProperties = {
  fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
  color: 'var(--fg-muted)',
};
const mainStyle: React.CSSProperties = {
  flex: 1, padding: 'clamp(16px, 3vw, 40px)',
  maxWidth: 900, width: '100%', margin: '0 auto',
};
const titleH2: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'clamp(1.25rem, 3vw, 2rem)',
  textAlign: 'center', marginBottom: 'clamp(16px, 2vw, 24px)',
};
const pStyle: React.CSSProperties = {
  color: 'var(--fg-muted)', textAlign: 'center',
  fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', maxWidth: 600, margin: '0 auto',
};
const inputXl: React.CSSProperties = {
  width: '100%',
  padding: 'clamp(10px, 2vw, 16px) clamp(14px, 2vw, 20px)',
  background: 'var(--bg-canvas)',
  border: '2px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
  color: 'var(--fg-primary)',
  minHeight: 48,
};
const btnXL: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  minHeight: 56,
  padding: 'clamp(12px, 2vw, 18px) clamp(28px, 4vw, 42px)',
  background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '2px solid var(--accent-terracotta)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '12px 20px', background: 'transparent',
  color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', cursor: 'pointer',
};
const btnDiscret: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', background: 'transparent',
  color: 'var(--fg-muted)', border: '1px solid var(--border-subtle)',
  borderRadius: 999, fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-sans)', cursor: 'pointer',
};
const posteCardSty: React.CSSProperties = {
  padding: 'clamp(18px, 3vw, 28px)',
  borderRadius: 'var(--radius-lg)',
  border: '2px solid var(--border-subtle)',
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
  color: 'var(--fg-primary)', cursor: 'pointer',
};
const lblSty: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
  color: 'var(--fg-muted)', textTransform: 'uppercase',
  letterSpacing: '0.05em', fontWeight: 600,
};
const questionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
  marginBottom: 'clamp(12px, 2vw, 20px)',
};
const errMsg: React.CSSProperties = {
  padding: '12px 16px', marginTop: 10,
  background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
  color: 'var(--color-danger)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
};

export default TabletteRecrutementCandidat;
