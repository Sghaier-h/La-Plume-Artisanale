import React, { useState } from 'react';
import { Package, TrendingDown, AlertTriangle, CheckCircle, Clock, Search, Filter, Printer, Camera, ArrowRightLeft, Scan, Box, FileText, Download, Plus } from 'lucide-react';

const DashboardMagasinierMP = () => {
  const [activeSection, setActiveSection] = useState('preparation');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [showTransfertModal, setShowTransfertModal] = useState(false);
  const [selectedPreparation, setSelectedPreparation] = useState(null);

  // Données de préparation
  const [preparationsEnCours, setPreparationsEnCours] = useState([
    {
      numSousOF: 'OF249850',
      client: 'CL00884',
      numCommande: 'CM-FT0119',
      modele: 'ARTHUR',
      ref: 'AR1020-B02-04',
      qte: 320,
      machine: 'M2303',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 76.8, preparer: 0, qrMP: null },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 35.2, preparer: 0, qrMP: null }
      ],
      etat: 'A préparer',
      priorite: 'Urgent'
    },
    {
      numSousOF: 'OF249851',
      client: 'CL00837',
      numCommande: 'CM-FT0121',
      modele: 'IBIZA',
      ref: 'IB1020-B29-01',
      qte: 250,
      machine: 'M2301',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 60.0, preparer: 60.0, qrMP: 'C29_ROUGE_NM05-01.00_S2023' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 27.5, preparer: 27.5, qrMP: 'C01_BLANC_NM05-01.00_S2024' }
      ],
      etat: 'Machine alimentée',
      priorite: 'Normal',
      dateAlimentee: '2025-10-18 08:30'
    },
    {
      numSousOF: 'OF249852',
      client: 'CL00901',
      numCommande: 'CM-FT0123',
      modele: 'UNI',
      ref: 'UNS1020-02',
      qte: 180,
      machine: 'M2305',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C02', couleur: 'ECRU', besoins: 43.2, preparer: 43.2, qrMP: 'C02_ECRU_NM05-01.00_S2023' }
      ],
      etat: 'En cours préparation',
      priorite: 'Normal'
    }
  ]);

  // Stock MP
  const [stockMP] = useState([
    { qr: 'C01_BLANC_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C01', couleur: 'BLANC', poidsUsine: 85, poidsE1: 145, poidsE2: 0, entrepot: 'Usine' },
    { qr: 'C02_ECRU_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C02', couleur: 'ECRU', poidsUsine: 120, poidsE1: 0, poidsE2: 80, entrepot: 'Usine' },
    { qr: 'C04_BEIGE_NM05-01.00_S2024', codeFab: 'NM05-01.00', lot: 'S2024', codeCom: 'C04', couleur: 'BEIGE', poidsUsine: 95, poidsE1: 0, poidsE2: 0, entrepot: 'Usine' },
    { qr: 'C09_GRIS_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C09', couleur: 'GRIS', poidsUsine: 15, poidsE1: 85, poidsE2: 0, entrepot: 'Usine', alerte: true },
    { qr: 'C12_BLEU_NM10-02.00_S2024', codeFab: 'NM10-02.00', lot: 'S2024', codeCom: 'C12', couleur: 'BLEU', poidsUsine: 0, poidsE1: 120, poidsE2: 0, entrepot: 'E1', rupture: true },
    { qr: 'C29_ROUGE_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C29', couleur: 'ROUGE', poidsUsine: 68, poidsE1: 0, poidsE2: 95, entrepot: 'Usine' },
    { qr: 'C01_BLANC_NM05-01.00_S2024', codeFab: 'NM05-01.00', lot: 'S2024', codeCom: 'C01', couleur: 'BLANC', poidsUsine: 0, poidsE1: 145, poidsE2: 0, entrepot: 'E1' },
    { qr: 'C10_NOIR_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C10', couleur: 'NOIR', poidsUsine: 230, poidsE1: 0, poidsE2: 0, entrepot: 'Usine' }
  ]);

  // Transferts en attente
  const [transfertsEnAttente, setTransfertsEnAttente] = useState([
    {
      id: 'TR2025001',
      origine: 'E1',
      destination: 'Usine',
      items: [
        { qr: 'C01_BLANC_NM05-01.00_S2024', codeCom: 'C01', couleur: 'BLANC', quantite: 50 },
        { qr: 'C09_GRIS_NM05-01.00_S2023', codeCom: 'C09', couleur: 'GRIS', quantite: 30 }
      ],
      etat: 'En attente validation',
      date: '2025-10-18 10:00'
    }
  ]);

  // Consommations / Retours
  const [retoursMatieres, setRetoursMatieres] = useState([
    {
      numSousOF: 'OF249780',
      modele: 'IBIZA',
      selecteurs: [
        { sel: 'S01', codeCom: 'C29', couleur: 'ROUGE', preparer: 76.8, consomme: 74.2, retour: 2.6 },
        { sel: 'S02', codeCom: 'C01', couleur: 'BLANC', preparer: 35.2, consomme: 34.8, retour: 0.4 }
      ],
      etat: 'Fabrication terminée',
      aRetourner: true
    }
  ]);

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    machine: '',
    type: 'Panne',
    description: '',
    priorite: 'Normal'
  });

  // Demandes de maintenance
  const [demandesMaintenance, setDemandesMaintenance] = useState([
    {
      id: 'DM2025001',
      machine: 'M2304',
      type: 'Panne',
      description: 'Machine arrêtée - Erreur moteur',
      priorite: 'Urgent',
      demandeur: 'Magasinier MP',
      date: '2025-10-18 09:30',
      etat: 'En attente'
    },
    {
      id: 'DM2025002',
      machine: 'M2302',
      type: 'Maintenance préventive',
      description: 'Contrôle ensouple < 500m',
      priorite: 'Normal',
      demandeur: 'Magasinier MP',
      date: '2025-10-18 11:00',
      etat: 'En cours'
    }
  ]);

  // Alertes urgentes
  const alertesUrgentes = [
    {
      id: 'ALT001',
      type: 'Rupture Stock',
      message: 'C12_BLEU - Stock Usine = 0kg',
      priorite: 'Critique',
      action: 'Transfert E1 → Usine urgent',
      date: '2025-10-18 14:00'
    },
    {
      id: 'ALT002',
      type: 'Planning Urgent',
      message: 'OF249850 - Client CL00884 - Délai dépassé',
      priorite: 'Urgent',
      action: 'Préparer immédiatement',
      date: '2025-10-18 13:45'
    },
    {
      id: 'ALT003',
      type: 'Stock Bas',
      message: 'C09_GRIS - Stock critique (15kg)',
      priorite: 'Attention',
      action: 'Commander ou transférer',
      date: '2025-10-18 12:30'
    },
    {
      id: 'ALT004',
      type: 'Machine',
      message: 'M2304 - Panne depuis 4h',
      priorite: 'Critique',
      action: 'Intervention mécanique urgente',
      date: '2025-10-18 10:00'
    }
  ];

  // Analytics
  const analyticsData = {
    consommationMoyenne: {
      journalier: 450,
      hebdomadaire: 3150,
      mensuel: 13500
    },
    tauxRupture: 2.5,
    tempsMoyenPreparation: 25,
    nombreTransferts: {
      semaine: 12,
      mois: 48
    },
    topConsommations: [
      { codeCom: 'C01', couleur: 'BLANC', quantite: 1250, pourcentage: 28 },
      { codeCom: 'C02', couleur: 'ECRU', quantite: 980, pourcentage: 22 },
      { codeCom: 'C29', couleur: 'ROUGE', quantite: 850, pourcentage: 19 },
      { codeCom: 'C10', couleur: 'NOIR', quantite: 650, pourcentage: 15 },
      { codeCom: 'C04', couleur: 'BEIGE', quantite: 720, pourcentage: 16 }
    ],
    alertesParType: [
      { type: 'Rupture', count: 2 },
      { type: 'Stock bas', count: 5 },
      { type: 'Planning urgent', count: 3 },
      { type: 'Machine', count: 1 }
    ]
  };

  const sections = [
    { id: 'alertes', label: 'Alertes Urgentes', icon: AlertTriangle },
    { id: 'preparation', label: 'Préparation', icon: Package },
    { id: 'stock', label: 'Stock MP', icon: Box },
    { id: 'transferts', label: 'Transferts', icon: ArrowRightLeft },
    { id: 'retours', label: 'Retours & Consommations', icon: TrendingDown },
    { id: 'maintenance', label: 'Maintenance', icon: FileText },
    { id: 'analytics', label: 'Analyses', icon: TrendingDown }
  ];

  const handlePreparerSelecteur = (numSousOF, selecteur, qrMP, quantite) => {
    setPreparationsEnCours(prev => prev.map(prep => {
      if (prep.numSousOF === numSousOF) {
        return {
          ...prep,
          selecteurs: prep.selecteurs.map(sel => {
            if (sel.sel === selecteur) {
              return {
                ...sel,
                preparer: quantite,
                qrMP: qrMP
              };
            }
            return sel;
          }),
          etat: prep.selecteurs.every(s => s.preparer >= s.besoins || s.sel !== selecteur) && prep.selecteurs.find(s => s.sel === selecteur).preparer >= prep.selecteurs.find(s => s.sel === selecteur).besoins 
            ? 'Préparé' 
            : 'En cours préparation'
        };
      }
      return prep;
    }));
  };

  const handleAlimenterMachine = (numSousOF) => {
    setPreparationsEnCours(prev => prev.map(prep => {
      if (prep.numSousOF === numSousOF) {
        return {
          ...prep,
          etat: 'Machine alimentée',
          dateAlimentee: new Date().toISOString()
        };
      }
      return prep;
    }));
  };

  const handleImprimerEtiquette = (preparation, selecteur) => {
    setSelectedPreparation({ ...preparation, selecteur });
    setShowEtiquetteModal(true);
  };

  const handleDemanderMaintenance = () => {
    const nouvelleDemande = {
      id: `DM2025${String(demandesMaintenance.length + 1).padStart(3, '0')}`,
      ...maintenanceForm,
      demandeur: 'Magasinier MP',
      date: new Date().toISOString(),
      etat: 'En attente'
    };
    
    setDemandesMaintenance([nouvelleDemande, ...demandesMaintenance]);
    setShowMaintenanceModal(false);
    setMaintenanceForm({
      machine: '',
      type: 'Panne',
      description: '',
      priorite: 'Normal'
    });
  };

  const renderAlertesUrgentes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Alertes Urgentes</h2>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            {alertesUrgentes.filter(a => a.priorite === 'Critique').length} Critiques
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
            {alertesUrgentes.filter(a => a.priorite === 'Urgent').length} Urgentes
          </span>
        </div>
      </div>

      {/* Bannière d'alerte globale */}
      <div className="bg-red-600 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-8 h-8 mr-3 animate-pulse" />
          <div className="flex-1">
            <h3 className="text-lg font-bold">Attention Requise !</h3>
            <p className="text-sm mt-1">
              {alertesUrgentes.filter(a => a.priorite === 'Critique' || a.priorite === 'Urgent').length} alertes nécessitent une action immédiate
            </p>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {alertesUrgentes.map((alerte) => (
          <div 
            key={alerte.id}
            className={`rounded-lg shadow-md p-5 border-l-4 ${
              alerte.priorite === 'Critique' ? 'bg-red-50 border-red-600' :
              alerte.priorite === 'Urgent' ? 'bg-orange-50 border-orange-500' :
              'bg-yellow-50 border-yellow-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    alerte.priorite === 'Critique' ? 'bg-red-600 text-white' :
                    alerte.priorite === 'Urgent' ? 'bg-orange-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {alerte.priorite.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{alerte.type}</span>
                </div>
                
                <h4 className={`text-lg font-bold mb-2 ${
                  alerte.priorite === 'Critique' ? 'text-red-900' :
                  alerte.priorite === 'Urgent' ? 'text-orange-900' :
                  'text-yellow-900'
                }`}>
                  {alerte.message}
                </h4>
                
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Action requise :</span> {alerte.action}
                </p>
                
                <p className="text-xs text-gray-500">
                  {new Date(alerte.date).toLocaleString('fr-FR')}
                </p>
              </div>
              
              <button className={`ml-4 px-4 py-2 rounded-lg font-medium text-white ${
                alerte.priorite === 'Critique' ? 'bg-red-600 hover:bg-red-700' :
                alerte.priorite === 'Urgent' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              }`}>
                Traiter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Demandes de Maintenance</h2>
        <button 
          onClick={() => setShowMaintenanceModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="En Attente" 
          value={demandesMaintenance.filter(d => d.etat === 'En attente').length}
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard 
          title="En Cours" 
          value={demandesMaintenance.filter(d => d.etat === 'En cours').length}
          icon={FileText}
          color="#3b82f6"
        />
        <StatCard 
          title="Urgentes" 
          value={demandesMaintenance.filter(d => d.priorite === 'Urgent').length}
          icon={AlertTriangle}
          color="#ef4444"
          alert={true}
        />
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {demandesMaintenance.map((demande) => (
          <div 
            key={demande.id}
            className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
              demande.priorite === 'Urgent' ? 'border-red-500' : 'border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{demande.id}</h3>
                  {demande.priorite === 'Urgent' && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      URGENT
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    demande.etat === 'En attente' ? 'bg-orange-100 text-orange-800' :
                    demande.etat === 'En cours' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {demande.etat}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Machine:</span>
                    <span className="ml-2 font-bold text-blue-600">{demande.machine}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-900">{demande.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Demandeur:</span>
                    <span className="ml-2 text-gray-900">{demande.demandeur}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(demande.date).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-sm text-gray-900">{demande.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nouvelle Demande */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Nouvelle Demande de Maintenance</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine *
                </label>
                <select
                  value={maintenanceForm.machine}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, machine: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une machine</option>
                  <option value="M2301">M2301</option>
                  <option value="M2302">M2302</option>
                  <option value="M2303">M2303</option>
                  <option value="M2304">M2304</option>
                  <option value="M2305">M2305</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={maintenanceForm.type}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Panne">Panne</option>
                  <option value="Maintenance préventive">Maintenance préventive</option>
                  <option value="Réglage">Réglage</option>
                  <option value="Contrôle">Contrôle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité *
                </label>
                <select
                  value={maintenanceForm.priorite}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, priorite: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez le problème..."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDemanderMaintenance}
                disabled={!maintenanceForm.machine || !maintenanceForm.description}
                className={`px-4 py-2 rounded-lg font-medium ${
                  maintenanceForm.machine && maintenanceForm.description
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Envoyer la Demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analyses & Statistiques</h2>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Consommation Journalière</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {analyticsData.consommationMoyenne.journalier} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">Moyenne</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Consommation Hebdomadaire</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {analyticsData.consommationMoyenne.hebdomadaire} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">7 derniers jours</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Taux de Rupture</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {analyticsData.tauxRupture}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Objectif {'<'} 5%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Temps Moyen Préparation</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {analyticsData.tempsMoyenPreparation} min
          </p>
          <p className="text-xs text-gray-500 mt-1">Par OF</p>
        </div>
      </div>

      {/* Top Consommations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Consommations (Ce mois)</h3>
          <div className="space-y-3">
            {analyticsData.topConsommations.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="font-medium text-gray-900">{item.codeCom}</span>
                    <span className="text-sm text-gray-600 ml-2">- {item.couleur}</span>
                  </div>
                  <span className="font-bold text-blue-600">{item.quantite} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.pourcentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.pourcentage}% du total</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Alertes par Type</h3>
          <div className="space-y-4">
            {analyticsData.alertesParType.map((alerte, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{alerte.type}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  alerte.count > 3 ? 'bg-red-100 text-red-800' :
                  alerte.count > 1 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {alerte.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Transferts</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Cette semaine</p>
                <p className="text-xl font-bold text-blue-900">{analyticsData.nombreTransferts.semaine}</p>
              </div>
              <div>
                <p className="text-blue-700">Ce mois</p>
                <p className="text-xl font-bold text-blue-900">{analyticsData.nombreTransferts.mois}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Évolution des Consommations (30 jours)</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <TrendingDown className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Graphique d'évolution</p>
            <p className="text-xs mt-1">À implémenter avec Chart.js</p>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', alert = false }) => (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${alert ? 'border-red-500' : ''}`} style={{ borderLeftColor: alert ? '#ef4444' : color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600' : ''}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className={`w-8 h-8 ${alert ? 'text-red-400' : 'text-gray-400'}`} />}
      </div>
    </div>
  );

  const renderPreparation = () => {
    const preparationsFiltered = preparationsEnCours.filter(prep => 
      prep.numSousOF.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prep.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prep.modele.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Préparation Matières Premières</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="À Préparer" 
            value={preparationsEnCours.filter(p => p.etat === 'A préparer').length}
            icon={Clock}
            color="#f59e0b"
          />
          <StatCard 
            title="En Préparation" 
            value={preparationsEnCours.filter(p => p.etat === 'En cours préparation').length}
            icon={Package}
            color="#3b82f6"
          />
          <StatCard 
            title="Préparés" 
            value={preparationsEnCours.filter(p => p.etat === 'Préparé').length}
            icon={CheckCircle}
            color="#10b981"
          />
          <StatCard 
            title="Machines Alimentées" 
            value={preparationsEnCours.filter(p => p.etat === 'Machine alimentée').length}
            icon={CheckCircle}
            color="#10b981"
          />
        </div>

        {/* Liste des préparations */}
        <div className="space-y-4">
          {preparationsFiltered.map((prep) => (
            <div 
              key={prep.numSousOF} 
              className={`bg-white rounded-lg shadow-md border-l-4 ${
                prep.priorite === 'Urgent' ? 'border-red-500' : 'border-blue-500'
              }`}
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">{prep.numSousOF}</h3>
                      {prep.priorite === 'Urgent' && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          URGENT
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        prep.etat === 'A préparer' ? 'bg-orange-100 text-orange-800' :
                        prep.etat === 'En cours préparation' ? 'bg-blue-100 text-blue-800' :
                        prep.etat === 'Préparé' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {prep.etat}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div><span className="font-medium">Client:</span> {prep.client}</div>
                      <div><span className="font-medium">Commande:</span> {prep.numCommande}</div>
                      <div><span className="font-medium">Modèle:</span> {prep.modele} - {prep.ref}</div>
                      <div><span className="font-medium">Quantité:</span> {prep.qte} pièces</div>
                      <div><span className="font-medium">Machine:</span> {prep.machine}</div>
                    </div>
                  </div>
                  {prep.etat === 'Machine alimentée' && prep.dateAlimentee && (
                    <div className="text-right text-xs text-gray-500">
                      Alimentée le: {new Date(prep.dateAlimentee).toLocaleString('fr-FR')}
                    </div>
                  )}
                </div>

                {/* Sélecteurs */}
                <div className="space-y-3">
                  {prep.selecteurs.map((sel) => (
                    <div key={sel.sel} className="border-2 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-bold text-lg text-gray-900">Sélecteur {sel.sel}</h4>
                          <span className="text-sm font-medium text-gray-600">
                            {sel.codeCom} - {sel.couleur}
                          </span>
                          {sel.preparer >= sel.besoins && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {sel.qrMP && (
                          <button
                            onClick={() => handleImprimerEtiquette(prep, sel)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Imprimer Étiquette
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Code Fabrication</p>
                          <p className="font-medium text-sm">{sel.codeFab}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Besoins</p>
                          <p className="font-medium text-sm text-orange-600">{sel.besoins} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Préparé</p>
                          <p className={`font-medium text-sm ${
                            sel.preparer >= sel.besoins ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {sel.preparer} kg
                          </p>
                        </div>
                      </div>

                      {sel.qrMP && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-800 font-medium mb-1">QR MP Attribué:</p>
                          <p className="text-sm font-mono text-blue-900">{sel.qrMP}</p>
                        </div>
                      )}

                      {!sel.qrMP && prep.etat !== 'Machine alimentée' && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Sélectionner le QR MP:</p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {stockMP.filter(mp => 
                              mp.codeFab === sel.codeFab && 
                              mp.codeCom === sel.codeCom &&
                              mp.poidsUsine > 0
                            ).map((mp) => (
                              <button
                                key={mp.qr}
                                onClick={() => handlePreparerSelecteur(prep.numSousOF, sel.sel, mp.qr, sel.besoins)}
                                className="w-full text-left p-2 border-2 border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="text-sm">
                                    <div className="font-medium">{mp.qr}</div>
                                    <div className="text-xs text-gray-600">Lot: {mp.lot} | Stock: {mp.poidsUsine}kg</div>
                                  </div>
                                  {mp.alerte && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                      Stock bas
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {prep.etat === 'Préparé' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleAlimenterMachine(prep.numSousOF)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Alimenter Machine {prep.machine}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStock = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Stock Matières Premières</h2>
        <button 
          onClick={handleDemanderTransfert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Demander Transfert
        </button>
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Références" 
          value={stockMP.length}
          icon={Box}
          color="#3b82f6"
        />
        <StatCard 
          title="Alertes Stock" 
          value={stockMP.filter(mp => mp.alerte).length}
          subtitle="Seuil minimum atteint"
          icon={AlertTriangle}
          color="#f59e0b"
          alert={true}
        />
        <StatCard 
          title="Ruptures" 
          value={stockMP.filter(mp => mp.rupture).length}
          subtitle="Stock Usine = 0"
          icon={AlertTriangle}
          color="#ef4444"
          alert={true}
        />
      </div>

      {/* Table Stock */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">QR Code MP</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Code Com</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Couleur</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Code Fab</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Lot</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Usine</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">E1</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">E2</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">État</th>
              </tr>
            </thead>
            <tbody>
              {stockMP.map((mp, idx) => (
                <tr key={mp.qr} className={`border-b hover:bg-gray-50 ${
                  mp.rupture ? 'bg-red-50' : mp.alerte ? 'bg-orange-50' : ''
                }`}>
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm">{mp.qr}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">{mp.codeCom}</td>
                  <td className="py-3 px-4">{mp.couleur}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{mp.codeFab}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{mp.lot}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${
                      mp.poidsUsine === 0 ? 'text-red-600' : 
                      mp.poidsUsine < 50 ? 'text-orange-600' : 
                      'text-gray-900'
                    }`}>
                      {mp.poidsUsine} kg
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{mp.poidsE1} kg</td>
                  <td className="py-3 px-4 text-right text-gray-600">{mp.poidsE2} kg</td>
                  <td className="py-3 px-4 text-center">
                    {mp.rupture ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        Rupture
                      </span>
                    ) : mp.alerte ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                        Stock bas
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransferts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Transferts Inter-Entrepôts</h2>
        <button 
          onClick={handleDemanderTransfert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Transfert
        </button>
      </div>

      <div className="space-y-4">
        {transfertsEnAttente.map((transfert) => (
          <div key={transfert.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{transfert.id}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium text-sm">
                    {transfert.origine}
                  </span>
                  <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-medium text-sm">
                    {transfert.destination}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {transfert.etat}
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(transfert.date).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Articles à transférer:</p>
              <div className="space-y-2">
                {transfert.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{item.codeCom} - {item.couleur}</p>
                      <p className="text-xs text-gray-600 font-mono">{item.qr}</p>
                    </div>
                    <span className="font-bold text-blue-600">{item.quantite} kg</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Générer PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRetours = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Retours & Consommations</h2>

      <div className="space-y-4">
        {retoursMatieres.map((retour) => (
          <div key={retour.numSousOF} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{retour.numSousOF}</h3>
                <p className="text-sm text-gray-600">{retour.modele}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                {retour.etat}
              </span>
            </div>

            <div className="space-y-3">
              {retour.selecteurs.map((sel) => (
                <div key={sel.sel} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm">Sélecteur {sel.sel}</h4>
                      <p className="text-xs text-gray-600">{sel.codeCom} - {sel.couleur}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">Préparé</p>
                      <p className="font-medium text-sm">{sel.preparer} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Consommé</p>
                      <p className="font-medium text-sm text-blue-600">{sel.consomme} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">À Retourner</p>
                      <p className="font-medium text-sm text-orange-600">{sel.retour} kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {retour.aRetourner && (
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Scanner Retour MP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de Bord Magasinier Matière Première
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Samedi 18 Octobre 2025 - 14:30
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Scan className="w-4 h-4 mr-2" />
                Scanner QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
        {activeSection === 'alertes' && renderAlertesUrgentes()}
        {activeSection === 'preparation' && renderPreparation()}
        {activeSection === 'stock' && renderStock()}
        {activeSection === 'transferts' && renderTransferts()}
        {activeSection === 'retours' && renderRetours()}
        {activeSection === 'maintenance' && renderMaintenance()}
        {activeSection === 'analytics' && renderAnalytics()}
      </div>

      {/* Modal Étiquette */}
      {showEtiquetteModal && selectedPreparation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Aperçu Étiquette Préparation</h3>
            </div>
            
            <div className="p-6">
              <div className="border-4 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedPreparation.selecteur.sel}
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedPreparation.selecteur.codeCom} - {selectedPreparation.selecteur.couleur}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>QR MP: {selectedPreparation.selecteur.qrMP}</div>
                    <div>Code Fab: {selectedPreparation.selecteur.codeFab}</div>
                    <div>Num Sous OF: {selectedPreparation.numSousOF}</div>
                    <div className="font-bold text-lg text-blue-600 mt-2">
                      Préparé: {selectedPreparation.selecteur.preparer} kg
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white border-2 border-gray-300">
                    <div className="text-xs text-gray-500">QR CODE</div>
                    <div className="text-lg font-mono font-bold">████████</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowEtiquetteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMagasinierMP;