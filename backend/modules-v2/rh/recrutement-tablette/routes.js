// routes.js — rh/recrutement-tablette
// Routes publiques (pas d'auth JWT) + rate-limit par IP sur POST /postuler.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from './controller.js';

const router = Router();

// Limiteur : 5 candidatures / 15 min / IP (anti-spam tablette publique)
const postulerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null,
    error: { message: 'Trop de candidatures depuis cette IP, réessayez plus tard.',
             code: 'RATE_LIMIT' } },
});

// Public (tablette accueil candidat)
router.get('/questions-actives', ctrl.questionsActives);
router.post('/postuler',         postulerLimiter, ctrl.postuler);

// Admin RH / RH_MANAGER (consultation)
router.get('/candidatures',           ctrl.listCandidatures);
router.get('/candidatures/:id',       ctrl.getCandidatureDetail);

export default router;
