/**
 * PurchaseOrder Routes
 * Mounted at /api/purchase/orders
 */

import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseOrderLines
} from '../controllers/purchase_order.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// Lazy import Socket.IO
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const router = express.Router();

router.use(authMiddleware);

// ─── Wrapper: auto numero + statut='draft' avant create ──────────
const createWithDefaults = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') req.body = {};
    if (!req.body.numero_commande) {
      const d = new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const r = await pool.query(
        `SELECT COUNT(*)::int AS c FROM commandes_fournisseurs
           WHERE numero_commande LIKE $1`,
        [`PO-${ymd}-%`]
      );
      const seq = String((r.rows[0]?.c || 0) + 1).padStart(3, '0');
      req.body.numero_commande = `PO-${ymd}-${seq}`;
    }
    if (!req.body.statut) req.body.statut = 'draft';
    // capture original json to emit io
    const origJson = res.json.bind(res);
    res.json = (payload) => {
      try {
        (async () => {
          try {
            const io = await getIo();
            if (io && payload?.data) io.emit('purchase:order:created', payload.data);
          } catch {}
        })();
      } catch {}
      return origJson(payload);
    };
    return createPurchaseOrder(req, res, next);
  } catch (error) {
    return handleError(res, error, 'createPurchaseOrderWrapper');
  }
};

// ─── Wrapper: delete only if statut='draft' ──────────────────────
const deleteIfDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query(
      `SELECT statut FROM commandes_fournisseurs WHERE id_commande_fournisseur = $1`,
      [id]
    );
    if (check.rows.length === 0) return sendError(res, 'Commande non trouvée', 404);
    const statut = (check.rows[0].statut || '').toLowerCase();
    if (statut && statut !== 'draft' && statut !== 'brouillon') {
      return sendError(res, `Suppression impossible : statut '${statut}' (seul 'draft' est supprimable)`, 400);
    }
    const r = await pool.query(
      `DELETE FROM commandes_fournisseurs WHERE id_commande_fournisseur = $1 RETURNING id_commande_fournisseur AS id`,
      [id]
    );
    try {
      const io = await getIo();
      if (io) io.emit('purchase:order:deleted', { id: r.rows[0].id });
    } catch {}
    return sendSuccess(res, { id: r.rows[0].id }, 'Commande supprimée');
  } catch (error) {
    return handleError(res, error, 'deletePurchaseOrder');
  }
};

// Routes spécifiques AVANT /:id
router.get('/', getPurchaseOrders);
router.post('/', createWithDefaults);

router.get('/:id(\\d+)', getPurchaseOrder);
router.put('/:id(\\d+)', updatePurchaseOrder);
router.delete('/:id(\\d+)', deleteIfDraft);

router.post('/:id(\\d+)/confirm', confirmPurchaseOrder);
router.post('/:id(\\d+)/cancel', cancelPurchaseOrder);
router.get('/:id(\\d+)/lines', getPurchaseOrderLines);

export default router;
