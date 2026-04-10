import express from 'express';
import { login, logout, me } from '../controllers/auth.controller.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { loginSchema } from '../../../src/middleware/schemas.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
