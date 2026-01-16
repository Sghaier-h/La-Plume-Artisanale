import express from 'express';
import {
  getCanaux,
  getMessages,
  envoyerMessage,
  getTemplates,
  getConversations
} from '../controllers/communication.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/canaux', authenticate, getCanaux);
router.get('/messages', authenticate, getMessages);
router.post('/messages', authenticate, authorize('ADMIN', 'COMMERCIAL'), envoyerMessage);
router.get('/templates', authenticate, getTemplates);
router.get('/conversations', authenticate, getConversations);

export default router;
