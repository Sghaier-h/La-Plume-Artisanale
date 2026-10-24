// routes.js — rh/demandes-rh
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',               ctrl.list);
router.get('/:id',            ctrl.getOne);
router.post('/',              ctrl.create);
router.post('/:id/traiter',   ctrl.traiter);
router.delete('/:id',         ctrl.remove);

export default router;
