import React, { useState } from 'react';
import {
  Package, Camera, AlertCircle, ShoppingCart, Wrench, FileText, Box, CheckCircle,
  PlusCircle, Send, Scissors, RefreshCw,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

// ─── Types ────────────────────────────────────────────────────────
interface Commande {
  id: string;
  client: string;
  ref: string;
  modele: string;
  dimensions: string;
  qteTotale: number;
  etatTissage: string;
  etatCoupe: string;
  etatST: string;
  etatAtelier: string;
  etatPliage: string;
  etatFrange: string;
  qtePrete: number;
  priorite: string;
  delai: string;
}

interface ColisArticle {
  suivis: string;
  commande: string;
  ref: string;
  modele: string;
  qte: number;
}

interface Colis {
  numColis: string;
  qrCode: string;
  articles: ColisArticle[];
  poids: number;
  dimensions: string;
  palette: string;
  statut: string;
  operateur: string;
}

interface Fourniture {
  id: string;
  type: string;
  ref: string;
  libelle: string;
  stock: number;
  min: number;
  max: number;
  unite: string;
  statut: string;
  valeur: number;
}

interface DemandePliage {
  id: string;
  date: string;
  commande: string;
  ref: string;
  modele: string;
  qte: number;
  priorite: string;
  statut: string;
  demandeur: string;
}

interface DemandeRetourFrange extends DemandePliage {
  observation: string;
}

// ─── Style helpers ────────────────────────────────────────────────
const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  letterSpacing: '0.02em',
};

