/**
 * Email Service - Service d'envoi d'emails amélioré
 */

import nodemailer from 'nodemailer';
import { pool } from '../utils/db.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async getEmailConfig() {
    try {
      // Essayer de se connecter à la base de données, mais ne pas planter si elle n'est pas disponible
      const result = await pool.query(
        `SELECT key, value FROM ir_config_parameter 
         WHERE key LIKE 'email.%' OR key LIKE 'smtp.%'`
      ).catch((error) => {
        // Si la base de données n'est pas accessible, retourner un objet vide
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn('⚠️ Base de données non accessible pour la config email, utilisation des variables d\'environnement');
          return { rows: [] };
        }
        throw error;
      });
      
      const config = {};
      result.rows.forEach(row => {
        config[row.key.replace(/^(email|smtp)\./, '')] = row.value;
      });
      
      return config;
    } catch (error) {
      console.error('Erreur récupération config email:', error.message);
      // Retourner un objet vide pour utiliser les variables d'environnement
      return {};
    }
  }

  async init() {
    // Recharger la configuration depuis la base de données
    try {
      const config = await this.getEmailConfig();
      
      const smtpConfig = {
        host: config.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(config.smtp_port || process.env.SMTP_PORT || '587'),
        secure: config.smtp_ssl === 'true' || parseInt(config.smtp_port || process.env.SMTP_PORT || '587') === 465,
        tls: {
          rejectUnauthorized: false
        }
      };

      // Ajouter l'authentification seulement si les credentials sont disponibles
      const smtpUser = config.smtp_user || process.env.SMTP_USER;
      const smtpPass = config.smtp_pass || process.env.SMTP_PASS;
      
      if (smtpUser && smtpPass) {
        smtpConfig.auth = {
          user: smtpUser,
          pass: smtpPass
        };
      }

      this.transporter = nodemailer.createTransport(smtpConfig);

      // Tester la connexion seulement si les credentials sont disponibles
      if (smtpConfig.auth) {
        try {
          await this.transporter.verify();
        } catch (error) {
          console.warn('⚠️ Erreur vérification SMTP (non bloquant):', error.message);
        }
      }
      console.log('✅ Serveur email configuré et prêt');
    } catch (error) {
      console.warn('⚠️ Erreur configuration email:', error.message);
      // Utiliser la configuration par défaut seulement si les credentials sont disponibles
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (smtpUser && smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
      } else {
        console.warn('⚠️ Aucune configuration email disponible. Le service email est désactivé.');
        this.transporter = null;
      }
    }
  }

  getEmailTemplate(templateName, data = {}) {
    const templates = {
      default: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title || 'Notification'}</h1>
            </div>
            <div class="content">
              ${data.content || ''}
            </div>
            <div class="footer">
              <p>La Plume Artisanale ERP</p>
              <p>Cet email est automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      order: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Confirmation de Commande</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Votre commande a été confirmée avec succès.</p>
              <div class="order-info">
                <p><strong>Numéro de commande:</strong> ${data.order?.name || 'N/A'}</p>
                <p><strong>Date:</strong> ${data.order?.date_order ? new Date(data.order.date_order).toLocaleDateString('fr-FR') : 'N/A'}</p>
                <p><strong>Montant total:</strong> <strong style="font-size: 1.2em; color: #10B981;">${data.order?.amount_total || 0} €</strong></p>
              </div>
              ${data.order?.order_lines ? `
                <h3>Détails de la commande:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.order.order_lines.map(line => `
                      <tr>
                        <td>${line.product_name || 'N/A'}</td>
                        <td>${line.product_uom_qty || 0}</td>
                        <td>${line.price_unit || 0} €</td>
                        <td>${line.price_subtotal || 0} €</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
              <p>Merci de votre confiance !</p>
            </div>
            <div class="footer">
              <p>La Plume Artisanale ERP</p>
            </div>
          </div>
        </body>
        </html>
      `,
      task: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .task-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Notification de Tâche</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <div class="task-info">
                <p><strong>Tâche:</strong> ${data.task?.name || 'N/A'}</p>
                <p><strong>Statut:</strong> ${data.status === 'done' ? '✅ Terminée' : '📋 Assignée'}</p>
                ${data.task?.description ? `<p><strong>Description:</strong><br>${data.task.description}</p>` : ''}
                <p><strong>Date limite:</strong> ${data.task?.deadline ? new Date(data.task.deadline).toLocaleDateString('fr-FR') : 'Non définie'}</p>
              </div>
            </div>
            <div class="footer">
              <p>La Plume Artisanale ERP</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return templates[templateName] || templates.default;
  }

  async sendEmail(options) {
    try {
      const {
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments,
        template,
        templateData = {}
      } = options;

      // Utiliser un template si spécifié
      const emailHtml = template ? this.getEmailTemplate(template, templateData) : html;

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text: text || emailHtml.replace(/<[^>]*>/g, ''),
        html: emailHtml,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Logger l'envoi
      await this.logEmail({
        to,
        subject,
        message_id: info.messageId,
        status: 'sent'
      });

      console.log('✅ Email envoyé:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      
      // Logger l'erreur
      await this.logEmail({
        to: options.to,
        subject: options.subject,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  async logEmail(logData) {
    try {
      await pool.query(
        `INSERT INTO mail_log (recipient, subject, message_id, status, error, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          Array.isArray(logData.to) ? logData.to.join(', ') : logData.to,
          logData.subject,
          logData.message_id || null,
          logData.status,
          logData.error || null
        ]
      );
    } catch (error) {
      console.error('Erreur log email:', error);
    }
  }

  async sendTaskNotification(task, assignedTo, status) {
    const subject = `Tâche ${status === 'done' ? 'terminée' : 'assignée'}: ${task.name}`;
    
    return await this.sendEmail({
      to: assignedTo,
      subject,
      template: 'task',
      templateData: { task, status }
    });
  }

  async sendOrderConfirmation(order) {
    const subject = `Confirmation de commande ${order.name}`;
    
    return await this.sendEmail({
      to: order.partner_email,
      subject,
      template: 'order',
      templateData: { order }
    });
  }

  async sendInvoice(invoice) {
    const subject = `Facture ${invoice.name}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366F1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .invoice-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Nouvelle Facture</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Veuillez trouver ci-joint votre facture.</p>
            <div class="invoice-info">
              <p><strong>Numéro:</strong> ${invoice.name || 'N/A'}</p>
              <p><strong>Date:</strong> ${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
              <p><strong>Montant:</strong> <strong style="font-size: 1.2em; color: #6366F1;">${invoice.amount_total || 0} €</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>La Plume Artisanale ERP</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: invoice.partner_email,
      subject,
      html
    });
  }
}

export default new EmailService();

// ─── Named export: sendEmail (graceful degradation via env vars) ──────────
// Utilise un transporter lazy basé uniquement sur les variables d'environnement.
// Retourne { success:false, mocked:true, ... } si SMTP_HOST n'est pas configuré.

let _envTransporter = null;
let _envTransporterInit = false;

const _getEnvTransporter = () => {
  if (_envTransporterInit) return _envTransporter;
  _envTransporterInit = true;
  if (!process.env.SMTP_HOST) {
    _envTransporter = null;
    return null;
  }
  const auth = (process.env.SMTP_USER)
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS }
    : undefined;
  _envTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth,
    tls: { rejectUnauthorized: false },
  });
  return _envTransporter;
};

export const sendEmail = async ({ to, subject, html, text, from, attachments, cc, bcc } = {}) => {
  const tx = _getEnvTransporter();
  if (!tx) {
    return {
      success: false,
      mocked: true,
      message: 'SMTP non configuré — email loggé mais non envoyé',
      to,
      subject,
    };
  }
  try {
    const info = await tx.sendMail({
      from: from || process.env.SMTP_FROM || 'noreply@laplume-artisanale.tn',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      cc: Array.isArray(cc) ? cc.join(', ') : cc,
      bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc,
      attachments,
    });
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

