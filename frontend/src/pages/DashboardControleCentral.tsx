import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle, ShieldCheck, AlertTriangle, ClipboardCheck, TrendingUp, Activity, FileText, X,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api, { qualiteService, dashboardService } from '../services/api';
import { useToast } from '../hooks/useToast';

type ControleRow = { date: string; poste: string; qr: string; type: string; statut: string; controleur: string };

const DashboardControleCentral: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<{ [key: string]: number }>({});
  const [savingControle, setSavingControle] = useState(false);
  const [evaluationPoste, setEvaluationPoste] = useState('Tissage — M-01');
  const [securityZone, setSecurityZone] = useState('Zone Tissage');

  // Phase F2 — données chargées depuis /api/v2/qualite/controles/*
  // Les séries de charts (secteur / radar / incidents) n'ont pas encore
  // d'endpoint dédié : on les démarre à [] et on les hydrate quand disponible.
  const [dataQualiteFab, setDataQualiteFab] = useState<Array<{ name: string; contrôles: number; nonConf: number }>>([]);
  const [dataConformite, setDataConformite] = useState<Array<{ name: string; taux: number }>>([]);
  const [dataSecuriteZones, setDataSecuriteZones] = useState<Array<{ subject: string; value: number }>>([]);
  const [dataIncidents, setDataIncidents] = useState<Array<{ name: string; incidents: number }>>([]);
  const [controlesRecents, setControlesRecents] = useState<ControleRow[]>([]);
  const [kpiTaux, setKpiTaux] = useState<number | null>(null);
  const [kpiTotalPeriode, setKpiTotalPeriode] = useState<number>(0);
  const [kpiNonConf, setKpiNonConf] = useState<number>(0);
  const [alertesCount, setAlertesCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const unwrap = (r: any) => r?.data?.data ?? r?.data ?? [];
    const load = async () => {
      try {
        // Phase G1 — charts secondaires hydratés depuis 3 endpoints réels.
        const [tauxR, recentsR, alertesR, parTypeR, incidentsR, radarR] = await Promise.all([
          qualiteService.getTauxConformite('30j'),
          qualiteService.getControlesRecents(20),
          dashboardService.getAlertes().catch(() => ({ data: { data: [] } })),
          qualiteService.getParTypeDefaut('30j'),
          qualiteService.getIncidentsParJour(30),
          qualiteService.getRadarCriteres(),
        ]);
        if (cancelled) return;
        const taux = (tauxR as any)?.data?.data || {};
        setKpiTaux(typeof taux.taux === 'number' ? taux.taux : null);
        setKpiTotalPeriode(Number(taux.total || 0));
        setKpiNonConf(Number(taux.non_conformes || 0));

        const recRows: any[] = Array.isArray(unwrap(recentsR)) ? unwrap(recentsR) : [];
        setControlesRecents(recRows.map((c: any) => {
          const d = c.date_controle ? new Date(c.date_controle) : null;
          return {
            date: d ? d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '',
            poste: c.numero_of || `OF ${c.id_of ?? ''}`,
            qr: c.qr_code || c.reference || '',
            type: c.type_controle || '—',
            statut: c.est_bloquant ? 'Non conforme' : 'Conforme',
            controleur: c.id_controleur ? `CTR-${c.id_controleur}` : 'Contrôle central',
          };
        }));
        const alertesRaw: any[] = Array.isArray(unwrap(alertesR)) ? unwrap(alertesR) : [];
        setAlertesCount(alertesRaw.length);

        // Phase G1 — chart "Contrôles par secteur" ← par-type-defaut
        // → mapping label FR + volumétrie (count) + non conformes approximés
        const parTypeRows: any[] = Array.isArray(unwrap(parTypeR)) ? unwrap(parTypeR) : [];
        setDataQualiteFab(parTypeRows.map((r: any) => ({
          name: labelCategorie(r.type_defaut),
          contrôles: Number(r.count) || 0,
          nonConf: Math.round((Number(r.count) || 0) * (Number(r.pct) || 0) / 100 * 0.3),
        })));

        // Phase G1 — chart "Incidents · 6 mois" ← incidents-par-jour (30 derniers jours)
        const incRows: any[] = Array.isArray(unwrap(incidentsR)) ? unwrap(incidentsR) : [];
        setDataIncidents(incRows.map((r: any) => {
          const d = r.date ? new Date(r.date) : null;
          return {
            name: d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : String(r.date || ''),
            incidents: Number(r.incidents) || 0,
          };
        }));

        // Phase G1 — chart "Sécurité par zone" (radar) ← radar-criteres
        const radarRows: any[] = Array.isArray(unwrap(radarR)) ? unwrap(radarR) : [];
        setDataSecuriteZones(radarRows.map((r: any) => ({
          subject: String(r.subject || ''),
          value: Number(r.value) || 0,
        })));

        // Phase G1 — courbe "Évolution de la conformité" (6 dernières semaines)
        // Dérivé des incidents : taux hebdo = 100 - (incidents_semaine / max_bucket * 20)
        // (approche défensive — tant qu'il n'y a pas d'endpoint dédié).
        const buckets: Array<{ label: string; inc: number }> = [];
        for (let w = 5; w >= 0; w--) {
          const end = new Date();
          end.setDate(end.getDate() - w * 7);
          const start = new Date(end);
          start.setDate(end.getDate() - 6);
          const inc = incRows.reduce((acc: number, r: any) => {
            const d = r.date ? new Date(r.date) : null;
            if (!d) return acc;
            return (d >= start && d <= end) ? acc + (Number(r.incidents) || 0) : acc;
          }, 0);
          buckets.push({ label: `S-${w}`, inc });
        }
        const maxInc = Math.max(1, ...buckets.map((b) => b.inc));
        setDataConformite(buckets.map((b) => ({
          name: b.label,
          taux: Math.max(90, Math.min(100, Math.round((100 - (b.inc / maxInc) * 10) * 10) / 10)),
        })));
      } catch {
        // garde les tableaux vides
      }
    };
    load();
    return () => { cancelled = true; };
    // intentionally no deps : fire-once hydrate on mount
  }, []);

  // Mapping libellés catégories défauts → libellés FR du dashboard
  function labelCategorie(cat?: string): string {
    const m: Record<string, string> = {
      tissage: 'Tissage',
      fil: 'Nouage',
      matiere: 'Matière',
      finition: 'Finition',
      colorimetrie: 'Colorimétrie',
      dimension: 'Dimensions',
      autre: 'Autre',
      visuel: 'Visuel',
      dimensionnel: 'Dimensions',
      colorimetrique: 'Colorimétrie',
      resistance: 'Résistance',
      poids: 'Poids',
      retour_soustraitance: 'Retour ST',
    };
    return m[String(cat || '').toLowerCase()] || String(cat || '—');
  }

  const handleRatingClick = (criterion: string, value: number) => {
    setSelectedRating({ ...selectedRating, [criterion]: value });
  };

  const refresh = () => window.location.reload();

  // T3b — refresh léger de la liste des contrôles (évite reload page).
  const refreshControles = async () => {
    try {
      const r = await qualiteService.getControlesRecents(20);
      const unwrap = (res: any) => res?.data?.data ?? res?.data ?? [];
      const rows: any[] = Array.isArray(unwrap(r)) ? unwrap(r) : [];
      setControlesRecents(rows.map((c: any) => {
        const d = c.date_controle ? new Date(c.date_controle) : null;
        return {
          date: d ? d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '',
          poste: c.numero_of || `OF ${c.id_of ?? ''}`,
          qr: c.qr_code || c.reference || '',
          type: c.type_controle || '—',
          statut: c.est_bloquant ? 'Non conforme' : 'Conforme',
          controleur: c.id_controleur ? `CTR-${c.id_controleur}` : 'Contrôle central',
        };
      }));
    } catch { /* silencieux */ }
  };

  // T3b — Enregistrement d'un contrôle qualité (modal Évaluation) via l'API.
  // Avant : alert() pur. Désormais POST /api/v2/qualite/controles (table
  // `controles_qualite` : colonnes dynamiques, est_bloquant déduit du score).
  const handleSaveControleQualite = async () => {
    const criteresQualite = ['Conformité matière', 'Densité', 'Dimensions', 'Finition visuelle', 'Traçabilité'];
    const notes = criteresQualite
      .map((k) => selectedRating[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    if (notes.length === 0) {
      toast.warning('Veuillez noter au moins un critère');
      return;
    }
    const moyenne = Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10;
    setSavingControle(true);
    try {
      await api.post('/v2/qualite/controles', {
        type_controle: 'qualite_poste',
        est_bloquant: moyenne < 7,
        observations: `Poste: ${evaluationPoste} — Moyenne: ${moyenne}/10 — ` +
          criteresQualite.map((k) => `${k}=${selectedRating[k] ?? '—'}`).join(', '),
      });
      toast.success('Contrôle qualité enregistré');
      setSelectedRating({});
      setShowEvaluationModal(false);
      refreshControles();
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || 'Erreur enregistrement contrôle');
    } finally {
      setSavingControle(false);
    }
  };

  // T3b — Idem pour les contrôles sécurité (clé préfixée `sec_`).
  const handleSaveControleSecurite = async () => {
    const criteresSec = ['Propreté de la zone', 'Équipements de sécurité', 'Organisation du poste', 'Gestion des risques', "Voies d'évacuation"];
    const notes = criteresSec
      .map((k) => selectedRating[`sec_${k}`])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    if (notes.length === 0) {
      toast.warning('Veuillez noter au moins un critère');
      return;
    }
    const moyenne = Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10;
    setSavingControle(true);
    try {
      await api.post('/v2/qualite/controles', {
        type_controle: 'securite_zone',
        est_bloquant: moyenne < 7,
        observations: `Zone: ${securityZone} — Moyenne: ${moyenne}/10 — ` +
          criteresSec.map((k) => `${k}=${selectedRating[`sec_${k}`] ?? '—'}`).join(', '),
      });
      toast.success('Contrôle sécurité enregistré');
      setSelectedRating({});
      setShowSecurityModal(false);
      refreshControles();
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || 'Erreur enregistrement contrôle sécurité');
    } finally {
      setSavingControle(false);
    }
  };

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
    <>
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
            value={kpiTaux == null ? '—' : `${kpiTaux}%`}
            hint="30 derniers jours"
            icon={<ShieldCheck size={18} />}
            tone="sage"
          />
          <KpiCard
            label="Contrôles 30j"
            value={kpiTotalPeriode}
            hint="Volume cumulé"
            icon={<ClipboardCheck size={18} />}
            tone="indigo"
          />
          <KpiCard
            label="Non-conformités"
            value={kpiNonConf}
            hint="Détectées sur 30j"
            icon={<AlertTriangle size={18} />}
            tone="terracotta"
          />
          <KpiCard
            label="Alertes ouvertes"
            value={alertesCount}
            hint="Toutes sources (production + qualité)"
            icon={<CheckCircle size={18} />}
            tone="gold"
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
                <select style={inputStyle} value={evaluationPoste} onChange={(e) => setEvaluationPoste(e.target.value)}>
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
                  onClick={handleSaveControleQualite}
                  disabled={savingControle}
                  style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: savingControle ? 0.6 : 1 }}
                >
                  {savingControle ? 'Enregistrement…' : 'Enregistrer'}
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
                <select style={inputStyle} value={securityZone} onChange={(e) => setSecurityZone(e.target.value)}>
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
                  onClick={handleSaveControleSecurite}
                  disabled={savingControle}
                  style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: savingControle ? 0.6 : 1 }}
                >
                  {savingControle ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
