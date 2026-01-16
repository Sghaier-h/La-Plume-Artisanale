import React, { useState, useEffect } from 'react';
import { tachesService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { CheckCircle, XCircle, AlertTriangle, Bell, Camera } from 'lucide-react';

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of: string;
  type_tache: string;
  statut: string;
  priorite: number;
  article_designation?: string;
}

const TabletteQualite: React.FC = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [tacheSelectionnee, setTacheSelectionnee] = useState<Tache | null>(null);
  const [resultatControle, setResultatControle] = useState({
    conforme: true,
    poids_mesure: '',
    largeur_mesure: '',
    observations: ''
  });
  const [loading, setLoading] = useState(true);
  const { socket, connected, notifications } = useWebSocket();

  useEffect(() => {
    loadMesTaches();
    const interval = setInterval(loadMesTaches, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMesTaches = async () => {
    try {
      const res = await tachesService.getMesTaches();
      const taches = res.data.data.taches || [];
      setTaches(taches.sort((a: Tache, b: Tache) => a.priorite - b.priorite));
    } catch (err) {
      console.error('Erreur chargement tâches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemarrer = async (tacheId: number) => {
    try {
      await tachesService.demarrerTache(tacheId);
      loadMesTaches();
    } catch (err) {
      alert('Erreur lors du démarrage');
    }
  };

  const handleValiderControle = async () => {
    if (!tacheSelectionnee) return;

    try {
      // TODO: Envoyer résultats contrôle à l'API qualité
      await tachesService.terminerTache(tacheSelectionnee.id_tache);
      loadMesTaches();
      setTacheSelectionnee(null);
      setResultatControle({ conforme: true, poids_mesure: '', largeur_mesure: '', observations: '' });
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Poste Contrôle Qualité</h1>
            <div className="text-sm opacity-90">
              <span className={`${connected ? 'text-green-300' : 'text-red-300'}`}>
                {connected ? '🟢 Connecté' : '🔴 Déconnecté'}
              </span>
            </div>
          </div>
        </div>
        {notifications.length > 0 && (
          <div className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {notifications.length}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">🎯 Mes Contrôles à Effectuer</h2>

        <div className="space-y-4 mb-6">
          {taches.map((tache) => (
            <div
              key={tache.id_tache}
              className={`bg-white rounded-lg shadow-lg p-4 border-2 ${
                tache.priorite === 1 ? 'border-red-400 bg-red-50' :
                'border-blue-400 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{tache.numero_of}</div>
                  {tache.article_designation && (
                    <div className="text-gray-700">{tache.article_designation}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {tache.statut === 'ASSIGNEE' && (
                    <button
                      onClick={() => {
                        setTacheSelectionnee(tache);
                        handleDemarrer(tache.id_tache);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Démarrer contrôle
                    </button>
                  )}
                  {tache.statut === 'EN_COURS' && (
                    <button
                      onClick={() => setTacheSelectionnee(tache)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Continuer contrôle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire contrôle */}
        {tacheSelectionnee && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Contrôle OF {tacheSelectionnee.numero_of}</h3>
              <button
                onClick={() => setTacheSelectionnee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Résultat</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setResultatControle({ ...resultatControle, conforme: true })}
                    className={`flex-1 p-4 rounded-lg border-2 ${
                      resultatControle.conforme
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Conforme</div>
                  </button>
                  <button
                    onClick={() => setResultatControle({ ...resultatControle, conforme: false })}
                    className={`flex-1 p-4 rounded-lg border-2 ${
                      !resultatControle.conforme
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <XCircle className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Non Conforme</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Poids mesuré (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={resultatControle.poids_mesure}
                    onChange={(e) => setResultatControle({ ...resultatControle, poids_mesure: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Largeur mesurée (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={resultatControle.largeur_mesure}
                    onChange={(e) => setResultatControle({ ...resultatControle, largeur_mesure: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={resultatControle.observations}
                  onChange={(e) => setResultatControle({ ...resultatControle, observations: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Notes, remarques..."
                />
              </div>

              {!resultatControle.conforme && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
                  <div className="font-semibold text-red-800 mb-2">Non-conformité détectée</div>
                  <div className="text-sm text-red-700">
                    Une non-conformité sera créée automatiquement après validation.
                  </div>
                </div>
              )}

              <button
                onClick={handleValiderControle}
                className={`w-full px-6 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 ${
                  resultatControle.conforme
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {resultatControle.conforme ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    VALIDER CONTRÔLE
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    ENREGISTRER NON-CONFORMITÉ
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabletteQualite;
