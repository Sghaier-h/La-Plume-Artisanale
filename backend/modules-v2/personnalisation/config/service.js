// service.js — personnalisation/config
// Couche métier. Réutilise le CRUD généré et laisse un point d'extension pour
// les validations spécifiques (compat article vs modèle, JSON schema, etc.).
import { baseService } from './model.js';

export const service = {
  ...baseService,
};

export default service;
