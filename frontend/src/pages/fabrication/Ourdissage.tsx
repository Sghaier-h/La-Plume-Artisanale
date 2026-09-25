/**
 * Ourdissage (§6 · Fabrication)
 * — Opération de préparation de la chaîne : les fils longitudinaux
 *   sont enroulés sur l'ensouple (rouleau qui alimente ensuite le
 *   métier à tisser).
 *
 * Suit le design system La Plume via <DashboardShell> /
 * <KpiCard> / <SectionCard>.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ruler,
  ArrowLeft,
  Filter,
  Waves,
  Layers,
  Boxes,
  Clock,
  User,
  Factory,
  CheckCircle2,
} from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';

// ─── types & mock data ──────────────────────────────────────────────
type Ensouple = {
  id: string;
  ref: string;
  article: string;
  nb_fils: number;
  longueur_m: number;
  longueur_faite_m: number;
  ourdisseur: string;
  demarre_a: string; // HH:mm
  eta: string; // HH:mm
  machine: string;
};

type Evenement = {
  id: string;
  horodatage: string; // JJ/MM HH:mm
  type: 'demarrage' | 'fin' | 'incident' | 'chgt_lot';
  libelle: string;
  ensouple: string;
};

const ENSOUPLES_ACTIVES: Ensouple[] = [
  {
    id: 'E1',
    ref: 'ENS-2026-0871',
    article: 'Fouta plate 100×180 – bleu roi',
    nb_fils: 2400,
    longueur_m: 850,
    longueur_faite_m: 612,
    ourdisseur: 'Mohamed Trabelsi',
    demarre_a: '07:15',
    eta: '11:40',
    machine: 'OURD-102',
  },
  {
    id: 'E2',
    ref: 'ENS-2026-0872',
    article: 'Serviette hammam 90×180 jacquard – ivoire',
    nb_fils: 2160,
    longueur_m: 720,
    longueur_faite_m: 180,
    ourdisseur: 'Anis Belkadi',
    demarre_a: '09:30',
    eta: '15:20',
    machine: 'OURD-102',
  },
  {
    id: 'E3',
    ref: 'ENS-2026-0873',
    article: 'Kikoy 95×170 – rayures Sahel',
    nb_fils: 1920,
    longueur_m: 620,
    longueur_faite_m: 520,
    ourdisseur: 'Mohamed Trabelsi',
    demarre_a: '06:20',
    eta: '10:45',
    machine: 'OURD-101',
  },
  {
    id: 'E4',
    ref: 'ENS-2026-0874',
    article: 'Torchon éponge 40×70 – uni ivoire',
    nb_fils: 1440,
    longueur_m: 480,
    longueur_faite_m: 96,
    ourdisseur: 'Anis Belkadi',
    demarre_a: '10:15',
    eta: '13:40',
    machine: 'OURD-101',
  },
];

const HISTORIQUE: Evenement[] = [
  { id: 'H1', horodatage: '25/09 10:12', type: 'demarrage', libelle: 'Démarrage ensouple ENS-2026-0874', ensouple: 'ENS-2026-0874' },
  { id: 'H2', horodatage: '25/09 09:32', type: 'demarrage', libelle: 'Démarrage ensouple ENS-2026-0872', ensouple: 'ENS-2026-0872' },
  { id: 'H3', horodatage: '25/09 08:47', type: 'fin', libelle: 'Fin ensouple ENS-2026-0870 (fouta 100×180 sable)', ensouple: 'ENS-2026-0870' },
  { id: 'H4', horodatage: '25/09 07:15', type: 'demarrage', libelle: 'Démarrage ensouple ENS-2026-0871', ensouple: 'ENS-2026-0871' },
  { id: 'H5', horodatage: '25/09 06:20', type: 'demarrage', libelle: 'Démarrage ensouple ENS-2026-0873', ensouple: 'ENS-2026-0873' },
  { id: 'H6', horodatage: '24/09 22:18', type: 'chgt_lot', libelle: 'Changement lot MP FIL-CH-BLE-24 → FIL-CH-BLE-25', ensouple: 'ENS-2026-0869' },
  { id: 'H7', horodatage: '24/09 20:44', type: 'incident', libelle: 'Casse fil chaîne – arrêt 12 min OURD-102', ensouple: 'ENS-2026-0868' },
  { id: 'H8', horodatage: '24/09 18:30', type: 'fin', libelle: 'Fin ensouple ENS-2026-0868 (kikoy terracotta)', ensouple: 'ENS-2026-0868' },
];

const fmtInt = (n: number) => n.toLocaleString('fr-FR');
const fmtDec = (n: number, d = 0) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

const EVENT_META: Record<Evenement['type'], { color: string; bg: string; label: string }> = {
  demarrage: {
    color: 'var(--accent-terracotta)',
    bg: 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)',
    label: 'Démarrage',
  },
  fin: {
    color: 'var(--color-success)',
    bg: 'var(--color-success-bg)',
    label: 'Fin',
  },
  incident: {
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-bg)',
    label: 'Incident',
  },
  chgt_lot: {
    color: 'var(--accent-gold)',
    bg: 'color-mix(in srgb, var(--accent-gold) 20%, transparent)',
    label: 'Chgt lot',
  },
};

// ─── page ───────────────────────────────────────────────────────────
const Ourdissage: React.FC = () => {
  const navigate = useNavigate();

  const totalLongueur = ENSOUPLES_ACTIVES.reduce((s, e) => s + e.longueur_m, 0);
  const totalFils = ENSOUPLES_ACTIVES.reduce((s, e) => s + e.nb_fils, 0);
  const lotsMp = 6; // mock : nb lots MP consommés dernières 24 h

  return (
    <DashboardShell
      eyebrow="§6 · Fabrication"
      title="Ourdissage"
      subtitle="Préparation de la chaîne : suivi des ensouples actives et journal de l'atelier ourdissage."
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
          label="Ensouples en cours"
          value={fmtInt(ENSOUPLES_ACTIVES.length)}
          unit="actives"
          hint="2 ourdisseuses en marche"
          icon={<Ruler size={18} />}
          tone="terracotta"
        />
        <KpiCard
          label="Longueur totale planifiée"
          value={fmtInt(totalLongueur)}
          unit="m"
          hint="Cumul chaîne à ourdir"
          icon={<Waves size={18} />}
          tone="sage"
        />
        <KpiCard
          label="Fils manipulés"
          value={fmtInt(totalFils)}
          unit="fils"
          hint="Total nappes actives"
          icon={<Layers size={18} />}
          tone="indigo"
        />
        <KpiCard
          label="Lots MP consommés"
          value={fmtInt(lotsMp)}
          unit="lots / 24 h"
          hint="Cônes fil chaîne prélevés"
          icon={<Boxes size={18} />}
          tone="gold"
        />
      </div>

      {/* ── Ensouples actives ──────────────────────────────────── */}
      <SectionCard
        title="Ensouples actives"
        subtitle="Suivi temps réel des ourdisseuses"
        actions={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {ENSOUPLES_ACTIVES.length} en cours
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {ENSOUPLES_ACTIVES.map((e) => {
            const progress = Math.min(100, Math.round((e.longueur_faite_m / e.longueur_m) * 100));
            return (
              <div
                key={e.id}
                style={{
                  padding: 'var(--s-4)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--s-3)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                      }}
                    >
                      {e.ref} · {e.machine}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        color: 'var(--fg-primary)',
                        fontSize: 'var(--text-sm)',
                        marginTop: 2,
                      }}
                    >
                      {e.article}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-secondary)',
                        marginTop: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <User size={12} /> {e.ourdisseur}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flex: '0 0 auto', minWidth: 140 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Clock size={12} /> {e.demarre_a} → {e.eta}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 700,
                        color: 'var(--accent-terracotta)',
                        marginTop: 2,
                      }}
                    >
                      {progress}%
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 'var(--s-3)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 'var(--s-3)',
                  }}
                >
                  <MiniField label="Nb fils" value={fmtInt(e.nb_fils)} color="var(--accent-indigo)" />
                  <MiniField label="Longueur cible" value={`${fmtDec(e.longueur_m)} m`} color="var(--accent-sage)" />
                  <MiniField label="Longueur faite" value={`${fmtDec(e.longueur_faite_m)} m`} color="var(--accent-terracotta)" />
                  <MiniField label="Reste" value={`${fmtDec(e.longueur_m - e.longueur_faite_m)} m`} color="var(--accent-gold)" />
                </div>

                <div
                  style={{
                    marginTop: 'var(--s-3)',
                    height: 8,
                    background: 'var(--bg-hover)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent-terracotta), var(--accent-gold))',
                      transition: 'width 400ms ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Historique 24h ─────────────────────────────────────── */}
      <SectionCard
        title="Journal atelier ourdissage"
        subtitle="Dernières 24 heures"
        actions={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {HISTORIQUE.length} événements
          </span>
        }
      >
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-2)',
          }}
        >
          {HISTORIQUE.map((ev) => {
            const meta = EVENT_META[ev.type];
            return (
              <li
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--s-3)',
                  padding: 'var(--s-3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span
                  style={{
                    minWidth: 96,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--fg-muted)',
                  }}
                >
                  {ev.horodatage}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: meta.bg,
                    color: meta.color,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    minWidth: 88,
                    textAlign: 'center',
                  }}
                >
                  {meta.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--fg-primary)',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {ev.libelle}
                </span>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      {/* ── Résumé ourdisseuses ────────────────────────────────── */}
      <SectionCard
        title="Ourdisseuses"
        subtitle="Charge machine actuelle"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--s-4)',
          }}
        >
          <MiniStat icon={<Factory size={16} />} label="OURD-101" value="2 ensouples" tone="var(--accent-indigo)" />
          <MiniStat icon={<Factory size={16} />} label="OURD-102" value="2 ensouples" tone="var(--accent-terracotta)" />
          <MiniStat icon={<CheckCircle2 size={16} />} label="Ensouples clôturées 24h" value="3" tone="var(--accent-sage)" />
          <MiniStat icon={<Clock size={16} />} label="Temps arrêt cumulé" value="24 min" tone="var(--accent-gold)" />
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

// ─── petits helpers ─────────────────────────────────────────────────
const MiniField: React.FC<{ label: string; value: React.ReactNode; color: string }> = ({
  label,
  value,
  color,
}) => (
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
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        fontWeight: 700,
        color,
      }}
    >
      {value}
    </div>
  </div>
);

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

export default Ourdissage;
