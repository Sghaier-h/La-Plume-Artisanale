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
} from '../controllers/bons-livraison.controller.js';

const router = express.Router();

router.use(authenticate);

// Specific paths BEFORE /:id
router.get('/stats/global', getStatsGlobal);

// Créer un BL depuis une commande
router.post('/from-commande/:id_commande(\\d+)', async (req, res, next) => {
  try {
    const idCmd = req.params.id_commande;
    const cmdR = await pool.query(`SELECT * FROM commandes_clients WHERE id_commande = $1`, [idCmd]);
    if (cmdR.rows.length === 0) return sendError(res, 'Commande non trouvée', 404);
    const cmd = cmdR.rows[0];
    const lignesR = await pool.query(`SELECT * FROM lignes_commande WHERE id_commande = $1 ORDER BY ordre NULLS LAST, id_ligne`, [idCmd]);
    req.body = {
      id_client: cmd.id_client,
      id_commande: cmd.id_commande,
      date_livraison: req.body?.date_livraison || null,
      transporteur: req.body?.transporteur || null,
      adresse_livraison: cmd.adresse_livraison || null,
      notes: req.body?.notes || null,
      lignes: lignesR.rows.map(l => ({
        id_article: l.id_article,
        designation: l.designation,
        quantite: l.quantite,
        prix_unitaire_ht: l.prix_unitaire_ht,
        taux_tva: l.taux_tva,
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
