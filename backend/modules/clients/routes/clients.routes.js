/**
 * Routes Clients - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { createClientSchema } from '../../../src/middleware/schemas.js';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  determinerTypeClient,
  getCategories as getCategoriesClients,
  getTypesCommerciaux
} from '../controllers/clients-crud.controller.js';
import {
  getAdressesClient,
  createAdresseClient,
  updateAdresseClient,
  deleteAdresseClient
} from '../controllers/adresses.controller.js';
import {
  getContactsClient,
  createContactClient,
  updateContactClient,
  deleteContactClient
} from '../controllers/contacts.controller.js';

const router = express.Router();

// Routes principales clients
router.get('/', authenticate, getClients);
router.get('/categories', authenticate, getCategoriesClients);
router.get('/types-commerciaux', authenticate, getTypesCommerciaux);
router.get('/:id', authenticate, getClient);
router.get('/:id/stats', authenticate, getClientStats);
router.post('/', authenticate, validate(createClientSchema), createClient);
router.put('/:id', authenticate, updateClient);
router.delete('/:id', authenticate, deleteClient);
router.post('/:id/determiner-type', authenticate, determinerTypeClient);

// Routes adresses
router.get('/:id/adresses', authenticate, getAdressesClient);
router.post('/:id/adresses', authenticate, createAdresseClient);
router.put('/:id/adresses/:id_adresse', authenticate, updateAdresseClient);
router.delete('/:id/adresses/:id_adresse', authenticate, deleteAdresseClient);

// Routes contacts
router.get('/:id/contacts', authenticate, getContactsClient);
router.post('/:id/contacts', authenticate, createContactClient);
router.put('/:id/contacts/:id_contact', authenticate, updateContactClient);
router.delete('/:id/contacts/:id_contact', authenticate, deleteContactClient);

export default router;
