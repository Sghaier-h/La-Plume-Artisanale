/**
 * Routes Utilisateurs - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getUtilisateurs,
  getUtilisateursById,
  createUtilisateurs,
  updateUtilisateurs,
  deleteUtilisateurs
} from '../controllers/utilisateurs.controller.js';

const router = express.Router();

router.get('/', authenticate, getUtilisateurs);
router.get('/:id', authenticate, getUtilisateursById);
router.post('/', authenticate, createUtilisateurs);
router.put('/:id', authenticate, updateUtilisateurs);
router.delete('/:id', authenticate, deleteUtilisateurs);

export default router;
