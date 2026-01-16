import React, { useState } from 'react';
import { Package, TrendingDown, AlertTriangle, CheckCircle, Clock, Search, Filter, Printer, Camera, ArrowRightLeft, Scan, Box, FileText, Download, Plus, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface Selecteur {
  sel: string;
  codeFab: string;
  codeCom: string;
  couleur: string;
  besoins: number | string;
  preparer: string;
  qrMP: string;
}

interface Preparation {
  numSousOF: string;
  client: string;
  numCommande: string;
  modele: string;
  ref: string;
  qte: number;
  machine: string;
  dateDebut: string;
  ordrePlanification: number;
  selecteurs: Selecteur[];
  etat: string;
  priorite: string;
  surplusDemande: boolean;
  ofOrigine?: string;
  dateAlimentee?: string;
}

const DashboardMagasinierMP = () => {
  const [activeSection, setActiveSection] = useState('machines');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [showTransfertModal, setShowTransfertModal] = useState(false);
  const [selectedPreparation, setSelectedPreparation] = useState<any>(null);
  const [expandedOF, setExpandedOF] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // Données de préparation par OF
  const [preparationsEnCours, setPreparationsEnCours] = useState<Preparation[]>([
    {
      numSousOF: 'OF249850',
      client: 'CL00884',
      numCommande: 'CM-FT0119',
      modele: 'ARTHUR',
      ref: 'AR1020-B02-04',
      qte: 320,
      machine: 'M2303',
      dateDebut: '2025-10-20 08:00',
      ordrePlanification: 1,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 76.8, preparer: '', qrMP: '' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 35.2, preparer: '', qrMP: '' }
      ],
      etat: 'A préparer',
      priorite: 'Urgent',
      surplusDemande: false
    },
    {
      numSousOF: 'OF249851',
      client: 'CL00837',
      numCommande: 'CM-FT0121',
      modele: 'IBIZA',
      ref: 'IB1020-B29-01',
      qte: 250,
      machine: 'M2301',
      dateDebut: '2025-10-19 08:00',
      ordrePlanification: 2,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 60.0, preparer: '60.0', qrMP: 'C29_ROUGE_NM05-01.00_S2023' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 27.5, preparer: '27.5', qrMP: 'C01_BLANC_NM05-01.00_S2024' }
      ],
      etat: 'Machine alimentée',
      priorite: 'Normal',
      dateAlimentee: '2025-10-18 08:30',
      surplusDemande: false
    },
    {
      numSousOF: 'OF249852',
      client: 'CL00901',
      numCommande: 'CM-FT0123',
      modele: 'UNI',
      ref: 'UNS1020-02',
      qte: 180,
      machine: 'M2305',
      dateDebut: '2025-10-21 08:00',
      ordrePlanification: 3,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C02', couleur: 'ECRU', besoins: 43.2, preparer: '43.2', qrMP: 'C02_ECRU_NM05-01.00_S2023' }
      ],
      etat: 'Préparé',
      priorite: 'Normal',
      surplusDemande: false
    },
    {
      numSousOF: 'OF249853',
      client: 'CL00765',
      numCommande: 'CM-FT0125',
      modele: 'ND LILI',
      ref: 'NDL1020-B12-01',
      qte: 400,
      machine: 'M2302',
      dateDebut: '2025-10-22 08:00',
      ordrePlanification: 4,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C12', couleur: 'BLEU', besoins: 96.0, preparer: '', qrMP: '' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 44.0, preparer: '', qrMP: '' }
      ],
      etat: 'A préparer',
      priorite: 'Normal',
      surplusDemande: false
    },
    {
      numSousOF: 'OF249780.1',
      client: 'CL00884',
      numCommande: 'CM-FT0119',
      modele: 'ARTHUR',
      ref: 'AR1020-B02-04',
      qte: 50,
      machine: 'M2303',
      dateDebut: '2025-10-19 08:00',
      ordrePlanification: 0,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 12.0, preparer: '', qrMP: '' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 5.5, preparer: '', qrMP: '' }
      ],
      etat: 'A préparer',
      priorite: 'SURPLUS URGENT',
      surplusDemande: true,
      ofOrigine: 'OF249780'
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
  interface Transfert {
    id: string;
    origine: string;
    destination: string;
    items: Array<{ qr: string; codeCom: string; couleur: string; quantite: number }>;
    etat: string;
    date: string;
  }

  const [transfertsEnAttente] = useState<Transfert[]>([
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
  interface RetourMatiere {
    numSousOF: string;
    modele: string;
    selecteurs: Array<{ sel: string; codeCom: string; couleur: string; preparer: number; consomme: number; retour: number }>;
    etat: string;
    aRetourner: boolean;
  }

  const [retoursMatieres] = useState<RetourMatiere[]>([
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

  const sections = [
    { id: 'machines', label: 'Vue Machines', icon: Box },
    { id: 'preparation', label: 'Liste OF', icon: Package },
    { id: 'stock', label: 'Stock MP', icon: Box },
    { id: 'transferts', label: 'Transferts', icon: ArrowRightLeft },
    { id: 'retours', label: 'Retours & Consommations', icon: TrendingDown }
  ];

  const handleUpdateQuantite = (numSousOF: string, selecteur: string, quantite: string, qrMP: string) => {
    setPreparationsEnCours(prev => prev.map(prep => {
      if (prep.numSousOF === numSousOF) {
        const updatedSelecteurs = prep.selecteurs.map(sel => {
          if (sel.sel === selecteur) {
            return {
              ...sel,
              preparer: quantite,
              qrMP: qrMP
            };
          }
          return sel;
        });
        
        const tousPreparees = updatedSelecteurs.every(s => 
          parseFloat(s.preparer || '0') >= parseFloat(s.besoins.toString())
        );
        
        return {
          ...prep,
          selecteurs: updatedSelecteurs,
          etat: tousPreparees ? 'Préparé' : 'En cours préparation'
        };
      }
      return prep;
    }));
  };

  const handleAlimenterMachine = (numSousOF: string) => {
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
    setExpandedOF(null);
  };

  interface MachineData {
    machine: string;
    preparations: Preparation[];
  }

  const getPreparationsByMachine = (): MachineData[] => {
    const machines: { [key: string]: MachineData } = {};
    
    preparationsEnCours.forEach(prep => {
      if (!machines[prep.machine]) {
        machines[prep.machine] = {
          machine: prep.machine,
          preparations: []
        };
      }
      machines[prep.machine].preparations.push(prep);
    });
    
    Object.values(machines).forEach(m => {
      m.preparations.sort((a, b) => {
        if (a.surplusDemande && !b.surplusDemande) return -1;
        if (!a.surplusDemande && b.surplusDemande) return 1;
        return a.ordrePlanification - b.ordrePlanification;
      });
    });
    
    return Object.values(machines);
  };

  const handleImprimerEtiquette = (preparation: any, selecteur: any) => {
    setSelectedPreparation({ ...preparation, selecteur });
    setShowEtiquetteModal(true);
  };

  const handleDemanderTransfert = () => {
    setShowTransfertModal(true);
  };

  const toggleOF = (numSousOF: string) => {
    setExpandedOF(expandedOF === numSousOF ? null : numSousOF);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', alert = false }: any) => (
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

  const renderMachines = () => {
    const machinesData = getPreparationsByMachine();
    
    // Filtrer par machine sélectionnée
    const filteredMachines = selectedMachine 
      ? machinesData.filter(m => m.machine === selectedMachine)
      : machinesData;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Vue par Machine</h2>
          <div className="text-sm text-gray-600">
            Organisation des préparations par machine selon le planning
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Machines Actives" 
            value={machinesData.length}
            icon={Box}
            color="#3b82f6"
          />
          <StatCard 
            title="Surplus Urgents" 
            value={preparationsEnCours.filter(p => p.surplusDemande).length}
            icon={AlertTriangle}
            color="#ef4444"
            alert={preparationsEnCours.filter(p => p.surplusDemande).length > 0}
          />
          <StatCard 
            title="Machines Alimentées" 
            value={preparationsEnCours.filter(p => p.etat === 'Machine alimentée').length}
            icon={CheckCircle}
            color="#10b981"
          />
          <StatCard 
            title="À Préparer" 
            value={preparationsEnCours.filter(p => p.etat === 'A préparer').length}
            icon={Clock}
            color="#f59e0b"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sélecteur de machines - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-24">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">Sélectionner une machine</h3>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setSelectedMachine(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                    !selectedMachine 
                      ? 'bg-blue-100 text-blue-900 font-semibold' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Toutes les machines</span>
                    <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                      {machinesData.length}
                    </span>
                  </div>
                </button>
                
                {machinesData.map((machineData) => {
                  const totalOF = machineData.preparations.length;
                  const surplusCount = machineData.preparations.filter(p => p.surplusDemande).length;
                  const alimenteeCount = machineData.preparations.filter(p => p.etat === 'Machine alimentée').length;
                  
                  return (
                    <button
                      key={machineData.machine}
                      onClick={() => setSelectedMachine(machineData.machine)}
                      className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                        selectedMachine === machineData.machine
                          ? 'bg-blue-100 text-blue-900 font-semibold' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{machineData.machine}</span>
                        <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                          {totalOF} OF
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        {surplusCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-semibold">
                            {surplusCount} urgent
                          </span>
                        )}
                        {alimenteeCount > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                            {alimenteeCount} alimenté
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Liste des OF - Style TODO compacte */}
          <div className="lg:col-span-3 space-y-3">
            {filteredMachines.map((machineData) => (
              <div key={machineData.machine}>
                {!selectedMachine && (
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <Box className="w-5 h-5 mr-2 text-blue-600" />
                    Machine {machineData.machine}
                  </h3>
                )}
                
                <div className="space-y-2">
                  {machineData.preparations.map((prep, idx) => {
                    const isExpanded = expandedOF === prep.numSousOF;
                    const toutPrepare = prep.selecteurs.every(s => parseFloat(s.preparer || '0') >= parseFloat(s.besoins.toString()));
                    const machineAlimentee = prep.etat === 'Machine alimentée';
                    
                    return (
                      <div 
                        key={prep.numSousOF}
                        className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                          prep.surplusDemande ? 'border-red-500' : 
                          isExpanded ? 'border-blue-500' : 'border-gray-200'
                        } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
                      >
                        {/* En-tête compacte - Toujours visible */}
                        <div 
                          onClick={() => !machineAlimentee && toggleOF(prep.numSousOF)}
                          className={`p-4 ${!machineAlimentee ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              {!machineAlimentee && (
                                <div className="text-gray-400">
                                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-bold text-gray-900">{prep.numSousOF}</span>
                                  
                                  {prep.surplusDemande && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      SURPLUS
                                    </span>
                                  )}
                                  
                                  {idx === 0 && !machineAlimentee && (
                                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-semibold">
                                      Prochain
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                  {prep.modele} - {prep.qte} pcs | Client: {prep.client}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {machineAlimentee ? (
                                <div className="px-3 py-1 bg-green-100 border border-green-300 rounded-lg flex items-center">
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                                  <span className="text-xs text-green-800 font-semibold">Alimentée</span>
                                </div>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  prep.etat === 'A préparer' ? 'bg-orange-100 text-orange-800' :
                                  prep.etat === 'Préparé' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {prep.etat}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Détails étendus - Visible uniquement si expandedOF */}
                        {isExpanded && !machineAlimentee && (
                          <div className="border-t bg-gray-50 p-4">
                            {/* Info supplémentaires */}
                            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                              <div><span className="font-medium">Commande:</span> {prep.numCommande}</div>
                              <div><span className="font-medium">Ref:</span> {prep.ref}</div>
                              <div><span className="font-medium">Démarrage:</span> {new Date(prep.dateDebut).toLocaleDateString('fr-FR')}</div>
                              <div><span className="font-medium">Machine:</span> {prep.machine}</div>
                            </div>
                            
                            {prep.surplusDemande && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-800">
                                  ⚠️ <strong>Demande de surplus tisseur</strong> - OF origine: {prep.ofOrigine}
                                </p>
                              </div>
                            )}

                            {/* Sélecteurs */}
                            <div className="space-y-3">
                              <h5 className="font-semibold text-gray-800">Matières Premières:</h5>
                              
                              {prep.selecteurs.map((sel) => {
                                const qtePreparee = parseFloat(sel.preparer || '0');
                                const qteBesoins = parseFloat(sel.besoins.toString());
                                const isComplete = qtePreparee >= qteBesoins;
                                
                                return (
                                  <div key={sel.sel} className={`border-2 rounded-lg p-3 bg-white ${isComplete ? 'border-green-300' : 'border-gray-200'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold text-sm">Sél. {sel.sel}</span>
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                          {sel.codeCom} - {sel.couleur}
                                        </span>
                                        {isComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
                                      </div>
                                      <span className="text-sm font-bold text-orange-600">{sel.besoins} kg</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs text-gray-600 block mb-1">QR Code MP</label>
                                        <select
                                          value={sel.qrMP}
                                          onChange={(e) => {
                                            handleUpdateQuantite(prep.numSousOF, sel.sel, sel.preparer, e.target.value);
                                          }}
                                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                                        >
                                          <option value="">Sélectionner...</option>
                                          {stockMP.filter(mp => 
                                            mp.codeFab === sel.codeFab && 
                                            mp.codeCom === sel.codeCom &&
                                            mp.poidsUsine > 0
                                          ).map(mp => (
                                            <option key={mp.qr} value={mp.qr}>
                                              {mp.couleur} ({mp.poidsUsine}kg)
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      
                                      <div>
                                        <label className="text-xs text-gray-600 block mb-1">Qté Préparée (kg)</label>
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={sel.preparer}
                                          onChange={(e) => {
                                            handleUpdateQuantite(prep.numSousOF, sel.sel, e.target.value, sel.qrMP);
                                          }}
                                          placeholder="0.0"
                                          className={`w-full px-2 py-1.5 border-2 rounded text-xs font-bold ${
                                            isComplete ? 'border-green-500 text-green-700' : 'border-gray-300'
                                          }`}
                                        />
                                      </div>
                                    </div>

                                    {sel.qrMP && isComplete && (
                                      <button
                                        onClick={() => handleImprimerEtiquette(prep, sel)}
                                        className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center text-xs"
                                      >
                                        <Printer className="w-3 h-3 mr-1" />
                                        Imprimer Étiquette
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Bouton alimenter */}
                            {toutPrepare && (
                              <button
                                onClick={() => handleAlimenterMachine(prep.numSousOF)}
                                className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center"
                              >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Alimenter Machine {prep.machine}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPreparation = () => {
    const preparationsSortees = [...preparationsEnCours].sort((a, b) => {
      if (a.surplusDemande && !b.surplusDemande) return -1;
      if (!a.surplusDemande && b.surplusDemande) return 1;
      return a.ordrePlanification - b.ordrePlanification;
    });
    
    const preparationsFiltered = preparationsSortees.filter(prep => 
      prep.numSousOF.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prep.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prep.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prep.machine.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Liste des OF par Ordre de Planification</h2>
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
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard 
            title="Total OF" 
            value={preparationsEnCours.length}
            icon={Package}
            color="#3b82f6"
          />
          <StatCard 
            title="Surplus Urgents" 
            value={preparationsEnCours.filter(p => p.surplusDemande).length}
            icon={AlertTriangle}
            color="#ef4444"
            alert={preparationsEnCours.filter(p => p.surplusDemande).length > 0}
          />
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
            title="Machines Alimentées" 
            value={preparationsEnCours.filter(p => p.etat === 'Machine alimentée').length}
            icon={CheckCircle}
            color="#10b981"
          />
        </div>

        {/* Table des OF */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Ordre</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Num Sous OF</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Machine</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Client / Commande</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Modèle</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Qté</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Démarrage</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">État</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Priorité</th>
                </tr>
              </thead>
              <tbody>
                {preparationsFiltered.map((prep) => (
                  <tr key={prep.numSousOF} className={`border-b hover:bg-gray-50 ${
                    prep.surplusDemande ? 'bg-red-50 font-semibold' : ''
                  }`}>
                    <td className="py-3 px-4">
                      {prep.surplusDemande ? (
                        <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                          URGENT
                        </span>
                      ) : (
                        <span className="text-gray-600 font-medium">#{prep.ordrePlanification}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-600">{prep.numSousOF}</div>
                      {prep.surplusDemande && (
                        <div className="text-xs text-red-600">Surplus - {prep.ofOrigine}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{prep.machine}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{prep.client}</div>
                      <div className="text-xs text-gray-600">{prep.numCommande}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{prep.modele}</div>
                      <div className="text-xs text-gray-600">{prep.ref}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{prep.qte}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(prep.dateDebut).toLocaleDateString('fr-FR')}
                      <br />
                      {new Date(prep.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        prep.etat === 'A préparer' ? 'bg-orange-100 text-orange-800' :
                        prep.etat === 'En cours préparation' ? 'bg-blue-100 text-blue-800' :
                        prep.etat === 'Préparé' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {prep.etat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {prep.surplusDemande ? (
                        <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          SURPLUS
                        </span>
                      ) : prep.priorite === 'Urgent' ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          Urgent
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          Normal
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
          alert={stockMP.filter(mp => mp.alerte).length > 0}
        />
        <StatCard 
          title="Ruptures" 
          value={stockMP.filter(mp => mp.rupture).length}
          subtitle="Stock Usine = 0"
          icon={AlertTriangle}
          color="#ef4444"
          alert={stockMP.filter(mp => mp.rupture).length > 0}
        />
      </div>

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
              {stockMP.map((mp) => (
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
    <div className="min-h-screen bg-gray-50 ml-64">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de Bord Magasinier Matière Première
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
        {activeSection === 'machines' && renderMachines()}
        {activeSection === 'preparation' && renderPreparation()}
        {activeSection === 'stock' && renderStock()}
        {activeSection === 'transferts' && renderTransferts()}
        {activeSection === 'retours' && renderRetours()}
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
