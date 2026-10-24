import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { getStockMP, getStockPF, createTransfert } from '../controllers/stock-legacy.controller.js';
import {
  getMouvements, getMouvementById, createMouvement, updateMouvement, deleteMouvement,
} from '../controllers/mouvements.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/mp', getStockMP);
router.get('/pf', getStockPF);
router.post('/transferts', createTransfert);

// Mouvements de stock (CRUD)
router.get('/mouvements',            getMouvements);
router.post('/mouvements',           createMouvement);
router.get('/mouvements/:id(\\d+)',  getMouvementById);
router.put('/mouvements/:id(\\d+)',  updateMouvement);
router.delete('/mouvements/:id(\\d+)', deleteMouvement);

export default router;
