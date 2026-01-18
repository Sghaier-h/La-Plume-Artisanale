import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, AlertTriangle, CheckCircle, Clock, Search, Scan, 
  ArrowRight, ArrowLeft, Plus, Filter, FileText, Calendar, Building2,
  Phone, Mail, MapPin, MessageSquare, Eye, BarChart3, TrendingUp, Bell,
  X, User, Mail as MailIcon, Phone as PhoneIcon, AlertCircle, Zap
} from 'lucide-react';
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

const DashboardMagasinierSoustraitants: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vue-ensemble' | 'soustraitants' | 'sorties' | 'retours' | 'messages'>('vue-ensemble');
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
    // Polling toutes les 10 secondes pour les messages
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

      setSoustraitantsList(soustraitantsRes.data.data);
      setOfs(ofsRes.data?.data || []);
      setAlertes(alertesRes.data.data);

      // Charger les détails de chaque sous-traitant
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

      // Identifier les OF prêts à sortir (non encore envoyés en sous-traitance)
      const ofsIdsEnSousTraitance = new Set(mouvementsData.map(m => m.numero_of));
      const ofsPretesASortir = (ofsRes.data?.data || [])
        .filter((of: any) => {
          // OF planifiés ou en attente, pas encore envoyés
          return (of.statut === 'PLANIFIE' || of.statut === 'EN_ATTENTE') && 
                 !ofsIdsEnSousTraitance.has(of.numero_of);
        })
        .sort((a: any, b: any) => {
          // Trier par priorité: urgente > haute > normale
          const prioriteOrder: any = { 'urgente': 1, 'haute': 2, 'normale': 3 };
          const orderA = prioriteOrder[a.priorite] || 99;
          const orderB = prioriteOrder[b.priorite] || 99;
          return orderA - orderB;
        });
      setOfsAPrioriser(ofsPretesASortir);

      // Générer alertes qualité pour les sous-traitants
      const qualiteAlertes = soustraitantsDetails
        .filter(st => {
          // Alerte si taux qualité < 90% ou si beaucoup de retours en retard
          return (st.taux_qualite !== null && st.taux_qualite < 90) ||
                 (st.statistiques && st.statistiques.en_retard > 2);
        })
        .map(st => ({
          id_sous_traitant: st.id_sous_traitant,
          raison_sociale: st.raison_sociale,
          type_alerte: st.taux_qualite !== null && st.taux_qualite < 90 ? 'qualite_faible' : 'retards_frequents',
          taux_qualite: st.taux_qualite,
          nb_retards: st.statistiques?.en_retard || 0,
          message: st.taux_qualite !== null && st.taux_qualite < 90
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
      
      // Filtrer les messages urgents liés aux OF en sous-traitance
      const ofsEnCours = mouvements
        .filter(m => m.statut === 'en_cours')
        .map(m => m.numero_of);
      
      const messagesFiltres = allMessages.filter((msg: MessageUrgent) => {
        // Messages urgents
        if (msg.urgent) return true;
        // Messages liés à un OF en sous-traitance
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

  // Statistiques globales
  const stats = {
    totalSoustraitants: soustraitants.length,
    totalEnCours: mouvementsEnCours.length,
    totalRetard: mouvementsRetard.length,
    totalRetournes: mouvements.filter(m => m.statut === 'retourne').length,
    messagesNonLus: messagesUrgents.filter(m => !m.lu).length,
    ofsAPrioriser: ofsAPrioriser.length,
    alertesQualite: alertesQualite.length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ml-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Magasinier Sous-Traitants
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion complète des transferts et retours vers/des sous-traitants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {messagesUrgents.filter(m => !m.lu).length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-red-600 animate-pulse" />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {messagesUrgents.filter(m => !m.lu).length}
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  if (activeTab === 'sorties') {
                    setShowModalSortie(true);
                  } else if (activeTab === 'retours') {
                    setShowModalRetour(true);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'sorties' ? 'Nouvelle Sortie' : activeTab === 'retours' ? 'Enregistrer Retour' : 'Action'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Urgents Banner */}
      {messagesUrgents.filter(m => !m.lu).length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-red-600 mr-2 animate-pulse" />
                <h3 className="text-lg font-bold text-red-800">
                  {messagesUrgents.filter(m => !m.lu).length} Message(s) Urgent(s)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-red-700 hover:text-red-900 underline text-sm"
              >
                Voir tous les messages
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {messagesUrgents.filter(m => !m.lu).slice(0, 3).map((msg) => (
                <div key={msg.id_message} className="text-sm text-red-700 bg-white p-2 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="font-semibold">{msg.expediteur_nom || 'Système'}: </span>
                      <span>{msg.sujet}</span>
                      {msg.numero_of && <span className="ml-2 text-xs">(OF: {msg.numero_of})</span>}
                    </div>
                    <button
                      onClick={() => handleMarquerMessageLu(msg.id_message)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alertes Qualité Sous-Traitants */}
      {alertesQualite.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-red-800">
                {alertesQualite.length} Alerte(s) Qualité Sous-Traitant
              </h3>
            </div>
            <div className="mt-2 space-y-2">
              {alertesQualite.slice(0, 5).map((alerte: any) => (
                <div key={alerte.id_sous_traitant} className="text-sm text-red-700 bg-white p-2 rounded">
                  <span className="font-semibold">{alerte.raison_sociale}:</span> {alerte.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alertes Retards */}
      {alertes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-bold text-orange-800">
                {alertes.length} Retour(s) en retard
              </h3>
            </div>
            <div className="mt-2 space-y-1">
              {alertes.slice(0, 3).map((alerte: any) => (
                <div key={alerte.id_mouvement_st} className="text-sm text-orange-700">
                  {alerte.raison_sociale} - {alerte.numero_of} - Retard de{' '}
                  {Math.ceil((new Date().getTime() - new Date(alerte.date_retour_prevue).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistiques Rapides */}
      {activeTab === 'vue-ensemble' && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sous-Traitants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSoustraitants}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Cours</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.totalEnCours}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Retard</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalRetard}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retournés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalRetournes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-red-600">{stats.messagesNonLus}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-2 border-orange-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">OF à Prioriser</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.ofsAPrioriser}</p>
                </div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-2 border-red-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertes Qualité</p>
                  <p className="text-2xl font-bold text-red-600">{stats.alertesQualite}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('vue-ensemble')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'vue-ensemble'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Vue d'Ensemble</span>
            </button>
            <button
              onClick={() => setActiveTab('soustraitants')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'soustraitants'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="font-medium">Sous-Traitants</span>
            </button>
            <button
              onClick={() => setActiveTab('sorties')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'sorties'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Sorties</span>
            </button>
            <button
              onClick={() => setActiveTab('retours')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'retours'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Retours</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                activeTab === 'messages'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Messages</span>
              {messagesUrgents.filter(m => !m.lu).length > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {messagesUrgents.filter(m => !m.lu).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content selon l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'vue-ensemble' && (
          <div className="space-y-6">
            {/* Liste des Sous-Traitants avec résumé */}
            <div>
              <h2 className="text-xl font-bold mb-4">Sous-Traitants Actifs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soustraitants.map(st => (
                  <div key={st.id_sous_traitant} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedSoustraitant(st);
                      setShowModalDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{st.raison_sociale}</h3>
                        <p className="text-sm text-gray-600">{st.code_sous_traitant}</p>
                      </div>
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-2 text-sm">
                      {st.specialite && (
                        <p><span className="font-semibold">Spécialité:</span> {st.specialite}</p>
                      )}
                      {st.statistiques && (
                        <div className="flex space-x-4 mt-3 pt-3 border-t">
                          <div>
                            <span className="text-gray-600">En cours:</span>
                            <span className="ml-2 font-bold text-yellow-600">{st.statistiques.en_cours || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Retard:</span>
                            <span className="ml-2 font-bold text-orange-600">{st.statistiques.en_retard || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mouvements récents */}
            <div>
              <h2 className="text-xl font-bold mb-4">Mouvements Récents</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Numéro</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Sous-Traitant</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">OF</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Date Sortie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMouvements.slice(0, 10).map(m => (
                        <tr key={m.id_mouvement_st} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{m.numero_mouvement}</td>
                          <td className="px-4 py-3 text-sm">{m.raison_sociale}</td>
                          <td className="px-4 py-3 text-sm">{m.numero_of || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              m.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                              m.statut === 'retourne' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {m.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(m.date_mouvement).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'soustraitants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Liste Complète des Sous-Traitants</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {soustraitants
                .filter(st => !search || st.raison_sociale.toLowerCase().includes(search.toLowerCase()))
                .map(st => (
                <div key={st.id_sous_traitant} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{st.raison_sociale}</h3>
                      <p className="text-sm text-gray-600">{st.code_sous_traitant}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSoustraitant(st);
                        setShowModalDetails(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Détails
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    {st.specialite && (
                      <p><span className="font-semibold">Spécialité:</span> {st.specialite}</p>
                    )}
                    {st.delai_moyen_jours && (
                      <p><span className="font-semibold">Délai moyen:</span> {st.delai_moyen_jours} jours</p>
                    )}
                    {st.telephone && (
                      <p className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-600" />
                        {st.telephone}
                      </p>
                    )}
                    {st.email && (
                      <p className="flex items-center">
                        <MailIcon className="w-4 h-4 mr-2 text-gray-600" />
                        {st.email}
                      </p>
                    )}
                  </div>

                  {st.statistiques && (
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-600">En cours</p>
                          <p className="text-lg font-bold text-yellow-600">{st.statistiques.en_cours || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Retard</p>
                          <p className="text-lg font-bold text-orange-600">{st.statistiques.en_retard || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Total</p>
                          <p className="text-lg font-bold text-gray-900">{st.statistiques.total_mouvements || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'sorties' || activeTab === 'retours') && (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro mouvement, sous-traitant, OF, QR code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Numéro</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Sous-Traitant</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">OF</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">QR Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Num. Suivi</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Date Sortie</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Retour Prévu</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Statut</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMouvements
                      .filter(m => activeTab === 'sorties' 
                        ? m.type_mouvement === 'sortie' && m.statut === 'en_cours'
                        : m.statut === 'en_cours'
                      )
                      .length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          Aucun mouvement trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredMouvements
                        .filter(m => activeTab === 'sorties' 
                          ? m.type_mouvement === 'sortie' && m.statut === 'en_cours'
                          : m.statut === 'en_cours'
                        )
                        .map((mouvement) => (
                        <tr key={mouvement.id_mouvement_st} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{mouvement.numero_mouvement}</td>
                          <td className="py-3 px-4">{mouvement.raison_sociale}</td>
                          <td className="py-3 px-4">{mouvement.numero_of || '-'}</td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {mouvement.qr_code_sortie || mouvement.qr_code_retour || '-'}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {mouvement.numero_suivi_transporteur || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {mouvement.date_retour_prevue ? (
                              new Date(mouvement.date_retour_prevue).toLocaleDateString('fr-FR')
                            ) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              mouvement.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                              mouvement.statut === 'retourne' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {mouvement.statut}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {activeTab === 'retours' && mouvement.statut === 'en_cours' && (
                              <button
                                onClick={() => {
                                  setFormRetour({
                                    ...formRetour,
                                    id_mouvement: mouvement.id_mouvement_st.toString(),
                                    qr_code_retour: mouvement.qr_code_sortie || ''
                                  });
                                  setShowModalRetour(true);
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Enregistrer Retour
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Messages et Alertes des Autres Postes</h2>
            {messagesUrgents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun message urgent pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messagesUrgents.map(msg => (
                  <div key={msg.id_message} className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                    msg.urgent ? 'border-red-500' : 'border-blue-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {msg.urgent && <AlertTriangle className="w-5 h-5 text-red-600" />}
                          <h3 className="font-bold text-lg">{msg.sujet}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          De: <span className="font-semibold">{msg.expediteur_nom || 'Système'}</span>
                          {msg.numero_of && (
                            <span className="ml-4">OF concerné: <span className="font-semibold">{msg.numero_of}</span></span>
                          )}
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(msg.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {!msg.lu && (
                        <button
                          onClick={() => handleMarquerMessageLu(msg.id_message)}
                          className="ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                        >
                          Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Détails Sous-Traitant */}
      {showModalDetails && selectedSoustraitant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Détails Sous-Traitant</h3>
              <button onClick={() => setShowModalDetails(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-bold mb-2">{selectedSoustraitant.raison_sociale}</h4>
                <p className="text-sm text-gray-600">Code: {selectedSoustraitant.code_sous_traitant}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3">Informations Contact</h5>
                  <div className="space-y-2 text-sm">
                    {selectedSoustraitant.telephone && (
                      <p className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-600" />
                        {selectedSoustraitant.telephone}
                      </p>
                    )}
                    {selectedSoustraitant.email && (
                      <p className="flex items-center">
                        <MailIcon className="w-4 h-4 mr-2 text-gray-600" />
                        {selectedSoustraitant.email}
                      </p>
                    )}
                    {selectedSoustraitant.adresse && (
                      <p className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-600 mt-1" />
                        <span>{selectedSoustraitant.adresse}</span>
                      </p>
                    )}
                    {selectedSoustraitant.contact_principal && (
                      <p><span className="font-semibold">Contact principal:</span> {selectedSoustraitant.contact_principal}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-3">Informations Techniques</h5>
                  <div className="space-y-2 text-sm">
                    {selectedSoustraitant.specialite && (
                      <p><span className="font-semibold">Spécialité:</span> {selectedSoustraitant.specialite}</p>
                    )}
                    {selectedSoustraitant.delai_moyen_jours && (
                      <p><span className="font-semibold">Délai moyen:</span> {selectedSoustraitant.delai_moyen_jours} jours</p>
                    )}
                    {selectedSoustraitant.capacite_production && (
                      <p><span className="font-semibold">Capacité:</span> {selectedSoustraitant.capacite_production}</p>
                    )}
                    {selectedSoustraitant.taux_qualite && (
                      <p><span className="font-semibold">Taux qualité:</span> {selectedSoustraitant.taux_qualite}%</p>
                    )}
                    <p>
                      <span className="font-semibold">Statut:</span>{' '}
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedSoustraitant.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedSoustraitant.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedSoustraitant.statistiques && (
                <div>
                  <h5 className="font-semibold mb-3">Statistiques</h5>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{selectedSoustraitant.statistiques.total_mouvements || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded text-center">
                      <p className="text-sm text-gray-600">En cours</p>
                      <p className="text-2xl font-bold text-yellow-600">{selectedSoustraitant.statistiques.en_cours || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded text-center">
                      <p className="text-sm text-gray-600">En retard</p>
                      <p className="text-2xl font-bold text-orange-600">{selectedSoustraitant.statistiques.en_retard || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-center">
                      <p className="text-sm text-gray-600">Retournés</p>
                      <p className="text-2xl font-bold text-green-600">{selectedSoustraitant.statistiques.retournes || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedSoustraitant.mouvements && selectedSoustraitant.mouvements.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3">OF en Cours chez ce Sous-Traitant</h5>
                  <div className="bg-gray-50 rounded p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedSoustraitant.mouvements.map(mouv => (
                        <div key={mouv.id_mouvement_st} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{mouv.numero_of}</p>
                              {mouv.article_designation && (
                                <p className="text-sm text-gray-600">{mouv.article_designation}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Sortie: {new Date(mouv.date_mouvement).toLocaleDateString('fr-FR')}
                                {mouv.date_retour_prevue && (
                                  <> | Retour prévu: {new Date(mouv.date_retour_prevue).toLocaleDateString('fr-FR')}</>
                                )}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              mouv.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {mouv.statut}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sortie */}
      {showModalSortie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Enregistrer Sortie vers Sous-Traitant</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sous-Traitant *</label>
                  <select
                    value={formSortie.id_sous_traitant}
                    onChange={(e) => setFormSortie({ ...formSortie, id_sous_traitant: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {soustraitantsList.map(st => (
                      <option key={st.id_sous_traitant} value={st.id_sous_traitant}>
                        {st.raison_sociale}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ordre de Fabrication *</label>
                  <select
                    value={formSortie.id_of}
                    onChange={(e) => setFormSortie({ ...formSortie, id_of: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {ofs.map(of => (
                      <option key={of.id_of} value={of.id_of}>
                        {of.numero_of}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  QR Code / Numéro de Suivi (Scanner ou Saisir) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formSortie.qr_code_sortie}
                    onChange={(e) => setFormSortie({ ...formSortie, qr_code_sortie: e.target.value })}
                    placeholder="Scannez ou saisissez le numéro de suivi"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    autoFocus
                  />
                  <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de Suivi Transporteur</label>
                <input
                  type="text"
                  value={formSortie.numero_suivi_transporteur}
                  onChange={(e) => setFormSortie({ ...formSortie, numero_suivi_transporteur: e.target.value })}
                  placeholder="Numéro de suivi du transporteur (optionnel)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date Sortie *</label>
                  <input
                    type="date"
                    value={formSortie.date_sortie}
                    onChange={(e) => setFormSortie({ ...formSortie, date_sortie: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité</label>
                  <input
                    type="number"
                    value={formSortie.quantite}
                    onChange={(e) => setFormSortie({ ...formSortie, quantite: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={formSortie.observations}
                  onChange={(e) => setFormSortie({ ...formSortie, observations: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModalSortie(false);
                  resetFormSortie();
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleEnregistrerSortie}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enregistrer Sortie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Retour */}
      {showModalRetour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Enregistrer Retour depuis Sous-Traitant</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  QR Code / Numéro de Suivi Retour (Scanner ou Saisir) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formRetour.qr_code_retour}
                    onChange={(e) => setFormRetour({ ...formRetour, qr_code_retour: e.target.value })}
                    placeholder="Scannez ou saisissez le numéro de suivi"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    autoFocus
                  />
                  <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date Retour *</label>
                  <input
                    type="date"
                    value={formRetour.date_retour}
                    onChange={(e) => setFormRetour({ ...formRetour, date_retour: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité Retournée *</label>
                  <input
                    type="number"
                    value={formRetour.quantite_retournee}
                    onChange={(e) => setFormRetour({ ...formRetour, quantite_retournee: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité Conforme</label>
                  <input
                    type="number"
                    value={formRetour.quantite_conforme}
                    onChange={(e) => setFormRetour({ ...formRetour, quantite_conforme: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité Non Conforme</label>
                  <input
                    type="number"
                    value={formRetour.quantite_non_conforme}
                    onChange={(e) => setFormRetour({ ...formRetour, quantite_non_conforme: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={formRetour.observations}
                  onChange={(e) => setFormRetour({ ...formRetour, observations: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModalRetour(false);
                  resetFormRetour();
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleEnregistrerRetour}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enregistrer Retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMagasinierSoustraitants;
