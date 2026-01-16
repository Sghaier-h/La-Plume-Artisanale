import React, { useState } from 'react';
import { Package, Search, Filter, Download, Camera, AlertCircle, TrendingUp, ShoppingCart, Wrench, FileText, Box, Truck, CheckCircle, Clock, XCircle, PlusCircle, Send, Scissors, RefreshCw } from 'lucide-react';

export default function TableauBordMagasinPF() {
  const [activeTab, setActiveTab] = useState('commandes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showNewColis, setShowNewColis] = useState(false);
  const [showDemandeAchat, setShowDemandeAchat] = useState(false);
  const [showDemandeIntervention, setShowDemandeIntervention] = useState(false);
  const [showDemandePliage, setShowDemandePliage] = useState(false);
  const [showDemandeRetourFrange, setShowDemandeRetourFrange] = useState(false);

  // Liste des commandes avec états détaillés
  const commandes = [
    { 
      id: 'C2025-001', 
      client: 'CLIENT A', 
      ref: 'REF-001', 
      modele: 'Tapis Berbère', 
      dimensions: '200x300',
      qteTotale: 100,
      etatTissage: 'Terminé',
      etatCoupe: 'Terminé', 
      etatST: 'En cours',
      etatAtelier: 'En attente',
      etatPliage: 'Non commencé',
      etatFrange: 'Terminé',
      qtePrete: 5,
      priorite: 'Normale',
      delai: '2025-11-01'
    },
    { 
      id: 'C2025-002', 
      client: 'CLIENT B', 
      ref: 'REF-002', 
      modele: 'Tapis Kilim', 
      dimensions: '150x200',
      qteTotale: 50,
      etatTissage: 'Terminé',
      etatCoupe: 'Terminé', 
      etatST: 'Terminé',
      etatAtelier: 'En cours',
      etatPliage: 'En attente',
      etatFrange: 'En attente',
      qtePrete: 0,
      priorite: 'Urgente',
      delai: '2025-10-25'
    },
    { 
      id: 'C2025-003', 
      client: 'CLIENT C', 
      ref: 'REF-003', 
      modele: 'Jeté Traditionnel', 
      dimensions: '180x250',
      qteTotale: 75,
      etatTissage: 'En cours',
      etatCoupe: 'En attente', 
      etatST: 'Non commencé',
      etatAtelier: 'Non commencé',
      etatPliage: 'Non commencé',
      etatFrange: 'N/A',
      qtePrete: 0,
      priorite: 'Normale',
      delai: '2025-11-10'
    }
  ];

  // Gestion des colis avec plusieurs articles
  const [colis, setColis] = useState([
    { 
      numColis: 'COLIS-001', 
      qrCode: 'QR-COL-001',
      articles: [
        { suivis: 'SUIVIS-001', commande: 'C2025-001', ref: 'REF-001', modele: 'Tapis Berbère', qte: 3 },
        { suivis: 'SUIVIS-002', commande: 'C2025-001', ref: 'REF-001', modele: 'Tapis Berbère', qte: 2 }
      ],
      poids: 25.5,
      dimensions: '80x60x40',
      palette: 'PAL-001',
      statut: 'Validé',
      operateur: 'OP-001'
    },
    { 
      numColis: 'COLIS-002', 
      qrCode: 'QR-COL-002',
      articles: [
        { suivis: 'SUIVIS-010', commande: 'C2025-002', ref: 'REF-002', modele: 'Tapis Kilim', qte: 5 },
        { suivis: 'SUIVIS-011', commande: 'C2025-003', ref: 'REF-003', modele: 'Jeté', qte: 3 }
      ],
      poids: 18.3,
      dimensions: '70x50x35',
      palette: 'PAL-002',
      statut: 'En cours',
      operateur: 'OP-002'
    }
  ]);

  // Fournitures
  const fournitures = [
    { id: 'FOUR-001', type: 'Étiquette', ref: 'ETI-001', libelle: 'Étiquettes adhésives 10x5cm', stock: 5000, min: 2000, max: 10000, unite: 'Pcs', statut: 'OK', valeur: 250 },
    { id: 'FOUR-003', type: 'Sachet', ref: 'SAC-001', libelle: 'Sachet plastique transparent', stock: 800, min: 1000, max: 5000, unite: 'Pcs', statut: 'Alerte', valeur: 64 },
    { id: 'FOUR-005', type: 'Film', ref: 'FIL-001', libelle: 'Film étirable transparent', stock: 10, min: 15, max: 50, unite: 'Rouleaux', statut: 'Alerte', valeur: 150 }
  ];

  // Demandes de pliage
  const [demandesPliage, setDemandesPliage] = useState([
    { id: 'DP-2025-001', date: '2025-10-19', commande: 'C2025-002', ref: 'REF-002', modele: 'Tapis Kilim', qte: 50, priorite: 'Urgente', statut: 'En attente', demandeur: 'Magasinier PF' }
  ]);

  // Demandes de retour frange
  const [demandesRetourFrange, setDemandesRetourFrange] = useState([
    { id: 'DRF-2025-001', date: '2025-10-19', commande: 'C2025-002', ref: 'REF-002', modele: 'Tapis Kilim', qte: 45, priorite: 'Urgente', statut: 'En attente', demandeur: 'Magasinier PF', observation: 'Frange mal coupée' }
  ]);

  const getEtatColor = (etat: string) => {
    switch(etat) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Non commencé': return 'bg-gray-100 text-gray-600';
      case 'N/A': return 'bg-gray-50 text-gray-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatutColor = (statut: string) => {
    switch(statut) {
      case 'OK': case 'Validé': case 'Terminé': return 'bg-green-100 text-green-800';
      case 'Alerte': case 'Urgente': return 'bg-red-100 text-red-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch(priorite) {
      case 'Urgente': case 'Critique': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Normale': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Magasin Produit Fini</h1>
                <p className="text-gray-600">Gestion complète des produits finis, fournitures et demandes urgentes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Date</div>
              <div className="text-lg font-semibold text-gray-900">19 Oct 2025</div>
            </div>
          </div>
        </div>

        {/* Indicateurs KPI */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Commandes</span>
              <Box className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{commandes.length}</div>
            <div className="text-xs text-gray-500 mt-1">En suivi</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Colis</span>
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{colis.length}</div>
            <div className="text-xs text-gray-500 mt-1">Créés</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Fournitures</span>
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{fournitures.length}</div>
            <div className="text-xs text-red-500 mt-1">2 alertes</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Pliage</span>
              <Scissors className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{demandesPliage.length}</div>
            <div className="text-xs text-yellow-600 mt-1">En attente</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Retour Frange</span>
              <RefreshCw className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{demandesRetourFrange.length}</div>
            <div className="text-xs text-red-600 mt-1">Urgent</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex gap-2 p-2 overflow-x-auto">
            {[
              { id: 'commandes', label: 'Commandes & États', icon: Package },
              { id: 'colis', label: 'Gestion Colis', icon: Box },
              { id: 'pliage', label: 'Demandes Pliage', icon: Scissors },
              { id: 'frange', label: 'Retour Frange', icon: RefreshCw },
              { id: 'fournitures', label: 'Fournitures', icon: ShoppingCart },
              { id: 'achats', label: 'Demandes Achat', icon: FileText },
              { id: 'interventions', label: 'Interventions', icon: Wrench }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          
          {/* TAB COMMANDES ET ÉTATS */}
          {activeTab === 'commandes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Liste des Commandes avec États</h2>
                <div className="flex gap-3">
                  <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="tous">Tous les états</option>
                    <option value="urgent">Urgentes uniquement</option>
                    <option value="bloquee">Bloquées</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {commandes.map((cmd) => (
                  <div key={cmd.id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-gray-900">{cmd.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioriteColor(cmd.priorite)}`}>
                            {cmd.priorite}
                          </span>
                          <span className="text-gray-600">|</span>
                          <span className="font-medium text-gray-700">{cmd.client}</span>
                        </div>
                        <div className="text-gray-700 mb-3">
                          <span className="font-medium">{cmd.modele}</span> - {cmd.dimensions} - {cmd.ref}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Quantité totale: <strong className="text-gray-900">{cmd.qteTotale}</strong></span>
                          <span>|</span>
                          <span>Prête: <strong className="text-green-600">{cmd.qtePrete}</strong></span>
                          <span>|</span>
                          <span>Délai: <strong>{cmd.delai}</strong></span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setShowDemandePliage(true)}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 text-sm"
                        >
                          <Scissors className="w-4 h-4" />
                          Demander Pliage
                        </button>
                        <button 
                          onClick={() => setShowDemandeRetourFrange(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retour Frange
                        </button>
                      </div>
                    </div>

                    {/* États détaillés */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-3">États de progression:</div>
                      <div className="grid grid-cols-6 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Tissage</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(cmd.etatTissage)}`}>
                            {cmd.etatTissage}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Coupe</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(cmd.etatCoupe)}`}>
                            {cmd.etatCoupe}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Sous-Traitance</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(cmd.etatST)}`}>
                            {cmd.etatST}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Atelier</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(cmd.etatAtelier)}`}>
                            {cmd.etatAtelier}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Pliage</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(cmd.etatPliage)}`}>
                            {cmd.etatPliage}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Frange</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(cmd.etatFrange)}`}>
                            {cmd.etatFrange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB GESTION COLIS */}
          {activeTab === 'colis' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestion des Colis Multi-Articles</h2>
                <button 
                  onClick={() => setShowNewColis(!showNewColis)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouveau Colis
                </button>
              </div>

              {showNewColis && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Création d'un Nouveau Colis</h3>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Scannez les étiquettes des articles à inclure:</div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <input type="text" placeholder="QR Suivis" className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <input type="number" placeholder="Quantité" className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        + Ajouter
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">Articles ajoutés (0):</div>
                      <div className="text-sm text-gray-500 italic">Aucun article ajouté</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                      <input type="number" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                      <input type="text" placeholder="LxlxH" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Palette</label>
                      <input type="text" placeholder="PAL-XXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Créer Colis
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Photo
                    </button>
                    <button 
                      onClick={() => setShowNewColis(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {colis.map((col) => (
                  <div key={col.numColis} className="border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <Box className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900">{col.numColis}</div>
                          <div className="text-sm text-gray-600">QR: {col.qrCode}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(col.statut)}`}>
                          {col.statut}
                        </span>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Camera className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Articles dans ce colis ({col.articles.length}):</div>
                      <div className="space-y-2">
                        {col.articles.map((art, idx) => (
                          <div key={idx} className="bg-white rounded p-3 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm text-indigo-600">{art.suivis}</span>
                                <span className="text-gray-600">|</span>
                                <span className="font-medium text-gray-900">{art.modele}</span>
                                <span className="text-sm text-gray-600">({art.ref})</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Commande: {art.commande}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">Qté: {art.qte}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Poids:</span>
                        <span className="font-semibold text-gray-900 ml-2">{col.poids} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium text-gray-900 ml-2">{col.dimensions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Palette:</span>
                        <span className="font-medium text-gray-900 ml-2">{col.palette}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Opérateur:</span>
                        <span className="font-medium text-gray-900 ml-2">{col.operateur}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB DEMANDES PLIAGE */}
          {activeTab === 'pliage' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Demandes de Pliage Urgent</h2>
                <button 
                  onClick={() => setShowDemandePliage(!showDemandePliage)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle Demande
                </button>
              </div>

              {showDemandePliage && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Nouvelle Demande de Pliage</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commande</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Sélectionner une commande</option>
                        {commandes.map(cmd => (
                          <option key={cmd.id} value={cmd.id}>{cmd.id} - {cmd.modele}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Urgente</option>
                        <option>Normale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="Instructions spéciales..."></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer au Chef d'Atelier
                    </button>
                    <button 
                      onClick={() => setShowDemandePliage(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {demandesPliage.map((dp) => (
                  <div key={dp.id} className="border-l-4 border-amber-500 bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">{dp.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioriteColor(dp.priorite)}`}>
                            {dp.priorite}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(dp.statut)}`}>
                            {dp.statut}
                          </span>
                          <span className="text-xs text-gray-600">{dp.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-2">
                          <div>
                            <div className="text-xs text-gray-600">Commande</div>
                            <div className="font-medium text-gray-900">{dp.commande}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Modèle</div>
                            <div className="font-medium text-gray-900">{dp.modele}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Quantité</div>
                            <div className="font-semibold text-indigo-600 text-lg">{dp.qte}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">Demandeur: {dp.demandeur}</div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg">
                          <Scissors className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB RETOUR FRANGE */}
          {activeTab === 'frange' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Demandes de Retour Frange</h2>
                <button 
                  onClick={() => setShowDemandeRetourFrange(!showDemandeRetourFrange)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle Demande
                </button>
              </div>

              {showDemandeRetourFrange && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Nouvelle Demande de Retour Frange</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commande</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Sélectionner une commande</option>
                        {commandes.map(cmd => (
                          <option key={cmd.id} value={cmd.id}>{cmd.id} - {cmd.modele}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité concernée</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motif du retour</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Frange mal coupée</option>
                        <option>Frange trop courte</option>
                        <option>Frange irrégulière</option>
                        <option>Autre défaut</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observations détaillées</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} placeholder="Décrivez le problème..."></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer Demande Urgente
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Ajouter Photo
                    </button>
                    <button 
                      onClick={() => setShowDemandeRetourFrange(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {demandesRetourFrange.map((drf) => (
                  <div key={drf.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">{drf.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioriteColor(drf.priorite)}`}>
                            {drf.priorite}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(drf.statut)}`}>
                            {drf.statut}
                          </span>
                          <span className="text-xs text-gray-600">{drf.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-600">Commande</div>
                            <div className="font-medium text-gray-900">{drf.commande}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Modèle</div>
                            <div className="font-medium text-gray-900">{drf.modele}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Quantité</div>
                            <div className="font-semibold text-red-600 text-lg">{drf.qte}</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-gray-900">Observation:</span>
                          </div>
                          <div className="text-sm text-gray-700">{drf.observation}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Camera className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB FOURNITURES */}
          {activeTab === 'fournitures' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Stock Fournitures</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Camera className="w-4 h-4" />
                  Prendre photo
                </button>
              </div>

              <div className="grid gap-4">
                {fournitures.map((four) => (
                  <div key={four.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(four.statut)}`}>
                            {four.statut}
                          </span>
                          <span className="font-semibold text-gray-900">{four.ref}</span>
                          <span className="text-sm text-gray-600">- {four.type}</span>
                        </div>
                        <div className="text-gray-700 mb-2">{four.libelle}</div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-600">Stock: </span>
                            <span className={`font-semibold ${four.stock < four.min ? 'text-red-600' : 'text-green-600'}`}>
                              {four.stock} {four.unite}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Min: </span>
                            <span className="font-medium">{four.min}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Valeur: </span>
                            <span className="font-semibold text-indigo-600">{four.valeur} DT</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {four.statut === 'Alerte' && (
                          <button 
                            onClick={() => setShowDemandeAchat(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Commander
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB DEMANDES ACHAT */}
          {activeTab === 'achats' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Demandes d'Achat Fournitures</h2>
                <button 
                  onClick={() => setShowDemandeAchat(!showDemandeAchat)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle demande
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                Formulaire de demandes d'achat...
              </div>
            </div>
          )}

          {/* TAB INTERVENTIONS */}
          {activeTab === 'interventions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Demandes d'Intervention</h2>
                <button 
                  onClick={() => setShowDemandeIntervention(!showDemandeIntervention)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle intervention
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                Formulaire de demandes d'intervention...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
