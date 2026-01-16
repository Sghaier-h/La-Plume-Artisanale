import React, { useState, useEffect } from 'react';
import { suiviFabricationService, ofService } from '../services/api';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Search, Filter } from 'lucide-react';

interface SuiviFabrication {
  id_suivi: number;
  numero_suivi: string;
  numero_of: string;
  machine_designation: string;
  operateur_nom: string;
  operateur_prenom: string;
  quantite_produite: number;
  quantite_bonne: number;
  quantite_rebut: number;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  temps_production: number;
  rendement: number;
}

const SuiviFabrication: React.FC = () => {
  const [suivis, setSuivis] = useState<SuiviFabrication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', ofId: '' });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await suiviFabricationService.getSuivisFabrication({ ...filters, search });
      setSuivis(res.data.data.suivis || []);
    } catch (err: any) {
      console.error('Erreur chargement suivis:', err);
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: { [key: string]: { bg: string; text: string; icon: any } } = {
      'en_cours': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'termine': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'arrete': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'en_attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle }
    };
    const badge = badges[statut] || badges['en_attente'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statut.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              Suivi de Fabrication
            </h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold">Filtres</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Rechercher par N° Suivi ou OF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Tous les statuts</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="arrete">Arrêté</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Suivis</div>
              <div className="text-2xl font-bold text-gray-800">{suivis.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">En Cours</div>
              <div className="text-2xl font-bold text-blue-600">
                {suivis.filter(s => s.statut === 'en_cours').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Quantité Totale Produite</div>
              <div className="text-2xl font-bold text-green-600">
                {suivis.reduce((sum, s) => sum + (s.quantite_produite || 0), 0).toFixed(0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Rendement Moyen</div>
              <div className="text-2xl font-bold text-purple-600">
                {suivis.length > 0 
                  ? (suivis.reduce((sum, s) => sum + (s.rendement || 0), 0) / suivis.length).toFixed(1)
                  : '0'}%
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Suivi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° OF</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Produite</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Bonne</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rebut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suivis.map((suivi) => (
                    <tr key={suivi.id_suivi}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{suivi.numero_suivi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{suivi.numero_of}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{suivi.machine_designation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {suivi.operateur_nom} {suivi.operateur_prenom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{suivi.quantite_produite}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {suivi.quantite_bonne}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {suivi.quantite_rebut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${(suivi.rendement || 0) >= 90 ? 'text-green-600' : (suivi.rendement || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {suivi.rendement?.toFixed(1) || '0'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatutBadge(suivi.statut)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiviFabrication;
