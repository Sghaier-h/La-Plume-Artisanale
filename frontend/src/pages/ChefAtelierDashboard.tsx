import React, { useState } from 'react';
import { Camera, Package, AlertTriangle, Printer, Clock, ArrowRight, Scissors, Tag, Zap, PackageCheck, Bell, XCircle, CheckCircle, AlertCircle, Activity, BarChart3, Users, Wrench, Settings } from 'lucide-react';

const ChefAtelierDashboard = () => {
  const [activeTab, setActiveTab] = useState('operations');
  const [showScanModal, setShowScanModal] = useState(false);
  const [showDeuxiemeModal, setShowDeuxiemeModal] = useState(false);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [expandedCommandes, setExpandedCommandes] = useState({});

  const operations = [
    { id: 'frange', label: 'Frange', icon: Scissors, color: 'bg-purple-500' },
    { id: 'pliage', label: 'Pliage', icon: Package, color: 'bg-blue-500' },
    { id: 'etiquetage', label: 'Étiquetage', icon: Tag, color: 'bg-green-500' },
    { id: 'couture', label: 'Couture', icon: Activity, color: 'bg-orange-500' },
    { id: 'repassage', label: 'Repassage', icon: Zap, color: 'bg-pink-500' },
    { id: 'emballage', label: 'Emballage', icon: PackageCheck, color: 'bg-indigo-500' }
  ];

  const [commandesEnCours] = useState([
    {
      id: 'CMD001',
      numCommande: 'CM-FT0108',
      client: 'CL00296',
      dateEnvoi: '2025-10-25',
      joursRestants: 6,
      articles: [
        {
          idArticle: 'ART001',
          refCommercial: 'EPMA0919-B15-02',
          modele: 'MARINIERE',
          dimension: '0919',
          qteCommandee: 50,
          suivis: [
            {
              numSuivi: 'OF246533-1',
              qteLot: 25,
              operations: {
                frange: { statut: 'termine', qteSortie: 25, qteRetour: 25, qteEnCours: 0 },
                pliage: { statut: 'en_cours', qteSortie: 25, qteRetour: 15, qteEnCours: 10 },
                etiquetage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 }
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: 'AliSassi'
            },
            {
              numSuivi: 'OF246533-2',
              qteLot: 25,
              operations: {
                frange: { statut: 'termine', qteSortie: 25, qteRetour: 25, qteEnCours: 0 },
                pliage: { statut: 'en_cours', qteSortie: 25, qteRetour: 15, qteEnCours: 10 },
                etiquetage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 }
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: 'AliSassi'
            }
          ]
        },
        {
          idArticle: 'ART002',
          refCommercial: 'UNS1020-09',
          modele: 'UNI SURPIQUE',
          dimension: '1020',
          qteCommandee: 30,
          suivis: [
            {
              numSuivi: 'OF246534-1',
              qteLot: 30,
              operations: {
                pliage: { statut: 'termine', qteSortie: 30, qteRetour: 30, qteEnCours: 0 },
                etiquetage: { statut: 'en_cours', qteSortie: 30, qteRetour: 20, qteEnCours: 10 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 }
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: null
            }
          ]
        }
      ],
      alertes: [
        { type: 'magasinier', message: 'Demande de finalisation pour colisage', urgent: true }
      ]
    },
    {
      id: 'CMD002',
      numCommande: 'Stock',
      client: 'All by Fouta',
      dateEnvoi: '2025-10-22',
      joursRestants: 3,
      articles: [
        {
          idArticle: 'ART003',
          refCommercial: 'FAF1020-B04-02',
          modele: 'FIL A FIL',
          dimension: '1020',
          qteCommandee: 100,
          suivis: [
            {
              numSuivi: 'CA250469-1',
              qteLot: 50,
              operations: {
                pliage: { statut: 'termine', qteSortie: 50, qteRetour: 50, qteEnCours: 0 },
                etiquetage: { statut: 'termine', qteSortie: 50, qteRetour: 50, qteEnCours: 0 },
                emballage: { statut: 'en_cours', qteSortie: 50, qteRetour: 30, qteEnCours: 20 }
              },
              qteDeuxieme: 2,
              qteRebut: 0,
              sousTraitant: null
            },
            {
              numSuivi: 'CA250469-2',
              qteLot: 50,
              operations: {
                pliage: { statut: 'termine', qteSortie: 50, qteRetour: 50, qteEnCours: 0 },
                etiquetage: { statut: 'en_cours', qteSortie: 50, qteRetour: 40, qteEnCours: 10 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 }
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: null
            }
          ]
        }
      ],
      alertes: [
        { type: 'date_proche', message: 'Date d\'envoi dans 3 jours', urgent: true }
      ]
    }
  ]);

  const [alertes] = useState([
    {
      id: 'A001',
      type: 'magasinier',
      commande: 'CM-FT0108',
      message: 'Demande finalisation pliage pour colisage (20 pièces)',
      urgent: true,
      date: new Date().toISOString()
    },
    {
      id: 'A002',
      type: 'date_envoi',
      commande: 'Stock FAF1020',
      message: 'Date d\'envoi dans 3 jours - Reste 18 pièces à emballer',
      urgent: true,
      date: new Date().toISOString()
    }
  ]);

  const [analyseDeuxieme] = useState([
    {
      sousTraitant: 'AliSassi',
      operation: 'Frange',
      totalTraite: 150,
      qteDeuxieme: 8,
      tauxDeuxieme: 5.3,
      typesDefauts: [
        { type: 'Tache', quantite: 3 },
        { type: 'Couture irrégulière', quantite: 3 },
        { type: 'Fil cassé', quantite: 2 }
      ]
    }
  ]);

  const [demandesMaintenance] = useState([
    {
      id: 'M001',
      date: '2025-10-19',
      statut: 'en_cours',
      priorite: 'urgente',
      equipement: 'Machine de pliage #3',
      probleme: 'Arrêt complet - Ne démarre plus',
      description: 'La machine s\'est arrêtée brutalement pendant l\'opération'
    },
    {
      id: 'M002',
      date: '2025-10-18',
      statut: 'termine',
      priorite: 'normale',
      equipement: 'Table de couture #1',
      probleme: 'Vibrations anormales',
      description: 'Vibrations importantes lors de l\'utilisation'
    }
  ]);

  const getStatsOperation = (operationId: string) => {
    let total = 0;
    let enCours = 0;
    let termine = 0;
    let enAttente = 0;

    commandesEnCours.forEach(cmd => {
      cmd.articles.forEach(article => {
        article.suivis.forEach(suivi => {
          if (suivi.operations[operationId]) {
            const op = suivi.operations[operationId];
            if (op.statut === 'en_cours') enCours += op.qteEnCours;
            if (op.statut === 'termine') termine += op.qteRetour;
            if (op.statut === 'en_attente') enAttente += suivi.qteLot;
            total += suivi.qteLot;
          }
        });
      });
    });

    return { total, enCours, termine, enAttente };
  };

  const MaintenanceModal = () => {
    const [equipement, setEquipement] = useState('');
    const [probleme, setProbleme] = useState('');
    const [description, setDescription] = useState('');
    const [priorite, setPriorite] = useState('normale');

    if (!showMaintenanceModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-600" />
            Demande de Maintenance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Équipement / Machine</label>
              <select
                value={equipement}
                onChange={(e) => setEquipement(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Sélectionner...</option>
                <option value="Machine pliage #1">Machine pliage #1</option>
                <option value="Machine pliage #2">Machine pliage #2</option>
                <option value="Machine pliage #3">Machine pliage #3</option>
                <option value="Table couture #1">Table couture #1</option>
                <option value="Table couture #2">Table couture #2</option>
                <option value="Machine emballage">Machine emballage</option>
                <option value="Autre">Autre équipement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type de Problème</label>
              <select
                value={probleme}
                onChange={(e) => setProbleme(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Sélectionner...</option>
                <option value="Panne complète">Panne complète</option>
                <option value="Dysfonctionnement">Dysfonctionnement</option>
                <option value="Bruit anormal">Bruit anormal</option>
                <option value="Vibrations">Vibrations</option>
                <option value="Surchauffe">Surchauffe</option>
                <option value="Problème électrique">Problème électrique</option>
                <option value="Usure">Usure de pièce</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priorité</label>
              <select
                value={priorite}
                onChange={(e) => setPriorite(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente (arrêt production)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description détaillée</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le problème en détail..."
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Demande de maintenance envoyée au mécanicien:\n${equipement} - ${probleme}`);
                  setShowMaintenanceModal(false);
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                Envoyer au Mécanicien
              </button>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ScanModal = () => {
    if (!showScanModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Scanner Numéro de Suivi</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Numéro de Suivi</label>
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Scannez ou saisissez le code"
                className="w-full px-4 py-2 border rounded-lg"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowScanModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Valider
              </button>
              <button
                onClick={() => setShowScanModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeuxiemeChoixModal = () => {
    const [qteDeuxieme, setQteDeuxieme] = useState(0);
    const [typeDefaut, setTypeDefaut] = useState('');
    const [decision, setDecision] = useState('');

    if (!showDeuxiemeModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Déclaration Deuxième Choix</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Numéro de Suivi</label>
              <input
                type="text"
                value={scannedCode}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantité Deuxième</label>
              <input
                type="number"
                value={qteDeuxieme}
                onChange={(e) => setQteDeuxieme(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type de Défaut</label>
              <select
                value={typeDefaut}
                onChange={(e) => setTypeDefaut(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Sélectionner...</option>
                <option value="Tache">Tache</option>
                <option value="Couture irrégulière">Couture irrégulière</option>
                <option value="Fil cassé">Fil cassé</option>
                <option value="Dimension incorrecte">Dimension incorrecte</option>
                <option value="Couleur non conforme">Couleur non conforme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Décision</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Sélectionner...</option>
                <option value="approuve">Approuvé (récupérable)</option>
                <option value="non_approuve">Non approuvé (rebut)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Deuxième choix enregistré: ${qteDeuxieme} pièces - Type: ${typeDefaut} - Décision: ${decision}`);
                  setShowDeuxiemeModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Enregistrer et Imprimer Étiquette
              </button>
              <button
                onClick={() => setShowDeuxiemeModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ComplementUrgentModal = () => {
    const [qteComplement, setQteComplement] = useState(0);
    const [motif, setMotif] = useState('');

    if (!showComplementModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 text-red-600">Demande de Complément Urgent</h3>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Cette demande sera envoyée à tous les postes de fabrication
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantité à compléter</label>
              <input
                type="number"
                value={qteComplement}
                onChange={(e) => setQteComplement(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Motif</label>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Sélectionner...</option>
                <option value="deuxieme_choix">Deuxième choix non récupérable</option>
                <option value="rebut">Rebut important</option>
                <option value="perte">Perte lors du traitement</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Demande de complément envoyée: ${qteComplement} pièces`);
                  setShowComplementModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Envoyer Demande Urgente
              </button>
              <button
                onClick={() => setShowComplementModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OperationsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {operations.map(op => {
          const stats = getStatsOperation(op.id);
          const OpIcon = op.icon;
          return (
            <div
              key={op.id}
              onClick={() => setSelectedOperation(op.id)}
              className={`${op.color} bg-opacity-10 border-2 ${
                selectedOperation === op.id ? 'border-gray-800' : 'border-transparent'
              } rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${op.color} bg-opacity-20 p-3 rounded-full mb-2`}>
                  <OpIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-sm mb-2">{op.label}</h3>
                <div className="space-y-1 text-xs w-full">
                  <div className="flex justify-between">
                    <span className="text-gray-600">En cours:</span>
                    <span className="font-bold text-orange-600">{stats.enCours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terminé:</span>
                    <span className="font-bold text-green-600">{stats.termine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">En attente:</span>
                    <span className="font-bold text-gray-600">{stats.enAttente}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOperation && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4">
            Commandes - {operations.find(o => o.id === selectedOperation)?.label}
          </h3>
          <div className="space-y-3">
            {commandesEnCours.map(cmd => 
              cmd.articles.map(article =>
                article.suivis.filter(s => s.operations[selectedOperation]).map(suivi => {
                  const op = suivi.operations[selectedOperation];
                  return (
                    <div key={suivi.numSuivi} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{suivi.numSuivi}</h4>
                          <p className="text-sm text-gray-600">
                            {article.modele} {article.dimension} - {cmd.client}
                          </p>
                          <p className="text-xs text-gray-500">Commande: {cmd.numCommande}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          op.statut === 'termine' ? 'bg-green-100 text-green-800' :
                          op.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {op.statut.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500">Lot</div>
                          <div className="text-lg font-bold">{suivi.qteLot}</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500">Sortie</div>
                          <div className="text-lg font-bold text-blue-600">{op.qteSortie}</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500">Retour</div>
                          <div className="text-lg font-bold text-green-600">{op.qteRetour}</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500">En cours</div>
                          <div className="text-lg font-bold text-orange-600">{op.qteEnCours}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {op.statut === 'en_attente' && (
                          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Commencer
                          </button>
                        )}
                        {op.statut === 'en_cours' && op.qteEnCours > 0 && (
                          <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2">
                            <Package className="w-4 h-4" />
                            Préparer ({op.qteEnCours})
                          </button>
                        )}
                        {op.qteRetour > 0 && (
                          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Transférer
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setScannedCode(suivi.numSuivi);
                            setShowDeuxiemeModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      )}
    </div>
  );

  const CommandesView = () => (
    <div className="space-y-4">
      {commandesEnCours.map(cmd => {
        const totalArticles = cmd.articles.length;
        const isExpanded = expandedCommandes[cmd.id];

        return (
          <div key={cmd.id} className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl">Commande {cmd.numCommande}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {totalArticles} article{totalArticles > 1 ? 's' : ''}
                  </span>
                  {cmd.joursRestants <= 5 && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cmd.joursRestants} jours
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  <div><span className="text-gray-500">Client:</span> <span className="font-medium">{cmd.client}</span></div>
                  <div><span className="text-gray-500">Envoi:</span> <span className="font-medium">{new Date(cmd.dateEnvoi).toLocaleDateString('fr-FR')}</span></div>
                </div>
              </div>
              <button
                onClick={() => setExpandedCommandes({...expandedCommandes, [cmd.id]: !isExpanded})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isExpanded ? 'Réduire' : 'Détails'}
              </button>
            </div>

            {cmd.alertes && cmd.alertes.length > 0 && (
              <div className="space-y-2 mb-4">
                {cmd.alertes.map((alerte, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg ${
                    alerte.urgent ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <Bell className={`w-5 h-5 ${alerte.urgent ? 'text-red-600' : 'text-yellow-600'}`} />
                    <span className={`text-sm font-medium ${alerte.urgent ? 'text-red-800' : 'text-yellow-800'}`}>
                      {alerte.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Articles de la commande */}
            <div className="space-y-4">
              {cmd.articles.map((article, artIdx) => {
                const totalPremierChoix = (article.suivis as any[]).reduce((sum: number, s: any) => sum + (s.qteLot - s.qteDeuxieme - s.qteRebut), 0) as number;
                const totalDeuxieme = (article.suivis as any[]).reduce((sum: number, s: any) => sum + s.qteDeuxieme, 0) as number;
                const totalRebut = (article.suivis as any[]).reduce((sum: number, s: any) => sum + s.qteRebut, 0) as number;
                const progression = (totalPremierChoix / article.qteCommandee) * 100;

                return (
                  <div key={article.idArticle} className={`border-l-4 ${artIdx === 0 ? 'border-blue-500' : artIdx === 1 ? 'border-green-500' : 'border-purple-500'} pl-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{article.modele} {article.dimension}</h4>
                        <p className="text-sm text-gray-600">Réf: {article.refCommercial}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Commandée</div>
                        <div className="text-xl font-bold text-blue-600">{article.qteCommandee}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Premier Choix</div>
                        <div className="text-xl font-bold text-green-600">{totalPremierChoix}</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Deuxième</div>
                        <div className="text-xl font-bold text-orange-600">{totalDeuxieme}</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Rebut</div>
                        <div className="text-xl font-bold text-red-600">{totalRebut}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Progression</span>
                        <span className="font-bold text-blue-600">{progression.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progression >= 100 ? 'bg-green-600' : 
                            progression >= 75 ? 'bg-blue-600' : 
                            'bg-orange-600'
                          }`}
                          style={{ width: `${Math.min(progression, 100)}%` }}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 mt-3">
                        {article.suivis.map(suivi => (
                          <div key={suivi.numSuivi} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                {suivi.numSuivi}
                              </h5>
                              <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 bg-white rounded">Lot: {suivi.qteLot}</span>
                                {suivi.sousTraitant && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                    S/T: {suivi.sousTraitant}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                              {Object.entries(suivi.operations).map(([opId, opData]: [string, any]) => {
                                const opDef = operations.find(o => o.id === opId);
                                const OpIcon = opDef?.icon || Package;
                                return (
                                  <div key={opId} className={`border-2 rounded-lg p-2 ${
                                    opData.statut === 'termine' ? 'border-green-300 bg-green-50' :
                                    opData.statut === 'en_cours' ? 'border-blue-300 bg-blue-50' :
                                    'border-gray-200 bg-white'
                                  }`}>
                                    <div className="flex items-center gap-1 mb-1">
                                      <OpIcon className="w-3 h-3" />
                                      <span className="text-xs font-medium">{opDef?.label}</span>
                                    </div>
                                    <div className="text-xs space-y-0.5">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">S:</span>
                                        <span className="font-bold">{opData.qteSortie}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">R:</span>
                                        <span className="font-bold text-green-600">{opData.qteRetour}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">EC:</span>
                                        <span className="font-bold text-orange-600">{opData.qteEnCours}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => setScannedCode(suivi.numSuivi)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                              >
                                <Camera className="w-4 h-4" />
                                Scanner
                              </button>
                              <button
                                onClick={() => {
                                  setScannedCode(suivi.numSuivi);
                                  setShowDeuxiemeModal(true);
                                }}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                2ème
                              </button>
                              {totalPremierChoix < article.qteCommandee && (
                                <button
                                  onClick={() => setShowComplementModal(true)}
                                  className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const MaintenanceView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Demandes de Maintenance</h2>
        <button
          onClick={() => setShowMaintenanceModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          Nouvelle Demande
        </button>
      </div>

      {demandesMaintenance.map(demande => (
        <div key={demande.id} className={`border-2 rounded-lg p-4 ${
          demande.priorite === 'urgente' ? 'border-red-300 bg-red-50' :
          demande.priorite === 'haute' ? 'border-orange-300 bg-orange-50' :
          'border-gray-300 bg-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className={`w-5 h-5 ${
                  demande.priorite === 'urgente' ? 'text-red-600' :
                  demande.priorite === 'haute' ? 'text-orange-600' :
                  'text-gray-600'
                }`} />
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  demande.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                  demande.statut === 'termine' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {demande.statut.toUpperCase().replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  demande.priorite === 'urgente' ? 'bg-red-100 text-red-800' :
                  demande.priorite === 'haute' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {demande.priorite.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold mb-1">{demande.equipement}</h3>
              <p className="text-sm text-gray-700 mb-2">{demande.probleme}</p>
              <p className="text-sm text-gray-600 italic">{demande.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Demande créée le {new Date(demande.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const AlertesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Alertes Actives</h2>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
          {alertes.filter(a => a.urgent).length} urgentes
        </span>
      </div>

      {alertes.map(alerte => (
        <div key={alerte.id} className={`border-2 rounded-lg p-4 ${
          alerte.urgent ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {alerte.urgent ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alerte.type === 'magasinier' ? 'bg-blue-100 text-blue-800' :
                  alerte.type === 'date_envoi' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {alerte.type.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-bold mb-1">{alerte.commande}</h3>
              <p className={`text-sm ${alerte.urgent ? 'text-red-800' : 'text-yellow-800'}`}>
                {alerte.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(alerte.date).toLocaleString('fr-FR')}
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Traiter
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const AnalyseDeuxiemeView = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analyse Deuxième Choix - Sous-Traitants</h2>

      {analyseDeuxieme.map((analyse, idx) => {
        const bgColor = analyse.tauxDeuxieme > 7 ? 'bg-red-100' : analyse.tauxDeuxieme > 5 ? 'bg-orange-100' : 'bg-green-100';
        const textColor = analyse.tauxDeuxieme > 7 ? 'text-red-600' : analyse.tauxDeuxieme > 5 ? 'text-orange-600' : 'text-green-600';
        
        return (
          <div key={idx} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{analyse.sousTraitant}</h3>
                <p className="text-sm text-gray-600">Opération: {analyse.operation}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${bgColor}`}>
                <div className={`text-2xl font-bold ${textColor}`}>
                  {analyse.tauxDeuxieme.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Taux 2ème choix</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded text-center">
                <div className="text-xs text-gray-500 mb-1">Total traité</div>
                <div className="text-xl font-bold text-blue-600">{analyse.totalTraite}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded text-center">
                <div className="text-xs text-gray-500 mb-1">Deuxième choix</div>
                <div className="text-xl font-bold text-orange-600">{analyse.qteDeuxieme}</div>
              </div>
              <div className="bg-green-50 p-3 rounded text-center">
                <div className="text-xs text-gray-500 mb-1">Premier choix</div>
                <div className="text-xl font-bold text-green-600">
                  {analyse.totalTraite - analyse.qteDeuxieme}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Répartition des défauts</h4>
              <div className="space-y-2">
                {analyse.typesDefauts.map((defaut, idx2) => (
                  <div key={idx2} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{defaut.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{defaut.quantite} pcs</span>
                      <span className="text-xs text-gray-500">
                        ({((defaut.quantite / analyse.qteDeuxieme) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 ml-64">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Chef d'Atelier - Finition & Emballage</h1>
          <p className="text-indigo-100">Gestion des flux continus - {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Commandes actives</div>
            <div className="text-2xl font-bold text-blue-600">{commandesEnCours.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
            <div className="text-sm text-gray-600">Alertes urgentes</div>
            <div className="text-2xl font-bold text-red-600">
              {alertes.filter(a => a.urgent).length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
            <div className="text-sm text-gray-600">Deuxième choix</div>
            <div className="text-2xl font-bold text-orange-600">
              {(commandesEnCours as any[]).reduce((sum: number, cmd: any) => 
                sum + (cmd.articles as any[]).reduce((s: number, art: any) => 
                  s + (art.suivis as any[]).reduce((ss: number, suivi: any) => ss + suivi.qteDeuxieme, 0), 0), 0
              ) as number}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Opérations en cours</div>
            <div className="text-2xl font-bold text-green-600">
              {operations.reduce((sum, op) => sum + getStatsOperation(op.id).enCours, 0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => setShowScanModal(true)}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex flex-col items-center gap-2"
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm font-medium">Scanner Lot</span>
            </button>
            <button
              onClick={() => setShowDeuxiemeModal(true)}
              className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex flex-col items-center gap-2"
            >
              <XCircle className="w-6 h-6" />
              <span className="text-sm font-medium">Déclarer 2ème</span>
            </button>
            <button
              onClick={() => setShowComplementModal(true)}
              className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex flex-col items-center gap-2"
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-medium">Complément</span>
            </button>
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex flex-col items-center gap-2"
            >
              <Wrench className="w-6 h-6" />
              <span className="text-sm font-medium">Maintenance</span>
            </button>
            <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex flex-col items-center gap-2">
              <Printer className="w-6 h-6" />
              <span className="text-sm font-medium">Imprimer</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'operations', label: 'Par Opération', icon: Activity },
                { id: 'commandes', label: 'Par Commande', icon: Package },
                { id: 'alertes', label: 'Alertes', icon: Bell },
                { id: 'maintenance', label: 'Maintenance', icon: Settings },
                { id: 'analyse', label: 'Analyse 2ème', icon: BarChart3 }
              ].map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'alertes' && alertes.filter(a => a.urgent).length > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                        {alertes.filter(a => a.urgent).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'operations' && <OperationsView />}
            {activeTab === 'commandes' && <CommandesView />}
            {activeTab === 'alertes' && <AlertesView />}
            {activeTab === 'maintenance' && <MaintenanceView />}
            {activeTab === 'analyse' && <AnalyseDeuxiemeView />}
          </div>
        </div>
      </div>

      <ScanModal />
      <DeuxiemeChoixModal />
      <ComplementUrgentModal />
      <MaintenanceModal />
    </div>
  );
};

export default ChefAtelierDashboard;
