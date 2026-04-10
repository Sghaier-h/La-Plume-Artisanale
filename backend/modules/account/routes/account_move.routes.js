/**
 * AccountMove Routes
 */

import express from 'express';
import {
  getAccountMoves,
  getAccountMove,
  postAccountMove,
  draftAccountMove,
  getAccountMoveLines
} from '../controllers/account_move.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAccountMoves);
router.get('/:id', getAccountMove);
router.post('/:id/post', postAccountMove);
router.post('/:id/draft', draftAccountMove);

// Routes pour les relations
router.get('/:id/lines', getAccountMoveLines);

export default router;
