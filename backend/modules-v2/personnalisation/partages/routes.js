// routes.js — personnalisation/partages
// "Partager mon design" (§5.8.8) : création par un visiteur (auth optionnelle
// pour lier `id_config` et forcer certains champs) + lecture publique du snapshot.
import { Router } from 'express';
import { controller } from './controller.js';
import { authenticate } from '../../_shared/authMiddleware.js';

const router = Router();

// Création : POST public dans le configurateur B2C ; on ne force pas l'auth
// pour permettre au visiteur anonyme de générer son lien.
router.post('/', controller.create);

// Lecture publique par code court (résolution du lien partagé).
router.get('/:code_court', controller.getByCode);

// Tracking business (conversion en panier). Auth pour éviter les abus.
router.post('/:code_court/conversion', authenticate, controller.markConversion);

export default router;
