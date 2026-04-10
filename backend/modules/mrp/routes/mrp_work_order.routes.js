/**
 * Routes mrp_work_order - Module mrp
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMrpWorkOrder,
  getMrpWorkOrderById,
  createMrpWorkOrder,
  updateMrpWorkOrder,
  deleteMrpWorkOrder
} from '../controllers/mrp_work_order.controller.js';

const router = express.Router();

router.get('/', authenticate, getMrpWorkOrder);
router.get('/:id', authenticate, getMrpWorkOrderById);
router.post('/', authenticate, createMrpWorkOrder);
router.put('/:id', authenticate, updateMrpWorkOrder);
router.delete('/:id', authenticate, deleteMrpWorkOrder);

export default router;
