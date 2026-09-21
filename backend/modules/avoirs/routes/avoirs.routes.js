/**
 * Routes Avoirs - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAvoirs,
  getAvoirsById,
  createAvoirs,
  updateAvoirs,
  deleteAvoirs
} from '../controllers/avoirs.controller.js';

const router = express.Router();

router.get('/', authenticate, getAvoirs);
router.get('/:id', authenticate, getAvoirsById);
router.post('/', authenticate, createAvoirs);
router.put('/:id', authenticate, updateAvoirs);
router.delete('/:id', authenticate, deleteAvoirs);

export default router;
