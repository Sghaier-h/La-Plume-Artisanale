import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingCart, FileText, Receipt, Factory, Wrench, ShieldCheck, Feather,
  ArrowUpRight, Calendar, TrendingUp, Activity,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { useDashboardKpis } from '../hooks/useDashboardKpis';

const fmtInt = (v: string | number | undefined) => {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString('fr-FR');
};
const fmtMoney = (v: string | number | undefined) => {
  const n = Number(v ?? 0);
  if (isNaN(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(0);
};

const DashboardAdministrateur: React.FC = () => {
  const navigate = useNavigate();
  const { kpis, loading, refresh } = useDashboardKpis();

  // Derived data
  const clientsActifs = fmtInt(kpis?.clients?.total_actifs);
  const nbClients = kpis?.clients?.clients ?? '0';
  const nbProspects = kpis?.clients?.prospects ?? '0';
  const commandesTotal = fmtInt(kpis?.commandes?.total);
  const commandesAttente = kpis?.commandes?.en_attente ?? '0';
  const caTotal = fmtMoney(kpis?.factures?.ca_total);
  const caRestant = fmtMoney(kpis?.factures?.montant_restant);
  const ofTotal = fmtInt(kpis?.ordres_fabrication?.total);
  const ofEnCours = kpis?.ordres_fabrication?.en_cours ?? '0';
  const machinesTotal = fmtInt(kpis?.machines?.total_actives);
  const machinesOp = kpis?.machines?.operationnelles ?? '0';
  const devisTotal = fmtInt(kpis?.devis?.total);
  const devisTransformes = kpis?.devis?.transformes ?? '0';
  const facturesTotal = fmtInt(kpis?.factures?.total);
  const facturesPayees = kpis?.factures?.payees ?? '0';

  // Mock chart series — replace with real endpoint data when available
  const ventesData = [
    { mois: 'Mai', ca: 2400 }, { mois: 'Juin', ca: 2800 }, { mois: 'Juil', ca: 3100 },
    { mois: 'Août', ca: 2900 }, { mois: 'Sep', ca: 3400 }, { mois: 'Oct', ca: 3200 },
  ];
  const productionData = [
    { jour: 'L', of: 4, termines: 3 }, { jour: 'M', of: 6, termines: 5 },
    { jour: 'M', of: 5, termines: 4 }, { jour: 'J', of: 7, termines: 6 },
    { jour: 'V', of: 8, termines: 6 }, { jour: 'S', of: 3, termines: 3 },
  ];
  const repartitionPoste = [
    { name: 'Tissage', value: 42, color: 'var(--accent-terracotta)' },
    { name: 'Coupe',   value: 28, color: 'var(--accent-gold)' },
    { name: 'Qualité', value: 18, color: 'var(--accent-sage)' },
    { name: 'Magasin', value: 12, color: 'var(--accent-indigo)' },
  ];

  return (
    <DashboardLayout
      title="Dashboard Administrateur"
      activeSection="dashboard"
      onSectionChange={() => {}}
    >
      <DashboardShell
        eyebrow="Vue d'ensemble"
        title="Tableau de bord — Administrateur"
        subtitle="Suivi opérationnel de La Plume Artisanale — ventes, production, atelier et qualité."
        headerRight={
          <>
            <button
              onClick={refresh}
              style={btnGhost}
              title="Actualiser les données"
            >
              <Activity size={14} /> Actualiser
            </button>
            <button
              onClick={() => navigate('/reports')}
              style={btnPrimary}
            >
              <TrendingUp size={14} /> Rapports détaillés
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* PRIMARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Clients actifs"
            value={clientsActifs}
            hint={`${nbClients} clients · ${nbProspects} prospects`}
            icon={<Users size={18} />}
            tone="terracotta"
            loading={loading}
            onClick={() => navigate('/clients')}
          />
          <KpiCard
            label="Commandes"
            value={commandesTotal}
            hint={`${commandesAttente} en attente`}
            icon={<ShoppingCart size={18} />}
            tone="gold"
            loading={loading}
            onClick={() => navigate('/commandes')}
          />
          <KpiCard
            label="CA total"
            value={caTotal}
            unit="DT"
            hint={`${caRestant} DT restants à encaisser`}
            icon={<Receipt size={18} />}
            tone="sage"
            loading={loading}
          />
          <KpiCard
            label="OF en cours"
            value={ofTotal}
            hint={`${ofEnCours} en fabrication`}
            icon={<Factory size={18} />}
            tone="indigo"
            loading={loading}
            onClick={() => navigate('/of')}
          />
        </div>

        {/* SECONDARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Devis"
            value={devisTotal}
            hint={`${devisTransformes} transformés en commande`}
            icon={<FileText size={16} />}
            tone="rose"
            loading={loading}
            onClick={() => navigate('/devis')}
          />
          <KpiCard
            label="Factures"
            value={facturesTotal}
            hint={`${facturesPayees} payées`}
            icon={<Receipt size={16} />}
            tone="brown"
            loading={loading}
            onClick={() => navigate('/facture')}
          />
          <KpiCard
            label="Machines"
            value={machinesTotal}
            hint={`${machinesOp} opérationnelles`}
            icon={<Wrench size={16} />}
            tone="terracotta"
            loading={loading}
            onClick={() => navigate('/machines')}
          />
          <KpiCard
            label="Qualité"
            value="98%"
            unit="conforme"
            hint="Taux de conformité 30 derniers jours"
            icon={<ShieldCheck size={16} />}
            tone="sage"
            loading={loading}
          />
        </div>

        {/* CHARTS ROW */}
        <div className="lp-grid-3">
          <div style={{ gridColumn: 'span 1' }}>
            <SectionCard
              title="Chiffre d'affaires · 6 mois"
              subtitle="Évolution du CA en kDT"
              icon={<TrendingUp size={16} />}
              actions={
                <button style={btnGhostSm}>
                  <Calendar size={12} /> 6 mois
                </button>
              }
            >
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ventesData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="mois" stroke="var(--fg-muted)" fontSize={11} />
                    <YAxis stroke="var(--fg-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--fg-primary)',
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ca"
                      stroke="var(--accent-terracotta)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--accent-terracotta)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Production hebdomadaire"
            subtitle="OF lancés vs terminés"
            icon={<Factory size={16} />}
          >
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="jour" stroke="var(--fg-muted)" fontSize={11} />
                  <YAxis stroke="var(--fg-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="of" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="termines" fill="var(--accent-sage)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Répartition par poste"
            subtitle="Charge de travail actuelle"
            icon={<Activity size={16} />}
          >
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repartitionPoste}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {repartitionPoste.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="var(--bg-elevated)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
              {repartitionPoste.map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: p.color, display: 'inline-block' }} />
                  {p.name} <strong style={{ color: 'var(--fg-primary)' }}>{p.value}%</strong>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* QUICK ACTIONS */}
        <SectionCard
          title="Accès rapides"
          subtitle="Naviguez vers les modules principaux"
          icon={<Feather size={16} />}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 'var(--s-3)',
            }}
          >
            {[
              { label: 'Catalogue articles', path: '/articles-catalogue', tone: 'terracotta' },
              { label: 'Commandes', path: '/commandes', tone: 'gold' },
              { label: 'Ordres de fabrication', path: '/of', tone: 'indigo' },
              { label: 'Stock', path: '/stock', tone: 'sage' },
              { label: 'Clients', path: '/clients', tone: 'rose' },
              { label: 'Factures', path: '/facture', tone: 'brown' },
            ].map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--s-4)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--fg-primary)',
                  fontWeight: 500,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--duration) var(--ease)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
                  (e.currentTarget as HTMLButtonElement).style.transform = '';
                }}
              >
                {a.label}
                <ArrowUpRight size={14} style={{ color: 'var(--fg-muted)' }} />
              </button>
            ))}
          </div>
        </SectionCard>
      </DashboardShell>
    </DashboardLayout>
  );
};

// Reusable button styles
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--accent-terracotta)',
  color: '#fff',
  border: '1px solid var(--accent-terracotta)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
};

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

const btnGhostSm: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  background: 'var(--bg-hover)',
  color: 'var(--fg-muted)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-full)',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
};

export default DashboardAdministrateur;
