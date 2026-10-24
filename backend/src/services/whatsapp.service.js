/**
 * WhatsApp Service - Service d'envoi de messages WhatsApp
 */

import axios from 'axios';

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1';
    this.apiKey = process.env.WHATSAPP_API_KEY;
  }

  async sendMessage(phoneNumber, message, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('WhatsApp API Key not configured');
      }

      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          to: phoneNumber.replace(/\D/g, ''), // Nettoyer le numéro
          message: message,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Message WhatsApp envoyé:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      throw error;
    }
  }

  async sendTemplateMessage(phoneNumber, templateName, parameters = []) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages/template`,
        {
          to: phoneNumber.replace(/\D/g, ''),
          template: templateName,
          parameters: parameters
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur envoi template WhatsApp:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(phoneNumber, order) {
    const message = `✅ Commande confirmée\n\n` +
      `Numéro: ${order.name}\n` +
      `Date: ${new Date(order.date_order).toLocaleDateString('fr-FR')}\n` +
      `Montant: ${order.amount_total} €\n\n` +
      `Merci de votre confiance !`;

    return await this.sendMessage(phoneNumber, message);
  }

  async sendTaskNotification(phoneNumber, task, status) {
    const message = status === 'done'
      ? `✅ Tâche terminée: ${task.name}\n${task.description || ''}`
      : `📋 Nouvelle tâche assignée: ${task.name}\n${task.description || ''}\nÉchéance: ${task.deadline ? new Date(task.deadline).toLocaleDateString('fr-FR') : 'Non définie'}`;

    return await this.sendMessage(phoneNumber, message);
  }
}

export default new WhatsAppService();

// ─── Named export: sendWhatsapp (WhatsApp Business Cloud API) ─────────────
// Graceful degradation : si WHATSAPP_API_URL ou WHATSAPP_TOKEN absent → { mocked:true }.
export const sendWhatsapp = async ({ to, message, templateName, languageCode = 'fr' } = {}) => {
  const API_URL = process.env.WHATSAPP_API_URL;
  const TOKEN = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY;
  if (!API_URL || !TOKEN) {
    return {
      success: false,
      mocked: true,
      message: 'WhatsApp API non configurée — message loggé mais non envoyé',
      to,
      body: message,
    };
  }
  try {
    const payload = templateName
      ? {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: { name: templateName, language: { code: languageCode } },
        }
      : {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        };
    const r = await axios.post(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return {
      success: true,
      messageId: r.data?.messages?.[0]?.id,
      response: r.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
};

