import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Package, AlertTriangle, TrendingUp, Calendar, Scissors, QrCode, Camera, Printer, Edit, Search, Save, X, CheckCircle, Plus, Clock, ArrowLeft, FileText } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const DashboardPostCoupe = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saisie'); // saisie, planning, impression, analyse, correction
  const [showCamera, setShowCamera] = useState(false);
  const [showEtiquettePreview, setShowEtiquettePreview] = useState(false);
  const [showFinFabricationModal, setShowFinFabricationModal] = useState(false);
  const [showConfirmationRetour, setShowConfirmationRetour] = useState(false);
  const [showDemandeManquant, setShowDemandeManquant] = useState(false);
  
  // État pour la saisie
  const [saisie, setSaisie] = useState({
    qrFabrication: '',
    numSousOF: '',
    client: '',
    commande: '',
    refCommercial: '',
    modele: '',
    dimensions: '',
    qteAFabriquer: 0,
    
    // Infos du scan tissage
    dateTissage: '',
    heureTissage: '',
    operationTissage: '', // 'Fin Fabrication', 'Fin Poste', 'Départ', etc.
    tisseur: '',
    machine: '',
    
    // Quantités saisies
    qteFabriquee: 0,
    qteOurlet: 0,
    qteDeuxieme: 0,
    qteDeuxiemeApprouvee: 0,
    qteDechet: 0,
    typesDeuxieme: [] as string[],
    photos: [] as string[],
    coupeur: 'Ahmed' // Vrai coupeur
  });

  const [etiquettesEnAttente, setEtiquettesEnAttente] = useState<any[]>([]);
  const [actionFinFabrication, setActionFinFabrication] = useState<any>(null); // 'demander' ou 'retourner'
  
  // Stockage temporaire pour les modals après validation
  const [saisieTemp, setSaisieTemp] = useState({
    numSousOF: '',
    tisseur: '',
    qteAFabriquer: 0,
    totalCoupe: 0
  });

  // Types de deuxième choix détaillés
  const typesDeuxiemeOptions = [
    'Tâche',
    'Déchiré',
    'Fils simples',
    'Défait',
    'Abîmé',
    'Défaut tissage',
    'Erreur couleur',
    'Erreur dimension',
    'Trou',
    'Défaut de coupe',
    'Salissure',
    'Autre défaut'
  ];

  // Coupeurs (pas tisseurs)
  const coupeurs = ['Ahmed', 'Karim', 'Salim', 'Nabil'];

  // Planning en cours (OF à couper)
  const [planningEnCours, setPlanningEnCours] = useState([
    { 
      numSousOF: 'OF246533', 
      modele: 'MARINIERE', 
      client: 'CL00296', 
      qteAFabriquer: 50,
      statut: 'Fin Fabrication',
      tisseur: 'Badie',
      dateTissage: '2025-10-18 14:30',
      urgence: false
    },
    { 
      numSousOF: 'CA250469', 
      modele: 'FIL A FIL', 
      client: 'All by Fouta', 
      qteAFabriquer: 40,
      statut: 'En cours tissage',
      tisseur: 'Dimatex',
      dateTissage: '2025-10-18 10:15',
      urgence: false
    },
    { 
      numSousOF: 'OF247821', 
      modele: 'ST TROPEZ', 
      client: 'CL00458', 
      qteAFabriquer: 100,
      statut: 'Fin Poste',
      tisseur: 'Zied',
      dateTissage: '2025-10-18 16:00',
      urgence: true
    },
    { 
      numSousOF: 'CA250023', 
      modele: 'UNI SURPIQUE', 
      client: 'All by Fouta', 
      qteAFabriquer: 20,
      statut: 'Fin Fabrication',
      tisseur: 'Badie',
      dateTissage: '2025-10-18 09:00',
      urgence: false
    }
  ]);

  // Données historiques pour l'analyse
  const dataOperateurs = [
    { personne: "Ahmed", operations: 95, premiere: 3200, deuxieme: 28, dechets: 85, ourlet: 12 },
    { personne: "Karim", operations: 78, premiere: 2850, deuxieme: 45, dechets: 52, ourlet: 8 },
    { personne: "Salim", operations: 68, premiere: 2480, deuxieme: 38, dechets: 48, ourlet: 5 },
    { personne: "Nabil", operations: 38, premiere: 1486, deuxieme: 58, dechets: 41, ourlet: 4 }
  ];

  // Données de correction (historique des saisies)
  const [saisiesHistorique, setSaisiesHistorique] = useState<any[]>([
    { id: 1, date: '2025-10-18', numSousOF: 'OF246533', modele: 'MARINIERE', qteFabriquee: 46, qteDeuxieme: 2, qteDechet: 1, coupeur: 'Ahmed', statut: 'Validé' },
    { id: 2, date: '2025-10-18', numSousOF: 'CA250469', modele: 'FIL A FIL', qteFabriquee: 38, qteDeuxieme: 0, qteDechet: 0, coupeur: 'Karim', statut: 'Validé' },
    { id: 3, date: '2025-10-18', numSousOF: 'CA250023', modele: 'UNI SURPIQUE', qteFabriquee: 15, qteDeuxieme: 0, qteDechet: 0, coupeur: 'Ahmed', statut: 'En cours' }
  ]);

  // Simuler le scan QR avec info de fin de fabrication
  const simulerScanQR = () => {
    const ofSelectionne = planningEnCours[0]; // Premier OF en Fin Fabrication
    
    setSaisie({
      ...saisie,
      qrFabrication: 'OF246533_CL00296_CM-FT0108_EPMA0919-B15-02',
      numSousOF: ofSelectionne.numSousOF,
      client: ofSelectionne.client,
      commande: 'CM-FT0108',
      refCommercial: 'EPMA0919-B15-02',
      modele: ofSelectionne.modele,
      dimensions: '0919',
      qteAFabriquer: ofSelectionne.qteAFabriquer,
      dateTissage: '2025-10-18',
      heureTissage: '14:30:25',
      operationTissage: ofSelectionne.statut,
      tisseur: ofSelectionne.tisseur,
      machine: 'M2301'
    });

    // Si c'est une fin de fabrication, afficher l'alerte simple
    if (ofSelectionne.statut === 'Fin Fabrication') {
      setShowFinFabricationModal(true);
    }
  };

  // Calculer le total et vérifier la cohérence
  const calculerTotal = () => {
    const total = saisie.qteFabriquee + saisie.qteDeuxieme + saisie.qteDechet;
    return total;
  };

  // Générer les étiquettes de suivi
  const genererEtiquettes = () => {
    const etiquettes: any[] = [];
    const qteLotStandard = saisie.modele.includes('JACQUARD') ? null : 5;
    
    // Étiquettes 1er choix
    if (saisie.qteFabriquee > 0) {
      let reste = saisie.qteFabriquee;
      let numeroEtiquette = 1;
      
      while (reste > 0) {
        const qteLot = qteLotStandard ? Math.min(qteLotStandard, reste) : reste;
        etiquettes.push({
          numSuivi: `${saisie.numSousOF}-${numeroEtiquette.toString().padStart(3, '0')}`,
          qualite: '1er Choix',
          quantite: qteLot,
          modele: saisie.modele,
          dimensions: saisie.dimensions,
          refCommercial: saisie.refCommercial,
          client: saisie.client,
          commande: saisie.commande
        });
        reste -= qteLot;
        numeroEtiquette++;
      }
    }

    // Étiquettes 2ème choix
    if (saisie.qteDeuxieme > 0) {
      let reste = saisie.qteDeuxieme;
      let numeroEtiquette = 1;
      
      while (reste > 0) {
        const qteLot = qteLotStandard ? Math.min(qteLotStandard, reste) : reste;
        etiquettes.push({
          numSuivi: `${saisie.numSousOF}-2C-${numeroEtiquette.toString().padStart(3, '0')}`,
          qualite: '2ème Choix',
          quantite: qteLot,
          modele: saisie.modele,
          dimensions: saisie.dimensions,
          refCommercial: saisie.refCommercial,
          client: saisie.client,
          commande: saisie.commande,
          types: saisie.typesDeuxieme.join(', ')
        });
        reste -= qteLot;
        numeroEtiquette++;
      }
    }

    // Étiquettes 2ème choix approuvé
    if (saisie.qteDeuxiemeApprouvee > 0) {
      let reste = saisie.qteDeuxiemeApprouvee;
      let numeroEtiquette = 1;
      
      while (reste > 0) {
        const qteLot = qteLotStandard ? Math.min(qteLotStandard, reste) : reste;
        etiquettes.push({
          numSuivi: `${saisie.numSousOF}-2A-${numeroEtiquette.toString().padStart(3, '0')}`,
          qualite: '2ème Approuvé',
          quantite: qteLot,
          modele: saisie.modele,
          dimensions: saisie.dimensions,
          refCommercial: saisie.refCommercial,
          client: saisie.client,
          commande: saisie.commande
        });
        reste -= qteLot;
        numeroEtiquette++;
      }
    }

    return etiquettes;
  };

  // Valider la saisie
  const validerSaisie = () => {
    if (!saisie.numSousOF) {
      alert('Veuillez scanner l\'étiquette QR code');
      return;
    }
    
    if (calculerTotal() === 0) {
      alert('Veuillez saisir au moins une quantité');
      return;
    }

    if (saisie.qteDeuxieme > 0 && saisie.typesDeuxieme.length === 0) {
      alert('Veuillez sélectionner au moins un type de deuxième choix');
      return;
    }

    const etiquettes = genererEtiquettes();
    setEtiquettesEnAttente([...etiquettesEnAttente, ...etiquettes]);
    
    const totalCoupe = calculerTotal();
    const reste = saisie.qteAFabriquer - totalCoupe;
    
    // Stocker les infos pour les modals
    setSaisieTemp({
      numSousOF: saisie.numSousOF,
      tisseur: saisie.tisseur,
      qteAFabriquer: saisie.qteAFabriquer,
      totalCoupe: totalCoupe
    });
    
    // Si c'était une fin de fabrication, vérifier s'il reste des pièces
    if (saisie.operationTissage === 'Fin Fabrication') {
      if (reste > 0) {
        // Il manque des pièces
        alert(`⚠️ Saisie validée !\n\n${etiquettes.length} étiquette(s) ajoutée(s).\n\nATTENTION : Il reste ${reste} pièce(s) à produire !`);
        setShowDemandeManquant(true);
      } else if (reste === 0) {
        // Quantité parfaite
        alert(`✅ Saisie validée !\n\n${etiquettes.length} étiquette(s) ajoutée(s).\n\nQuantité complète ! Vous pouvez retourner la matière première.`);
        setShowConfirmationRetour(true);
      } else {
        // Surplus (reste < 0)
        alert(`✅ Saisie validée !\n\n${etiquettes.length} étiquette(s) ajoutée(s).\n\n⚠️ Attention : Surplus de ${Math.abs(reste)} pièce(s) détecté.`);
        setShowConfirmationRetour(true);
      }
    } else {
      // Pas une fin de fabrication, validation simple
      alert(`✅ Saisie validée ! ${etiquettes.length} étiquette(s) ajoutée(s) à la file d'impression.`);
    }
    
    // Réinitialiser pour la prochaine saisie
    setSaisie({
      ...saisie,
      qrFabrication: '',
      numSousOF: '',
      client: '',
      commande: '',
      refCommercial: '',
      modele: '',
      dimensions: '',
      qteAFabriquer: 0,
      dateTissage: '',
      heureTissage: '',
      operationTissage: '',
      tisseur: '',
      machine: '',
      qteFabriquee: 0,
      qteOurlet: 0,
      qteDeuxieme: 0,
      qteDeuxiemeApprouvee: 0,
      qteDechet: 0,
      typesDeuxieme: [],
      photos: []
    });
  };

  // Envoyer demande manquant
  const envoyerDemandeManquant = () => {
    const reste = saisieTemp.qteAFabriquer - saisieTemp.totalCoupe;
    alert(`✅ Demande de fabrication complémentaire envoyée au tisseur ${saisieTemp.tisseur}\n\nQuantité manquante: ${reste} pièce(s)\nNum Sous OF: ${saisieTemp.numSousOF}`);
    setShowDemandeManquant(false);
    setActionFinFabrication(null);
  };

  // Confirmer retour matière première
  const confirmerRetourMP = () => {
    alert('✅ Demande de retour matière première envoyée au magasinier\n✅ Confirmation de fin de fabrication envoyée au tisseur ' + saisieTemp.tisseur);
    setShowConfirmationRetour(false);
    setActionFinFabrication(null);
  };

  // Rendu de l'interface de saisie
  const renderSaisie = () => (
    <div className="space-y-6">
      {/* Scan QR Code */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <QrCode className="text-blue-600" />
          Scanner l'Étiquette de Tissage
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={simulerScanQR}
            className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <QrCode size={24} />
            Scanner QR Code
          </button>
          <button className="bg-gray-200 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2">
            <Search size={20} />
            Recherche Manuelle
          </button>
        </div>

        {saisie.numSousOF && (
          <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
            <div className="mb-4 pb-3 border-b border-gray-300">
              <h3 className="text-lg font-bold text-gray-800 mb-2">📋 Informations OF</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Num Sous OF:</span>
                  <p className="text-gray-900 font-bold text-lg">{saisie.numSousOF}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Client:</span>
                  <p className="text-gray-900">{saisie.client}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Commande:</span>
                  <p className="text-gray-900">{saisie.commande}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Réf. Commercial:</span>
                  <p className="text-gray-900">{saisie.refCommercial}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                <div>
                  <span className="font-semibold text-gray-700">Modèle:</span>
                  <p className="text-gray-900 font-bold">{saisie.modele}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Dimensions:</span>
                  <p className="text-gray-900">{saisie.dimensions}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Qté à Fabriquer:</span>
                  <p className="text-gray-900 font-bold text-lg text-green-600">{saisie.qteAFabriquer}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Machine:</span>
                  <p className="text-gray-900">{saisie.machine}</p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-800 mb-2">🕐 Informations Tissage</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Tisseur:</span>
                  <p className="text-gray-900 font-bold">{saisie.tisseur}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Date Tissage:</span>
                  <p className="text-gray-900">{saisie.dateTissage}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Heure:</span>
                  <p className="text-gray-900">{saisie.heureTissage}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">État:</span>
                  <p className={`font-bold ${
                    saisie.operationTissage === 'Fin Fabrication' ? 'text-green-600' :
                    saisie.operationTissage === 'Fin Poste' ? 'text-orange-600' :
                    'text-blue-600'
                  }`}>
                    {saisie.operationTissage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saisie des quantités */}
      {saisie.numSousOF && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Scissors className="text-blue-600" />
            Saisie des Quantités - Contrôle de Cohérence
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantité Fabriquée */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantité 1er Choix (inclut ourlet)
              </label>
              <input
                type="number"
                value={saisie.qteFabriquee}
                onChange={(e) => setSaisie({...saisie, qteFabriquee: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg text-lg font-bold focus:border-green-500 focus:outline-none"
                min="0"
              />
            </div>

            {/* Quantité Ourlet */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantité Ourlet (comprise dans 1er choix)
              </label>
              <input
                type="number"
                value={saisie.qteOurlet}
                onChange={(e) => setSaisie({...saisie, qteOurlet: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg font-bold focus:border-blue-500 focus:outline-none"
                min="0"
                max={saisie.qteFabriquee}
              />
            </div>

            {/* Quantité 2ème Choix */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantité 2ème Choix
              </label>
              <input
                type="number"
                value={saisie.qteDeuxieme}
                onChange={(e) => setSaisie({...saisie, qteDeuxieme: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-lg font-bold focus:border-orange-500 focus:outline-none"
                min="0"
              />
            </div>

            {/* Quantité 2ème Choix Approuvé */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantité 2ème Approuvé
              </label>
              <input
                type="number"
                value={saisie.qteDeuxiemeApprouvee}
                onChange={(e) => setSaisie({...saisie, qteDeuxiemeApprouvee: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg text-lg font-bold focus:border-yellow-500 focus:outline-none"
                min="0"
              />
            </div>

            {/* Quantité Déchet */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantité Déchet
              </label>
              <input
                type="number"
                value={saisie.qteDechet}
                onChange={(e) => setSaisie({...saisie, qteDechet: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-red-300 rounded-lg text-lg font-bold focus:border-red-500 focus:outline-none"
                min="0"
              />
            </div>

            {/* Total et Vérification */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-2 border-gray-300">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Coupé</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">{calculerTotal()}</p>
                
                {/* Indicateur de reste */}
                {saisie.qteAFabriquer > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Qté à fabriquer:</span>
                      <span className="text-lg font-bold text-blue-600">{saisie.qteAFabriquer}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Total coupé:</span>
                      <span className="text-lg font-bold text-gray-900">{calculerTotal()}</span>
                    </div>
                    <div className="pt-2 border-t-2 border-gray-400">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">RESTE:</span>
                        <span className={`text-2xl font-bold ${
                          calculerTotal() < saisie.qteAFabriquer ? 'text-orange-600' :
                          calculerTotal() > saisie.qteAFabriquer ? 'text-red-600' :
                          'text-green-600'
                        }`}>
                          {calculerTotal() < saisie.qteAFabriquer ? 
                            `${saisie.qteAFabriquer - calculerTotal()} ⚠️` :
                            calculerTotal() > saisie.qteAFabriquer ?
                            `+${calculerTotal() - saisie.qteAFabriquer} ⚠️` :
                            '0 ✓'
                          }
                        </span>
                      </div>
                      {calculerTotal() !== saisie.qteAFabriquer && calculerTotal() > 0 && (
                        <p className="text-xs mt-2 text-center">
                          {calculerTotal() < saisie.qteAFabriquer ? 
                            <span className="text-orange-700 font-semibold">Il manque des pièces à produire</span> :
                            <span className="text-red-700 font-semibold">Attention surplus détecté</span>
                          }
                        </p>
                      )}
                      {calculerTotal() === saisie.qteAFabriquer && calculerTotal() > 0 && (
                        <p className="text-xs mt-2 text-center text-green-700 font-semibold">
                          ✓ Quantité complète et cohérente
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Types de 2ème choix */}
          {saisie.qteDeuxieme > 0 && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Type(s) de Défaut - Sélection Multiple ⚠️
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {typesDeuxiemeOptions.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-orange-100 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={saisie.typesDeuxieme.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSaisie({...saisie, typesDeuxieme: [...saisie.typesDeuxieme, type]});
                        } else {
                          setSaisie({...saisie, typesDeuxieme: saisie.typesDeuxieme.filter(t => t !== type)});
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
              {saisie.typesDeuxieme.length > 0 && (
                <div className="mt-2 p-2 bg-orange-100 rounded text-sm text-orange-800 font-semibold">
                  ✓ Sélectionnés: {saisie.typesDeuxieme.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Photo */}
          <div className="mt-6">
            <button 
              onClick={() => setShowCamera(true)}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Prendre une Photo de Documentation
              {saisie.photos.length > 0 && ` (${saisie.photos.length})`}
            </button>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button 
              onClick={validerSaisie}
              className="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Save size={24} />
              Valider Saisie
            </button>
            <button 
              onClick={() => setSaisie({...saisie, qteFabriquee: 0, qteDeuxieme: 0, qteDeuxiemeApprouvee: 0, qteDechet: 0, qteOurlet: 0, typesDeuxieme: [], photos: []})}
              className="bg-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Rendu du planning
  const renderPlanning = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="text-blue-600" />
        Planning en Cours - Charge de Travail
      </h2>
      <p className="text-gray-600 mb-6">Visualisation des OF à couper dans les heures qui suivent</p>

      <div className="space-y-4">
        {planningEnCours.map((of, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              of.urgence ? 'bg-red-50 border-red-500' :
              of.statut === 'Fin Fabrication' ? 'bg-green-50 border-green-500' :
              of.statut === 'Fin Poste' ? 'bg-orange-50 border-orange-500' :
              'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{of.numSousOF}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    of.statut === 'Fin Fabrication' ? 'bg-green-200 text-green-800' :
                    of.statut === 'Fin Poste' ? 'bg-orange-200 text-orange-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {of.statut}
                  </span>
                  {of.urgence && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-200 text-red-800 animate-pulse">
                      🔥 URGENT
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Modèle:</span>
                    <p className="font-semibold text-gray-900">{of.modele}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <p className="font-semibold text-gray-900">{of.client}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Qté à fabriquer:</span>
                    <p className="font-bold text-lg text-green-600">{of.qteAFabriquer}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tisseur:</span>
                    <p className="font-semibold text-gray-900">{of.tisseur}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={14} />
                  Date tissage: {of.dateTissage}
                </div>
              </div>
              <div>
                {of.statut === 'Fin Fabrication' && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold">
                    Commencer Coupe
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">Résumé Charge de Travail</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {planningEnCours.filter(of => of.statut === 'Fin Fabrication').length}
            </p>
            <p className="text-sm text-gray-600">Prêts à couper</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {planningEnCours.filter(of => of.statut === 'En cours tissage').length}
            </p>
            <p className="text-sm text-gray-600">En tissage</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {planningEnCours.reduce((sum, of) => sum + of.qteAFabriquer, 0)}
            </p>
            <p className="text-sm text-gray-600">Total pièces</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu de l'impression
  const renderImpression = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Printer className="text-blue-600" />
        Impression des Étiquettes - Fin de Journée
      </h2>
      <p className="text-gray-600 mb-6">
        {etiquettesEnAttente.length} étiquette(s) en attente d'impression
      </p>

      {etiquettesEnAttente.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Aucune étiquette en attente</p>
          <p className="text-sm">Les étiquettes validées dans l'onglet Saisie apparaîtront ici</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {etiquettesEnAttente.map((etiq, index) => (
              <div key={index} className={`border-4 rounded-lg p-4 ${
                etiq.qualite === '1er Choix' ? 'border-green-400 bg-green-50' :
                etiq.qualite === '2ème Choix' ? 'border-orange-400 bg-orange-50' :
                'border-yellow-400 bg-yellow-50'
              }`}>
                <div className="text-center space-y-2">
                  <div className="text-xl font-bold text-gray-900">{etiq.numSuivi}</div>
                  <div className={`text-base font-semibold ${
                    etiq.qualite === '1er Choix' ? 'text-green-700' :
                    etiq.qualite === '2ème Choix' ? 'text-orange-700' :
                    'text-yellow-700'
                  }`}>
                    {etiq.qualite}
                  </div>
                  <div className="text-xs text-gray-700">
                    <div className="font-semibold">{etiq.modele} - {etiq.dimensions}</div>
                    <div className="text-xs text-gray-600">{etiq.client}</div>
                    <div className="text-xs text-gray-600">{etiq.refCommercial}</div>
                    <div className="font-bold text-lg mt-1">Qté: {etiq.quantite}</div>
                    {etiq.types && <div className="text-xs text-orange-600 mt-1">{etiq.types}</div>}
                  </div>
                  <div className="mt-2 p-2 bg-white border-2 border-gray-300">
                    <div className="text-xs text-gray-500">QR CODE</div>
                    <div className="text-sm font-mono font-bold">████████</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                alert(`Impression de ${etiquettesEnAttente.length} étiquettes lancée !`);
                setEtiquettesEnAttente([]);
              }}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Printer size={24} />
              Imprimer toutes les étiquettes ({etiquettesEnAttente.length})
            </button>
            <button 
              onClick={() => setEtiquettesEnAttente([])}
              className="bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Effacer file
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Rendu de l'interface d'analyse (simplifié)
  const renderAnalyse = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600 uppercase">Production 1er Choix</p>
          <p className="text-3xl font-bold text-green-600 mt-2">10,016</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-600 uppercase">Taux 2ème Choix</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">1.69%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-600 uppercase">Taux Déchets</p>
          <p className="text-3xl font-bold text-red-600 mt-2">2.26%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600 uppercase">Rendement Moyen</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">96.1%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Performance par Coupeur</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataOperateurs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="personne" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="premiere" name="1ère Choix" fill="#10b981" />
            <Bar dataKey="deuxieme" name="2ème Choix" fill="#f59e0b" />
            <Bar dataKey="dechets" name="Déchets" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Rendu de l'interface de correction (simplifié)
  const renderCorrection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Edit className="text-blue-600" />
        Historique des Saisies - Correction
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Num Sous OF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">1er Choix</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">2ème Choix</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Déchets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coupeur</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {saisiesHistorique.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.numSousOF}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.modele}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-semibold">{item.qteFabriquee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600 font-semibold">{item.qteDeuxieme}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-semibold">{item.qteDechet}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.coupeur}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="text-blue-600 hover:text-blue-800 mx-1">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="Poste Coupe"
      subtitle="Saisie, Planning, Impression, Analyse & Correction"
      activeSection={activeTab}
      onSectionChange={(id: any) => setActiveTab(id as any)}
    >
      <div className="mb-4 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-gray-600">Coupeur</p>
          <select 
            value={saisie.coupeur}
            onChange={(e) => setSaisie({...saisie, coupeur: e.target.value})}
            className="text-lg font-bold text-gray-800 bg-white border-2 border-gray-300 rounded px-3 py-1"
          >
            {coupeurs.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {activeTab === 'saisie' && renderSaisie()}
      {activeTab === 'planning' && renderPlanning()}
      {activeTab === 'impression' && renderImpression()}
      {activeTab === 'analyse' && renderAnalyse()}
      {activeTab === 'correction' && renderCorrection()}

      {/* Modal Fin de Fabrication - Alerte Simple */}
      {showFinFabricationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b bg-yellow-50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-yellow-600" size={32} />
                ⚠️ ATTENTION - Fin de Fabrication
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">Informations OF:</p>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold">Num Sous OF:</span> {saisie.numSousOF}</p>
                  <p><span className="font-semibold">Modèle:</span> {saisie.modele}</p>
                  <p><span className="font-semibold">Client:</span> {saisie.client}</p>
                  <p><span className="font-semibold">Qté à fabriquer:</span> <span className="text-green-600 font-bold text-xl">{saisie.qteAFabriquer}</span></p>
                  <p><span className="font-semibold">Tisseur:</span> {saisie.tisseur}</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                <p className="text-yellow-900 font-bold text-lg mb-2">📋 Instructions</p>
                <ul className="text-yellow-800 space-y-2 text-sm">
                  <li>✓ Vérifiez attentivement toutes les pièces reçues</li>
                  <li>✓ Contrôlez la cohérence avec la quantité à fabriquer</li>
                  <li>✓ Effectuez la saisie complète de la coupe</li>
                  <li>✓ Le système vous indiquera ensuite les actions nécessaires</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowFinFabricationModal(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
              >
                <CheckCircle size={20} />
                Compris - Faire la saisie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Demande Manquant */}
      {showDemandeManquant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b bg-orange-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-orange-600" />
                Pièces Manquantes Détectées
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-red-900 font-bold text-lg mb-2">⚠️ Il reste des pièces à produire</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-700">Qté à fabriquer:</span>
                    <span className="font-bold">{saisieTemp.qteAFabriquer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Total coupé:</span>
                    <span className="font-bold">{saisieTemp.totalCoupe}</span>
                  </div>
                  <div className="border-t-2 border-red-300 pt-2 flex justify-between">
                    <span className="text-red-900 font-bold">RESTE À PRODUIRE:</span>
                    <span className="text-red-900 font-bold text-2xl">{saisieTemp.qteAFabriquer - saisieTemp.totalCoupe}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                Souhaitez-vous envoyer une demande de fabrication complémentaire au tisseur <span className="font-bold">{saisieTemp.tisseur}</span> ?
              </p>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Num Sous OF:</span> {saisieTemp.numSousOF}<br/>
                  <span className="font-semibold">Tisseur:</span> {saisieTemp.tisseur}
                </p>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Le tisseur recevra une notification et pourra accepter ou refuser selon la disponibilité de la matière première.
              </p>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDemandeManquant(false);
                  setActionFinFabrication(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button 
                onClick={envoyerDemandeManquant}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2 font-semibold"
              >
                <Plus size={16} />
                Envoyer Demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Retour MP */}
      {showConfirmationRetour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className={`p-6 border-b ${saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? (
                  <><CheckCircle className="text-green-600" /> Quantité Fabriquée OK</>
                ) : (
                  <><AlertTriangle className="text-yellow-600" /> Surplus Détecté</>
                )}
              </h3>
            </div>
            
            <div className="p-6">
              <div className={`mb-4 p-4 border-2 rounded-lg ${
                saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? 
                'bg-green-50 border-green-300' : 
                'bg-yellow-50 border-yellow-300'
              }`}>
                <p className={`font-bold text-lg mb-2 ${
                  saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? '✅ Fabrication Complète' : '⚠️ Attention Surplus'}
                </p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Qté à fabriquer:</span>
                    <span className="font-bold">{saisieTemp.qteAFabriquer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total coupé:</span>
                    <span className="font-bold">{saisieTemp.totalCoupe}</span>
                  </div>
                  <div className="border-t-2 pt-2 flex justify-between">
                    <span className="font-bold">
                      {saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? 'RESTE:' : 'SURPLUS:'}
                    </span>
                    <span className={`font-bold text-2xl ${
                      saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      {saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? '0 ✓' : `+${saisieTemp.totalCoupe - saisieTemp.qteAFabriquer}`}
                    </span>
                  </div>
                </div>
              </div>

              {saisieTemp.totalCoupe > saisieTemp.qteAFabriquer && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800">
                    Un surplus a été détecté. Vérifiez la cohérence des pièces avant de continuer.
                  </p>
                </div>
              )}

              <p className="text-gray-700 mb-4 font-semibold">
                {saisieTemp.totalCoupe === saisieTemp.qteAFabriquer ? 
                  'La fabrication est terminée et complète.' :
                  'Malgré le surplus, vous pouvez clôturer cette fabrication.'
                }
              </p>
              
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="font-semibold text-gray-800 mb-2">📋 Actions automatiques:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Demande retour matière première → Magasinier MP</li>
                    <li>✓ Confirmation fin fabrication → Tisseur {saisieTemp.tisseur}</li>
                    <li>✓ Mise à jour statut OF → Terminé</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmationRetour(false);
                  setActionFinFabrication(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button 
                onClick={confirmerRetourMP}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 font-semibold"
              >
                <CheckCircle size={16} />
                Confirmer Fin Fabrication
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPostCoupe;
