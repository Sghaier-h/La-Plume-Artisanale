/**
 * PDF Service — La Plume Artisanale
 *
 * Génère les documents commerciaux (factures, devis, bons de livraison, avoirs)
 * au format PDF via pdfkit. Palette artisanale (terracotta / gold / crème).
 *
 * Deux usages :
 *   - Streaming HTTP : streamPDF(res, filename, drawFn, data)
 *   - Buffer (email attachment) : bufferPDF(drawFn, data) → Buffer
 *
 * Drawing functions (drawFn signature = (doc, data) => void) :
 *   - drawInvoice(doc, { facture, client, lignes, societe })
 *   - drawQuote  (doc, { devis,   client, lignes, societe })
 *   - drawBL     (doc, { bl,      client, lignes, societe })
 *   - drawAvoir  (doc, { avoir,   client, lignes, societe, facture? })
 *
 * loadSociete(pool) reconstitue la société depuis parametrage (clés societe.*).
 */

import PDFDocument from 'pdfkit';
import { pool } from '../utils/db.js';

// ─── Palette artisanale ───────────────────────────────────────────────
export const COLORS = {
  primary:   '#C8663D', // terracotta
  secondary: '#C89B3C', // gold
  text:      '#2F1F12',
  muted:     '#9B8874',
  border:    '#DFD3B8',
  bg:        '#FBF8F3',
  stripe:    '#F5EFE5',
  white:     '#FFFFFF',
};

// ─── Utilitaires ──────────────────────────────────────────────────────
const fmtMoney = (n) => Number(n || 0).toFixed(3);
const fmtDate  = (d) => {
  if (!d) return '';
  try {
    const dt = (d instanceof Date) ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('fr-FR');
  } catch { return String(d); }
};

/**
 * Charge la société depuis la table `parametrage` (clés `societe.*` / `app.*`).
 * Retourne toujours un objet exploitable même si vide.
 */
export const loadSociete = async () => {
  const defaults = {
    raison_sociale: 'La Plume Artisanale',
    adresse: 'Tunisie',
    ville: '',
    code_postal: '',
    telephone: '',
    email: '',
    matricule: '',
    site_web: '',
  };
  try {
    const r = await pool.query(
      `SELECT cle, valeur FROM parametrage
       WHERE cle LIKE 'societe.%' OR cle LIKE 'app.%'`
    );
    const m = {};
    for (const row of r.rows) {
      const key = String(row.cle).replace(/^societe\.|^app\./, '');
      m[key] = row.valeur;
    }
    return {
      raison_sociale: m.raison_sociale || m.nom || defaults.raison_sociale,
      adresse:        m.adresse        || defaults.adresse,
      ville:          m.ville          || defaults.ville,
      code_postal:    m.code_postal    || defaults.code_postal,
      telephone:      m.telephone      || m.tel || defaults.telephone,
      email:          m.email          || defaults.email,
      matricule:      m.matricule      || m.matricule_fiscal || defaults.matricule,
      site_web:       m.site_web       || m.website || defaults.site_web,
    };
  } catch {
    return defaults;
  }
};

// ─── Primitives de dessin ─────────────────────────────────────────────
const drawHeader = (doc, title, numero, societe) => {
  const s = societe || {};
  doc.fillColor(COLORS.primary).fontSize(22).font('Helvetica-Bold')
     .text(s.raison_sociale || 'La Plume Artisanale', 40, 40);
  doc.fillColor(COLORS.secondary).fontSize(10).font('Helvetica-Oblique')
     .text('Fouta authentique tunisienne', 40, 66);

  doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica');
  let y = 82;
  if (s.adresse)   { doc.text(s.adresse, 40, y);                                y += 11; }
  if (s.ville || s.code_postal) { doc.text(`${s.code_postal || ''} ${s.ville || ''}`.trim(), 40, y); y += 11; }
  if (s.telephone) { doc.text(`Tél : ${s.telephone}`, 40, y);                   y += 11; }
  if (s.email)     { doc.text(`Email : ${s.email}`, 40, y);                     y += 11; }
  if (s.matricule) { doc.text(`Matricule fiscal : ${s.matricule}`, 40, y);      y += 11; }

  // Bandeau titre
  doc.rect(370, 40, 185, 60).fill(COLORS.primary);
  doc.fillColor(COLORS.white).fontSize(20).font('Helvetica-Bold')
     .text(title, 370, 52, { width: 185, align: 'center' });
  doc.fillColor(COLORS.white).fontSize(12).font('Helvetica')
     .text(numero || '', 370, 78, { width: 185, align: 'center' });
};

