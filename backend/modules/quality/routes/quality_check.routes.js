/**
 * Routes quality_check - Module quality
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getQualityCheck,
  getQualityCheckById,
  createQualityCheck,
  updateQualityCheck,
  deleteQualityCheck
} from '../controllers/quality_check.controller.js';

const router = express.Router();

router.get('/', authenticate, getQualityCheck);
router.get('/:id', authenticate, getQualityCheckById);
router.post('/', authenticate, createQualityCheck);
router.put('/:id', authenticate, updateQualityCheck);
router.delete('/:id', authenticate, deleteQualityCheck);

export default router;
