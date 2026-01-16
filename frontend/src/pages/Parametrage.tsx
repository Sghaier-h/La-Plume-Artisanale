import React, { useState, useEffect } from 'react';
import { parametrageService } from '../services/api';
import api from '../services/api';
import { Save, Building2, Settings, Tag, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Parametrage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'societe' | 'systeme' | 'attributs' | 'api'>('societe');
  const [societe, setSociete] = useState<any>({});
  const [parametres, setParametres] = useState<any>({});
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
        setParametres(response.data.data);
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

  const handleSaveParametre = async (cle: string, valeur: string) => {
    try {
      await parametrageService.updateParametreSysteme(cle, { valeur });
      setMessage({ type: 'success', text: 'Paramètre mis à jour' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Paramétrage</h1>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('societe')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'societe'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Informations Société
            </button>
            <button
              onClick={() => setActiveTab('systeme')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'systeme'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              Paramètres Système
            </button>
            <button
              onClick={() => navigate('/gestion-attributs')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'attributs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Tag className="w-5 h-5" />
              Attributs
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'api'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Code className="w-5 h-5" />
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
                {Object.entries(parametres).map(([cle, param]: [string, any]) => (
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
                          const newParams = { ...parametres };
                          newParams[cle] = { ...param, valeur: e.target.value };
                          setParametres(newParams);
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
