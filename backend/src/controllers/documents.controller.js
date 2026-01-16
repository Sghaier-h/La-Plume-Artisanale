import { pool } from '../utils/db.js';
import { PDFDocument } from 'pdf-lib';
import ExcelJS from 'exceljs';

// GET /api/documents/of/:id/dossier-fabrication - Générer le dossier fabrication PDF
export const genererDossierFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          message: 'Dossier fabrication généré (mode mock)',
          url: '/documents/mock-dossier-fabrication.pdf'
        }
      });
    }

    // Récupérer les données de l'OF
    const ofResult = await pool.query(`
      SELECT 
        of.*,
        a.designation as article_designation,
        a.code_article,
        c.numero_commande,
        cl.raison_sociale as client_nom
      FROM ordres_fabrication of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      LEFT JOIN articles_commande ac ON of.id_article_commande = ac.id_article_commande
      LEFT JOIN commandes c ON ac.id_commande = c.id_commande
      LEFT JOIN clients cl ON c.id_client = cl.id_client
      WHERE of.id_of = $1
    `, [id]);

    if (ofResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    const of = ofResult.rows[0];

    // Récupérer la configuration sélecteurs
    const selecteursResult = await pool.query(`
      SELECT 
        cso.position,
        mp.code_mp, mp.designation,
        cso.quantite_kg
      FROM config_of_selecteurs cso
      LEFT JOIN matieres_premieres mp ON cso.id_mp = mp.id_mp
      WHERE cso.id_of = $1
      ORDER BY cso.position
    `, [id]);

    // Générer le PDF avec pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { height } = page.getSize();
    
    // Utiliser les fonts standard de pdf-lib
    const helveticaFont = await pdfDoc.embedFont('Helvetica-Bold');
    const helveticaNormal = await pdfDoc.embedFont('Helvetica');
    
    let yPosition = height - 50;
    
    // En-tête
    page.drawText('DOSSIER DE FABRICATION', {
      x: 50,
      y: yPosition,
      size: 20,
      font: helveticaFont,
    });
    
    yPosition -= 30;
    page.drawText(`OF: ${of.numero_of}`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaFont,
    });
    
    yPosition -= 40;
    page.drawText(`Article: ${of.article_designation || of.code_article}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaNormal,
    });
    
    yPosition -= 20;
    page.drawText(`Quantité: ${of.quantite_a_produire}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaNormal,
    });
    
    yPosition -= 20;
    page.drawText(`Client: ${of.client_nom || '-'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaNormal,
    });
    
    yPosition -= 40;
    page.drawText('CONFIGURATION SÉLECTEURS:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaFont,
    });
    
    yPosition -= 20;
    let currentPage = page;
    selecteursResult.rows.forEach((sel) => {
      if (yPosition < 50) {
        // Nouvelle page si nécessaire
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = currentPage.getSize().height - 50;
      }
      currentPage.drawText(`Sélecteur ${sel.position}: ${sel.code_mp} - ${sel.designation} (${sel.quantite_kg} kg)`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: helveticaNormal,
      });
      yPosition -= 15;
    });
    
    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dossier-fabrication-${of.numero_of}.pdf"`);
    res.send(Buffer.from(pdfBytes));

    // En-tête
    doc.fontSize(20).text('DOSSIER DE FABRICATION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`OF: ${of.numero_of}`, { align: 'center' });
    doc.moveDown(2);

    // Informations OF
    doc.fontSize(12);
    doc.text(`Article: ${of.article_designation || of.code_article}`, 50, doc.y);
    doc.text(`Quantité: ${of.quantite_a_produire}`, 50, doc.y + 20);
    doc.text(`Client: ${of.client_nom || '-'}`, 50, doc.y + 20);
    doc.moveDown(2);

    // Sélecteurs
    doc.fontSize(14).text('CONFIGURATION SÉLECTEURS:', 50, doc.y);
    doc.moveDown();
    doc.fontSize(10);
    selecteursResult.rows.forEach((sel, index) => {
      doc.text(`Sélecteur ${sel.position}: ${sel.code_mp} - ${sel.designation} (${sel.quantite_kg} kg)`, 70, doc.y);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Erreur genererDossierFabrication:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/documents/export/excel - Export Excel des données
export const exportExcel = async (req, res) => {
  try {
    const { type, params } = req.query; // type: 'of', 'commandes', 'production', etc.

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          message: 'Export Excel généré (mode mock)',
          url: '/documents/mock-export.xlsx'
        }
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    // Selon le type, récupérer les données
    let data = [];
    let columns = [];

    if (type === 'of') {
      const result = await pool.query(`
        SELECT 
          of.numero_of,
          a.designation as article,
          of.quantite_a_produire,
          of.statut,
          of.date_creation_of
        FROM ordres_fabrication of
        LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
        ORDER BY of.date_creation_of DESC
        LIMIT 1000
      `);
      data = result.rows;
      columns = [
        { header: 'N° OF', key: 'numero_of', width: 15 },
        { header: 'Article', key: 'article', width: 30 },
        { header: 'Quantité', key: 'quantite_a_produire', width: 12 },
        { header: 'Statut', key: 'statut', width: 15 },
        { header: 'Date', key: 'date_creation_of', width: 15 }
      ];
    } else if (type === 'commandes') {
      const result = await pool.query(`
        SELECT 
          c.numero_commande,
          cl.raison_sociale as client,
          c.montant_total,
          c.statut,
          c.date_commande
        FROM commandes c
        LEFT JOIN clients cl ON c.id_client = cl.id_client
        ORDER BY c.date_commande DESC
        LIMIT 1000
      `);
      data = result.rows;
      columns = [
        { header: 'N° Commande', key: 'numero_commande', width: 15 },
        { header: 'Client', key: 'client', width: 30 },
        { header: 'Montant', key: 'montant_total', width: 15 },
        { header: 'Statut', key: 'statut', width: 15 },
        { header: 'Date', key: 'date_commande', width: 15 }
      ];
    }

    worksheet.columns = columns;
    worksheet.addRows(data);

    // Style de l'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="export-${type}-${new Date().toISOString().slice(0, 10)}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur exportExcel:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
