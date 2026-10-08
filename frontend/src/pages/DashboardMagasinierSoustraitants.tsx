import React, { useState, useEffect } from 'react';
import {
  Package, Truck, AlertTriangle, CheckCircle, Clock, Search, Scan,
  ArrowRight, Plus, Building2, MessageSquare, Eye, Bell,
  X, Mail as MailIcon, Phone as PhoneIcon, MapPin, AlertCircle, Zap, Activity,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { soustraitantsService, ofService, messagesService } from '../services/api';

interface Mouvement {
  id_mouvement_st: number;
  numero_mouvement: string;
  id_sous_traitant: number;
  raison_sociale: string;
  numero_of: string;
  type_mouvement: string;
  date_mouvement: string;
  date_retour_prevue: string;
  date_retour_reelle?: string;
  qr_code_sortie?: string;
  qr_code_retour?: string;
  numero_suivi_transporteur?: string;
  statut: string;
  quantite?: number;
  article_designation?: string;
}

interface SoustraitantDetails {
  id_sous_traitant: number;
  code_sous_traitant: string;
  raison_sociale: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  contact_principal?: string;
  specialite?: string;
  capacite_production?: string;
  delai_moyen_jours?: number;
  taux_qualite?: number;
  actif: boolean;
  mouvements?: Mouvement[];
  statistiques?: {
    total_mouvements: number;
    en_cours: number;
    en_retard: number;
    retournes: number;
  };
}

interface MessageUrgent {
  id_message: number;
  sujet: string;
  message: string;
  expediteur_nom?: string;
  id_of?: number;
  numero_of?: string;
  urgent: boolean;
  lu: boolean;
  created_at: string;
}

type TabKey = 'vue-ensemble' | 'soustraitants' | 'sorties' | 'retours' | 'messages';

const DashboardMagasinierSoustraitants: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('vue-ensemble');
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [soustraitants, setSoustraitants] = useState<SoustraitantDetails[]>([]);
  const [soustraitantsList, setSoustraitantsList] = useState<any[]>([]);
  const [ofs, setOfs] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [alertesQualite, setAlertesQualite] = useState<any[]>([]);
  const [ofsAPrioriser, setOfsAPrioriser] = useState<any[]>([]);
  const [messagesUrgents, setMessagesUrgents] = useState<MessageUrgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSoustraitant, setSelectedSoustraitant] = useState<SoustraitantDetails | null>(null);
  const [showModalDetails, setShowModalDetails] = useState(false);

  // Modal Sortie
  const [showModalSortie, setShowModalSortie] = useState(false);
  const [formSortie, setFormSortie] = useState({
    id_sous_traitant: '',
    id_of: '',
    qr_code_sortie: '',
    numero_suivi_transporteur: '',
    date_sortie: new Date().toISOString().split('T')[0],
    quantite: '',
    observations: ''
  });

  // Modal Retour
  const [showModalRetour, setShowModalRetour] = useState(false);
  const [formRetour, setFormRetour] = useState({
    id_mouvement: '',
    qr_code_retour: '',
    date_retour: new Date().toISOString().split('T')[0],
    quantite_retournee: '',
    quantite_conforme: '',
    quantite_non_conforme: '',
    observations: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [soustraitantsRes, ofsRes, alertesRes] = await Promise.all([
        soustraitantsService.getSoustraitants({ actif: 'true' }),
        ofService.getOFs({}),
        soustraitantsService.getAlertesRetard()
      ]);

      setSoustraitantsList((() => { const _r = soustraitantsRes.data?.data; return Array.isArray(_r) ? _r : (_r?.data || _r?.soustraitantsList || []); })());
      setOfs((() => {
        const _r = ofsRes.data?.data;
        if (Array.isArray(_r)) return _r;
        if (_r && Array.isArray(_r.data)) return _r.data;
        if (_r && typeof _r === 'object') {
          for (const k of Object.keys(_r)) if (Array.isArray((_r as any)[k])) return (_r as any)[k];
        }
        return [];
      })());
      setAlertes((() => { const _r = alertesRes.data?.data; return Array.isArray(_r) ? _r : (_r?.data || _r?.alertes || []); })());

      const soustraitantsDetails: SoustraitantDetails[] = [];
      const mouvementsData: Mouvement[] = [];

      for (const st of soustraitantsRes.data.data) {
        try {
          const [detailRes, mouvRes] = await Promise.all([
            soustraitantsService.getSoustraitant(st.id_sous_traitant),
            soustraitantsService.getMouvements(st.id_sous_traitant, {})
          ]);

          if (detailRes.data.data) {
            soustraitantsDetails.push(detailRes.data.data);
          }

          if (mouvRes.data.data) {
            mouvRes.data.data.forEach((m: any) => {
              mouvementsData.push({
                ...m,
                raison_sociale: st.raison_sociale
              });
            });
          }
        } catch (err) {
          console.error(`Erreur chargement détails ST ${st.id_sous_traitant}:`, err);
        }
      }

      setSoustraitants(soustraitantsDetails);
      setMouvements(mouvementsData);

      const ofsIdsEnSousTraitance = new Set(mouvementsData.map(m => m.numero_of));
      const ofsPretesASortir = (ofsRes.data?.data || [])
        .filter((of: any) => {
          return (of.statut === 'PLANIFIE' || of.statut === 'EN_ATTENTE') &&
                 !ofsIdsEnSousTraitance.has(of.numero_of);
        })
        .sort((a: any, b: any) => {
          const prioriteOrder: any = { 'urgente': 1, 'haute': 2, 'normale': 3 };
          const orderA = prioriteOrder[a.priorite] || 99;
          const orderB = prioriteOrder[b.priorite] || 99;
          return orderA - orderB;
        });
      setOfsAPrioriser(ofsPretesASortir);

      const qualiteAlertes = soustraitantsDetails
        .filter(st => {
          return (st.taux_qualite !== null && st.taux_qualite !== undefined && st.taux_qualite < 90) ||
                 (st.statistiques && st.statistiques.en_retard > 2);
        })
        .map(st => ({
          id_sous_traitant: st.id_sous_traitant,
          raison_sociale: st.raison_sociale,
          type_alerte: st.taux_qualite != null && st.taux_qualite < 90 ? 'qualite_faible' : 'retards_frequents',
          taux_qualite: st.taux_qualite,
          nb_retards: st.statistiques?.en_retard || 0,
          message: st.taux_qualite != null && st.taux_qualite < 90
            ? `Taux de qualité faible: ${st.taux_qualite}%`
            : `Nombre de retards élevé: ${st.statistiques?.en_retard || 0}`
        }));
      setAlertesQualite(qualiteAlertes);

      await loadMessages();
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await messagesService.getMessages({ lu: 'false' });
      const allMessages = res.data.data?.messages || [];

      const ofsEnCours = mouvements
        .filter(m => m.statut === 'en_cours')
        .map(m => m.numero_of);

      const messagesFiltres = allMessages.filter((msg: MessageUrgent) => {
        if (msg.urgent) return true;
        if (msg.numero_of && ofsEnCours.includes(msg.numero_of)) return true;
        return false;
      });

      setMessagesUrgents(messagesFiltres);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const handleEnregistrerSortie = async () => {
    try {
      if (!formSortie.id_sous_traitant || !formSortie.id_of) {
        alert('Veuillez sélectionner un sous-traitant et un OF');
        return;
      }

      await soustraitantsService.enregistrerSortie(
        parseInt(formSortie.id_sous_traitant),
        {
          id_of: parseInt(formSortie.id_of),
          quantite: parseFloat(formSortie.quantite) || 0,
          date_sortie_prevue: formSortie.date_sortie,
          qr_code_sortie: formSortie.qr_code_sortie,
          numero_suivi_transporteur: formSortie.numero_suivi_transporteur,
          observations: formSortie.observations || `QR Sortie: ${formSortie.qr_code_sortie}, Suivi: ${formSortie.numero_suivi_transporteur}`
        }
      );

      alert('Sortie enregistrée avec succès !');
      setShowModalSortie(false);
      resetFormSortie();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEnregistrerRetour = async () => {
    try {
      const mouvement = mouvements.find(m => m.id_mouvement_st.toString() === formRetour.id_mouvement);
      if (!mouvement) {
        alert('Mouvement non trouvé');
        return;
      }

      await soustraitantsService.enregistrerRetour(
        mouvement.id_sous_traitant,
        {
          id_mouvement: parseInt(formRetour.id_mouvement),
          quantite_retournee: parseFloat(formRetour.quantite_retournee) || 0,
          date_retour: formRetour.date_retour,
          qr_code_retour: formRetour.qr_code_retour,
          conforme: parseFloat(formRetour.quantite_conforme) > 0,
          observations: formRetour.observations || `QR Retour: ${formRetour.qr_code_retour}`
        }
      );

      alert('Retour enregistré avec succès !');
      setShowModalRetour(false);
      resetFormRetour();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const resetFormSortie = () => {
    setFormSortie({
      id_sous_traitant: '',
      id_of: '',
      qr_code_sortie: '',
      numero_suivi_transporteur: '',
      date_sortie: new Date().toISOString().split('T')[0],
      quantite: '',
      observations: ''
    });
  };

  const resetFormRetour = () => {
    setFormRetour({
      id_mouvement: '',
      qr_code_retour: '',
      date_retour: new Date().toISOString().split('T')[0],
      quantite_retournee: '',
      quantite_conforme: '',
      quantite_non_conforme: '',
      observations: ''
    });
  };

  const handleMarquerMessageLu = async (idMessage: number) => {
    try {
      await messagesService.marquerMessageLu(idMessage);
      await loadMessages();
    } catch (error) {
      console.error('Erreur marquer message lu:', error);
    }
  };

  const filteredMouvements = mouvements.filter(m => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      m.numero_mouvement.toLowerCase().includes(searchLower) ||
      m.raison_sociale.toLowerCase().includes(searchLower) ||
      m.numero_of?.toLowerCase().includes(searchLower) ||
      m.qr_code_sortie?.toLowerCase().includes(searchLower) ||
      m.qr_code_retour?.toLowerCase().includes(searchLower)
    );
  });

  const mouvementsEnCours = mouvements.filter(m => m.statut === 'en_cours');
  const mouvementsRetard = alertes;

  const stats = {
    totalSoustraitants: soustraitants.length,
    totalEnCours: mouvementsEnCours.length,
    totalRetard: mouvementsRetard.length,
    totalRetournes: mouvements.filter(m => m.statut === 'retourne').length,
    messagesNonLus: messagesUrgents.filter(m => !m.lu).length,
    ofsAPrioriser: ofsAPrioriser.length,
    alertesQualite: alertesQualite.length
  };

  const nbMessagesNonLus = messagesUrgents.filter(m => !m.lu).length;

  const statutBadge = (statut: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      en_cours: { bg: 'var(--color-warning-bg)', c: 'var(--color-warning)' },
      retourne: { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
    };
    const b = map[statut] || { bg: 'var(--bg-hover)', c: 'var(--fg-secondary)' };
    return (
      <span style={{ ...badgeBase, background: b.bg, color: b.c }}>{statut}</span>
    );
  };

  const prioriteBadge = (priorite: string) => {
    if (priorite === 'urgente') return <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>URGENTE</span>;
    if (priorite === 'haute') return <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>HAUTE</span>;
    return <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>NORMALE</span>;
  };

  const tabBtn = (key: TabKey, label: string): React.CSSProperties => ({
    padding: '8px 14px',
    background: activeTab === key ? 'var(--accent-brown)' : 'var(--bg-hover)',
    color: activeTab === key ? '#fff' : 'var(--fg-secondary)',
    border: `1px solid ${activeTab === key ? 'var(--accent-brown)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties);

  return (
    <>
      <DashboardShell
        eyebrow="Poste — Magasinier sous-traitants"
        title="Tableau de bord — Magasinier sous-traitants"
        subtitle="Suivi des sorties et retours sous-traitants, contrats et livraisons."
        headerRight={
          <>
            {nbMessagesNonLus > 0 && (
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Bell size={16} style={{ color: 'var(--color-danger)' }} />
                <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--color-danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {nbMessagesNonLus}
                </span>
              </span>
            )}
            <button onClick={loadData} style={btnGhost} title="Actualiser">
              <Activity size={14} /> Actualiser
            </button>
            {activeTab === 'sorties' && (
              <button onClick={() => setShowModalSortie(true)} style={btnPrimary}>
                <Plus size={14} /> Nouvelle sortie
              </button>
            )}
            {activeTab === 'retours' && (
              <button onClick={() => setShowModalRetour(true)} style={btnPrimary}>
                <Plus size={14} /> Enregistrer retour
              </button>
            )}
            <ThemeToggle />
          </>
        }
      >
        {/* PRIMARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Sous-traitants actifs"
            value={stats.totalSoustraitants}
            hint="Réseau actif"
            icon={<Building2 size={18} />}
            tone="brown"
            loading={loading}
          />
          <KpiCard
            label="Mouvements en cours"
            value={stats.totalEnCours}
            hint="Sorties non encore retournées"
            icon={<Clock size={18} />}
            tone="gold"
            loading={loading}
          />
          <KpiCard
            label="Retours en retard"
            value={stats.totalRetard}
            hint="Dépassements de délai"
            icon={<AlertTriangle size={18} />}
            tone="terracotta"
            loading={loading}
          />
          <KpiCard
            label="Retournés"
            value={stats.totalRetournes}
            hint="Mouvements clôturés"
            icon={<CheckCircle size={18} />}
            tone="sage"
            loading={loading}
          />
        </div>

        {/* SECONDARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Messages non lus"
            value={stats.messagesNonLus}
            hint="Alertes des autres postes"
            icon={<MessageSquare size={16} />}
            tone="indigo"
            loading={loading}
          />
          <KpiCard
            label="OF à prioriser"
            value={stats.ofsAPrioriser}
            hint="Prêts à sortir en sous-traitance"
            icon={<Zap size={16} />}
            tone="rose"
            loading={loading}
          />
          <KpiCard
            label="Alertes qualité"
            value={stats.alertesQualite}
            hint="Sous-traitants à surveiller"
            icon={<AlertCircle size={16} />}
            tone="terracotta"
            loading={loading}
          />
          <KpiCard
            label="OF actifs"
            value={ofs.length}
            hint="Portefeuille total"
            icon={<Package size={16} />}
            tone="brown"
            loading={loading}
          />
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          <button style={tabBtn('vue-ensemble', 'Vue d\'ensemble')} onClick={() => setActiveTab('vue-ensemble')}>Vue d'ensemble</button>
          <button style={tabBtn('soustraitants', 'Sous-traitants')} onClick={() => setActiveTab('soustraitants')}>Sous-traitants</button>
          <button style={tabBtn('sorties', 'Sorties')} onClick={() => setActiveTab('sorties')}>Sorties</button>
          <button style={tabBtn('retours', 'Retours')} onClick={() => setActiveTab('retours')}>Retours</button>
          <button style={tabBtn('messages', 'Messages')} onClick={() => setActiveTab('messages')}>Messages</button>
        </div>

        {/* MESSAGES URGENTS + ALERTES QUALITE + RETARDS */}
        {(nbMessagesNonLus > 0 || alertesQualite.length > 0 || alertes.length > 0) && (
          <div className="lp-grid-3">
            {nbMessagesNonLus > 0 && (
              <SectionCard
                title={`${nbMessagesNonLus} message(s) urgent(s)`}
                subtitle="Non lus"
                icon={<Bell size={16} />}
                actions={<button onClick={() => setActiveTab('messages')} style={btnGhostSm}>Voir tous</button>}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  {messagesUrgents.filter(m => !m.lu).slice(0, 3).map(msg => (
                    <div key={msg.id_message} style={alertRowStyle('danger')}>
                      <div style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                        <strong>{msg.expediteur_nom || 'Système'} :</strong> {msg.sujet}
                        {msg.numero_of && <span style={{ marginLeft: 8, color: 'var(--fg-muted)', fontSize: 'var(--text-xs)' }}>(OF: {msg.numero_of})</span>}
                      </div>
                      <button onClick={() => handleMarquerMessageLu(msg.id_message)} style={iconBtn}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {alertesQualite.length > 0 && (
              <SectionCard
                title={`${alertesQualite.length} alerte(s) qualité`}
                subtitle="Sous-traitants à surveiller"
                icon={<AlertCircle size={16} />}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  {alertesQualite.slice(0, 5).map((alerte: any) => (
                    <div key={alerte.id_sous_traitant} style={alertRowStyle('warning')}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                        <strong>{alerte.raison_sociale} :</strong> <span style={{ color: 'var(--fg-secondary)' }}>{alerte.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {alertes.length > 0 && (
              <SectionCard
                title={`${alertes.length} retour(s) en retard`}
                subtitle="Dépassements de délai"
                icon={<AlertTriangle size={16} />}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  {alertes.slice(0, 5).map((alerte: any) => {
                    const jours = Math.ceil((new Date().getTime() - new Date(alerte.date_retour_prevue).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={alerte.id_mouvement_st} style={alertRowStyle('warning')}>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                          <strong>{alerte.raison_sociale}</strong>
                          <span style={{ color: 'var(--fg-secondary)' }}> — {alerte.numero_of} · retard de {jours}j</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* VUE D'ENSEMBLE */}
        {activeTab === 'vue-ensemble' && (
          <>
            {ofsAPrioriser.length > 0 && (
              <SectionCard
                title={`OF à sortir en priorité (${ofsAPrioriser.length})`}
                subtitle="Ordres prêts à envoyer en sous-traitance"
                icon={<Zap size={16} />}
                actions={
                  <button
                    onClick={() => {
                      if (ofsAPrioriser.length > 0) {
                        setFormSortie({ ...formSortie, id_of: ofsAPrioriser[0].id_of.toString() });
                        setShowModalSortie(true);
                      }
                    }}
                    style={btnPrimary}
                  >
                    <ArrowRight size={12} /> Sortir le premier OF
                  </button>
                }
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={{ background: 'var(--bg-hover)' }}>
                        {['Priorité', 'N° OF', 'Article', 'Quantité', 'Début prévu', 'Statut', 'Action'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ofsAPrioriser.slice(0, 10).map((of: any) => (
                        <tr key={of.id_of} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={tdStyle}>{prioriteBadge(of.priorite)}</td>
                          <td style={tdStyle}><strong>{of.numero_of}</strong></td>
                          <td style={tdStyle}>
                            <div>
                              <div>{of.article_designation || of.code_article || '-'}</div>
                              {of.code_article && of.article_designation && (
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{of.code_article}</div>
                              )}
                            </div>
                          </td>
                          <td style={tdStyle}>{of.quantite_a_produire} {of.unite || ''}</td>
                          <td style={tdStyle}>{of.date_debut_prevue ? new Date(of.date_debut_prevue).toLocaleDateString('fr-FR') : '-'}</td>
                          <td style={tdStyle}><span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>{of.statut}</span></td>
                          <td style={tdStyle}>
                            <button
                              onClick={() => {
                                setFormSortie({ ...formSortie, id_of: of.id_of.toString() });
                                setShowModalSortie(true);
                              }}
                              style={btnPrimarySm}
                            >
                              <ArrowRight size={12} /> Sortir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ofsAPrioriser.length > 10 && (
                    <div style={{ padding: 'var(--s-3) var(--s-4)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textAlign: 'center' }}>
                      + {ofsAPrioriser.length - 10} autre(s) OF en attente de sortie
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            <SectionCard
              title="Sous-traitants actifs"
              subtitle="Résumé rapide"
              icon={<Building2 size={16} />}
            >
              <div className="lp-grid-3">
                {soustraitants.map(st => (
                  <div
                    key={st.id_sous_traitant}
                    style={cardStyle}
                    onClick={() => { setSelectedSoustraitant(st); setShowModalDetails(true); }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-2)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{st.raison_sociale}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{st.code_sous_traitant}</div>
                      </div>
                      <Eye size={14} style={{ color: 'var(--fg-muted)' }} />
                    </div>
                    {st.specialite && (
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginBottom: 'var(--s-2)' }}>
                        <strong>Spécialité :</strong> {st.specialite}
                      </div>
                    )}
                    {st.statistiques && (
                      <div style={{ display: 'flex', gap: 'var(--s-3)', paddingTop: 'var(--s-2)', borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-xs)' }}>
                        <div><span style={{ color: 'var(--fg-muted)' }}>En cours :</span> <strong style={{ color: 'var(--color-warning)' }}>{st.statistiques.en_cours || 0}</strong></div>
                        <div><span style={{ color: 'var(--fg-muted)' }}>Retard :</span> <strong style={{ color: 'var(--color-danger)' }}>{st.statistiques.en_retard || 0}</strong></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Mouvements récents"
              subtitle="Derniers transferts et retours"
              icon={<Truck size={16} />}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ background: 'var(--bg-hover)' }}>
                      {['Numéro', 'Sous-traitant', 'OF', 'Statut', 'Date sortie'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMouvements.slice(0, 10).map(m => (
                      <tr key={m.id_mouvement_st} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={tdStyle}><strong>{m.numero_mouvement}</strong></td>
                        <td style={tdStyle}>{m.raison_sociale}</td>
                        <td style={tdStyle}>{m.numero_of || '-'}</td>
                        <td style={tdStyle}>{statutBadge(m.statut)}</td>
                        <td style={tdStyle}>{new Date(m.date_mouvement).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}

        {/* SOUS-TRAITANTS */}
        {activeTab === 'soustraitants' && (
          <SectionCard
            title="Liste complète des sous-traitants"
            subtitle={`${soustraitants.length} partenaires`}
            icon={<Building2 size={16} />}
            actions={
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 32, width: 220 }}
                />
              </div>
            }
          >
            <div className="lp-grid-2">
              {soustraitants
                .filter(st => !search || st.raison_sociale.toLowerCase().includes(search.toLowerCase()))
                .map(st => (
                <div key={st.id_sous_traitant} style={{ ...cardStyle, cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--fg-primary)' }}>{st.raison_sociale}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{st.code_sous_traitant}</div>
                    </div>
                    <button
                      onClick={() => { setSelectedSoustraitant(st); setShowModalDetails(true); }}
                      style={btnGhostSm}
                    >
                      <Eye size={12} /> Détails
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginBottom: 'var(--s-3)' }}>
                    {st.specialite && <div><strong>Spécialité :</strong> {st.specialite}</div>}
                    {st.delai_moyen_jours && <div><strong>Délai moyen :</strong> {st.delai_moyen_jours} jours</div>}
                    {st.telephone && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PhoneIcon size={12} /> {st.telephone}</div>}
                    {st.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MailIcon size={12} /> {st.email}</div>}
                  </div>
                  {st.statistiques && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-2)', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>En cours</div>
                        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-warning)' }}>{st.statistiques.en_cours || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Retard</div>
                        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-danger)' }}>{st.statistiques.en_retard || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Total</div>
                        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--fg-primary)' }}>{st.statistiques.total_mouvements || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* SORTIES / RETOURS */}
        {(activeTab === 'sorties' || activeTab === 'retours') && (
          <SectionCard
            title={activeTab === 'sorties' ? 'Sorties en cours' : 'Retours à traiter'}
            subtitle="Mouvements ouverts"
            icon={activeTab === 'sorties' ? <ArrowRight size={16} /> : <Package size={16} />}
            actions={
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
                <input
                  type="text"
                  placeholder="Rechercher mouvement, ST, OF, QR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 32, width: 280 }}
                />
              </div>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)' }}>
                    {['Numéro', 'Sous-traitant', 'OF', 'QR code', 'N° suivi', 'Date sortie', 'Retour prévu', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMouvements.filter(m => activeTab === 'sorties'
                    ? m.type_mouvement === 'sortie' && m.statut === 'en_cours'
                    : m.statut === 'en_cours'
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: 'var(--fg-muted)', padding: 'var(--s-6) var(--s-4)' }}>
                        Aucun mouvement trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredMouvements
                      .filter(m => activeTab === 'sorties'
                        ? m.type_mouvement === 'sortie' && m.statut === 'en_cours'
                        : m.statut === 'en_cours'
                      )
                      .map(mouvement => (
                        <tr key={mouvement.id_mouvement_st} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={tdStyle}><strong>{mouvement.numero_mouvement}</strong></td>
                          <td style={tdStyle}>{mouvement.raison_sociale}</td>
                          <td style={tdStyle}>{mouvement.numero_of || '-'}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{mouvement.qr_code_sortie || mouvement.qr_code_retour || '-'}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{mouvement.numero_suivi_transporteur || '-'}</td>
                          <td style={tdStyle}>{new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}</td>
                          <td style={tdStyle}>{mouvement.date_retour_prevue ? new Date(mouvement.date_retour_prevue).toLocaleDateString('fr-FR') : '-'}</td>
                          <td style={tdStyle}>{statutBadge(mouvement.statut)}</td>
                          <td style={tdStyle}>
                            {activeTab === 'retours' && mouvement.statut === 'en_cours' && (
                              <button
                                onClick={() => {
                                  setFormRetour({
                                    ...formRetour,
                                    id_mouvement: mouvement.id_mouvement_st.toString(),
                                    qr_code_retour: mouvement.qr_code_sortie || '',
                                  });
                                  setShowModalRetour(true);
                                }}
                                style={btnPrimarySm}
                              >
                                Enregistrer retour
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <SectionCard
            title="Messages et alertes"
            subtitle="Communications entrantes des autres postes"
            icon={<MessageSquare size={16} />}
          >
            {messagesUrgents.length === 0 ? (
              <div style={{ padding: 'var(--s-6) var(--s-4)', textAlign: 'center', color: 'var(--fg-muted)' }}>
                <MessageSquare size={32} style={{ margin: '0 auto var(--s-3)', display: 'block' }} />
                Aucun message urgent pour le moment
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                {messagesUrgents.map(msg => (
                  <div
                    key={msg.id_message}
                    style={{
                      padding: 'var(--s-3) var(--s-4)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${msg.urgent ? 'var(--color-danger)' : 'var(--color-info)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 'var(--s-3)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        {msg.urgent && <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />}
                        <strong style={{ color: 'var(--fg-primary)' }}>{msg.sujet}</strong>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginBottom: 6 }}>
                        De : <strong>{msg.expediteur_nom || 'Système'}</strong>
                        {msg.numero_of && <> · OF : <strong>{msg.numero_of}</strong></>}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 6 }}>
                        {new Date(msg.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    {!msg.lu && (
                      <button onClick={() => handleMarquerMessageLu(msg.id_message)} style={btnGhostSm}>
                        Marquer lu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </DashboardShell>

      {/* Modal Détails Sous-Traitant */}
      {showModalDetails && selectedSoustraitant && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: 800 }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>Détails sous-traitant</h3>
              <button onClick={() => setShowModalDetails(false)} style={iconBtn}><X size={18} /></button>
            </div>
            <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--fg-primary)' }}>{selectedSoustraitant.raison_sociale}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Code : {selectedSoustraitant.code_sous_traitant}</div>
              </div>

              <div className="lp-grid-2">
                <div>
                  <h5 style={{ marginTop: 0, marginBottom: 'var(--s-2)', color: 'var(--fg-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                    {selectedSoustraitant.telephone && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PhoneIcon size={12} /> {selectedSoustraitant.telephone}</div>}
                    {selectedSoustraitant.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MailIcon size={12} /> {selectedSoustraitant.email}</div>}
                    {selectedSoustraitant.adresse && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><MapPin size={12} style={{ marginTop: 3 }} /> {selectedSoustraitant.adresse}</div>}
                    {selectedSoustraitant.contact_principal && <div><strong>Contact principal :</strong> {selectedSoustraitant.contact_principal}</div>}
                  </div>
                </div>
                <div>
                  <h5 style={{ marginTop: 0, marginBottom: 'var(--s-2)', color: 'var(--fg-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Technique</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                    {selectedSoustraitant.specialite && <div><strong>Spécialité :</strong> {selectedSoustraitant.specialite}</div>}
                    {selectedSoustraitant.delai_moyen_jours && <div><strong>Délai moyen :</strong> {selectedSoustraitant.delai_moyen_jours} jours</div>}
                    {selectedSoustraitant.capacite_production && <div><strong>Capacité :</strong> {selectedSoustraitant.capacite_production}</div>}
                    {selectedSoustraitant.taux_qualite && <div><strong>Taux qualité :</strong> {selectedSoustraitant.taux_qualite}%</div>}
                    <div>
                      <strong>Statut :</strong>{' '}
                      <span style={{ ...badgeBase, background: selectedSoustraitant.actif ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: selectedSoustraitant.actif ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {selectedSoustraitant.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSoustraitant.statistiques && (
                <div>
                  <h5 style={{ marginTop: 0, marginBottom: 'var(--s-2)', color: 'var(--fg-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Statistiques</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-2)' }}>
                    {[
                      { label: 'Total', value: selectedSoustraitant.statistiques.total_mouvements || 0, color: 'var(--fg-primary)' },
                      { label: 'En cours', value: selectedSoustraitant.statistiques.en_cours || 0, color: 'var(--color-warning)' },
                      { label: 'En retard', value: selectedSoustraitant.statistiques.en_retard || 0, color: 'var(--color-danger)' },
                      { label: 'Retournés', value: selectedSoustraitant.statistiques.retournes || 0, color: 'var(--color-success)' },
                    ].map(s => (
                      <div key={s.label} style={{ padding: 'var(--s-3)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{s.label}</div>
                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSoustraitant.mouvements && selectedSoustraitant.mouvements.length > 0 && (
                <div>
                  <h5 style={{ marginTop: 0, marginBottom: 'var(--s-2)', color: 'var(--fg-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>OF chez ce sous-traitant</h5>
                  <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                    {selectedSoustraitant.mouvements.map(mouv => (
                      <div key={mouv.id_mouvement_st} style={{ padding: 'var(--s-3)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{mouv.numero_of}</div>
                          {mouv.article_designation && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>{mouv.article_designation}</div>}
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                            Sortie : {new Date(mouv.date_mouvement).toLocaleDateString('fr-FR')}
                            {mouv.date_retour_prevue && <> · Retour prévu : {new Date(mouv.date_retour_prevue).toLocaleDateString('fr-FR')}</>}
                          </div>
                        </div>
                        {statutBadge(mouv.statut)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sortie */}
      {showModalSortie && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>Enregistrer sortie vers sous-traitant</h3>
              <button onClick={() => { setShowModalSortie(false); resetFormSortie(); }} style={iconBtn}><X size={18} /></button>
            </div>
            <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              <div className="lp-grid-2">
                <div>
                  <label style={labelStyle}>Sous-traitant *</label>
                  <select value={formSortie.id_sous_traitant} onChange={(e) => setFormSortie({ ...formSortie, id_sous_traitant: e.target.value })} style={inputStyle} required>
                    <option value="">Sélectionner...</option>
                    {soustraitantsList.map(st => (
                      <option key={st.id_sous_traitant} value={st.id_sous_traitant}>{st.raison_sociale}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Ordre de fabrication *</label>
                  <select value={formSortie.id_of} onChange={(e) => setFormSortie({ ...formSortie, id_of: e.target.value })} style={inputStyle} required>
                    <option value="">Sélectionner...</option>
                    {ofs.map(of => (
                      <option key={of.id_of} value={of.id_of}>{of.numero_of}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>QR code / numéro de suivi *</label>
                <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                  <input
                    type="text"
                    value={formSortie.qr_code_sortie}
                    onChange={(e) => setFormSortie({ ...formSortie, qr_code_sortie: e.target.value })}
                    placeholder="Scanner ou saisir"
                    style={{ ...inputStyle, flex: 1 }}
                    autoFocus
                  />
                  <button style={btnGhost}><Scan size={14} /></button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Numéro de suivi transporteur</label>
                <input
                  type="text"
                  value={formSortie.numero_suivi_transporteur}
                  onChange={(e) => setFormSortie({ ...formSortie, numero_suivi_transporteur: e.target.value })}
                  placeholder="Numéro de suivi (optionnel)"
                  style={inputStyle}
                />
              </div>
              <div className="lp-grid-2">
                <div>
                  <label style={labelStyle}>Date sortie *</label>
                  <input type="date" value={formSortie.date_sortie} onChange={(e) => setFormSortie({ ...formSortie, date_sortie: e.target.value })} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Quantité</label>
                  <input type="number" value={formSortie.quantite} onChange={(e) => setFormSortie({ ...formSortie, quantite: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Observations</label>
                <textarea value={formSortie.observations} onChange={(e) => setFormSortie({ ...formSortie, observations: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} />
              </div>
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => { setShowModalSortie(false); resetFormSortie(); }} style={btnGhost}>Annuler</button>
              <button onClick={handleEnregistrerSortie} style={btnPrimary}>Enregistrer sortie</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Retour */}
      {showModalRetour && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>Enregistrer retour depuis sous-traitant</h3>
              <button onClick={() => { setShowModalRetour(false); resetFormRetour(); }} style={iconBtn}><X size={18} /></button>
            </div>
            <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              <div>
                <label style={labelStyle}>QR code retour *</label>
                <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                  <input
                    type="text"
                    value={formRetour.qr_code_retour}
                    onChange={(e) => setFormRetour({ ...formRetour, qr_code_retour: e.target.value })}
                    placeholder="Scanner ou saisir"
                    style={{ ...inputStyle, flex: 1 }}
                    autoFocus
                  />
                  <button style={btnGhost}><Scan size={14} /></button>
                </div>
              </div>
              <div className="lp-grid-2">
                <div>
                  <label style={labelStyle}>Date retour *</label>
                  <input type="date" value={formRetour.date_retour} onChange={(e) => setFormRetour({ ...formRetour, date_retour: e.target.value })} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Quantité retournée *</label>
                  <input type="number" value={formRetour.quantite_retournee} onChange={(e) => setFormRetour({ ...formRetour, quantite_retournee: e.target.value })} style={inputStyle} required />
                </div>
              </div>
              <div className="lp-grid-2">
                <div>
                  <label style={labelStyle}>Quantité conforme</label>
                  <input type="number" value={formRetour.quantite_conforme} onChange={(e) => setFormRetour({ ...formRetour, quantite_conforme: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Quantité non conforme</label>
                  <input type="number" value={formRetour.quantite_non_conforme} onChange={(e) => setFormRetour({ ...formRetour, quantite_non_conforme: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Observations</label>
                <textarea value={formRetour.observations} onChange={(e) => setFormRetour({ ...formRetour, observations: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} />
              </div>
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => { setShowModalRetour(false); resetFormRetour(); }} style={btnGhost}>Annuler</button>
              <button onClick={handleEnregistrerRetour} style={btnPrimary}>Enregistrer retour</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Styles
const badgeBase: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-block' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3) var(--s-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-subtle)' };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', boxSizing: 'border-box' };
const cardStyle: React.CSSProperties = { padding: 'var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--duration) var(--ease)' };
const iconBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 4, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' };

const alertRowStyle = (tone: 'danger' | 'warning'): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--s-2)',
  padding: 'var(--s-2) var(--s-3)',
  background: tone === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
  border: `1px solid ${tone === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
  borderRadius: 'var(--radius-sm)',
});

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  padding: 'var(--s-4)',
};

const modalContentStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  width: '100%',
  maxWidth: 640,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: 'var(--shadow-lg)',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--s-4)',
  borderBottom: '1px solid var(--border-subtle)',
};

const modalFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--s-2)',
  padding: 'var(--s-4)',
  borderTop: '1px solid var(--border-subtle)',
  background: 'var(--bg-hover)',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--accent-brown)',
  color: '#fff',
  border: '1px solid var(--accent-brown)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnPrimarySm: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  background: 'var(--accent-brown)',
  color: '#fff',
  border: '1px solid var(--accent-brown)',
  borderRadius: 'var(--radius-full)',
  fontSize: '11px',
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

export default DashboardMagasinierSoustraitants;
