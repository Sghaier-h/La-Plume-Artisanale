/**
 * Routes Messages - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMessages,
  getMessagesById,
  createMessages,
  updateMessages,
  deleteMessages
} from '../controllers/messages.controller.js';

const router = express.Router();

router.get('/', authenticate, getMessages);
router.get('/:id', authenticate, getMessagesById);
router.post('/', authenticate, createMessages);
router.put('/:id', authenticate, updateMessages);
router.delete('/:id', authenticate, deleteMessages);

export default router;
