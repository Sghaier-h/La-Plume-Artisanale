/**
 * Routes Commercial
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCommercial,
  getCommercialById,
  createCommercial,
  updateCommercial,
  deleteCommercial,
  getStatsGlobal,
  getPerformance,
} from '../controllers/commercial.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/stats/global', getStatsGlobal);
router.get('/:id(\\d+)/performance', getPerformance);

router.get('/', getCommercial);
router.post('/', createCommercial);
router.get('/:id(\\d+)', getCommercialById);
router.put('/:id(\\d+)', updateCommercial);
router.delete('/:id(\\d+)', deleteCommercial);

export default router;
