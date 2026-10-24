// routes.js — rh/avances
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',                  ctrl.list);
router.get('/:id',               ctrl.getOne);
router.post('/',                 ctrl.create);
router.put('/:id',               ctrl.update);
router.delete('/:id',            ctrl.remove);

// Workflow
router.post('/:id/approuver',    ctrl.approuver);
router.post('/:id/refuser',      ctrl.refuser);
router.post('/:id/payer',        ctrl.payer);
router.post('/:id/rembourser',   ctrl.rembourser);

export default router;
