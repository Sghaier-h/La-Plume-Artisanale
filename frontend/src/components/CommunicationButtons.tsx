/**
 * CommunicationButtons - Composant pour envoyer emails et WhatsApp
 */

import React, { useState } from 'react';
import { Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../store/AppContext';

interface CommunicationButtonsProps {
  recipient?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: 'order' | 'invoice' | 'task' | 'custom';
  data?: any;
  onSent?: () => void;
  className?: string;
}

const CommunicationButtons: React.FC<CommunicationButtonsProps> = ({
  recipient,
  recipientEmail,
  recipientPhone,
  type,
  data,
  onSent,
  className = ''
}) => {
  const { addNotification } = useApp();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const handleSendEmail = async () => {
    if (!recipientEmail && !recipient) {
      addNotification({
        id: `email-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: 'Aucune adresse email disponible',
        duration: 3000,
      });
      return;
    }

    setSendingEmail(true);
    try {
      const email = recipientEmail || recipient;
      
      let endpoint = '/email/send';
      let payload: any = { to: email };

      switch (type) {
        case 'order':
          endpoint = '/email/order-confirmation';
          payload = { order: data };
          break;
        case 'invoice':
          payload = {
            to: email,
            subject: `Facture ${data?.name || ''}`,
            template: 'invoice',
            templateData: { invoice: data }
          };
          break;
        case 'task':
          endpoint = '/email/task-notification';
          payload = {
            task: data.task,
            assignedTo: email,
            status: data.status || 'assigned'
          };
          break;
        default:
          payload = {
            to: email,
            subject: data?.subject || 'Notification',
            html: data?.html || '',
            template: data?.template,
            templateData: data?.templateData
          };
      }

      await api.post(endpoint, payload);
      
      addNotification({
        id: `email-success-${Date.now()}`,
        type: 'success',
        title: 'Email envoyé',
        message: 'L\'email a été envoyé avec succès',
        duration: 3000,
      });

      if (onSent) onSent();
    } catch (error: any) {
      console.error('Erreur envoi email:', error);
      addNotification({
        id: `email-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.error || 'Erreur lors de l\'envoi de l\'email',
        duration: 5000,
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!recipientPhone && !recipient) {
      addNotification({
        id: `whatsapp-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: 'Aucun numéro de téléphone disponible',
        duration: 3000,
      });
      return;
    }

    setSendingWhatsApp(true);
    try {
      const phone = recipientPhone || recipient;

      let endpoint = '/whatsapp/send';
      let payload: any = { phoneNumber: phone };

      switch (type) {
        case 'order':
          endpoint = '/whatsapp/order-confirmation';
          payload = { phoneNumber: phone, order: data };
          break;
        case 'task':
          endpoint = '/whatsapp/task-notification';
          payload = {
            phoneNumber: phone,
            task: data.task,
            status: data.status || 'assigned'
          };
          break;
        default:
          payload = {
            phoneNumber: phone,
            message: data?.message || 'Notification'
          };
      }

      await api.post(endpoint, payload);
      
      addNotification({
        id: `whatsapp-success-${Date.now()}`,
        type: 'success',
        title: 'Message WhatsApp envoyé',
        message: 'Le message a été envoyé avec succès',
        duration: 3000,
      });

      if (onSent) onSent();
    } catch (error: any) {
      console.error('Erreur envoi WhatsApp:', error);
      addNotification({
        id: `whatsapp-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.error || 'Erreur lors de l\'envoi du message WhatsApp',
        duration: 5000,
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const hasEmail = !!(recipientEmail || recipient);
  const hasPhone = !!(recipientPhone || recipient);

  // Toujours afficher les boutons même si les infos ne sont pas disponibles
  // L'utilisateur pourra les remplir manuellement
  // if (!hasEmail && !hasPhone) {
  //   return null;
  // }

  return (
    <div className={`flex gap-2 ${className}`}>
      {hasEmail && (
        <button
          onClick={handleSendEmail}
          disabled={sendingEmail}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Envoyer par email"
        >
          {sendingEmail ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          <span className="text-sm">Email</span>
        </button>
      )}
      
      {hasPhone && (
        <button
          onClick={handleSendWhatsApp}
          disabled={sendingWhatsApp}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Envoyer par WhatsApp"
        >
          {sendingWhatsApp ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MessageCircle className="w-4 h-4" />
          )}
          <span className="text-sm">WhatsApp</span>
        </button>
      )}
    </div>
  );
};

export default CommunicationButtons;