const drawClientBlock = (doc, client, y = 160, extras = []) => {
  const c = client || {};
  doc.rect(40, y, 260, 90).stroke(COLORS.border);
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('CLIENT', 50, y + 8);
  doc.fillColor(COLORS.text).fontSize(11).font('Helvetica-Bold')
     .text(c.raison_sociale || c.client_raison_sociale || c.client_nom || 'Client', 50, y + 22, { width: 240 });
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text)
     .text(c.adresse || c.client_adresse || '', 50, y + 40, { width: 240 })
     .text(`${c.code_postal || ''} ${c.ville || c.client_ville || ''}`.trim(), 50, y + 54, { width: 240 })
     .text(c.telephone ? `Tél : ${c.telephone}` : '', 50, y + 68, { width: 240 })
     .text(c.email ? `Email : ${c.email}` : '', 50, y + 80, { width: 240 });

  // Bloc infos document (dates, référence…) à droite
  doc.rect(320, y, 235, 90).stroke(COLORS.border);
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('INFORMATIONS', 330, y + 8);
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(9);
  let ey = y + 22;
  for (const [k, v] of extras) {
    if (!v && v !== 0) continue;
    doc.font('Helvetica-Bold').text(`${k} :`, 330, ey, { width: 105, continued: false });
    doc.font('Helvetica').text(String(v), 435, ey, { width: 115, align: 'right' });
    ey += 13;
  }
  return y + 100;
};

const drawTable = (doc, lignes, startY) => {
  const y = startY;
  const cols = {
    designation: { x: 40,  w: 220 },
    qte:         { x: 260, w: 45  },
    pu:          { x: 305, w: 65  },
    tva:         { x: 370, w: 40  },
    ht:          { x: 410, w: 70  },
    ttc:         { x: 480, w: 75  },
  };

  // Header
  doc.rect(40, y, 515, 22).fill(COLORS.primary);
  doc.fillColor(COLORS.white).fontSize(9).font('Helvetica-Bold')
     .text('Désignation', cols.designation.x + 5, y + 7, { width: cols.designation.w - 10 })
     .text('Qté',         cols.qte.x, y + 7,         { width: cols.qte.w, align: 'right' })
     .text('P.U. HT',     cols.pu.x, y + 7,          { width: cols.pu.w - 5, align: 'right' })
     .text('TVA',         cols.tva.x, y + 7,         { width: cols.tva.w - 5, align: 'right' })
     .text('Total HT',    cols.ht.x, y + 7,          { width: cols.ht.w - 5, align: 'right' })
     .text('Total TTC',   cols.ttc.x, y + 7,         { width: cols.ttc.w - 10, align: 'right' });

  let cy = y + 22;
  doc.font('Helvetica').fontSize(9);

  (lignes || []).forEach((l, i) => {
    const q  = Number(l.quantite ?? l.quantite_livree ?? l.quantite_commandee ?? 0);
    const pu = Number(l.prix_unitaire_ht ?? l.prix_unitaire ?? 0);
    const tv = Number(l.taux_tva ?? 19);
    const mht  = l.montant_ht  != null ? Number(l.montant_ht)  : q * pu;
    const mttc = l.montant_ttc != null ? Number(l.montant_ttc) : mht * (1 + tv / 100);

    const rowH = 20;
    if (i % 2 === 0) doc.rect(40, cy, 515, rowH).fill(COLORS.stripe);

    doc.fillColor(COLORS.text)
       .text(l.designation || '-', cols.designation.x + 5, cy + 6, { width: cols.designation.w - 10, ellipsis: true })
       .text(String(q),             cols.qte.x, cy + 6,           { width: cols.qte.w, align: 'right' })
       .text(fmtMoney(pu),          cols.pu.x,  cy + 6,           { width: cols.pu.w - 5, align: 'right' })
       .text(`${tv}%`,              cols.tva.x, cy + 6,           { width: cols.tva.w - 5, align: 'right' })
       .text(fmtMoney(mht),         cols.ht.x,  cy + 6,           { width: cols.ht.w - 5, align: 'right' })
       .text(fmtMoney(mttc),        cols.ttc.x, cy + 6,           { width: cols.ttc.w - 10, align: 'right' });
    cy += rowH;

    if (cy > 700) {
      doc.addPage();
      cy = 60;
    }
  });

  doc.rect(40, y, 515, cy - y).stroke(COLORS.border);
  return cy;
};

