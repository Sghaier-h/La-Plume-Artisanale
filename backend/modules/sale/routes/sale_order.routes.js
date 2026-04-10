/**
 * SaleOrder Routes - Routes pour les commandes de vente
 */

import express from 'express';
import {
  getSaleOrders,
  getSaleOrder,
  createSaleOrder,
  updateSaleOrder,
  deleteSaleOrder,
  confirmSaleOrder,
  cancelSaleOrder,
  getSaleOrderLines,
  createSaleOrderLine,
  updateSaleOrderLine,
  deleteSaleOrderLine
} from '../controllers/sale_order.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes CRUD
router.get('/', getSaleOrders);
router.get('/:id', getSaleOrder);
router.post('/', createSaleOrder);
router.put('/:id', updateSaleOrder);
router.delete('/:id', deleteSaleOrder);

// Routes d'actions
router.post('/:id/confirm', confirmSaleOrder);
router.post('/:id/cancel', cancelSaleOrder);

// Routes pour les relations (lignes de commande)
router.get('/:id/lines', getSaleOrderLines);
router.post('/:id/lines', createSaleOrderLine);
router.put('/:id/lines/:lineId', updateSaleOrderLine);
router.delete('/:id/lines/:lineId', deleteSaleOrderLine);

export default router;
