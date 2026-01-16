import React, { useState, useEffect } from 'react';
import { tachesService, messagesService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { Factory, Users, CheckCircle, Clock, AlertCircle, Send, Bell } from 'lucide-react';

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of: string;
  type_tache: string;
  assigne_a_nom?: string;
  assigne_a_prenom?: string;
  assigne_a_poste?: string;
  statut: string;
  priorite: number;
  quantite_demandee?: number;
  quantite_realisee?: number;
}

interface Operateur {
  id: number;
  nom: string;
  prenom: string;
  poste_travail: string;
  machine_assignee?: string;
  statut: 'online' | 'offline' | 'pause';
  tache_en_cours?: string;
}

const ResponsableDashboard: React.FC = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageData, setMessageData] = useState({ destinataire_id: '', destinataire_poste: '', sujet: '', message: '' });
  const { socket, connected, notifications } = useWebSocket();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [tachesRes] = await Promise.all([
        tachesService.getTaches()
      ]);
      setTaches(tachesRes.data.data.taches || []);
      
      // Simuler opérateurs (à remplacer par vraie API)
      setOperateurs([
        { id: 1, nom: 'Ahmed', prenom: 'Ben Ali', poste_travail: 'TISSEUR', machine_assignee: 'M2301', statut: 'online', tache_en_cours: 'OF-001' },
        { id: 2, nom: 'Mohamed', prenom: 'Trabelsi', poste_travail: 'MAGASINIER_MP', statut: 'online', tache_en_cours: 'OF-002' },
        { id: 3, nom: 'Fatma', prenom: 'Khelifi', poste_travail: 'COUPEUR', statut: 'online' },
        { id: 4, nom: 'Ali', prenom: 'Mahjoub', poste_travail: 'TISSEUR', machine_assignee: 'M2305', statut: 'pause' },
        { id: 5, nom: 'Sami', prenom: 'Bouslama', poste_travail: 'CONTROLEUR_QUALITE', statut: 'offline' }
      ]);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigner = async (tacheId: number, assigne_a: number) => {
    try {
      await tachesService.assignerTache(tacheId, { assigne_a });
      loadData();
    } catch (err) {
      alert('Erreur lors de l\'assignation');
    }
  };

  const handleEnvoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await messagesService.envoyerMessage(messageData);
      setShowMessageForm(false);
      setMessageData({ destinataire_id: '', destinataire_poste: '', sujet: '', message: '' });
    } catch (err) {
      alert('Erreur lors de l\'envoi');
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: { [key: string]: { bg: string; text: string; icon: any } } = {
      'EN_COURS': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'ASSIGNEE': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'EN_ATTENTE': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      'EN_PAUSE': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      'TERMINEE': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };
    const badge = badges[statut] || badges['EN_ATTENTE'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statut.replace('_', ' ')}
      </span>
    );
  };

  const getPrioriteBadge = (priorite: number) => {
    if (priorite === 1) return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">🔴 Urgente</span>;
    if (priorite === 2) return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">🟡 Urgente</span>;
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">🟢 Normale</span>;
  };

  const tachesParPoste = {
    'MAGASINIER_MP': taches.filter(t => t.type_tache === 'PREPARATION_MP'),
    'TISSEUR': taches.filter(t => t.type_tache === 'TISSAGE'),
    'COUPEUR': taches.filter(t => t.type_tache === 'COUPE'),
    'CONTROLEUR_QUALITE': taches.filter(t => t.type_tache === 'CONTROLE_QUALITE')
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
              <Factory className="w-8 h-8" />
              Tableau de Bord Production
            </h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${connected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                {connected ? 'Connecté' : 'Déconnecté'}
              </div>
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques par poste */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Magasin MP</h3>
              </div>
              <div className="text-2xl font-bold">{tachesParPoste.MAGASINIER_MP.length} tâches</div>
              <div className="text-sm text-green-600">
                {tachesParPoste.MAGASINIER_MP.filter(t => t.statut === 'EN_COURS').length} actives
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Tissage</h3>
              </div>
              <div className="text-2xl font-bold">{tachesParPoste.TISSEUR.length} tâches</div>
              <div className="text-sm text-green-600">
                {tachesParPoste.TISSEUR.filter(t => t.statut === 'EN_COURS').length} actives
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Coupe</h3>
              </div>
              <div className="text-2xl font-bold">{tachesParPoste.COUPEUR.length} tâches</div>
              <div className="text-sm text-green-600">
                {tachesParPoste.COUPEUR.filter(t => t.statut === 'EN_COURS').length} actives
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Qualité</h3>
              </div>
              <div className="text-2xl font-bold">{tachesParPoste.CONTROLEUR_QUALITE.length} tâches</div>
              <div className="text-sm text-green-600">
                {tachesParPoste.CONTROLEUR_QUALITE.filter(t => t.statut === 'EN_COURS').length} actives
              </div>
            </div>
          </div>

          {/* Attribution des tâches */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Attribution des Tâches</h2>
              <button
                onClick={() => setShowMessageForm(!showMessageForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer Message
              </button>
            </div>

            {showMessageForm && (
              <form onSubmit={handleEnvoyerMessage} className="mb-4 p-4 bg-gray-50 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Destinataire (Poste)</label>
                    <select
                      value={messageData.destinataire_poste}
                      onChange={(e) => setMessageData({ ...messageData, destinataire_poste: e.target.value, destinataire_id: '' })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner un poste...</option>
                      <option value="MAGASINIER_MP">Magasinier MP</option>
                      <option value="TISSEUR">Tisseur</option>
                      <option value="COUPEUR">Coupeur</option>
                      <option value="CONTROLEUR_QUALITE">Contrôleur Qualité</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sujet</label>
                    <input
                      type="text"
                      value={messageData.sujet}
                      onChange={(e) => setMessageData({ ...messageData, sujet: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Sujet du message"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      value={messageData.message}
                      onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Envoyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMessageForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OF</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigné à</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progression</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taches.map((tache) => (
                    <tr key={tache.id_tache}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tache.numero_of}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{tache.type_tache}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tache.assigne_a_nom 
                          ? `${tache.assigne_a_nom} ${tache.assigne_a_prenom || ''}`.trim()
                          : <span className="text-gray-400">Non assigné</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatutBadge(tache.statut)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPrioriteBadge(tache.priorite)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tache.quantite_demandee && tache.quantite_realisee !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(tache.quantite_realisee / tache.quantite_demandee) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs">
                              {tache.quantite_realisee}/{tache.quantite_demandee}
                            </span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!tache.assigne_a_nom && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssigner(tache.id_tache, parseInt(e.target.value));
                              }
                            }}
                            className="text-xs border rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="">Assigner...</option>
                            {operateurs
                              .filter(op => {
                                if (tache.type_tache === 'TISSAGE') return op.poste_travail === 'TISSEUR';
                                if (tache.type_tache === 'PREPARATION_MP') return op.poste_travail === 'MAGASINIER_MP';
                                if (tache.type_tache === 'COUPE') return op.poste_travail === 'COUPEUR';
                                if (tache.type_tache === 'CONTROLE_QUALITE') return op.poste_travail === 'CONTROLEUR_QUALITE';
                                return true;
                              })
                              .map(op => (
                                <option key={op.id} value={op.id}>
                                  {op.prenom} {op.nom} {op.machine_assignee ? `(${op.machine_assignee})` : ''}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Opérateurs en ligne */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Opérateurs en Ligne
            </h2>
            <div className="space-y-2">
              {operateurs.map((op) => (
                <div
                  key={op.id}
                  className={`flex items-center justify-between p-3 rounded ${
                    op.statut === 'online' ? 'bg-green-50' :
                    op.statut === 'pause' ? 'bg-yellow-50' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      op.statut === 'online' ? 'bg-green-500' :
                      op.statut === 'pause' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {op.prenom} {op.nom}
                        {op.machine_assignee && <span className="text-gray-500"> ({op.machine_assignee})</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        {op.poste_travail.replace('_', ' ')}
                        {op.tache_en_cours && ` - ${op.tache_en_cours} en cours`}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {op.statut === 'online' ? '🟢 En ligne' :
                     op.statut === 'pause' ? '🟡 Pause' :
                     '🔴 Hors ligne'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsableDashboard;
