import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingCart, Receipt, FileText, Factory, Wrench, Package, DollarSign, TrendingUp, Activity,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { useDashboardKpis } from '../hooks/useDashboardKpis';

const fmt = (v: string | number | undefined) => {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString('fr-FR');
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { kpis, loading, refresh } = useDashboardKpis();

  const clientsTotal = fmt(kpis?.clients?.total_actifs);
  const prospects = fmt(kpis?.clients?.prospects);
  const commandesTotal = fmt(kpis?.commandes?.total);
  const commandesAttente = fmt(kpis?.commandes?.en_attente);
  const caTotal = fmt(kpis?.factures?.ca_total);
  const caRestant = fmt(kpis?.factures?.montant_restant);
  const facturesTotal = fmt(kpis?.factures?.total);
  const facturesPayees = fmt(kpis?.factures?.payees);
  const devisTotal = fmt(kpis?.devis?.total);
  const devisTransformes = fmt(kpis?.devis?.transformes);
  const ofTotal = fmt(kpis?.ordres_fabrication?.total);
  const ofEnCours = fmt(kpis?.ordres_fabrication?.en_cours);
  const machinesTotal = fmt(kpis?.machines?.total_actives);
  const machinesOp = fmt(kpis?.machines?.operationnelles);

  const ventesMensuelles = [
    { mois: 'Mai', ca: 2400, obj: 2500 },
    { mois: 'Juin', ca: 2800, obj: 2500 },
    { mois: 'Juil', ca: 3100, obj: 2700 },
    { mois: 'Août', ca: 2900, obj: 2700 },
    { mois: 'Sep', ca: 3400, obj: 3000 },
    { mois: 'Oct', ca: 3200, obj: 3000 },
  ];

  const productionParPoste = [
    { poste: 'Tissage', of: 42, terminés: 36 },
    { poste: 'Coupe', of: 28, terminés: 24 },
    { poste: 'Qualité', of: 18, terminés: 17 },
    { poste: 'Magasin', of: 12, terminés: 12 },
  ];

  return (
    <DashboardShell
      eyebrow="Analytique"
      title="Rapports détaillés"
      subtitle="Vue consolidée des performances : ventes, production, atelier et qualité."
      headerRight={
        <>
          <button onClick={refresh} style={btnGhost} title="Actualiser">
            <Activity size={14} /> Actualiser
          </button>
          <ThemeToggle />
        </>
      }
    >
      {/* KPIs principaux */}
      <div className="lp-metric-grid">
        <KpiCard label="Chiffre d'affaires" value={`${caTotal} TND`} hint={`Restant à encaisser : ${caRestant} TND`} icon={<DollarSign size={18} />} tone="terracotta" loading={loading} />
        <KpiCard label="Clients actifs" value={clientsTotal} hint={`${prospects} prospects`} icon={<Users size={18} />} tone="indigo" loading={loading} onClick={() => navigate('/clients')} />
        <KpiCard label="Commandes" value={commandesTotal} hint={`${commandesAttente} en attente`} icon={<ShoppingCart size={18} />} tone="sage" loading={loading} onClick={() => navigate('/commandes')} />
        <KpiCard label="Factures" value={facturesTotal} hint={`${facturesPayees} payées`} icon={<Receipt size={18} />} tone="gold" loading={loading} onClick={() => navigate('/facture')} />
        <KpiCard label="Devis" value={devisTotal} hint={`${devisTransformes} transformés`} icon={<FileText size={18} />} tone="terracotta" loading={loading} onClick={() => navigate('/devis')} />
        <KpiCard label="Ordres de fabrication" value={ofTotal} hint={`${ofEnCours} en cours`} icon={<Factory size={18} />} tone="indigo" loading={loading} onClick={() => navigate('/of')} />
        <KpiCard label="Machines" value={machinesTotal} hint={`${machinesOp} opérationnelles`} icon={<Wrench size={18} />} tone="sage" loading={loading} onClick={() => navigate('/machines')} />
        <KpiCard label="Stock" value={fmt((kpis as any)?.stock?.total_articles)} hint={`${fmt((kpis as any)?.stock?.ruptures)} ruptures`} icon={<Package size={18} />} tone="gold" loading={loading} onClick={() => navigate('/matieres-premieres')} />
      </div>

      {/* Graphes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--s-4)', marginTop: 'var(--s-6)' }}>
        <SectionCard title="Chiffre d'affaires vs Objectif" subtitle="6 derniers mois (kDT)" icon={<TrendingUp size={16} />}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ventesMensuelles}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="mois" stroke="var(--fg-muted)" fontSize={12} />
              <YAxis stroke="var(--fg-muted)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ca" name="CA réel" stroke="var(--accent-terracotta)" strokeWidth={2} />
              <Line type="monotone" dataKey="obj" name="Objectif" stroke="var(--accent-sage)" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Production par poste" subtitle="OF lancés vs terminés" icon={<Factory size={16} />}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={productionParPoste}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="poste" stroke="var(--fg-muted)" fontSize={12} />
              <YAxis stroke="var(--fg-muted)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="of" name="OF" fill="var(--accent-indigo)" />
              <Bar dataKey="terminés" name="Terminés" fill="var(--accent-sage)" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Raccourcis */}
      <SectionCard title="Explorer" subtitle="Rapports par domaine" icon={<TrendingUp size={16} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-3)' }}>
          <button onClick={() => navigate('/dashboard-commercial')} style={btnLink}><TrendingUp size={16} /> Dashboard commercial</button>
          <button onClick={() => navigate('/couts')} style={btnLink}><DollarSign size={16} /> Analyse des coûts</button>
          <button onClick={() => navigate('/suivi-fabrication')} style={btnLink}><Factory size={16} /> Suivi fabrication</button>
          <button onClick={() => navigate('/qualite-avancee')} style={btnLink}><Activity size={16} /> Qualité</button>
          <button onClick={() => navigate('/maintenance')} style={btnLink}><Wrench size={16} /> Maintenance</button>
          <button onClick={() => navigate('/planification-gantt')} style={btnLink}><Activity size={16} /> Planning Gantt</button>
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
  color: 'var(--fg-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)',
};

const btnLink: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8,
  padding: '12px 16px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
  color: 'var(--fg-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)', textAlign: 'left',
  transition: 'all var(--duration) var(--ease)',
};

export default Reports;
