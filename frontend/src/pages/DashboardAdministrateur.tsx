import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Activity, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Users, Package, Factory, Scissors, Wrench, Truck, MessageSquare, Send, Bell,
  Edit, Eye, Filter, Download, Calendar, BarChart3, ArrowRight, X, DollarSign, TrendingUp as TrendingUpIcon, RefreshCw,
  FileText, Target, Feather
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import KpiBanner from '../components/KpiBanner';
import { dashboardService, tachesService, messagesService, maintenanceService, coutsService, planificationGanttService, ofService, machinesService } from '../services/api';

interface Tache {
  id: string;
  titre: string;
  description: string;
  poste: string;
  responsable: string;
  statut: 'en_attente' | 'en_cours' | 'termine' | 'retard';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  dateCreation: string;
  dateEcheance: string;
  progression: number;
}

interface Avancement {
  poste: string;
  tachesTotal: number;
  tachesTerminees: number;
  tachesEnCours: number;
  tachesRetard: number;
  progression: number;
}

const DashboardAdministrateur = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vue-generale');
  const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({ destinataire: '', message: '', urgent: false });
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [filterPoste, setFilterPoste] = useState<string>('tous');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Données depuis l'API
  const [taches, setTaches] = useState<Tache[]>([
    {
      id: 'T001',
      titre: 'Finaliser commande CL00884',
      description: 'Commande urgente à finaliser pour livraison demain',
      poste: 'Chef Production',
      responsable: 'Jean Dupont',
      statut: 'en_cours',
      priorite: 'urgente',
      dateCreation: '2025-10-18',
      dateEcheance: '2025-10-20',
      progression: 75
    },
    {
      id: 'T002',
      titre: 'Réparation machine M2304',
      description: 'Machine en panne depuis 4h - intervention urgente',
      poste: 'Mécanique',
      responsable: 'Ali Ben Salem',
      statut: 'en_cours',
      priorite: 'urgente',
      dateCreation: '2025-10-19',
      dateEcheance: '2025-10-19',
      progression: 50
    },
    {
      id: 'T003',
      titre: 'Contrôle qualité lot OF249780',
      description: 'Contrôle qualité à effectuer sur le lot en cours',
      poste: 'Contrôle Qualité',
      responsable: 'Fatma Gharbi',
      statut: 'en_attente',
      priorite: 'haute',
      dateCreation: '2025-10-19',
      dateEcheance: '2025-10-20',
      progression: 0
    },
    {
      id: 'T004',
      titre: 'Réapprovisionnement matière C09',
      description: 'Stock critique - commande urgente nécessaire',
      poste: 'Magasin MP',
      responsable: 'Mohamed Kacem',
      statut: 'retard',
      priorite: 'urgente',
      dateCreation: '2025-10-17',
      dateEcheance: '2025-10-18',
      progression: 30
    },
    {
      id: 'T005',
      titre: 'Formation nouveaux opérateurs',
      description: 'Formation sur les nouvelles procédures',
      poste: 'RH',
      responsable: 'Salah Ben Ali',
      statut: 'en_attente',
      priorite: 'normale',
      dateCreation: '2025-10-15',
      dateEcheance: '2025-10-25',
      progression: 0
    }
  ]);

  const [avancements, setAvancements] = useState<Avancement[]>([
    { poste: 'Tissage', tachesTotal: 12, tachesTerminees: 8, tachesEnCours: 3, tachesRetard: 1, progression: 67 },
    { poste: 'Coupe', tachesTotal: 8, tachesTerminees: 6, tachesEnCours: 2, tachesRetard: 0, progression: 75 },
    { poste: 'Atelier', tachesTotal: 15, tachesTerminees: 10, tachesEnCours: 4, tachesRetard: 1, progression: 67 },
    { poste: 'Mécanique', tachesTotal: 5, tachesTerminees: 2, tachesEnCours: 2, tachesRetard: 1, progression: 40 },
    { poste: 'Magasin MP', tachesTotal: 6, tachesTerminees: 4, tachesEnCours: 1, tachesRetard: 1, progression: 67 },
    { poste: 'Contrôle Qualité', tachesTotal: 10, tachesTerminees: 7, tachesEnCours: 2, tachesRetard: 1, progression: 70 }
  ]);

  const [statsGlobales, setStatsGlobales] = useState({
    tachesTotal: 0,
    tachesTerminees: 0,
    tachesEnCours: 0,
    tachesRetard: 0,
    tauxCompletion: 0
  });

  // Données financières
  const [donneesFinancieres, setDonneesFinancieres] = useState({
    chiffreAffaire: {
      aujourdhui: 125000,
      semaine: 850000,
      mois: 3200000,
      objectifMois: 3500000,
      progression: 91.4
    },
    couts: {
      matieresPremieres: 450000,
      mainOeuvre: 280000,
      energie: 45000,
      maintenance: 32000,
      autres: 18000,
      total: 825000,
      budgetMois: 900000,
      ecart: -75000
    },
    marge: {
      brut: 2375000,
      taux: 74.2,
      objectif: 75
    },
    evolutionCA: [
      { mois: 'Jan', ca: 2800000, couts: 2100000 },
      { mois: 'Fév', ca: 2950000, couts: 2200000 },
      { mois: 'Mar', ca: 3100000, couts: 2300000 },
      { mois: 'Avr', ca: 3050000, couts: 2250000 },
      { mois: 'Mai', ca: 3200000, couts: 2400000 },
      { mois: 'Juin', ca: 3200000, couts: 2400000 }
    ],
    repartitionCouts: [
      { nom: 'Matières Premières', valeur: 450000, pourcentage: 54.5, color: '#3b82f6' },
      { nom: 'Main d\'œuvre', valeur: 280000, pourcentage: 33.9, color: '#10b981' },
      { nom: 'Énergie', valeur: 45000, pourcentage: 5.5, color: '#f59e0b' },
      { nom: 'Maintenance', valeur: 32000, pourcentage: 3.9, color: '#ef4444' },
      { nom: 'Autres', valeur: 18000, pourcentage: 2.2, color: '#8b5cf6' }
    ]
  });

  // Données fabrication / GPAO (ex-dashboard GPAO)
  const [statsFabrication, setStatsFabrication] = useState({
    production: { ofs_en_cours: 0, ofs_termines: 0, quantite_produite: 0, quantite_prevue: 0, taux_rendement: 0, total_ofs: 0 },
    interventions: { total: 0, en_cours: 0, planifiees: 0 },
    alertes: { total: 0, urgentes: 0 },
    taches: { total: 0, en_cours: 0, terminees: 0 },
    machines: { operationnelles: 0, en_maintenance: 0, total: 0 }
  });
  const [alertesGpao, setAlertesGpao] = useState<any[]>([]);

  const chartData = avancements.map(a => ({
    poste: a.poste,
    terminé: a.tachesTerminees,
    'en cours': a.tachesEnCours,
    retard: a.tachesRetard
  }));

  const progressionData = avancements.map(a => ({
    poste: a.poste,
    progression: a.progression
  }));

  const getStatutColor = (statut: string) => {
    switch(statut) {
      case 'termine': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'retard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch(priorite) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-500';
      case 'haute': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'normale': return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'basse': return 'bg-gray-100 text-gray-800 border-gray-500';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Chargement des données depuis l'API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les tâches
      const tachesRes = await tachesService.getTaches().catch(() => ({ data: { data: [] } }));
      const tachesData = Array.isArray(tachesRes.data?.data) ? tachesRes.data.data : [];
      setTaches(tachesData);

      // Calculer les statistiques
      const total = tachesData.length;
      const terminees = tachesData.filter((t: Tache) => t.statut === 'termine').length;
      const enCours = tachesData.filter((t: Tache) => t.statut === 'en_cours').length;
      const retard = tachesData.filter((t: Tache) => t.statut === 'retard').length;
      setStatsGlobales({
        tachesTotal: total,
        tachesTerminees: terminees,
        tachesEnCours: enCours,
        tachesRetard: retard,
        tauxCompletion: total > 0 ? Math.round((terminees / total) * 100) : 0
      });

      // Calculer avancements par poste
      const postesMap = new Map<string, { total: number; terminees: number; enCours: number; retard: number }>();
      tachesData.forEach((t: Tache) => {
        const current = postesMap.get(t.poste) || { total: 0, terminees: 0, enCours: 0, retard: 0 };
        current.total++;
        if (t.statut === 'termine') current.terminees++;
        else if (t.statut === 'en_cours') current.enCours++;
        else if (t.statut === 'retard') current.retard++;
        postesMap.set(t.poste, current);
      });

      const avancementsData: Avancement[] = Array.from(postesMap.entries()).map(([poste, stats]) => ({
        poste,
        tachesTotal: stats.total,
        tachesTerminees: stats.terminees,
        tachesEnCours: stats.enCours,
        tachesRetard: stats.retard,
        progression: stats.total > 0 ? Math.round((stats.terminees / stats.total) * 100) : 0
      }));
      setAvancements(avancementsData);

      // Charger les données financières (si disponibles)
      try {
        const coutsRes = await coutsService.getBudgets().catch(() => null);
        // Ici on pourrait mapper les données réelles, pour l'instant on garde les mockées comme fallback
      } catch (error) {
        console.warn('Erreur chargement données financières:', error);
      }

      // Données fabrication / GPAO
      try {
        const [interventionsRes, alertesRes, tachesGanttRes, ofsRes, machinesRes] = await Promise.all([
          maintenanceService.getInterventions().catch(() => ({ data: { data: { interventions: [] } } })),
          maintenanceService.getAlertes({ lue: 'false' }).catch(() => ({ data: { data: [] } })),
          planificationGanttService.getTaches().catch(() => ({ data: { data: { taches: [] } } })),
          ofService.getOFs({}).catch(() => ({ data: { data: [] } })),
          machinesService.getMachines({}).catch(() => ({ data: { data: [] } }))
        ]);
        const interventions = (interventionsRes.data?.data?.interventions ?? interventionsRes.data?.interventions ?? []) as any[];
        const alertesData = (alertesRes.data?.data ?? alertesRes.data ?? []) as any[];
        const tachesGantt = (tachesGanttRes.data?.data?.taches ?? tachesGanttRes.data?.taches ?? []) as any[];
        const ofs = (ofsRes.data?.data ?? ofsRes.data ?? []) as any[];
        const machines = (machinesRes.data?.data ?? machinesRes.data ?? []) as any[];

        const ofsEnCours = ofs.filter((of: any) => (of.statut || '').toLowerCase() === 'en_cours').length;
        const ofsTermines = ofs.filter((of: any) => (of.statut || '').toLowerCase() === 'termine').length;
        const quantiteProduite = ofs.reduce((sum: number, of: any) => sum + (parseFloat(of.quantite_produite) || 0), 0);
        const quantitePrevue = ofs.reduce((sum: number, of: any) => sum + (parseFloat(of.quantite_a_produire) || 0), 0);
        const tauxRendement = quantitePrevue > 0 ? Math.round((quantiteProduite / quantitePrevue) * 100) : 0;
        const machinesOp = machines.filter((m: any) => (m.statut || '').toLowerCase() === 'operationnel').length;

        setStatsFabrication({
          production: {
            ofs_en_cours: ofsEnCours,
            ofs_termines: ofsTermines,
            quantite_produite: quantiteProduite,
            quantite_prevue: quantitePrevue,
            taux_rendement: tauxRendement,
            total_ofs: ofs.length
          },
          interventions: {
            total: interventions.length,
            en_cours: interventions.filter((i: any) => (i.statut || '').toUpperCase() === 'EN_COURS').length,
            planifiees: interventions.filter((i: any) => (i.statut || '').toUpperCase() === 'PLANIFIEE').length
          },
          alertes: {
            total: alertesData.length,
            urgentes: alertesData.filter((a: any) => a.priorite === 1).length
          },
          taches: {
            total: tachesGantt.length,
            en_cours: tachesGantt.filter((t: any) => (t.statut || '').toUpperCase() === 'EN_COURS').length,
            terminees: tachesGantt.filter((t: any) => (t.statut || '').toUpperCase() === 'TERMINEE').length
          },
          machines: {
            operationnelles: machinesOp,
            en_maintenance: interventions.filter((i: any) => (i.statut || '').toUpperCase() === 'EN_COURS').length,
            total: machines.length
          }
        });
        setAlertesGpao(alertesData.slice(0, 5));
      } catch (err) {
        console.warn('Erreur chargement données fabrication:', err);
      }

    } catch (error) {
      console.error('Erreur chargement données dashboard:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleModifierTache = (tache: Tache) => {
    setSelectedTache({ ...tache });
  };

  const handleSauvegarderTache = async () => {
    if (!selectedTache) return;
    setSaving(true);
    try {
      // Convertir l'ID string en number si nécessaire pour l'API
      const tacheId = parseInt(selectedTache.id.toString().replace('T', ''));
      if (!isNaN(tacheId)) {
        await tachesService.terminerTache(tacheId, {
          statut: selectedTache.statut,
          priorite: selectedTache.priorite,
          progression: selectedTache.progression
        });
      }
      
      // Mettre à jour localement
      setTaches(prev => prev.map(t => t.id === selectedTache.id ? selectedTache : t));
      setSelectedTache(null);
      setMessage({ type: 'success', text: 'Tâche mise à jour avec succès' });
      await loadData(); // Recharger pour synchroniser
    } catch (error: any) {
      console.error('Erreur sauvegarde tâche:', error);
      setMessage({ type: 'error', text: error.response?.data?.error?.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleEnvoyerMessage = async () => {
    if (!messageData.destinataire || !messageData.message) return;
    
    setSaving(true);
    try {
      await messagesService.envoyerMessage({
        destinataire: messageData.destinataire,
        message: messageData.message,
        urgent: messageData.urgent,
        type: 'admin_message'
      });
      
      setMessage({ type: 'success', text: `Message ${messageData.urgent ? 'URGENT ' : ''}envoyé avec succès` });
      setShowMessageModal(false);
      setMessageData({ destinataire: '', message: '', urgent: false });
    } catch (error: any) {
      console.error('Erreur envoi message:', error);
      setMessage({ type: 'error', text: error.response?.data?.error?.message || 'Erreur lors de l\'envoi du message' });
    } finally {
      setSaving(false);
    }
  };

  const tachesFiltrees = taches.filter(t => {
    if (filterStatut !== 'tous' && t.statut !== filterStatut) return false;
    if (filterPoste !== 'tous' && t.poste !== filterPoste) return false;
    return true;
  });

  const postes = Array.from(new Set(taches.map(t => t.poste)));

  // Masquer le message après 5 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading && taches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard Administrateur"
      subtitle="Vue globale - Gestion des tâches et interventions"
      activeSection={activeTab}
      onSectionChange={setActiveTab}
      sidebarFooter={
        <button
          type="button"
          onClick={() => setShowMessageModal(true)}
          className="w-full h-full flex items-center justify-center text-white rounded-full"
          aria-label="Envoyer Message"
        >
          <Feather className="w-7 h-7" strokeWidth={2.5} />
        </button>
      }
    >
      {/* Message de notification */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-4 text-white hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <>
        {/* Vue Générale */}
        {activeTab === 'vue-generale' && (
          <div className="space-y-6">
            {/* KPIs temps réel (API /dashboard/kpis-admin) */}
            <KpiBanner />

            {/* KPIs tâches */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tâches Total</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statsGlobales.tachesTotal}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Terminées</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{statsGlobales.tachesTerminees}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En Cours</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{statsGlobales.tachesEnCours}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En Retard</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{statsGlobales.tachesRetard}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* KPIs Financiers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-100">CA Aujourd'hui</p>
                    <p className="text-3xl font-bold mt-2">{donneesFinancieres.chiffreAffaire.aujourdhui.toLocaleString('fr-FR')} DT</p>
                    <p className="text-xs text-green-100 mt-1">+12% vs hier</p>
                  </div>
                  <TrendingUpIcon className="w-12 h-12 text-white opacity-30" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">CA du Mois</p>
                    <p className="text-3xl font-bold mt-2">{donneesFinancieres.chiffreAffaire.mois.toLocaleString('fr-FR')} DT</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Objectif: {donneesFinancieres.chiffreAffaire.objectifMois.toLocaleString('fr-FR')} DT</span>
                        <span>{donneesFinancieres.chiffreAffaire.progression}%</span>
                      </div>
                      <div className="w-full bg-blue-400 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full" 
                          style={{ width: `${donneesFinancieres.chiffreAffaire.progression}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <DollarSign className="w-12 h-12 text-white opacity-30" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-100">Coûts Totaux</p>
                    <p className="text-3xl font-bold mt-2">{donneesFinancieres.couts.total.toLocaleString('fr-FR')} DT</p>
                    <p className={`text-xs mt-1 ${donneesFinancieres.couts.ecart < 0 ? 'text-orange-100' : 'text-red-200'}`}>
                      Budget: {donneesFinancieres.couts.budgetMois.toLocaleString('fr-FR')} DT
                    </p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-white opacity-30" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Marge Brute</p>
                    <p className="text-3xl font-bold mt-2">{donneesFinancieres.marge.brut.toLocaleString('fr-FR')} DT</p>
                    <p className="text-xs text-purple-100 mt-1">
                      Taux: {donneesFinancieres.marge.taux}% (Obj: {donneesFinancieres.marge.objectif}%)
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-white opacity-30" />
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Répartition par Poste</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="poste" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="terminé" fill="#10b981" />
                    <Bar dataKey="en cours" fill="#3b82f6" />
                    <Bar dataKey="retard" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Progression par Poste</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="poste" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="progression" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tâches Urgentes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Tâches Urgentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {taches.filter(t => t.priorite === 'urgente').map(tache => (
                    <div key={tache.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{tache.titre}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(tache.statut)}`}>
                              {tache.statut}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{tache.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Poste: {tache.poste}</span>
                            <span>Responsable: {tache.responsable}</span>
                            <span>Échéance: {tache.dateEcheance}</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progression</span>
                              <span className="font-medium">{tache.progression}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${tache.progression}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleModifierTache(tache)}
                          className="ml-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fabrication & GPAO (menu dashboard admin) */}
        {activeTab === 'fabrication-gpao' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Fabrication & GPAO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">OFs en cours</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.production.ofs_en_cours}</p>
                    <p className="text-xs text-gray-500">{statsFabrication.production.total_ofs} au total</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500 opacity-80" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quantité produite</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.production.quantite_produite.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-gray-500">Prévu: {statsFabrication.production.quantite_prevue.toLocaleString('fr-FR')}</p>
                  </div>
                  <Package className="w-10 h-10 text-green-500 opacity-80" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux rendement</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.production.taux_rendement}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className={`h-1.5 rounded-full ${statsFabrication.production.taux_rendement >= 90 ? 'bg-green-600' : statsFabrication.production.taux_rendement >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${Math.min(100, statsFabrication.production.taux_rendement)}%` }} />
                    </div>
                  </div>
                  <Target className="w-10 h-10 text-yellow-500 opacity-80" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">OFs terminés</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.production.ofs_termines}</p>
                    <p className="text-xs text-green-600">
                      {statsFabrication.production.total_ofs > 0 ? Math.round((statsFabrication.production.ofs_termines / statsFabrication.production.total_ofs) * 100) : 0}% du total
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-emerald-500 opacity-80" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Interventions</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.interventions.total}</p>
                    <p className="text-xs text-gray-500">{statsFabrication.interventions.en_cours} en cours</p>
                  </div>
                  <Wrench className="w-10 h-10 text-indigo-500 opacity-80" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alertes</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.alertes.total}</p>
                    <p className="text-xs text-red-600">{statsFabrication.alertes.urgentes} urgentes</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-500 opacity-80" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tâches planning</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.taches.total}</p>
                    <p className="text-xs text-green-600">{statsFabrication.taches.terminees} terminées</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-teal-500 opacity-80" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Machines</p>
                    <p className="text-2xl font-bold text-gray-900">{statsFabrication.machines.operationnelles}</p>
                    <p className="text-xs text-orange-600">{statsFabrication.machines.en_maintenance} en maintenance</p>
                  </div>
                  <Activity className="w-10 h-10 text-orange-500 opacity-80" />
                </div>
              </div>
            </div>
            {alertesGpao.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Alertes maintenance (récentes)
                </h4>
                <div className="space-y-2">
                  {alertesGpao.map((a: any) => (
                    <div key={a.id_alerte || a.id} className={`p-2 rounded border-l-2 ${a.priorite === 1 ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
                      <p className="font-medium text-sm">{a.type_alerte || a.type}</p>
                      <p className="text-xs text-gray-600">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tâches */}
        {activeTab === 'taches' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Gestion des Tâches</h2>
                <div className="flex gap-3">
                  <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="tous">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminées</option>
                    <option value="retard">En retard</option>
                  </select>
                  <select
                    value={filterPoste}
                    onChange={(e) => setFilterPoste(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="tous">Tous les postes</option>
                    {postes.map(poste => (
                      <option key={poste} value={poste}>{poste}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {tachesFiltrees.map(tache => (
                  <div key={tache.id} className={`border-l-4 p-4 rounded-lg ${
                    tache.priorite === 'urgente' ? 'border-red-500 bg-red-50' :
                    tache.priorite === 'haute' ? 'border-orange-500 bg-orange-50' :
                    'border-blue-500 bg-white'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900">{tache.titre}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(tache.statut)}`}>
                            {tache.statut}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPrioriteColor(tache.priorite)}`}>
                            {tache.priorite}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{tache.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Poste: {tache.poste}</span>
                          <span>Responsable: {tache.responsable}</span>
                          <span>Échéance: {tache.dateEcheance}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progression</span>
                            <span className="font-medium">{tache.progression}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${tache.progression}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleModifierTache(tache)}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => setShowMessageModal(true)}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Avancements */}
        {activeTab === 'avancements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Avancement par Poste</h2>
              <div className="space-y-4">
                {avancements.map(avancement => (
                  <div key={avancement.poste} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{avancement.poste}</h3>
                      <span className="text-2xl font-bold text-blue-600">{avancement.progression}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${avancement.progression}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold ml-2">{avancement.tachesTotal}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Terminées:</span>
                        <span className="font-bold text-green-600 ml-2">{avancement.tachesTerminees}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">En cours:</span>
                        <span className="font-bold text-blue-600 ml-2">{avancement.tachesEnCours}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Retard:</span>
                        <span className="font-bold text-red-600 ml-2">{avancement.tachesRetard}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Financier - Coûts & CA */}
        {activeTab === 'financier' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Coûts & Chiffre d'Affaires</h2>
            
            {/* Chiffre d'Affaires */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Chiffre d'Affaires Fabriqué
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-900">{donneesFinancieres.chiffreAffaire.aujourdhui.toLocaleString('fr-FR')} DT</p>
                  <p className="text-xs text-green-600 mt-1">+12% vs hier</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-1">Cette Semaine</p>
                  <p className="text-2xl font-bold text-blue-900">{donneesFinancieres.chiffreAffaire.semaine.toLocaleString('fr-FR')} DT</p>
                  <p className="text-xs text-blue-600 mt-1">+8% vs semaine dernière</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-700 mb-1">Ce Mois</p>
                  <p className="text-2xl font-bold text-purple-900">{donneesFinancieres.chiffreAffaire.mois.toLocaleString('fr-FR')} DT</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-600">Objectif: {donneesFinancieres.chiffreAffaire.objectifMois.toLocaleString('fr-FR')} DT</span>
                      <span className="font-bold">{donneesFinancieres.chiffreAffaire.progression}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${donneesFinancieres.chiffreAffaire.progression >= 100 ? 'bg-green-600' : 'bg-purple-600'}`}
                        style={{ width: `${Math.min(donneesFinancieres.chiffreAffaire.progression, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique évolution CA */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Évolution CA vs Coûts (6 derniers mois)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={donneesFinancieres.evolutionCA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} DT`} />
                    <Legend />
                    <Line type="monotone" dataKey="ca" stroke="#10b981" strokeWidth={2} name="Chiffre d'Affaires" />
                    <Line type="monotone" dataKey="couts" stroke="#ef4444" strokeWidth={2} name="Coûts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coûts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Analyse des Coûts
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Répartition des coûts */}
                <div>
                  <h4 className="font-semibold mb-4">Répartition des Coûts</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={donneesFinancieres.repartitionCouts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ nom, pourcentage }) => `${nom}: ${pourcentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valeur"
                      >
                        {donneesFinancieres.repartitionCouts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} DT`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Détail des coûts */}
                <div>
                  <h4 className="font-semibold mb-4">Détail par Catégorie</h4>
                  <div className="space-y-3">
                    {donneesFinancieres.repartitionCouts.map((cout, idx) => (
                      <div key={idx} className="border-l-4 p-3 rounded" style={{ borderLeftColor: cout.color }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{cout.nom}</span>
                          <span className="font-bold text-gray-900">{cout.valeur.toLocaleString('fr-FR')} DT</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ width: `${cout.pourcentage}%`, backgroundColor: cout.color }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">{cout.pourcentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-gray-900">Total Coûts</span>
                      <span className="font-bold text-xl text-red-600">{donneesFinancieres.couts.total.toLocaleString('fr-FR')} DT</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Budget mensuel</span>
                      <span className="text-sm font-medium text-gray-700">{donneesFinancieres.couts.budgetMois.toLocaleString('fr-FR')} DT</span>
                    </div>
                    <div className={`flex items-center justify-between mt-2 ${donneesFinancieres.couts.ecart < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="text-sm font-medium">Écart</span>
                      <span className="text-sm font-bold">
                        {donneesFinancieres.couts.ecart > 0 ? '+' : ''}{donneesFinancieres.couts.ecart.toLocaleString('fr-FR')} DT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marge */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Marge Brute
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-700 mb-1">Marge Brute</p>
                  <p className="text-2xl font-bold text-purple-900">{donneesFinancieres.marge.brut.toLocaleString('fr-FR')} DT</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-1">Taux de Marge</p>
                  <p className="text-2xl font-bold text-blue-900">{donneesFinancieres.marge.taux}%</p>
                  <p className="text-xs text-blue-600 mt-1">Objectif: {donneesFinancieres.marge.objectif}%</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Écart vs Objectif</p>
                  <p className={`text-2xl font-bold ${donneesFinancieres.marge.taux >= donneesFinancieres.marge.objectif ? 'text-green-600' : 'text-orange-600'}`}>
                    {donneesFinancieres.marge.taux >= donneesFinancieres.marge.objectif ? '+' : ''}
                    {(donneesFinancieres.marge.taux - donneesFinancieres.marge.objectif).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interventions */}
        {activeTab === 'interventions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Interventions et Modifications</h2>
              <p className="text-gray-600">Ici vous pouvez intervenir directement sur les tâches et les modifier</p>
            </div>
          </div>
        )}
            </>

      {/* Modal Modification Tâche */}
      {selectedTache && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Modifier la Tâche</h3>
                <button onClick={() => setSelectedTache(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <input
                  type="text"
                  value={selectedTache.titre}
                  onChange={(e) => setSelectedTache({...selectedTache, titre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={selectedTache.description}
                  onChange={(e) => setSelectedTache({...selectedTache, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <select
                    value={selectedTache.statut}
                    onChange={(e) => setSelectedTache({...selectedTache, statut: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminée</option>
                    <option value="retard">En retard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priorité</label>
                  <select
                    value={selectedTache.priorite}
                    onChange={(e) => setSelectedTache({...selectedTache, priorite: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Progression (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedTache.progression}
                  onChange={(e) => setSelectedTache({...selectedTache, progression: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTache(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSauvegarderTache}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau Envoyer Message style Facebook – en bas à droite */}
      {showMessageModal && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-t-2xl rounded-bl-2xl shadow-2xl border border-gray-200 overflow-hidden slide-in-from-bottom-4"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)' }}
        >
          {/* Header style Messenger */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold">Envoyer un message</h3>
            </div>
            <button
              onClick={() => setShowMessageModal(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
              <select
                value={messageData.destinataire}
                onChange={(e) => setMessageData({ ...messageData, destinataire: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                <option value="Tous les postes">Tous les postes</option>
                <option value="Tissage">Tissage</option>
                <option value="Coupe">Coupe</option>
                <option value="Atelier">Atelier</option>
                <option value="Mécanique">Mécanique</option>
                <option value="Magasin MP">Magasin MP</option>
                <option value="Contrôle Qualité">Contrôle Qualité</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={messageData.message}
                onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Tapez votre message..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={messageData.urgent}
                onChange={(e) => setMessageData({ ...messageData, urgent: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Message urgent</span>
            </label>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <button
              onClick={() => setShowMessageModal(false)}
              className="px-4 py-2 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleEnvoyerMessage}
              disabled={!messageData.destinataire || !messageData.message}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardAdministrateur;