const etatToken = (etat: string): React.CSSProperties => {
  switch (etat) {
    case 'Terminé':
      return { ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' };
    case 'En cours':
      return { ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' };
    case 'En attente':
      return { ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
    case 'Non commencé':
      return { ...badgeBase, background: 'var(--bg-canvas)', color: 'var(--fg-muted)' };
    case 'N/A':
      return { ...badgeBase, background: 'var(--bg-sunken)', color: 'var(--fg-muted)' };
    default:
      return { ...badgeBase, background: 'var(--bg-canvas)', color: 'var(--fg-muted)' };
  }
};

const statutToken = (statut: string): React.CSSProperties => {
  switch (statut) {
    case 'OK':
    case 'Validé':
    case 'Terminé':
      return { ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' };
    case 'Alerte':
    case 'Urgente':
      return { ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
    case 'En attente':
      return { ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
    case 'En cours':
      return { ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' };
    default:
      return { ...badgeBase, background: 'var(--bg-canvas)', color: 'var(--fg-muted)' };
  }
};

const prioriteToken = (priorite: string): React.CSSProperties => {
  switch (priorite) {
    case 'Urgente':
    case 'Critique':
      return { ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
    case 'Moyenne':
      return { ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
    case 'Normale':
      return { ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' };
    default:
      return { ...badgeBase, background: 'var(--bg-canvas)', color: 'var(--fg-muted)' };
  }
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--accent-terracotta)',
  color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnAccent = (bg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: bg,
  color: '#FBF8F3',
  border: `1px solid ${bg}`,
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
});

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--bg-hover)',
  color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnIconGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  background: 'var(--bg-hover)',
  color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--s-3) var(--s-4)',
  background: 'var(--bg-app)',
  color: 'var(--fg-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--fg-secondary)',
  marginBottom: 'var(--s-1)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const TABS: { id: string; label: string; icon: React.ComponentType<{ size?: number | string }> }[] = [
  { id: 'commandes', label: 'Commandes & États', icon: Package },
  { id: 'colis', label: 'Gestion Colis', icon: Box },
  { id: 'pliage', label: 'Demandes Pliage', icon: Scissors },
  { id: 'frange', label: 'Retour Frange', icon: RefreshCw },
  { id: 'fournitures', label: 'Fournitures', icon: ShoppingCart },
  { id: 'achats', label: "Demandes Achat", icon: FileText },
  { id: 'interventions', label: 'Interventions', icon: Wrench },
];

const TableauBordMagasinPF: React.FC = () => {
  const [activeTab, setActiveTab] = useState('commandes');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showNewColis, setShowNewColis] = useState(false);
  const [showDemandeAchat, setShowDemandeAchat] = useState(false);
  const [showDemandeIntervention, setShowDemandeIntervention] = useState(false);
  const [showDemandePliage, setShowDemandePliage] = useState(false);
  const [showDemandeRetourFrange, setShowDemandeRetourFrange] = useState(false);

  // ── Données (mock — préservées) ──────────────────────────────
  const commandes: Commande[] = [
    {
      id: 'C2025-001', client: 'CLIENT A', ref: 'REF-001', modele: 'Tapis Berbère',
      dimensions: '200x300', qteTotale: 100,
      etatTissage: 'Terminé', etatCoupe: 'Terminé', etatST: 'En cours',
      etatAtelier: 'En attente', etatPliage: 'Non commencé', etatFrange: 'Terminé',
      qtePrete: 5, priorite: 'Normale', delai: '2025-11-01',
    },
    {
      id: 'C2025-002', client: 'CLIENT B', ref: 'REF-002', modele: 'Tapis Kilim',
      dimensions: '150x200', qteTotale: 50,
      etatTissage: 'Terminé', etatCoupe: 'Terminé', etatST: 'Terminé',
      etatAtelier: 'En cours', etatPliage: 'En attente', etatFrange: 'En attente',
      qtePrete: 0, priorite: 'Urgente', delai: '2025-10-25',
    },
    {
      id: 'C2025-003', client: 'CLIENT C', ref: 'REF-003', modele: 'Jeté Traditionnel',
      dimensions: '180x250', qteTotale: 75,
      etatTissage: 'En cours', etatCoupe: 'En attente', etatST: 'Non commencé',
      etatAtelier: 'Non commencé', etatPliage: 'Non commencé', etatFrange: 'N/A',
      qtePrete: 0, priorite: 'Normale', delai: '2025-11-10',
    },
  ];

  const [colis] = useState<Colis[]>([
    {
      numColis: 'COLIS-001', qrCode: 'QR-COL-001',
      articles: [
        { suivis: 'SUIVIS-001', commande: 'C2025-001', ref: 'REF-001', modele: 'Tapis Berbère', qte: 3 },
        { suivis: 'SUIVIS-002', commande: 'C2025-001', ref: 'REF-001', modele: 'Tapis Berbère', qte: 2 },
      ],
      poids: 25.5, dimensions: '80x60x40', palette: 'PAL-001',
      statut: 'Validé', operateur: 'OP-001',
    },
    {
      numColis: 'COLIS-002', qrCode: 'QR-COL-002',
      articles: [
        { suivis: 'SUIVIS-010', commande: 'C2025-002', ref: 'REF-002', modele: 'Tapis Kilim', qte: 5 },
        { suivis: 'SUIVIS-011', commande: 'C2025-003', ref: 'REF-003', modele: 'Jeté', qte: 3 },
      ],
      poids: 18.3, dimensions: '70x50x35', palette: 'PAL-002',
      statut: 'En cours', operateur: 'OP-002',
    },
  ]);

  const fournitures: Fourniture[] = [
    { id: 'FOUR-001', type: 'Étiquette', ref: 'ETI-001', libelle: 'Étiquettes adhésives 10x5cm', stock: 5000, min: 2000, max: 10000, unite: 'Pcs', statut: 'OK', valeur: 250 },
    { id: 'FOUR-003', type: 'Sachet', ref: 'SAC-001', libelle: 'Sachet plastique transparent', stock: 800, min: 1000, max: 5000, unite: 'Pcs', statut: 'Alerte', valeur: 64 },
    { id: 'FOUR-005', type: 'Film', ref: 'FIL-001', libelle: 'Film étirable transparent', stock: 10, min: 15, max: 50, unite: 'Rouleaux', statut: 'Alerte', valeur: 150 },
  ];

  const [demandesPliage] = useState<DemandePliage[]>([
    { id: 'DP-2025-001', date: '2025-10-19', commande: 'C2025-002', ref: 'REF-002', modele: 'Tapis Kilim', qte: 50, priorite: 'Urgente', statut: 'En attente', demandeur: 'Magasinier PF' },
  ]);

  const [demandesRetourFrange] = useState<DemandeRetourFrange[]>([
    { id: 'DRF-2025-001', date: '2025-10-19', commande: 'C2025-002', ref: 'REF-002', modele: 'Tapis Kilim', qte: 45, priorite: 'Urgente', statut: 'En attente', demandeur: 'Magasinier PF', observation: 'Frange mal coupée' },
  ]);

  const nbAlertesFourn = fournitures.filter((f) => f.statut === 'Alerte').length;

  const renderTabButton = (t: (typeof TABS)[number]) => {
    const isActive = activeTab === t.id;
    const Icon = t.icon;
    return (
      <button
        key={t.id}
        onClick={() => setActiveTab(t.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--s-2)',
          padding: 'var(--s-2) var(--s-4)',
          borderRadius: 'var(--radius-full)',
          background: isActive ? 'var(--accent-terracotta)' : 'transparent',
          color: isActive ? '#FBF8F3' : 'var(--fg-secondary)',
          border: `1px solid ${isActive ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all var(--duration) var(--ease)',
        }}
      >
        <Icon size={16} />
        {t.label}
      </button>
    );
  };

  return (
    <DashboardShell
      eyebrow="Poste — Magasinier stock produit fini"
      title="Magasin Produit Fini"
      subtitle="Gestion complète des produits finis, fournitures, demandes de pliage et retours frange."
      headerRight={
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              paddingRight: 'var(--s-3)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Date
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--fg-primary)',
              }}
            >
              19 Oct 2025
            </div>
          </div>
          <ThemeToggle />
        </>
      }
    >
      {/* KPI ROW */}
      <div className="lp-metric-grid">
        <KpiCard label="Commandes" value={commandes.length} hint="En suivi" icon={<Box size={18} />} tone="terracotta" />
        <KpiCard label="Colis" value={colis.length} hint="Créés" icon={<Package size={18} />} tone="indigo" />
        <KpiCard
          label="Fournitures"
          value={fournitures.length}
          hint={`${nbAlertesFourn} alerte${nbAlertesFourn > 1 ? 's' : ''}`}
          icon={<ShoppingCart size={18} />}
          tone={nbAlertesFourn > 0 ? 'terracotta' : 'sage'}
        />
        <KpiCard label="Pliage" value={demandesPliage.length} hint="En attente" icon={<Scissors size={18} />} tone="gold" />
        <KpiCard label="Retour Frange" value={demandesRetourFrange.length} hint="Urgent" icon={<RefreshCw size={18} />} tone="rose" />
      </div>

      {/* TABS */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--s-3)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--s-2)',
          overflowX: 'auto',
        }}
      >
        {TABS.map(renderTabButton)}
      </div>

      {/* CONTENT */}
      {activeTab === 'commandes' && (
        <SectionCard
          title="Liste des commandes avec états"
          subtitle="Progression détaillée par étape de fabrication"
          icon={<Package size={16} />}
          actions={
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              style={{
                ...inputStyle,
                width: 'auto',
                padding: '6px 12px',
                fontSize: 'var(--text-xs)',
              }}
            >
              <option value="tous">Tous les états</option>
              <option value="urgent">Urgentes uniquement</option>
              <option value="bloquee">Bloquées</option>
            </select>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {commandes.map((cmd) => (
              <div
                key={cmd.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `4px solid ${cmd.priorite === 'Urgente' ? 'var(--accent-terracotta)' : 'var(--accent-indigo)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--s-5)',
                  background: 'var(--bg-elevated)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-4)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-2)', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'var(--text-lg)',
                          fontWeight: 700,
                          color: 'var(--fg-primary)',
                        }}
                      >
                        {cmd.id}
                      </span>
                      <span style={prioriteToken(cmd.priorite)}>{cmd.priorite}</span>
                      <span style={{ color: 'var(--fg-muted)' }}>·</span>
                      <span style={{ fontWeight: 500, color: 'var(--fg-secondary)' }}>{cmd.client}</span>
                    </div>
                    <div style={{ color: 'var(--fg-secondary)', marginBottom: 'var(--s-3)', fontSize: 'var(--text-sm)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{cmd.modele}</span> — {cmd.dimensions} — {cmd.ref}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--s-3)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-secondary)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>
                        Quantité totale :{' '}
                        <strong style={{ color: 'var(--fg-primary)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                          {cmd.qteTotale}
                        </strong>
                      </span>
                      <span style={{ color: 'var(--fg-muted)' }}>|</span>
                      <span>
                        Prête :{' '}
                        <strong style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                          {cmd.qtePrete}
                        </strong>
                      </span>
                      <span style={{ color: 'var(--fg-muted)' }}>|</span>
                      <span>
                        Délai :{' '}
                        <strong style={{ color: 'var(--fg-primary)', fontFamily: 'var(--font-mono)' }}>{cmd.delai}</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                    <button
                      onClick={() => setShowDemandePliage(true)}
                      style={btnAccent('var(--accent-gold)')}
                    >
                      <Scissors size={14} />
                      Demander pliage
                    </button>
                    <button
                      onClick={() => setShowDemandeRetourFrange(true)}
                      style={btnAccent('var(--color-danger)')}
                    >
                      <RefreshCw size={14} />
                      Retour frange
                    </button>
                  </div>
                </div>

                {/* États détaillés */}
                <div
                  style={{
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--s-4)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--fg-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--s-3)',
                    }}
                  >
                    États de progression
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 'var(--s-3)',
                    }}
                  >
                    {[
                      { l: 'Tissage', v: cmd.etatTissage },
                      { l: 'Coupe', v: cmd.etatCoupe },
                      { l: 'Sous-Traitance', v: cmd.etatST },
                      { l: 'Atelier', v: cmd.etatAtelier },
                      { l: 'Pliage', v: cmd.etatPliage },
                      { l: 'Frange', v: cmd.etatFrange },
                    ].map((step) => (
                      <div key={step.l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginBottom: 4 }}>
                          {step.l}
                        </div>
                        <span style={etatToken(step.v)}>{step.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 'colis' && (
        <SectionCard
          title="Gestion des colis multi-articles"
          subtitle="Groupement, palette, poids et scan"
          icon={<Box size={16} />}
          actions={
            <button onClick={() => setShowNewColis(!showNewColis)} style={btnPrimary}>
              <PlusCircle size={14} />
              Nouveau colis
            </button>
          }
        >
          {showNewColis && (
            <div
              style={{
                background: 'var(--color-info-bg)',
                border: '1px solid var(--color-info)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--s-5)',
                marginBottom: 'var(--s-5)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--fg-primary)',
                  margin: 0,
                  marginBottom: 'var(--s-4)',
                }}
              >
                Création d'un nouveau colis
              </h3>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--s-4)',
                  marginBottom: 'var(--s-4)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ ...labelStyle, marginBottom: 'var(--s-3)' }}>
                  Scannez les étiquettes des articles à inclure
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}>
                  <input type="text" placeholder="QR Suivis" style={inputStyle} />
                  <input type="number" placeholder="Quantité" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                  <button style={btnAccent('var(--accent-sage)')}>
                    <PlusCircle size={14} /> Ajouter
                  </button>
                </div>
                <div
                  style={{
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--s-3)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Articles ajoutés (0)
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                    Aucun article ajouté
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
                <div>
                  <label style={labelStyle}>Poids (kg)</label>
                  <input type="number" step="0.1" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
                <div>
                  <label style={labelStyle}>Dimensions</label>
                  <input type="text" placeholder="LxlxH" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Palette</label>
                  <input type="text" placeholder="PAL-XXX" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
                <button style={btnPrimary}>
                  <CheckCircle size={14} /> Créer colis
                </button>
                <button style={btnGhost}>
                  <Camera size={14} /> Photo
                </button>
                <button onClick={() => setShowNewColis(false)} style={btnGhost}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {colis.map((col) => (
              <div
                key={col.numColis}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '4px solid var(--accent-indigo)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--s-5)',
                  background: 'var(--bg-elevated)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-4)', flexWrap: 'wrap', gap: 'var(--s-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                    <div
                      style={{
                        background: 'color-mix(in srgb, var(--accent-indigo) 12%, transparent)',
                        color: 'var(--accent-indigo)',
                        padding: 'var(--s-3)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box size={24} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>
                        {col.numColis}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                        QR : {col.qrCode}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                    <span style={statutToken(col.statut)}>{col.statut}</span>
                    <button style={btnIconGhost} title="Photo">
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--s-4)',
                    marginBottom: 'var(--s-3)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--fg-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--s-3)',
                    }}
                  >
                    Articles dans ce colis ({col.articles.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                    {col.articles.map((art, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-sm)',
                          padding: 'var(--s-3)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)',
                          gap: 'var(--s-3)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                              {art.suivis}
                            </span>
                            <span style={{ color: 'var(--fg-muted)' }}>|</span>
                            <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{art.modele}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>({art.ref})</span>
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 2 }}>
                            Commande : {art.commande}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontVariantNumeric: 'tabular-nums',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 700,
                            color: 'var(--fg-primary)',
                          }}
                        >
                          Qté : {art.qte}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s-3)', fontSize: 'var(--text-sm)' }}>
                  {[
                    { l: 'Poids', v: `${col.poids} kg`, mono: true },
                    { l: 'Dimensions', v: col.dimensions, mono: false },
                    { l: 'Palette', v: col.palette, mono: false },
                    { l: 'Opérateur', v: col.operateur, mono: false },
                  ].map((f) => (
                    <div key={f.l}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                        {f.l}
                      </div>
                      <div
                        style={{
                          color: 'var(--fg-primary)',
                          fontWeight: 600,
                          fontFamily: f.mono ? 'var(--font-mono)' : 'inherit',
                        }}
                      >
                        {f.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 'pliage' && (
        <SectionCard
          title="Demandes de pliage urgent"
          subtitle="Interventions à programmer côté atelier"
          icon={<Scissors size={16} />}
          actions={
            <button onClick={() => setShowDemandePliage(!showDemandePliage)} style={btnAccent('var(--accent-gold)')}>
              <PlusCircle size={14} /> Nouvelle demande
            </button>
          }
        >
          {showDemandePliage && (
            <div
              style={{
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--s-5)',
                marginBottom: 'var(--s-5)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--fg-primary)',
                  margin: 0,
                  marginBottom: 'var(--s-4)',
                }}
              >
                Nouvelle demande de pliage
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
                <div>
                  <label style={labelStyle}>Commande</label>
                  <select style={inputStyle}>
                    <option>Sélectionner une commande</option>
                    {commandes.map((cmd) => (
                      <option key={cmd.id} value={cmd.id}>
                        {cmd.id} - {cmd.modele}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Quantité</label>
                  <input type="number" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
                <div>
                  <label style={labelStyle}>Priorité</label>
                  <select style={inputStyle}>
                    <option>Urgente</option>
                    <option>Normale</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date limite</label>
                  <input type="date" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
              </div>
              <div style={{ marginBottom: 'var(--s-4)' }}>
                <label style={labelStyle}>Observations</label>
                <textarea style={inputStyle} rows={2} placeholder="Instructions spéciales..." />
              </div>
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
                <button style={btnAccent('var(--accent-gold)')}>
                  <Send size={14} /> Envoyer au chef d'atelier
                </button>
                <button onClick={() => setShowDemandePliage(false)} style={btnGhost}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {demandesPliage.map((dp) => (
              <div
                key={dp.id}
                style={{
                  background: 'var(--color-warning-bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--s-4)',
                  borderLeft: '4px solid var(--accent-gold)',
                  border: '1px solid var(--border-subtle)',
                  borderLeftWidth: 4,
                  borderLeftColor: 'var(--accent-gold)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-2)', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fg-primary)' }}>{dp.id}</span>
                      <span style={prioriteToken(dp.priorite)}>{dp.priorite}</span>
                      <span style={statutToken(dp.statut)}>{dp.statut}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                        {dp.date}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s-3)', marginBottom: 'var(--s-2)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Commande
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{dp.commande}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Modèle
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{dp.modele}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Quantité
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 700,
                            fontSize: 'var(--text-lg)',
                            color: 'var(--accent-indigo)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {dp.qte}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                      Demandeur : {dp.demandeur}
                    </div>
                  </div>
                  <button style={btnIconGhost} title="Traiter">
                    <Scissors size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 'frange' && (
        <SectionCard
          title="Demandes de retour frange"
          subtitle="Retours pour défaut de frange — traitement prioritaire"
          icon={<RefreshCw size={16} />}
          actions={
            <button
              onClick={() => setShowDemandeRetourFrange(!showDemandeRetourFrange)}
              style={btnAccent('var(--color-danger)')}
            >
              <PlusCircle size={14} /> Nouvelle demande
            </button>
          }
        >
          {showDemandeRetourFrange && (
            <div
              style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--s-5)',
                marginBottom: 'var(--s-5)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--fg-primary)',
                  margin: 0,
                  marginBottom: 'var(--s-4)',
                }}
              >
                Nouvelle demande de retour frange
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
                <div>
                  <label style={labelStyle}>Commande</label>
                  <select style={inputStyle}>
                    <option>Sélectionner une commande</option>
                    {commandes.map((cmd) => (
                      <option key={cmd.id} value={cmd.id}>
                        {cmd.id} - {cmd.modele}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Quantité concernée</label>
                  <input type="number" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Motif du retour</label>
                  <select style={inputStyle}>
                    <option>Frange mal coupée</option>
                    <option>Frange trop courte</option>
                    <option>Frange irrégulière</option>
                    <option>Autre défaut</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 'var(--s-4)' }}>
                <label style={labelStyle}>Observations détaillées</label>
                <textarea style={inputStyle} rows={3} placeholder="Décrivez le problème..." />
              </div>
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
                <button style={btnAccent('var(--color-danger)')}>
                  <Send size={14} /> Envoyer demande urgente
                </button>
                <button style={btnGhost}>
                  <Camera size={14} /> Ajouter photo
                </button>
                <button onClick={() => setShowDemandeRetourFrange(false)} style={btnGhost}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {demandesRetourFrange.map((drf) => (
              <div
                key={drf.id}
                style={{
                  background: 'var(--color-danger-bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--s-4)',
                  borderLeft: '4px solid var(--color-danger)',
                  border: '1px solid var(--border-subtle)',
                  borderLeftWidth: 4,
                  borderLeftColor: 'var(--color-danger)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-2)', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fg-primary)' }}>{drf.id}</span>
                      <span style={prioriteToken(drf.priorite)}>{drf.priorite}</span>
                      <span style={statutToken(drf.statut)}>{drf.statut}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                        {drf.date}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Commande
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{drf.commande}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Modèle
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{drf.modele}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Quantité
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 700,
                            fontSize: 'var(--text-lg)',
                            color: 'var(--color-danger)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {drf.qte}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--s-3)',
                        border: '1px solid var(--color-danger)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 4 }}>
                        <AlertCircle size={14} style={{ color: 'var(--color-danger)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>
                          Observation
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>{drf.observation}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                    <button style={btnIconGhost} title="Traiter">
                      <RefreshCw size={16} />
                    </button>
                    <button style={btnIconGhost} title="Photo">
                      <Camera size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === 'fournitures' && (
        <SectionCard
          title="Stock fournitures"
          subtitle="Niveaux, alertes et valorisation"
          icon={<ShoppingCart size={16} />}
          actions={
            <button style={btnPrimary}>
              <Camera size={14} /> Prendre photo
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {fournitures.map((four) => {
              const alerte = four.stock < four.min;
              return (
                <div
                  key={four.id}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${alerte ? 'var(--color-danger)' : 'var(--accent-sage)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--s-4)',
                    background: 'var(--bg-elevated)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-2)', flexWrap: 'wrap' }}>
                        <span style={statutToken(four.statut)}>{four.statut}</span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fg-primary)' }}>{four.ref}</span>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>— {four.type}</span>
                      </div>
                      <div style={{ color: 'var(--fg-secondary)', marginBottom: 'var(--s-2)' }}>{four.libelle}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-5)', fontSize: 'var(--text-sm)', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ color: 'var(--fg-muted)' }}>Stock : </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 700,
                              color: alerte ? 'var(--color-danger)' : 'var(--color-success)',
                            }}
                          >
                            {four.stock} {four.unite}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--fg-muted)' }}>Min : </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg-primary)' }}>{four.min}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--fg-muted)' }}>Valeur : </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
                            {four.valeur} DT
                          </span>
                        </div>
                      </div>
                    </div>
                    {four.statut === 'Alerte' && (
                      <button onClick={() => setShowDemandeAchat(true)} style={btnAccent('var(--color-danger)')}>
                        <ShoppingCart size={14} /> Commander
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {activeTab === 'achats' && (
        <SectionCard
          title="Demandes d'achat fournitures"
          subtitle="Réapprovisionnement du magasin PF"
          icon={<FileText size={16} />}
          actions={
            <button onClick={() => setShowDemandeAchat(!showDemandeAchat)} style={btnAccent('var(--accent-sage)')}>
              <PlusCircle size={14} /> Nouvelle demande
            </button>
          }
        >
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--s-12) var(--s-6)',
              color: 'var(--fg-muted)',
              fontStyle: 'italic',
              fontSize: 'var(--text-sm)',
            }}
          >
            Formulaire de demandes d'achat…
          </div>
        </SectionCard>
      )}

      {activeTab === 'interventions' && (
        <SectionCard
          title="Demandes d'intervention"
          subtitle="Maintenance et interventions techniques"
          icon={<Wrench size={16} />}
          actions={
            <button onClick={() => setShowDemandeIntervention(!showDemandeIntervention)} style={btnAccent('var(--accent-gold)')}>
              <PlusCircle size={14} /> Nouvelle intervention
            </button>
          }
        >
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--s-12) var(--s-6)',
              color: 'var(--fg-muted)',
              fontStyle: 'italic',
              fontSize: 'var(--text-sm)',
            }}
          >
            Formulaire de demandes d'intervention…
          </div>
        </SectionCard>
      )}
    </DashboardShell>
  );
};

export default TableauBordMagasinPF;
