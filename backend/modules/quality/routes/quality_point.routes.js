/**
 * Routes quality_point - Module quality
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getQualityPoint,
  getQualityPointById,
  createQualityPoint,
  updateQualityPoint,
  deleteQualityPoint
} from '../controllers/quality_point.controller.js';

const router = express.Router();

router.get('/', authenticate, getQualityPoint);
router.get('/:id', authenticate, getQualityPointById);
router.post('/', authenticate, createQualityPoint);
router.put('/:id', authenticate, updateQualityPoint);
router.delete('/:id', authenticate, deleteQualityPoint);

export default router;
