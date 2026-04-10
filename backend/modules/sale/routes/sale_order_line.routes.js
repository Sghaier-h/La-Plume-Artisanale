/**
 * Routes sale_order_line - Module sale
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSaleOrderLine,
  getSaleOrderLineById,
  createSaleOrderLine,
  updateSaleOrderLine,
  deleteSaleOrderLine
} from '../controllers/sale_order_line.controller.js';

const router = express.Router();

router.get('/', authenticate, getSaleOrderLine);
router.get('/:id', authenticate, getSaleOrderLineById);
router.post('/', authenticate, createSaleOrderLine);
router.put('/:id', authenticate, updateSaleOrderLine);
router.delete('/:id', authenticate, deleteSaleOrderLine);

export default router;
