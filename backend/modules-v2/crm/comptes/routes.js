import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

// Comptes CRUD
router.get   ('/',                requirePermission('client:consulter'), C.list);
router.post  ('/',                requirePermission('client:creer'),      C.create);
router.get   ('/:id(\\d+)',       requirePermission('client:consulter'), C.get);
router.put   ('/:id(\\d+)',       requirePermission('client:modifier'),  C.update);
router.delete('/:id(\\d+)',       requirePermission('client:archiver'),  C.archive);

// Contacts
router.get   ('/:id(\\d+)/contacts',              requirePermission('client:consulter'), C.listContacts);
router.post  ('/:id(\\d+)/contacts',              requirePermission('contact:gerer'),    C.upsertContact);
router.put   ('/:id(\\d+)/contacts/:idc(\\d+)',   requirePermission('contact:gerer'),    C.upsertContact);
router.delete('/:id(\\d+)/contacts/:idc(\\d+)',   requirePermission('contact:gerer'),    C.deleteContact);

// Adresses
router.get   ('/:id(\\d+)/adresses',              requirePermission('client:consulter'),       C.listAdresses);
router.post  ('/:id(\\d+)/adresses',              requirePermission('adresse_client:gerer'),   C.upsertAdresse);
router.put   ('/:id(\\d+)/adresses/:ida(\\d+)',   requirePermission('adresse_client:gerer'),   C.upsertAdresse);
router.delete('/:id(\\d+)/adresses/:ida(\\d+)',   requirePermission('adresse_client:gerer'),   C.deleteAdresse);

// Historique
router.get   ('/:id(\\d+)/historique',            requirePermission('historique_commercial:consulter'), C.listHistorique);
router.post  ('/:id(\\d+)/historique',            requirePermission('historique_commercial:ajouter'),   C.addHistorique);

export default router;
