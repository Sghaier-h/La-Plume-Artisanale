import React, { useEffect, useState } from 'react';
import { UserCircle, Plus, Edit, Trash2, Search, LayoutDashboard, X, Clock, DollarSign, TrendingUp, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface MembreEquipe {
  id: number;
  nom: string;
  prenom: string;
  fonction: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  utiliseSysteme: boolean; // Indique si l'ouvrier utilise le système
  horaireBrut: number; // Horaire brut en DT
  categorie: string; // Catégorie professionnelle (CAT01 à CAT12)
  echelon: string; // Échelon (E1 à E20)
  salaireBrut: number; // Salaire brut mensuel en DT
  dashboardsAttribues?: string[];
  // Données de pointage (pour intégration future)
  pointage?: {
    tempsTravailleReel?: number; // Heures travaillées réelles
    presence?: {
      date: string;
      present: boolean;
      heuresTravaillees: number;
    }[];
    retard?: {
      date: string;
      minutes: number;
    }[];
    demandes?: {
      id: string;
      type: 'absence' | 'conge' | 'absence_non_approuvee';
      dateDebut: string;
      dateFin: string;
      statut: 'en_attente' | 'approuve' | 'refuse';
      raison?: string;
      remarque?: string;
    }[];
  };
}

const dashboardsDisponibles = [
  { id: 'dashboard', label: 'Dashboard Administrateur', path: '/dashboard-admin' },
  { id: 'magasinier-mp', label: 'Dashboard Magasinier MP', path: '/magasinier-mp' },
  { id: 'tisseur', label: 'Dashboard Tisseur', path: '/tisseur' },
  { id: 'mecanicien', label: 'Dashboard Mécanicien & Entretien', path: '/mecanicien' },
  { id: 'coupe', label: 'Dashboard Coupe', path: '/coupe' },
  { id: 'controle-central', label: 'Dashboard Contrôle Central', path: '/controle-central' },
  { id: 'chef-atelier', label: 'Dashboard Chef d\'Atelier', path: '/chef-atelier' },
  { id: 'magasin-pf', label: 'Dashboard Magasin PF', path: '/magasin-pf' },
  { id: 'chef-production', label: 'Dashboard Chef Production', path: '/chef-production' }
];

const Equipe: React.FC = () => {
  const [membres, setMembres] = useState<MembreEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState<MembreEquipe | null>(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [filterUtiliseSysteme, setFilterUtiliseSysteme] = useState<string>('tous');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    utiliseSysteme: false,
    horaireBrut: 0,
    categorie: '',
    echelon: 'E1',
    salaireBrut: 0,
  });
  const [periodePointage, setPeriodePointage] = useState<'jour' | 'semaine' | 'mois'>('mois');
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [demandeData, setDemandeData] = useState({
    type: 'absence' as 'absence' | 'conge' | 'absence_non_approuvee',
    dateDebut: '',
    dateFin: '',
    raison: '',
    remarque: ''
  });
  const [activeTab, setActiveTab] = useState<'liste' | 'pointage'>('liste');
  const [selectedMembrePointage, setSelectedMembrePointage] = useState<MembreEquipe | null>(null);
  const [pointageData, setPointageData] = useState<any[]>([]);
  const [pointageStats, setPointageStats] = useState<any>(null);
  const [loadingPointage, setLoadingPointage] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('tous'); // 'tous' | 'present' | 'absent' | 'non_pointe'
  const [datePointage, setDatePointage] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadMembres();
  }, []);

  useEffect(() => {
    if (activeTab === 'pointage') {
      loadPointageData();
    }
  }, [activeTab, datePointage]);

  const loadMembres = async () => {
    try {
      // Pour l'instant, données mockées - à remplacer par l'API réelle
      const mockMembres: MembreEquipe[] = [
        { 
          id: 1, 
          nom: 'Dupont', 
          prenom: 'Jean', 
          fonction: 'Chef de Production', 
          email: 'jean.dupont@entreprise.local', 
          telephone: '+33 6 12 34 56 78', 
          actif: true, 
          utiliseSysteme: true,
          horaireBrut: 25.5,
          categorie: 'CAT05',
          echelon: 'E12',
          salaireBrut: 4500,
          dashboardsAttribues: ['dashboard', 'chef-production'],
          pointage: {
            tempsTravailleReel: 168,
            presence: [
              { date: '2025-10-19', present: true, heuresTravaillees: 8 },
              { date: '2025-10-18', present: true, heuresTravaillees: 8 },
              { date: '2025-10-17', present: true, heuresTravaillees: 7.5 },
            ],
            retard: [
              { date: '2025-10-17', minutes: 15 }
            ]
          }
        },
        { 
          id: 2, 
          nom: 'Martin', 
          prenom: 'Marie', 
          fonction: 'Tisseur', 
          email: 'marie.martin@entreprise.local', 
          telephone: '+33 6 23 45 67 89', 
          actif: true, 
          utiliseSysteme: true,
          horaireBrut: 12.5,
          categorie: 'CAT03',
          echelon: 'E8',
          salaireBrut: 1800,
          dashboardsAttribues: ['tisseur'],
          pointage: {
            tempsTravailleReel: 165,
            presence: [
              { date: '2025-10-19', present: true, heuresTravaillees: 8 },
              { date: '2025-10-18', present: true, heuresTravaillees: 8 },
              { date: '2025-10-17', present: false, heuresTravaillees: 0 },
            ],
            retard: [
              { date: '2025-10-19', minutes: 10 },
              { date: '2025-10-18', minutes: 5 }
            ]
          }
        },
        { 
          id: 3, 
          nom: 'Bernard', 
          prenom: 'Pierre', 
          fonction: 'Magasinier', 
          email: 'pierre.bernard@entreprise.local', 
          telephone: '+33 6 34 56 78 90', 
          actif: true, 
          utiliseSysteme: true,
          horaireBrut: 11.0,
          categorie: 'CAT02',
          echelon: 'E5',
          salaireBrut: 1600,
          dashboardsAttribues: ['magasinier-mp', 'magasin-pf']
        },
        { 
          id: 4, 
          nom: 'Ahmed', 
          prenom: 'Ben Ali', 
          fonction: 'Tisseur', 
          actif: true, 
          utiliseSysteme: false, // N'utilise pas le système
          horaireBrut: 11.5,
          categorie: 'CAT03',
          echelon: 'E6',
          salaireBrut: 1650,
          pointage: {
            tempsTravailleReel: 160,
            presence: [
              { date: '2025-10-19', present: true, heuresTravaillees: 8 },
              { date: '2025-10-18', present: true, heuresTravaillees: 8 },
            ],
            demandes: [
              {
                id: 'DEM001',
                type: 'absence',
                dateDebut: '2025-10-20',
                dateFin: '2025-10-22',
                statut: 'en_attente',
                raison: 'Maladie',
                remarque: 'Attente certificat médical'
              }
            ]
          }
        },
        { 
          id: 5, 
          nom: 'Fatma', 
          prenom: 'Gharbi', 
          fonction: 'Contrôle Qualité', 
          email: 'fatma.gharbi@entreprise.local', 
          actif: true, 
          utiliseSysteme: true,
          horaireBrut: 13.0,
          categorie: 'CAT04',
          echelon: 'E9',
          salaireBrut: 1950,
          pointage: {
            tempsTravailleReel: 170,
            presence: [
              { date: '2025-10-19', present: true, heuresTravaillees: 8 },
              { date: '2025-10-18', present: true, heuresTravaillees: 8 },
            ],
            demandes: [
              {
                id: 'DEM002',
                type: 'conge',
                dateDebut: '2025-11-01',
                dateFin: '2025-11-05',
                statut: 'approuve',
                raison: 'Congé annuel',
                remarque: 'Approuvé par le responsable'
              },
              {
                id: 'DEM003',
                type: 'absence_non_approuvee',
                dateDebut: '2025-10-15',
                dateFin: '2025-10-15',
                statut: 'refuse',
                raison: 'Absence non justifiée',
                remarque: 'Absence non autorisée'
              }
            ]
          }
        }
      ];
      setMembres(mockMembres);
    } catch (error) {
      console.error('Erreur chargement équipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API pour créer/modifier un membre
      console.log('Création membre:', formData);
      setShowForm(false);
      setFormData({ nom: '', prenom: '', fonction: '', email: '', telephone: '', utiliseSysteme: false, horaireBrut: 0, categorie: '', echelon: 'E1', salaireBrut: 0 });
      loadMembres();
    } catch (error) {
      console.error('Erreur création membre:', error);
    }
  };

  const loadPointageData = async () => {
    try {
      setLoadingPointage(true);
      const response = await api.get(`/pointage/statut?date=${datePointage}`);
      if (response.data.success) {
        setPointageData(response.data.personnes || []);
        setPointageStats(response.data.statistiques || null);
      }
    } catch (error) {
      console.error('Erreur chargement pointage:', error);
      setPointageData([]);
      setPointageStats(null);
    } finally {
      setLoadingPointage(false);
    }
  };

  const filteredPointageData = pointageData.filter((personne: any) => {
    if (filterStatut === 'tous') return true;
    return personne.statut === filterStatut;
  });

  const filteredMembres = membres.filter(membre => {
    const matchSearch = `${membre.nom} ${membre.prenom} ${membre.fonction}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterUtiliseSysteme === 'tous' || 
      (filterUtiliseSysteme === 'utilise-systeme' && membre.utiliseSysteme) ||
      (filterUtiliseSysteme === 'n-utilise-pas' && !membre.utiliseSysteme);
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categories = ['Ouvrier', 'Ouvrier Qualifié', 'Technicien', 'Agent de Maîtrise', 'Cadre'];
  const echelons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen bg-gray-50 ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <UserCircle className="w-8 h-8 text-blue-600" />
              Ressources Humaines
            </h1>
            <p className="text-gray-600 mt-2">Gestion de tous les ouvriers, coûts, salaires et pointage</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un ouvrier
          </button>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('liste')}
              className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                activeTab === 'liste'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liste des Ouvriers
            </button>
            <button
              onClick={() => setActiveTab('pointage')}
              className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                activeTab === 'pointage'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Suivi Pointage
            </button>
          </div>
        </div>

        {/* Contenu Liste */}
        {activeTab === 'liste' && (
          <>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Nouveau membre de l'équipe</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonction <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={formData.fonction}
                  onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-red-600">*</span></label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Échelon <span className="text-red-600">*</span></label>
                <select
                  value={formData.echelon}
                  onChange={(e) => setFormData({ ...formData, echelon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {echelons.map(ech => (
                    <option key={ech} value={ech}>{ech}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horaire Brut (DT) <span className="text-red-600">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.horaireBrut}
                  onChange={(e) => setFormData({ ...formData, horaireBrut: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire Brut Mensuel (DT) <span className="text-red-600">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salaireBrut}
                  onChange={(e) => setFormData({ ...formData, salaireBrut: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.utiliseSysteme}
                    onChange={(e) => setFormData({ ...formData, utiliseSysteme: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Utilise le système (a accès aux dashboards)</span>
                </label>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ nom: '', prenom: '', fonction: '', email: '', telephone: '', utiliseSysteme: false, horaireBrut: 0, categorie: '', echelon: 'E1', salaireBrut: 0 });
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un ouvrier (nom, prénom, fonction)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterUtiliseSysteme}
              onChange={(e) => setFilterUtiliseSysteme(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les ouvriers</option>
              <option value="utilise-systeme">Utilisent le système</option>
              <option value="n-utilise-pas">N'utilisent pas le système</option>
            </select>
          </div>
        </div>

        {/* Liste des membres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembres.map((membre) => (
            <div key={membre.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${membre.utiliseSysteme ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <UserCircle className={`w-6 h-6 ${membre.utiliseSysteme ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{membre.prenom} {membre.nom}</h3>
                    <p className="text-sm text-gray-600">{membre.fonction}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded text-xs ${membre.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {membre.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {membre.utiliseSysteme && (
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      Utilise système
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Catégorie</p>
                    <p className="font-semibold text-gray-900">{membre.categorie}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Échelon</p>
                    <p className="font-semibold text-gray-900">{membre.echelon}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-blue-600">Horaire Brut</p>
                    <p className="font-bold text-blue-900">{membre.horaireBrut.toFixed(2)} DT</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-green-600">Salaire Brut</p>
                    <p className="font-bold text-green-900">{membre.salaireBrut.toLocaleString('fr-FR')} DT</p>
                  </div>
                </div>
                {membre.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="text-gray-700">{membre.email}</span>
                  </div>
                )}
                {membre.telephone && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-600">Tél:</span>
                    <span className="text-gray-700">{membre.telephone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedMembre(membre);
                    setShowDashboardModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Attribuer Dashboards
                </button>
                {membre.dashboardsAttribues && membre.dashboardsAttribues.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-600 mb-1">Dashboards attribués:</p>
                    <div className="flex flex-wrap gap-1">
                      {membre.dashboardsAttribues.map(dashId => {
                        const dash = dashboardsDisponibles.find(d => d.id === dashId);
                        return dash ? (
                          <span key={dashId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {dash.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembres.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun membre trouvé</p>
          </div>
        )}
          </>
        )}

        {/* Contenu Pointage */}
        {activeTab === 'pointage' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Intégration TimeMoto Active</p>
                  <p className="text-sm text-green-800 mt-1">
                    Les données de pointage sont synchronisées automatiquement depuis TimeMoto en temps réel.
                  </p>
                </div>
              </div>
            </div>

            {/* Sélecteur de date et filtres */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de pointage</label>
                  <input
                    type="date"
                    value={datePointage}
                    onChange={(e) => setDatePointage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par statut</label>
                  <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tous">Tous</option>
                    <option value="present">Présents</option>
                    <option value="absent">Absents</option>
                    <option value="non_pointe">Non pointés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Statistiques globales */}
            {loadingPointage ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Chargement des données de pointage...</p>
              </div>
            ) : pointageStats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Total personnes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pointageStats.total || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">Présents</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {pointageStats.presents || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600">Absents</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {pointageStats.absents || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                  <p className="text-sm text-gray-600">Non pointés</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {pointageStats.non_pointes || 0}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Liste avec pointage */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  Statut des Personnes - {datePointage ? new Date(datePointage).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                </h3>
                <button
                  onClick={loadPointageData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  disabled={loadingPointage}
                >
                  <Clock className="w-4 h-4" />
                  {loadingPointage ? 'Chargement...' : 'Actualiser'}
                </button>
              </div>
              {loadingPointage ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Chargement des données...</p>
                </div>
              ) : filteredPointageData.length === 0 ? (
                <div className="text-center py-12">
                  <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune personne trouvée</p>
                  {filterStatut !== 'tous' && (
                    <p className="text-sm text-gray-500 mt-2">
                      Aucune personne avec le statut "{filterStatut}" pour cette date
                    </p>
                  )}
                </div>
              ) : (
              <div className="divide-y">
                {filteredPointageData.map((personne: any) => (
                  <div key={personne.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          personne.statut === 'present' ? 'bg-green-100' :
                          personne.statut === 'absent' ? 'bg-red-100' :
                          'bg-orange-100'
                        }`}>
                          {personne.statut === 'present' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : personne.statut === 'absent' ? (
                            <X className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{personne.prenom} {personne.nom}</h4>
                          <p className="text-sm text-gray-600">{personne.fonction || 'Employé'}</p>
                          {personne.email && (
                            <p className="text-xs text-gray-500">{personne.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          personne.statut === 'present' ? 'bg-green-100 text-green-800' :
                          personne.statut === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {personne.statut === 'present' ? 'Présent' : 
                           personne.statut === 'absent' ? 'Absent' : 
                           'Non pointé'}
                        </span>
                      </div>
                    </div>
                    {personne.a_pointe && (
                      <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t">
                        <div>
                          <p className="text-gray-600">Heure arrivée</p>
                          <p className="font-bold text-gray-900">
                            {personne.check_in ? new Date(personne.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Heure départ</p>
                          <p className="font-bold text-gray-900">
                            {personne.check_out ? new Date(personne.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'En cours'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Heures travaillées</p>
                          <p className="font-bold text-blue-600">
                            {personne.heures_travaillees ? `${personne.heures_travaillees}h` : '0h'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Retard</p>
                          <p className={`font-bold ${personne.retard_minutes > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {personne.retard_minutes > 0 ? `${personne.retard_minutes} min` : 'Aucun'}
                          </p>
                        </div>
                      </div>
                    )}
                    {!personne.a_pointe && (
                      <p className="text-sm text-gray-500 italic mt-2">Pas encore pointé aujourd'hui</p>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Attribution Dashboards */}
      {showDashboardModal && selectedMembre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Attribution Dashboards - {selectedMembre.prenom} {selectedMembre.nom}
                </h3>
                <button onClick={() => setShowDashboardModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez les dashboards à attribuer à {selectedMembre.prenom} {selectedMembre.nom}
              </p>
              <div className="space-y-2">
                {dashboardsDisponibles.map(dashboard => {
                  const isSelected = selectedMembre.dashboardsAttribues?.includes(dashboard.id) || false;
                  return (
                    <label
                      key={dashboard.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const current = selectedMembre.dashboardsAttribues || [];
                          if (e.target.checked) {
                            setSelectedMembre({
                              ...selectedMembre,
                              dashboardsAttribues: [...current, dashboard.id]
                            });
                          } else {
                            setSelectedMembre({
                              ...selectedMembre,
                              dashboardsAttribues: current.filter(id => id !== dashboard.id)
                            });
                          }
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{dashboard.label}</div>
                        <div className="text-xs text-gray-500">{dashboard.path}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDashboardModal(false);
                  setSelectedMembre(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Sauvegarder les attributions
                  setMembres(prev => prev.map(m => 
                    m.id === selectedMembre.id ? selectedMembre : m
                  ));
                  // TODO: Appel API pour sauvegarder
                  setShowDashboardModal(false);
                  setSelectedMembre(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Pointage */}
      {selectedMembrePointage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Détails Pointage - {selectedMembrePointage.prenom} {selectedMembrePointage.nom}
                </h3>
                <button onClick={() => setSelectedMembrePointage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedMembrePointage.pointage ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">Temps Travaillé Réel</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedMembrePointage.pointage.tempsTravailleReel || 0}h</p>
                      <p className="text-xs text-blue-700 mt-1">Ce mois</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600 mb-1">Retards</p>
                      <p className="text-2xl font-bold text-orange-900">{selectedMembrePointage.pointage.retard?.length || 0}</p>
                      <p className="text-xs text-orange-700 mt-1">Ce mois</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600 mb-1">Absences</p>
                      <p className="text-2xl font-bold text-red-900">
                        {selectedMembrePointage.pointage.presence?.filter(p => !p.present).length || 0}
                      </p>
                      <p className="text-xs text-red-700 mt-1">Ce mois</p>
                    </div>
                  </div>

                  {selectedMembrePointage.pointage.retard && selectedMembrePointage.pointage.retard.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Historique des Retards
                      </h4>
                      <div className="space-y-2">
                        {selectedMembrePointage.pointage.retard.map((retard, idx) => (
                          <div key={idx} className="bg-orange-50 border border-orange-200 rounded p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{new Date(retard.date).toLocaleDateString('fr-FR')}</p>
                              <p className="text-sm text-gray-600">Retard de {retard.minutes} minutes</p>
                            </div>
                            <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-medium">
                              {retard.minutes} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMembrePointage.pointage.presence && selectedMembrePointage.pointage.presence.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Présences Récentes
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedMembrePointage.pointage.presence.map((pres, idx) => (
                          <div key={idx} className={`border rounded p-3 flex items-center justify-between ${pres.present ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-3">
                              {pres.present ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{new Date(pres.date).toLocaleDateString('fr-FR')}</p>
                                <p className="text-sm text-gray-600">
                                  {pres.present ? `${pres.heuresTravaillees}h travaillées` : 'Absent'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${pres.present ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                              {pres.present ? 'Présent' : 'Absent'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune donnée de pointage disponible</p>
                  <p className="text-sm text-gray-500 mt-2">Les données seront synchronisées avec le système de pointage cloud</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedMembrePointage(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Demande */}
      {showDemandeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Nouvelle Demande d'Absence/Congé</h3>
                <button onClick={() => {
                  setShowDemandeModal(false);
                  setDemandeData({ type: 'absence', dateDebut: '', dateFin: '', raison: '', remarque: '' });
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type de demande <span className="text-red-600">*</span></label>
                <select
                  value={demandeData.type}
                  onChange={(e) => setDemandeData({...demandeData, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="absence">Absence</option>
                  <option value="conge">Congé</option>
                  <option value="absence_non_approuvee">Absence non approuvée</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date début <span className="text-red-600">*</span></label>
                  <input
                    type="date"
                    value={demandeData.dateDebut}
                    onChange={(e) => setDemandeData({...demandeData, dateDebut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date fin <span className="text-red-600">*</span></label>
                  <input
                    type="date"
                    value={demandeData.dateFin}
                    onChange={(e) => setDemandeData({...demandeData, dateFin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Raison</label>
                <input
                  type="text"
                  value={demandeData.raison}
                  onChange={(e) => setDemandeData({...demandeData, raison: e.target.value})}
                  placeholder="Ex: Maladie, Congé annuel, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Remarque</label>
                <textarea
                  value={demandeData.remarque}
                  onChange={(e) => setDemandeData({...demandeData, remarque: e.target.value})}
                  placeholder="Ajoutez une remarque ou note supplémentaire..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDemandeModal(false);
                  setDemandeData({ type: 'absence', dateDebut: '', dateFin: '', raison: '', remarque: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // TODO: Appel API pour créer la demande
                  alert(`Demande ${demandeData.type} créée pour la période ${demandeData.dateDebut} - ${demandeData.dateFin}`);
                  setShowDemandeModal(false);
                  setDemandeData({ type: 'absence', dateDebut: '', dateFin: '', raison: '', remarque: '' });
                }}
                disabled={!demandeData.dateDebut || !demandeData.dateFin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipe;
