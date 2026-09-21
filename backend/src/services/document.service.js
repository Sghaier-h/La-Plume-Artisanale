/**
 * Document Service - Service de formatage de documents
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class DocumentService {
  generateInvoicePDF(invoice, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // En-tête
        doc.fontSize(20).text('FACTURE', { align: 'center' });
        doc.moveDown();

        // Informations société
        doc.fontSize(12).text('La Plume Artisanale', { align: 'left' });
        doc.text('ERP Management System');
        doc.moveDown();

        // Informations facture
        doc.text(`Numéro: ${invoice.name || invoice.id_facture}`);
        doc.text(`Date: ${new Date(invoice.date_invoice || invoice.date).toLocaleDateString('fr-FR')}`);
        doc.text(`Client: ${invoice.partner_name || invoice.client_name}`);
        doc.moveDown();

        // Lignes de facture
        doc.fontSize(14).text('Articles', { underline: true });
        doc.moveDown();

        let total = 0;
        (invoice.invoice_line_ids || invoice.lignes || []).forEach(line => {
          const lineTotal = line.price_unit * line.quantity;
          total += lineTotal;
          doc.fontSize(10)
            .text(`${line.product_name || line.name}`, { continued: true })
            .text(`Qté: ${line.quantity}`, { align: 'center', continued: true })
            .text(`PU: ${line.price_unit} €`, { align: 'right', continued: true })
            .text(`Total: ${lineTotal} €`, { align: 'right' });
          doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total: ${total} €`, { align: 'right' });

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  generateOrderPDF(order, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // En-tête
        doc.fontSize(20).text('BON DE COMMANDE', { align: 'center' });
        doc.moveDown();

        // Informations
        doc.fontSize(12).text(`Numéro: ${order.name || order.id_commande}`);
        doc.text(`Date: ${new Date(order.date_order).toLocaleDateString('fr-FR')}`);
        doc.text(`Client: ${order.partner_name || order.client_name}`);
        doc.moveDown();

        // Lignes
        doc.fontSize(14).text('Articles', { underline: true });
        doc.moveDown();

        (order.order_line || order.lignes || []).forEach(line => {
          doc.fontSize(10)
            .text(`${line.product_name || line.name} - Qté: ${line.product_uom_qty || line.quantity}`);
          doc.moveDown(0.5);
        });

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new DocumentService();
