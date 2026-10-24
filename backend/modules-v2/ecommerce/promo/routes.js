// routes.js — ecommerce/promo
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();
router.post('/valider',        controller.valider);        // public checkout
router.get('/',                controller.list);
router.get('/:id',             controller.get);
router.post('/',               controller.create);
router.put('/:id',             controller.update);
router.delete('/:id',          controller.remove);
router.post('/:id/utilise',    controller.marquerUtilise); // incrémente usage_courant

export default router;
