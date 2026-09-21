/**
 * Routes Communication - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCommunication,
  getCommunicationById,
  createCommunication,
  updateCommunication,
  deleteCommunication
} from '../controllers/communication.controller.js';

const router = express.Router();

router.get('/', authenticate, getCommunication);
router.get('/:id', authenticate, getCommunicationById);
router.post('/', authenticate, createCommunication);
router.put('/:id', authenticate, updateCommunication);
router.delete('/:id', authenticate, deleteCommunication);

export default router;
