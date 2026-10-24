// routes.js — publicite/campagnes
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();

// Campagnes
router.get('/',            controller.list);
router.get('/:id',         controller.get);
router.post('/',           controller.create);
router.put('/:id',         controller.update);
router.delete('/:id',      controller.remove);
router.post('/:id/statut', controller.setStatut);

// Créatives nested
router.get('/:id/creatives',                   controller.listCreatives);
router.post('/:id/creatives',                  controller.createCreative);
router.get('/:id/creatives/:creative_id',      controller.getCreative);
router.put('/:id/creatives/:creative_id',      controller.updateCreative);
router.delete('/:id/creatives/:creative_id',   controller.deleteCreative);

export default router;