const drawTotals = (doc, totals, y, opts = {}) => {
  const top = y + 15;
  doc.rect(340, top, 215, 90).stroke(COLORS.border);
  const rows = [
    ['Total HT',  fmtMoney(totals.montant_ht)],
    ['TVA',       fmtMoney(totals.montant_tva)],
    ['Total TTC', fmtMoney(totals.montant_ttc)],
  ];
  let ry = top + 12;
  rows.forEach(([label, val], i) => {
    const isLast = i === rows.length - 1;
    if (isLast) {
      doc.rect(340, ry - 4, 215, 26).fill(COLORS.primary);
      doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(11)
         .text(label, 350, ry + 2, { width: 100 })
         .text(`${val} DT`, 450, ry + 2, { width: 100, align: 'right' });
    } else {
      doc.fillColor(COLORS.text).font('Helvetica').fontSize(10)
         .text(label, 350, ry, { width: 100 })
         .text(`${val} DT`, 450, ry, { width: 100, align: 'right' });
    }
    ry += 24;
  });

  if (opts.mention) {
    doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(8)
       .text(opts.mention, 40, top + 20, { width: 290 });
  }
  return top + 100;
};

const drawFooter = (doc, msg) => {
  const y = 780;
  doc.strokeColor(COLORS.border).moveTo(40, y - 10).lineTo(555, y - 10).stroke();
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
     .text(msg || 'Merci pour votre confiance.', 40, y, { width: 515, align: 'center' });
  doc.fillColor(COLORS.secondary).font('Helvetica-Oblique')
     .text('La Plume Artisanale — Fouta authentique tunisienne', 40, y + 11, { width: 515, align: 'center' });
};

// ─── Générateurs (dessinent dans un doc existant) ─────────────────────
export const drawInvoice = (doc, { facture = {}, client = {}, lignes = [], societe = {} }) => {
  drawHeader(doc, 'FACTURE', facture.numero_facture || `#${facture.id_facture || ''}`, societe);
  const nextY = drawClientBlock(doc, client, 160, [
    ['Date facture',   fmtDate(facture.date_facture)],
    ['Date échéance',  fmtDate(facture.date_echeance) || 'Immédiat'],
    ['Statut',         facture.statut || ''],
    ['Réf. client',    facture.reference_client || ''],
    ['Cond. paiement', facture.conditions_paiement || ''],
  ]);
  const afterTable = drawTable(doc, lignes, nextY + 10);
  drawTotals(doc, facture, afterTable, {
    mention: facture.montant_restant != null && Number(facture.montant_restant) > 0
      ? `Reste à régler : ${fmtMoney(facture.montant_restant)} DT`
      : null,
  });
  if (facture.notes) {
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Oblique')
       .text(`Notes : ${facture.notes}`, 40, afterTable + 110, { width: 290 });
  }
  drawFooter(doc, 'Merci de votre confiance — La Plume Artisanale');
};

