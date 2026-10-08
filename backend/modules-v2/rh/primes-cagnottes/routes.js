// routes.js — rh/primes-cagnottes
// Cagnottes hebdomadaires primes rendement HORS BULLETIN (§11bis.7bis).
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate } from '../../_shared/authMiddleware.js';

// Guard ADMIN | RH_MANAGER (le middleware `requirePermission` étant orienté
// permission-codes, on gère ici le role_principal directement).
function requireRhManager(req, res, next) {
  const u = req.user;
  if (!u) return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Non authentifié' } });
  const role = u.role_principal;
  const roles = Array.isArray(u.roles) ? u.roles : [];
  if (role === 'ADMIN' || role === 'RH_MANAGER' || roles.includes('ADMIN') || roles.includes('RH_MANAGER')) {
    return next();
  }
  return res.status(403).json({ success: false, error: { code: 'forbidden', message: 'ADMIN ou RH_MANAGER requis' } });
}

const router = Router();

router.get('/',                                             ctrl.list);
router.get('/:id',                                          ctrl.getOne);
router.post('/',              authenticate, requireRhManager, ctrl.create);
router.put('/:id',            authenticate, requireRhManager, ctrl.update);
router.delete('/:id',         authenticate, requireRhManager, ctrl.remove);

// Endpoints métier
router.post('/:id/calculer',       authenticate, requireRhManager, ctrl.calculer);
router.post('/:id/valider',        authenticate, requireRhManager, ctrl.valider);
router.post('/:id/marquer-payee',  authenticate, requireRhManager, ctrl.marquerPayee);

export default router;
