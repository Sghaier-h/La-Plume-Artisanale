import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle, ShieldCheck, AlertTriangle, ClipboardCheck, TrendingUp, Activity, FileText, X,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

const DashboardControleCentral: React.FC = () => {
  const navigate = useNavigate();
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<{ [key: string]: number }>({});

  // Chart series (mock — swap for API data when available)
  const dataQualiteFab = [
    { name: 'Tissage', contrôles: 28, nonConf: 3 },
    { name: 'Coupe', contrôles: 15, nonConf: 1 },
    { name: 'Atelier', contrôles: 32, nonConf: 2 },
    { name: 'Magasin PF', contrôles: 18, nonConf: 1 },
    { name: 'Entrepôt', contrôles: 12, nonConf: 1 },
  ];

  const dataConformite = [
    { name: 'S-5', taux: 95.2 },
    { name: 'S-4', taux: 95.8 },
    { name: 'S-3', taux: 96.1 },
    { name: 'S-2', taux: 96.4 },
    { name: 'S-1', taux: 96.8 },
    { name: 'S0', taux: 97.1 },
  ];

  const dataSecuriteZones = [
    { subject: 'Tissage', value: 9.1 },
    { subject: 'Coupe', value: 8.5 },
    { subject: 'Atelier', value: 9.5 },
    { subject: 'Magasin MP', value: 9.8 },
    { subject: 'Magasin PF', value: 9.5 },
    { subject: 'Entrepôt', value: 9.3 },
  ];

  const dataIncidents = [
    { name: 'Mai', incidents: 1 }, { name: 'Juin', incidents: 3 },
    { name: 'Juil', incidents: 2 }, { name: 'Août', incidents: 1 },
    { name: 'Sep', incidents: 2 }, { name: 'Oct', incidents: 2 },
  ];

  const controlesRecents = [
    { date: '19/10 14:23', poste: 'Tissage M-01', qr: 'QR-TIS-2025-047', type: 'Conformité matière', statut: 'Conforme', controleur: 'CQ Central' },
    { date: '19/10 13:15', poste: 'Tissage M-05', qr: 'QR-TIS-2025-046', type: 'Densité', statut: 'Non conforme', controleur: 'CQ Central' },
    { date: '19/10 11:40', poste: 'Coupe #3', qr: 'QR-COU-2025-018', type: 'Dimensions', statut: 'Conforme', controleur: 'CQ Central' },
    { date: '19/10 10:12', poste: 'Atelier Finition', qr: 'QR-ATE-2025-091', type: 'Finition visuelle', statut: 'Conforme', controleur: 'CQ Central' },
  ];

  const handleRatingClick = (criterion: string, value: number) => {
    setSelectedRating({ ...selectedRating, [criterion]: value });
  };

  const refresh = () => window.location.reload();

  const statutBadge = (statut: string) => {
    const isOk = statut === 'Conforme';
    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          background: isOk ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
          color: isOk ? 'var(--color-success)' : 'var(--color-danger)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {isOk ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
        {statut}
      </span>
    );
  };

  return (
    <DashboardLayout title="Dashboard Contrôle Qualité" activeSection="dashboard" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Poste — Contrôle qualité"
        title="Tableau de bord — Contrôle qualité"
        subtitle="Supervision des contrôles, non-conformités et taux de conformité."
        headerRight={
          <>
            <button onClick={refresh} style={btnGhost} title="Actualiser les données">
              <Activity size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* PRIMARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Taux de conformité"
            value="96.8%"
            hint="30 derniers jours"
            icon={<ShieldCheck size={18} />}
            tone="sage"
          />
          <KpiCard
            label="Contrôles du jour"
            value={47}
            hint="Effectués aujourd'hui"
            icon={<ClipboardCheck size={18} />}
            tone="indigo"
          />
          <KpiCard
            label="Non-conformités"
            value={8}
            hint="En attente de correction"
            icon={<AlertTriangle size={18} />}
            tone="terracotta"
          />
          <KpiCard
            label="Jours sans incident"
            value={247}
            hint="Objectif : 365 jours"
            icon={<CheckCircle size={18} />}
            tone="gold"
          />
        </div>

        {/* SECONDARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Conformité sécurité"
            value="97%"
            hint="Taux global"
            icon={<ShieldCheck size={16} />}
            tone="sage"
          />
          <KpiCard
            label="Propreté zones"
            value="9.2/10"
            hint="Note moyenne"
            icon={<CheckCircle size={16} />}
            tone="rose"
          />
          <KpiCard
            label="Incidents mois"
            value={2}
            hint="Sécurité & environnement"
            icon={<AlertTriangle size={16} />}
            tone="brown"
          />
          <KpiCard
            label="Contrôleurs actifs"
            value={5}
            hint="Postes couverts"
            icon={<Activity size={16} />}
            tone="indigo"
          />
        </div>

        {/* CHARTS ROW */}
        <div className="lp-grid-2">
          <SectionCard
            title="Contrôles par secteur"
            subtitle="Volume et non-conformités"
            icon={<ClipboardCheck size={16} />}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataQualiteFab} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--fg-muted)" fontSize={11} />
                  <YAxis stroke="var(--fg-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="contrôles" fill="var(--accent-sage)" radius={[4, 4, 0, 0]} name="Contrôles" />
                  <Bar dataKey="nonConf" fill="var(--accent-terracotta)" radius={[4, 4, 0, 0]} name="Non conformes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Évolution de la conformité"
            subtitle="6 dernières semaines"
            icon={<TrendingUp size={16} />}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataConformite} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--fg-muted)" fontSize={11} />
                  <YAxis domain={[90, 100]} stroke="var(--fg-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="taux"
                    stroke="var(--accent-sage)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--accent-sage)', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Taux (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="lp-grid-2">
          <SectionCard
            title="Sécurité par zone"
            subtitle="Score de conformité (/10)"
            icon={<ShieldCheck size={16} />}
            actions={
              <button onClick={() => setShowSecurityModal(true)} style={btnPrimary}>
                <FileText size={12} /> Nouveau contrôle
              </button>
            }
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dataSecuriteZones}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--fg-muted)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'var(--fg-muted)', fontSize: 10 }} />
                  <Radar
                    name="Conformité"
                    dataKey="value"
                    stroke="var(--accent-sage)"
                    fill="var(--accent-sage)"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Incidents · 6 mois"
            subtitle="Sécurité & environnement"
            icon={<AlertTriangle size={16} />}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataIncidents} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--fg-muted)" fontSize={11} />
                  <YAxis stroke="var(--fg-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    stroke="var(--accent-terracotta)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--accent-terracotta)', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Incidents"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* CONTRÔLES RÉCENTS */}
        <SectionCard
          title="Contrôles récents"
          subtitle="Derniers contrôles enregistrés"
          icon={<ClipboardCheck size={16} />}
          actions={
            <button onClick={() => setShowEvaluationModal(true)} style={btnPrimary}>
              <FileText size={12} /> Nouveau contrôle
            </button>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)' }}>
                  {['Date / Heure', 'Poste', 'QR Code', 'Type', 'Résultat', 'Contrôleur'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {controlesRecents.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>{c.date}</td>
                    <td style={tdStyle}><strong style={{ color: 'var(--fg-primary)' }}>{c.poste}</strong></td>
                    <td style={{ ...tdStyle, color: 'var(--fg-secondary)' }}>{c.qr}</td>
                    <td style={tdStyle}>{c.type}</td>
                    <td style={tdStyle}>{statutBadge(c.statut)}</td>
                    <td style={{ ...tdStyle, color: 'var(--fg-secondary)' }}>{c.controleur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </DashboardShell>

      {/* Modal Évaluation */}
      {showEvaluationModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--fg-primary)', margin: 0 }}>
                Nouveau contrôle qualité
              </h3>
              <button onClick={() => setShowEvaluationModal(false)} style={iconBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              <div>
                <label style={labelStyle}>Poste contrôlé</label>
                <select style={inputStyle}>
                  <option>Tissage — M-01</option>
                  <option>Tissage — M-05</option>
                  <option>Coupe — Poste 3</option>
                  <option>Atelier Finition</option>
                </select>
              </div>
              {['Conformité matière', 'Densité', 'Dimensions', 'Finition visuelle', 'Traçabilité'].map((criterion) => (
                <div key={criterion}>
                  <label style={labelStyle}>{criterion}</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingClick(criterion, value)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: '1px solid',
                          borderColor: selectedRating[criterion] === value ? 'var(--accent-sage)' : 'var(--border-default)',
                          background: selectedRating[criterion] === value ? 'var(--color-success-bg)' : 'var(--bg-elevated)',
                          color: selectedRating[criterion] === value ? 'var(--color-success)' : 'var(--fg-primary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 'var(--s-2)', paddingTop: 'var(--s-2)' }}>
                <button onClick={() => setShowEvaluationModal(false)} style={{ ...btnGhost, flex: 1, justifyContent: 'center' }}>
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert('Contrôle enregistré avec succès');
                    setShowEvaluationModal(false);
                  }}
                  style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sécurité */}
      {showSecurityModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--fg-primary)', margin: 0 }}>
                Nouveau contrôle sécurité
              </h3>
              <button onClick={() => setShowSecurityModal(false)} style={iconBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              <div>
                <label style={labelStyle}>Zone contrôlée</label>
                <select style={inputStyle}>
                  <option>Zone Tissage</option>
                  <option>Zone Coupe</option>
                  <option>Atelier Finition</option>
                  <option>Magasin Matière Première</option>
                </select>
              </div>
              {['Propreté de la zone', 'Équipements de sécurité', 'Organisation du poste', 'Gestion des risques', "Voies d'évacuation"].map((criterion) => (
                <div key={criterion}>
                  <label style={labelStyle}>{criterion}</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingClick(`sec_${criterion}`, value)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: '1px solid',
                          borderColor: selectedRating[`sec_${criterion}`] === value ? 'var(--accent-sage)' : 'var(--border-default)',
                          background: selectedRating[`sec_${criterion}`] === value ? 'var(--color-success-bg)' : 'var(--bg-elevated)',
                          color: selectedRating[`sec_${criterion}`] === value ? 'var(--color-success)' : 'var(--fg-primary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 'var(--s-2)', paddingTop: 'var(--s-2)' }}>
                <button onClick={() => setShowSecurityModal(false)} style={{ ...btnGhost, flex: 1, justifyContent: 'center' }}>
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert('Contrôle sécurité enregistré');
                    setShowSecurityModal(false);
                  }}
                  style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--s-3) var(--s-4)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--fg-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--s-3) var(--s-4)',
  color: 'var(--fg-primary)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--fg-secondary)',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'var(--bg-elevated)',
  color: 'var(--fg-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--s-4)',
  zIndex: 50,
};

const modalCard: React.CSSProperties = {
  background: 'var(--bg-base)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  maxWidth: 640,
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const modalHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--s-4)',
  borderBottom: '1px solid var(--border-subtle)',
};

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--accent-sage)',
  color: '#fff',
  border: '1px solid var(--accent-sage)',
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

export default DashboardControleCentral;