export const drawQuote = (doc, { devis = {}, client = {}, lignes = [], societe = {} }) => {
  drawHeader(doc, 'DEVIS', devis.numero_devis || `#${devis.id_devis || ''}`, societe);
  const nextY = drawClientBlock(doc, client, 160, [
    ['Date devis',    fmtDate(devis.date_devis)],
    ['Validité',      fmtDate(devis.date_validite)],
    ['Statut',        devis.statut || ''],
  ]);
  const afterTable = drawTable(doc, lignes, nextY + 10);
  drawTotals(doc, devis, afterTable, {
    mention: 'Ce devis est valable jusqu\'à la date de validité indiquée. Bon pour accord (signature + cachet).',
  });
  if (devis.notes) {
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Oblique')
       .text(`Notes : ${devis.notes}`, 40, afterTable + 110, { width: 290 });
  }
  drawFooter(doc, 'Devis établi par La Plume Artisanale');
};

export const drawBL = (doc, { bl = {}, client = {}, lignes = [], societe = {} }) => {
  drawHeader(doc, 'BON DE LIVRAISON', bl.numero_bl || `#${bl.id_bl || ''}`, societe);
  const nextY = drawClientBlock(doc, client, 160, [
    ['Date livraison', fmtDate(bl.date_livraison)],
    ['Transporteur',   bl.transporteur || ''],
    ['N° suivi',       bl.numero_suivi || ''],
    ['Statut',         bl.statut || ''],
  ]);
  const afterTable = drawTable(doc, lignes, nextY + 10);
  // Pas de bloc total TTC pour BL — on affiche seulement le nb d'articles
  const totalQte = (lignes || []).reduce((s, l) => s + Number(l.quantite ?? l.quantite_livree ?? 0), 0);
  doc.rect(340, afterTable + 15, 215, 40).stroke(COLORS.border);
  doc.fillColor(COLORS.muted).fontSize(9).text('Nombre total d\'articles', 350, afterTable + 24);
  doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(14).text(String(totalQte), 350, afterTable + 36, { width: 195, align: 'right' });

  // Zones signatures
  const sy = afterTable + 80;
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
  doc.rect(40, sy, 240, 70).stroke(COLORS.border);
  doc.text('Signature transporteur', 50, sy + 5);
  doc.rect(315, sy, 240, 70).stroke(COLORS.border);
  doc.text('Signature / cachet client', 325, sy + 5);

  drawFooter(doc, 'Bon de livraison — La Plume Artisanale');
};

export const drawAvoir = (doc, { avoir = {}, client = {}, lignes = [], societe = {}, facture = null }) => {
  drawHeader(doc, "AVOIR", avoir.numero_avoir || `#${avoir.id_avoir || ''}`, societe);
  const nextY = drawClientBlock(doc, client, 160, [
    ['Date avoir',      fmtDate(avoir.date_avoir)],
    ['Type',            avoir.type_avoir || 'commercial'],
    ['Réf. facture',    avoir.reference_facture || facture?.numero_facture || ''],
    ['Statut',          avoir.statut || ''],
  ]);
  if (avoir.motif) {
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica-Bold').text('Motif :', 40, nextY + 5);
    doc.fillColor(COLORS.text).font('Helvetica').text(avoir.motif, 80, nextY + 5, { width: 475 });
  }
  const afterTable = drawTable(doc, lignes, nextY + 30);
  drawTotals(doc, avoir, afterTable, {
    mention: 'Cet avoir vient en déduction de la facture référencée.',
  });
  drawFooter(doc, 'Avoir — La Plume Artisanale');
};

// ─── Wrappers streaming / buffer ──────────────────────────────────────
export const streamPDF = (res, filename, drawFn, data) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: filename } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}.pdf"`);
  doc.pipe(res);
  drawFn(doc, data);
  doc.end();
};

