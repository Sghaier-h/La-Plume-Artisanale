// routes.js — documents/photos-boite-tri (§14quater.4)
//
// Routes protégées (JWT) pour la "boîte à trier" des photos justificatives.
// Permissions : ADMIN et COMPTABLE peuvent voir et rattacher.
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

// Lecture : COMPTABLE + ADMIN (le middleware laisse déjà passer ADMIN).
router.get('/',             requirePermission('account.read'),       ctrl.list);
router.get('/count',        requirePermission('account.read'),       ctrl.count);
router.get('/:id',          requirePermission('account.read'),       ctrl.getOne);

// Écriture / rattachement : nécessite la permission écriture compta.
router.post('/upload',               requirePermission('account.move.write'), ctrl.uploadDirect);
router.post('/:id/rattacher',        requirePermission('account.move.write'), ctrl.rattacher);
router.post('/:id/ignorer',          requirePermission('account.move.write'), ctrl.ignorer);
router.post('/:id/en-cours',         requirePermission('account.move.write'), ctrl.marquerEnCours);

export default router;
