/**
 * Routes Pointage
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPointage,
  getPointageById,
  createPointage,
  updatePointage,
  deletePointage,
  setCheckIn,
  setCheckOut,
  quickCheckIn,
  quickCheckOut,
  getStatsGlobal,
  getPointageUserToday,
  getPointageUserMonth,
} from '../controllers/pointage.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques AVANT /:id
router.get('/stats/global', getStatsGlobal);
router.get('/user/:user_id(\\d+)/today', getPointageUserToday);
router.get('/user/:user_id(\\d+)/month/:mois', getPointageUserMonth);

router.post('/check-in', quickCheckIn);
router.post('/check-out', quickCheckOut);
router.put('/:id(\\d+)/check-in', setCheckIn);
router.put('/:id(\\d+)/check-out', setCheckOut);

// CRUD standard
router.get('/', getPointage);
router.post('/', createPointage);
router.get('/:id(\\d+)', getPointageById);
router.put('/:id(\\d+)', updatePointage);
router.delete('/:id(\\d+)', deletePointage);

export default router;
