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
