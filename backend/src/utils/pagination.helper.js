/**
 * Helper pour la pagination
 * 
 * Utilisation :
 *   import { getPaginationParams, buildPaginationQuery } from '../utils/pagination.helper.js';
 */

/**
 * Récupère les paramètres de pagination depuis req.query
 * @param {Object} req - Request Express
 * @param {number} defaultPageSize - Taille de page par défaut (défaut: 20)
 * @param {number} maxPageSize - Taille de page maximum (défaut: 100)
 * @returns {Object} - { page, limit, offset }
 */
export const getPaginationParams = (req, defaultPageSize = 20, maxPageSize = 100) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
  let limit = parseInt(req.query.limit || String(defaultPageSize), 10) || defaultPageSize;
  
  // Limiter la taille de page maximum
  if (limit > maxPageSize) {
    limit = maxPageSize;
  }
  
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Construit la clause LIMIT/OFFSET pour une requête SQL
 * @param {string} query - Requête SQL de base
 * @param {number} limit - Nombre d'éléments par page
 * @param {number} offset - Nombre d'éléments à sauter
 * @returns {string} - Requête SQL avec LIMIT/OFFSET
 */
export const buildPaginationQuery = (query, limit, offset) => {
  return `${query} LIMIT ${limit} OFFSET ${offset}`;
};

/**
 * Calcule le nombre total de pages
 * @param {number} total - Nombre total d'éléments
 * @param {number} limit - Nombre d'éléments par page
 * @returns {number} - Nombre total de pages
 */
export const getTotalPages = (total, limit) => {
  return Math.ceil(total / limit);
};

/**
 * Construit la réponse paginée standardisée
 * @param {Array} data - Données de la page
 * @param {number} page - Page actuelle
 * @param {number} limit - Taille de page
 * @param {number} total - Nombre total d'éléments
 * @returns {Object} - Réponse paginée standardisée
 */
export const buildPaginationResponse = (data, page, limit, total) => {
  const totalPages = getTotalPages(total, limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Compte le nombre total d'enregistrements pour une requête (sans LIMIT/OFFSET)
 * @param {string} countQuery - Requête COUNT
 * @param {Array} params - Paramètres de la requête
 * @param {Object} pool - Pool de connexion PostgreSQL
 * @returns {Promise<number>} - Nombre total d'enregistrements
 */
export const getTotalCount = async (countQuery, params, pool) => {
  const result = await pool.query(countQuery, params);
  return parseInt(result.rows[0]?.count || '0', 10);
};

/**
 * Construit une requête COUNT à partir d'une requête SELECT
 * @param {string} selectQuery - Requête SELECT
 * @returns {string} - Requête COUNT
 */
export const buildCountQuery = (selectQuery) => {
  // Extraire la partie FROM et WHERE de la requête SELECT
  const fromMatch = selectQuery.match(/FROM\s+(\w+)(?:\s+AS\s+(\w+))?/i);
  const whereMatch = selectQuery.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
  
  if (!fromMatch) {
    throw new Error('Impossible de construire la requête COUNT : FROM non trouvé');
  }

  const tableName = fromMatch[2] || fromMatch[1]; // Alias ou nom de table
  const whereClause = whereMatch ? `WHERE ${whereMatch[1]}` : '';

  return `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
};
