/**
 * Routes mrp_work_center - Module mrp
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMrpWorkCenter,
  getMrpWorkCenterById,
  createMrpWorkCenter,
  updateMrpWorkCenter,
  deleteMrpWorkCenter
} from '../controllers/mrp_work_center.controller.js';

const router = express.Router();

router.get('/', authenticate, getMrpWorkCenter);
router.get('/:id', authenticate, getMrpWorkCenterById);
router.post('/', authenticate, createMrpWorkCenter);
router.put('/:id', authenticate, updateMrpWorkCenter);
router.delete('/:id', authenticate, deleteMrpWorkCenter);

export default router;
