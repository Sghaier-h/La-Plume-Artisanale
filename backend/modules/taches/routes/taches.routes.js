/**
 * Routes Taches - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getTaches,
  getTachesById,
  createTaches,
  updateTaches,
  deleteTaches
} from '../controllers/taches.controller.js';

const router = express.Router();

router.get('/', authenticate, getTaches);
router.get('/:id', authenticate, getTachesById);
router.post('/', authenticate, createTaches);
router.put('/:id', authenticate, updateTaches);
router.delete('/:id', authenticate, deleteTaches);

export default router;
