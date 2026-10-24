import express from 'express';
import { authenticate } from '../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();

router.post('/login',        C.login);
router.post('/verify-2fa',   C.verify2FA);
router.post('/refresh',      C.refresh);

router.post('/logout',       authenticate, C.logout);
router.get ('/sessions',     authenticate, C.sessions);

export default router;
