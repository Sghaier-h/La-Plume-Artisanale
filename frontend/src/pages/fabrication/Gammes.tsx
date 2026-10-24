/**
 * Gammes opératoires (§6 · Fabrication)
 * — Séquences d'opérations standard pour fabriquer un article :
 *   pour chaque gamme, la liste ordonnée des opérations avec le poste
 *   de travail utilisé, le temps standard (min/pièce) et le coût
 *   opératoire estimé.
 *
 * Suit strictement le design system La Plume :
 * palette terracotta / sage / indigo / gold, typographie
 * Fraunces italic titres + Inter texte + JetBrains Mono chiffres,
 * via les composants <DashboardShell> / <KpiCard> / <SectionCard>.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScrollText,
  ArrowLeft,
  Filter,
  Clock,
  CircleDollarSign,
  Layers,
  ChevronDown,
  ChevronRight,
  Scissors,
  Ruler,
  Factory,
  CheckCircle2,
} from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';

// ─── types & mock data ──────────────────────────────────────────────
type Operation = {
  ordre: number;
  libelle: string;
  poste: string;
  temps_min: number; // minutes / pièce
  cout_tnd: number;
};

type Gamme = {
  id: string;
  code: string;
  libelle: string;
  article: string;
  ref_article: string;
  actif: boolean;
  operations: Operation[];
};

const GAMMES: Gamme[] = [
  {
    id: 'G1',
    code: 'GAM-FOU-100180',
    libelle: 'Fouta plate 100×180 – standard',
    article: 'Fouta plate 100×180 cm',
    ref_article: 'FOU-100180-STD',
    actif: true,
    operations: [
      { ordre: 1, libelle: 'Ourdissage chaîne', poste: 'PST-OURD-01', temps_min: 3.5, cout_tnd: 0.42 },
      { ordre: 2, libelle: 'Tissage Dornier P1', poste: 'PST-TISS-01', temps_min: 6.0, cout_tnd: 1.10 },
      { ordre: 3, libelle: 'Coupe manuelle', poste: 'PST-COUP-01', temps_min: 1.2, cout_tnd: 0.18 },
      { ordre: 4, libelle: 'Frange & finition', poste: 'PST-FRAN-01', temps_min: 2.0, cout_tnd: 0.30 },
      { ordre: 5, libelle: 'Contrôle qualité', poste: 'PST-QUAL-01', temps_min: 0.8, cout_tnd: 0.10 },
      { ordre: 6, libelle: 'Emballage', poste: 'PST-EMB-01', temps_min: 1.0, cout_tnd: 0.08 },
    ],
  },
  {
    id: 'G2',
    code: 'GAM-HAM-90180',
    libelle: 'Serviette hammam 90×180 – jacquard',
    article: 'Serviette hammam 90×180 jacquard',
    ref_article: 'HAM-90180-JAC',
    actif: true,
    operations: [
      { ordre: 1, libelle: 'Ourdissage chaîne', poste: 'PST-OURD-01', temps_min: 3.8, cout_tnd: 0.46 },
      { ordre: 2, libelle: 'Tissage Dornier P2', poste: 'PST-TISS-02', temps_min: 5.4, cout_tnd: 1.20 },
      { ordre: 3, libelle: 'Lavage & séchage', poste: 'PST-LAV-01', temps_min: 2.4, cout_tnd: 0.55 },
      { ordre: 4, libelle: 'Coupe manuelle', poste: 'PST-COUP-01', temps_min: 1.3, cout_tnd: 0.20 },
      { ordre: 5, libelle: 'Couture bordure', poste: 'PST-COUD-01', temps_min: 2.8, cout_tnd: 0.55 },
      { ordre: 6, libelle: 'Contrôle qualité', poste: 'PST-QUAL-01', temps_min: 0.8, cout_tnd: 0.10 },
      { ordre: 7, libelle: 'Emballage', poste: 'PST-EMB-01', temps_min: 1.0, cout_tnd: 0.08 },
    ],
  },
  {
    id: 'G3',
    code: 'GAM-TOR-4070',
    libelle: 'Torchon éponge 40×70 – uni',
    article: 'Torchon éponge 40×70 cm',
    ref_article: 'TOR-4070-UNI',
    actif: true,
    operations: [
      { ordre: 1, libelle: 'Ourdissage chaîne', poste: 'PST-OURD-01', temps_min: 1.8, cout_tnd: 0.22 },
      { ordre: 2, libelle: 'Tissage Dornier P1', poste: 'PST-TISS-01', temps_min: 2.6, cout_tnd: 0.48 },
      { ordre: 3, libelle: 'Coupe manuelle', poste: 'PST-COUP-01', temps_min: 0.8, cout_tnd: 0.12 },
      { ordre: 4, libelle: 'Couture bordure', poste: 'PST-COUD-01', temps_min: 1.4, cout_tnd: 0.28 },
      { ordre: 5, libelle: 'Contrôle qualité', poste: 'PST-QUAL-01', temps_min: 0.5, cout_tnd: 0.06 },
      { ordre: 6, libelle: 'Emballage', poste: 'PST-EMB-01', temps_min: 0.6, cout_tnd: 0.05 },
    ],
  },
  {
    id: 'G4',
    code: 'GAM-KIK-95170',
    libelle: 'Kikoy 95×170 – rayures Sahel',
    article: 'Kikoy 95×170 rayures Sahel',
    ref_article: 'KIK-95170-SAH',
    actif: true,
    operations: [
      { ordre: 1, libelle: 'Ourdissage chaîne rayée', poste: 'PST-OURD-01', temps_min: 4.2, cout_tnd: 0.55 },
      { ordre: 2, libelle: 'Tissage Dornier P2', poste: 'PST-TISS-02', temps_min: 5.8, cout_tnd: 1.30 },
      { ordre: 3, libelle: 'Coupe manuelle', poste: 'PST-COUP-01', temps_min: 1.1, cout_tnd: 0.17 },
      { ordre: 4, libelle: 'Frange main', poste: 'PST-BROD-01', temps_min: 4.0, cout_tnd: 0.80 },
      { ordre: 5, libelle: 'Contrôle qualité', poste: 'PST-QUAL-01', temps_min: 0.9, cout_tnd: 0.11 },
      { ordre: 6, libelle: 'Emballage', poste: 'PST-EMB-01', temps_min: 1.0, cout_tnd: 0.08 },
    ],
  },
  {
    id: 'G5',
    code: 'GAM-DRA-160240',
    libelle: 'Drap de plage 160×240 – nid abeille',
    article: 'Drap de plage 160×240 nid abeille',
    ref_article: 'DRA-160240-NA',
    actif: false,
    operations: [
      { ordre: 1, libelle: 'Ourdissage chaîne', poste: 'PST-OURD-01', temps_min: 5.5, cout_tnd: 0.75 },
      { ordre: 2, libelle: 'Tissage Dornier P2', poste: 'PST-TISS-02', temps_min: 9.2, cout_tnd: 2.10 },
      { ordre: 3, libelle: 'Lavage & séchage', poste: 'PST-LAV-01', temps_min: 3.0, cout_tnd: 0.72 },
      { ordre: 4, libelle: 'Coupe manuelle', poste: 'PST-COUP-01', temps_min: 1.6, cout_tnd: 0.24 },
      { ordre: 5, libelle: 'Couture ourlet', poste: 'PST-COUD-01', temps_min: 3.5, cout_tnd: 0.72 },
      { ordre: 6, libelle: 'Contrôle qualité', poste: 'PST-QUAL-01', temps_min: 1.1, cout_tnd: 0.14 },
      { ordre: 7, libelle: 'Emballage', poste: 'PST-EMB-01', temps_min: 1.2, cout_tnd: 0.10 },
    ],
  },
];

const fmtInt = (n: number) => n.toLocaleString('fr-FR');
const fmtDec = (n: number, d = 2) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'TND', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sumTemps = (g: Gamme) => g.operations.reduce((s, o) => s + o.temps_min, 0);
const sumCout = (g: Gamme) => g.operations.reduce((s, o) => s + o.cout_tnd, 0);

// ─── page ───────────────────────────────────────────────────────────
const Gammes: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>('G1');

  const gammesActives = GAMMES.filter((g) => g.actif);
  const tempsMoyen =
    GAMMES.reduce((s, g) => s + sumTemps(g), 0) / GAMMES.length;
  const coutMoyen =
    GAMMES.reduce((s, g) => s + sumCout(g), 0) / GAMMES.length;
  const nbOperations = GAMMES.reduce((s, g) => s + g.operations.length, 0);

  return (
    <DashboardShell
      eyebrow="§6 · Fabrication"
      title="Gammes opératoires"
      subtitle="Séquences standard d'opérations par article : poste de travail, temps standard et coût opératoire estimé."
      headerRight={
        <>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={btnGhost}
          >
            <ArrowLeft size={14} style={{ marginRight: 6 }} />
            Retour
          </button>
          <button
            type="button"
            onClick={() => { /* filtre placeholder */ }}
            style={btnPrimary}
          >
            <Filter size={14} style={{ marginRight: 6 }} />
            Filtrer
          </button>
        </>
      }
    >
      {/* ── KPI ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Gammes actives"
          value={fmtInt(gammesActives.length)}
          unit={`/ ${fmtInt(GAMMES.length)}`}
          hint="Séquences opératoires en service"
          icon={<ScrollText size={18} />}
          tone="terracotta"
        />
        <KpiCard
          label="Temps moyen / pièce"
          value={fmtDec(tempsMoyen, 1)}
          unit="min"
          hint="Tous articles confondus"
          icon={<Clock size={18} />}
          tone="sage"
        />
        <KpiCard
          label="Coût moyen opératoire"
          value={fmtMoney(coutMoyen)}
          hint="Hors matière première"
          icon={<CircleDollarSign size={18} />}
          tone="gold"
        />
        <KpiCard
          label="Opérations référencées"
          value={fmtInt(nbOperations)}
          unit="étapes"
          hint="Cumul sur toutes les gammes"
          icon={<Layers size={18} />}
          tone="indigo"
        />
      </div>

      {/* ── Table des gammes ────────────────────────────────────── */}
      <SectionCard
        title="Catalogue des gammes"
        subtitle="Cliquer sur une ligne pour dérouler les opérations"
        actions={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {GAMMES.length} gammes
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {/* header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '24px minmax(0, 1.4fr) minmax(0, 1.6fr) 110px 110px 110px',
              gap: 'var(--s-3)',
              padding: '0 var(--s-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span />
            <span>Code · article</span>
            <span>Libellé</span>
            <span style={{ textAlign: 'right' }}>Temps std</span>
            <span style={{ textAlign: 'right' }}>Coût op.</span>
            <span style={{ textAlign: 'right' }}>Statut</span>
          </div>

          {GAMMES.map((g) => {
            const isOpen = expanded === g.id;
            const totalTemps = sumTemps(g);
            const totalCout = sumCout(g);
            return (
              <div key={g.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : g.id)}
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '24px minmax(0, 1.4fr) minmax(0, 1.6fr) 110px 110px 110px',
                    gap: 'var(--s-3)',
                    alignItems: 'center',
                    width: '100%',
                    padding: 'var(--s-3)',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: 'var(--fg-muted)', display: 'inline-flex' }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                      }}
                    >
                      {g.code}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        color: 'var(--fg-primary)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {g.article}
                    </div>
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--fg-secondary)',
                      fontSize: 'var(--text-sm)',
                      minWidth: 0,
                    }}
                  >
                    {g.libelle}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-sage)',
                      fontWeight: 600,
                    }}
                  >
                    {fmtDec(totalTemps, 1)} min
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                    }}
                  >
                    {fmtMoney(totalCout)}
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        background: g.actif ? 'var(--color-success-bg)' : 'var(--bg-hover)',
                        color: g.actif ? 'var(--color-success)' : 'var(--fg-muted)',
                        fontWeight: 700,
                      }}
                    >
                      {g.actif ? 'Actif' : 'Archivé'}
                    </span>
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      marginTop: 'var(--s-2)',
                      padding: 'var(--s-3) var(--s-4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px minmax(0, 1.6fr) minmax(0, 1fr) 100px 100px',
                        gap: 'var(--s-3)',
                        padding: '0 var(--s-2) var(--s-2)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-mono)',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span>#</span>
                      <span>Opération</span>
                      <span>Poste</span>
                      <span style={{ textAlign: 'right' }}>Temps</span>
                      <span style={{ textAlign: 'right' }}>Coût</span>
                    </div>
                    {g.operations.map((op) => (
                      <div
                        key={`${g.id}-${op.ordre}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '32px minmax(0, 1.6fr) minmax(0, 1fr) 100px 100px',
                          gap: 'var(--s-3)',
                          alignItems: 'center',
                          padding: 'var(--s-2)',
                          borderBottom: '1px dashed var(--border-subtle)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--accent-terracotta)',
                          }}
                        >
                          {op.ordre}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--fg-primary)',
                          }}
                        >
                          {op.libelle}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--fg-secondary)',
                          }}
                        >
                          {op.poste}
                        </span>
                        <span
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-sage)',
                          }}
                        >
                          {fmtDec(op.temps_min, 1)} min
                        </span>
                        <span
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--fg-secondary)',
                          }}
                        >
                          {fmtMoney(op.cout_tnd)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Répartition postes ─────────────────────────────────── */}
      <SectionCard
        title="Répartition par poste"
        subtitle="Nombre de gammes utilisant chaque poste"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--s-4)',
          }}
        >
          <MiniStat icon={<Ruler size={16} />} label="Ourdissage" value={GAMMES.length} tone="var(--accent-terracotta)" />
          <MiniStat icon={<Factory size={16} />} label="Tissage" value={GAMMES.length} tone="var(--accent-indigo)" />
          <MiniStat icon={<Scissors size={16} />} label="Coupe & finition" value={GAMMES.length} tone="var(--accent-sage)" />
          <MiniStat icon={<CheckCircle2 size={16} />} label="Contrôle qualité" value={GAMMES.length} tone="var(--accent-gold)" />
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

// ─── styles partagés ────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  background: 'var(--accent-terracotta)',
  color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  background: 'var(--bg-canvas)',
  color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  cursor: 'pointer',
};

const MiniStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone: string;
}> = ({ icon, label, value, tone }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      padding: 'var(--s-3)',
      background: 'var(--bg-canvas)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-sm)',
        background: `color-mix(in srgb, ${tone} 15%, transparent)`,
        color: tone,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--fg-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--fg-primary)',
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export default Gammes;
