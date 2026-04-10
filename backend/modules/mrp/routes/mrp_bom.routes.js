/**
 * MrpBOM Routes
 */

import express from 'express';
import {
  getMrpBOMs,
  getMrpBOM,
  createMrpBOM,
  updateMrpBOM,
  deleteMrpBOM,
  getBOMHierarchy,
  calculateBOMCost
} from '../controllers/mrp_bom.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMrpBOMs);
router.get('/:id', getMrpBOM);
router.post('/', createMrpBOM);
router.put('/:id', updateMrpBOM);
router.delete('/:id', deleteMrpBOM);
router.get('/:id/hierarchy', getBOMHierarchy);
router.get('/:id/cost', calculateBOMCost);

export default router;
