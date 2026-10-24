/**
 * Routes Communication — Multi-canal messagerie
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCanaux,
  getTemplates,
  getConversations,
  getMessages,
  sendMessage,
  getCommunication,
  getCommunicationById,
  createCommunication,
  updateCommunication,
  deleteCommunication,
} from '../controllers/communication.controller.js';

const router = express.Router();

// Routes spécifiques (avant /:id)
router.get('/canaux', authenticate, getCanaux);
router.get('/templates', authenticate, getTemplates);
router.get('/conversations', authenticate, getConversations);
router.get('/messages', authenticate, getMessages);
router.post('/messages', authenticate, sendMessage);

// Routes CRUD génériques
router.get('/', authenticate, getCommunication);
router.post('/', authenticate, createCommunication);
router.get('/:id(\\d+)', authenticate, getCommunicationById);
router.put('/:id(\\d+)', authenticate, updateCommunication);
router.delete('/:id(\\d+)', authenticate, deleteCommunication);

export default router;
