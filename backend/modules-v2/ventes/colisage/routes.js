// routes.js — colisage
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',                ctrl.list);
router.get('/:id',             ctrl.getOne);
router.post('/',               ctrl.create);
router.put('/:id',             ctrl.update);
router.delete('/:id',          ctrl.remove);
router.post('/:id/fermer',     ctrl.fermer);
router.post('/:id/scan',       ctrl.scanArticle);

export default router;
