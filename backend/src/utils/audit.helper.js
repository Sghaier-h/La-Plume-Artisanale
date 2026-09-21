/**
 * Helper pour le traçage utilisateur (created_by, updated_by)
 * 
 * Utilisation :
 *   const userId = getUserId(req);
 *   const auditFields = getAuditFields(req, 'create'); // ou 'update'
 */

/**
 * Récupère l'ID de l'utilisateur depuis req.user
 * @param {Object} req - Request Express
 * @returns {number|null} - ID utilisateur ou null
 */
export const getUserId = (req) => {
  if (!req || !req.user) {
    return null;
  }
  
  // req.user.id peut être une string ou un number
  const userId = req.user.id;
  if (!userId) {
    return null;
  }
  
  // Convertir en integer si nécessaire
  return typeof userId === 'string' ? parseInt(userId, 10) : userId;
};

/**
 * Récupère les champs d'audit pour une opération
 * @param {Object} req - Request Express
 * @param {string} operation - 'create' ou 'update'
 * @returns {Object} - { created_by?, updated_by? }
 */
export const getAuditFields = (req, operation = 'create') => {
  const userId = getUserId(req);
  
  if (operation === 'create') {
    return {
      created_by: userId,
      updated_by: null
    };
  } else if (operation === 'update') {
    return {
      updated_by: userId
    };
  }
  
  return {};
};

/**
 * Ajoute les champs d'audit à un objet de données pour INSERT
 * @param {Object} req - Request Express
 * @param {Object} data - Données à insérer
 * @returns {Object} - Données avec created_by ajouté
 */
export const addCreateAudit = (req, data) => {
  const userId = getUserId(req);
  return {
    ...data,
    created_by: userId
  };
};

/**
 * Ajoute les champs d'audit à un objet de données pour UPDATE
 * @param {Object} req - Request Express
 * @param {Object} data - Données à mettre à jour
 * @returns {Object} - Données avec updated_by ajouté
 */
export const addUpdateAudit = (req, data) => {
  const userId = getUserId(req);
  return {
    ...data,
    updated_by: userId
  };
};

/**
 * Construit la clause SET pour UPDATE avec updated_by
 * @param {Object} req - Request Express
 * @param {Array} fields - Tableau de champs à mettre à jour ['field1 = $1', 'field2 = $2']
 * @param {number} paramIndex - Index de paramètre actuel
 * @returns {Object} - { fields: [...], values: [...], paramIndex: number }
 */
export const buildUpdateQuery = (req, fields = [], values = [], paramIndex = 1) => {
  const userId = getUserId(req);
  
  // Ajouter updated_by si userId disponible
  if (userId !== null) {
    fields.push(`updated_by = $${paramIndex}`);
    values.push(userId);
    paramIndex++;
  }
  
  // Ajouter updated_at
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  return {
    fields,
    values,
    paramIndex
  };
};
