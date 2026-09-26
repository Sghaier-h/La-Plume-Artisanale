/**
 * Routes Suivi Fabrication
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSuiviFabrication,
  getSuiviFabricationById,
  createSuiviFabrication,
  updateSuiviFabrication,
  deleteSuiviFabrication,
  getOfSummary,
  getMachineStats,
  getOperateurDay,
} from '../controllers/suivi-fabrication.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques AVANT /:id
router.get('/of/:id_of(\\d+)/summary',            getOfSummary);
router.get('/of/:id_of(\\d+)/avancement',         getOfSummary);
router.get('/machine/:id_machine(\\d+)/stats',    getMachineStats);
router.get('/operateur/:id_operateur(\\d+)/day',  getOperateurDay);

// CRUD standard
router.get('/',             getSuiviFabrication);
router.post('/',            createSuiviFabrication);
router.get('/:id(\\d+)',     getSuiviFabricationById);
router.put('/:id(\\d+)',     updateSuiviFabrication);
router.delete('/:id(\\d+)',  deleteSuiviFabrication);

export default router;
