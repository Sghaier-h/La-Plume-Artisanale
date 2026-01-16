import React, { useState, useEffect } from 'react';
import { tachesService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Factory, Play, Pause, CheckCircle, AlertTriangle, Bell } from 'lucide-react';

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of: string;
  type_tache: string;
  statut: string;
  priorite: number;
  quantite_demandee: number;
  quantite_realisee: number;
  article_designation?: string;
  numero_machine?: string;
  instructions?: string;
}

const TabletteTisseur: React.FC = () => {
  const [tacheEnCours, setTacheEnCours] = useState<Tache | null>(null);
  const [tachesSuivantes, setTachesSuivantes] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantiteSaisie, setQuantiteSaisie] = useState(0);
  const { socket, connected, notifications } = useWebSocket();

  useEffect(() => {
    loadMesTaches();
    const interval = setInterval(loadMesTaches, 10000); // Rafraîchir toutes les 10s
    return () => clearInterval(interval);
  }, []);

  const loadMesTaches = async () => {
    try {
      const res = await tachesService.getMesTaches();
      const taches = res.data.data.taches || [];
      
      const enCours = taches.find((t: Tache) => t.statut === 'EN_COURS');
      const suivantes = taches
        .filter((t: Tache) => t.statut === 'ASSIGNEE' || t.statut === 'EN_ATTENTE')
        .sort((a: Tache, b: Tache) => a.priorite - b.priorite)
        .slice(0, 5);

      setTacheEnCours(enCours || null);
      setTachesSuivantes(suivantes);
      
      if (enCours) {
        setQuantiteSaisie(enCours.quantite_realisee || 0);
      }
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

  const handlePause = async (tacheId: number) => {
    try {
      await tachesService.pauseTache(tacheId);
      loadMesTaches();
    } catch (err) {
      alert('Erreur lors de la pause');
    }
  };

  const handleTerminer = async () => {
    if (!tacheEnCours) return;
    
    if (window.confirm(`Terminer la tâche ${tacheEnCours.numero_of} ?`)) {
      try {
        await tachesService.terminerTache(tacheEnCours.id_tache, {
          quantite_realisee: quantiteSaisie
        });
        loadMesTaches();
        setQuantiteSaisie(0);
      } catch (err) {
        alert('Erreur lors de la finalisation');
      }
    }
  };

  const handleSaisieQuantite = async (nouvelleQuantite: number) => {
    setQuantiteSaisie(nouvelleQuantite);
    // Optionnel: sauvegarder en temps réel
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
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Factory className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Poste Tissage</h1>
            <div className="text-sm opacity-90">
              {tacheEnCours?.numero_machine || 'Machine'} | 
              <span className={`ml-2 ${connected ? 'text-green-300' : 'text-red-300'}`}>
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
        {/* Tâche en cours */}
        {tacheEnCours ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🎯 Tâche en Cours</h2>
              {tacheEnCours.priorite === 1 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                  🔴 URGENTE
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">OF</div>
                <div className="text-xl font-semibold">{tacheEnCours.numero_of}</div>
              </div>

              {tacheEnCours.article_designation && (
                <div>
                  <div className="text-sm text-gray-600">Article</div>
                  <div className="text-lg">{tacheEnCours.article_designation}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600 mb-2">Progression</div>
                <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${(tacheEnCours.quantite_realisee / tacheEnCours.quantite_demandee) * 100}%` }}
                  >
                    {tacheEnCours.quantite_realisee}/{tacheEnCours.quantite_demandee} ({Math.round((tacheEnCours.quantite_realisee / tacheEnCours.quantite_demandee) * 100)}%)
                  </div>
                </div>
              </div>

              {tacheEnCours.instructions && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm font-semibold text-blue-800 mb-1">Instructions</div>
                  <div className="text-sm text-blue-700">{tacheEnCours.instructions}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantité réalisée</label>
                  <input
                    type="number"
                    value={quantiteSaisie}
                    onChange={(e) => handleSaisieQuantite(parseInt(e.target.value) || 0)}
                    min={0}
                    max={tacheEnCours.quantite_demandee}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-xl font-semibold text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantité demandée</label>
                  <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-xl font-semibold text-center">
                    {tacheEnCours.quantite_demandee}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => handlePause(tacheEnCours.id_tache)}
                  className="bg-yellow-500 text-white px-6 py-4 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  <Pause className="w-5 h-5" />
                  PAUSE
                </button>
                <button
                  onClick={handleTerminer}
                  className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  TERMINER
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-xl text-gray-600">Aucune tâche en cours</div>
            {tachesSuivantes.length > 0 && (
              <button
                onClick={() => handleDemarrer(tachesSuivantes[0].id_tache)}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Démarrer {tachesSuivantes[0].numero_of}
              </button>
            )}
          </div>
        )}

        {/* Prochaines tâches */}
        {tachesSuivantes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">📋 Mes Prochaines Tâches</h3>
            <div className="space-y-3">
              {tachesSuivantes.map((tache) => (
                <div
                  key={tache.id_tache}
                  className={`p-4 rounded-lg border-2 ${
                    tache.priorite === 1 ? 'border-red-300 bg-red-50' :
                    tache.priorite === 2 ? 'border-orange-300 bg-orange-50' :
                    'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{tache.numero_of}</div>
                      {tache.article_designation && (
                        <div className="text-sm text-gray-600">{tache.article_designation}</div>
                      )}
                      <div className="text-sm text-gray-500">Qté: {tache.quantite_demandee} pièces</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tache.priorite === 1 && <span className="text-red-600 font-semibold">🔴 Urgent</span>}
                      {tache.priorite === 2 && <span className="text-orange-600 font-semibold">🟡 Urgent</span>}
                      {tache.statut === 'ASSIGNEE' && (
                        <button
                          onClick={() => handleDemarrer(tache.id_tache)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Démarrer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {notifications.filter(n => n.type_notification === 'MESSAGE_RESPONSABLE').length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mt-6">
            <div className="font-semibold mb-2">💬 Message du responsable</div>
            {notifications
              .filter(n => n.type_notification === 'MESSAGE_RESPONSABLE')
              .slice(0, 1)
              .map((notif, idx) => (
                <div key={idx} className="text-sm">
                  <div className="font-medium">{notif.titre}</div>
                  <div className="text-gray-700">{notif.message}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabletteTisseur;
