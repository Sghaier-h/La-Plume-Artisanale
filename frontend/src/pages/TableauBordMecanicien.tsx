import React, { useState } from 'react';
import { Wrench, AlertTriangle, Calendar, Settings, Package, FileText, CheckCircle, Clock, TrendingUp, Plus, Eye, Edit, Trash2, Send, PlayCircle, PauseCircle, Download, CheckSquare, XCircle, AlertCircle, Printer, Save, Mail, Droplet, Activity } from 'lucide-react';

const TableauBordMecanicien = () => {
  const [activeTab, setActiveTab] = useState('planning');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Planning des machines
  const [planningMachines, setPlanningMachines] = useState([
    { 
      id: 'M2301', 
      ofActuel: 'OF-2501', 
      modeleActuel: 'Ibiza',
      metrageActuel: 2450,
      metrageTotal: 5000,
      ensoupleActuelle: 'ENS-2301-A',
      ofSuivant: 'OF-2502',
      modeleSuivant: 'Santorini',
      urgence: 'Haute',
      alerteChangement: true,
      etat: 'En marche',
      derniereControle: '2025-10-19 07:30',
      configuration: 'Config A - Laize 145cm',
      vitesse: 350,
      rendement: 94,
      productionJour: 850, // mètres par jour
      joursRestants: 3
    },
    { 
      id: 'M2302', 
      ofActuel: 'OF-2503', 
      modeleActuel: 'Capri',
      metrageActuel: 1850,
      metrageTotal: 4800,
      ensoupleActuelle: 'ENS-2302-B',
      ofSuivant: 'OF-2503',
      modeleSuivant: 'Capri',
      urgence: 'Basse',
      alerteChangement: false,
      etat: 'En marche',
      derniereControle: '2025-10-19 06:15',
      configuration: 'Config B - Laize 150cm',
      vitesse: 320,
      rendement: 91,
      productionJour: 780,
      joursRestants: 4
    },
    { 
      id: 'M2303', 
      ofActuel: 'OF-2504', 
      modeleActuel: 'Malta',
      metrageActuel: 320,
      metrageTotal: 5200,
      ensoupleActuelle: 'ENS-2303-C',
      ofSuivant: 'OF-2505',
      modeleSuivant: 'Ibiza',
      urgence: 'Critique',
      alerteChangement: true,
      etat: 'En panne',
      raisonPanne: 'Courroie cassée',
      typePanne: 'Mécanique',
      tempsArret: 125,
      perteCA: 845,
      dateDebutPanne: '2025-10-19 08:45',
      derniereControle: '2025-10-18 14:20',
      configuration: 'Config C - Laize 140cm',
      vitesse: 0,
      rendement: 0,
      productionJour: 820,
      joursRestants: 0
    },
    { 
      id: 'M2304', 
      ofActuel: 'OF-2506', 
      modeleActuel: 'Santorini',
      metrageActuel: 3200,
      metrageTotal: 5000,
      ensoupleActuelle: 'ENS-2304-A',
      ofSuivant: 'OF-2507',
      modeleSuivant: 'Malta',
      urgence: 'Moyenne',
      alerteChangement: true,
      etat: 'En marche',
      derniereControle: '2025-10-19 08:00',
      configuration: 'Config A - Laize 145cm',
      vitesse: 340,
      rendement: 92,
      productionJour: 830,
      joursRestants: 2
    },
  ]);

  const [alertesPannes, setAlertesPannes] = useState([
    { 
      id: 1, 
      machine: 'M2303', 
      cause: 'Courroie cassée', 
      type: 'Mécanique',
      dateDebut: '2025-10-19 08:45',
      dateFin: null,
      statut: 'En cours',
      tempsArret: 125,
      perteCA: 845,
      technicien: 'Ali Ben Salem'
    },
    { 
      id: 2, 
      machine: 'M2301', 
      cause: 'Court-circuit pédale', 
      type: 'Électrique',
      dateDebut: '2025-10-18 14:20',
      dateFin: '2025-10-18 16:30',
      statut: 'Réparé',
      tempsArret: 130,
      perteCA: 520,
      technicien: 'Mohamed Trabelsi'
    },
  ]);

  const [demandes, setDemandes] = useState([
    { id: 1, type: 'Réparation', demandeur: 'Chef Atelier', poste: 'Chef Atelier', description: 'Ciseau machine M2303', urgence: 'Haute', statut: 'En attente', date: '2025-10-19 08:30', tempsEcoule: 95 },
    { id: 2, type: 'Entretien', demandeur: 'Ahmed Mansour', poste: 'Magasinier', description: 'Transpalette T-05 - Roues bloquées', urgence: 'Moyenne', statut: 'En cours', date: '2025-10-19 09:15', tempsEcoule: 15, tempsDebut: '2025-10-19 10:45' },
    { id: 3, type: 'Électrique', demandeur: 'Salah Ben Ali', poste: 'Coupeur', description: 'Ampoule zone découpe - Éclairage insuffisant', urgence: 'Basse', statut: 'En attente', date: '2025-10-19 10:00', tempsEcoule: 5 },
    { id: 4, type: 'Réparation', demandeur: 'Fatma Gharbi', poste: 'Opérateur', description: 'Pédale machine M2301 - Ne répond plus', urgence: 'Haute', statut: 'En attente', date: '2025-10-19 10:45', tempsEcoule: 0 },
    { id: 5, type: 'Risque', demandeur: 'Mohamed Kacem', poste: 'Chef Atelier', description: 'Câble électrique apparent M2302 - Risque électrocution', urgence: 'Critique', statut: 'En attente', date: '2025-10-19 10:50', tempsEcoule: 0 },
  ]);

  const [ensouples, setEnsouples] = useState([
    { id: 'ENS-2305-D', modele: 'Ibiza', metrage: 5000, nbFils: 4320, machine: 'Réserve', statut: 'Disponible', soustraitant: 'Ourdissage Pro', dateReception: '2025-10-18', besoinNouage: true, prixOurdissage: 850 },
    { id: 'ENS-2306-E', modele: 'Capri', metrage: 4800, nbFils: 4100, machine: 'Réserve', statut: 'Disponible', soustraitant: 'Ourdissage Pro', dateReception: '2025-10-17', besoinNouage: false, prixOurdissage: 820 },
    { id: 'ENS-2301-A', modele: 'Ibiza', metrage: 2450, nbFils: 4320, machine: 'M2301', statut: 'En cours', soustraitant: 'Ourdissage Pro', dateReception: '2025-10-15', besoinNouage: false, prixOurdissage: 850 },
  ]);

  const [demandesOurdissage, setDemandesOurdissage] = useState([
    { 
      id: 1, 
      modele: 'Malta', 
      metrage: 5000, 
      nbFilsEstime: 4200, 
      type: 'Normal', 
      statut: 'Envoyé au magasinier MP', 
      date: '2025-10-19', 
      machine: 'M2303', 
      priorite: 'Haute',
      couleurChaine: 'Blanc',
      articleFil: 'Coton 20/1'
    },
    { 
      id: 2, 
      modele: 'Santorini', 
      metrage: 5000, 
      nbFilsEstime: 4500, 
      type: 'Réserve', 
      statut: 'Fil chaîne préparé', 
      date: '2025-10-18', 
      machine: '', 
      priorite: 'Moyenne',
      couleurChaine: 'Écru',
      articleFil: 'Polyester 30/1',
      dateEnvoiSousTraitant: '2025-10-19',
      soustraitant: 'Ourdissage Pro'
    },
  ]);

  const [receptionOurdissage, setReceptionOurdissage] = useState([
    {
      id: 1,
      ensouple: 'ENS-2307-F',
      demandeId: 2,
      modele: 'Santorini',
      metrageCommande: 5000,
      metrageReel: 4985,
      nbFilsCommande: 4500,
      nbFilsReel: 4500,
      soustraitant: 'Ourdissage Pro',
      dateReception: '2025-10-19',
      conformite: true,
      observations: 'Conforme - Légère différence métrage acceptable'
    }
  ]);

  const [demandesNouage, setDemandesNouage] = useState([
    { 
      id: 1, 
      ensouple: 'ENS-2305-D', 
      modele: 'Ibiza',
      machine: 'M2303', 
      prix: 250, 
      statut: 'Demandé', 
      dateDemande: '2025-10-19', 
      datePrevu: '2025-10-20',
      soustraitant: 'Nouage Express',
      nbFils: 4320
    },
    { 
      id: 2, 
      ensouple: 'ENS-2306-E',
      modele: 'Capri', 
      machine: 'M2302', 
      prix: 240, 
      statut: 'Effectué', 
      dateDemande: '2025-10-18', 
      dateEffectue: '2025-10-18', 
      documentSigne: true,
      soustraitant: 'Nouage Express',
      nbFils: 4100
    },
  ]);

  const [demandesAchat, setDemandesAchat] = useState([
    { id: 1, article: 'Courroie type B - Référence CTB-450', quantite: 2, prixApprox: 85, type: 'Pièce', statut: 'En attente', urgent: true, demandeur: 'Ali Mécanicien', date: '2025-10-19', emailEnvoye: false },
    { id: 2, article: 'Intervention électricien - Câblage M2302', quantite: 1, prixApprox: 150, type: 'Externe', statut: 'Validé', urgent: false, demandeur: 'Ali Mécanicien', date: '2025-10-18', emailEnvoye: true },
  ]);

  const [planRevisions, setPlanRevisions] = useState([
    { id: 1, machine: 'M2301', type: 'Vidange huile', frequenceJours: 90, derniere: '2025-09-15', prochaine: '2025-12-14', statut: 'À venir', joursRestants: 56 },
    { id: 2, machine: 'M2302', type: 'Graissage roulements', frequenceJours: 30, derniere: '2025-10-05', prochaine: '2025-11-04', statut: 'À venir', joursRestants: 16 },
    { id: 3, machine: 'M2303', type: 'Contrôle courroies', frequenceJours: 60, derniere: '2025-09-20', prochaine: '2025-11-19', statut: 'Urgent', joursRestants: 31 },
    { id: 4, machine: 'M2304', type: 'Vidange huile', frequenceJours: 90, derniere: '2025-08-10', prochaine: '2025-11-08', statut: 'Dépassé', joursRestants: -11 },
    { id: 5, machine: 'M2301', type: 'Nettoyage filtres', frequenceJours: 15, derniere: '2025-10-10', prochaine: '2025-10-25', statut: 'À venir', joursRestants: 6 },
  ]);

  const [controles, setControles] = useState([
    { id: 1, machine: 'M2301', of: 'OF-2501', modele: 'Ibiza', mesure: '145cm', poids: '285g/m²', conforme: true, date: '2025-10-19 07:30', operateur: 'Ali Ben Salem', observations: 'RAS - Changement de dessin effectué' },
    { id: 2, machine: 'M2302', of: 'OF-2503', modele: 'Capri', mesure: '150cm', poids: '310g/m²', conforme: true, date: '2025-10-19 06:15', operateur: 'Mohamed Trabelsi', observations: 'Conforme aux spécifications' },
  ]);

  const [rendementStats, setRendementStats] = useState({
    tempsReactionMoyen: 15,
    interventionsJour: 8,
    interventionsSemaine: 42,
    tauxResolution: 95,
    pertesTotalesCA: 1365,
    tempsArretTotalMeca: 125,
    tempsArretTotalElec: 130,
    nbPannesMeca: 1,
    nbPannesElec: 1,
  });

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const getUrgenceColor = (urgence) => {
    switch(urgence) {
      case 'Critique': return 'bg-purple-100 text-purple-800 border-purple-500';
      case 'Haute': return 'bg-red-100 text-red-800 border-red-500';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'Basse': return 'bg-green-100 text-green-800 border-green-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'En attente': return 'bg-orange-100 text-orange-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'Réparé': return 'bg-green-100 text-green-800';
      case 'Effectué': return 'bg-green-100 text-green-800';
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Validé': return 'bg-green-100 text-green-800';
      case 'Demandé': return 'bg-orange-100 text-orange-800';
      case 'Envoyé au magasinier MP': return 'bg-blue-100 text-blue-800';
      case 'Fil chaîne préparé': return 'bg-yellow-100 text-yellow-800';
      case 'Envoyé sous-traitant': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPlanning = () => (
    <div className="space-y-6">
      {/* Vue grille machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {planningMachines.map(machine => (
          <div 
            key={machine.id} 
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 cursor-pointer transition-all hover:shadow-xl ${
              machine.etat === 'En panne' ? 'border-red-500' : 
              machine.alerteChangement ? 'border-orange-500' : 'border-green-500'
            }`}
            onClick={() => openModal('details-machine', machine)}
          >
            {/* En-tête */}
            <div className={`p-4 ${
              machine.etat === 'En panne' ? 'bg-red-500' : 
              machine.alerteChangement ? 'bg-orange-500' : 'bg-green-500'
            }`}>
              <div className="flex items-center justify-between text-white">
                <h3 className="text-xl font-bold">Machine {machine.id}</h3>
                {machine.etat === 'En marche' ? (
                  <PlayCircle size={28} />
                ) : (
                  <PauseCircle size={28} />
                )}
              </div>
              <p className="text-white text-sm mt-1 opacity-90">{machine.configuration}</p>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-3">
              {/* OF Actuel */}
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">OF ACTUEL</p>
                <p className="font-bold text-gray-800">{machine.ofActuel}</p>
                <p className="text-sm text-gray-700">{machine.modeleActuel}</p>
              </div>

              {/* Progression */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-semibold">{Math.round((machine.metrageActuel/machine.metrageTotal)*100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      machine.etat === 'En panne' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{width: `${(machine.metrageActuel/machine.metrageTotal)*100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{machine.metrageActuel}m / {machine.metrageTotal}m</p>
              </div>

              {/* Jours restants */}
              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Jours restants</p>
                    <p className="text-2xl font-bold text-purple-700">{machine.joursRestants}</p>
                  </div>
                  <Calendar className="text-purple-500" size={32} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Production: {machine.productionJour}m/jour</p>
              </div>

              {/* Alerte changement */}
              {machine.alerteChangement && (
                <div className="bg-orange-50 p-2 rounded border-l-4 border-orange-500">
                  <p className="text-xs text-orange-800 font-semibold flex items-center gap-1">
                    <AlertTriangle size={14} />
                    Prochain: {machine.modeleSuivant}
                  </p>
                </div>
              )}

              {/* Info panne */}
              {machine.etat === 'En panne' && (
                <div className="bg-red-50 p-2 rounded border-l-4 border-red-500">
                  <p className="text-xs text-red-800 font-semibold">{machine.raisonPanne}</p>
                  <p className="text-xs text-red-600 mt-1">Arrêt: {machine.tempsArret} min - Perte: {machine.perteCA} TND</p>
                </div>
              )}

              {/* Bouton paramétrage métrage */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('corriger-metrage', machine);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded transition flex items-center justify-center gap-2 text-sm"
              >
                <Settings size={16} />
                Paramétrage métrage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRendement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performance & Rendement Mécanicien</h2>

      {/* KPIs Généraux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps Réaction Moyen</p>
              <p className="text-2xl font-bold text-gray-800">{rendementStats.tempsReactionMoyen} min</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de Résolution</p>
              <p className="text-2xl font-bold text-gray-800">{rendementStats.tauxResolution}%</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interventions</p>
              <p className="text-2xl font-bold text-gray-800">{rendementStats.interventionsJour} / jour</p>
            </div>
            <Wrench className="text-orange-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Perte CA Totale</p>
              <p className="text-2xl font-bold text-red-600">{rendementStats.pertesTotalesCA} TND</p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Temps d'arrêt par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wrench className="text-orange-600" size={24} />
            Arrêts Mécaniques
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nombre de pannes:</span>
              <span className="font-bold text-2xl text-orange-600">{rendementStats.nbPannesMeca}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Temps d'arrêt total:</span>
              <span className="font-bold text-2xl text-orange-600">{rendementStats.tempsArretTotalMeca} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Perte CA estimée:</span>
              <span className="font-bold text-2xl text-red-600">845 TND</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="text-yellow-600" size={24} />
            Arrêts Électriques
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nombre de pannes:</span>
              <span className="font-bold text-2xl text-yellow-600">{rendementStats.nbPannesElec}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Temps d'arrêt total:</span>
              <span className="font-bold text-2xl text-yellow-600">{rendementStats.tempsArretTotalElec} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Perte CA estimée:</span>
              <span className="font-bold text-2xl text-red-600">520 TND</span>
            </div>
          </div>
        </div>
      </div>

      {/* Détail arrêts par machine */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Détail des Arrêts par Machine</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cause</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temps Arrêt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perte CA (TND)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alertesPannes.map(panne => (
                <tr key={panne.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{panne.machine}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{panne.cause}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      panne.type === 'Mécanique' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {panne.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{panne.tempsArret} min</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">{panne.perteCA} TND</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{panne.dateDebut}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {panne.dateFin ? (
                      <span className="text-green-600 font-semibold">{panne.dateFin}</span>
                    ) : (
                      <span className="text-orange-600 font-semibold">En cours</span>
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

  const renderAlertes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Alertes Pannes par Machine</h2>
        <button
          onClick={() => openModal('declarer-panne')}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
        >
          <AlertTriangle size={18} />
          Déclarer une panne
        </button>
      </div>

      {/* Alertes actives */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="text-red-500" size={24} />
          Pannes Actives
        </h3>
        <div className="space-y-3">
          {alertesPannes.filter(p => p.statut === 'En cours').map(panne => (
            <div key={panne.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg text-gray-800">Machine {panne.machine}</h4>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      panne.type === 'Mécanique' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {panne.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Cause:</strong> {panne.cause}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Début réparation:</p>
                      <p className="font-semibold text-red-700">{panne.dateDebut}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Temps d'arrêt:</p>
                      <p className="font-semibold text-red-700">{panne.tempsArret} minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Perte CA:</p>
                      <p className="font-bold text-red-600">{panne.perteCA} TND</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Technicien: {panne.technicien}</p>
                </div>
                <button
                  onClick={() => openModal('terminer-reparation', panne)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Terminer & Remettre en marche
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique pannes résolues */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={24} />
          Historique Pannes Résolues
        </h3>
        <div className="space-y-2">
          {alertesPannes.filter(p => p.statut === 'Réparé').map(panne => (
            <div key={panne.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-800">Machine {panne.machine}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      panne.type === 'Mécanique' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {panne.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{panne.cause}</p>
                  <div className="flex gap-6 text-xs text-gray-500 mt-1">
                    <span>Début: {panne.dateDebut}</span>
                    <span>Fin: {panne.dateFin}</span>
                    <span>Durée: {panne.tempsArret} min</span>
                    <span className="text-red-600 font-semibold">Perte: {panne.perteCA} TND</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDemandes = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Demandes d'Intervention</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temps</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {demandes.map(demande => (
              <tr key={demande.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    demande.type === 'Risque' ? 'bg-purple-100 text-purple-800' :
                    demande.type === 'Réparation' ? 'bg-red-100 text-red-800' :
                    demande.type === 'Entretien' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {demande.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{demande.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <p className="font-medium text-gray-900">{demande.demandeur}</p>
                  <p className="text-gray-500 text-xs">{demande.poste}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getUrgenceColor(demande.urgence)}`}>
                    {demande.urgence}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(demande.statut)}`}>
                    {demande.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {demande.tempsEcoule} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => openModal('traiter-demande', demande)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOurdissage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion Ourdissage & Nouage</h2>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('demande-ourdissage')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Send size={18} />
            Demander Ourdissage
          </button>
          <button
            onClick={() => openModal('reception-ensouple')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <Package size={18} />
            Réceptionner Ensouple
          </button>
        </div>
      </div>

      {/* Demandes d'ourdissage */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Demandes d'Ourdissage en Cours</h3>
        <div className="space-y-3">
          {demandesOurdissage.map(demande => (
            <div key={demande.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg">{demande.modele}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      demande.type === 'Réserve' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {demande.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border-2 ${getUrgenceColor(demande.priorite)}`}>
                      {demande.priorite}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                    <div>
                      <p className="text-gray-600">Métrage:</p>
                      <p className="font-semibold">{demande.metrage}m</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Nb fils:</p>
                      <p className="font-semibold">{demande.nbFilsEstime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Article fil:</p>
                      <p className="font-semibold">{demande.articleFil}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Couleur:</p>
                      <p className="font-semibold">{demande.couleurChaine}</p>
                    </div>
                  </div>
                  {demande.machine && (
                    <p className="text-sm text-gray-600">Pour machine: <span className="font-semibold">{demande.machine}</span></p>
                  )}
                  {demande.soustraitant && (
                    <p className="text-xs text-gray-500 mt-1">Sous-traitant: {demande.soustraitant}</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatutColor(demande.statut)}`}>
                  {demande.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Réception ensouples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Réceptions Ensouples du Sous-Traitant</h3>
        {receptionOurdissage.length > 0 ? (
          <div className="space-y-3">
            {receptionOurdissage.map(reception => (
              <div key={reception.id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{reception.ensouple} - {reception.modele}</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Métrage commandé:</p>
                        <p className="font-semibold">{reception.metrageCommande}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Métrage réel:</p>
                        <p className="font-bold text-green-700">{reception.metrageReel}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fils commandés:</p>
                        <p className="font-semibold">{reception.nbFilsCommande}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fils réels:</p>
                        <p className="font-bold text-green-700">{reception.nbFilsReel}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Sous-traitant: {reception.soustraitant} - Réceptionné le {reception.dateReception}</p>
                    <p className="text-xs text-gray-600">Observations: {reception.observations}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {reception.conformite ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                    <button
                      onClick={() => openModal('attribuer-ensouple-reception', reception)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm whitespace-nowrap"
                    >
                      Attribuer Machine
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucune réception en attente</p>
        )}
      </div>

      {/* Stock Ensouples */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">Stock Ensouples</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ensouple</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métrage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb Fils</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Ourd.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ensouples.map(ensouple => (
              <tr key={ensouple.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ensouple.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ensouple.modele}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ensouple.metrage}m</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ensouple.nbFils}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{ensouple.machine}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{ensouple.prixOurdissage} TND</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  {ensouple.machine === 'Réserve' && (
                    <button
                      onClick={() => openModal('attribuer-ensouple', ensouple)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Attribuer à une machine"
                    >
                      <Settings size={18} />
                    </button>
                  )}
                  {ensouple.besoinNouage && (
                    <button
                      onClick={() => openModal('demande-nouage', ensouple)}
                      className="text-green-600 hover:text-green-800"
                      title="Demander nouage"
                    >
                      <Send size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Demandes de nouage */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Demandes de Nouage</h3>
        </div>
        <div className="space-y-3">
          {demandesNouage.map(demande => (
            <div key={demande.id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-lg">{demande.ensouple} → Machine {demande.machine}</p>
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatutColor(demande.statut)}`}>
                      {demande.statut}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Modèle:</p>
                      <p className="font-semibold">{demande.modele}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Nb fils:</p>
                      <p className="font-semibold">{demande.nbFils}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prix:</p>
                      <p className="font-bold text-green-700">{demande.prix} TND</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sous-traitant:</p>
                      <p className="font-semibold">{demande.soustraitant}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Demandé le {demande.dateDemande}
                    {demande.dateEffectue && ` - Effectué le ${demande.dateEffectue}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {demande.statut === 'Effectué' && demande.documentSigne && (
                    <button
                      onClick={() => openModal('document-nouage', demande)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Document"
                    >
                      <Download size={20} />
                    </button>
                  )}
                  {demande.statut === 'Demandé' && (
                    <button
                      onClick={() => openModal('valider-nouage', demande)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                    >
                      Déclarer effectué
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchats = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Demandes d'Achat & Interventions Externes</h2>
        <button
          onClick={() => openModal('nouvelle-demande-achat')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvelle Demande
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article / Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Approx.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {demandesAchat.map(demande => (
              <tr key={demande.id} className={`hover:bg-gray-50 ${demande.urgent ? 'bg-red-50' : ''}`}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{demande.article}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    demande.type === 'Pièce' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {demande.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{demande.quantite}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{demande.prixApprox} TND</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(demande.statut)}`}>
                    {demande.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {demande.emailEnvoye ? (
                    <CheckCircle className="text-green-500" size={18} />
                  ) : (
                    <button
                      onClick={() => openModal('envoyer-email-achat', demande)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Envoyer par email"
                    >
                      <Mail size={18} />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {demande.urgent && <AlertTriangle className="text-red-500" size={18} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRevisions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Planning Maintenance Préventive</h2>
        <button
          onClick={() => openModal('nouvelle-revision')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Planifier Révision
        </button>
      </div>

      {/* Vue KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Révisions Dépassées</p>
              <p className="text-2xl font-bold text-red-600">
                {planRevisions.filter(r => r.statut === 'Dépassé').length}
              </p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Révisions Urgentes</p>
              <p className="text-2xl font-bold text-orange-600">
                {planRevisions.filter(r => r.statut === 'Urgent').length}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Révisions À Venir</p>
              <p className="text-2xl font-bold text-blue-600">
                {planRevisions.filter(r => r.statut === 'À venir').length}
              </p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Révisions</p>
              <p className="text-2xl font-bold text-green-600">{planRevisions.length}</p>
            </div>
            <Droplet className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Planning détaillé */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type Révision</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fréquence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours Restants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {planRevisions.sort((a, b) => a.joursRestants - b.joursRestants).map(revision => (
              <tr key={revision.id} className={`hover:bg-gray-50 ${
                revision.statut === 'Dépassé' ? 'bg-red-50' :
                revision.statut === 'Urgent' ? 'bg-orange-50' : ''
              }`}>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{revision.machine}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{revision.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Tous les {revision.frequenceJours} jours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{revision.derniere}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{revision.prochaine}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                    revision.joursRestants < 0 ? 'bg-red-200 text-red-800' :
                    revision.joursRestants <= 7 ? 'bg-orange-200 text-orange-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {revision.joursRestants > 0 ? `${revision.joursRestants}j` : `${Math.abs(revision.joursRestants)}j dépassé`}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    revision.statut === 'Dépassé' ? 'bg-red-100 text-red-800' :
                    revision.statut === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {revision.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openModal('effectuer-revision', revision)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                  >
                    Effectuer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {modalType === 'details-machine' && '📊 Détails Machine'}
                {modalType === 'corriger-metrage' && '📏 Paramétrage Métrage'}
                {modalType === 'declarer-panne' && '⚠️ Déclarer une Panne'}
                {modalType === 'terminer-reparation' && '✅ Terminer Réparation & Remise en Marche'}
                {modalType === 'demande-ourdissage' && '🧵 Demande d\'Ourdissage'}
                {modalType === 'reception-ensouple' && '📦 Réception Ensouple'}
                {modalType === 'attribuer-ensouple' && '🎯 Attribuer Ensouple à Machine'}
                {modalType === 'attribuer-ensouple-reception' && '🎯 Attribuer Ensouple Réceptionnée'}
                {modalType === 'demande-nouage' && '🔗 Demande de Nouage'}
                {modalType === 'valider-nouage' && '✅ Valider Nouage Effectué'}
                {modalType === 'document-nouage' && '📄 Document de Nouage'}
                {modalType === 'nouvelle-demande-achat' && '🛒 Nouvelle Demande d\'Achat'}
                {modalType === 'envoyer-email-achat' && '📧 Envoyer par Email'}
                {modalType === 'nouvelle-revision' && '🔧 Planifier Révision'}
                {modalType === 'effectuer-revision' && '✅ Effectuer Révision'}
                {modalType === 'traiter-demande' && '🔧 Traiter Demande'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {modalType === 'details-machine' && selectedItem && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg">
                    <h4 className="text-2xl font-bold mb-2">Machine {selectedItem.id}</h4>
                    <p className="text-blue-100">{selectedItem.configuration}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">OF Actuel</p>
                      <p className="font-bold text-xl">{selectedItem.ofActuel}</p>
                      <p className="text-lg text-gray-700">{selectedItem.modeleActuel}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">OF Suivant</p>
                      <p className="font-bold text-xl">{selectedItem.ofSuivant}</p>
                      <p className="text-lg text-gray-700">{selectedItem.modeleSuivant}</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-800 mb-3">Progression Fabrication</h5>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Métrage</span>
                        <span className="font-bold">{Math.round((selectedItem.metrageActuel/selectedItem.metrageTotal)*100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full" 
                          style={{width: `${(selectedItem.metrageActuel/selectedItem.metrageTotal)*100}%`}}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.metrageActuel}m / {selectedItem.metrageTotal}m</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Métrage restant:</p>
                        <p className="font-bold text-lg">{selectedItem.metrageTotal - selectedItem.metrageActuel}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Production/jour:</p>
                        <p className="font-bold text-lg">{selectedItem.productionJour}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Jours restants:</p>
                        <p className="font-bold text-lg text-purple-700">{selectedItem.joursRestants} jours</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Ensouple</p>
                      <p className="font-bold text-gray-800">{selectedItem.ensoupleActuelle}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Vitesse</p>
                      <p className="font-bold text-gray-800">{selectedItem.vitesse} m/min</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Rendement</p>
                      <p className="font-bold text-gray-800">{selectedItem.rendement}%</p>
                    </div>
                  </div>

                  {selectedItem.alerteChangement && (
                    <div className="bg-orange-50 border-2 border-orange-500 p-4 rounded-lg">
                      <p className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Changement de Modèle Requis
                      </p>
                      <p className="text-sm text-orange-700">
                        Le prochain OF nécessite un changement de modèle. Un contrôle qualité sera requis.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'corriger-metrage' && selectedItem && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="font-semibold text-lg mb-2">Machine {selectedItem.id}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Métrage actuel:</p>
                        <p className="font-bold text-2xl">{selectedItem.metrageActuel}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ensouple:</p>
                        <p className="font-semibold">{selectedItem.ensoupleActuelle}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Métrage corrigé (m) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-blue-500 focus:outline-none" 
                      placeholder={selectedItem.metrageActuel.toString()}
                      defaultValue={selectedItem.metrageActuel}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison de la correction
                    </label>
                    <textarea 
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none" 
                      rows={3}
                      placeholder="Expliquez pourquoi le métrage doit être corrigé..."
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold">
                      Enregistrer
                    </button>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'envoyer-email-achat' && selectedItem && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-lg mb-2">Demande d'Achat</h4>
                    <p className="text-sm"><strong>Article:</strong> {selectedItem.article}</p>
                    <p className="text-sm"><strong>Quantité:</strong> {selectedItem.quantite}</p>
                    <p className="text-sm"><strong>Prix approximatif:</strong> {selectedItem.prixApprox} TND</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Responsable Fabrication
                    </label>
                    <input 
                      type="email" 
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none" 
                      placeholder="responsable.fabrication@entreprise.com"
                      defaultValue="responsable.fabrication@entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea 
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none" 
                      rows={5}
                      defaultValue={`Bonjour,

Je sollicite votre validation pour la demande d'achat suivante :

Article: ${selectedItem.article}
Quantité: ${selectedItem.quantite}
Prix approximatif: ${selectedItem.prixApprox} TND
Type: ${selectedItem.type}
Urgent: ${selectedItem.urgent ? 'OUI' : 'Non'}

Justification: [À compléter]

Cordialement,
Service Maintenance`}
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                      <Mail size={20} />
                      Envoyer l'Email
                    </button>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Autres modals... */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Interface de démonstration
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 ml-64">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench size={36} />
            Tableau de Bord Mécanicien & Entretien
          </h1>
          <p className="mt-2 text-blue-100">Gestion complète des machines, interventions et maintenance</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'planning', label: 'Planning Machines', icon: Calendar },
              { id: 'rendement', label: 'Rendement', icon: TrendingUp },
              { id: 'alertes', label: 'Alertes Pannes', icon: AlertTriangle },
              { id: 'demandes', label: 'Demandes', icon: Wrench },
              { id: 'ourdissage', label: 'Ourdissage & Nouage', icon: Package },
              { id: 'achats', label: 'Achats', icon: FileText },
              { id: 'revisions', label: 'Révisions', icon: Droplet },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'planning' && renderPlanning()}
        {activeTab === 'rendement' && renderRendement()}
        {activeTab === 'alertes' && renderAlertes()}
        {activeTab === 'demandes' && renderDemandes()}
        {activeTab === 'ourdissage' && renderOurdissage()}
        {activeTab === 'achats' && renderAchats()}
        {activeTab === 'revisions' && renderRevisions()}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default TableauBordMecanicien;
