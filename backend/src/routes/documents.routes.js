import express from 'express';
import {
  genererDossierFabrication,
  exportExcel
} from '../controllers/documents.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/of/:id/dossier-fabrication', authenticate, genererDossierFabrication);
router.get('/export/excel', authenticate, exportExcel);

export default router;
