// routes.js — ecommerce/comptes-b2b
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();

// CRUD standard
router.get('/',                     controller.list);
router.get('/kyc/pending',          controller.pendingKyc);
router.get('/:id',                  controller.get);
router.post('/',                    controller.create);
router.put('/:id',                  controller.update);
router.delete('/:id',               controller.remove);

// KYC : upload docs + validation
router.post('/:id/kyc/upload',      controller.uploadKyc);
router.post('/:id/kyc/valider',     controller.validerKyc);
router.post('/:id/kyc/refuser',     controller.refuserKyc);
router.post('/:id/kyc/suspendre',   controller.suspendreKyc);

export default router;
