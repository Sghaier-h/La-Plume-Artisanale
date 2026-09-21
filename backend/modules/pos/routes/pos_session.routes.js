/**
 * POS Session Routes
 * Routes pour les sessions POS
 */

import express from 'express';
import {
  getSessions,
  getSession,
  openSession,
  closeSession
} from '../controllers/pos_session.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getSessions);
router.get('/:id', getSession);
router.post('/ouvrir', openSession);
router.post('/:id/fermer', closeSession);

export default router;
