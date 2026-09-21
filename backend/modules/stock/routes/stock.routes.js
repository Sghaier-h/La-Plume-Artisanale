import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { getStockMP, getStockPF, createTransfert } from '../controllers/stock-legacy.controller.js';

const router = express.Router();

router.get('/mp', authenticate, getStockMP);
router.get('/pf', authenticate, getStockPF);
router.post('/transferts', authenticate, createTransfert);

export default router;
