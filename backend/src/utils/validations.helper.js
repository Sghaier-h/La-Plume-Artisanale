/**
 * Helper pour les validations métier
 * 
 * Utilisation :
 *   import { validateDates, validateQuantities, validateWorkflowStatus } from '../utils/validations.helper.js';
 */

import { pool } from './db.js';

/**
 * Valide que date_debut < date_fin
 * @param {Date|string} dateDebut - Date de début
 * @param {Date|string} dateFin - Date de fin
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateDates = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) {
    return { valid: true }; // Dates optionnelles
  }

  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    return {
      valid: false,
      error: 'Dates invalides'
    };
  }

  if (debut >= fin) {
    return {
      valid: false,
      error: 'La date de début doit être antérieure à la date de fin'
    };
  }

  return { valid: true };
};

/**
 * Valide que date est dans le passé (optionnel avec tolérance)
 * @param {Date|string} date - Date à valider
 * @param {number} toleranceDays - Tolérance en jours (défaut: 0)
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateDateNotFuture = (date, toleranceDays = 0) => {
  if (!date) {
    return { valid: true };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return {
      valid: false,
      error: 'Date invalide'
    };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fin de journée
  const tolerance = new Date(today);
  tolerance.setDate(tolerance.getDate() + toleranceDays);

  if (dateObj > tolerance) {
    return {
      valid: false,
      error: `La date ne peut pas être dans le futur${toleranceDays > 0 ? ` (tolérance: ${toleranceDays} jours)` : ''}`
    };
  }

  return { valid: true };
};

/**
 * Valide les quantités disponibles pour un article avant création d'OF
 * @param {number} idArticle - ID de l'article
 * @param {number} quantiteDemandee - Quantité demandée
 * @param {boolean} checkStock - Vérifier le stock réel (défaut: true)
 * @returns {Promise<Object>} - { valid: boolean, error?: string, disponible?: number }
 */
