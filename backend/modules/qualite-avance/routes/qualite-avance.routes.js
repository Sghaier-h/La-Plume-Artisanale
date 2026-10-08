/**
 * Routes Qualité Avancée — bridge vers controle_premiere_piece,
 * non_conformites et declarations_2eme_choix.
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getControles, getControleById, createControle, updateControle, deleteControle,
  getNonConformites, getNonConformiteById, createNonConformite, updateNonConformite,
  traiterNonConformite, resoudreNonConformite, validerNonConformite,
  getDeclarations, createDeclaration,
  getStatsGlobal,
  // Rétro-compat
  getQualiteAvance, getQualiteAvanceById, createQualiteAvance,
  updateQualiteAvance, deleteQualiteAvance,
} from '../controllers/qualite-avance.controller.js';

const router = express.Router();
router.use(authenticate);

// Stats
router.get('/stats/global', getStatsGlobal);

// Contrôles première pièce
router.get('/controles',                getControles);
router.post('/controles',               createControle);
router.get('/controles/:id(\\d+)',      getControleById);
router.put('/controles/:id(\\d+)',      updateControle);
router.delete('/controles/:id(\\d+)',   deleteControle);

// Non-conformités
router.get('/non-conformites',                       getNonConformites);
router.post('/non-conformites',                      createNonConformite);
router.get('/non-conformites/:id(\\d+)',             getNonConformiteById);
router.put('/non-conformites/:id(\\d+)',             updateNonConformite);
router.put('/non-conformites/:id(\\d+)/traiter',     traiterNonConformite);
router.put('/non-conformites/:id(\\d+)/resoudre',    resoudreNonConformite);
router.put('/non-conformites/:id(\\d+)/valider',     validerNonConformite);

// Déclarations 2ème choix
router.get('/declarations-2eme-choix',   getDeclarations);
router.post('/declarations-2eme-choix',  createDeclaration);

// Rétro-compat CRUD (liste = contrôles)
router.get('/',              getQualiteAvance);
router.post('/',             createQualiteAvance);
router.get('/:id(\\d+)',     getQualiteAvanceById);
router.put('/:id(\\d+)',     updateQualiteAvance);
router.delete('/:id(\\d+)',  deleteQualiteAvance);

export default router;
