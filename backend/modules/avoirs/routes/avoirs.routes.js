/**
 * Routes Avoirs
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, handleError } from '../../../src/utils/error.helper.js';
import {
  getAvoirs,
  getStatsGlobal,
  getAvoirById,
  createAvoir,
  updateAvoir,
  validerAvoir,
  appliquerAvoir,
  annulerAvoir,
  deleteAvoir,
} from '../controllers/avoirs.controller.js';
import {
  streamPDF, drawAvoir, fetchAvoirFull, loadSociete,
} from '../../../src/services/pdf.service.js';

const router = express.Router();

router.use(authenticate);

// PDF
router.get('/:id(\\d+)/pdf', async (req, res) => {
  try {
    const data = await fetchAvoirFull(req.params.id);
    if (!data) return sendError(res, 'Avoir introuvable', 404);
    const societe = await loadSociete();
    return streamPDF(
      res,
      `avoir-${data.avoir.numero_avoir || req.params.id}`,
      drawAvoir,
      { ...data, societe }
    );
  } catch (error) { return handleError(res, error, 'getAvoirPDF'); }
});

router.get('/stats/global', getStatsGlobal);

// Créer un avoir depuis une facture
router.post('/from-facture/:id_facture(\\d+)', async (req, res, next) => {
  try {
    const idF = req.params.id_facture;
    const fR = await pool.query(`SELECT * FROM factures WHERE id_facture = $1`, [idF]);
    if (fR.rows.length === 0) return sendError(res, 'Facture non trouvée', 404);
    const f = fR.rows[0];
    const lR = await pool.query(`SELECT * FROM lignes_facture WHERE id_facture = $1 ORDER BY ordre NULLS LAST, id_ligne`, [idF]);
    req.body = {
      id_client: f.id_client,
      id_facture: f.id_facture,
      motif: req.body?.motif || `Avoir sur facture ${f.numero_facture || idF}`,
      type_avoir: req.body?.type_avoir || 'commercial',
      reference_facture: f.numero_facture || null,
      notes: req.body?.notes || null,
      lignes: lR.rows.map(l => ({
        id_ligne_facture: l.id_ligne,
        id_article: l.id_article,
        designation: l.designation,
        quantite: l.quantite,
        prix_unitaire_ht: l.prix_unitaire_ht,
        taux_tva: l.taux_tva,
      })),
    };
    return createAvoir(req, res, next);
  } catch (error) {
    return handleError(res, error, 'avoirFromFacture');
  }
});

router.put('/:id(\\d+)/valider',   validerAvoir);
router.put('/:id(\\d+)/appliquer', appliquerAvoir);
router.put('/:id(\\d+)/annuler',   annulerAvoir);

router.get('/',            getAvoirs);
router.post('/',           createAvoir);
router.get('/:id(\\d+)',    getAvoirById);
router.put('/:id(\\d+)',    updateAvoir);
router.delete('/:id(\\d+)', deleteAvoir);

export default router;
