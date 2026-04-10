/**
 * Routes Whatsapp - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWhatsapp,
  getWhatsappById,
  createWhatsapp,
  updateWhatsapp,
  deleteWhatsapp
} from '../controllers/whatsapp.controller.js';

const router = express.Router();

router.get('/', authenticate, getWhatsapp);
router.get('/:id', authenticate, getWhatsappById);
router.post('/', authenticate, createWhatsapp);
router.put('/:id', authenticate, updateWhatsapp);
router.delete('/:id', authenticate, deleteWhatsapp);

export default router;
