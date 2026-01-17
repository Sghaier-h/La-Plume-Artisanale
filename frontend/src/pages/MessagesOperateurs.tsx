import React, { useState, useEffect } from 'react';
import { messagesService, notificationsService, utilisateursService } from '../services/api';
import { 
  MessageSquare, Send, AlertTriangle, Bell, UserPlus, Users, 
  Filter, Search, X, Eye, CheckCircle, Clock, User, FileText,
  ArrowRight, Plus
} from 'lucide-react';

const MessagesOperateurs: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'urgent'>('messages');
  const [showFormMessage, setShowFormMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filterStatut, setFilterStatut] = useState<string>('tous'); // 'tous' | 'non_lus' | 'lus'
  const [filterUrgent, setFilterUrgent] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    destinataire_id: '',
    destinataire_poste: '',
    sujet: '',
    message: '',
    id_of: null as number | null,
    urgent: false
  });

  useEffect(() => {
    loadData();
    // Polling pour les nouveaux messages toutes les 5 secondes
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [activeTab, filterStatut]);

  const loadData = async () => {
    try {
      setLoading(true);
      const promises: Promise<any>[] = [];

      if (activeTab === 'messages') {
        const params: any = {};
        if (filterStatut === 'non_lus') params.lu = 'false';
        if (filterStatut === 'lus') params.lu = 'true';
        promises.push(messagesService.getMessages(params));
      } else if (activeTab === 'notifications') {
        promises.push(notificationsService.getNotifications());
      }

      promises.push(utilisateursService.getUtilisateurs());

      const [messagesRes, utilisateursRes] = await Promise.all(promises);

      if (activeTab === 'messages') {
        setMessages(messagesRes.data?.data?.messages || []);
      } else if (activeTab === 'notifications') {
        setNotifications(messagesRes.data?.data?.notifications || []);
      }

      setUtilisateurs(utilisateursRes.data?.data?.utilisateurs || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnvoyerMessage = async () => {
    try {
      if (!formData.sujet || !formData.message) {
        alert('Veuillez remplir le sujet et le message');
        return;
      }

      await messagesService.envoyerMessage(formData);
      alert('Message envoyé avec succès');
      setShowFormMessage(false);
      setFormData({
        destinataire_id: '',
        destinataire_poste: '',
        sujet: '',
        message: '',
        id_of: null,
        urgent: false
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'envoi');
    }
  };

  const handleMarquerLu = async (id: number) => {
    try {
      await messagesService.marquerMessageLu(id);
      loadData();
    } catch (error) {
      console.error('Erreur marquer comme lu:', error);
    }
  };

  const handleMarquerNotificationLue = async (id: number) => {
    try {
      await notificationsService.marquerLue(id);
      loadData();
    } catch (error) {
      console.error('Erreur marquer notification comme lue:', error);
    }
  };

  const getPrioriteColor = (priorite: number) => {
    if (priorite === 1) return 'bg-red-100 text-red-800 border-red-500';
    if (priorite === 2) return 'bg-orange-100 text-orange-800 border-orange-500';
    return 'bg-blue-100 text-blue-800 border-blue-500';
  };

  const messagesFiltres = messages.filter(msg => {
    if (searchTerm && !msg.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !msg.message?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterUrgent && !msg.urgent) {
      return false;
    }
    return true;
  });

  const notificationsUrgentes = notifications.filter(notif => notif.priorite === 1 && !notif.lue);
  const notificationsFiltrees = activeTab === 'urgent' 
    ? notificationsUrgentes
    : notifications.filter(notif => {
        if (searchTerm && !notif.titre?.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !notif.message?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      });

  if (loading && messages.length === 0 && notifications.length === 0) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Communication Opérateurs
          </h1>
          <button
            onClick={() => setShowFormMessage(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Message
          </button>
        </div>

        {/* Indicateur messages urgents */}
        {notificationsUrgentes.length > 0 && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-bold text-red-800">
                  {notificationsUrgentes.length} {notificationsUrgentes.length === 1 ? 'alerte urgente' : 'alertes urgentes'} non lue(s)
                </p>
                <p className="text-sm text-red-600">Cliquez sur l'onglet "Alertes Urgentes" pour les consulter</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages ({messagesFiltres.length})
            {messages.filter((m: any) => !m.lu).length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {messages.filter((m: any) => !m.lu).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications ({notificationsFiltrees.length})
            {notifications.filter((n: any) => !n.lue).length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {notifications.filter((n: any) => !n.lue).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('urgent')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'urgent'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Alertes Urgentes
            {notificationsUrgentes.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
                {notificationsUrgentes.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {activeTab === 'messages' && (
            <>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous les messages</option>
                <option value="non_lus">Non lus</option>
                <option value="lus">Lus</option>
              </select>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={filterUrgent}
                  onChange={(e) => setFilterUrgent(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Urgent uniquement</span>
              </label>
            </>
          )}
        </div>

        {/* Contenu Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {messagesFiltres.map((msg: any) => (
              <div
                key={msg.id_message}
                className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
                  !msg.lu ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${msg.urgent ? 'border-red-500 bg-red-50' : ''} cursor-pointer hover:shadow-xl transition-shadow`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{msg.sujet}</h3>
                      {msg.urgent && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          URGENT
                        </span>
                      )}
                      {!msg.lu && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Nouveau</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {msg.expediteur_nom || msg.expediteur_prenom ? 
                          `${msg.expediteur_nom || ''} ${msg.expediteur_prenom || ''}`.trim() : 
                          'Expéditeur inconnu'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {msg.created_at ? new Date(msg.created_at).toLocaleString('fr-FR') : 'N/A'}
                      </span>
                      {msg.destinataire_poste && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Poste: {msg.destinataire_poste}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{msg.message}</p>
                    {msg.id_of && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Lié à OF #{msg.id_of}
                      </div>
                    )}
                  </div>
                  {!msg.lu && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarquerLu(msg.id_message);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {messagesFiltres.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Aucun message trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Contenu Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notificationsFiltrees.map((notif: any) => (
              <div
                key={notif.id_notification}
                className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
                  notif.priorite === 1 ? 'border-red-500' : 
                  notif.priorite === 2 ? 'border-orange-500' : 
                  'border-blue-500'
                } ${!notif.lue ? 'bg-blue-50' : ''} cursor-pointer hover:shadow-xl transition-shadow`}
                onClick={() => !notif.lue && handleMarquerNotificationLue(notif.id_notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{notif.titre}</h3>
                      <span className={`px-2 py-1 rounded text-xs border ${getPrioriteColor(notif.priorite)}`}>
                        {notif.priorite === 1 ? 'URGENT' : notif.priorite === 2 ? 'IMPORTANT' : 'INFO'}
                      </span>
                      {!notif.lue && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Non lu</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{notif.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {notif.created_at ? new Date(notif.created_at).toLocaleString('fr-FR') : 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Type: {notif.type_notification}
                      </span>
                    </div>
                  </div>
                  {!notif.lue && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarquerNotificationLue(notif.id_notification);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notificationsFiltrees.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Aucune notification trouvée</p>
              </div>
            )}
          </div>
        )}

        {/* Contenu Alertes Urgentes */}
        {activeTab === 'urgent' && (
          <div className="space-y-4">
            {notificationsUrgentes.map((notif: any) => (
              <div
                key={notif.id_notification}
                className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <h3 className="font-bold text-lg text-red-800">{notif.titre}</h3>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">URGENT</span>
                    </div>
                    <p className="text-gray-800 mb-2">{notif.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {notif.created_at ? new Date(notif.created_at).toLocaleString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarquerNotificationLue(notif.id_notification)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer comme lu
                  </button>
                </div>
              </div>
            ))}
            {notificationsUrgentes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Aucune alerte urgente</p>
              </div>
            )}
          </div>
        )}

        {/* Modal création message */}
        {showFormMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Nouveau Message</h3>
                <button
                  onClick={() => setShowFormMessage(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataire (utilisateur)
                  </label>
                  <select
                    value={formData.destinataire_id}
                    onChange={(e) => setFormData({ ...formData, destinataire_id: e.target.value, destinataire_poste: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {utilisateurs.map((u: any) => (
                      <option key={u.id_utilisateur} value={u.id_utilisateur}>
                        {u.nom_utilisateur || u.email} ({u.role || 'USER'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center text-gray-500">OU</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataire (poste de travail)
                  </label>
                  <select
                    value={formData.destinataire_poste}
                    onChange={(e) => setFormData({ ...formData, destinataire_poste: e.target.value, destinataire_id: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un poste</option>
                    <option value="TISSEUR">Tisseur</option>
                    <option value="MAGASINIER">Magasinier</option>
                    <option value="COUPEUR">Coupeur</option>
                    <option value="MECANICIEN">Mécanicien</option>
                    <option value="CHEF_ATELIER">Chef d'Atelier</option>
                    <option value="CHEF_PRODUCTION">Chef Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    value={formData.sujet}
                    onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Message urgent
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    onClick={() => setShowFormMessage(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEnvoyerMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal consultation message */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Détails du Message</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <p className="text-lg font-semibold">{selectedMessage.sujet}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expéditeur</label>
                  <p className="text-gray-900">
                    {selectedMessage.expediteur_nom || selectedMessage.expediteur_prenom ? 
                      `${selectedMessage.expediteur_nom || ''} ${selectedMessage.expediteur_prenom || ''}`.trim() : 
                      'Expéditeur inconnu'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">
                    {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString('fr-FR') : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {selectedMessage.id_of && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lié à</label>
                    <p className="text-blue-600">OF #{selectedMessage.id_of}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4 border-t">
                  {!selectedMessage.lu && (
                    <button
                      onClick={() => {
                        handleMarquerLu(selectedMessage.id_message);
                        setSelectedMessage({ ...selectedMessage, lu: true });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesOperateurs;
