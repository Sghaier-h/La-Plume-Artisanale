import express from 'express';
import {
  getStockMP,
  getStockPF,
  createTransfert,
} from '../controllers/stock.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/mp', getStockMP);
router.get('/pf', getStockPF);
router.post('/transferts', createTransfert);

export default router;

