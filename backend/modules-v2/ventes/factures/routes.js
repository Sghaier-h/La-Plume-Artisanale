// routes.js — factures
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',                ctrl.list);
router.get('/:id',             ctrl.getOne);
router.post('/',               ctrl.create);
router.post('/preview-totaux', ctrl.previewTotaux);   // calcul TVA + timbre sans persister
router.put('/:id',             ctrl.update);
router.delete('/:id',          ctrl.remove);

export default router;
