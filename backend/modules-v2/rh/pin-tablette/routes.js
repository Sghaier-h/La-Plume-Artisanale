// routes.js — rh/pin-tablette
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

// Admin RH : gestion des PIN
router.get('/',                       ctrl.list);
router.get('/:idEmploye',             ctrl.getOne);
router.put('/:idEmploye',             ctrl.setPin);
router.post('/:idEmploye/debloquer',  ctrl.debloquer);

// Entrée publique tablette (POST /authenticate) — montée sous /auth/pin-tablette
// par le routeur maître ; ici on l'expose aussi sous /authenticate pour que
// l'URL /api/v2/rh/pin-tablette/authenticate fonctionne.
router.post('/authenticate',          ctrl.authenticate);

export default router;
