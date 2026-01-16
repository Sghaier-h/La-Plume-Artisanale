import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, Package, Scissors, Users, Wrench, Box, Truck, Warehouse, Activity, Calendar, Plus, Search, Filter, Download, Printer, Move, AlertTriangle } from 'lucide-react';

const DashboardChefProduction = () => {
  const [activeSection, setActiveSection] = useState('vue-generale');
  const [draggedOF, setDraggedOF] = useState<any>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOF, setSelectedOF] = useState<any>(null);

  // Données de démonstration
  const commandesData = {
    actives: 45,
    terminees: 123,
    enRetard: 8
  };

  const statusData = [
    { name: 'En fabrication', value: 15, color: '#10b981' },
    { name: 'Sous-traitance', value: 12, color: '#8b5cf6' },
    { name: 'Atelier', value: 8, color: '#f59e0b' },
    { name: 'Attente matière', value: 5, color: '#fbbf24' },
    { name: 'Retard', value: 5, color: '#ef4444' }
  ];

  const trsData = [
    { jour: 'Lun', trs: 88, objectif: 85 },
    { jour: 'Mar', trs: 82, objectif: 85 },
    { jour: 'Mer', trs: 91, objectif: 85 },
    { jour: 'Jeu', trs: 87, objectif: 85 },
    { jour: 'Ven', trs: 84, objectif: 85 },
    { jour: 'Sam', trs: 89, objectif: 85 }
  ];

  const machinesData = [
    { machine: 'M2301', rendement: 92, etat: 'En service', of: 'OF249780' },
    { machine: 'M2302', rendement: 88, etat: 'En service', of: 'OF249781' },
    { machine: 'M2303', rendement: 95, etat: 'En service', of: 'OF249782' },
    { machine: 'M2304', rendement: 0, etat: 'Panne mécanique', of: '-' },
    { machine: 'M2305', rendement: 91, etat: 'En service', of: 'OF249784' }
  ];

  // Données pour le planning Gantt
  const [ofsEnAttente, setOfsEnAttente] = useState([
    { 
      id: 'OF249850', 
      client: 'CL00884', 
      modele: 'ARTHUR', 
      ref: 'AR1020-B02-04',
      qte: 320, 
      couleurs: 2,
      urgent: true,
      temps: '18h',
      dateCommande: '2025-10-20'
    },
    { 
      id: 'OF249851', 
      client: 'CL00837', 
      modele: 'IBIZA', 
      ref: 'IB1020-B29-01',
      qte: 250, 
      couleurs: 2,
      urgent: false,
      temps: '14h',
      dateCommande: '2025-10-22'
    },
    { 
      id: 'OF249852', 
      client: 'CL00901', 
      modele: 'UNI', 
      ref: 'UNS1020-02',
      qte: 180, 
      couleurs: 1,
      urgent: false,
      temps: '10h',
      dateCommande: '2025-10-23'
    },
    { 
      id: 'OF249853', 
      client: 'CL00765', 
      modele: 'ND LILI', 
      ref: 'NDL1020-B12-01',
      qte: 400, 
      couleurs: 2,
      urgent: true,
      temps: '22h',
      dateCommande: '2025-10-21'
    }
  ]);

  const [machinesPlanification, setMachinesPlanification] = useState([
    {
      id: 'M2301',
      nom: 'M2301',
      laize: 100,
      vitesse: 280,
      selecteurs: 6,
      etat: 'En service',
      planning: [
        { 
          of: 'OF249780', 
          client: 'CL00884',
          modele: 'IBIZA',
          ref: 'IB1020-B29-01',
          qte: 320,
          debut: '2025-10-18 08:00',
          fin: '2025-10-20 16:00',
          etat: 'En cours',
          progression: 65,
          qrmp: ['C29_NM05_S2023', 'C01_NM05_S2024']
        }
      ]
    },
    {
      id: 'M2302',
      nom: 'M2302',
      laize: 100,
      vitesse: 260,
      selecteurs: 6,
      etat: 'En service',
      planning: [
        { 
          of: 'OF249781', 
          client: 'CL00837',
          modele: 'ARTHUR',
          ref: 'AR1020-B02-04',
          qte: 200,
          debut: '2025-10-17 08:00',
          fin: '2025-10-19 14:00',
          etat: 'En cours',
          progression: 85,
          qrmp: ['C02_NM05_S2023', 'C04_NM05_S2024']
        }
      ]
    },
    {
      id: 'M2303',
      nom: 'M2303',
      laize: 100,
      vitesse: 290,
      selecteurs: 6,
      etat: 'En service',
      planning: []
    },
    {
      id: 'M2304',
      nom: 'M2304',
      laize: 100,
      vitesse: 0,
      selecteurs: 6,
      etat: 'Panne mécanique',
      planning: []
    },
    {
      id: 'M2305',
      nom: 'M2305',
      laize: 100,
      vitesse: 275,
      selecteurs: 8,
      etat: 'En service',
      planning: [
        { 
          of: 'OF249784', 
          client: 'CL00765',
          modele: 'UNI',
          ref: 'UNS1020-02',
          qte: 150,
          debut: '2025-10-18 14:00',
          fin: '2025-10-19 22:00',
          etat: 'Planifié',
          progression: 0,
          qrmp: ['C02_NM05_S2023']
        }
      ]
    }
  ]);

  const [stockMP, setStockMP] = useState([
    { qr: 'C01_NM05_S2023', code: 'C01', couleur: 'BLANC', poids: 85, entrepot: 'Usine' },
    { qr: 'C02_NM05_S2023', code: 'C02', couleur: 'ECRU', poids: 120, entrepot: 'Usine' },
    { qr: 'C04_NM05_S2024', code: 'C04', couleur: 'BEIGE', poids: 95, entrepot: 'Usine' },
    { qr: 'C09_NM05_S2023', code: 'C09', couleur: 'GRIS', poids: 15, entrepot: 'Usine', alerte: true },
    { qr: 'C12_NM10_S2024', code: 'C12', couleur: 'BLEU', poids: 0, entrepot: 'E1', rupture: true },
    { qr: 'C29_NM05_S2023', code: 'C29', couleur: 'ROUGE', poids: 68, entrepot: 'Usine' },
    { qr: 'C01_NM05_S2024', code: 'C01', couleur: 'BLANC', poids: 145, entrepot: 'E1' }
  ]);

  const coupeData = {
    aCouper: 1250,
    coupees: 890,
    restantes: 360,
    tauxRebut: 2.3
  };

  const atelierData = {
    pliage: 450,
    couture: 120,
    etiquetage: 380,
    emballage: 290,
    premierChoix: 1180,
    deuxiemeChoix: 60
  };

  const sousTraitanceData = [
    { nom: 'ST Frange A', sortis: 450, retour: 380, restant: 70, conformite: 98 },
    { nom: 'ST Couture B', sortis: 320, retour: 320, restant: 0, conformite: 95 },
    { nom: 'ST Broderie C', sortis: 180, retour: 120, restant: 60, conformite: 92 }
  ];

  const stockMPData = {
    disponibilite: 87,
    alerte: 5,
    rupture: 2
  };

  const kpiData = [
    { label: 'TRS Moyen', value: '87.2%', objectif: '≥85%', status: 'good' },
    { label: 'Rendement', value: '91%', objectif: '≥90%', status: 'good' },
    { label: 'Taux de panne', value: '4.2%', objectif: '<5%', status: 'good' },
    { label: 'Taux de rebut', value: '2.8%', objectif: '<3%', status: 'good' },
    { label: 'Respect planning', value: '94%', objectif: '100%', status: 'warning' }
  ];

  const sections = [
    { id: 'vue-generale', label: 'Vue Générale', icon: Activity },
    { id: 'planification', label: 'Planification', icon: Calendar },
    { id: 'fabrication', label: 'Fabrication', icon: Activity },
    { id: 'coupe', label: 'Coupe', icon: Scissors },
    { id: 'atelier', label: 'Atelier', icon: Users },
    { id: 'mecanique', label: 'Mécanique', icon: Wrench },
    { id: 'matieres', label: 'Matières 1ères', icon: Box },
    { id: 'sous-traitance', label: 'Sous-traitance', icon: Truck },
    { id: 'magasin', label: 'Magasin PF', icon: Warehouse }
  ];

  // Fonctions Drag & Drop
  const handleDragStart = (e: React.DragEvent, of: any) => {
    setDraggedOF(of);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, machineId: string) => {
    e.preventDefault();
    if (!draggedOF) return;

    setSelectedMachine(machineId);
    setSelectedOF(draggedOF);
    setShowQRModal(true);
  };

  const handleAttributeOF = (qrmpList: string[]) => {
    if (!selectedOF || !selectedMachine) return;

    // Ajouter l'OF à la machine
    setMachinesPlanification(prev => prev.map(m => {
      if (m.id === selectedMachine) {
        return {
          ...m,
          planning: [...m.planning, {
            of: selectedOF.id,
            client: selectedOF.client,
            modele: selectedOF.modele,
            ref: selectedOF.ref,
            qte: selectedOF.qte,
            debut: new Date().toISOString(),
            fin: new Date(Date.now() + parseInt(selectedOF.temps) * 3600000).toISOString(),
            etat: 'Planifié',
            progression: 0,
            qrmp: qrmpList
          }]
        };
      }
      return m;
    }));

    // Retirer l'OF de la liste d'attente
    setOfsEnAttente(prev => prev.filter(of => of.id !== selectedOF.id));

    // Fermer le modal
    setShowQRModal(false);
    setSelectedOF(null);
    setSelectedMachine(null);
    setDraggedOF(null);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }: any) => (
    <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
      {trend && (
        <div className="flex items-center mt-2 text-xs">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(trend)}% vs hier
          </span>
        </div>
      )}
    </div>
  );

  const renderVueGenerale = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Vue Générale de Production</h2>
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Commandes Actives"
          value={commandesData.actives}
          subtitle={`${commandesData.terminees} terminées`}
          icon={Package}
          color="#3b82f6"
          trend={5}
        />
        <StatCard
          title="En Retard"
          value={commandesData.enRetard}
          subtitle="Nécessitent attention"
          icon={AlertCircle}
          color="#ef4444"
        />
        <StatCard
          title="TRS Moyen"
          value="87.2%"
          subtitle="Objectif: ≥85%"
          icon={TrendingUp}
          color="#10b981"
          trend={2}
        />
      </div>

      {/* Répartition par statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution TRS Hebdomadaire</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jour" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="trs" stroke="#3b82f6" strokeWidth={2} name="TRS Réel" />
              <Line type="monotone" dataKey="objectif" stroke="#10b981" strokeDasharray="5 5" name="Objectif" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertes urgentes */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-2">Alertes Urgentes (3)</h4>
            <ul className="space-y-2 text-sm text-red-800">
              <li>• OF249780 - Retard de 2 jours - Client CL00884</li>
              <li>• Machine M2304 - Panne mécanique depuis 4h</li>
              <li>• Matière C09 - Stock critique (15kg restants)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlanification = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Module de Planification</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel OF
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Move className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Comment utiliser :</p>
            <p>Glissez-déposez un OF depuis la liste "En attente" vers une machine. Vous devrez ensuite attribuer les QR codes de matière première disponibles.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des OF en attente */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                OF en Attente ({ofsEnAttente.length})
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {ofsEnAttente.map((of) => (
                <div
                  key={of.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, of)}
                  className={`p-3 border-2 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all ${
                    of.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {of.urgent && (
                    <div className="flex items-center text-xs text-red-600 font-semibold mb-2">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      URGENT
                    </div>
                  )}
                  <div className="font-bold text-sm text-gray-900">{of.id}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    <div>Client: {of.client}</div>
                    <div>Modèle: {of.modele}</div>
                    <div>Ref: {of.ref}</div>
                    <div className="mt-1 font-medium text-blue-600">Qté: {of.qte}</div>
                    <div className="text-gray-500">
                      {of.couleurs} couleur{of.couleurs > 1 ? 's' : ''}
                    </div>
                    <div className="mt-1 text-orange-600 font-medium">
                      Temps: {of.temps}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gantt Chart - Machines */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Planning Machines
              </h3>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header timeline */}
                <div className="flex border-b bg-gray-50">
                  <div className="w-32 p-3 font-semibold text-sm text-gray-700 border-r">
                    Machine
                  </div>
                  <div className="flex-1 flex">
                    {['Aujourd\'hui', 'Demain', 'J+2', 'J+3', 'J+4'].map((day, idx) => (
                      <div key={idx} className="flex-1 p-3 text-center text-sm font-medium text-gray-600 border-r">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Machines rows */}
                {machinesPlanification.map((machine) => (
                  <div
                    key={machine.id}
                    className="flex border-b hover:bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, machine.id)}
                  >
                    {/* Machine info */}
                    <div className="w-32 p-3 border-r bg-white">
                      <div className="font-bold text-sm">{machine.nom}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        <div>V: {machine.vitesse} t/min</div>
                        <div>S: {machine.selecteurs} couleurs</div>
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          machine.etat === 'En service' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {machine.etat === 'En service' ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>

                    {/* Planning timeline */}
                    <div className="flex-1 relative p-3 min-h-[100px] bg-gray-50">
                      {machine.planning.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          {machine.etat === 'Panne mécanique' ? (
                            <span className="text-red-600 font-medium">⚠️ Machine en panne</span>
                          ) : (
                            'Glissez un OF ici'
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {machine.planning.map((of: any, idx: number) => (
                            <div
                              key={idx}
                              className={`relative p-2 rounded border-l-4 ${
                                of.etat === 'En cours' 
                                  ? 'bg-blue-100 border-blue-600' 
                                  : 'bg-green-100 border-green-600'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-bold text-sm">{of.of}</div>
                                  <div className="text-xs text-gray-700 mt-1">
                                    {of.modele} - {of.qte} pcs
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Client: {of.client}
                                  </div>
                                  {of.qrmp && of.qrmp.length > 0 && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      MP: {of.qrmp.length} bobine{of.qrmp.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    of.etat === 'En cours' 
                                      ? 'bg-blue-200 text-blue-900' 
                                      : 'bg-green-200 text-green-900'
                                  }`}>
                                    {of.etat}
                                  </span>
                                </div>
                              </div>
                              
                              {of.progression > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progression</span>
                                    <span className="font-medium">{of.progression}%</span>
                                  </div>
                                  <div className="w-full bg-white rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full" 
                                      style={{ width: `${of.progression}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Légende</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-600 mr-2"></div>
                <span>En cours</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border-l-4 border-green-600 mr-2"></div>
                <span>Planifié</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-300 mr-2"></div>
                <span>Urgent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Attribution QR MP */}
      {showQRModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Attribution Matière Première
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                OF: {selectedOF.id} - Machine: {selectedMachine}
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Détails de l'OF</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>Modèle: {selectedOF.modele}</div>
                  <div>Ref: {selectedOF.ref}</div>
                  <div>Quantité: {selectedOF.qte} pièces</div>
                  <div>Couleurs: {selectedOF.couleurs}</div>
                  <div>Temps estimé: {selectedOF.temps}</div>
                  <div>Client: {selectedOF.client}</div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">
                Sélectionnez les matières premières disponibles :
              </h4>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stockMP.filter(mp => mp.poids > 0).map((mp) => (
                  <label
                    key={mp.qr}
                    className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-3 w-4 h-4"
                      defaultChecked={false}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {mp.code} - {mp.couleur}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        QR: {mp.qr}
                      </div>
                      <div className="text-xs text-gray-600">
                        Stock: {mp.poids}kg - {mp.entrepot}
                      </div>
                    </div>
                    {mp.alerte && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        Stock bas
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedOF(null);
                  setSelectedMachine(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Récupérer les QR sélectionnés (simulation)
                  const selected = ['C01_NM05_S2023', 'C02_NM05_S2023'];
                  handleAttributeOF(selected);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmer l'attribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFabrication = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Processus de Fabrication</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${
              kpi.status === 'good' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {kpi.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">Obj: {kpi.objectif}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">État des Machines</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Machine</th>
                <th className="text-left py-2 px-4">État</th>
                <th className="text-left py-2 px-4">OF en cours</th>
                <th className="text-left py-2 px-4">Rendement</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {machinesData.map((m, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{m.machine}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      m.etat === 'En service' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {m.etat}
                    </span>
                  </td>
                  <td className="py-3 px-4">{m.of}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${m.rendement}%` }}
                        />
                      </div>
                      <span className="text-sm">{m.rendement}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Détails →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCoupe = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Coupe et Préparation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="À Couper" value={coupeData.aCouper} color="#3b82f6" />
        <StatCard title="Coupées" value={coupeData.coupees} color="#10b981" />
        <StatCard title="Restantes" value={coupeData.restantes} color="#f59e0b" />
        <StatCard 
          title="Taux Rebut" 
          value={`${coupeData.tauxRebut}%`} 
          subtitle="Objectif: <3%"
          color="#10b981" 
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Progression Journalière</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Objectif journalier: 400 pièces</span>
              <span className="font-medium">340 / 400 (85%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-sm text-gray-600 mb-2">Premier Choix</h4>
            <p className="text-2xl font-bold text-green-600">328 pièces</p>
            <p className="text-xs text-gray-500 mt-1">96.5% du total coupé</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-sm text-gray-600 mb-2">Deuxième Choix</h4>
            <p className="text-2xl font-bold text-orange-600">12 pièces</p>
            <p className="text-xs text-gray-500 mt-1">3.5% du total coupé</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAtelier = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Atelier Finition</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="En Pliage" value={atelierData.pliage} color="#3b82f6" />
        <StatCard title="En Couture" value={atelierData.couture} color="#8b5cf6" />
        <StatCard title="Étiquetage" value={atelierData.etiquetage} color="#f59e0b" />
        <StatCard title="Emballage" value={atelierData.emballage} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition Qualité</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: '1er Choix', value: atelierData.premierChoix, color: '#10b981' },
                  { name: '2ème Choix', value: atelierData.deuxiemeChoix, color: '#f59e0b' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Capacité vs Charge</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Capacité journalière</span>
                <span>1200 pièces</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '75%' }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Charge actuelle: 900 pièces (75%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSousTraitance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Suivi Sous-Traitance</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Sous-Traitant</th>
                <th className="text-right py-2 px-4">Sortis</th>
                <th className="text-right py-2 px-4">Retournés</th>
                <th className="text-right py-2 px-4">Restant</th>
                <th className="text-right py-2 px-4">Conformité</th>
                <th className="text-center py-2 px-4">État</th>
              </tr>
            </thead>
            <tbody>
              {sousTraitanceData.map((st, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{st.nom}</td>
                  <td className="py-3 px-4 text-right">{st.sortis}</td>
                  <td className="py-3 px-4 text-right">{st.retour}</td>
                  <td className="py-3 px-4 text-right font-medium text-orange-600">
                    {st.restant}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${
                      st.conformite >= 95 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {st.conformite}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {st.restant === 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600 inline" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-600 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">Total Sortis</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">950</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">Total Retournés</p>
          <p className="text-2xl font-bold text-green-900 mt-1">820</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800 font-medium">En Attente</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">130</p>
        </div>
      </div>
    </div>
  );

  const renderMatieres = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Matières Premières</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Disponibilité" 
          value={`${stockMPData.disponibilite}%`}
          subtitle="Stock global"
          color="#10b981"
        />
        <StatCard 
          title="Alertes Stock" 
          value={stockMPData.alerte}
          subtitle="Seuil minimum atteint"
          color="#f59e0b"
        />
        <StatCard 
          title="Ruptures" 
          value={stockMPData.rupture}
          subtitle="Nécessitent réappro"
          color="#ef4444"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Alertes Matières Critiques</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
            <div>
              <p className="font-medium text-orange-900">Fil C09 - NM05</p>
              <p className="text-sm text-orange-700">Stock: 15kg / Seuil: 50kg</p>
            </div>
            <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
              Commander
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
            <div>
              <p className="font-medium text-red-900">Fil C12 - NM10</p>
              <p className="text-sm text-red-700">Stock: 0kg / Rupture</p>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Urgent
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Transferts Inter-Entrepôts</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">E1 → Usine</p>
              <p className="text-sm text-gray-600">Fil C01, C02, C05 - 120kg</p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
              En attente
            </span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">E2 → Usine</p>
              <p className="text-sm text-gray-600">Fil C09 - 85kg</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Livré
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de Bord Chef de Production
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Samedi 18 Octobre 2025 - 14:30
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Production Aujourd'hui</p>
                <p className="text-xl font-bold text-green-600">1,240 pièces</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeSection === 'vue-generale' && renderVueGenerale()}
        {activeSection === 'planification' && renderPlanification()}
        {activeSection === 'fabrication' && renderFabrication()}
        {activeSection === 'coupe' && renderCoupe()}
        {activeSection === 'atelier' && renderAtelier()}
        {activeSection === 'sous-traitance' && renderSousTraitance()}
        {activeSection === 'matieres' && renderMatieres()}
        
        {/* Placeholder pour les autres sections */}
        {!['vue-generale', 'planification', 'fabrication', 'coupe', 'atelier', 'sous-traitance', 'matieres'].includes(activeSection) && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Section en construction
            </h3>
            <p className="text-gray-500">
              {sections.find(s => s.id === activeSection)?.label} - Disponible prochainement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChefProduction;