export const validateQuantiteDisponible = async (idArticle, quantiteDemandee, checkStock = true) => {
  if (!idArticle || !quantiteDemandee || quantiteDemandee <= 0) {
    return {
      valid: false,
      error: 'Quantité invalide'
    };
  }

  if (!checkStock) {
    return { valid: true }; // Pas de vérification stock demandée
  }

  try {
    // Vérifier le stock disponible (matières premières ou produits finis)
    const stockResult = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type_stock = 'MP' THEN quantite_disponible ELSE 0 END), 0) as stock_mp,
        COALESCE(SUM(CASE WHEN type_stock = 'PF' THEN quantite_disponible ELSE 0 END), 0) as stock_pf
      FROM (
        SELECT 'MP' as type_stock, quantite_disponible
        FROM stock_matières_premières
        WHERE id_matiere_premiere = $1 AND statut = 'disponible'
        UNION ALL
        SELECT 'PF' as type_stock, quantite_disponible
        FROM stock_produits_finis
        WHERE id_article = $1 AND statut = 'disponible'
      ) stock_combined`,
      [idArticle]
    );

    const stockDisponible = parseFloat(stockResult.rows[0]?.stock_mp || stockResult.rows[0]?.stock_pf || 0);

    if (stockDisponible < quantiteDemandee) {
      return {
        valid: false,
        error: `Stock insuffisant. Disponible: ${stockDisponible}, Demandé: ${quantiteDemandee}`,
        disponible: stockDisponible
      };
    }

    return {
      valid: true,
      disponible: stockDisponible
    };
  } catch (error) {
    console.error('Erreur validation stock:', error);
    return {
      valid: false,
      error: 'Erreur lors de la vérification du stock'
    };
  }
};

/**
 * Valide le statut de workflow pour empêcher modifications inappropriées
 * @param {string} tableName - Nom de la table
 * @param {number} id - ID de l'enregistrement
 * @param {string} currentStatus - Statut actuel
 * @param {Array<string>} forbiddenStatuses - Statuts interdits pour modification
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateWorkflowStatus = (currentStatus, forbiddenStatuses = []) => {
  if (!currentStatus || !forbiddenStatuses || forbiddenStatuses.length === 0) {
    return { valid: true };
  }

  if (forbiddenStatuses.includes(currentStatus)) {
    return {
      valid: false,
      error: `Impossible de modifier un enregistrement avec le statut "${currentStatus}"`
    };
  }

  return { valid: true };
};

/**
 * Règles de statut par table
 */
export const WORKFLOW_RULES = {
  factures: {
    forbiddenStatuses: ['PAYEE', 'ANNULEE'],
    messages: {
      PAYEE: 'Impossible de modifier une facture payée',
      ANNULEE: 'Impossible de modifier une facture annulée'
    }
  },
  devis: {
    forbiddenStatuses: ['TRANSFORME'],
    messages: {
      TRANSFORME: 'Impossible de modifier un devis transformé en commande'
    }
  },
  commandes: {
    forbiddenStatuses: ['LIVREE', 'ANNULEE'],
    messages: {
      LIVREE: 'Impossible de modifier une commande livrée',
      ANNULEE: 'Impossible de modifier une commande annulée'
    }
  },
  ordres_fabrication: {
    forbiddenStatuses: ['TERMINE', 'ANNULE'],
    messages: {
      TERMINE: 'Impossible de modifier un OF terminé',
      ANNULE: 'Impossible de modifier un OF annulé'
    }
  },
  bons_livraison: {
    forbiddenStatuses: ['LIVRE', 'ANNULE'],
    messages: {
      LIVRE: 'Impossible de modifier un bon de livraison livré',
      ANNULE: 'Impossible de modifier un bon de livraison annulé'
    }
  }
};

/**
 * Valide le statut de workflow pour une table spécifique
 * @param {string} tableName - Nom de la table
 * @param {string} currentStatus - Statut actuel
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateWorkflowStatusForTable = (tableName, currentStatus) => {
  const rules = WORKFLOW_RULES[tableName];
  if (!rules) {
    return { valid: true }; // Pas de règles pour cette table
  }

  if (rules.forbiddenStatuses.includes(currentStatus)) {
    const message = rules.messages[currentStatus] || `Impossible de modifier avec le statut "${currentStatus}"`;
    return {
      valid: false,
      error: message
    };
  }

  return { valid: true };
};

/**
 * Valide l'intégrité référentielle (ex: client existe, article existe)
 * @param {string} tableName - Nom de la table à vérifier
 * @param {string} idColumn - Nom de la colonne ID
 * @param {number} id - ID à vérifier
 * @param {boolean} mustBeActive - Doit être actif (défaut: false)
 * @returns {Promise<Object>} - { valid: boolean, error?: string, exists?: boolean }
 */
export const validateReferentialIntegrity = async (tableName, idColumn, id, mustBeActive = false) => {
  if (!id) {
    return {
      valid: false,
      error: `${idColumn} requis`
    };
  }

  try {
    let query = `SELECT ${idColumn} FROM ${tableName} WHERE ${idColumn} = $1`;
    const params = [id];

    if (mustBeActive) {
      query += ' AND actif = true';
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return {
        valid: false,
        error: `${tableName} avec ${idColumn} ${id} non trouvé${mustBeActive ? ' ou inactif' : ''}`,
        exists: false
      };
    }

    return {
      valid: true,
      exists: true
    };
  } catch (error) {
    console.error(`Erreur validation intégrité ${tableName}:`, error);
    return {
      valid: false,
      error: `Erreur lors de la vérification ${tableName}`
    };
  }
};

/**
 * Valide une quantité positive
 * @param {number} quantite - Quantité à valider
 * @param {number} min - Minimum autorisé (défaut: 0)
 * @param {number} max - Maximum autorisé (défaut: null)
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateQuantite = (quantite, min = 0, max = null) => {
  if (quantite === undefined || quantite === null) {
    return {
      valid: false,
      error: 'Quantité requise'
    };
  }

  const qte = parseFloat(quantite);

  if (isNaN(qte)) {
    return {
      valid: false,
      error: 'Quantité doit être un nombre'
    };
  }

  if (qte <= min) {
    return {
      valid: false,
      error: `Quantité doit être supérieure à ${min}`
    };
  }

  if (max !== null && qte > max) {
    return {
      valid: false,
      error: `Quantité ne peut pas dépasser ${max}`
    };
  }

  return { valid: true };
};

/**
 * Valide un montant positif
 * @param {number} montant - Montant à valider
 * @param {number} min - Minimum autorisé (défaut: 0)
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateMontant = (montant, min = 0) => {
  if (montant === undefined || montant === null) {
    return {
      valid: false,
      error: 'Montant requis'
    };
  }

  const mont = parseFloat(montant);

  if (isNaN(mont)) {
    return {
      valid: false,
      error: 'Montant doit être un nombre'
    };
  }

  if (mont < min) {
    return {
      valid: false,
      error: `Montant doit être supérieur ou égal à ${min}`
    };
  }

  return { valid: true };
};
