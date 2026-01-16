import React, { useState, useEffect } from 'react';
import { tachesService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Package, CheckCircle, Camera, Bell, AlertCircle } from 'lucide-react';

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of: string;
  type_tache: string;
  statut: string;
  priorite: number;
  article_designation?: string;
  instructions?: string;
}

interface MatierePremiere {
  selecteur: string;
  designation: string;
  quantite_kg: number;
  entrepot: string;
  scanne: boolean;
}

const TabletteMagasinier: React.FC = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [tacheSelectionnee, setTacheSelectionnee] = useState<Tache | null>(null);
  const [matieresPremieres, setMatieresPremieres] = useState<MatierePremiere[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, connected, notifications } = useWebSocket();

  useEffect(() => {
    loadMesTaches();
    const interval = setInterval(loadMesTaches, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tacheSelectionnee) {
      loadMatieresPremieres(tacheSelectionnee.id_of);
    }
  }, [tacheSelectionnee]);

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

  const loadMatieresPremieres = async (ofId: number) => {
    // Simuler données MP (à remplacer par vraie API)
    setMatieresPremieres([
      { selecteur: 'S01', designation: 'FIL-BL-2/28 (Blanc)', quantite_kg: 15, entrepot: 'E1', scanne: true },
      { selecteur: 'S02', designation: 'FIL-EC-2/28 (Écru)', quantite_kg: 8, entrepot: 'E2', scanne: false },
      { selecteur: 'S03', designation: 'FIL-BL-2/28 (Blanc)', quantite_kg: 5, entrepot: 'E1', scanne: false },
      { selecteur: 'CHAI', designation: 'FIL-EC-2/30 (Écru)', quantite_kg: 25, entrepot: 'E1', scanne: true }
    ]);
  };

  const handleScanner = (selecteur: string) => {
    // Simuler scan QR
    setMatieresPremieres(prev => prev.map(mp => 
      mp.selecteur === selecteur ? { ...mp, scanne: true } : mp
    ));
  };

  const handleValiderPreparation = async () => {
    if (!tacheSelectionnee) return;
    
    const toutesScannees = matieresPremieres.every(mp => mp.scanne);
    if (!toutesScannees) {
      alert('Veuillez scanner toutes les matières premières');
      return;
    }

    try {
      await tachesService.terminerTache(tacheSelectionnee.id_tache);
      loadMesTaches();
      setTacheSelectionnee(null);
      setMatieresPremieres([]);
    } catch (err) {
      alert('Erreur lors de la validation');
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
      <div className="bg-green-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Poste Magasin MP</h1>
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
        <h2 className="text-2xl font-bold mb-4">🎯 Mes Préparations à Faire</h2>

        <div className="space-y-4 mb-6">
          {taches.map((tache) => (
            <div
              key={tache.id_tache}
              className={`bg-white rounded-lg shadow-lg p-4 border-2 ${
                tache.priorite === 1 ? 'border-red-400 bg-red-50' :
                tache.priorite === 2 ? 'border-orange-400 bg-orange-50' :
                'border-blue-400 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  {tache.priorite === 1 && <span className="text-red-600 font-bold text-lg mr-2">🔴 URGENT</span>}
                  {tache.priorite === 2 && <span className="text-orange-600 font-bold text-lg mr-2">🟡 URGENT</span>}
                  <span className="font-bold text-lg">{tache.numero_of}</span>
                </div>
                {tache.statut === 'ASSIGNEE' && (
                  <button
                    onClick={() => handleDemarrer(tache.id_tache)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Démarrer
                  </button>
                )}
              </div>

              {tache.article_designation && (
                <div className="text-gray-700 mb-2">Article: {tache.article_designation}</div>
              )}

              {tache.statut === 'EN_COURS' && (
                <button
                  onClick={() => setTacheSelectionnee(tache)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Voir détails préparation
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Détails préparation */}
        {tacheSelectionnee && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {tacheSelectionnee.priorite === 1 && '🔴 URGENT - '}
                {tacheSelectionnee.priorite === 2 && '🟡 URGENT - '}
                OF {tacheSelectionnee.numero_of}
              </h3>
              <button
                onClick={() => setTacheSelectionnee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {tacheSelectionnee.article_designation && (
              <div className="mb-4">
                <div className="text-sm text-gray-600">Article</div>
                <div className="text-lg font-semibold">{tacheSelectionnee.article_designation}</div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Matières à préparer:</h4>
              <div className="space-y-2">
                {matieresPremieres.map((mp) => (
                  <div
                    key={mp.selecteur}
                    className={`p-3 rounded border-2 ${
                      mp.scanne ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {mp.selecteur}: {mp.designation}
                        </div>
                        <div className="text-sm text-gray-600">
                          {mp.quantite_kg} kg | Entrepôt: {mp.entrepot}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {mp.scanne ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <button
                            onClick={() => handleScanner(mp.selecteur)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Scanner QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {matieresPremieres.every(mp => mp.scanne) && (
              <button
                onClick={handleValiderPreparation}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 text-lg font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                VALIDER PRÉPARATION
              </button>
            )}
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

export default TabletteMagasinier;
