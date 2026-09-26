// routes.js — rh/tv-atelier
// ATTENTION : `GET /tv/:url_token` est PUBLIC (pas d'auth) : les écrans muraux
// n'ont pas de login. Le token 32-hex sert de secret.
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate } from '../../_shared/authMiddleware.js';

function requireRhOrAdmin(req, res, next) {
  const u = req.user;
  if (!u) return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Non authentifié' } });
  const role = u.role_principal;
  const roles = Array.isArray(u.roles) ? u.roles : [];
  if (role === 'ADMIN' || role === 'RH_MANAGER' || roles.includes('ADMIN') || roles.includes('RH_MANAGER')) return next();
  return res.status(403).json({ success: false, error: { code: 'forbidden', message: 'ADMIN ou RH_MANAGER requis' } });
}

const router = Router();

// Public — TV murales
router.get('/tv/:url_token', ctrl.publicByToken);

// Admin
router.get('/',       authenticate, requireRhOrAdmin, ctrl.list);
router.get('/:id',    authenticate, requireRhOrAdmin, ctrl.getOne);
router.post('/',      authenticate, requireRhOrAdmin, ctrl.create);
router.put('/:id',    authenticate, requireRhOrAdmin, ctrl.update);
router.delete('/:id', authenticate, requireRhOrAdmin, ctrl.remove);
router.post('/:id/snapshot', authenticate, requireRhOrAdmin, ctrl.snapshot);

export default router;
