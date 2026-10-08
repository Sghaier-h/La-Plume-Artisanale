import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Award,
  Package,
  Scissors,
  Trash2,
  DollarSign,
  Users,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import LiveClock from '../components/tv/LiveClock';
import RefreshCountdown from '../components/tv/RefreshCountdown';
import HoraireIdealBar from '../components/tv/HoraireIdealBar';
import TopEmployesTv from '../components/tv/TopEmployesTv';
import {
  tvAtelierService,
  TvSnapshot,
  AtelierPrime,
} from '../services/primesRendementApi';

/**
 * TvAtelierScreen — layout partagé écran TV mural 55" plein écran (§11bis.7bis).
 * Consommé par `TvAtelierTissage` et `TvAtelierFinition`.
 *
 * Route publique : /tv/:atelier/:token — pas de sidebar, pas de login.
 * Auto-refresh du snapshot toutes les 30 s via setInterval.
 * Cible d'affichage prioritaire : 1920 × 1080 (Full HD), responsive fallback.
 */

interface Props {
  atelier: AtelierPrime;
}

const REFRESH_MS = 30_000;

// ═══════════════════════════════════════════════════════════════════════
// Mock data — fallback si l'API n'est pas encore branchée
// ═══════════════════════════════════════════════════════════════════════

const buildMockSnapshot = (atelier: AtelierPrime): TvSnapshot => {
  const now = new Date();
  const jourSemaine = now.getDay();
  const debutSem = new Date(now);
  debutSem.setDate(now.getDate() - ((jourSemaine + 6) % 7));
  const finSem = new Date(debutSem);
  finSem.setDate(debutSem.getDate() + 6);

  const heures = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const currHour = now.getHours();

  const horaire = heures.map((h, i) => {
    const heureInt = parseInt(h.split(':')[0], 10);
    const objectif = (i + 1) * 42;
    const realise =
      heureInt <= currHour
        ? Math.round(objectif * (0.82 + Math.random() * 0.24))
        : 0;
    return { heure: h, objectif, realise };
  });

  const nomsTissage = [
    ['Ahmed', 'Ben Salah', 'ML-04'],
    ['Fatma', 'Trabelsi', 'ML-07'],
    ['Karim', 'Jelassi', 'ML-02'],
    ['Nour', 'Mansouri', 'ML-11'],
    ['Slim', 'Bouzid', 'ML-09'],
  ];
  const nomsFinition = [
    ['Amel', 'Ferchichi', 'Frange'],
    ['Sami', 'Khemiri', 'Pliage'],
    ['Ines', 'Hamdi', 'Couture'],
    ['Wafa', 'Bouazizi', 'Emballage'],
    ['Anis', 'Rebai', 'Repassage'],
  ];

  const source = atelier === 'tissage' ? nomsTissage : nomsFinition;

  const top = source.map(([prenom, nom, poste], i) => ({
    id_employe: 1000 + i,
    prenom,
    nom,
    photo_url: undefined,
    machine: atelier === 'tissage' ? poste : undefined,
    poste: atelier === 'tissage' ? undefined : poste,
    quantite_semaine: 240 - i * 18,
    rendement_pct: 108 - i * 4.5,
    score_global: 94 - i * 3.5,
    prime_prevue_dt: 168 - i * 22,
  }));

  return {
    atelier,
    libelle_atelier:
      atelier === 'tissage'
        ? 'Atelier Tissage'
        : atelier === 'finition'
        ? 'Atelier Finition'
        : 'Atelier Préparation',
    annee: now.getFullYear(),
    numero_semaine: Math.ceil(
      ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
        86400000 +
        1) /
        7,
    ),
    date_debut_semaine: debutSem.toISOString(),
    date_fin_semaine: finSem.toISOString(),
    serveur_time: now.toISOString(),
    kpi_jour: {
      nb_1er_choix: atelier === 'tissage' ? 218 : 342,
      nb_2eme_choix: atelier === 'tissage' ? 14 : 21,
      perte_dechet_kg: atelier === 'tissage' ? 3.4 : 1.9,
      perte_dt: atelier === 'tissage' ? 84.5 : 47.3,
      rendement_pct: 96.8,
    },
    horaire,
    top_employes: top,
    cagnotte: {
      montant_total_dt: atelier === 'tissage' ? 840 : 620,
      montant_distribue_dt: atelier === 'tissage' ? 612 : 448,
      nb_beneficiaires: atelier === 'tissage' ? 12 : 9,
    },
    presence: {
      presents: atelier === 'tissage' ? 14 : 11,
      attendus: atelier === 'tissage' ? 15 : 12,
      pct: atelier === 'tissage' ? 93.3 : 91.7,
    },
    perte_totale_dt: atelier === 'tissage' ? 84.5 : 47.3,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// Composants d'affichage
// ═══════════════════════════════════════════════════════════════════════

const KpiTv: React.FC<{
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, suffix, icon, color }) => (
  <div
    className="rounded-2xl p-4 flex items-center gap-4"
    style={{
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(8px)',
    }}
  >
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
        color: '#FDFBF3',
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div
        className="text-[11px] uppercase tracking-widest opacity-70"
        style={{ color: '#FDFBF3' }}
      >
        {label}
      </div>
      <div
        className="font-black tabular-nums leading-none mt-1"
        style={{
          color: '#FDFBF3',
          fontSize: 40,
          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        {value}
        {suffix && (
          <span className="text-lg font-medium opacity-70 ml-1">{suffix}</span>
        )}
      </div>
    </div>
  </div>
);

const SidePanel: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}> = ({ label, value, sub, icon, accent }) => (
  <div
    className="rounded-2xl p-4"
    style={{
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${accent}44`,
      backdropFilter: 'blur(6px)',
    }}
  >
    <div className="flex items-center gap-2 mb-2" style={{ color: accent }}>
      {icon}
      <span className="text-xs uppercase tracking-widest font-bold">
        {label}
      </span>
    </div>
    <div
      className="font-black tabular-nums"
      style={{ color: '#FDFBF3', fontSize: 32, lineHeight: 1 }}
    >
      {value}
    </div>
    {sub && (
      <div
        className="text-xs mt-1 opacity-70"
        style={{ color: '#FDFBF3' }}
      >
        {sub}
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// Écran principal
// ═══════════════════════════════════════════════════════════════════════

const TvAtelierScreen: React.FC<Props> = ({ atelier }) => {
  const { token } = useParams<{ token: string }>();
  const [snapshot, setSnapshot] = useState<TvSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  const useMockRef = useRef<boolean>(false);

  const load = useCallback(async () => {
    if (!token) {
      // Aucun token → fallback mock direct (démo / preview)
      useMockRef.current = true;
      setSnapshot(buildMockSnapshot(atelier));
      setLoading(false);
      setLastRefreshAt(Date.now());
      return;
    }
    setIsFetching(true);
    try {
      const res = await tvAtelierService.snapshotPublic(token);
      const data = (res?.data as unknown as TvSnapshot) || null;
      if (data && data.atelier) {
        setSnapshot(data);
        setError(null);
        useMockRef.current = false;
      } else {
        useMockRef.current = true;
        setSnapshot(buildMockSnapshot(atelier));
      }
    } catch (err) {
      // Fallback mock — l'écran doit rester utilisable en démo / hors ligne
      useMockRef.current = true;
      setSnapshot(buildMockSnapshot(atelier));
      setError('Mode hors ligne — données démo');
    } finally {
      setIsFetching(false);
      setLoading(false);
      setLastRefreshAt(Date.now());
    }
  }, [atelier, token]);

  // Refresh initial + intervalle 30 s
  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const isTissage = atelier === 'tissage';

  const backgroundStyle = useMemo<React.CSSProperties>(
    () => ({
      background: 'linear-gradient(135deg, #1C1917 0%, #3B4E68 100%)',
      color: '#FDFBF3',
      minHeight: '100vh',
      minWidth: '100vw',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    }),
    [],
  );

  if (loading) {
    return (
      <div
        style={backgroundStyle}
        className="flex items-center justify-center"
      >
        <div
          className="animate-spin rounded-full h-16 w-16 border-4 border-transparent"
          style={{ borderTopColor: '#C8663D', borderRightColor: '#D6A756' }}
        />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div style={backgroundStyle} className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">Aucune donnée</div>
          <div className="opacity-70">
            Vérifiez le token TV atelier — /tv/{atelier}/&lt;token&gt;
          </div>
        </div>
      </div>
    );
  }

  const s = snapshot;
  const titreAtelier = isTissage ? 'ATELIER TISSAGE' : 'ATELIER FINITION';

  return (
    <div style={backgroundStyle}>
      {/* Décor de fond — cercles gradients diffus */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -160,
          right: -160,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(200,102,61,0.22) 0%, rgba(200,102,61,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -220,
          left: -220,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74,108,91,0.18) 0%, rgba(74,108,91,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Contenu */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '24px 32px',
          maxWidth: 1920,
          margin: '0 auto',
        }}
      >
        {/* ─── HEADER ────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div
              className="text-xs uppercase tracking-widest opacity-70"
              style={{ color: '#FDFBF3' }}
            >
              La Plume Artisanale · {s.libelle_atelier}
            </div>
            <div
              className="font-black leading-none mt-1"
              style={{
                fontSize: 56,
                color: '#FDFBF3',
                textShadow: '0 4px 14px rgba(0,0,0,0.35)',
                letterSpacing: '-0.02em',
              }}
            >
              {titreAtelier}
            </div>
            <div
              className="mt-2 text-sm uppercase tracking-widest opacity-75 font-semibold"
              style={{ color: '#D6A756' }}
            >
              Semaine {s.numero_semaine} · {s.annee}
              <span className="opacity-50 ml-3 font-normal">
                {new Date(s.date_debut_semaine).toLocaleDateString('fr-FR')} →{' '}
                {new Date(s.date_fin_semaine).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
          <LiveClock size="xxl" showSeconds showDate />
        </div>

        {/* ─── KPI grands chiffres ─────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiTv
            label={isTissage ? '1er choix (duites)' : '1er choix (pcs)'}
            value={s.kpi_jour.nb_1er_choix.toLocaleString('fr-FR')}
            icon={<Award className="w-7 h-7" />}
            color="#4A6C5B"
          />
          <KpiTv
            label={isTissage ? '2e choix (duites)' : '2e choix (pcs)'}
            value={s.kpi_jour.nb_2eme_choix.toLocaleString('fr-FR')}
            icon={<Package className="w-7 h-7" />}
            color="#D6A756"
          />
          <KpiTv
            label="Perte déchet"
            value={s.kpi_jour.perte_dechet_kg.toFixed(1)}
            suffix="kg"
            icon={<Trash2 className="w-7 h-7" />}
            color="#C8663D"
          />
          <KpiTv
            label="Perte totale"
            value={s.kpi_jour.perte_dt.toFixed(0)}
            suffix="DT"
            icon={<DollarSign className="w-7 h-7" />}
            color="#8E44AD"
          />
        </div>

        {/* ─── Grille principale — top + barre + panneaux ── */}
        <div
          className="grid gap-4 mb-6"
          style={{ gridTemplateColumns: '1.5fr 1fr' }}
        >
          {/* Colonne gauche — top 5 employés */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              minHeight: 460,
            }}
          >
            <TopEmployesTv
              topEmployes={s.top_employes}
              atelier={atelier as any}
              maxCount={5}
            />
          </div>

          {/* Colonne droite — panneaux latéraux */}
          <div className="grid grid-rows-3 gap-4">
            <SidePanel
              label="Présence équipe"
              value={`${s.presence.presents}/${s.presence.attendus}`}
              sub={`${s.presence.pct.toFixed(1)} % · ${s.presence.attendus - s.presence.presents} absent(s)`}
              icon={<Users className="w-4 h-4" />}
              accent="#4A6C5B"
            />
            <SidePanel
              label={
                isTissage
                  ? 'Cagnotte tisseurs · semaine'
                  : 'Cagnotte finition · semaine'
              }
              value={`${s.cagnotte.montant_total_dt.toFixed(0)} DT`}
              sub={`${s.cagnotte.nb_beneficiaires} bénéficiaires · ${s.cagnotte.montant_distribue_dt.toFixed(0)} DT distribués`}
              icon={<Wallet className="w-4 h-4" />}
              accent="#D6A756"
            />
            <SidePanel
              label="Rendement journée"
              value={`${s.kpi_jour.rendement_pct.toFixed(1)} %`}
              sub={
                s.kpi_jour.rendement_pct >= 100
                  ? 'Objectif atteint'
                  : 'En dessous de la cible'
              }
              icon={<TrendingUp className="w-4 h-4" />}
              accent={s.kpi_jour.rendement_pct >= 100 ? '#8FE388' : '#C8663D'}
            />
          </div>
        </div>

        {/* ─── Barre horaire idéale 100 % ──────────────────── */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: 'rgba(0,0,0,0.28)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <HoraireIdealBar
            points={s.horaire}
            height={200}
            title={
              isTissage
                ? 'Cadence horaire tissage — objectif idéal 100 %'
                : 'Cadence horaire finition — objectif idéal 100 %'
            }
          />
        </div>

        {/* ─── Footer — LIVE indicator ─────────────────────── */}
        <div className="flex items-center justify-between">
          <div
            className="text-[11px] uppercase tracking-widest opacity-50"
            style={{ color: '#FDFBF3' }}
          >
            Écran mural 55" · La Plume Artisanale ·{' '}
            {new Date(s.serveur_time).toLocaleTimeString('fr-FR')}
          </div>
          <RefreshCountdown
            intervalSec={REFRESH_MS / 1000}
            lastRefreshAt={lastRefreshAt}
            isFetching={isFetching}
            hasError={false}
            onClickRefresh={() => void load()}
          />
          {error && (
            <div
              className="text-[10px] uppercase tracking-widest px-2 py-1 rounded"
              style={{
                color: '#D6A756',
                background: 'rgba(214,167,86,0.15)',
                border: '1px solid rgba(214,167,86,0.35)',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Fabricants CSS pour animation cursor blink & pulse */}
        <style>{`
          @keyframes tv-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
};

export default TvAtelierScreen;
