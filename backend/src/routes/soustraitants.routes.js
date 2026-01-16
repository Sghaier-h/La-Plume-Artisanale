import express from 'express';
import { 
  getSoustraitants, 
  getSoustraitant, 
  createSoustraitant, 
  updateSoustraitant,
  getMouvementsSoustraitant,
  enregistrerSortie,
  enregistrerRetour,
  getAlertesRetard
} from '../controllers/soustraitants.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getSoustraitants);
router.get('/alertes/retard', authenticate, getAlertesRetard);
router.get('/:id', authenticate, getSoustraitant);
router.get('/:id/mouvements', authenticate, getMouvementsSoustraitant);
router.post('/', authenticate, createSoustraitant);
router.put('/:id', authenticate, updateSoustraitant);
router.post('/:id/sortie', authenticate, enregistrerSortie);
router.post('/:id/retour', authenticate, enregistrerRetour);

export default router;
