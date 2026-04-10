/**
 * POS Caisse Routes
 * Routes pour les caisses POS
 */

import express from 'express';
import {
  getCaisses,
  getCaisse,
  getCaisseSession
} from '../controllers/pos_caisse.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCaisses);
router.get('/:id', getCaisse);
router.get('/:id/session', getCaisseSession);

export default router;
