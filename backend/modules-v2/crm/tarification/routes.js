import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

// Tarifs
router.get   ('/tarifs',                        requirePermission('tarif:consulter'), C.listTarifs);
router.post  ('/tarifs',                        requirePermission('tarif:creer'),      C.createTarif);
router.get   ('/tarifs/:id(\\d+)',              requirePermission('tarif:consulter'), C.getTarif);
router.put   ('/tarifs/:id(\\d+)',              requirePermission('tarif:modifier'),  C.updateTarif);
router.delete('/tarifs/:id(\\d+)',              requirePermission('tarif:supprimer'), C.deleteTarif);

// Lignes de grille
router.post  ('/tarifs/:id(\\d+)/lignes',                 requirePermission('tarif:modifier'), C.upsertLigne);
router.put   ('/tarifs/:id(\\d+)/lignes/:idl(\\d+)',      requirePermission('tarif:modifier'), C.upsertLigne);
router.delete('/tarifs/:id(\\d+)/lignes/:idl(\\d+)',      requirePermission('tarif:modifier'), C.deleteLigne);

// Remises client
router.get   ('/remises',                       requirePermission('remise:gerer'),   C.listRemises);
router.post  ('/remises',                       requirePermission('remise:gerer'),   C.upsertRemise);
router.put   ('/remises/:id(\\d+)',             requirePermission('remise:gerer'),   C.upsertRemise);
router.delete('/remises/:id(\\d+)',             requirePermission('remise:gerer'),   C.deleteRemise);

// Simulateur prix
router.post  ('/compute',                       requirePermission('tarif:consulter'), C.compute);

export default router;
