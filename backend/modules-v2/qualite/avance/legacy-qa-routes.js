/**
 * Routes QualitÃ© AvancÃ©e â€” bridge vers controle_premiere_piece,
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
  // RÃ©tro-compat
  getQualiteAvance, getQualiteAvanceById, createQualiteAvance,
  updateQualiteAvance, deleteQualiteAvance,
} from './legacy-qa-controller.js';

const router = express.Router();
router.use(authenticate);

// Stats
router.get('/stats/global', getStatsGlobal);

// ContrÃ´les premiÃ¨re piÃ¨ce
router.get('/controles',                getControles);
router.post('/controles',               createControle);
router.get('/controles/:id(\\d+)',      getControleById);
router.put('/controles/:id(\\d+)',      updateControle);
router.delete('/controles/:id(\\d+)',   deleteControle);

// Non-conformitÃ©s
router.get('/non-conformites',                       getNonConformites);
router.post('/non-conformites',                      createNonConformite);
router.get('/non-conformites/:id(\\d+)',             getNonConformiteById);
router.put('/non-conformites/:id(\\d+)',             updateNonConformite);
router.put('/non-conformites/:id(\\d+)/traiter',     traiterNonConformite);
router.put('/non-conformites/:id(\\d+)/resoudre',    resoudreNonConformite);
router.put('/non-conformites/:id(\\d+)/valider',     validerNonConformite);

// DÃ©clarations 2Ã¨me choix
router.get('/declarations-2eme-choix',   getDeclarations);
router.post('/declarations-2eme-choix',  createDeclaration);

// RÃ©tro-compat CRUD (liste = contrÃ´les)
router.get('/',              getQualiteAvance);
router.post('/',             createQualiteAvance);
router.get('/:id(\\d+)',     getQualiteAvanceById);
router.put('/:id(\\d+)',     updateQualiteAvance);
router.delete('/:id(\\d+)',  deleteQualiteAvance);

export default router;
