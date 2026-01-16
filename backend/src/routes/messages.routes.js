import express from 'express';
import {
  envoyerMessage,
  getMessages,
  marquerMessageLu
} from '../controllers/messages.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, envoyerMessage);
router.get('/', authenticate, getMessages);
router.put('/:id/lu', authenticate, marquerMessageLu);

export default router;
