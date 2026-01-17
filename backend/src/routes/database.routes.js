import express from 'express';
import { verifierTablesPointage } from '../controllers/database.controller.js';

const router = express.Router();

// Vérifier les tables de pointage
router.get('/verifier-tables-pointage', verifierTablesPointage);

export default router;
