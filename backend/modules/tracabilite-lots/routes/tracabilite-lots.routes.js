/**
 * Routes Traçabilité Lots — La Plume Artisanale
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getTracabiliteLots,
  getStats,
  getByQrCode,
  getLotsCoupe,
  getLotCoupe,
  createLotCoupe,
  updateLotCoupe,
  changeStatutLot,
  deleteLotCoupe,
  getLotsForOf,
  getChaineTracabilite,
} from '../controllers/tracabilite-lots.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques d'abord (avant :id)
router.get('/stats/global',          getStats);
router.get('/qr/:qr_code',           getByQrCode);
router.get('/of/:id_of(\\d+)',       getLotsForOf);
router.get('/coupe',                 getLotsCoupe);
router.post('/coupe',                createLotCoupe);
router.get('/coupe/:id(\\d+)',       getLotCoupe);
router.put('/coupe/:id(\\d+)',       updateLotCoupe);
router.put('/coupe/:id(\\d+)/statut', changeStatutLot);
router.delete('/coupe/:id(\\d+)',    deleteLotCoupe);
router.get('/:id_lot(\\d+)/chaine',  getChaineTracabilite);

// Liste globale
router.get('/', getTracabiliteLots);

export default router;
