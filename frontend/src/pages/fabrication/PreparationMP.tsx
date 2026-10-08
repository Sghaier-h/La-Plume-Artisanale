/**
 * Préparation matière première (§6 · Fabrication)
 * — Kittage MP avant lancement OF : pour chaque ordre à démarrer,
 *   on prépare l'ensemble des cônes fil chaîne + fil trame + colorants
 *   par machine et par lot, avec état "préparé" ou "manquant" par ligne.
 *
 * Suit le design system La Plume via <DashboardShell> /
 * <KpiCard> / <SectionCard>.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Filter,
  PackageCheck,
  PackageX,
  Boxes,
  Percent,
  Truck,
  ArrowRight,
  Circle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';

// ─── types & mock data ──────────────────────────────────────────────
type LigneMP = {
  id: string;
  type: 'fil_chaine' | 'fil_trame' | 'colorant' | 'accessoire';
  ref: string;
  libelle: string;
  qte: number;
  unite: string;
  emplacement: string;
  statut: 'prepare' | 'manquant' | 'partiel';
};

type Kit = {
  id: string;
  of_ref: string;
  article: string;
  machine: string;
  lancement_prevu: string; // JJ/MM HH:mm
  responsable: string;
  lignes: LigneMP[];
};

const KITS: Kit[] = [
  {
    id: 'K1',
    of_ref: 'OF-STK-2026-0147',
    article: 'Fouta plate 100×180 – rayé anthracite',
    machine: 'DOR-P1-01',
    lancement_prevu: '01/10 06:00',
    responsable: 'K. Sfar',
    lignes: [
      { id: 'K1L1', type: 'fil_chaine', ref: 'FIL-CH-ANT-25', libelle: 'Fil chaîne coton peigné anthracite 20/2', qte: 18, unite: 'cônes', emplacement: 'MP-A-03-12', statut: 'prepare' },
      { id: 'K1L2', type: 'fil_chaine', ref: 'FIL-CH-BLA-25', libelle: 'Fil chaîne coton peigné blanc 20/2', qte: 12, unite: 'cônes', emplacement: 'MP-A-01-04', statut: 'prepare' },
      { id: 'K1L3', type: 'fil_trame', ref: 'FIL-TR-ANT-25', libelle: 'Fil trame anthracite 10/1', qte: 24, unite: 'cônes', emplacement: 'MP-B-02-07', statut: 'partiel' },
      { id: 'K1L4', type: 'accessoire', ref: 'ETI-BROD-LP', libelle: 'Étiquette brodée La Plume', qte: 600, unite: 'pcs', emplacement: 'ACC-01-15', statut: 'prepare' },
    ],
  },
  {
    id: 'K2',
    of_ref: 'OF-STK-2026-0148',
    article: 'Serviette hammam 90×180 jacquard – jaune curcuma',
    machine: 'DOR-P2-01',
    lancement_prevu: '01/10 06:00',
    responsable: 'H. Manai',
    lignes: [
      { id: 'K2L1', type: 'fil_chaine', ref: 'FIL-CH-BLA-25', libelle: 'Fil chaîne coton peigné blanc 20/2', qte: 22, unite: 'cônes', emplacement: 'MP-A-01-04', statut: 'prepare' },
      { id: 'K2L2', type: 'fil_trame', ref: 'FIL-TR-JAU-25', libelle: 'Fil trame jaune curcuma 10/1', qte: 20, unite: 'cônes', emplacement: 'MP-B-04-02', statut: 'manquant' },
      { id: 'K2L3', type: 'colorant', ref: 'COL-JAU-CUR', libelle: 'Colorant réactif jaune curcuma', qte: 3, unite: 'kg', emplacement: 'COL-02-11', statut: 'prepare' },
      { id: 'K2L4', type: 'accessoire', ref: 'ETI-BROD-LP', libelle: 'Étiquette brodée La Plume', qte: 500, unite: 'pcs', emplacement: 'ACC-01-15', statut: 'prepare' },
    ],
  },
  {
    id: 'K3',
    of_ref: 'OF-STK-2026-0144',
    article: 'Torchon éponge 40×70 – uni ivoire',
    machine: 'DOR-P1-02',
    lancement_prevu: '28/09 06:00',
    responsable: 'R. Zouari',
    lignes: [
      { id: 'K3L1', type: 'fil_chaine', ref: 'FIL-CH-IVO-25', libelle: 'Fil chaîne coton ivoire 16/1', qte: 14, unite: 'cônes', emplacement: 'MP-A-02-08', statut: 'prepare' },
      { id: 'K3L2', type: 'fil_trame', ref: 'FIL-TR-IVO-EP', libelle: 'Fil trame éponge ivoire 6/1', qte: 30, unite: 'cônes', emplacement: 'MP-B-01-05', statut: 'prepare' },
      { id: 'K3L3', type: 'accessoire', ref: 'ETI-BROD-LP', libelle: 'Étiquette brodée La Plume', qte: 1500, unite: 'pcs', emplacement: 'ACC-01-15', statut: 'prepare' },
    ],
  },
  {
    id: 'K4',
    of_ref: 'OF-STK-2026-0149',
    article: 'Kikoy 95×170 – rayures Djerba',
    machine: 'DOR-P2-02',
    lancement_prevu: '02/10 14:00',
    responsable: 'S. Karoui',
    lignes: [
      { id: 'K4L1', type: 'fil_chaine', ref: 'FIL-CH-MIX-25', libelle: 'Fil chaîne mix (5 couleurs Djerba)', qte: 25, unite: 'cônes', emplacement: 'MP-A-05-01', statut: 'partiel' },
      { id: 'K4L2', type: 'fil_trame', ref: 'FIL-TR-BLA-25', libelle: 'Fil trame blanc 10/1', qte: 18, unite: 'cônes', emplacement: 'MP-B-01-02', statut: 'prepare' },
      { id: 'K4L3', type: 'colorant', ref: 'COL-BLE-INDIGO', libelle: 'Colorant indigo naturel', qte: 2, unite: 'kg', emplacement: 'COL-01-04', statut: 'manquant' },
      { id: 'K4L4', type: 'accessoire', ref: 'ETI-BROD-LP', libelle: 'Étiquette brodée La Plume', qte: 400, unite: 'pcs', emplacement: 'ACC-01-15', statut: 'prepare' },
    ],
  },
];

const fmtInt = (n: number) => n.toLocaleString('fr-FR');

const LIGNE_STATUT: Record<LigneMP['statut'], { label: string; color: string; bg: string; icon: LucideIcon }> = {
  prepare: {
    label: 'Préparé',
    color: 'var(--color-success)',
    bg: 'var(--color-success-bg)',
    icon: CheckCircle2,
  },
  partiel: {
    label: 'Partiel',
    color: 'var(--accent-gold)',
    bg: 'color-mix(in srgb, var(--accent-gold) 20%, transparent)',
    icon: Circle,
  },
  manquant: {
    label: 'Manquant',
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-bg)',
    icon: AlertTriangle,
  },
};

const TYPE_LABEL: Record<LigneMP['type'], string> = {
  fil_chaine: 'Fil chaîne',
  fil_trame: 'Fil trame',
  colorant: 'Colorant',
  accessoire: 'Accessoire',
};

// ─── page ───────────────────────────────────────────────────────────
const PreparationMP: React.FC = () => {
  const navigate = useNavigate();
  const [preleves, setPreleves] = useState<Set<string>>(new Set());

  const marquerPrelever = (id: string) => {
    setPreleves((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLignes = KITS.reduce((s, k) => s + k.lignes.length, 0);
  const lignesPretes = KITS.reduce(
    (s, k) => s + k.lignes.filter((l) => l.statut === 'prepare').length,
    0
  );
  const kitsCompletes = KITS.filter((k) =>
    k.lignes.every((l) => l.statut === 'prepare')
  ).length;
  const kitsEnAttente = KITS.length - kitsCompletes;
  const tauxDispo = Math.round((lignesPretes / totalLignes) * 100);

  return (
    <DashboardShell
      eyebrow="§6 · Fabrication"
      title="Préparation matière première"
      subtitle="Kittage MP avant lancement OF : cônes fil chaîne, fil trame, colorants et accessoires par machine."
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
          label="Kits préparés (jour)"
          value={fmtInt(kitsCompletes)}
          unit={`/ ${fmtInt(KITS.length)}`}
          hint="Complets et prêts au lancement"
          icon={<PackageCheck size={18} />}
          tone="sage"
        />
        <KpiCard
          label="Kits en attente"
          value={fmtInt(kitsEnAttente)}
          unit="OF"
          hint="Au moins une ligne à préparer"
          icon={<PackageX size={18} />}
          tone="terracotta"
        />
        <KpiCard
          label="Lignes à prélever"
          value={fmtInt(totalLignes - lignesPretes)}
          unit={`/ ${fmtInt(totalLignes)}`}
          hint="Cônes + colorants + accessoires"
          icon={<Boxes size={18} />}
          tone="indigo"
        />
        <KpiCard
          label="Taux disponibilité MP"
          value={`${tauxDispo}`}
          unit="%"
          hint="Lignes préparées / total"
          icon={<Percent size={18} />}
          tone="gold"
        />
      </div>

      {/* ── Kits par OF ─────────────────────────────────────────── */}
      <SectionCard
        title="OF à lancer prochainement"
        subtitle="Composants à prélever au magasin MP"
        actions={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {KITS.length} kits
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {KITS.map((k) => {
            const preparees = k.lignes.filter((l) => l.statut === 'prepare').length;
            const isComplete = preparees === k.lignes.length;
            return (
              <div
                key={k.id}
                style={{
                  padding: 'var(--s-4)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {/* header kit */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--s-3)',
                    flexWrap: 'wrap',
                    paddingBottom: 'var(--s-3)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 280px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                      }}
                    >
                      {k.of_ref} · {k.machine} · Resp. {k.responsable}
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
                      {k.article}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Truck size={12} /> Lancement {k.lancement_prevu}
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 6,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: isComplete ? 'var(--color-success-bg)' : 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)',
                        color: isComplete ? 'var(--color-success)' : 'var(--accent-terracotta)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {preparees}/{k.lignes.length} lignes
                    </span>
                  </div>
                </div>

                {/* table lignes */}
                <div
                  style={{
                    marginTop: 'var(--s-3)',
                    display: 'grid',
                    gridTemplateColumns: '90px minmax(0, 1.8fr) 100px 100px 110px 110px',
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
                  <span>Type</span>
                  <span>Réf. · libellé</span>
                  <span style={{ textAlign: 'right' }}>Qté</span>
                  <span>Emplac.</span>
                  <span style={{ textAlign: 'center' }}>Statut</span>
                  <span style={{ textAlign: 'right' }}>Action</span>
                </div>
                {k.lignes.map((l) => {
                  const meta = LIGNE_STATUT[l.statut];
                  const Icon = meta.icon;
                  const isPreleve = preleves.has(l.id);
                  return (
                    <div
                      key={l.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '90px minmax(0, 1.8fr) 100px 100px 110px 110px',
                        gap: 'var(--s-3)',
                        alignItems: 'center',
                        padding: 'var(--s-2)',
                        borderBottom: '1px dashed var(--border-subtle)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--accent-indigo)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {TYPE_LABEL[l.type]}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--fg-muted)',
                          }}
                        >
                          {l.ref}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--fg-primary)',
                          }}
                        >
                          {l.libelle}
                        </div>
                      </span>
                      <span
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--fg-primary)',
                          fontWeight: 700,
                        }}
                      >
                        {fmtInt(l.qte)} {l.unite}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--fg-secondary)',
                        }}
                      >
                        {l.emplacement}
                      </span>
                      <span style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: meta.bg,
                            color: meta.color,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          <Icon size={11} />
                          {meta.label}
                        </span>
                      </span>
                      <span style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => marquerPrelever(l.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 999,
                            border: `1px solid ${isPreleve ? 'var(--color-success)' : 'var(--accent-terracotta)'}`,
                            background: isPreleve ? 'var(--color-success-bg)' : 'transparent',
                            color: isPreleve ? 'var(--color-success)' : 'var(--accent-terracotta)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isPreleve ? (
                            <>
                              <CheckCircle2 size={12} /> Prélevé
                            </>
                          ) : (
                            <>
                              Prélever <ArrowRight size={12} />
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
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

export default PreparationMP;
