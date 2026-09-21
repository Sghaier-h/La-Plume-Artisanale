import React, { useEffect, useState } from 'react';
import { accountMovesService } from '../services/api';
import { Receipt, Plus, Edit, Trash2, Search, CheckCircle, DollarSign, Calendar, User } from 'lucide-react';

const AccountMoves: React.FC = () => {
  const [moves, setMoves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMove, setEditingMove] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ state: '', move_type: '' });

  useEffect(() => {
    loadMoves();
  }, [filters, search]);

  const loadMoves = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filters.state) params.state = filters.state;
      if (filters.move_type) params.move_type = filters.move_type;

      const response = await accountMovesService.getMoves(params);
      setMoves(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement écritures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMove(null);
    setShowForm(true);
  };

  const handleEdit = (move: any) => {
    setEditingMove(move);
    setShowForm(true);
  };

  const handlePost = async (id: number) => {
    if (window.confirm('Comptabiliser cette écriture ?')) {
      try {
        await accountMovesService.postMove(id);
        loadMoves();
        alert('Écriture comptabilisée avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la comptabilisation');
      }
    }
  };

  const getMoveTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      out_invoice: 'Facture Client',
      in_invoice: 'Facture Fournisseur',
      out_refund: 'Avoir Client',
      in_refund: 'Avoir Fournisseur',
    };
    return types[type] || type;
  };

  const getStateBadge = (state: string) => {
    const states: { [key: string]: { bg: string; text: string; label: string } } = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      posted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Comptabilisé' },
      cancel: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
    };
    const stateStyle = states[state] || states.draft;
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
              <Receipt className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Factures et Écritures Comptables</h1>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Écriture
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
              value={filters.move_type}
              onChange={(e) => setFilters({ ...filters, move_type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="out_invoice">Facture Client</option>
              <option value="in_invoice">Facture Fournisseur</option>
              <option value="out_refund">Avoir Client</option>
              <option value="in_refund">Avoir Fournisseur</option>
            </select>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              <option value="draft">Brouillon</option>
              <option value="posted">Comptabilisé</option>
              <option value="cancel">Annulé</option>
            </select>
          </div>

          {/* Liste */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Numéro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Partenaire</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">État</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {moves.map((move) => (
                  <tr key={move.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{move.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getMoveTypeLabel(move.move_type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{move.partner_id?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {move.date ? new Date(move.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                      {move.amount_total ? `${move.amount_total.toFixed(2)} TND` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStateBadge(move.state)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(move)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {move.state === 'draft' && (
                          <button
                            onClick={() => handlePost(move.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Comptabiliser"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {moves.length === 0 && !loading && (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune écriture trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountMoves;
