// routes.js — personnalisation/referentiels
// Endpoints de lecture des référentiels du configurateur.
// GET publics (utilisés par le front public + configurateur B2C §5.8.8).
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();

router.get('/zones',         controller.listZones);
router.get('/polices',       controller.listPolices);
router.get('/fils-couleurs', controller.listFilsCouleurs);

export default router;
