/**
 * Routes mrp_routing - Module mrp
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMrpRouting,
  getMrpRoutingById,
  createMrpRouting,
  updateMrpRouting,
  deleteMrpRouting
} from '../controllers/mrp_routing.controller.js';

const router = express.Router();

router.get('/', authenticate, getMrpRouting);
router.get('/:id', authenticate, getMrpRoutingById);
router.post('/', authenticate, createMrpRouting);
router.put('/:id', authenticate, updateMrpRouting);
router.delete('/:id', authenticate, deleteMrpRouting);

export default router;
