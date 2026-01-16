import React, { useState, useEffect } from 'react';
import { coutsService } from '../services/api';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Calculator } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Couts: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [selectedOF, setSelectedOF] = useState<number | null>(null);
  const [coutTheorique, setCoutTheorique] = useState<any>(null);
  const [coutReel, setCoutReel] = useState<any>(null);
  const [analyseEcarts, setAnalyseEcarts] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  useEffect(() => {
    if (selectedOF) {
      loadCouts();
    }
  }, [selectedOF]);

  const loadBudgets = async () => {
    try {
      const res = await coutsService.getBudgets();
      setBudgets(res.data.data.budgets || []);
    } catch (error) {
      console.error('Erreur chargement budgets:', error);
    }
  };

  const loadCouts = async () => {
    if (!selectedOF) return;
    setLoading(true);
    try {
      const [theoriqueRes, reelRes, ecartsRes] = await Promise.all([
        coutsService.getCoutTheorique(selectedOF),
        coutsService.getCoutReel(selectedOF),
        coutsService.analyserEcarts(selectedOF)
      ]);

      setCoutTheorique(theoriqueRes.data.data);
      setCoutReel(reelRes.data.data);
      setAnalyseEcarts(ecartsRes.data.data);
    } catch (error) {
      console.error('Erreur chargement coûts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEcartColor = (ecart: number) => {
    if (ecart > 0) return 'text-red-600';
    if (ecart < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Coûts - Théorique vs Réel
          </h1>
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Budgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <div key={budget.id_budget} className="border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">{budget.libelle}</div>
                <div className="text-2xl font-bold mb-2">{budget.budget_total?.toLocaleString('fr-FR')} TND</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Utilisé:</span>
                  <span className="font-semibold">{budget.budget_utilise?.toLocaleString('fr-FR')} TND</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${budget.budget_total > 0 ? (budget.budget_utilise / budget.budget_total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Restant: {budget.budget_restant?.toLocaleString('fr-FR')} TND
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyse OF */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Analyse Coûts par OF</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un OF
            </label>
            <input
              type="number"
              value={selectedOF || ''}
              onChange={(e) => setSelectedOF(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="ID OF"
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && selectedOF && analyseEcarts && (
            <>
              {/* Comparaison globale */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Coût Théorique</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analyseEcarts.cout_theorique?.toLocaleString('fr-FR')} TND
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Coût Réel</div>
                  <div className="text-2xl font-bold text-green-600">
                    {analyseEcarts.cout_reel?.toLocaleString('fr-FR')} TND
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${
                  analyseEcarts.ecart > 0 ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <div className="text-sm text-gray-600 mb-2">Écart</div>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${getEcartColor(analyseEcarts.ecart)}`}>
                    {analyseEcarts.ecart > 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                    {Math.abs(analyseEcarts.ecart)?.toLocaleString('fr-FR')} TND
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    ({analyseEcarts.ecart_pourcentage?.toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* Détails par type */}
              {analyseEcarts.details && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Détails par Type de Coût</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Théorique</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écart</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(analyseEcarts.details).map(([type, details]: [string, any]) => {
                          const ecartPourcentage = details.theorique > 0 
                            ? ((details.ecart / details.theorique) * 100).toFixed(2)
                            : '0.00';
                          return (
                            <tr key={type}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {details.theorique?.toLocaleString('fr-FR')} TND
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {details.reel?.toLocaleString('fr-FR')} TND
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getEcartColor(details.ecart)}`}>
                                {details.ecart > 0 ? '+' : ''}{details.ecart?.toLocaleString('fr-FR')} TND
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getEcartColor(details.ecart)}`}>
                                {ecartPourcentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Graphique comparatif */}
              {analyseEcarts.details && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Graphique Comparatif</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analyseEcarts.details).map(([type, details]: [string, any]) => ({
                      type,
                      théorique: details.theorique,
                      réel: details.reel
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} TND`} />
                      <Legend />
                      <Bar dataKey="théorique" fill="#3b82f6" />
                      <Bar dataKey="réel" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Couts;
