/**
 * Helper pour la gestion standardisée des erreurs
 * 
 * Utilisation :
 *   import { sendError, sendSuccess, HTTP_STATUS } from '../utils/error.helper.js';
 */

/**
 * Codes HTTP standardisés
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Messages d'erreur utilisateur-friendly
 */
export const ERROR_MESSAGES = {
  // Général
  REQUIRED_FIELD: (field) => `Le champ "${field}" est requis`,
  INVALID_VALUE: (field) => `Valeur invalide pour le champ "${field}"`,
  NOT_FOUND: (resource) => `${resource} non trouvé(e)`,
  ALREADY_EXISTS: (resource) => `${resource} existe déjà`,
  
  // Authentification
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette ressource',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  INVALID_CREDENTIALS: 'Identifiants incorrects',
  
  // Validation
  INVALID_DATE_RANGE: 'La date de début doit être antérieure à la date de fin',
  INVALID_DATE_FUTURE: 'La date ne peut pas être dans le futur',
  INSUFFICIENT_STOCK: (available, requested) => 
    `Stock insuffisant. Disponible: ${available}, Demandé: ${requested}`,
  INVALID_QUANTITY: (min, max) => 
    max ? `Quantité doit être entre ${min} et ${max}` : `Quantité doit être supérieure à ${min}`,
  INVALID_AMOUNT: (min) => `Montant doit être supérieur ou égal à ${min}`,
  
  // Workflow
  INVALID_STATUS: (status) => `Statut invalide: ${status}`,
  FORBIDDEN_STATUS: (status, resource) => 
    `Impossible de modifier ${resource} avec le statut "${status}"`,
  WORKFLOW_ERROR: (action, resource, reason) => 
    `Impossible de ${action} ${resource}. ${reason}`,
  
  // Référentiel
  REFERENCE_NOT_FOUND: (resource, id) => `${resource} avec ID ${id} non trouvé(e)`,
  REFERENCE_INACTIVE: (resource) => `${resource} est inactif(ve)`,
  
  // Serveur
  SERVER_ERROR: 'Une erreur serveur est survenue. Veuillez réessayer plus tard',
  DATABASE_ERROR: 'Erreur lors de l\'accès à la base de données',
  VALIDATION_ERROR: 'Erreur de validation des données'
};

/**
 * Envoie une réponse d'erreur standardisée
 * @param {Object} res - Response Express
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP (défaut: 500)
 * @param {string} code - Code d'erreur personnalisé (optionnel)
 * @param {Object} details - Détails supplémentaires (optionnel)
 */
export const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = null, details = null) => {
  // Protection : s'assurer que statusCode est un nombre valide
  let codeNum = statusCode;
  if (typeof codeNum !== 'number' || isNaN(codeNum)) {
    // Si statusCode n'est pas un nombre, utiliser la valeur par défaut
    codeNum = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
  
  const response = {
    success: false,
    error: {
      message: message || ERROR_MESSAGES.SERVER_ERROR,
      ...(code && { code }),
      ...(details && { details })
    }
  };

  return res.status(codeNum).json(response);
};

/**
 * Envoie une réponse de succès standardisée
 * @param {Object} res - Response Express
 * @param {Object|Array} data - Données à retourner
 * @param {string} message - Message de succès (optionnel)
 * @param {number} statusCode - Code HTTP (défaut: 200)
 */
export const sendSuccess = (res, data = null, message = null, statusCode = HTTP_STATUS.OK) => {
  // Protection : s'assurer que statusCode est un nombre valide
  let code = statusCode;
  if (typeof code !== 'number' || isNaN(code)) {
    // Si statusCode n'est pas un nombre, utiliser la valeur par défaut
    code = HTTP_STATUS.OK;
  }
  
  const response = {
    success: true,
    ...(data !== null && { data }),
    ...(message && { message })
  };

  return res.status(code).json(response);
};

/**
 * Gère une erreur avec logging et réponse standardisée
 * @param {Object} res - Response Express
 * @param {Error} error - Erreur capturée
 * @param {string} context - Contexte de l'erreur (ex: 'createClient')
 * @param {number} defaultStatus - Code HTTP par défaut (défaut: 500)
 */
export const handleError = (res, error, context = 'unknown', defaultStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  console.error(`Erreur ${context}:`, error);

  // Erreur de validation PostgreSQL
  if (error.code === '23505') { // Unique violation
    return sendError(res, ERROR_MESSAGES.ALREADY_EXISTS('Cet enregistrement'), HTTP_STATUS.CONFLICT);
  }

  if (error.code === '23503') { // Foreign key violation
    return sendError(res, 'Référence invalide dans les données', HTTP_STATUS.BAD_REQUEST);
  }

  if (error.code === '23502') { // Not null violation
    return sendError(res, 'Champ obligatoire manquant', HTTP_STATUS.BAD_REQUEST);
  }

  // Erreur de validation personnalisée
  if (error.validationError) {
    return sendError(res, error.message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR');
  }

  // Erreur métier
  if (error.businessError) {
    return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST, 'BUSINESS_ERROR');
  }

  // Erreur par défaut
  return sendError(res, error.message || ERROR_MESSAGES.SERVER_ERROR, defaultStatus);
};

/**
 * Crée une erreur de validation
 * @param {string} message - Message d'erreur
 * @param {Object} details - Détails de validation
 * @returns {Error} - Erreur avec flag validationError
 */
export const createValidationError = (message, details = null) => {
  const error = new Error(message);
  error.validationError = true;
  if (details) {
    error.details = details;
  }
  return error;
};

/**
 * Crée une erreur métier
 * @param {string} message - Message d'erreur
 * @returns {Error} - Erreur avec flag businessError
 */
export const createBusinessError = (message) => {
  const error = new Error(message);
  error.businessError = true;
  return error;
};

/**
 * Middleware pour gérer les erreurs non capturées
 */
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  handleError(res, error, 'unhandled');
};
