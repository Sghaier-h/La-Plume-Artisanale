import React, { useState, useEffect } from 'react';
import { parametrageService, utilisateursService } from '../services/api';
import api from '../services/api';
import { 
  Save, Building2, Settings, Tag, Code, ShoppingCart, Package, 
  Factory, CheckCircle, Calendar, FileText, TrendingUp, AlertTriangle,
  BarChart3, Wrench, Boxes, ClipboardCheck, Users, UserPlus, Edit, Trash2, Lock, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabType = 'societe' | 'systeme' | 'utilisateurs' | 'vente' | 'production' | 'stock' | 'qualite' | 'planification' | 'attributs' | 'api';

const Parametrage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('societe');
  
  // État pour chaque module
  const [societe, setSociete] = useState<any>({});
  const [parametresSysteme, setParametresSysteme] = useState<any>({});
  const [parametresVente, setParametresVente] = useState<any>({});
  const [parametresProduction, setParametresProduction] = useState<any>({});
  const [parametresStock, setParametresStock] = useState<any>({});
  const [parametresQualite, setParametresQualite] = useState<any>({});
  const [parametresPlanification, setParametresPlanification] = useState<any>({});
  
  // État pour la gestion des utilisateurs
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [showFormUtilisateur, setShowFormUtilisateur] = useState(false);
  const [editingUtilisateur, setEditingUtilisateur] = useState<any>(null);
  
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'societe') {
        const response = await parametrageService.getSociete();
        setSociete(response.data.data);
      } else if (activeTab === 'systeme') {
        const response = await parametrageService.getParametresSysteme();
        setParametresSysteme(response.data.data);
      } else if (activeTab === 'vente') {
        const response = await parametrageService.getParametresModule?.('vente') || { data: { data: {} } };
        setParametresVente(response.data.data || {
          devis: {
            tva_par_defaut: 20,
            validite_devis_jours: 30,
            generer_numero_auto: true,
            prefixe_numero: 'DEV'
          },
          factures: {
            delai_paiement_jours: 30,
            taux_penalite_retard: 0.75,
            generer_numero_auto: true,
            prefixe_numero: 'FAC'
          },
          bons_livraison: {
            generer_numero_auto: true,
            prefixe_numero: 'BL'
          }
        });
      } else if (activeTab === 'production') {
        const response = await parametrageService.getParametresModule?.('production') || { data: { data: {} } };
        setParametresProduction(response.data.data || {
          of: {
            taux_rendement_cible: 90,
            delai_alerte_retard_heures: 24,
            generer_numero_auto: true,
            prefixe_numero: 'OF'
          },
          machines: {
            alerte_maintenance_jours: 7,
            delai_maintenance_preventive_jours: 90
          },
          suivi: {
            calcul_rendement_auto: true,
            calcul_temps_auto: true
          }
        });
      } else if (activeTab === 'stock') {
        const response = await parametrageService.getParametresModule?.('stock') || { data: { data: {} } };
        setParametresStock(response.data.data || {
          articles: {
            stock_minimum_par_defaut: 10,
            stock_alerte_par_defaut: 5,
            activer_alertes_stock: true
          },
          inventaire: {
            frequence_inventaire_jours: 30,
            type_inventaire_par_defaut: 'PARTIEL'
          },
          alertes: {
            delai_alerte_stock_jours: 3,
            notification_email: true
          }
        });
      } else if (activeTab === 'qualite') {
        const response = await parametrageService.getParametresModule?.('qualite') || { data: { data: {} } };
        setParametresQualite(response.data.data || {
          controles: {
            taux_acceptation_cible: 95,
            activer_controles_auto: true,
            frequence_controles: 'CHAQUE_LOT'
          },
          non_conformites: {
            delai_traitement_jours: 7,
            notification_urgence: true
          }
        });
      } else if (activeTab === 'planification') {
        const response = await parametrageService.getParametresModule?.('planification') || { data: { data: {} } };
        setParametresPlanification(response.data.data || {
          gantt: {
            unite_planification: 'JOUR',
            afficher_weekend: false,
            couleur_retard: '#FF0000'
          },
          ressources: {
            capacite_max_machine: 8,
            activer_surcharge: false
          }
        });
      } else if (activeTab === 'utilisateurs') {
        const response = await utilisateursService.getUtilisateurs();
        setUtilisateurs(response.data.data.utilisateurs || []);
        setRoles(response.data.data.roles || []);
        setDashboards(response.data.data.dashboards || []);
      } else if (activeTab === 'api') {
        const response = await api.get('/info');
        setApiInfo(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSociete = async () => {
    try {
      setSaving(true);
      await parametrageService.updateSociete(societe);
      setMessage({ type: 'success', text: 'Informations société mises à jour' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveParametre = async (cle: string, valeur: string | number | boolean) => {
    try {
      await parametrageService.updateParametreSysteme(cle, { valeur });
      setMessage({ type: 'success', text: 'Paramètre mis à jour' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleSaveParametresModule = async (module: string, parametres: any) => {
    try {
      setSaving(true);
      await parametrageService.updateParametresModule?.(module, parametres) || 
        // Fallback: sauvegarder chaque paramètre individuellement
        Promise.all(Object.entries(parametres).flatMap(([categorie, params]: [string, any]) => 
          Object.entries(params || {}).map(([cle, valeur]) => 
            parametrageService.updateParametreSysteme(`${module}_${categorie}_${cle}`, { valeur })
          )
        ));
      setMessage({ type: 'success', text: `Paramètres ${module} mis à jour` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Paramétrage Complet</h1>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('societe')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'societe'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Société
            </button>
            <button
              onClick={() => setActiveTab('systeme')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'systeme'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Système
            </button>
            <button
              onClick={() => setActiveTab('utilisateurs')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'utilisateurs'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('vente')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'vente'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Vente
            </button>
            <button
              onClick={() => setActiveTab('production')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'production'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Factory className="w-4 h-4" />
              Production
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'stock'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package className="w-4 h-4" />
              Stock
            </button>
            <button
              onClick={() => setActiveTab('qualite')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'qualite'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Qualité
            </button>
            <button
              onClick={() => setActiveTab('planification')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'planification'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Planification
            </button>
            <button
              onClick={() => navigate('/gestion-attributs')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'attributs'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              Attributs
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 font-medium flex items-center gap-2 rounded-t-lg ${
                activeTab === 'api'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Code className="w-4 h-4" />
              API
            </button>
          </div>

          {/* Contenu Société */}
          {activeTab === 'societe' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">🏢 Informations de la Société</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={societe.nom_entreprise || ''}
                    onChange={(e) => setSociete({ ...societe, nom_entreprise: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison sociale
                  </label>
                  <input
                    type="text"
                    value={societe.raison_sociale || ''}
                    onChange={(e) => setSociete({ ...societe, raison_sociale: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={societe.adresse || ''}
                    onChange={(e) => setSociete({ ...societe, adresse: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={societe.code_postal || ''}
                    onChange={(e) => setSociete({ ...societe, code_postal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={societe.ville || ''}
                    onChange={(e) => setSociete({ ...societe, ville: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={societe.pays || ''}
                    onChange={(e) => setSociete({ ...societe, pays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={societe.telephone || ''}
                    onChange={(e) => setSociete({ ...societe, telephone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={societe.email || ''}
                    onChange={(e) => setSociete({ ...societe, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={societe.site_web || ''}
                    onChange={(e) => setSociete({ ...societe, site_web: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={societe.siret || ''}
                    onChange={(e) => setSociete({ ...societe, siret: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TVA
                  </label>
                  <input
                    type="text"
                    value={societe.tva || ''}
                    onChange={(e) => setSociete({ ...societe, tva: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    value={societe.devise || 'TND'}
                    onChange={(e) => setSociete({ ...societe, devise: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TND">TND (Dinar tunisien)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSociete}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Contenu Paramètres Système */}
          {activeTab === 'systeme' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">⚙️ Paramètres Système</h2>
              
              <div className="space-y-4">
                {Object.entries(parametresSysteme).map(([cle, param]: [string, any]) => (
                  <div key={cle} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{cle}</div>
                      {param.description && (
                        <div className="text-sm text-gray-500 mt-1">{param.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={param.valeur || ''}
                        onChange={(e) => {
                          const newParams = { ...parametresSysteme };
                          newParams[cle] = { ...param, valeur: e.target.value };
                          setParametresSysteme(newParams);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-48"
                      />
                      <button
                        onClick={() => handleSaveParametre(cle, param.valeur)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contenu Paramètres Vente */}
          {activeTab === 'vente' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">🛒 Paramètres Module Vente</h2>
              
              <div className="space-y-6">
                {/* Devis */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Devis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TVA par défaut (%)
                      </label>
                      <input
                        type="number"
                        value={parametresVente.devis?.tva_par_defaut || 20}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          devis: { ...parametresVente.devis, tva_par_defaut: parseFloat(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validité devis (jours)
                      </label>
                      <input
                        type="number"
                        value={parametresVente.devis?.validite_devis_jours || 30}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          devis: { ...parametresVente.devis, validite_devis_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Préfixe numéro
                      </label>
                      <input
                        type="text"
                        value={parametresVente.devis?.prefixe_numero || 'DEV'}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          devis: { ...parametresVente.devis, prefixe_numero: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresVente.devis?.generer_numero_auto ?? true}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          devis: { ...parametresVente.devis, generer_numero_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Générer numéro automatiquement
                      </label>
                    </div>
                  </div>
                </div>

                {/* Factures */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Factures
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai de paiement (jours)
                      </label>
                      <input
                        type="number"
                        value={parametresVente.factures?.delai_paiement_jours || 30}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          factures: { ...parametresVente.factures, delai_paiement_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taux pénalité retard (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={parametresVente.factures?.taux_penalite_retard || 0.75}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          factures: { ...parametresVente.factures, taux_penalite_retard: parseFloat(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Préfixe numéro
                      </label>
                      <input
                        type="text"
                        value={parametresVente.factures?.prefixe_numero || 'FAC'}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          factures: { ...parametresVente.factures, prefixe_numero: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresVente.factures?.generer_numero_auto ?? true}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          factures: { ...parametresVente.factures, generer_numero_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Générer numéro automatiquement
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bons de Livraison */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Bons de Livraison
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Préfixe numéro
                      </label>
                      <input
                        type="text"
                        value={parametresVente.bons_livraison?.prefixe_numero || 'BL'}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          bons_livraison: { ...parametresVente.bons_livraison, prefixe_numero: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresVente.bons_livraison?.generer_numero_auto ?? true}
                        onChange={(e) => setParametresVente({
                          ...parametresVente,
                          bons_livraison: { ...parametresVente.bons_livraison, generer_numero_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Générer numéro automatiquement
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSaveParametresModule('vente', parametresVente)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Contenu Paramètres Production */}
          {activeTab === 'production' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">🏭 Paramètres Module Production</h2>
              
              <div className="space-y-6">
                {/* OF */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Ordres de Fabrication (OF)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taux de rendement cible (%)
                      </label>
                      <input
                        type="number"
                        value={parametresProduction.of?.taux_rendement_cible || 90}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          of: { ...parametresProduction.of, taux_rendement_cible: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai alerte retard (heures)
                      </label>
                      <input
                        type="number"
                        value={parametresProduction.of?.delai_alerte_retard_heures || 24}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          of: { ...parametresProduction.of, delai_alerte_retard_heures: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Préfixe numéro
                      </label>
                      <input
                        type="text"
                        value={parametresProduction.of?.prefixe_numero || 'OF'}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          of: { ...parametresProduction.of, prefixe_numero: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresProduction.of?.generer_numero_auto ?? true}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          of: { ...parametresProduction.of, generer_numero_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Générer numéro automatiquement
                      </label>
                    </div>
                  </div>
                </div>

                {/* Machines */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-gray-600" />
                    Machines
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alerte maintenance (jours avant)
                      </label>
                      <input
                        type="number"
                        value={parametresProduction.machines?.alerte_maintenance_jours || 7}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          machines: { ...parametresProduction.machines, alerte_maintenance_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai maintenance préventive (jours)
                      </label>
                      <input
                        type="number"
                        value={parametresProduction.machines?.delai_maintenance_preventive_jours || 90}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          machines: { ...parametresProduction.machines, delai_maintenance_preventive_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Suivi */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Suivi Fabrication
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresProduction.suivi?.calcul_rendement_auto ?? true}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          suivi: { ...parametresProduction.suivi, calcul_rendement_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Calcul rendement automatique
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresProduction.suivi?.calcul_temps_auto ?? true}
                        onChange={(e) => setParametresProduction({
                          ...parametresProduction,
                          suivi: { ...parametresProduction.suivi, calcul_temps_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Calcul temps automatique
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSaveParametresModule('production', parametresProduction)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Contenu Paramètres Stock */}
          {activeTab === 'stock' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">📦 Paramètres Module Stock</h2>
              
              <div className="space-y-6">
                {/* Articles */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-blue-600" />
                    Articles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock minimum par défaut
                      </label>
                      <input
                        type="number"
                        value={parametresStock.articles?.stock_minimum_par_defaut || 10}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          articles: { ...parametresStock.articles, stock_minimum_par_defaut: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock alerte par défaut
                      </label>
                      <input
                        type="number"
                        value={parametresStock.articles?.stock_alerte_par_defaut || 5}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          articles: { ...parametresStock.articles, stock_alerte_par_defaut: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresStock.articles?.activer_alertes_stock ?? true}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          articles: { ...parametresStock.articles, activer_alertes_stock: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Activer alertes stock
                      </label>
                    </div>
                  </div>
                </div>

                {/* Inventaire */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-green-600" />
                    Inventaire
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fréquence inventaire (jours)
                      </label>
                      <input
                        type="number"
                        value={parametresStock.inventaire?.frequence_inventaire_jours || 30}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          inventaire: { ...parametresStock.inventaire, frequence_inventaire_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type inventaire par défaut
                      </label>
                      <select
                        value={parametresStock.inventaire?.type_inventaire_par_defaut || 'PARTIEL'}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          inventaire: { ...parametresStock.inventaire, type_inventaire_par_defaut: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="COMPLET">Complet</option>
                        <option value="PARTIEL">Partiel</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Alertes */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Alertes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai alerte stock (jours)
                      </label>
                      <input
                        type="number"
                        value={parametresStock.alertes?.delai_alerte_stock_jours || 3}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          alertes: { ...parametresStock.alertes, delai_alerte_stock_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresStock.alertes?.notification_email ?? true}
                        onChange={(e) => setParametresStock({
                          ...parametresStock,
                          alertes: { ...parametresStock.alertes, notification_email: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Notification par email
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSaveParametresModule('stock', parametresStock)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Contenu Paramètres Qualité */}
          {activeTab === 'qualite' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">✅ Paramètres Module Qualité</h2>
              
              <div className="space-y-6">
                {/* Contrôles */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Contrôles Qualité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taux d'acceptation cible (%)
                      </label>
                      <input
                        type="number"
                        value={parametresQualite.controles?.taux_acceptation_cible || 95}
                        onChange={(e) => setParametresQualite({
                          ...parametresQualite,
                          controles: { ...parametresQualite.controles, taux_acceptation_cible: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fréquence contrôles
                      </label>
                      <select
                        value={parametresQualite.controles?.frequence_controles || 'CHAQUE_LOT'}
                        onChange={(e) => setParametresQualite({
                          ...parametresQualite,
                          controles: { ...parametresQualite.controles, frequence_controles: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CHAQUE_LOT">Chaque lot</option>
                        <option value="PREMIERE_PIECE">Première pièce</option>
                        <option value="ECHANTILLONNAGE">Échantillonnage</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresQualite.controles?.activer_controles_auto ?? true}
                        onChange={(e) => setParametresQualite({
                          ...parametresQualite,
                          controles: { ...parametresQualite.controles, activer_controles_auto: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Activer contrôles automatiques
                      </label>
                    </div>
                  </div>
                </div>

                {/* Non-conformités */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Non-conformités
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai traitement (jours)
                      </label>
                      <input
                        type="number"
                        value={parametresQualite.non_conformites?.delai_traitement_jours || 7}
                        onChange={(e) => setParametresQualite({
                          ...parametresQualite,
                          non_conformites: { ...parametresQualite.non_conformites, delai_traitement_jours: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresQualite.non_conformites?.notification_urgence ?? true}
                        onChange={(e) => setParametresQualite({
                          ...parametresQualite,
                          non_conformites: { ...parametresQualite.non_conformites, notification_urgence: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Notification urgence
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSaveParametresModule('qualite', parametresQualite)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Contenu Paramètres Planification */}
          {activeTab === 'planification' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">📅 Paramètres Module Planification</h2>
              
              <div className="space-y-6">
                {/* Gantt */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Gantt
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unité planification
                      </label>
                      <select
                        value={parametresPlanification.gantt?.unite_planification || 'JOUR'}
                        onChange={(e) => setParametresPlanification({
                          ...parametresPlanification,
                          gantt: { ...parametresPlanification.gantt, unite_planification: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="JOUR">Jour</option>
                        <option value="SEMAINE">Semaine</option>
                        <option value="MOIS">Mois</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur retard
                      </label>
                      <input
                        type="color"
                        value={parametresPlanification.gantt?.couleur_retard || '#FF0000'}
                        onChange={(e) => setParametresPlanification({
                          ...parametresPlanification,
                          gantt: { ...parametresPlanification.gantt, couleur_retard: e.target.value }
                        })}
                        className="w-full h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresPlanification.gantt?.afficher_weekend ?? false}
                        onChange={(e) => setParametresPlanification({
                          ...parametresPlanification,
                          gantt: { ...parametresPlanification.gantt, afficher_weekend: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Afficher weekend
                      </label>
                    </div>
                  </div>
                </div>

                {/* Ressources */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-gray-600" />
                    Ressources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacité max machine (heures/jour)
                      </label>
                      <input
                        type="number"
                        value={parametresPlanification.ressources?.capacite_max_machine || 8}
                        onChange={(e) => setParametresPlanification({
                          ...parametresPlanification,
                          ressources: { ...parametresPlanification.ressources, capacite_max_machine: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parametresPlanification.ressources?.activer_surcharge ?? false}
                        onChange={(e) => setParametresPlanification({
                          ...parametresPlanification,
                          ressources: { ...parametresPlanification.ressources, activer_surcharge: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Activer surcharge
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSaveParametresModule('planification', parametresPlanification)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Contenu API */}
          {activeTab === 'api' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">📡 Informations API</h2>
              
              {apiInfo ? (
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-blue-900">🚀 API ERP</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ {apiInfo.status}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">{apiInfo.message}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Version:</span>
                        <span className="ml-2 text-blue-900">{apiInfo.version}</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Environnement:</span>
                        <span className="ml-2 text-blue-900">{apiInfo.environment}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-600 font-medium">Base URL:</span>
                        <span className="ml-2 text-blue-900 font-mono">{apiInfo.baseUrl}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-600 font-medium">Dernière mise à jour:</span>
                        <span className="ml-2 text-blue-900">
                          {new Date(apiInfo.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Endpoints disponibles */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">📋 Endpoints disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(apiInfo.endpoints || {}).map(([key, path]: [string, any]) => (
                        <div
                          key={key}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-mono text-sm text-gray-800">
                            <span className="text-blue-600 font-semibold">{key}:</span>
                            <span className="ml-2">{path}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chargement des informations API...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Parametrage;