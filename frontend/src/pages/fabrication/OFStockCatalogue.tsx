/**
 * OF Stock catalogue (§6 · Fabrication)
 * — Ordres de fabrication déclenchés pour reconstituer le stock
 *   catalogue (CA / produits standards en réassort permanent).
 *   Ces OF diffèrent des OF "commande" (§5), qui sont eux
 *   attachés à une commande client précise.
 *
 * Suit le design system La Plume via <DashboardShell> /
 * <KpiCard> / <SectionCard>.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Filter,
  Package,
  Boxes,
  CircleDollarSign,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';

// ─── types & mock data ──────────────────────────────────────────────
type StatutOF = 'planifie' | 'en_cours' | 'termine' | 'suspendu';

type OFStock = {
  id: string;
  ref: string;
  article: string;
  ref_article: string;
  qte_planifiee: number;
  qte_realisee: number;
  unite: string;
  statut: StatutOF;
  date_debut: string;
  date_fin: string;
  atelier: string;
  responsable: string;
  valeur_tnd: number;
};

const OF_STOCK: OFStock[] = [
  {
    id: 'OF1',
    ref: 'OF-STK-2026-0142',
    article: 'Fouta plate 100×180 cm – bleu roi',
    ref_article: 'FOU-100180-BLE',
    qte_planifiee: 800,
    qte_realisee: 512,
    unite: 'pcs',
    statut: 'en_cours',
    date_debut: '18/09/2026',
    date_fin: '02/10/2026',
    atelier: 'Tissage A',
    responsable: 'K. Sfar',
    valeur_tnd: 18400,
  },
  {
    id: 'OF2',
    ref: 'OF-STK-2026-0143',
    article: 'Serviette hammam 90×180 jacquard – ivoire',
    ref_article: 'HAM-90180-IVO',
    qte_planifiee: 500,
    qte_realisee: 500,
    unite: 'pcs',
    statut: 'termine',
    date_debut: '10/09/2026',
    date_fin: '22/09/2026',
    atelier: 'Tissage B',
    responsable: 'H. Manai',
    valeur_tnd: 13750,
  },
  {
    id: 'OF3',
    ref: 'OF-STK-2026-0144',
    article: 'Torchon éponge 40×70 cm – uni',
    ref_article: 'TOR-4070-UNI',
    qte_planifiee: 1500,
    qte_realisee: 0,
    unite: 'pcs',
    statut: 'planifie',
    date_debut: '28/09/2026',
    date_fin: '08/10/2026',
    atelier: 'Tissage A',
    responsable: 'K. Sfar',
    valeur_tnd: 6600,
  },
  {
    id: 'OF4',
    ref: 'OF-STK-2026-0145',
    article: 'Kikoy 95×170 rayures Sahel – terracotta',
    ref_article: 'KIK-95170-SAH-TC',
    qte_planifiee: 400,
    qte_realisee: 120,
    unite: 'pcs',
    statut: 'en_cours',
    date_debut: '20/09/2026',
    date_fin: '05/10/2026',
    atelier: 'Tissage B',
    responsable: 'S. Karoui',
    valeur_tnd: 11200,
  },
  {
    id: 'OF5',
    ref: 'OF-STK-2026-0146',
    article: 'Drap de plage 160×240 nid abeille – sable',
    ref_article: 'DRA-160240-SAB',
    qte_planifiee: 250,
    qte_realisee: 60,
    unite: 'pcs',
    statut: 'suspendu',
    date_debut: '15/09/2026',
    date_fin: '30/09/2026',
    atelier: 'Tissage B',
    responsable: 'H. Manai',
    valeur_tnd: 15000,
  },
  {
    id: 'OF6',
    ref: 'OF-STK-2026-0147',
    article: 'Fouta plate 100×180 cm – rayé anthracite',
    ref_article: 'FOU-100180-ANT',
    qte_planifiee: 600,
    qte_realisee: 0,
    unite: 'pcs',
    statut: 'planifie',
    date_debut: '01/10/2026',
    date_fin: '15/10/2026',
    atelier: 'Tissage A',
    responsable: 'R. Zouari',
    valeur_tnd: 13800,
  },
];

const fmtInt = (n: number) => n.toLocaleString('fr-FR');
const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 });

const STATUT_META: Record<StatutOF, { label: string; bg: string; color: string; icon: LucideIcon }> = {
  planifie: {
    label: 'Planifié',
    bg: 'color-mix(in srgb, var(--accent-indigo) 15%, transparent)',
    color: 'var(--accent-indigo)',
    icon: CalendarClock,
  },
  en_cours: {
    label: 'En cours',
    bg: 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)',
    color: 'var(--accent-terracotta)',
    icon: PlayCircle,
  },
  termine: {
    label: 'Terminé',
    bg: 'var(--color-success-bg)',
    color: 'var(--color-success)',
    icon: CheckCircle2,
  },
  suspendu: {
    label: 'Suspendu',
    bg: 'color-mix(in srgb, var(--accent-gold) 20%, transparent)',
    color: 'var(--accent-gold)',
    icon: PauseCircle,
  },
};

// ─── page ───────────────────────────────────────────────────────────
const OFStockCatalogue: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'tous' | StatutOF>('tous');

  const filtered = filter === 'tous' ? OF_STOCK : OF_STOCK.filter((o) => o.statut === filter);

  const nbEnCours = OF_STOCK.filter((o) => o.statut === 'en_cours').length;
  const qteAProduire = OF_STOCK
    .filter((o) => o.statut !== 'termine')
    .reduce((s, o) => s + (o.qte_planifiee - o.qte_realisee), 0);
  const valeurStockCible = OF_STOCK
    .filter((o) => o.statut !== 'termine')
    .reduce((s, o) => s + o.valeur_tnd, 0);
  const tauxAvancement = Math.round(
    (OF_STOCK.reduce((s, o) => s + o.qte_realisee, 0) /
      OF_STOCK.reduce((s, o) => s + o.qte_planifiee, 0)) *
      100
  );

  return (
    <DashboardShell
      eyebrow="§6 · Fabrication"
      title="OF Stock catalogue (CA)"
      subtitle="Ordres de fabrication déclenchés en réassort du stock catalogue — indépendants des commandes clients."
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
            onClick={() => navigate('/of')}
            style={btnPrimary}
          >
            <FileText size={14} style={{ marginRight: 6 }} />
            Voir tous les OF
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
          label="OF stock en cours"
          value={fmtInt(nbEnCours)}
          unit="ordres"
          hint={`${OF_STOCK.length} ordres tous statuts`}
          icon={<PlayCircle size={18} />}
          tone="terracotta"
        />
        <KpiCard
          label="Quantité à produire"
          value={fmtInt(qteAProduire)}
          unit="pièces"
          hint="Reste à fabriquer sur OF ouverts"
          icon={<Boxes size={18} />}
          tone="sage"
        />
        <KpiCard
          label="Valeur stock cible"
          value={fmtMoney(valeurStockCible)}
          hint="OF ouverts × coût moyen fabriqué"
          icon={<CircleDollarSign size={18} />}
          tone="gold"
        />
        <KpiCard
          label="Avancement global"
          value={`${tauxAvancement}`}
          unit="%"
          hint="Cumul réalisé / planifié"
          icon={<Package size={18} />}
          tone="indigo"
        />
      </div>

      {/* ── Filtres statut ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
        {(['tous', 'planifie', 'en_cours', 'termine', 'suspendu'] as const).map((s) => {
          const active = filter === s;
          const label = s === 'tous' ? 'Tous' : STATUT_META[s].label;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                background: active ? 'var(--accent-terracotta)' : 'var(--bg-canvas)',
                color: active ? '#FBF8F3' : 'var(--fg-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              <Filter size={12} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Liste OF ───────────────────────────────────────────── */}
      <SectionCard
        title="Ordres de fabrication stock"
        subtitle="Réassort catalogue par référence"
        actions={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {filtered.length} ordres
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {filtered.map((o) => {
            const meta = STATUT_META[o.statut];
            const StatutIcon = meta.icon;
            const progress = Math.min(100, Math.round((o.qte_realisee / o.qte_planifiee) * 100));
            return (
              <div
                key={o.id}
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
                      {o.ref} · {o.ref_article}
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
                      {o.article}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-secondary)',
                        marginTop: 4,
                      }}
                    >
                      {o.atelier} · Resp. {o.responsable}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: meta.bg,
                        color: meta.color,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      <StatutIcon size={12} />
                      {meta.label}
                    </span>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {o.date_debut} → {o.date_fin}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 'var(--s-3)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 'var(--s-3)',
                  }}
                >
                  <MiniField
                    label="Planifié"
                    value={`${fmtInt(o.qte_planifiee)} ${o.unite}`}
                    color="var(--accent-indigo)"
                  />
                  <MiniField
                    label="Réalisé"
                    value={`${fmtInt(o.qte_realisee)} ${o.unite}`}
                    color="var(--accent-sage)"
                  />
                  <MiniField
                    label="Reste"
                    value={`${fmtInt(o.qte_planifiee - o.qte_realisee)} ${o.unite}`}
                    color="var(--accent-terracotta)"
                  />
                  <MiniField
                    label="Valeur cible"
                    value={fmtMoney(o.valeur_tnd)}
                    color="var(--accent-gold)"
                  />
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
                      background: `linear-gradient(90deg, ${meta.color}, ${meta.color}77)`,
                      transition: 'width 400ms ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--fg-muted)',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{progress}% réalisé</span>
                  <span>
                    <ArrowRight size={11} style={{ verticalAlign: '-1px' }} /> Fiche OF
                  </span>
                </div>
              </div>
            );
          })}
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

export default OFStockCatalogue;
