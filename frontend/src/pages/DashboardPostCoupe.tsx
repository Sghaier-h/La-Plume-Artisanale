import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Scissors, Calendar, Printer, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, Users } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

const DashboardPostCoupe: React.FC = () => {
  const [loading] = useState(false);

  // Planning en cours (OF à couper)
  const [planningEnCours] = useState([
    { numSousOF: 'OF246533', modele: 'MARINIERE', client: 'CL00296', qteAFabriquer: 50, statut: 'Fin Fabrication', tisseur: 'Badie', dateTissage: '2025-10-18 14:30', urgence: false },
    { numSousOF: 'CA250469', modele: 'FIL A FIL', client: 'All by Fouta', qteAFabriquer: 40, statut: 'En cours tissage', tisseur: 'Dimatex', dateTissage: '2025-10-18 10:15', urgence: false },
    { numSousOF: 'OF247821', modele: 'ST TROPEZ', client: 'CL00458', qteAFabriquer: 100, statut: 'Fin Poste', tisseur: 'Zied', dateTissage: '2025-10-18 16:00', urgence: true },
    { numSousOF: 'CA250023', modele: 'UNI SURPIQUE', client: 'All by Fouta', qteAFabriquer: 20, statut: 'Fin Fabrication', tisseur: 'Badie', dateTissage: '2025-10-18 09:00', urgence: false },
  ]);

  // Données historiques pour l'analyse
  const dataOperateurs = [
    { personne: 'Ahmed', operations: 95, premiere: 3200, deuxieme: 28, dechets: 85, ourlet: 12 },
    { personne: 'Karim', operations: 78, premiere: 2850, deuxieme: 45, dechets: 52, ourlet: 8 },
    { personne: 'Salim', operations: 68, premiere: 2480, deuxieme: 38, dechets: 48, ourlet: 5 },
    { personne: 'Nabil', operations: 38, premiere: 1486, deuxieme: 58, dechets: 41, ourlet: 4 },
  ];

  // Historique des saisies
  const [saisiesHistorique] = useState<any[]>([
    { id: 1, date: '2025-10-18', numSousOF: 'OF246533', modele: 'MARINIERE', qteFabriquee: 46, qteDeuxieme: 2, qteDechet: 1, coupeur: 'Ahmed', statut: 'Validé' },
    { id: 2, date: '2025-10-18', numSousOF: 'CA250469', modele: 'FIL A FIL', qteFabriquee: 38, qteDeuxieme: 0, qteDechet: 0, coupeur: 'Karim', statut: 'Validé' },
    { id: 3, date: '2025-10-18', numSousOF: 'CA250023', modele: 'UNI SURPIQUE', qteFabriquee: 15, qteDeuxieme: 0, qteDechet: 0, coupeur: 'Ahmed', statut: 'En cours' },
  ]);

  const [etiquettesEnAttente] = useState<any[]>([]);

  const totalPremiere = dataOperateurs.reduce((s, o) => s + o.premiere, 0);
  const totalDeuxieme = dataOperateurs.reduce((s, o) => s + o.deuxieme, 0);
  const totalDechets = dataOperateurs.reduce((s, o) => s + o.dechets, 0);
  const totalProd = totalPremiere + totalDeuxieme + totalDechets;
  const tauxDeuxieme = totalProd ? ((totalDeuxieme / totalProd) * 100).toFixed(2) : '0';
  const tauxDechets = totalProd ? ((totalDechets / totalProd) * 100).toFixed(2) : '0';
  const rendement = totalProd ? ((totalPremiere / totalProd) * 100).toFixed(1) : '0';

  const pretsACouper = planningEnCours.filter((of) => of.statut === 'Fin Fabrication').length;
  const enTissage = planningEnCours.filter((of) => of.statut === 'En cours tissage').length;
  const totalPieces = planningEnCours.reduce((sum, of) => sum + of.qteAFabriquer, 0);
  const ofsUrgents = planningEnCours.filter((of) => of.urgence).length;

  const statutBadge = (statut: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      'Fin Fabrication': { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
      'En cours tissage': { bg: 'var(--color-info-bg)', c: 'var(--color-info)' },
      'Fin Poste': { bg: 'var(--color-warning-bg)', c: 'var(--color-warning)' },
      'Validé': { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
      'En cours': { bg: 'var(--color-info-bg)', c: 'var(--color-info)' },
    };
    const b = map[statut] || { bg: 'var(--bg-hover)', c: 'var(--fg-secondary)' };
    return <span style={{ ...badgeBase, background: b.bg, color: b.c }}>{statut}</span>;
  };

  return (
    <>
      <DashboardShell
        eyebrow="Poste — Coupe"
        title="Tableau de bord — Poste coupe"
        subtitle="Suivi des opérations de coupe, planning et rendement matière."
        headerRight={
          <>
            <button onClick={() => window.location.reload()} style={btnGhost} title="Actualiser">
              <Activity size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Prêts à couper" value={pretsACouper} hint={`${ofsUrgents} urgent(s)`} icon={<Scissors size={18} />} tone="gold" loading={loading} />
          <KpiCard label="En tissage" value={enTissage} hint="OF en préparation" icon={<Clock size={18} />} tone="indigo" loading={loading} />
          <KpiCard label="Pièces planifiées" value={totalPieces} hint="Total à couper" icon={<Calendar size={18} />} tone="brown" loading={loading} />
          <KpiCard label="Étiquettes en attente" value={etiquettesEnAttente.length} hint="File d'impression" icon={<Printer size={18} />} tone="terracotta" loading={loading} />
        </div>

        <div className="lp-metric-grid">
          <KpiCard label="Production 1er choix" value={totalPremiere.toLocaleString('fr-FR')} hint="Cumul période" icon={<CheckCircle size={16} />} tone="sage" loading={loading} />
          <KpiCard label="Taux 2ème choix" value={`${tauxDeuxieme}%`} icon={<AlertTriangle size={16} />} tone="rose" loading={loading} />
          <KpiCard label="Taux déchets" value={`${tauxDechets}%`} icon={<AlertTriangle size={16} />} tone="terracotta" loading={loading} />
          <KpiCard label="Rendement moyen" value={`${rendement}%`} icon={<TrendingUp size={16} />} tone="gold" loading={loading} />
        </div>

        <div className="lp-grid-2">
          <SectionCard title="Planning en cours" subtitle="OF à couper dans les heures qui suivent" icon={<Calendar size={16} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              {planningEnCours.map((of, idx) => (
                <div key={idx} style={{ padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${of.urgence ? 'var(--color-danger)' : of.statut === 'Fin Fabrication' ? 'var(--color-success)' : of.statut === 'Fin Poste' ? 'var(--color-warning)' : 'var(--color-info)'}`, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{of.numSousOF}</strong>
                      {statutBadge(of.statut)}
                      {of.urgence && <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>Urgent</span>}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {of.dateTissage}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--s-2)', fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                    <div><span style={{ color: 'var(--fg-muted)' }}>Modèle:</span> <strong style={{ color: 'var(--fg-primary)' }}>{of.modele}</strong></div>
                    <div><span style={{ color: 'var(--fg-muted)' }}>Client:</span> {of.client}</div>
                    <div><span style={{ color: 'var(--fg-muted)' }}>Qté:</span> <strong style={{ color: 'var(--fg-primary)' }}>{of.qteAFabriquer}</strong></div>
                    <div><span style={{ color: 'var(--fg-muted)' }}>Tisseur:</span> {of.tisseur}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Performance par coupeur" subtitle="Volumes cumulés" icon={<Users size={16} />}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataOperateurs}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="personne" tick={{ fill: 'var(--fg-muted)', fontSize: 12 }} stroke="var(--border-subtle)" />
                <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 12 }} stroke="var(--border-subtle)" />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)' }} />
                <Legend wrapperStyle={{ color: 'var(--fg-secondary)', fontSize: 12 }} />
                <Bar dataKey="premiere" name="1er choix" fill="var(--accent-sage)" />
                <Bar dataKey="deuxieme" name="2ème choix" fill="var(--accent-gold)" />
                <Bar dataKey="dechets" name="Déchets" fill="var(--accent-terracotta)" />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <SectionCard title="Historique des saisies" subtitle="Contrôle et correction" icon={<Scissors size={16} />}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)' }}>
                  {['Date', 'Num Sous OF', 'Modèle', '1er choix', '2ème choix', 'Déchets', 'Coupeur', 'Statut'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {saisiesHistorique.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>{item.date}</td>
                    <td style={tdStyle}><strong style={{ color: 'var(--fg-primary)' }}>{item.numSousOF}</strong></td>
                    <td style={tdStyle}>{item.modele}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-success)', fontWeight: 600 }}>{item.qteFabriquee}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-warning)', fontWeight: 600 }}>{item.qteDeuxieme}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-danger)', fontWeight: 600 }}>{item.qteDechet}</td>
                    <td style={tdStyle}>{item.coupeur}</td>
                    <td style={tdStyle}>{statutBadge(item.statut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </DashboardShell>
    </>
  );
};

const badgeBase: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3) var(--s-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', color: 'var(--fg-primary)' };

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-gold)', color: '#fff', border: '1px solid var(--accent-gold)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _btnPrimary = btnPrimary;

export default DashboardPostCoupe;
