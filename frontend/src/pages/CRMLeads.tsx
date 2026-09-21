import React, { useEffect, useState } from 'react';
import { crmLeadsService } from '../services/api';
import { Users, Plus, Edit, Trash2, Search, TrendingUp, Phone, Mail, MapPin } from 'lucide-react';

const CRMLeads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ state: '', type: '' });

  useEffect(() => {
    loadLeads();
  }, [filters, search]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filters.state) params.state = filters.state;
      if (filters.type) params.type = filters.type;

      const response = await crmLeadsService.getLeads(params);
      setLeads(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLead(null);
    setShowForm(true);
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleConvert = async (id: number) => {
    if (window.confirm('Convertir ce lead en opportunité ?')) {
      try {
        await crmLeadsService.convertToOpportunity(id);
        loadLeads();
        alert('Lead converti avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la conversion');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) {
      try {
        await crmLeadsService.deleteLead(id);
        loadLeads();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStateBadge = (state: string) => {
    const states: { [key: string]: { bg: string; text: string; label: string } } = {
      new: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Nouveau' },
      contacted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacté' },
      qualified: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Qualifié' },
      converted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Converti' },
      lost: { bg: 'bg-red-100', text: 'text-red-800', label: 'Perdu' },
    };
    const stateStyle = states[state] || states.new;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${stateStyle.bg} ${stateStyle.text}`}>
        {stateStyle.label}
      </span>
    );
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Leads et Opportunités</h1>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nouveau Lead
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
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
            </div>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              <option value="new">Nouveau</option>
              <option value="contacted">Contacté</option>
              <option value="qualified">Qualifié</option>
              <option value="converted">Converti</option>
              <option value="lost">Perdu</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="lead">Lead</option>
              <option value="opportunity">Opportunité</option>
            </select>
          </div>

          {/* Liste */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{lead.name}</h3>
                    {lead.partner_id && (
                      <p className="text-sm text-gray-600">{lead.partner_id.name}</p>
                    )}
                  </div>
                  {getStateBadge(lead.state)}
                </div>

                <div className="space-y-2 mb-4">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </div>
                  )}
                  {lead.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {lead.city}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    {lead.type === 'opportunity' ? 'Opportunité' : 'Lead'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(lead)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {lead.type === 'lead' && (
                      <button
                        onClick={() => handleConvert(lead.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Convertir"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leads.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun lead trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMLeads;
