/**
 * Routes Portail Client — montées sur /api/portail
 */
import express from 'express';
import { portailAuth } from '../../../src/middleware/portail-auth.middleware.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  login, logout, forgotPassword, resetPassword, me, changePassword,
  getCommandes, getCommandeDetail,
  getFactures, getFacturePdf,
  getBLs, getBLPdf,
  getDevis, accepterDevis, getDevisPdf,
  getDemandes, createDemande,
  getStats,
  adminSetPortailAccess, adminResetPortail
} from '../controllers/portail-client.controller.js';

const router = express.Router();

// ── Public
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ── Admin (utilise JWT ERP normal). Exposés aussi sous /api/portail/admin
router.put('/admin/clients/:id_client(\\d+)/portail-access', authenticate, adminSetPortailAccess);
router.post('/admin/clients/:id_client(\\d+)/reset-portail', authenticate, adminResetPortail);

// ── Client (JWT portail)
router.use(portailAuth);

router.get('/me', me);
router.post('/change-password', changePassword);
router.get('/stats', getStats);

router.get('/commandes', getCommandes);
router.get('/commandes/:id_commande(\\d+)', getCommandeDetail);

router.get('/factures', getFactures);
router.get('/factures/:id(\\d+)/pdf', getFacturePdf);

router.get('/bons-livraison', getBLs);
router.get('/bons-livraison/:id(\\d+)/pdf', getBLPdf);

router.get('/devis', getDevis);
router.get('/devis/:id(\\d+)/pdf', getDevisPdf);
router.post('/devis/:id(\\d+)/accepter', accepterDevis);

router.get('/demandes', getDemandes);
router.post('/demandes', createDemande);

export default router;
