/**
 * Routes Email - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getEmail,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail
} from '../controllers/email.controller.js';

const router = express.Router();

router.get('/', authenticate, getEmail);
router.get('/:id', authenticate, getEmailById);
router.post('/', authenticate, createEmail);
router.put('/:id', authenticate, updateEmail);
router.delete('/:id', authenticate, deleteEmail);

export default router;
