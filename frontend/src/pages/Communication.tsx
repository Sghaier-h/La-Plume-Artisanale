import React, { useState, useEffect } from 'react';
import { communicationService } from '../services/api';
import { MessageSquare, Send, Mail, Phone, PlusCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const Communication: React.FC = () => {
  const [canaux, setCanaux] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'conversations'>('messages');
  const [selectedCanal, setSelectedCanal] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [canauxRes, messagesRes, templatesRes, conversationsRes] = await Promise.all([
        communicationService.getCanaux(),
        communicationService.getMessages(),
        communicationService.getTemplates(),
        communicationService.getConversations()
      ]);

      setCanaux(canauxRes.data.data || []);
      setMessages(messagesRes.data.data.messages || []);
      setTemplates(templatesRes.data.data || []);
      setConversations(conversationsRes.data.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ENVOYE': return <Send className="w-4 h-4 text-blue-600" />;
      case 'DELIVRE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'LU': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'EN_ATTENTE': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'ERREUR': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCanalIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'EMAIL': return <Mail className="w-5 h-5 text-blue-600" />;
      case 'SMS': return <Phone className="w-5 h-5 text-purple-600" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
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
            Communication Externe
          </h1>
          <button
            onClick={() => {/* TODO: Modal envoi message */}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Envoyer Message
          </button>
        </div>

        {/* Canaux disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {canaux.map((canal: any) => (
            <div
              key={canal.id_canal}
              className={`bg-white rounded-lg shadow-lg p-4 border-2 ${
                selectedCanal === canal.id_canal ? 'border-blue-600' : 'border-gray-200'
              } cursor-pointer hover:border-blue-400`}
              onClick={() => setSelectedCanal(canal.id_canal)}
            >
              <div className="flex items-center gap-3">
                {getCanalIcon(canal.type_canal)}
                <div>
                  <div className="font-semibold">{canal.libelle}</div>
                  <div className="text-sm text-gray-500">{canal.type_canal}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'messages'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'templates'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'conversations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Conversations ({conversations.length})
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sujet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message: any) => (
                  <tr key={message.id_message}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getCanalIcon(message.type_canal)}
                        <span className="text-sm">{message.canal_libelle || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {message.destinataire}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {message.type_message}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {message.sujet || message.message_text?.substring(0, 50) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {message.date_envoi ? new Date(message.date_envoi).toLocaleString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatutIcon(message.statut)}
                        <span className="text-xs">{message.statut}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template: any) => (
              <div key={template.id_template} className="bg-white rounded-lg shadow-lg p-4">
                <div className="font-semibold mb-2">{template.libelle}</div>
                <div className="text-sm text-gray-600 mb-2">{template.type_message}</div>
                <div className="text-xs text-gray-500 mb-3">
                  {template.message_template?.substring(0, 100)}...
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-800">
                  Utiliser ce template
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-4">
            {conversations.map((conv: any) => (
              <div key={conv.id_conversation} className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{conv.numero_whatsapp || conv.email || 'Contact'}</div>
                    <div className="text-sm text-gray-500">
                      {conv.nb_messages || 0} messages
                    </div>
                    <div className="text-xs text-gray-400">
                      Dernier message: {conv.date_dernier_message ? new Date(conv.date_dernier_message).toLocaleString('fr-FR') : 'Jamais'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    conv.statut === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {conv.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