export const bufferPDF = (drawFn, data) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);
  drawFn(doc, data);
  doc.end();
});

// ─── Helpers de récupération DB pour les 4 documents ──────────────────
export const fetchFactureFull = async (id) => {
  const f = await pool.query(
    `SELECT f.*, c.raison_sociale, c.adresse, c.ville, c.code_postal, c.telephone, c.email
     FROM factures f LEFT JOIN clients c ON f.id_client = c.id_client
     WHERE f.id_facture = $1`,
    [id]
  );
  if (!f.rows[0]) return null;
  const l = await pool.query(
    `SELECT * FROM lignes_facture WHERE id_facture = $1 ORDER BY ordre NULLS LAST, id_ligne`,
    [id]
  );
  const row = f.rows[0];
  return {
    facture: row,
    client:  {
      raison_sociale: row.raison_sociale, adresse: row.adresse, ville: row.ville,
      code_postal: row.code_postal, telephone: row.telephone, email: row.email,
    },
    lignes: l.rows,
  };
};

export const fetchDevisFull = async (id) => {
  const d = await pool.query(
    `SELECT d.*, c.raison_sociale, c.adresse, c.ville, c.code_postal, c.telephone, c.email
     FROM devis d LEFT JOIN clients c ON d.id_client = c.id_client
     WHERE d.id_devis = $1`,
    [id]
  );
  if (!d.rows[0]) return null;
  const l = await pool.query(
    `SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre NULLS LAST, id_ligne`,
    [id]
  );
  const row = d.rows[0];
  return {
    devis: row,
    client: {
      raison_sociale: row.raison_sociale, adresse: row.adresse, ville: row.ville,
      code_postal: row.code_postal, telephone: row.telephone, email: row.email,
    },
    lignes: l.rows,
  };
};

export const fetchBLFull = async (id) => {
  const b = await pool.query(
    `SELECT bl.*, c.raison_sociale, c.adresse, c.ville, c.code_postal, c.telephone, c.email
     FROM bons_livraison bl LEFT JOIN clients c ON bl.id_client = c.id_client
     WHERE bl.id_bl = $1`,
    [id]
  );
  if (!b.rows[0]) return null;
  const l = await pool.query(
    `SELECT * FROM lignes_bl WHERE id_bl = $1 ORDER BY ordre NULLS LAST, id_ligne`,
    [id]
  );
  const row = b.rows[0];
  return {
    bl: row,
    client: {
      raison_sociale: row.raison_sociale, adresse: row.adresse, ville: row.ville,
      code_postal: row.code_postal, telephone: row.telephone, email: row.email,
    },
    lignes: l.rows,
  };
};

export const fetchAvoirFull = async (id) => {
  const a = await pool.query(
    `SELECT a.*, c.raison_sociale, c.adresse, c.ville, c.code_postal, c.telephone, c.email,
            f.numero_facture
     FROM avoirs a
     LEFT JOIN clients c  ON a.id_client  = c.id_client
     LEFT JOIN factures f ON a.id_facture = f.id_facture
     WHERE a.id_avoir = $1`,
    [id]
  );
  if (!a.rows[0]) return null;
  const l = await pool.query(
    `SELECT * FROM lignes_avoir WHERE id_avoir = $1 ORDER BY ordre NULLS LAST, id_ligne`,
    [id]
  );
  const row = a.rows[0];
  return {
    avoir: row,
    client: {
      raison_sociale: row.raison_sociale, adresse: row.adresse, ville: row.ville,
      code_postal: row.code_postal, telephone: row.telephone, email: row.email,
    },
    facture: row.numero_facture ? { numero_facture: row.numero_facture } : null,
    lignes: l.rows,
  };
};

export default {
  COLORS,
  loadSociete,
  drawInvoice, drawQuote, drawBL, drawAvoir,
  streamPDF, bufferPDF,
  fetchFactureFull, fetchDevisFull, fetchBLFull, fetchAvoirFull,
};
