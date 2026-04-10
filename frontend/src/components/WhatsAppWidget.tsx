/**
 * WhatsAppWidget - Widget WhatsApp intégré pour chaque dashboard
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Phone, Loader2, Share2 } from 'lucide-react';
import { whatsappService } from '../services/api';
import { useApp } from '../store/AppContext';
import { useAuth } from '../hooks/useAuth';
import { notificationSound } from './NotificationSound';
import ScreenShare from './ScreenShare';

// Icône WhatsApp SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

interface WhatsAppWidgetProps {
  dashboardName: string;
  contactPhone?: string;
  defaultMessage?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  dashboardName,
  contactPhone,
  defaultMessage = 'Bonjour',
  position = 'bottom-right',
  className = ''
}) => {
  const { addNotification } = useApp();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [phone, setPhone] = useState(contactPhone || '');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'sent' | 'received', text: string, time: Date }>>([]);
  const [showScreenShare, setShowScreenShare] = useState(false);

  useEffect(() => {
    // Charger le numéro de téléphone depuis les paramètres du dashboard
    const loadDashboardContact = async () => {
      if (!contactPhone) {
        try {
          const response = await whatsappService.getDashboardContact(dashboardName);
          if (response.data?.contactPhone) {
            setPhone(response.data.contactPhone);
          }
        } catch (error) {
          console.error('Erreur chargement contact dashboard:', error);
        }
      } else {
        setPhone(contactPhone);
      }
    };
    
    loadDashboardContact();
  }, [contactPhone, dashboardName]);

  const handleSend = async () => {
    if (!message.trim() || !phone.trim()) {
      addNotification({
        id: `whatsapp-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez entrer un message et un numéro de téléphone',
        duration: 3000
      });
      return;
    }

    setSending(true);
    try {
      await whatsappService.sendFromDashboard(dashboardName, phone, message, {
        user: user?.email || `${user?.prenom || ''} ${user?.nom || ''}`.trim()
      });

      setMessages(prev => [...prev, {
        type: 'sent',
        text: message,
        time: new Date()
      }]);

      addNotification({
        id: `whatsapp-success-${Date.now()}`,
        type: 'success',
        title: 'Message envoyé',
        message: 'Le message WhatsApp a été envoyé avec succès',
        duration: 3000
      });

      // Jouer le son de notification
      notificationSound.play();

      setMessage(defaultMessage);
    } catch (error: any) {
      console.error('Erreur envoi WhatsApp:', error);
      addNotification({
        id: `whatsapp-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.error || 'Erreur lors de l\'envoi du message WhatsApp',
        duration: 5000
      });
    } finally {
      setSending(false);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Écouter les nouveaux messages (simulation - à adapter avec votre backend)
  useEffect(() => {
    // Simuler la réception d'un message (à remplacer par WebSocket ou polling)
    const handleNewMessage = () => {
      notificationSound.playWebNotification('Nouveau message WhatsApp', {
        body: `Vous avez reçu un nouveau message sur ${dashboardName}`,
        tag: `whatsapp-${dashboardName}`,
        requireInteraction: false,
      });
    };

    // Ici, vous pouvez écouter les événements de votre backend
    // window.addEventListener('whatsapp-message', handleNewMessage);
    
    // return () => {
    //   window.removeEventListener('whatsapp-message', handleNewMessage);
    // };
  }, [dashboardName]);

  if (!isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses[position]} z-50 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all hover:scale-110 ${className}`}
          title={`WhatsApp - ${dashboardName}`}
        >
          <WhatsAppIcon className="w-6 h-6" />
        </button>
        {showScreenShare && (
          <ScreenShare
            onClose={() => setShowScreenShare(false)}
            roomId={`formation-${dashboardName}-${Date.now()}`}
            userName={user?.prenom + ' ' + user?.nom}
          />
        )}
      </>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-80 bg-white rounded-lg shadow-2xl flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <WhatsAppIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">WhatsApp</h3>
            <p className="text-xs text-green-100">{dashboardName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScreenShare(true)}
            className="text-white hover:bg-green-700 rounded-full p-2 transition-colors"
            title="Partager l'écran pour formation"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-green-700 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-80">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <WhatsAppIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Aucun message</p>
            <p className="text-xs mt-1">Commencez une conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.type === 'sent'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Numéro de téléphone</label>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tapez votre message..."
            rows={2}
            className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || !phone.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Messages envoyés via WhatsApp Business API
        </p>
      </div>
      
      {/* Modal de partage d'écran */}
      {showScreenShare && (
        <ScreenShare
          onClose={() => setShowScreenShare(false)}
          roomId={`formation-${dashboardName}-${Date.now()}`}
          userName={user?.prenom + ' ' + user?.nom}
        />
      )}
    </div>
  );
};

export default WhatsAppWidget;
