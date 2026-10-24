/**
 * Routes AI
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getHistory,
  getUsageStats,
  ask,
  summarizeOF,
  suggestPlanning,
  detectAnomalies,
  updateFeedback,
} from '../controllers/ai.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/history', getHistory);
router.get('/usage/stats', getUsageStats);
router.post('/ask', ask);
router.post('/summarize/of/:id_of(\\d+)', summarizeOF);
router.post('/suggest/planning', suggestPlanning);
router.post('/detect/anomalies', detectAnomalies);
router.put('/history/:id(\\d+)/feedback', updateFeedback);

export default router;
