/**
 * Contrôleur ExcelImport — Import de données Excel (templates + preview + upload)
 *
 * Endpoints:
 *   GET  /api/excel-import/templates    — Templates prédéfinis
 *   POST /api/excel-import/preview      — Prévisualisation du fichier
 *   POST /api/excel-import/upload       — Upload et queue d'import
 *   GET  /api/excel-import              — Historique des imports
 *   GET  /api/excel-import/:id          — Détail
 *   DELETE /api/excel-import/:id        — Supprime
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

// Migration idempotente : colonnes d'import
(async () => {
  try {
    await pool.query(`
      ALTER TABLE excel_import
        ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(80),
        ADD COLUMN IF NOT EXISTS imported_rows INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS error_rows INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS imported_by INTEGER,
        ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS mapping_config JSONB,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'queued'
    `);
  } catch (err) {
    console.warn('[excel-import] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── Templates prédéfinis ────────────────────────────────────────
const TEMPLATES = [
  {
    code: 'articles',
    libelle: 'Articles catalogue',
    entity_type: 'articles_catalogue',
    columns: ['code_article', 'designation', 'famille', 'sous_famille', 'unite', 'prix_vente', 'prix_achat', 'tva', 'actif'],
  },
  {
    code: 'clients',
    libelle: 'Clients',
    entity_type: 'clients',
    columns: ['code_client', 'raison_sociale', 'contact', 'email', 'telephone', 'adresse', 'ville', 'code_postal', 'pays', 'matricule_fiscal'],
  },
  {
    code: 'commandes',
    libelle: 'Commandes clients',
    entity_type: 'commandes',
    columns: ['numero_commande', 'date_commande', 'code_client', 'code_article', 'quantite', 'prix_unitaire', 'date_livraison_prevue'],
  },
  {
    code: 'matieres-premieres',
    libelle: 'Matières premières',
    entity_type: 'matieres_premieres',
    columns: ['code_matiere', 'designation', 'famille', 'unite', 'stock_initial', 'stock_min', 'prix_achat', 'fournisseur_principal'],
  },
  {
    code: 'employes',
    libelle: 'Employés',
    entity_type: 'employes',
    columns: ['matricule', 'nom', 'prenom', 'email', 'telephone', 'poste', 'departement', 'date_embauche', 'salaire_base'],
  },
  {
    code: 'lots-coupe',
    libelle: 'Lots de coupe',
    entity_type: 'lots_coupe',
    columns: ['numero_lot', 'date_lot', 'code_modele', 'quantite_pieces', 'metrage_utilise', 'responsable', 'statut'],
  },
];

// ─── GET /api/excel-import/templates ─────────────────────────────
export const getImportTemplates = async (req, res) => {
  try {
    return sendSuccess(res, { items: TEMPLATES, total: TEMPLATES.length });
  } catch (error) {
    return handleError(res, error, 'getImportTemplates');
  }
};

// ─── POST /api/excel-import/preview ──────────────────────────────
export const previewImport = async (req, res) => {
  try {
    const { template_code, base64_file } = req.body || {};
    if (!template_code) return sendError(res, 'template_code requis', 400);

    const template = TEMPLATES.find(t => t.code === template_code);
    if (!template) return sendError(res, `Template '${template_code}' inconnu`, 400);

    // Placeholder : parsing xlsx non implémenté (xlsx lib dispo mais fichier non stocké)
    return res.status(202).json({
      success: true,
      data: {
        template: template.code,
        entity_type: template.entity_type,
        expected_columns: template.columns,
        preview_rows: [],
        estimated_import: 0,
        errors: [],
        file_received: !!base64_file,
        note: 'Preview — parsing xlsx not yet implemented. Configure a xlsx parser lib.',
      },
      message: 'Preview stub',
    });
  } catch (error) {
    return handleError(res, error, 'previewImport');
  }
};

// ─── POST /api/excel-import/upload ───────────────────────────────
export const uploadImport = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const { template_code, base64_file, filename, mapping_config } = req.body || {};
    if (!template_code) return sendError(res, 'template_code requis', 400);

    const template = TEMPLATES.find(t => t.code === template_code);
    if (!template) return sendError(res, `Template '${template_code}' inconnu`, 400);

    const r = await pool.query(
      `INSERT INTO excel_import
         (filename, entity_type, imported_rows, error_rows, imported_by, imported_at, mapping_config, status, created_at, created_by)
       VALUES ($1, $2, 0, 0, $3, NOW(), $4, 'queued', NOW(), $3)
       RETURNING id_excel AS id, filename, entity_type, status, imported_by, imported_at`,
      [
        filename || `${template_code}.xlsx`,
        template.entity_type,
        userId,
        mapping_config ? JSON.stringify(mapping_config) : null,
      ]
    );

    const row = r.rows[0];

    // Émettre l'événement Socket.IO
    try {
      const io = await getIo();
      if (io) io.emit('excel-import:queued', row);
    } catch {}

    return res.status(202).json({
      success: true,
      data: {
        ...row,
        template: template.code,
        expected_columns: template.columns,
        file_received: !!base64_file,
        preview_rows: [],
        estimated_import: 0,
        errors: [],
      },
      message: 'Import queued — parsing xlsx not yet implemented. Configure a xlsx parser lib.',
    });
  } catch (error) {
    return handleError(res, error, 'uploadImport');
  }
};

// ─── GET /api/excel-import ───────────────────────────────────────
export const getExcelImport = async (req, res) => {
  try {
    const { entity_type, status, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['1=1'];

    if (entity_type) { params.push(entity_type); where.push(`entity_type = $${params.length}`); }
    if (status) { params.push(status); where.push(`status = $${params.length}`); }

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT e.id_excel AS id, e.filename, e.entity_type, e.imported_rows, e.error_rows,
             e.imported_by, e.imported_at, e.status, e.mapping_config, e.created_at,
             u.nom AS user_nom, u.prenom AS user_prenom, u.email AS user_email
      FROM excel_import e
      LEFT JOIN utilisateurs u ON e.imported_by = u.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY e.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getExcelImport');
  }
};

// ─── GET /api/excel-import/:id ───────────────────────────────────
export const getExcelImportById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`SELECT * FROM excel_import WHERE id_excel = $1`, [id]);
    if (r.rows.length === 0) return sendError(res, 'Import non trouvé', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getExcelImportById');
  }
};

// ─── POST /api/excel-import (legacy) ─────────────────────────────
export const createExcelImport = async (req, res) => uploadImport(req, res);

// ─── PUT /api/excel-import/:id ───────────────────────────────────
export const updateExcelImport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const { status, imported_rows, error_rows } = req.body || {};
    const r = await pool.query(
      `UPDATE excel_import
         SET status = COALESCE($2, status),
             imported_rows = COALESCE($3, imported_rows),
             error_rows = COALESCE($4, error_rows),
             updated_at = NOW(), updated_by = $5
       WHERE id_excel = $1 RETURNING *`,
      [id, status ?? null, imported_rows ?? null, error_rows ?? null, userId]
    );
    if (r.rows.length === 0) return sendError(res, 'Import non trouvé', 404);

    try {
      const io = await getIo();
      if (io) io.emit('excel-import:updated', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Import mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateExcelImport');
  }
};

// ─── DELETE /api/excel-import/:id ────────────────────────────────
export const deleteExcelImport = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`DELETE FROM excel_import WHERE id_excel = $1 RETURNING id_excel`, [id]);
    if (r.rows.length === 0) return sendError(res, 'Import non trouvé', 404);
    return sendSuccess(res, { id: r.rows[0].id_excel }, 'Supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteExcelImport');
  }
};
