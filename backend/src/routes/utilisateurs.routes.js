import express from 'express';
import {
  getUtilisateurs,
  getUtilisateurById,
  createUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  getRoles,
  getDashboards
} from '../controllers/utilisateurs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getUtilisateurs);
router.get('/roles', authenticate, getRoles);
router.get('/dashboards', authenticate, getDashboards);
router.get('/:id', authenticate, getUtilisateurById);
router.post('/', authenticate, createUtilisateur);
router.put('/:id', authenticate, updateUtilisateur);
router.delete('/:id', authenticate, deleteUtilisateur);

export default router;
