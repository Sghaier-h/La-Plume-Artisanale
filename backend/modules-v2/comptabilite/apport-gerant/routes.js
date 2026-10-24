// routes.js — comptabilite/apport-gerant (§14quater.6)
// Accès : ADMIN uniquement.
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import { requireAdmin } from '../../_shared/admin-edit-guard.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin); // §14quater.6 → ADMIN seul peut saisir / consulter

router.post('/saisir',      requirePermission('account.cash.write'), ctrl.saisir);
router.get('/historique',   requirePermission('account.cash.read'),  ctrl.historique);
router.get('/solde-cca',    requirePermission('account.cash.read'),  ctrl.solde);

export default router;
