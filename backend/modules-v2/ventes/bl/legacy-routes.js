/**
 * Routes BonsLivraison
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, handleError } from '../../../src/utils/error.helper.js';
import {
  getBonsLivraison,
  getStatsGlobal,
  getBonsLivraisonById,
  createBonsLivraison,
  updateBonsLivraison,
  validerBL,
  livrerBL,
  annulerBL,
  deleteBonsLivraison,
} from './legacy-controller.js';
import {
  streamPDF, drawBL, fetchBLFull, loadSociete,
} from '../../../src/services/pdf.service.js';

const router = express.Router();

router.use(authenticate);

// PDF
router.get('/:id(\\d+)/pdf', async (req, res) => {
  try {
    const data = await fetchBLFull(req.params.id);
    if (!data) return sendError(res, 'Bon de livraison introuvable', 404);
    const societe = await loadSociete();
    return streamPDF(
      res,
      `bl-${data.bl.numero_bl || req.params.id}`,
      drawBL,
      { ...data, societe }
    );
  } catch (error) { return handleError(res, error, 'getBLPDF'); }
});

// Specific paths BEFORE /:id
router.get('/stats/global', getStatsGlobal);

// Créer un BL depuis une commande
// Phase T1 — fix: `commandes_clients` et `lignes_commande` sont des tables
// de projection vides. Les vraies données sont dans `commandes` + `articles_commande`.
router.post('/from-commande/:id_commande(\\d+)', async (req, res, next) => {
  try {
    const idCmd = req.params.id_commande;
    const cmdR = await pool.query(`SELECT * FROM commandes WHERE id_commande = $1`, [idCmd]);
    if (cmdR.rows.length === 0) return sendError(res, 'Commande non trouvée', 404);
    const cmd = cmdR.rows[0];
    const lignesR = await pool.query(
      `SELECT ac.*, a.designation AS article_designation
         FROM articles_commande ac
         LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
        WHERE ac.id_commande = $1
        ORDER BY ac.numero_ligne`,
      [idCmd]
    );
    req.body = {
      id_client: cmd.id_client,
      id_commande: cmd.id_commande,
      date_livraison: req.body?.date_livraison || null,
      transporteur: req.body?.transporteur || null,
      adresse_livraison: cmd.adresse_livraison || null,
      notes: req.body?.notes || null,
      lignes: lignesR.rows.map(l => ({
        id_article: l.id_article,
        designation: l.description_article || l.article_designation || `Article ${l.id_article || ''}`.trim(),
        quantite: Number(l.quantite_commandee) || 0,
        prix_unitaire_ht: Number(l.prix_unitaire) || 0,
        taux_tva: 20,
      })),
    };
    return createBonsLivraison(req, res, next);
  } catch (error) {
    return handleError(res, error, 'blFromCommande');
  }
});

// State transitions
router.put('/:id(\\d+)/valider', validerBL);
router.put('/:id(\\d+)/livrer',  livrerBL);
router.put('/:id(\\d+)/annuler', annulerBL);

// CRUD
router.get('/',            getBonsLivraison);
router.post('/',           createBonsLivraison);
router.get('/:id(\\d+)',    getBonsLivraisonById);
router.put('/:id(\\d+)',    updateBonsLivraison);
router.delete('/:id(\\d+)', deleteBonsLivraison);

export default router;
