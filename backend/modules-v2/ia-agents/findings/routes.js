// routes.js — findings
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',        ctrl.list);
router.get('/:id',     ctrl.getOne);
router.post('/',       ctrl.create);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

// ---------------------------------------------------------------------------
// Workflow correction validée (§14bis.6bis.2)
// - proposer-correction  : l'agent (ou un admin) attache un SQL non destructif à un finding
// - valider-correction   : un ADMIN valide → exécution transactionnelle via ia_correction_bot
// - rollback-correction  : annulation "1 clic" dans la fenêtre 24h
// ---------------------------------------------------------------------------
router.post('/:id/proposer-correction', ctrl.proposerCorrection);
router.post('/:id/valider-correction',  ctrl.validerCorrection);
router.post('/:id/rollback-correction', ctrl.rollbackCorrection);

export default router;
