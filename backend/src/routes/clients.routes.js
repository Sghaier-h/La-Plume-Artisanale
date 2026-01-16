import express from 'express';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/clients.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getClients);
router.get('/:id', authenticate, getClient);
router.post('/', authenticate, createClient);
router.put('/:id', authenticate, updateClient);
router.delete('/:id', authenticate, deleteClient);

export default router;
