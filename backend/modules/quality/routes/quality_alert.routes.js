/**
 * Routes quality_alert - Module quality
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getQualityAlert,
  getQualityAlertById,
  createQualityAlert,
  updateQualityAlert,
  deleteQualityAlert
} from '../controllers/quality_alert.controller.js';

const router = express.Router();

router.get('/', authenticate, getQualityAlert);
router.get('/:id', authenticate, getQualityAlertById);
router.post('/', authenticate, createQualityAlert);
router.put('/:id', authenticate, updateQualityAlert);
router.delete('/:id', authenticate, deleteQualityAlert);

export default router;
