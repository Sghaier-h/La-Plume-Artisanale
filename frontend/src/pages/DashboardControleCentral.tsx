import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Factory, CheckCircle, Package, FlaskConical, Wrench, Users2, Users, Shield, 
  TrendingUp, AlertTriangle, Bell, User, Calendar, Scissors, FileText, Plus, Download, 
  Settings, Eye, Edit, X, Save, Clock, Star, Award, AlertCircle
} from 'lucide-react';

const DashboardControleCentral = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('tissage');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<{ [key: string]: number }>({});

  // Données pour les graphiques
  const dataCommandes = [
    { name: 'Lun', reçues: 45, terminées: 38 },
    { name: 'Mar', reçues: 52, terminées: 45 },
    { name: 'Mer', reçues: 38, terminées: 42 },
    { name: 'Jeu', reçues: 48, terminées: 51 },
    { name: 'Ven', reçues: 56, terminées: 48 },
    { name: 'Sam', reçues: 42, terminées: 39 },
    { name: 'Dim', reçues: 47, terminées: 44 }
  ];

  const dataTissage = [
    { name: 'M-01', production: 1250 },
    { name: 'M-03', production: 1180 },
    { name: 'M-05', production: 1320 },
    { name: 'M-07', production: 980 },
    { name: 'M-09', production: 1290 },
    { name: 'M-11', production: 1150 }
  ];

  const dataCoupe = [
    { name: 'Opérateur 1', value: 180 },
    { name: 'Opérateur 2', value: 165 },
    { name: 'Opérateur 3', value: 195 },
    { name: 'Opérateur 4', value: 170 },
    { name: 'Opérateur 5', value: 137 }
  ];

  const dataPlanif = [
    { name: 'En cours', value: 156 },
    { name: 'Terminé', value: 98 },
    { name: 'En attente', value: 32 },
    { name: 'Retard', value: 18 }
  ];

  const dataQualiteFab = [
    { name: 'Tissage', contrôles: 28 },
    { name: 'Coupe', contrôles: 15 },
    { name: 'Atelier', contrôles: 32 },
    { name: 'Magasin PF', contrôles: 18 },
    { name: 'Entrepôt', contrôles: 12 }
  ];

  const dataPliage = [
    { name: '8h', pièces: 120 },
    { name: '10h', pièces: 235 },
    { name: '12h', pièces: 340 },
    { name: '14h', pièces: 480 },
    { name: '16h', pièces: 625 },
    { name: '18h', pièces: 747 }
  ];

  const dataMP = [
    { name: 'Coton', stock: 2450 },
    { name: 'Bambou', stock: 1850 },
    { name: 'Lin', stock: 980 },
    { name: 'Polyester', stock: 1120 },
    { name: 'Mélange', stock: 760 }
  ];

  const dataSousTraitance = [
    { name: 'Frange', enCours: 450, retournés: 350 },
    { name: 'Couture', enCours: 320, retournés: 280 },
    { name: 'Broderie', enCours: 200, retournés: 120 },
    { name: 'Sérigraphie', enCours: 150, retournés: 95 }
  ];

  const dataTRS = [
    { name: 'Sem 1', trs: 84.5 },
    { name: 'Sem 2', trs: 86.2 },
    { name: 'Sem 3', trs: 87.8 },
    { name: 'Sem 4', trs: 87.3 }
  ];

  const dataProductionMois = [
    { name: 'Jan', production: 24500 },
    { name: 'Fév', production: 26800 },
    { name: 'Mar', production: 25300 },
    { name: 'Avr', production: 28100 },
    { name: 'Mai', production: 27500 },
    { name: 'Juin', production: 26900 }
  ];

  const dataPerformancePersonnel = [
    { name: 'Sem 1', note: 8.1 },
    { name: 'Sem 2', note: 8.3 },
    { name: 'Sem 3', note: 8.5 },
    { name: 'Sem 4', note: 8.4 }
  ];

  const dataDepartements = [
    { name: 'Tissage', note: 8.4 },
    { name: 'Coupe', note: 8.6 },
    { name: 'Atelier', note: 8.9 },
    { name: 'Mécanique', note: 9.1 }
  ];

  const dataSecuriteZones = [
    { subject: 'Tissage', value: 9.1 },
    { subject: 'Coupe', value: 8.5 },
    { subject: 'Atelier', value: 9.5 },
    { subject: 'Magasin MP', value: 9.8 },
    { subject: 'Magasin PF', value: 9.5 },
    { subject: 'Entrepôt', value: 9.3 }
  ];

  const dataIncidents = [
    { name: 'Jan', incidents: 5 },
    { name: 'Fév', incidents: 3 },
    { name: 'Mar', incidents: 4 },
    { name: 'Avr', incidents: 2 },
    { name: 'Mai', incidents: 1 },
    { name: 'Juin', incidents: 3 },
    { name: 'Juil', incidents: 2 },
    { name: 'Août', incidents: 1 },
    { name: 'Sep', incidents: 2 },
    { name: 'Oct', incidents: 2 }
  ];

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

  const handleRatingClick = (criterion: string, value: number) => {
    setSelectedRating({ ...selectedRating, [criterion]: value });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">COMMANDES ACTIVES</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">284</p>
              <p className="text-xs text-gray-500 mt-1">Commandes en cours de traitement</p>
            </div>
            <Package className="text-gray-300" size={40} />
          </div>
          <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <TrendingUp size={12} />
            +12% vs semaine dernière
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">TRS GLOBAL</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">87.3%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de Rendement Synthétique</p>
            </div>
            <Settings className="text-gray-300" size={40} />
          </div>
          <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <TrendingUp size={12} />
            Objectif: &gt;85%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">QUALITÉ PRODUIT</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">96.8%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de conformité</p>
            </div>
            <CheckCircle className="text-gray-300" size={40} />
          </div>
          <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <TrendingUp size={12} />
            +2.3%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">PRODUCTION JOUR</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">1,247</p>
              <p className="text-xs text-gray-500 mt-1">Unités produites aujourd'hui</p>
            </div>
            <Factory className="text-gray-300" size={40} />
          </div>
          <div className="mt-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <TrendingUp size={12} className="rotate-180" />
            -5% vs objectif
          </div>
        </div>
      </div>

      {/* Répartition Commandes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            Répartition des Commandes
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">
              Exporter
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
              Nouvelle commande
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-800">156</div>
            <div className="text-sm text-gray-600 mt-1">En fabrication 🟢</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-800">78</div>
            <div className="text-sm text-gray-600 mt-1">Sous-traitance 🟣</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-gray-800">32</div>
            <div className="text-sm text-gray-600 mt-1">Atelier 🟠</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-800">18</div>
            <div className="text-sm text-gray-600 mt-1">Retard 🔴</div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataCommandes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reçues" stroke="#4CAF50" strokeWidth={2} name="Commandes reçues" />
              <Line type="monotone" dataKey="terminées" stroke="#2196F3" strokeWidth={2} name="Commandes terminées" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicateurs Production */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="text-blue-600" />
            Processus de Fabrication
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-800">91.2%</div>
              <div className="text-sm text-gray-600 mt-1">Rendement réel</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-gray-800">3.8%</div>
              <div className="text-sm text-gray-600 mt-1">Taux de panne</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="text-2xl font-bold text-gray-800">2.1%</div>
              <div className="text-sm text-gray-600 mt-1">Taux de rebut</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-800">97%</div>
              <div className="text-sm text-gray-600 mt-1">Respect planning</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FlaskConical className="text-blue-600" />
            Matières Premières
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Disponibilité matière</span>
              <span className="font-semibold">94%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span className="text-sm text-yellow-800"><strong>5 articles</strong> en dessous du seuil minimal</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFabrication = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Factory className="text-blue-600" />
          Processus de Fabrication
        </h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('tissage')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'tissage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          🧵 Tissage
        </button>
        <button
          onClick={() => setActiveTab('coupe')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'coupe' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          ✂️ Coupe
        </button>
        <button
          onClick={() => setActiveTab('planification')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'planification' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Planification
        </button>
      </div>

      {activeTab === 'tissage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg">
              <div className="text-sm opacity-90 mb-2">Machines actives</div>
              <div className="text-3xl font-bold">12 / 15</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg">
              <div className="text-sm opacity-90 mb-2">Opérateurs</div>
              <div className="text-3xl font-bold">18</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-lg">
              <div className="text-sm opacity-90 mb-2">Production/h</div>
              <div className="text-3xl font-bold">156 m</div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataTissage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="production" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avancement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">M-01</td>
                  <td className="px-6 py-4">Ahmed K.</td>
                  <td className="px-6 py-4">OF249780</td>
                  <td className="px-6 py-4">IBIZA 1020</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">En cours</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">M-03</td>
                  <td className="px-6 py-4">Sara M.</td>
                  <td className="px-6 py-4">OF249781</td>
                  <td className="px-6 py-4">FOUTA CLASSIQUE</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">En cours</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">M-05</td>
                  <td className="px-6 py-4">Mohamed B.</td>
                  <td className="px-6 py-4">OF249782</td>
                  <td className="px-6 py-4">HAMMAN LUXE</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Terminé</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">M-07</td>
                  <td className="px-6 py-4">Fatima Z.</td>
                  <td className="px-6 py-4">OF249785</td>
                  <td className="px-6 py-4">SERVIETTE SPA</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Retard</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupe' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-800">847</div>
              <div className="text-sm text-gray-600 mt-1">Pièces coupées aujourd'hui</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-gray-800">1.2%</div>
              <div className="text-sm text-gray-600 mt-1">Taux de rebut coupe</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-gray-800">6</div>
              <div className="text-sm text-gray-600 mt-1">Opérateurs actifs</div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataCoupe}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataCoupe.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'planification' && (
        <div className="space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm text-green-800"><strong>97%</strong> des OF sont dans les délais prévus</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPlanif}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataPlanif.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sous OF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté à fabriquer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté fabriquée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tisseur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">SOF-2025-001</td>
                  <td className="px-6 py-4">M-01</td>
                  <td className="px-6 py-4">CL00884</td>
                  <td className="px-6 py-4">IBIZA</td>
                  <td className="px-6 py-4">320</td>
                  <td className="px-6 py-4">240</td>
                  <td className="px-6 py-4">Ahmed K.</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">En cours</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">SOF-2025-002</td>
                  <td className="px-6 py-4">M-03</td>
                  <td className="px-6 py-4">CL00892</td>
                  <td className="px-6 py-4">FOUTA CLASSIQUE</td>
                  <td className="px-6 py-4">500</td>
                  <td className="px-6 py-4">500</td>
                  <td className="px-6 py-4">Sara M.</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Terminé</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderQualite = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">CONTRÔLES JOUR</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">47</p>
              <p className="text-xs text-gray-500 mt-1">Contrôles effectués aujourd'hui</p>
            </div>
            <CheckCircle className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">CONFORMITÉ</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">96.8%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de conformité global</p>
            </div>
            <TrendingUp className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">NON-CONFORMITÉS</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">8</p>
              <p className="text-xs text-gray-500 mt-1">En attente de correction</p>
            </div>
            <AlertTriangle className="text-gray-300" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-blue-600" />
            Contrôles par Secteur
          </h2>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
            Nouveau contrôle
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b">
          <button className="px-6 py-3 font-semibold border-b-2 border-blue-600 text-blue-600">
            🏭 Fabrication
          </button>
          <button className="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-800">
            🧺 Atelier
          </button>
          <button className="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-800">
            📦 Magasin PF
          </button>
          <button className="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-800">
            🏠 Entrepôt
          </button>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataQualiteFab} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="contrôles" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type de contrôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résultat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contrôleur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">19/10 14:23</td>
                <td className="px-6 py-4 font-bold">Tissage M-01</td>
                <td className="px-6 py-4">QR-TIS-2025-047</td>
                <td className="px-6 py-4">Conformité matière</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Conforme</span>
                </td>
                <td className="px-6 py-4">CQ Central</td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                    Détails
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">19/10 13:15</td>
                <td className="px-6 py-4 font-bold">Tissage M-05</td>
                <td className="px-6 py-4">QR-TIS-2025-046</td>
                <td className="px-6 py-4">Densité</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Non conforme</span>
                </td>
                <td className="px-6 py-4">CQ Central</td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                    Actions correctives
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAtelier = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-600" />
          Atelier Finition
        </h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
          Scanner nouveau lot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-800">234</div>
          <div className="text-sm text-gray-600 mt-1">Lots en cours</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gray-800">1,247</div>
          <div className="text-sm text-gray-600 mt-1">Pièces traitées aujourd'hui</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-800">97.8%</div>
          <div className="text-sm text-gray-600 mt-1">Taux de conformité</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-800">12</div>
          <div className="text-sm text-gray-600 mt-1">Opérateurs actifs</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button className="px-6 py-3 font-semibold border-b-2 border-blue-600 text-blue-600">
          Pliage
        </button>
        <button className="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-800">
          Couture
        </button>
        <button className="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-800">
          Étiquetage
        </button>
        <button className="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-800">
          Emballage
        </button>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataPliage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pièces" stroke="#4CAF50" strokeWidth={2} name="Pièces pliées" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMatieres = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">ARTICLES MP</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">416</p>
              <p className="text-xs text-gray-500 mt-1">Articles en stock</p>
            </div>
            <FlaskConical className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">FOURNITURES</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">64</p>
              <p className="text-xs text-gray-500 mt-1">Types de fournitures</p>
            </div>
            <Package className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">DISPONIBILITÉ</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">94%</p>
              <p className="text-xs text-gray-500 mt-1">Matière disponible</p>
            </div>
            <CheckCircle className="text-gray-300" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FlaskConical className="text-blue-600" />
            Gestion des Matières Premières
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">
              Demande réappro
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
              Nouvelle entrée
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex items-center gap-3 mb-6">
          <AlertTriangle className="text-yellow-600" size={20} />
          <div>
            <strong>5 articles en alerte</strong>
            <div className="text-xs text-yellow-800 mt-1">Stock inférieur au seuil minimal</div>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataMP}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code MP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock actuel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seuil min</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">MP-001</td>
                <td className="px-6 py-4">Fil Coton 100% Blanc</td>
                <td className="px-6 py-4">Fil</td>
                <td className="px-6 py-4">2,450 kg</td>
                <td className="px-6 py-4">500 kg</td>
                <td className="px-6 py-4">kg</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">OK</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">MP-015</td>
                <td className="px-6 py-4">Fil Coton Bleu Marine</td>
                <td className="px-6 py-4">Fil</td>
                <td className="px-6 py-4">380 kg</td>
                <td className="px-6 py-4">500 kg</td>
                <td className="px-6 py-4">kg</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Alerte</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMecanique = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">DISPONIBILITÉ</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">96.2%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de disponibilité machines</p>
            </div>
            <Settings className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">MTTR</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">2.3h</p>
              <p className="text-xs text-gray-500 mt-1">Délai moyen de réparation</p>
            </div>
            <Wrench className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">MTBF</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">187h</p>
              <p className="text-xs text-gray-500 mt-1">Temps moyen entre pannes</p>
            </div>
            <TrendingUp className="text-gray-300" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="text-blue-600" />
            Maintenance et Interventions
          </h2>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
            Nouvelle intervention
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type intervention</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mécanicien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">M-07</td>
                <td className="px-6 py-4">Réparation urgente</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Haute</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">En cours</span>
                </td>
                <td className="px-6 py-4">19/10 14:00</td>
                <td className="px-6 py-4">Karim T.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSoustraitance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">EN COURS</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">78</p>
              <p className="text-xs text-gray-500 mt-1">Lots chez sous-traitants</p>
            </div>
            <Users2 className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">RETOURS JOUR</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">23</p>
              <p className="text-xs text-gray-500 mt-1">Lots retournés aujourd'hui</p>
            </div>
            <Package className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">DÉLAI MOYEN</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">3.2j</p>
              <p className="text-xs text-gray-500 mt-1">Temps moyen de traitement</p>
            </div>
            <Clock className="text-gray-300" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users2 className="text-blue-600" />
            Suivi Sous-traitance
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">
              État quotidien
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
              Nouvel envoi
            </button>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataSousTraitance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enCours" fill="#FF9800" name="En cours" />
              <Bar dataKey="retournés" fill="#4CAF50" name="Retournés" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sous-traitant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type opération</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté totale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté retournée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date envoi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">ST-FRANGE-01</td>
                <td className="px-6 py-4">QR-ST-2025-045</td>
                <td className="px-6 py-4">Frange</td>
                <td className="px-6 py-4">500</td>
                <td className="px-6 py-4">350</td>
                <td className="px-6 py-4">150</td>
                <td className="px-6 py-4">15/10/2025</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">En cours</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPersonnel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">PERSONNEL TOTAL</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">47</p>
              <p className="text-xs text-gray-500 mt-1">Employés actifs</p>
            </div>
            <Users className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">NOTE MOYENNE</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">8.4/10</p>
              <p className="text-xs text-gray-500 mt-1">Performance globale</p>
            </div>
            <Star className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">PONCTUALITÉ</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">94%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de présence à l'heure</p>
            </div>
            <Clock className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">INCIDENTS</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">3</p>
              <p className="text-xs text-gray-500 mt-1">Ce mois-ci</p>
            </div>
            <AlertTriangle className="text-gray-300" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            Évaluation du Personnel
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">
              Rapport mensuel
            </button>
            <button 
              onClick={() => setShowEvaluationModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
            >
              Nouvelle évaluation
            </button>
          </div>
        </div>

        {/* Évaluations employés */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold text-gray-800">Ahmed Karim</div>
                <div className="text-sm text-gray-600">Tisseur - Machine M-01</div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                8.7
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span className="text-sm text-gray-600">📊 Rendement</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">9/10</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span className="text-sm text-gray-600">⏰ Ponctualité</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">10/10</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span className="text-sm text-gray-600">🎯 Attention au poste</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">8/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurite = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">CONFORMITÉ SÉCURITÉ</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">97%</p>
              <p className="text-xs text-gray-500 mt-1">Taux de conformité</p>
            </div>
            <Shield className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">INCIDENTS</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">2</p>
              <p className="text-xs text-gray-500 mt-1">Ce mois-ci</p>
            </div>
            <AlertTriangle className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">JOURS SANS ACCIDENT</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">247</p>
              <p className="text-xs text-gray-500 mt-1">Objectif: 365 jours</p>
            </div>
            <CheckCircle className="text-gray-300" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">PROPRETÉ</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">9.2/10</p>
              <p className="text-xs text-gray-500 mt-1">Note moyenne</p>
            </div>
            <Award className="text-gray-300" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-blue-600" />
            Contrôles Sécurité & Environnement
          </h2>
          <button 
            onClick={() => setShowSecurityModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
          >
            Nouveau contrôle
          </button>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dataSecuriteZones}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 10]} />
              <Radar name="Conformité" dataKey="value" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataIncidents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#F44336" strokeWidth={2} name="Incidents" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Indicateurs de Performance
          </h2>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
            Générer rapport
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-2">TRS Hebdomadaire</div>
            <div className="text-3xl font-bold">87.3%</div>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-2">Rendement Global</div>
            <div className="text-3xl font-bold">91.2%</div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-2">Taux de Qualité</div>
            <div className="text-3xl font-bold">96.8%</div>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-6 rounded-lg">
            <div className="text-sm opacity-90 mb-2">Respect Délais</div>
            <div className="text-3xl font-bold">97.0%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTRS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="trs" stroke="#4CAF50" strokeWidth={2} name="TRS (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataProductionMois}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="production" fill="#2196F3" name="Production (unités)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const pageTitles: { [key: string]: string } = {
    'dashboard': 'Vue d\'ensemble - Contrôle Central',
    'fabrication': 'Processus de Fabrication',
    'qualite': 'Contrôle Qualité Central',
    'atelier': 'Atelier Finition',
    'matieres': 'Matières Premières',
    'mecanique': 'Mécanique et Maintenance',
    'soustraitance': 'Gestion Sous-traitance',
    'personnel': 'Évaluation Personnel & Discipline',
    'securite': 'Environnement de Travail & Sécurité',
    'performance': 'Indicateurs de Performance'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="flex">
        {/* Sidebar Dashboard Contrôle Central */}
        <div className="w-64 bg-gray-900 text-white fixed left-64 top-0 h-screen overflow-y-auto z-30">
          <div className="p-6 border-b border-gray-700">
            <div className="text-2xl font-bold text-green-500 text-center">🏭 CONTRÔLE CENTRAL</div>
          </div>
          
          <div className="p-4">
            <div className="mb-6">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-3 px-4">Navigation Principale</div>
              <button
                onClick={() => setActivePage('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Vue d'ensemble</span>
              </button>
              <button
                onClick={() => setActivePage('fabrication')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'fabrication' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Factory size={18} />
                <span>Fabrication</span>
              </button>
              <button
                onClick={() => setActivePage('qualite')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'qualite' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <CheckCircle size={18} />
                <span>Contrôle Qualité</span>
              </button>
              <button
                onClick={() => setActivePage('atelier')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'atelier' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Package size={18} />
                <span>Atelier</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-3 px-4">Ressources</div>
              <button
                onClick={() => setActivePage('matieres')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'matieres' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <FlaskConical size={18} />
                <span>Matières Premières</span>
              </button>
              <button
                onClick={() => setActivePage('mecanique')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'mecanique' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Wrench size={18} />
                <span>Mécanique</span>
              </button>
              <button
                onClick={() => setActivePage('soustraitance')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'soustraitance' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Users2 size={18} />
                <span>Sous-traitance</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-3 px-4">Personnel & Sécurité</div>
              <button
                onClick={() => setActivePage('personnel')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'personnel' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Users size={18} />
                <span>Personnel & Discipline</span>
              </button>
              <button
                onClick={() => setActivePage('securite')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'securite' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Shield size={18} />
                <span>Environnement & Sécurité</span>
              </button>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase font-semibold mb-3 px-4">Reporting</div>
              <button
                onClick={() => setActivePage('performance')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                  activePage === 'performance' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <TrendingUp size={18} />
                <span>Performance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 pl-64 min-h-screen">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 m-6 mb-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{pageTitles[activePage]}</h1>
                <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Bell size={16} />
                  12 Alertes
                </div>
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    CQ
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Contrôleur Qualité</div>
                    <div className="text-xs text-gray-500">En ligne</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {activePage === 'dashboard' && renderDashboard()}
            {activePage === 'fabrication' && renderFabrication()}
            {activePage === 'qualite' && renderQualite()}
            {activePage === 'atelier' && renderAtelier()}
            {activePage === 'matieres' && renderMatieres()}
            {activePage === 'mecanique' && renderMecanique()}
            {activePage === 'soustraitance' && renderSoustraitance()}
            {activePage === 'personnel' && renderPersonnel()}
            {activePage === 'securite' && renderSecurite()}
            {activePage === 'performance' && renderPerformance()}
          </div>
        </div>
      </div>

      {/* Modal Évaluation */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Nouvelle Évaluation Personnel</h3>
              <button onClick={() => setShowEvaluationModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sélectionner l'employé</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>Ahmed Karim - Tisseur</option>
                  <option>Sara Mansour - Tisseuse</option>
                  <option>Mohamed Ben Ali - Tisseur</option>
                </select>
              </div>
              {['Rendement', 'Ponctualité', 'Attention au poste', 'Comportement', 'Hygiène', 'Respect matériel'].map((criterion) => (
                <div key={criterion}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{criterion}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingClick(criterion, value)}
                        className={`flex-1 py-2 border-2 rounded-lg font-semibold transition-colors ${
                          selectedRating[criterion] === value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert('Évaluation enregistrée avec succès !');
                    setShowEvaluationModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Nouveau Contrôle Sécurité</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zone contrôlée</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>Zone Tissage</option>
                  <option>Zone Coupe</option>
                  <option>Atelier Finition</option>
                  <option>Magasin Matière Première</option>
                </select>
              </div>
              {['Propreté de la zone', 'Équipements de sécurité', 'Organisation du poste', 'Gestion des risques', 'Voies d\'évacuation', 'Matériel de sécurité'].map((criterion) => (
                <div key={criterion}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{criterion}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingClick(criterion, value)}
                        className={`flex-1 py-2 border-2 rounded-lg font-semibold transition-colors ${
                          selectedRating[criterion] === value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert('Contrôle de sécurité enregistré avec succès !');
                    setShowSecurityModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardControleCentral;
