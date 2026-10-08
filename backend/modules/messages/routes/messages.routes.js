/**
 * Routes Messages — messagerie inter-utilisateurs
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMessages,
  getMessagesById,
  createMessages,
  updateMessages,
  deleteMessages,
  marquerLu,
  marquerTousLus,
  getUnreadCount,
  getConversation,
} from '../controllers/messages.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/non-lus/count', getUnreadCount);
router.put('/tous-lus', marquerTousLus);
router.get('/conversation/:userId(\\d+)', getConversation);
router.put('/:id(\\d+)/lu', marquerLu);

// CRUD standard
router.get('/', getMessages);
router.post('/', createMessages);
router.get('/:id(\\d+)', getMessagesById);
router.put('/:id(\\d+)', updateMessages);
router.delete('/:id(\\d+)', deleteMessages);

export default router;
