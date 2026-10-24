// routes.js — rh/compensations-rh
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',               ctrl.list);
router.get('/:id',            ctrl.getOne);
router.post('/',              ctrl.create);
router.delete('/:id',         ctrl.remove);

router.post('/:id/appliquer', ctrl.appliquer);
router.post('/:id/annuler',   ctrl.annuler);

export default router;
