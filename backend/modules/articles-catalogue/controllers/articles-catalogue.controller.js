/**
 * Contrôleur Articles Catalogue
 *
 * Porté depuis la logique GAS 04_Catalogue.gs :
 * - getArticles_cat (avec enrichissement relations)
 * - ajouterArticle_cat (avec génération auto refs)
 * - modifierArticle_cat
 * - supprimerArticle_cat
 * - rechercherArticles (filtres multi-critères)
 * - getValeursDistinctesProduits (pour dropdowns frontend)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';
import { buildReferences, buildDesignation } from '../../../src/services/article-reference.service.js';
import {
  calculateStockForArticle,
  calculateStockForAllArticles,
  getStockBasArticles
} from '../../../src/services/stock-calculation.service.js';
import {
  getStatsVentesArticle,
  getTopArticlesVendus,
  getVentesParModele,
  getDashboardVentes,
  getTopArticlesCommandes
} from '../../../src/services/ventes-analytics.service.js';
import { toCsv, fromCsv, ARTICLES_CATALOGUE_COLUMNS } from '../../../src/services/csv.service.js';
import {
  uploadPhotoToDrive,
  deletePhotoFromDrive,
  extractDriveFileId,
  isDriveEnabled
} from '../../../src/services/google-drive.service.js';
import fs from 'fs';

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue
// Liste paginée + enrichie (JOINs avec tous les paramètres)
// Filtres: search, actif, id_modele, id_dimension, id_couleur, id_finition,
//          id_tissage, id_nombre_couleurs, dans_catalogue_produit
// ─────────────────────────────────────────────────────────────────────
export const getArticlesCatalogue = async (req, res) => {
  try {
    const {
      search, actif, id_modele, id_dimension, id_couleur, id_finition,
      id_tissage, id_nombre_couleurs, dans_catalogue_produit, page, limit
    } = req.query;

    const qb = new QueryBuilder('articles_catalogue', 'a')
      .select([
        'a.id_article', 'a.code_article', 'a.designation',
        'a.ref_commerciale', 'a.ref_fabrication',
        'a.specification', 'a.unite_vente',
        'a.prix_unitaire_base', 'a.prix_vente', 'a.prix_revient',
        'a.temps_production_standard', 'a.qte_minimal_stock',
        'a.description', 'a.image_url', 'a.dans_catalogue_produit',
        'a.actif', 'a.date_creation', 'a.date_modification',
        // Modèle
        'a.id_modele', 'm.code_modele', 'm.libelle as modele_libelle',
        // Dimension
        'a.id_dimension', 'd.code as code_dimension', 'd.libelle as dimension_libelle',
        'd.largeur', 'd.longueur',
        // Couleur
        'a.id_couleur', 'c.code_commercial as couleur_code', 'c.nom as couleur_nom', 'c.code_hex',
        // Finition
        'a.id_finition', 'f.code as code_finition', 'f.libelle as finition_libelle',
        // Tissage
        'a.id_tissage', 't.code as code_tissage', 't.libelle as tissage_libelle',
        // Nombre couleurs
        'a.id_nombre_couleurs', 'nc.code as code_nc', 'nc.libelle as nc_libelle', 'nc.nombre as nc_nombre',
        // Type article
        'a.id_type_article', 'ta.libelle as type_article_libelle'
      ])
      .join('LEFT JOIN parametres_modeles m ON a.id_modele = m.id')
      .join('LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id')
      .join('LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id')
      .join('LEFT JOIN parametres_finitions f ON a.id_finition = f.id')
      .join('LEFT JOIN parametres_tissages t ON a.id_tissage = t.id')
      .join('LEFT JOIN parametres_nombre_couleurs nc ON a.id_nombre_couleurs = nc.id')
      .join('LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article')
      .search(['a.code_article', 'a.designation', 'a.ref_commerciale', 'a.ref_fabrication'], search)
      .whereBool('a.actif = $?', actif)
      .whereIf('a.id_modele = $?', id_modele)
      .whereIf('a.id_dimension = $?', id_dimension)
      .whereIf('a.id_couleur = $?', id_couleur)
      .whereIf('a.id_finition = $?', id_finition)
      .whereIf('a.id_tissage = $?', id_tissage)
      .whereIf('a.id_nombre_couleurs = $?', id_nombre_couleurs)
      .whereBool('a.dans_catalogue_produit = $?', dans_catalogue_produit)
      .orderBy('a.date_creation DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getArticlesCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/valeurs-distinctes
// Retourne les listes uniques pour dropdowns frontend
// Inspiré de getValeursDistinctesProduits() du GAS
// ─────────────────────────────────────────────────────────────────────
export const getValeursDistinctes = async (req, res) => {
  try {
    const [modeles, dimensions, couleurs, finitions, tissages, nc] = await Promise.all([
      pool.query('SELECT id, code_modele, libelle FROM parametres_modeles WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code, libelle FROM parametres_dimensions WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code_commercial, nom FROM parametres_couleurs WHERE actif = true ORDER BY nom'),
      pool.query('SELECT id, code, libelle FROM parametres_finitions WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code, libelle FROM parametres_tissages WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code, libelle, nombre FROM parametres_nombre_couleurs WHERE actif = true ORDER BY nombre')
    ]);

    return sendSuccess(res, {
      modeles: modeles.rows,
      dimensions: dimensions.rows,
      couleurs: couleurs.rows,
      finitions: finitions.rows,
      tissages: tissages.rows,
      nombre_couleurs: nc.rows
    });
  } catch (error) {
    return handleError(res, error, 'getValeursDistinctes');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/:id
// ─────────────────────────────────────────────────────────────────────
export const getArticleCatalogueById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*,
              m.code_modele, m.libelle as modele_libelle,
              d.code as code_dimension, d.libelle as dimension_libelle, d.largeur, d.longueur,
              c.code_commercial as couleur_code, c.nom as couleur_nom, c.code_hex,
              f.code as code_finition, f.libelle as finition_libelle,
              t.code as code_tissage, t.libelle as tissage_libelle,
              nc.code as code_nc, nc.libelle as nc_libelle, nc.nombre as nc_nombre,
              ta.libelle as type_article_libelle
       FROM articles_catalogue a
       LEFT JOIN parametres_modeles m ON a.id_modele = m.id
       LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
       LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id
       LEFT JOIN parametres_finitions f ON a.id_finition = f.id
       LEFT JOIN parametres_tissages t ON a.id_tissage = t.id
       LEFT JOIN parametres_nombre_couleurs nc ON a.id_nombre_couleurs = nc.id
       LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
       WHERE a.id_article = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getArticleCatalogueById');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/articles-catalogue
// Création article + génération auto refs si non fournies
// ─────────────────────────────────────────────────────────────────────
export const createArticleCatalogue = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = { ...req.body };

    // Générer automatiquement les références si manquantes et qu'on a les éléments
    if ((!data.ref_commerciale || !data.ref_fabrication) && data.id_modele && data.id_dimension && data.id_nombre_couleurs) {
      const [modele, dimension, nc] = await Promise.all([
        pool.query('SELECT code_modele FROM parametres_modeles WHERE id = $1', [data.id_modele]),
        pool.query('SELECT code FROM parametres_dimensions WHERE id = $1', [data.id_dimension]),
        pool.query('SELECT code FROM parametres_nombre_couleurs WHERE id = $1', [data.id_nombre_couleurs])
      ]);

      if (modele.rows.length && dimension.rows.length && nc.rows.length) {
        const refs = buildReferences({
          codeModele: modele.rows[0].code_modele,
          codeDimension: dimension.rows[0].code,
          codeNc: nc.rows[0].code,
          selecteurs: data.selecteurs || []
        });
        data.ref_commerciale = data.ref_commerciale || refs.ref_commerciale;
        data.ref_fabrication = data.ref_fabrication || refs.ref_fabrication;
        data.code_article = data.code_article || refs.ref_commerciale;
      }
    }

    // Validation minimale
    if (!data.designation) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('designation'));
    }
    if (!data.code_article) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('code_article'));
    }

    // Champs autorisés pour l'INSERT
    const allowedFields = [
      'code_article', 'designation', 'id_type_article', 'specification',
      'unite_vente', 'prix_unitaire_base', 'temps_production_standard',
      'ref_commerciale', 'ref_fabrication',
      'id_nombre_couleurs', 'id_couleur', 'id_personnalisation',
      'qte_minimal_stock', 'prix_vente', 'prix_revient',
      'id_modele', 'id_dimension', 'id_finition', 'id_tissage',
      'description', 'dans_catalogue_produit', 'image_url', 'actif'
    ];

    const fields = allowedFields.filter(f => data[f] !== undefined);
    const values = fields.map(f => data[f]);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO articles_catalogue (${fields.join(', ')}, date_creation, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;

    const result = await pool.query(query, [...values, userId]);
    logger.info('Article catalogue créé', {
      id: result.rows[0].id_article,
      code: result.rows[0].code_article,
      ref_com: result.rows[0].ref_commerciale
    });

    return sendSuccess(res, result.rows[0], 'Article créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createArticleCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/articles-catalogue/:id
// ─────────────────────────────────────────────────────────────────────
export const updateArticleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;

    const excludedFields = ['id_article', 'date_creation', 'date_modification', 'created_by', 'updated_by'];
    const allowedFields = [
      'code_article', 'designation', 'id_type_article', 'specification',
      'unite_vente', 'prix_unitaire_base', 'temps_production_standard',
      'ref_commerciale', 'ref_fabrication',
      'id_nombre_couleurs', 'id_couleur', 'id_personnalisation',
      'qte_minimal_stock', 'prix_vente', 'prix_revient',
      'id_modele', 'id_dimension', 'id_finition', 'id_tissage',
      'description', 'dans_catalogue_produit', 'image_url', 'actif'
    ];

    const fields = allowedFields.filter(f => data[f] !== undefined && !excludedFields.includes(f));
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const query = `
      UPDATE articles_catalogue
      SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
      WHERE id_article = $${values.length + 2}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    logger.info('Article catalogue mis à jour', { id });
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateArticleCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/articles-catalogue/:id (soft delete)
// ─────────────────────────────────────────────────────────────────────
export const deleteArticleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;

    const result = await pool.query(
      `UPDATE articles_catalogue
       SET actif = false, date_modification = NOW(), updated_by = $1
       WHERE id_article = $2
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    logger.info('Article catalogue désactivé', { id });
    return sendSuccess(res, { message: 'Article désactivé avec succès' });
  } catch (error) {
    return handleError(res, error, 'deleteArticleCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/:id/stock
// Calcul stock multi-source pour un article
// ─────────────────────────────────────────────────────────────────────
export const getStockArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await calculateStockForArticle(id);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getStockArticle');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/stock/tous
// Calcul stock pour tous les articles
// ─────────────────────────────────────────────────────────────────────
export const getStockTousArticles = async (req, res) => {
  try {
    const { only_positive } = req.query;
    const result = await calculateStockForAllArticles({
      onlyPositive: only_positive === 'true'
    });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getStockTousArticles');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/stock/bas
// Articles en stock bas (disponible < minimum)
// Porté de getAnalyseStockBasAlimentation() du GAS
// ─────────────────────────────────────────────────────────────────────
export const getArticlesStockBas = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await getStockBasArticles({ limit });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getArticlesStockBas');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/:id/ventes
// Stats de ventes pour un article
// ─────────────────────────────────────────────────────────────────────
export const getVentesArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_debut, date_fin } = req.query;
    const result = await getStatsVentesArticle(parseInt(id), { date_debut, date_fin });
    if (!result) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getVentesArticle');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/ventes/top
// Top articles vendus (quantité, CA ou marge)
// ─────────────────────────────────────────────────────────────────────
export const getTopVentes = async (req, res) => {
  try {
    const { limit, date_debut, date_fin, order_by } = req.query;
    const result = await getTopArticlesVendus({
      limit: parseInt(limit) || 20,
      date_debut,
      date_fin,
      order_by
    });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getTopVentes');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/commandes/top
// Top articles COMMANDÉS (fallback si pas de factures)
// ─────────────────────────────────────────────────────────────────────
export const getTopCommandes = async (req, res) => {
  try {
    const { limit, date_debut, date_fin } = req.query;
    const result = await getTopArticlesCommandes({
      limit: parseInt(limit) || 20,
      date_debut,
      date_fin
    });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getTopCommandes');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/ventes/par-modele
// Ventes groupées par modèle
// ─────────────────────────────────────────────────────────────────────
export const getVentesParModeleCtrl = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    const result = await getVentesParModele({ date_debut, date_fin });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getVentesParModele');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/ventes/dashboard
// Dashboard ventes — chiffres clés
// ─────────────────────────────────────────────────────────────────────
export const getDashboardVentesCtrl = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    const result = await getDashboardVentes({ date_debut, date_fin });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getDashboardVentes');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/export/csv
// Export CSV de tous les articles (ou filtrés)
// ─────────────────────────────────────────────────────────────────────
export const exportArticlesCsv = async (req, res) => {
  try {
    const { actif, id_modele } = req.query;

    let query = `
      SELECT a.*, m.libelle as modele_libelle, m.code_modele,
             d.code as code_dimension, d.libelle as dimension_libelle,
             f.libelle as finition_libelle,
             t.libelle as tissage_libelle,
             nc.libelle as nc_libelle,
             c.nom as couleur_nom
      FROM articles_catalogue a
      LEFT JOIN parametres_modeles m ON a.id_modele = m.id
      LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
      LEFT JOIN parametres_finitions f ON a.id_finition = f.id
      LEFT JOIN parametres_tissages t ON a.id_tissage = t.id
      LEFT JOIN parametres_nombre_couleurs nc ON a.id_nombre_couleurs = nc.id
      LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id
      WHERE 1=1
    `;
    const params = [];
    if (actif !== undefined) {
      params.push(actif === 'true');
      query += ` AND a.actif = $${params.length}`;
    }
    if (id_modele) {
      params.push(id_modele);
      query += ` AND a.id_modele = $${params.length}`;
    }
    query += ' ORDER BY a.code_article';

    const result = await pool.query(query, params);
    const csv = toCsv(result.rows, ARTICLES_CATALOGUE_COLUMNS);

    const filename = `articles_catalogue_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    logger.info('Export CSV articles', { nb: result.rows.length });
  } catch (error) {
    return handleError(res, error, 'exportArticlesCsv');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/articles-catalogue/import/csv
// Import CSV avec upsert (body: { csv, dry_run? })
// ─────────────────────────────────────────────────────────────────────
export const importArticlesCsv = async (req, res) => {
  try {
    const { csv, dry_run = false } = req.body;
    const userId = getUserId(req) || 1;

    if (!csv) {
      return sendError(res, 'Contenu CSV requis', HTTP_STATUS.BAD_REQUEST);
    }

    const rows = fromCsv(csv);
    if (rows.length === 0) {
      return sendError(res, 'CSV vide ou invalide', HTTP_STATUS.BAD_REQUEST);
    }

    const report = { total: rows.length, created: 0, updated: 0, skipped: 0, errors: [] };

    const headerMap = {
      'Code Article': 'code_article', 'code_article': 'code_article',
      'Désignation': 'designation', 'designation': 'designation',
      'Ref Commerciale': 'ref_commerciale', 'ref_commerciale': 'ref_commerciale',
      'Ref Fabrication': 'ref_fabrication', 'ref_fabrication': 'ref_fabrication',
      'Prix Vente': 'prix_vente', 'prix_vente': 'prix_vente',
      'Prix Revient': 'prix_revient', 'prix_revient': 'prix_revient',
      'Stock Min': 'qte_minimal_stock', 'qte_minimal_stock': 'qte_minimal_stock',
      'Description': 'description', 'description': 'description',
      'Actif': 'actif'
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const data = {};

      for (const [key, value] of Object.entries(row)) {
        const field = headerMap[key];
        if (field && value !== '' && value !== null && value !== undefined) {
          if (field === 'prix_vente' || field === 'prix_revient') {
            data[field] = parseFloat(String(value).replace(',', '.')) || null;
          } else if (field === 'qte_minimal_stock') {
            data[field] = parseInt(value) || 0;
          } else if (field === 'actif') {
            data[field] = ['oui', 'yes', 'true', '1'].includes(String(value).toLowerCase());
          } else {
            data[field] = value;
          }
        }
      }

      if (!data.code_article) {
        report.errors.push({ row: i + 2, error: 'code_article manquant' });
        report.skipped++;
        continue;
      }
      if (!data.designation) {
        report.errors.push({ row: i + 2, error: 'designation manquante' });
        report.skipped++;
        continue;
      }

      if (dry_run) {
        const existing = await pool.query(
          'SELECT id_article FROM articles_catalogue WHERE code_article = $1',
          [data.code_article]
        );
        if (existing.rows.length > 0) report.updated++;
        else report.created++;
        continue;
      }

      try {
        const existing = await pool.query(
          'SELECT id_article FROM articles_catalogue WHERE code_article = $1',
          [data.code_article]
        );

        if (existing.rows.length > 0) {
          const fields = Object.keys(data).filter(k => k !== 'code_article');
          if (fields.length > 0) {
            const values = fields.map(f => data[f]);
            const setClause = fields.map((f, idx) => `${f} = $${idx + 1}`).join(', ');
            await pool.query(
              `UPDATE articles_catalogue SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
               WHERE id_article = $${values.length + 2}`,
              [...values, userId, existing.rows[0].id_article]
            );
            report.updated++;
          } else {
            report.skipped++;
          }
        } else {
          const fields = Object.keys(data);
          const values = fields.map(f => data[f]);
          const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
          await pool.query(
            `INSERT INTO articles_catalogue (${fields.join(', ')}, date_creation, created_by)
             VALUES (${placeholders}, NOW(), $${values.length + 1})`,
            [...values, userId]
          );
          report.created++;
        }
      } catch (err) {
        report.errors.push({ row: i + 2, error: err.message });
        report.skipped++;
      }
    }

    logger.info('Import CSV articles', {
      total: report.total, created: report.created, updated: report.updated,
      errors: report.errors.length, dry_run
    });

    return sendSuccess(res, report, dry_run ? 'Simulation terminée' : 'Import terminé');
  } catch (error) {
    return handleError(res, error, 'importArticlesCsv');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/articles-catalogue/:id/photo
// Upload fichier photo → Google Drive → stocke image_url
// Utilise multer en amont (req.file)
// ─────────────────────────────────────────────────────────────────────
export const uploadPhotoArticle = async (req, res) => {
  let tempFile = null;
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;

    if (!req.file) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Fichier photo requis (champ "photo")');
    }
    tempFile = req.file.path;

    if (!isDriveEnabled()) {
      return sendError(res, HTTP_STATUS.SERVICE_UNAVAILABLE || 503,
        'Google Drive désactivé. Utilisez PUT /api/articles-catalogue/:id avec image_url directement.');
    }

    // Vérifier que l'article existe
    const article = await pool.query(
      'SELECT id_article, code_article, image_url FROM articles_catalogue WHERE id_article = $1',
      [id]
    );
    if (article.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    // Upload sur Drive
    const driveResult = await uploadPhotoToDrive({
      filePath: tempFile,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      prefix: article.rows[0].code_article || `article-${id}`
    });

    // Supprimer l'ancienne photo Drive si elle existe
    const oldUrl = article.rows[0].image_url;
    if (oldUrl) {
      const oldFileId = extractDriveFileId(oldUrl);
      if (oldFileId) {
        try {
          await deletePhotoFromDrive(oldFileId);
        } catch (err) {
          logger.warn('Impossible de supprimer l\'ancienne photo Drive', { oldFileId, error: err.message });
        }
      }
    }

    // Mettre à jour l'article
    const updated = await pool.query(
      `UPDATE articles_catalogue
       SET image_url = $1, date_modification = NOW(), updated_by = $2
       WHERE id_article = $3
       RETURNING id_article, code_article, image_url`,
      [driveResult.publicUrl, userId, id]
    );

    logger.info('Photo article uploadée', { id, fileId: driveResult.fileId });
    return sendSuccess(res, {
      article: updated.rows[0],
      drive: driveResult
    }, 'Photo uploadée sur Google Drive');
  } catch (error) {
    return handleError(res, error, 'uploadPhotoArticle');
  } finally {
    // Nettoyer le fichier temporaire
    if (tempFile && fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch {}
    }
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/articles-catalogue/:id/photo-url
// Associer une URL externe (Drive, CDN, etc.) sans upload
// Body: { image_url: "https://..." }
// ─────────────────────────────────────────────────────────────────────
export const setPhotoUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;
    const userId = getUserId(req) || 1;

    if (!image_url) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('image_url'));
    }

    // Validation URL basique
    try {
      new URL(image_url);
    } catch {
      return sendError(res, 'URL invalide', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await pool.query(
      `UPDATE articles_catalogue
       SET image_url = $1, date_modification = NOW(), updated_by = $2
       WHERE id_article = $3
       RETURNING id_article, code_article, image_url`,
      [image_url, userId, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    logger.info('URL photo mise à jour', { id, url: image_url });
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'setPhotoUrl');
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/articles-catalogue/:id/photo
// Supprime la photo (Drive + BDD)
// ─────────────────────────────────────────────────────────────────────
export const deletePhotoArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;

    const article = await pool.query(
      'SELECT image_url FROM articles_catalogue WHERE id_article = $1',
      [id]
    );
    if (article.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    const oldUrl = article.rows[0].image_url;
    if (oldUrl && isDriveEnabled()) {
      const fileId = extractDriveFileId(oldUrl);
      if (fileId) {
        try { await deletePhotoFromDrive(fileId); } catch {}
      }
    }

    await pool.query(
      'UPDATE articles_catalogue SET image_url = NULL, date_modification = NOW(), updated_by = $1 WHERE id_article = $2',
      [userId, id]
    );

    return sendSuccess(res, { message: 'Photo supprimée' });
  } catch (error) {
    return handleError(res, error, 'deletePhotoArticle');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/stats/top-modeles
// Top modèles par nombre d'articles
// ─────────────────────────────────────────────────────────────────────
export const getStatsTopModeles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      `SELECT m.id, m.code_modele, m.libelle,
              COUNT(a.id_article) as nb_articles,
              COUNT(*) FILTER (WHERE a.actif = true) as nb_actifs
       FROM parametres_modeles m
       LEFT JOIN articles_catalogue a ON a.id_modele = m.id
       WHERE m.actif = true
       GROUP BY m.id, m.code_modele, m.libelle
       ORDER BY nb_articles DESC
       LIMIT $1`,
      [limit]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getStatsTopModeles');
  }
};
