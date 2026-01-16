import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Edit, Trash2, Search, DollarSign, Clock, List, Grid } from 'lucide-react';
import api from '../services/api';

interface Service {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  prix_unitaire: number;
  duree_estimee?: number;
  unite_duree?: string;
  actif: boolean;
  categorie?: string;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ categorie: '', actif: '' });
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('catalogue'); // Services en catalogue par défaut

  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    description: '',
    prix_unitaire: 0,
    duree_estimee: 0,
    unite_duree: 'heure',
    actif: true,
    categorie: ''
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      // TODO: Remplacer par l'API réelle des services
      const mockServices: Service[] = [
        { 
          id: 1, 
          code: 'SRV-001', 
          libelle: 'Consultation', 
          description: 'Service de consultation',
          prix_unitaire: 150, 
          duree_estimee: 1, 
          unite_duree: 'heure',
          actif: true,
          categorie: 'Consultation'
        },
        { 
          id: 2, 
          code: 'SRV-002', 
          libelle: 'Installation', 
          description: 'Service d\'installation',
          prix_unitaire: 300, 
          duree_estimee: 2, 
          unite_duree: 'heure',
          actif: true,
          categorie: 'Installation'
        },
        { 
          id: 3, 
          code: 'SRV-003', 
          libelle: 'Maintenance', 
          description: 'Service de maintenance',
          prix_unitaire: 200, 
          duree_estimee: 1.5, 
          unite_duree: 'heure',
          actif: true,
          categorie: 'Maintenance'
        },
      ];
      setServices(mockServices);
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API pour créer/modifier service
      console.log('Sauvegarde service:', formData);
      setShowForm(false);
      setEditingService(null);
      setFormData({
        code: '',
        libelle: '',
        description: '',
        prix_unitaire: 0,
        duree_estimee: 0,
        unite_duree: 'heure',
        actif: true,
        categorie: ''
      });
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde service:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      code: service.code,
      libelle: service.libelle,
      description: service.description || '',
      prix_unitaire: service.prix_unitaire,
      duree_estimee: service.duree_estimee || 0,
      unite_duree: service.unite_duree || 'heure',
      actif: service.actif,
      categorie: service.categorie || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        // TODO: Appel API pour supprimer
        console.log('Suppression service:', id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression service:', error);
      }
    }
  };

  const filteredServices = services.filter(s =>
    s.code?.toLowerCase().includes(search.toLowerCase()) ||
    s.libelle?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  ).filter(s => {
    if (filters.categorie && s.categorie !== filters.categorie) return false;
    if (filters.actif && s.actif.toString() !== filters.actif) return false;
    return true;
  });

  const categories = Array.from(new Set(services.map(s => s.categorie).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Gestion des Services
            </h1>
            <p className="text-gray-600 mt-2">Création et gestion des services proposés</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingService(null);
              setFormData({
                code: '',
                libelle: '',
                description: '',
                prix_unitaire: 0,
                duree_estimee: 0,
                unite_duree: 'heure',
                actif: true,
                categorie: ''
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Service
          </button>
        </div>

        {/* Toggle Affichage et Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Affichage:</span>
              <button
                onClick={() => setAffichageMode('ligne')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  affichageMode === 'ligne' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                Ligne
              </button>
              <button
                onClick={() => setAffichageMode('catalogue')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  affichageMode === 'catalogue' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
                Catalogue
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.categorie}
              onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filters.actif}
              onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? 'Modifier le Service' : 'Nouveau Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                  <input
                    type="text"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (TND) *</label>
                  <input
                    type="number"
                    value={formData.prix_unitaire}
                    onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée Estimée</label>
                  <input
                    type="number"
                    value={formData.duree_estimee}
                    onChange={(e) => setFormData({ ...formData, duree_estimee: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité de Durée</label>
                  <select
                    value={formData.unite_duree}
                    onChange={(e) => setFormData({ ...formData, unite_duree: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="heure">Heure</option>
                    <option value="jour">Jour</option>
                    <option value="semaine">Semaine</option>
                    <option value="mois">Mois</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Service actif</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des services */}
        {affichageMode === 'ligne' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium">{service.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{service.libelle}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{service.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{service.prix_unitaire.toFixed(2)} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {service.duree_estimee ? `${service.duree_estimee} ${service.unite_duree}(s)` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.categorie ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{service.categorie}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${service.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {service.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{service.libelle}</h3>
                    <p className="text-sm text-gray-500">{service.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${service.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {service.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              {service.description && (
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">{service.prix_unitaire.toFixed(2)} TND</span>
                </div>
                {service.duree_estimee && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{service.duree_estimee} {service.unite_duree}(s)</span>
                  </div>
                )}
                {service.categorie && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{service.categorie}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun service trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
