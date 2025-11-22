import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// Routes qualité à implémenter
router.get('/nc', (req, res) => {
  res.json({ message: 'Non-conformités - À implémenter' });
});

export default router;

