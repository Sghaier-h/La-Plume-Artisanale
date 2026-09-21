import React, { useState, useEffect } from 'react';
import { tachesService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Scissors, Play, CheckCircle, Clock, Bell, Camera } from 'lucide-react';

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of: string;
  type_tache: string;
  statut: string;
  priorite: number;
  quantite_demandee: number;
  article_designation?: string;
}

const TabletteCoupeur: React.FC = () => {
  const [tachesEnAttente, setTachesEnAttente] = useState<Tache[]>([]);
  const [tachesPretes, setTachesPretes] = useState<Tache[]>([]);
  const [tacheEnCours, setTacheEnCours] = useState<Tache | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantiteSaisie, setQuantiteSaisie] = useState(0);
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
      
      const enCours = taches.find((t: Tache) => t.statut === 'EN_COURS');
      const pretes = taches.filter((t: Tache) => t.statut === 'ASSIGNEE' || t.statut === 'EN_ATTENTE');
      const enAttente: any[] = []; // Simuler OF en attente de tissage

      setTacheEnCours(enCours || null);
      setTachesPretes(pretes);
      setTachesEnAttente(enAttente);
      
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

  const handleTerminer = async () => {
    if (!tacheEnCours) return;
    
    if (window.confirm(`Terminer la coupe ${tacheEnCours.numero_of} ?`)) {
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

  const handleScannerOF = () => {
    // Simuler scan QR OF
    alert('OF scanné avec succès');
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
      <div className="bg-orange-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Scissors className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Poste Coupe</h1>
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
        {/* En attente de tissage */}
        {tachesEnAttente.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ⏳ En Attente de Tissage
            </h2>
            <div className="space-y-2">
              {tachesEnAttente.map((tache) => (
                <div key={tache.id_tache} className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{tache.numero_of} - Tissage en cours (85%)</div>
                  <div className="text-sm text-gray-600">Estimé disponible: ~30 min</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tâche en cours */}
        {tacheEnCours ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">✂️ Coupe en Cours</h2>
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
                <label className="block text-sm font-medium mb-2">Quantité coupée</label>
                <input
                  type="number"
                  value={quantiteSaisie}
                  onChange={(e) => setQuantiteSaisie(parseInt(e.target.value) || 0)}
                  min={0}
                  max={tacheEnCours.quantite_demandee}
                  className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-xl font-semibold text-center"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Demandée: {tacheEnCours.quantite_demandee} pièces
                </div>
              </div>
              <button
                onClick={handleTerminer}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 text-lg font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                TERMINER COUPE
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <div className="text-xl text-gray-600 mb-4">Aucune coupe en cours</div>
          </div>
        )}

        {/* Prêts à couper */}
        {tachesPretes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">✅ Prêts à Couper</h2>
            <div className="space-y-3">
              {tachesPretes.map((tache) => (
                <div
                  key={tache.id_tache}
                  className="p-4 rounded-lg border-2 border-green-300 bg-green-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">🟢 {tache.numero_of}</div>
                      {tache.article_designation && (
                        <div className="text-sm text-gray-600">{tache.article_designation}</div>
                      )}
                      <div className="text-sm text-gray-500">Quantité: {tache.quantite_demandee} pièces</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleScannerOF}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Scanner OF
                      </button>
                      <button
                        onClick={() => handleDemarrer(tache.id_tache)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Démarrer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">📊 Aujourd'hui</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Pièces coupées</div>
              <div className="text-2xl font-bold text-green-600">120</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Rebut</div>
              <div className="text-2xl font-bold text-red-600">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletteCoupeur;
