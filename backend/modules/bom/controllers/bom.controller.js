/**
 * Contrôleur BOM — Bill of Materials
 *
 * Porté depuis 09_BOM.gs (GAS) :
 * - getBOMMaster (avec stats par produit/type/fabrication/finition)
 * - creerBOMMasterFromProduit (génération auto code BOM)
 * - CRUD composants avec règle métier duites
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';
import {
  buildCodeBomMaster,
  buildCodeBomComposant,
  computeDuites,
  sumConsommations
} from '../../../src/services/bom.service.js';

// ─────────────────────────────────────────────────────────────────────
// GET /api/bom/master — Liste des BOM Master avec stats
// Équivalent de getBOMMaster() du GAS
// ─────────────────────────────────────────────────────────────────────
export const getBomMaster = async (req, res) => {
  try {
    const { search, code_produit, type_fabrication, id_modele, actif, page, limit } = req.query;

    const qb = new QueryBuilder('bom_master', 'b')
      .select([
        'b.*',
        'm.libelle as modele_libelle',
        'd.code as code_dimensions', 'd.libelle as dimension_libelle',
        't.code as code_tissage', 't.libelle as tissage_libelle',
        'f.code as code_finition', 'f.libelle as finition_libelle',
        'nc.code as code_nombre_couleurs', 'nc.libelle as nombre_couleurs_libelle',
        '(SELECT COUNT(*) FROM bom_composant c WHERE c.id_bom_master = b.id_bom_master) as nb_composants'
      ])
      .join('LEFT JOIN parametres_modeles m ON b.id_modele = m.id')
      .join('LEFT JOIN parametres_dimensions d ON b.id_dimension = d.id')
      .join('LEFT JOIN parametres_tissages t ON b.id_tissage = t.id')
      .join('LEFT JOIN parametres_finitions f ON b.id_finition = f.id')
      .join('LEFT JOIN parametres_nombre_couleurs nc ON b.id_nombre_couleurs = nc.id')
      .search(['b.code_bom_master', 'b.produit_libelle', 'b.code_produit'], search)
      .whereIf('b.code_produit = $?', code_produit)
      .whereIf('b.type_fabrication = $?', type_fabrication)
      .whereIf('b.id_modele = $?', id_modele)
      .whereBool('b.actif = $?', actif)
      .orderBy('b.date_creation DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);

    // Calcul des stats (comme le GAS)
    const statsQuery = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type_fabrication = 'Unique') as unique_count,
        COUNT(*) FILTER (WHERE type_fabrication = 'Composée') as composee_count,
        COUNT(DISTINCT code_produit) as nb_produits,
        COUNT(DISTINCT id_finition) as nb_finitions
      FROM bom_master WHERE actif = true
    `);

    return sendSuccess(res, {
      ...result,
      stats: statsQuery.rows[0]
    });
  } catch (error) {
    return handleError(res, error, 'getBomMaster');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/bom/master/:id — Détail avec composants
// ─────────────────────────────────────────────────────────────────────
export const getBomMasterById = async (req, res) => {
  try {
    const { id } = req.params;

    const master = await pool.query(
      `SELECT b.*,
              m.libelle as modele_libelle,
              d.code as code_dimensions, d.libelle as dimension_libelle,
              t.code as code_tissage, t.libelle as tissage_libelle,
              f.code as code_finition, f.libelle as finition_libelle,
              nc.code as code_nombre_couleurs, nc.libelle as nombre_couleurs_libelle, nc.nombre as nc_nombre
       FROM bom_master b
       LEFT JOIN parametres_modeles m ON b.id_modele = m.id
       LEFT JOIN parametres_dimensions d ON b.id_dimension = d.id
       LEFT JOIN parametres_tissages t ON b.id_tissage = t.id
       LEFT JOIN parametres_finitions f ON b.id_finition = f.id
       LEFT JOIN parametres_nombre_couleurs nc ON b.id_nombre_couleurs = nc.id
       WHERE b.id_bom_master = $1`,
      [id]
    );

    if (master.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('BOM Master'));
    }

    const composants = await pool.query(
      'SELECT * FROM bom_composant WHERE id_bom_master = $1 ORDER BY id_bom_composant',
      [id]
    );

    return sendSuccess(res, {
      ...master.rows[0],
      composants: composants.rows
    });
  } catch (error) {
    return handleError(res, error, 'getBomMasterById');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/bom/master — Création BOM Master (avec génération auto code)
// ─────────────────────────────────────────────────────────────────────
export const createBomMaster = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = { ...req.body };

    // Résoudre les codes depuis les IDs si besoin pour générer le code BOM
    if (!data.code_bom_master && data.id_modele && data.id_dimension) {
      const [modele, dimension, finition, nc] = await Promise.all([
        pool.query('SELECT code_modele FROM parametres_modeles WHERE id = $1', [data.id_modele]),
        pool.query('SELECT code FROM parametres_dimensions WHERE id = $1', [data.id_dimension]),
        data.id_finition
          ? pool.query('SELECT code FROM parametres_finitions WHERE id = $1', [data.id_finition])
          : Promise.resolve({ rows: [{ code: '' }] }),
        data.id_nombre_couleurs
          ? pool.query('SELECT code FROM parametres_nombre_couleurs WHERE id = $1', [data.id_nombre_couleurs])
          : Promise.resolve({ rows: [{ code: '' }] })
      ]);

      if (modele.rows.length && dimension.rows.length) {
        data.code_produit = data.code_produit || modele.rows[0].code_modele;
        data.code_bom_master = buildCodeBomMaster({
          codeProduit: modele.rows[0].code_modele,
          codeDimensions: dimension.rows[0].code,
          codeFinition: finition.rows[0]?.code || '',
          codeNombreCouleur: nc.rows[0]?.code || ''
        });
      }
    }

    if (!data.code_bom_master) {
      return sendError(res, 'code_bom_master requis (ou id_modele + id_dimension)', HTTP_STATUS.BAD_REQUEST);
    }
    if (!data.code_produit) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('code_produit'));
    }

    const result = await pool.query(
      `INSERT INTO bom_master (
        code_bom_master, type, produit_libelle, code_produit,
        id_modele, id_dimension, id_tissage, id_finition, id_nombre_couleurs,
        type_fabrication, actif, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11)
      RETURNING *`,
      [
        data.code_bom_master,
        data.type || null,
        data.produit_libelle || null,
        data.code_produit,
        data.id_modele || null,
        data.id_dimension || null,
        data.id_tissage || null,
        data.id_finition || null,
        data.id_nombre_couleurs || null,
        data.type_fabrication || 'Unique',
        userId
      ]
    );

    logger.info('BOM Master créé', {
      id: result.rows[0].id_bom_master,
      code: result.rows[0].code_bom_master
    });
    return sendSuccess(res, result.rows[0], 'BOM Master créé', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createBomMaster');
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/bom/master/:id
// ─────────────────────────────────────────────────────────────────────
export const updateBomMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;

    const allowed = ['type', 'produit_libelle', 'code_produit', 'id_modele',
      'id_dimension', 'id_tissage', 'id_finition', 'id_nombre_couleurs',
      'type_fabrication', 'actif'];
    const fields = allowed.filter(f => data[f] !== undefined);

    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE bom_master SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
       WHERE id_bom_master = $${values.length + 2}
       RETURNING *`,
      [...values, userId, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('BOM Master'));
    }
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateBomMaster');
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/bom/master/:id (soft delete + composants cascade)
// ─────────────────────────────────────────────────────────────────────
export const deleteBomMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE bom_master SET actif = false, date_modification = NOW() WHERE id_bom_master = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('BOM Master'));
    }
    logger.info('BOM Master désactivé', { id });
    return sendSuccess(res, { message: 'BOM Master désactivé' });
  } catch (error) {
    return handleError(res, error, 'deleteBomMaster');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/bom/composant — Liste
// ─────────────────────────────────────────────────────────────────────
export const getBomComposants = async (req, res) => {
  try {
    const { id_bom_master, code_bom_master, actif, page, limit } = req.query;

    const qb = new QueryBuilder('bom_composant', 'c')
      .select([
        'c.*',
        'm.code_bom_master as parent_code',
        'm.code_produit as parent_code_produit'
      ])
      .join('LEFT JOIN bom_master m ON c.id_bom_master = m.id_bom_master')
      .whereIf('c.id_bom_master = $?', id_bom_master)
      .whereIf('c.code_bom_master = $?', code_bom_master)
      .whereBool('c.actif = $?', actif)
      .orderBy('c.id_bom_composant')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);

    // Enrichir avec la consommation totale
    result.data = result.data.map(c => ({
      ...c,
      consommation_totale: sumConsommations(c)
    }));

    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getBomComposants');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/bom/composant — Création avec règle duites
// ─────────────────────────────────────────────────────────────────────
export const createBomComposant = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = { ...req.body };

    // Valider que le BOM Master existe
    if (!data.id_bom_master && !data.code_bom_master) {
      return sendError(res, 'id_bom_master ou code_bom_master requis', HTTP_STATUS.BAD_REQUEST);
    }

    let master;
    if (data.id_bom_master) {
      master = await pool.query('SELECT * FROM bom_master WHERE id_bom_master = $1', [data.id_bom_master]);
    } else {
      master = await pool.query('SELECT * FROM bom_master WHERE code_bom_master = $1', [data.code_bom_master]);
    }
    if (master.rows.length === 0) {
      return sendError(res, 'BOM Master introuvable', HTTP_STATUS.NOT_FOUND);
    }
    const parent = master.rows[0];

    // Règle métier : calcul automatique des duites manquantes
    const duites = computeDuites(data);
    data.longueur_tissage_cm = duites.longueur_tissage_cm;
    data.duite_par_cm = duites.duite_par_cm;
    data.nombre_duite_total = duites.nombre_duite_total;

    // Générer le code composant si non fourni
    if (!data.code_bom_composant) {
      const existing = await pool.query(
        'SELECT COUNT(*) as n FROM bom_composant WHERE id_bom_master = $1',
        [parent.id_bom_master]
      );
      const variant = parseInt(existing.rows[0].n) + 1;
      data.code_bom_composant = buildCodeBomComposant(parent.code_bom_master, variant);
    }

    const result = await pool.query(
      `INSERT INTO bom_composant (
        code_bom_composant, code_bom_master, id_bom_master, type, produit_libelle,
        consommation_s01, consommation_s02, consommation_s03,
        consommation_s04, consommation_s05, consommation_s06,
        longueur_tissage_cm, largeur_tissage_cm, duite_par_cm, nombre_duite_total,
        machines_compatibles, temps_fabrication_min, bat_image_url, notes,
        actif, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,true,$20)
      RETURNING *`,
      [
        data.code_bom_composant,
        parent.code_bom_master,
        parent.id_bom_master,
        data.type || parent.type || null,
        data.produit_libelle || parent.produit_libelle || null,
        data.consommation_s01 || null,
        data.consommation_s02 || null,
        data.consommation_s03 || null,
        data.consommation_s04 || null,
        data.consommation_s05 || null,
        data.consommation_s06 || null,
        data.longueur_tissage_cm || null,
        data.largeur_tissage_cm || null,
        data.duite_par_cm || null,
        data.nombre_duite_total || null,
        data.machines_compatibles || null,
        data.temps_fabrication_min || null,
        data.bat_image_url || null,
        data.notes || null,
        userId
      ]
    );

    logger.info('BOM Composant créé', {
      id: result.rows[0].id_bom_composant,
      code: result.rows[0].code_bom_composant
    });
    return sendSuccess(res, result.rows[0], 'BOM Composant créé', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createBomComposant');
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/bom/composant/:id — Mise à jour avec re-calcul duites
// ─────────────────────────────────────────────────────────────────────
export const updateBomComposant = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;

    // Appliquer la règle duites si des valeurs tissage sont modifiées
    if (data.longueur_tissage_cm !== undefined || data.duite_par_cm !== undefined || data.nombre_duite_total !== undefined) {
      const current = await pool.query('SELECT * FROM bom_composant WHERE id_bom_composant = $1', [id]);
      if (current.rows.length) {
        const merged = { ...current.rows[0], ...data };
        const duites = computeDuites(merged);
        data.longueur_tissage_cm = duites.longueur_tissage_cm;
        data.duite_par_cm = duites.duite_par_cm;
        data.nombre_duite_total = duites.nombre_duite_total;
      }
    }

    const allowed = [
      'type', 'produit_libelle',
      'consommation_s01', 'consommation_s02', 'consommation_s03',
      'consommation_s04', 'consommation_s05', 'consommation_s06',
      'longueur_tissage_cm', 'largeur_tissage_cm', 'duite_par_cm', 'nombre_duite_total',
      'machines_compatibles', 'temps_fabrication_min', 'bat_image_url', 'notes', 'actif'
    ];
    const fields = allowed.filter(f => data[f] !== undefined);

    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE bom_composant SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
       WHERE id_bom_composant = $${values.length + 2}
       RETURNING *`,
      [...values, userId, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('BOM Composant'));
    }
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateBomComposant');
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/bom/composant/:id
// ─────────────────────────────────────────────────────────────────────
export const deleteBomComposant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE bom_composant SET actif = false, date_modification = NOW() WHERE id_bom_composant = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('BOM Composant'));
    }
    return sendSuccess(res, { message: 'Composant désactivé' });
  } catch (error) {
    return handleError(res, error, 'deleteBomComposant');
  }
};
