import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, CheckCircle, Clock, Printer, Play, Square, AlertCircle, ChevronDown, ChevronRight, Wrench, Activity, Zap, Boxes, FileWarning, Box, FileText } from 'lucide-react';
import WhatsAppWidget from '../components/WhatsAppWidget';
import DashboardLayout from '../components/DashboardLayout';

const DashboardTisseur = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('machines');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [expandedOF, setExpandedOF] = useState<string | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [showFinPosteModal, setShowFinPosteModal] = useState(false);
  const [showDebutPosteModal, setShowDebutPosteModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showRefuserComplementModal, setShowRefuserComplementModal] = useState(false);
  const [selectedOF, setSelectedOF] = useState<any>(null);
  const [incidentType, setIncidentType] = useState('');
  const [selecteurMP, setSelecteurMP] = useState('');
  const [compteurMachine, setCompteurMachine] = useState('');
  const [quantiteRestante, setQuantiteRestante] = useState('');
  const [causeRefus, setCauseRefus] = useState('');

  const tisseurNom = "Ahmed Ben Ali";

  // Données des OF organisées par machine
  const [mesOF, setMesOF] = useState([
    {
      numSousOF: 'OF249850',
      client: 'CL00884',
      numCommande: 'CM-FT0119',
      modele: 'ARTHUR',
      ref: 'AR1020-B02-04',
      qtePieces: 320,
      machine: 'M2303',
      uniteMesure: 'pièces',
      typeCompteur: 'pieces', // 'pieces' ou 'metres'
      compteurInitial: 320, // Compteur à programmer sur la machine
      compteurActuel: null,
      dateDebut: '2025-10-20 08:00',
      ordrePlanification: 1,
      etat: 'Machine alimentée',
      statut: 'En attente de départ',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' }
      ],
      vitesseDuites: 450,
      tempsPrevu: '12h30',
      tempsReel: null,
      tempsArretsMecanique: 0,
      tempsArretsMP: 0,
      tempsPlanification: 0,
      piecesProduites: 0,
      deuxiemeChoix: 0,
      dechets: 0,
      rendementTemps: null,
      rendementProduction: null,
      dateHeureDebut: null,
      priorite: 'Urgent',
      complementTissage: false,
      quantiteComplement: 0,
      noteSpeciale: 'Attention: Contrôler la tension du fil rouge (C29) toutes les 2 heures',
      instructionSpeciale: null,
      noteTisseur: 'Première utilisation du fil C29 lot S2024, vérifier la qualité'
    },
    {
      numSousOF: 'OF249851',
      client: 'CL00837',
      numCommande: 'CM-FT0121',
      modele: 'IBIZA',
      ref: 'IB1020-B29-01',
      qtePieces: 250,
      machine: 'M2303',
      uniteMesure: 'pièces',
      typeCompteur: 'pieces',
      compteurInitial: 250,
      compteurActuel: null,
      dateDebut: '2025-10-21 08:00',
      ordrePlanification: 2,
      etat: 'En attente',
      statut: 'Prochain',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' }
      ],
      vitesseDuites: 450,
      tempsPrevu: '10h00',
      tempsReel: null,
      tempsArretsMecanique: 0,
      tempsArretsMP: 0,
      tempsPlanification: 0,
      piecesProduites: 0,
      deuxiemeChoix: 0,
      dechets: 0,
      rendementTemps: null,
      rendementProduction: null,
      dateHeureDebut: null,
      priorite: 'Normal',
      complementTissage: false,
      quantiteComplement: 0,
      noteSpeciale: null,
      instructionSpeciale: null,
      noteTisseur: null
    },
    {
      numSousOF: 'OF249780',
      client: 'CL00884',
      numCommande: 'CM-FT0118',
      modele: 'ND LILI',
      ref: 'NDL1020-B12-01',
      qtePieces: 150,
      machine: 'M2303',
      uniteMesure: 'pièces',
      typeCompteur: 'pieces',
      compteurInitial: 150,
      compteurActuel: 40,
      dateDebut: '2025-10-18 08:00',
      ordrePlanification: 3,
      etat: 'En cours',
      statut: 'Fabrication en cours',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM10-02.00', codeCom: 'C12', couleur: 'BLEU' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' }
      ],
      vitesseDuites: 420,
      tempsPrevu: '8h00',
      tempsReel: '6h30',
      tempsArretsMecanique: 45,
      tempsArretsMP: 15,
      tempsPlanification: 0,
      piecesProduites: 110,
      deuxiemeChoix: 8,
      dechets: 2,
      rendementTemps: 85,
      rendementProduction: 93.33,
      dateHeureDebut: '2025-10-18 08:15',
      priorite: 'Normal',
      complementTissage: false,
      quantiteComplement: 0,
      noteSpeciale: null,
      instructionSpeciale: null,
      noteTisseur: 'Petit problème de tension résolu à 10h30'
    },
    {
      numSousOF: 'OF249852',
      client: 'CL00901',
      numCommande: 'CM-FT0123',
      modele: 'UNI',
      ref: 'UNS1020-02',
      qtePieces: 1800,
      machine: 'M2301',
      uniteMesure: 'mètres',
      typeCompteur: 'metres',
      compteurInitial: 1800,
      compteurActuel: 600,
      dateDebut: '2025-10-19 08:00',
      ordrePlanification: 1,
      etat: 'En cours',
      statut: 'Fabrication en cours',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C02', couleur: 'ECRU' }
      ],
      vitesseDuites: 500,
      tempsPrevu: '6h00',
      tempsReel: '5h15',
      tempsArretsMecanique: 20,
      tempsArretsMP: 0,
      tempsPlanification: 0,
      piecesProduites: 1200,
      deuxiemeChoix: 45,
      dechets: 15,
      rendementTemps: 90,
      rendementProduction: 96.67,
      dateHeureDebut: '2025-10-19 08:00',
      priorite: 'Normal',
      complementTissage: false,
      quantiteComplement: 0,
      noteSpeciale: null,
      instructionSpeciale: 'Vitesse à réduire à 450 duites/min après 1500m produits',
      noteTisseur: 'RAS - Production fluide'
    },
    {
      numSousOF: 'OF249780.1',
      client: 'CL00884',
      numCommande: 'CM-FT0118',
      modele: 'ND LILI',
      ref: 'NDL1020-B12-01',
      qtePieces: 20,
      machine: 'M2303',
      uniteMesure: 'pièces',
      typeCompteur: 'pieces',
      compteurInitial: 20,
      compteurActuel: null,
      dateDebut: '2025-10-19 08:00',
      ordrePlanification: 0,
      etat: 'Machine alimentée',
      statut: 'COMPLÉMENT URGENT',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM10-02.00', codeCom: 'C12', couleur: 'BLEU' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' }
      ],
      vitesseDuites: 420,
      tempsPrevu: '2h00',
      tempsReel: null,
      tempsArretsMecanique: 0,
      tempsArretsMP: 0,
      tempsPlanification: 0,
      piecesProduites: 0,
      deuxiemeChoix: 0,
      dechets: 0,
      rendementTemps: null,
      rendementProduction: null,
      dateHeureDebut: null,
      priorite: 'COMPLEMENT',
      complementTissage: true,
      quantiteComplement: 20,
      ofOrigine: 'OF249780',
      noteSpeciale: 'URGENT: Complément pour commande client prioritaire',
      instructionSpeciale: null,
      noteTisseur: null
    }
  ]);

  const [incidents] = useState([
    {
      id: 'INC001',
      numSousOF: 'OF249780',
      machine: 'M2303',
      type: 'Problème mécanique',
      date: '2025-10-18 10:30',
      statut: 'Résolu',
      description: 'Tension chaîne anormale',
      duree: 45
    }
  ]);

  const typesIncident = [
    { value: 'mp_manque', label: '🧶 Manque Matière Première', icon: Boxes, needsColor: true },
    { value: 'mp_alimentation', label: '🔄 Demande Alimentation MP', icon: Boxes, needsColor: true },
    { value: 'mecanique', label: '⚙️ Incident Mécanique', icon: Wrench, needsColor: false },
    { value: 'electrique', label: '⚡ Incident Électrique', icon: Zap, needsColor: false },
    { value: 'programme', label: '💻 Problème de Programmation', icon: FileWarning, needsColor: false },
    { value: 'carton', label: '📦 Carton Manquant/Non Existant', icon: Package, needsColor: false }
  ];

  const getOFByMachine = () => {
    const machines: { [key: string]: { machine: string; ofs: any[] } } = {};
    
    mesOF.forEach((of: any) => {
      if (!machines[of.machine]) {
        machines[of.machine] = {
          machine: of.machine,
          ofs: []
        };
      }
      machines[of.machine].ofs.push(of);
    });
    
    Object.values(machines).forEach((m: any) => {
      m.ofs.sort((a: any, b: any) => {
        if (a.complementTissage && !b.complementTissage) return -1;
        if (!a.complementTissage && b.complementTissage) return 1;
        return a.ordrePlanification - b.ordrePlanification;
      });
    });
    
    return Object.values(machines);
  };

  const handleDemarrerOF = (of: any) => {
    setSelectedOF(of);
    setQuantiteRestante(of.compteurInitial.toString());
    setShowDebutPosteModal(true);
  };

  const handleConfirmerDemarrage = () => {
    if (!selectedOF || !quantiteRestante) return;

    const qteRestante = parseFloat(quantiteRestante);

    // Afficher une alerte avec l'info du compteur
    alert(`⚠️ PROGRAMMATION MACHINE\n\nCompteur à programmer sur la machine:\n${qteRestante} ${(selectedOF as any).typeCompteur === 'pieces' ? 'pièces' : 'mètres'}\n\nLe compteur est dégressif (diminue à chaque pièce/mètre produit)`);

    setMesOF((prev: any) => prev.map((o: any) => {
      if (o.numSousOF === (selectedOF as any).numSousOF) {
        return {
          ...o,
          etat: 'En cours',
          statut: o.complementTissage ? 'COMPLÉMENT EN COURS' : 'Fabrication en cours',
          dateHeureDebut: new Date().toISOString(),
          compteurInitial: qteRestante,
          compteurActuel: qteRestante,
          qtePieces: qteRestante
        };
      }
      return o;
    }));

    setShowDebutPosteModal(false);
  };

  const handleTerminerOF = (numSousOF: string) => {
    const of = mesOF.find((o: any) => o.numSousOF === numSousOF);
    if (of) {
      setSelectedOF({
        ...of,
        typeEtiquette: 'fin'
      } as any);
      setShowEtiquetteModal(true);
    }
    
    setMesOF((prev: any) => prev.map((o: any) => {
      if (o.numSousOF === numSousOF) {
        return {
          ...o,
          etat: 'Terminé',
          statut: 'Fin de fabrication',
          piecesProduites: o.qtePieces
        };
      }
      return o;
    }));
  };

  const handleOpenFinPoste = (of: any) => {
    setSelectedOF(of);
    setCompteurMachine('');
    setShowFinPosteModal(true);
  };

  const handleSaveFinPoste = () => {
    if (!selectedOF || !compteurMachine) return;

    const compteurRestant = parseFloat(compteurMachine);
    
    setMesOF((prev: any) => prev.map((of: any) => {
      if (of.numSousOF === (selectedOF as any).numSousOF) {
        // Calcul de la production THÉORIQUE basée sur le compteur dégressif
        const quantiteTheoriqueProduite = (selectedOF as any).compteurInitial - compteurRestant;

        return {
          ...of,
          compteurActuel: compteurRestant,
          piecesProduites: quantiteTheoriqueProduite // Quantité THÉORIQUE
        };
      }
      return of;
    }));

    setShowFinPosteModal(false);
    
    const quantiteTheoriqueProduite = (selectedOF as any).compteurInitial - compteurRestant;
    setSelectedOF({
      ...(selectedOF as any),
      typeEtiquette: 'finposte',
      compteurActuel: compteurRestant,
      piecesProduites: quantiteTheoriqueProduite
    } as any);
    setShowEtiquetteModal(true);
  };

  const handleImprimerEtiquette = (of: any, type: string) => {
    setSelectedOF({
      ...of,
      typeEtiquette: type
    } as any);
    setShowEtiquetteModal(true);
  };

  const handleDeclarerIncident = (numSousOF: string) => {
    setSelectedOF(mesOF.find((of: any) => of.numSousOF === numSousOF) as any);
    setIncidentType('');
    setSelecteurMP('');
    setShowIncidentModal(true);
  };

  const handleRefuserComplement = (of: any) => {
    setSelectedOF(of);
    setCauseRefus('');
    setShowRefuserComplementModal(true);
  };

  const handleConfirmerRefus = () => {
    if (!causeRefus) return;
    
    // Logique pour envoyer le refus
    alert(`Refus envoyé pour l'OF ${(selectedOF as any)?.numSousOF}\nCause: ${causeRefus}`);
    
    setShowRefuserComplementModal(false);
    setCauseRefus('');
  };

  const handleVoirNotes = (of: any) => {
    setSelectedOF(of);
    setShowNotesModal(true);
  };

  const toggleOF = (numSousOF: string) => {
    setExpandedOF(expandedOF === numSousOF ? null : numSousOF);
  };

  const StatCard = ({ title, value, subtitle = '', icon: Icon, color = 'blue' }: { title: string; value: number | string; subtitle?: string; icon: any; color?: string }) => (
    <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
    </div>
  );

  const renderMachines = () => {
    const machinesData = getOFByMachine();
    
    const filteredMachines = selectedMachine 
      ? machinesData.filter((m: any) => m.machine === selectedMachine)
      : machinesData;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Mes Machines</h2>
          <div className="text-sm text-gray-600">
            Organisation par machine et ordre de planification
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Machines actives" 
            value={machinesData.length}
            icon={Box}
            color="#3b82f6"
          />
          <StatCard 
            title="Compléments urgents" 
            value={mesOF.filter(o => o.complementTissage).length}
            icon={AlertTriangle}
            color="#ef4444"
          />
          <StatCard 
            title="En cours" 
            value={mesOF.filter(o => o.etat === 'En cours').length}
            icon={Activity}
            color="#10b981"
          />
          <StatCard 
            title="En attente" 
            value={mesOF.filter(o => o.etat === 'En attente' || o.etat === 'Machine alimentée').length}
            icon={Clock}
            color="#f59e0b"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-24">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">Mes Machines</h3>
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
                    <span>Toutes</span>
                    <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                      {machinesData.length}
                    </span>
                  </div>
                </button>
                
                {machinesData.map((machineData: any) => {
                  const totalOF = machineData.ofs.length;
                  const complementCount = machineData.ofs.filter((o: any) => o.complementTissage).length;
                  const enCoursCount = machineData.ofs.filter((o: any) => o.etat === 'En cours').length;
                  
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
                        {complementCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-semibold">
                            {complementCount} complément
                          </span>
                        )}
                        {enCoursCount > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                            {enCoursCount} en cours
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {filteredMachines.map((machineData: any) => (
              <div key={machineData.machine}>
                {!selectedMachine && (
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <Box className="w-5 h-5 mr-2 text-blue-600" />
                    Machine {machineData.machine}
                  </h3>
                )}
                
                <div className="space-y-2">
                  {machineData.ofs.map((of: any, idx: number) => {
                    const isExpanded = expandedOF === of.numSousOF;
                    const progression = (of.piecesProduites / of.qtePieces) * 100;
                    const peutDemarrer = of.etat === 'Machine alimentée';
                    const enCours = of.etat === 'En cours';
                    const hasNotes = of.noteSpeciale || of.instructionSpeciale || of.noteTisseur;
                    
                    return (
                      <div 
                        key={of.numSousOF}
                        className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                          of.complementTissage ? 'border-red-500 bg-red-50' : 
                          isExpanded ? 'border-blue-500' : 'border-gray-200'
                        } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
                      >
                        <div 
                          onClick={() => toggleOF(of.numSousOF)}
                          className="p-4 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="text-gray-400">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-bold text-gray-900">{of.numSousOF}</span>
                                  
                                  {of.complementTissage && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      COMPLÉMENT {of.quantiteComplement} {of.uniteMesure}
                                    </span>
                                  )}
                                  
                                  {idx === 0 && of.etat === 'Machine alimentée' && !of.complementTissage && (
                                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-semibold">
                                      Prochain
                                    </span>
                                  )}

                                  {of.priorite === 'Urgent' && !of.complementTissage && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                                      URGENT
                                    </span>
                                  )}

                                  {hasNotes && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVoirNotes(of);
                                      }}
                                      className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold hover:bg-yellow-200 flex items-center"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      Notes
                                    </button>
                                  )}
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                  {of.modele} - {of.qtePieces} {of.uniteMesure}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center space-x-1">
                                    {of.selecteurs.map((sel, idx) => (
                                      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                        S{sel.sel}: {sel.codeFab}
                                      </span>
                                    ))}
                                  </div>
                                  {(of.etat === 'Machine alimentée' || of.etat === 'En attente') && (
                                    <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded font-bold">
                                      📊 Compteur: {of.compteurInitial}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                of.etat === 'Machine alimentée' ? 'bg-green-100 text-green-800' :
                                of.etat === 'En cours' ? 'bg-blue-100 text-blue-800' :
                                of.etat === 'Terminé' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {of.statut}
                              </span>
                            </div>
                          </div>

                          {enCours && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progression</span>
                                <span>{of.piecesProduites} / {of.qtePieces} {of.uniteMesure} ({progression.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    of.complementTissage ? 'bg-red-600' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${progression}%` }}
                                />
                              </div>
                              {of.compteurActuel && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Compteur: <span className="font-bold">{of.compteurActuel}</span>
                                  {of.compteurDebut && ` (Début: ${of.compteurDebut})`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="border-t bg-gray-50 p-4">
                            {of.complementTissage && (
                              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                                <p className="text-sm font-bold text-red-900 flex items-center">
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Complément de tissage demandé par le coupeur
                                </p>
                                <p className="text-xs text-red-800 mt-1">
                                  OF origine: {of.ofOrigine} | Quantité: {of.quantiteComplement} {of.uniteMesure}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                              <div>
                                <span className="text-gray-600">Client:</span>
                                <span className="font-medium ml-2">{of.client}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Commande:</span>
                                <span className="font-medium ml-2">{of.numCommande}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Référence:</span>
                                <span className="font-medium ml-2">{of.ref}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Vitesse:</span>
                                <span className="font-medium ml-2">{of.vitesseDuites} duites/min</span>
                              </div>
                              <div className="col-span-2 bg-blue-50 border-2 border-blue-300 rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-blue-900 font-bold text-sm">Compteur à programmer:</span>
                                  <span className="font-bold text-blue-700 text-2xl">
                                    {of.compteurInitial} {of.typeCompteur === 'pieces' ? 'pcs' : 'm'}
                                  </span>
                                </div>
                                <p className="text-xs text-blue-700">⬇️ Compteur dégressif (diminue à chaque production)</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Temps prévu:</span>
                                <span className="font-medium ml-2">{of.tempsPrevu}</span>
                              </div>
                              {of.tempsReel && (
                                <div>
                                  <span className="text-gray-600">Temps réel:</span>
                                  <span className="font-medium ml-2 text-blue-600">{of.tempsReel}</span>
                                </div>
                              )}
                              {of.dateHeureDebut && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Démarré le:</span>
                                  <span className="font-medium ml-2">{new Date(of.dateHeureDebut).toLocaleString('fr-FR')}</span>
                                </div>
                              )}
                            </div>

                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Matières Premières (Code Fabrication):</p>
                              <div className="grid grid-cols-2 gap-2">
                                {of.selecteurs.map((sel, idx) => (
                                  <div key={idx} className="p-2 bg-white border border-gray-200 rounded">
                                    <p className="text-xs text-gray-600">Sélecteur {sel.sel}</p>
                                    <p className="text-sm font-bold">{sel.codeFab}</p>
                                    <p className="text-xs text-gray-600">{sel.couleur}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {enCours && (
                              <div className={`border rounded-lg p-3 mb-4 ${
                                of.complementTissage ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                              }`}>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-600">Pièces produites (théorique)</p>
                                    <p className={`text-xl font-bold ${
                                      of.complementTissage ? 'text-red-600' : 'text-blue-600'
                                    }`}>{of.piecesProduites}</p>
                                    <p className="text-xs text-gray-500 italic mt-1">Qté réelle après contrôle qualité</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">Compteur machine</p>
                                    <p className={`text-xl font-bold ${
                                      of.complementTissage ? 'text-red-600' : 'text-blue-600'
                                    }`}>{of.compteurActuel || '-'}</p>
                                    <p className="text-xs text-gray-500 italic mt-1">Compteur restant</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              {peutDemarrer && (
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleDemarrerOF(of.numSousOF)}
                                    className={`px-4 py-2 text-white rounded-lg font-semibold flex items-center justify-center ${
                                      of.complementTissage 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Démarrer OF
                                  </button>
                                  <button
                                    onClick={() => handleImprimerEtiquette(of, 'debut')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                  >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Étiquette Début
                                  </button>
                                </div>
                              )}

                              {enCours && (
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    onClick={() => handleOpenFinPoste(of)}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center text-sm"
                                  >
                                    <Printer className="w-4 h-4 mr-1" />
                                    Fin Poste
                                  </button>
                                  <button
                                    onClick={() => handleDeclarerIncident(of.numSousOF)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center text-sm"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    Incident
                                  </button>
                                  <button
                                    onClick={() => handleTerminerOF(of.numSousOF)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Terminer
                                  </button>
                                </div>
                              )}
                            </div>
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

  const renderIncidents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Mes Incidents Déclarés</h2>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{incident.id}</h3>
                <p className="text-sm text-gray-600">OF: {incident.numSousOF} | Machine: {incident.machine}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                incident.statut === 'Résolu' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {incident.statut}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">{incident.type}</p>
              <p className="text-gray-600">{incident.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(incident.date).toLocaleString('fr-FR')} | Durée: {incident.duree} min
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRendement = () => {
    const ofTermines = mesOF.filter(of => of.etat === 'Terminé');
    const ofEnCours = mesOF.filter(of => of.etat === 'En cours');

    // Prix unitaire en TND (à adapter selon le produit)
    const prixUnitaireTND = 2.5; // Prix moyen d'une pièce de 2ème choix

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Mon Rendement</h2>

        {/* Rendements par période */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Rendement Aujourd'hui" 
            value="85%"
            subtitle="Théorique: 90%"
            icon={Activity}
            color="#10b981"
          />
          <StatCard 
            title="Rendement Semaine" 
            value="87%"
            subtitle="Théorique: 90%"
            icon={Activity}
            color="#3b82f6"
          />
          <StatCard 
            title="Rendement Mois" 
            value="88%"
            subtitle="Théorique: 90%"
            icon={Activity}
            color="#8b5cf6"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">Détail par OF</h3>
          <div className="space-y-4">
            {mesOF.filter(of => of.etat === 'En cours' || of.etat === 'Terminé').map((of) => {
              const premierChoix = of.piecesProduites - of.deuxiemeChoix - of.dechets;
              const pctDeuxieme = of.piecesProduites > 0 ? ((of.deuxiemeChoix / of.piecesProduites) * 100).toFixed(1) : 0;
              const valeurPerteTND = (of.deuxiemeChoix * prixUnitaireTND).toFixed(2);
              
              return (
                <div key={of.numSousOF} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{of.numSousOF}</p>
                      <p className="text-sm text-gray-600">{of.modele} | Machine {of.machine}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {of.selecteurs.map((sel, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            S{sel.sel}: {sel.codeFab}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-600">1er Choix</p>
                      <p className="font-bold text-green-700 text-lg">{premierChoix}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-xs text-gray-600">2ème Choix</p>
                      <p className="font-bold text-orange-700 text-lg">{of.deuxiemeChoix}</p>
                      <p className="text-xs text-orange-600 font-semibold">{pctDeuxieme}%</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Déchets</p>
                      <p className="font-bold text-red-700 text-lg">{of.dechets}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                    <p className="text-xs text-yellow-800">Valeur perte 2ème choix</p>
                    <p className="text-lg font-bold text-yellow-900">{valeurPerteTND} TND</p>
                    <p className="text-xs text-yellow-700">({of.deuxiemeChoix} × {prixUnitaireTND} TND)</p>
                  </div>

                  {of.tempsReel && (
                    <div className="pt-3 border-t">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Temps réel</p>
                          <p className="font-semibold">{of.tempsReel}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Arrêts exclus</p>
                          <p className="font-semibold text-blue-600">
                            {of.tempsArretsMecanique + of.tempsArretsMP + of.tempsPlanification} min
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rendement Temps</p>
                          <p className="font-semibold text-blue-600">{of.rendementTemps}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau récapitulatif par période */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-bold text-gray-800">Rendement Théorique vs Réel</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Période</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rendement Théorique</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rendement Réel</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Écart</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">2ème Choix</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Perte TND</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Aujourd'hui</td>
                  <td className="py-3 px-4 text-center text-blue-600 font-semibold">90%</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold">85%</td>
                  <td className="py-3 px-4 text-center text-orange-600 font-semibold">-5%</td>
                  <td className="py-3 px-4 text-center">8 pcs (7.3%)</td>
                  <td className="py-3 px-4 text-center text-red-600 font-semibold">20.00 TND</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Cette Semaine</td>
                  <td className="py-3 px-4 text-center text-blue-600 font-semibold">90%</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold">87%</td>
                  <td className="py-3 px-4 text-center text-orange-600 font-semibold">-3%</td>
                  <td className="py-3 px-4 text-center">45 pcs (6.5%)</td>
                  <td className="py-3 px-4 text-center text-red-600 font-semibold">112.50 TND</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Ce Mois</td>
                  <td className="py-3 px-4 text-center text-blue-600 font-semibold">90%</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold">88%</td>
                  <td className="py-3 px-4 text-center text-orange-600 font-semibold">-2%</td>
                  <td className="py-3 px-4 text-center">178 pcs (5.9%)</td>
                  <td className="py-3 px-4 text-center text-red-600 font-semibold">445.00 TND</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Tableau de Bord Tisseur"
      subtitle={`${tisseurNom} - Samedi 18 Octobre 2025`}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <div className="space-y-6">
        {activeSection === 'machines' && renderMachines()}
        {activeSection === 'incidents' && renderIncidents()}
        {activeSection === 'rendement' && renderRendement()}
      </div>

      {/* Modal Début de Poste */}
      {showDebutPosteModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b bg-green-50">
              <h3 className="text-xl font-bold text-green-900">Début de Poste / Démarrage</h3>
              <p className="text-sm text-green-700 mt-1">OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">Compteur initial prévu:</p>
                <p className="text-3xl font-bold text-blue-700">{(selectedOF as any)?.compteurInitial} {(selectedOF as any)?.typeCompteur === 'pieces' ? 'pièces' : 'mètres'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité restante à fabriquer <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={quantiteRestante}
                  onChange={(e) => setQuantiteRestante(e.target.value)}
                  placeholder={`Ex: ${(selectedOF as any)?.compteurInitial}`}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recalculé selon la coupe et les données réelles
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Important:</strong> Cette quantité sera programmée sur le compteur machine (dégressif)
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDebutPosteModal(false);
                  setQuantiteRestante('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmerDemarrage}
                disabled={!quantiteRestante}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer et Démarrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fin de Poste */}
      {showFinPosteModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Fin de Poste</h3>
              <p className="text-sm text-gray-600 mt-1">OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compteur machine restant <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={compteurMachine}
                  onChange={(e) => setCompteurMachine(e.target.value)}
                  placeholder={`Ex: ${(selectedOF as any)?.typeCompteur === 'pieces' ? '40 pièces' : '600 mètres'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⬇️ Compteur dégressif - Indiquez le nombre restant ({(selectedOF as any)?.typeCompteur === 'pieces' ? 'pièces' : 'mètres'})
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-semibold mb-1">
                  Compteur initial programmé: {(selectedOF as any)?.compteurInitial} {(selectedOF as any)?.typeCompteur === 'pieces' ? 'pièces' : 'mètres'}
                </p>
                {compteurMachine && (
                  <>
                    <p className="text-sm text-blue-900">
                      Production THÉORIQUE calculée: <strong>{(selectedOF as any)?.compteurInitial - parseFloat(compteurMachine)} {(selectedOF as any)?.uniteMesure}</strong>
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      (Cette quantité sera indiquée sur l'étiquette)
                    </p>
                  </>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Note importante:</strong> La quantité théorique sera calculée automatiquement. La quantité réelle sera déterminée après le contrôle qualité de la coupe.
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFinPosteModal(false);
                  setCompteurMachine('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveFinPoste}
                disabled={!compteurMachine}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Valider et Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notes */}
      {showNotesModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Notes & Instructions</h3>
              <p className="text-sm text-gray-600 mt-1">OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {(selectedOF as any)?.noteSpeciale && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-900 uppercase mb-2">Note Spéciale</p>
                  <p className="text-sm text-yellow-900">{(selectedOF as any)?.noteSpeciale}</p>
                </div>
              )}

              {(selectedOF as any)?.instructionSpeciale && (
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Instruction Spéciale</p>
                  <p className="text-sm text-blue-900 font-medium">{(selectedOF as any)?.instructionSpeciale}</p>
                </div>
              )}

              {(selectedOF as any)?.noteTisseur && (
                <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                  <p className="text-xs font-semibold text-gray-900 uppercase mb-2">Note Tisseur</p>
                  <p className="text-sm text-gray-700">{(selectedOF as any)?.noteTisseur}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Incident */}
      {showIncidentModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Déclarer un Incident</h3>
              <p className="text-sm text-gray-600 mt-1">OF: {(selectedOF as any)?.numSousOF} | Machine: {(selectedOF as any)?.machine}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'incident</label>
                <select
                  value={incidentType}
                  onChange={(e) => {
                    setIncidentType(e.target.value);
                    setSelecteurMP('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {typesIncident.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {incidentType && typesIncident.find(t => t.value === incidentType)?.needsColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélecteur concerné <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selecteurMP}
                    onChange={(e) => setSelecteurMP(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner...</option>
                    {(selectedOF as any)?.selecteurs?.map((sel: any, idx: number) => (
                      <option key={idx} value={sel.sel}>
                        Sélecteur {sel.sel} - {sel.codeFab} ({sel.couleur})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {incidentType === 'mp_manque' ? 'Indiquer quelle matière manque' : 'Indiquer quelle matière nécessite une alimentation'}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Décrivez le problème..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowIncidentModal(false);
                  setIncidentType('');
                  setSelecteurMP('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowIncidentModal(false);
                  setIncidentType('');
                  setSelecteurMP('');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Envoyer l'alerte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Refuser Complément */}
      {showRefuserComplementModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b bg-red-50">
              <h3 className="text-xl font-bold text-red-900">Refuser le Complément</h3>
              <p className="text-sm text-red-700 mt-1">OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Attention:</strong> Vous êtes sur le point de refuser un complément de tissage urgent.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cause du refus <span className="text-red-600">*</span>
                </label>
                <select
                  value={causeRefus}
                  onChange={(e) => setCauseRefus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="matiere_manquante">Matière première manquante</option>
                  <option value="probleme_machine">Problème machine</option>
                  <option value="carton_manquant">Carton manquant</option>
                  <option value="programme_incorrect">Programme incorrect</option>
                  <option value="autre">Autre raison</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Détails (optionnel)</label>
                <textarea
                  rows={3}
                  placeholder="Précisez la raison du refus..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRefuserComplementModal(false);
                  setCauseRefus('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmerRefus}
                disabled={!causeRefus}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Étiquette */}
      {showEtiquetteModal && selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Étiquette {
                  (selectedOF as any)?.typeEtiquette === 'debut' ? 'Début de Poste' :
                  (selectedOF as any)?.typeEtiquette === 'finposte' ? 'Fin de Poste' :
                  'Fin de Fabrication'
                }
              </h3>
            </div>
            
            <div className="p-6">
              <div className="border-4 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {(selectedOF as any)?.numSousOF}
                  </div>
                  <div className="text-lg font-semibold">
                    {(selectedOF as any)?.modele} - {(selectedOF as any)?.ref}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Machine: {(selectedOF as any)?.machine}</div>
                    <div className="font-bold text-blue-700">Tisseur: {tisseurNom}</div>
                    <div>Date: {new Date().toLocaleString('fr-FR')}</div>
                    {(selectedOF as any)?.typeEtiquette === 'finposte' && (
                      <>
                        <div className="font-bold text-green-600 mt-2 text-base">
                          Produit THÉORIQUE: {(selectedOF as any)?.piecesProduites} pièces
                        </div>
                        <div className="font-bold text-orange-600">
                          Compteur restant: {(selectedOF as any)?.compteurActuel} {(selectedOF as any)?.typeCompteur === 'pieces' ? 'pcs' : 'm'}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 italic">
                          Quantité réelle à déterminer après contrôle qualité
                        </div>
                      </>
                    )}
                    {(selectedOF as any)?.typeEtiquette === 'fin' && (
                      <>
                        <div className="font-bold text-green-600 mt-2">
                          Total: {(selectedOF as any)?.qtePieces} {(selectedOF as any)?.uniteMesure}
                        </div>
                        <div className="font-bold text-blue-600">
                          Temps: {(selectedOF as any)?.tempsReel || (selectedOF as any)?.tempsPrevu}
                        </div>
                      </>
                    )}
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Widget WhatsApp pour ce dashboard */}
      <WhatsAppWidget 
        dashboardName="Tisseur"
        position="bottom-right"
      />
    </DashboardLayout>
  );
};

export default DashboardTisseur;