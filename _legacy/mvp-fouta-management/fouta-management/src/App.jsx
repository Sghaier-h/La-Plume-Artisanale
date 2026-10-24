import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, Package, Scissors, Users, Wrench, Box, Truck, Warehouse, Activity, Calendar, Plus, Filter, Download, Move, AlertTriangle, Zap } from 'lucide-react';

const App = () => {
  const [activeSection, setActiveSection] = useState('planification');
  const [draggedOF, setDraggedOF] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOF, setSelectedOF] = useState(null);
  const [selectedQRMP, setSelectedQRMP] = useState({});

  // Données pour le planning
  const [ofsEnAttente, setOfsEnAttente] = useState([
    { 
      id: 'OF249850', 
      client: 'CL00884', 
      modele: 'ARTHUR', 
      ref: 'AR1020-B02-04',
      qte: 320, 
      selecteurs: ['S01', 'S02'],
      nombreDuiteTotal: 518400,
      urgent: true
    },
    { 
      id: 'OF249851', 
      client: 'CL00837', 
      modele: 'IBIZA', 
      ref: 'IB1020-B29-01',
      qte: 250, 
      selecteurs: ['S01', 'S02'],
      nombreDuiteTotal: 432000,
      urgent: false
    },
    { 
      id: 'OF249852', 
      client: 'CL00901', 
      modele: 'UNI', 
      ref: 'UNS1020-02',
      qte: 180, 
      selecteurs: ['S01'],
      nombreDuiteTotal: 345600,
      urgent: false
    },
    { 
      id: 'OF249853', 
      client: 'CL00765', 
      modele: 'ND LILI', 
      ref: 'NDL1020-B12-01',
      qte: 400, 
      selecteurs: ['S01', 'S02'],
      nombreDuiteTotal: 691200,
      urgent: true
    }
  ]);

  const [machinesPlanification, setMachinesPlanification] = useState([
    {
      id: 'M2301',
      nom: 'M2301',
      vitesse: 280,
      selecteurs: 6,
      etat: 'En service',
      metrageEnsouple: 850,
      planning: [
        { 
          of: 'OF249780', 
          client: 'CL00884',
          modele: 'IBIZA',
          qte: 320,
          nombreDuiteTotal: 518400,
          etat: 'En cours',
          progression: 65,
          qrmp: {
            'S01': 'C29_NM05_S2023',
            'S02': 'C01_NM05_S2024'
          }
        }
      ]
    },
    {
      id: 'M2302',
      nom: 'M2302',
      vitesse: 260,
      selecteurs: 6,
      etat: 'En service',
      metrageEnsouple: 320,
      planning: [
        { 
          of: 'OF249781', 
          client: 'CL00837',
          modele: 'ARTHUR',
          qte: 200,
          nombreDuiteTotal: 432000,
          etat: 'En cours',
          progression: 85,
          qrmp: {
            'S01': 'C02_NM05_S2023',
            'S02': 'C04_NM05_S2024'
          }
        }
      ]
    },
    {
      id: 'M2303',
      nom: 'M2303',
      vitesse: 290,
      selecteurs: 6,
      etat: 'En service',
      metrageEnsouple: 1250,
      planning: []
    },
    {
      id: 'M2304',
      nom: 'M2304',
      vitesse: 0,
      selecteurs: 6,
      etat: 'Panne mécanique',
      metrageEnsouple: 680,
      planning: []
    },
    {
      id: 'M2305',
      nom: 'M2305',
      vitesse: 275,
      selecteurs: 8,
      etat: 'En service',
      metrageEnsouple: 420,
      planning: []
    }
  ]);

  const [stockMP] = useState([
    { qr: 'C01_NM05_S2023', code: 'C01', couleur: 'BLANC', poids: 85, entrepot: 'Usine' },
    { qr: 'C02_NM05_S2023', code: 'C02', couleur: 'ECRU', poids: 120, entrepot: 'Usine' },
    { qr: 'C04_NM05_S2024', code: 'C04', couleur: 'BEIGE', poids: 95, entrepot: 'Usine' },
    { qr: 'C09_NM05_S2023', code: 'C09', couleur: 'GRIS', poids: 15, entrepot: 'Usine', alerte: true },
    { qr: 'C12_NM10_S2024', code: 'C12', couleur: 'BLEU', poids: 0, entrepot: 'E1', rupture: true },
    { qr: 'C29_NM05_S2023', code: 'C29', couleur: 'ROUGE', poids: 68, entrepot: 'Usine' },
    { qr: 'C01_NM05_S2024', code: 'C01', couleur: 'BLANC', poids: 145, entrepot: 'E1' },
    { qr: 'C10_NM05_S2023', code: 'C10', couleur: 'NOIR', poids: 230, entrepot: 'Usine' },
    { qr: 'C15_NM10_S2024', code: 'C15', couleur: 'VERT', poids: 78, entrepot: 'Usine' }
  ]);

  // Calcul temps de fabrication
  const calculerTempsFabrication = (nombreDuiteTotal, vitesseMachine, quantite) => {
    if (!vitesseMachine || vitesseMachine === 0) return null;
    
    const tempsPiece = nombreDuiteTotal / vitesseMachine;
    const tempsTotal = (tempsPiece * quantite) / 60;
    
    const jours = Math.floor(tempsTotal / 24);
    const heures = Math.floor(tempsTotal % 24);
    const minutes = Math.round((tempsTotal % 1) * 60);
    
    return { jours, heures, minutes, totalHeures: tempsTotal };
  };

  // Drag & Drop
  const handleDragStart = (e, of) => {
    setDraggedOF(of);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, machineId) => {
    e.preventDefault();
    if (!draggedOF) return;

    const machine = machinesPlanification.find(m => m.id === machineId);
    if (machine.etat === 'Panne mécanique') {
      alert('⚠️ Impossible de planifier sur une machine en panne !');
      setDraggedOF(null);
      return;
    }

    setSelectedMachine(machineId);
    setSelectedOF(draggedOF);
    setSelectedQRMP({});
    setShowQRModal(true);
  };

  const handleQRSelection = (selecteur, qrCode) => {
    setSelectedQRMP(prev => ({
      ...prev,
      [selecteur]: qrCode
    }));
  };

  const handleAttributeOF = () => {
    if (!selectedOF || !selectedMachine) return;

    const selecteursManquants = selectedOF.selecteurs.filter(s => !selectedQRMP[s]);
    if (selecteursManquants.length > 0) {
      alert(`⚠️ Veuillez sélectionner une matière première pour: ${selecteursManquants.join(', ')}`);
      return;
    }

    const machine = machinesPlanification.find(m => m.id === selectedMachine);
    const tempsFab = calculerTempsFabrication(selectedOF.nombreDuiteTotal, machine.vitesse, selectedOF.qte);

    setMachinesPlanification(prev => prev.map(m => {
      if (m.id === selectedMachine) {
        return {
          ...m,
          planning: [...m.planning, {
            of: selectedOF.id,
            client: selectedOF.client,
            modele: selectedOF.modele,
            qte: selectedOF.qte,
            nombreDuiteTotal: selectedOF.nombreDuiteTotal,
            etat: 'Planifié',
            progression: 0,
            qrmp: { ...selectedQRMP },
            tempsFabrication: tempsFab
          }]
        };
      }
      return m;
    }));

    setOfsEnAttente(prev => prev.filter(of => of.id !== selectedOF.id));

    setShowQRModal(false);
    setSelectedOF(null);
    setSelectedMachine(null);
    setDraggedOF(null);
    setSelectedQRMP({});
  };

  const machine = selectedMachine ? machinesPlanification.find(m => m.id === selectedMachine) : null;
  const tempsFab = selectedOF && machine ? calculerTempsFabrication(selectedOF.nombreDuiteTotal, machine.vitesse, selectedOF.qte) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Module de Planification - Drag & Drop
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Samedi 18 Octobre 2025 - 14:30
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Planning Machines</h2>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Move className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Comment utiliser :</p>
              <p>Glissez-déposez un OF depuis la liste "En attente" vers une machine. Vous devrez ensuite attribuer les QR codes de matière première pour chaque sélecteur (S01, S02, etc.).</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* OF en Attente */}
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
                        Sélecteurs: {of.selecteurs.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Duites: {of.nombreDuiteTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Planning Machines */}
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
                  {/* Header */}
                  <div className="flex border-b bg-gray-50">
                    <div className="w-40 p-3 font-semibold text-sm text-gray-700 border-r">
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

                  {/* Machines */}
                  {machinesPlanification.map((mach) => (
                    <div
                      key={mach.id}
                      className="flex border-b hover:bg-gray-50"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, mach.id)}
                    >
                      <div className="w-40 p-3 border-r bg-white">
                        <div className="font-bold text-sm">{mach.nom}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div>V: {mach.vitesse} t/min</div>
                          <div>S: {mach.selecteurs} sel.</div>
                        </div>
                        
                        <div className={`mt-2 p-1.5 rounded text-xs ${
                          mach.metrageEnsouple < 500 
                            ? 'bg-red-100 border border-red-300' 
                            : 'bg-green-100 border border-green-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Ensouple:</span>
                            <span className={`font-bold ${
                              mach.metrageEnsouple < 500 ? 'text-red-700' : 'text-green-700'
                            }`}>
                              {mach.metrageEnsouple}m
                            </span>
                          </div>
                          {mach.metrageEnsouple < 500 && (
                            <div className="flex items-center mt-1 text-red-700">
                              <Zap className="w-3 h-3 mr-1" />
                              <span className="font-semibold">Alerte Ourdissage</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            mach.etat === 'En service' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {mach.etat === 'En service' ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 relative p-3 min-h-[140px] bg-gray-50">
                        {mach.planning.length === 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                            {mach.etat === 'Panne mécanique' ? (
                              <span className="text-red-600 font-medium">⚠️ Machine en panne</span>
                            ) : (
                              'Glissez un OF ici'
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {mach.planning.map((of, idx) => (
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
                                    {of.qrmp && Object.keys(of.qrmp).length > 0 && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {Object.entries(of.qrmp).map(([sel, qr]) => (
                                          <div key={sel}>{sel}: {qr.split('_')[0]}</div>
                                        ))}
                                      </div>
                                    )}
                                    {of.tempsFabrication && (
                                      <div className="text-xs text-orange-600 font-medium mt-1">
                                        ⏱️ {of.tempsFabrication.jours > 0 ? `${of.tempsFabrication.jours}j ` : ''}
                                        {of.tempsFabrication.heures}h{of.tempsFabrication.minutes}min
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
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 mr-2"></div>
                  <span>Ensouple &lt; 500m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Attribution QR MP */}
        {showQRModal && selectedOF && machine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">
                  Attribution Matière Première
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  OF: {selectedOF.id} → Machine: {selectedMachine}
                </p>
              </div>
              
              <div className="p-6">
                {/* Détails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Détails de l'OF</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Modèle:</span>
                        <span className="font-medium">{selectedOF.modele}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ref:</span>
                        <span className="font-medium">{selectedOF.ref}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantité:</span>
                        <span className="font-medium">{selectedOF.qte} pièces</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sélecteurs:</span>
                        <span className="font-medium">{selectedOF.selecteurs.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duites totales:</span>
                        <span className="font-medium">{selectedOF.nombreDuiteTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Temps de Fabrication Calculé
                    </h4>
                    {tempsFab ? (
                      <div className="space-y-1 text-sm text-green-800">
                        <div className="flex justify-between">
                          <span>Vitesse machine:</span>
                          <span className="font-medium">{machine.vitesse} t/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps par pièce:</span>
                          <span className="font-medium">
                            {Math.round(selectedOF.nombreDuiteTotal / machine.vitesse)} min
                          </span>
                        </div>
                        <div className="border-t border-green-300 mt-2 pt-2">
                          <div className="text-lg font-bold text-green-900">
                            {tempsFab.jours > 0 && `${tempsFab.jours}j `}
                            {tempsFab.heures}h {tempsFab.minutes}min
                          </div>
                          <div className="text-xs text-green-700 mt-1">
                            Soit {tempsFab.totalHeures.toFixed(1)} heures au total
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-green-700">Machine en panne</p>
                    )}
                  </div>
                </div>

                {/* Sélection MP */}
                <h4 className="font-semibold text-gray-900 mb-3">
                  Attribuez les matières premières pour chaque sélecteur :
                </h4>
                
                <div className="space-y-4">
                  {selectedOF.selecteurs.map((selecteur) => (
                    <div key={selecteur} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-900">
                          Sélecteur {selecteur}
                        </h5>
                        {selectedQRMP[selecteur] && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            ✓ Sélectionné
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {stockMP.filter(mp => mp.poids > 0).map((mp) => (
                          <label
                            key={mp.qr}
                            className={`flex items-center p-3 border-2 rounded cursor-pointer transition-all ${
                              selectedQRMP[selecteur] === mp.qr
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`selecteur-${selecteur}`}
                              className="mr-3 w-4 h-4"
                              checked={selectedQRMP[selecteur] === mp.qr}
                              onChange={() => handleQRSelection(selecteur, mp.qr)}
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
                  ))}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-between items-center sticky bottom-0">
                <div className="text-sm text-gray-600">
                  {Object.keys(selectedQRMP).length} / {selectedOF.selecteurs.length} sélecteurs attribués
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      setSelectedOF(null);
                      setSelectedMachine(null);
                      setSelectedQRMP({});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAttributeOF}
                    disabled={Object.keys(selectedQRMP).length !== selectedOF.selecteurs.length}
                    className={`px-4 py-2 rounded ${
                      Object.keys(selectedQRMP).length === selectedOF.selecteurs.length
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Confirmer l'attribution
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;