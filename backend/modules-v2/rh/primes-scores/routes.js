// routes.js — rh/primes-scores
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate } from '../../_shared/authMiddleware.js';

function requireRhManager(req, res, next) {
  const u = req.user;
  if (!u) return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Non authentifié' } });
  const role = u.role_principal;
  const roles = Array.isArray(u.roles) ? u.roles : [];
  if (role === 'ADMIN' || role === 'RH_MANAGER' || roles.includes('ADMIN') || roles.includes('RH_MANAGER')) return next();
  return res.status(403).json({ success: false, error: { code: 'forbidden', message: 'ADMIN ou RH_MANAGER requis' } });
}

const router = Router();

router.get('/',    ctrl.list);
router.get('/employe/:id/semaine/:annee/:numero_semaine', ctrl.cumulSemaine);
router.get('/:id', ctrl.getOne);

router.post('/',                          authenticate, requireRhManager, ctrl.create);
router.put('/:id',                        authenticate, requireRhManager, ctrl.update);
router.delete('/:id',                     authenticate, requireRhManager, ctrl.remove);
router.post('/bulk-calcul-journalier',    authenticate, requireRhManager, ctrl.bulkCalcul);

export default router;
