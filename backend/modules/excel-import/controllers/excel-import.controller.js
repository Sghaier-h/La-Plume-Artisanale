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
import multer from 'multer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// ─── Multer configuration (disk temp storage for xlsx uploads) ───
const XLSX_TMP = path.resolve(process.cwd(), 'uploads', 'tmp');
try { fs.mkdirSync(XLSX_TMP, { recursive: true }); } catch {}

const xlsxStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, XLSX_TMP),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.xlsx';
    cb(null, `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

export const excelUpload = multer({
  storage: xlsxStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    if (!ok) {
      const err = new Error('Extension non supportée (xlsx/xls/csv uniquement)');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

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

// ─── Helpers de parsing xlsx ─────────────────────────────────────
const parseSheetFromBuffer = (buffer) => {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const first = wb.SheetNames[0];
  if (!first) return { rows: [], headers: [] };
  const sheet = wb.Sheets[first];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { rows, headers };
};

const loadBufferFromReq = (req) => {
  if (req.file?.path) return fs.readFileSync(req.file.path);
  const { base64_file } = req.body || {};
  if (base64_file) {
    const clean = String(base64_file).replace(/^data:[^;]+;base64,/, '');
    return Buffer.from(clean, 'base64');
  }
  return null;
};

// ─── POST /api/excel-import/preview ──────────────────────────────
export const previewImport = async (req, res) => {
  try {
    const template_code = req.body?.template_code || req.query?.template_code;
    if (!template_code) return sendError(res, 'template_code requis', 400);

    const template = TEMPLATES.find(t => t.code === template_code);
    if (!template) return sendError(res, `Template '${template_code}' inconnu`, 400);

    const buffer = loadBufferFromReq(req);
    if (!buffer) return sendError(res, 'Fichier requis (multipart "file" ou body.base64_file)', 400);

    const { rows, headers } = parseSheetFromBuffer(buffer);
    const missing_columns = template.columns.filter(c => !headers.includes(c));
    const extra_columns = headers.filter(h => !template.columns.includes(h));

    // Cleanup temp
    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch {} }

    return sendSuccess(res, {
      template: template.code,
      entity_type: template.entity_type,
      expected_columns: template.columns,
      headers,
      missing_columns,
      extra_columns,
      preview_rows: rows.slice(0, 10),
      total_rows: rows.length,
      errors: [],
    }, 'Preview OK');
  } catch (error) {
    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch {} }
    return handleError(res, error, 'previewImport');
  }
};

// ─── Inserters par entity_type ───────────────────────────────────
const ROW_INSERTERS = {
  clients: async (row, userId) => {
    if (!row.code_client || !row.raison_sociale) throw new Error('code_client et raison_sociale requis');
    await pool.query(
      `INSERT INTO clients (code_client, raison_sociale, email, telephone, adresse, ville, code_postal, pays, contact_principal, matricule_fiscal, actif, created_by, date_creation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,NOW())
       ON CONFLICT (code_client) DO NOTHING`,
      [
        String(row.code_client).trim(),
        String(row.raison_sociale).trim(),
        row.email || null,
        row.telephone || null,
        row.adresse || null,
        row.ville || null,
        row.code_postal || null,
        row.pays || null,
        row.contact || row.contact_principal || null,
        row.matricule_fiscal || null,
        userId,
      ]
    );
  },
  matieres_premieres: async (row, userId) => {
    const code = row.code_matiere || row.code_mp;
    if (!code || !row.designation) throw new Error('code_matiere et designation requis');
    await pool.query(
      `INSERT INTO matieres_premieres (code_mp, designation, famille, unite, stock_actuel, stock_min, prix_achat, actif, date_creation, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,CURRENT_TIMESTAMP,$8)
       ON CONFLICT (code_mp) DO NOTHING`,
      [
        String(code).trim(),
        String(row.designation).trim(),
        row.famille || null,
        row.unite || null,
        row.stock_initial != null ? Number(row.stock_initial) : null,
        row.stock_min != null ? Number(row.stock_min) : null,
        row.prix_achat != null ? Number(row.prix_achat) : null,
        userId,
      ]
    );
  },
};

// ─── POST /api/excel-import/upload ───────────────────────────────
export const uploadImport = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const template_code = req.body?.template_code || req.query?.template_code;
    const { mapping_config } = req.body || {};
    const filename = req.file?.originalname || req.body?.filename || `${template_code}.xlsx`;
    if (!template_code) return sendError(res, 'template_code requis', 400);

    const template = TEMPLATES.find(t => t.code === template_code);
    if (!template) return sendError(res, `Template '${template_code}' inconnu`, 400);

    const buffer = loadBufferFromReq(req);
    if (!buffer) return sendError(res, 'Fichier requis (multipart "file" ou body.base64_file)', 400);

    const { rows } = parseSheetFromBuffer(buffer);

    // Créer la ligne excel_import
    const insertRow = await pool.query(
      `INSERT INTO excel_import
         (filename, entity_type, imported_rows, error_rows, imported_by, imported_at, mapping_config, status, created_at, created_by)
       VALUES ($1, $2, 0, 0, $3, NOW(), $4, 'processing', NOW(), $3)
       RETURNING id_excel AS id, filename, entity_type, status, imported_by, imported_at`,
      [
        filename,
        template.entity_type,
        userId,
        mapping_config ? (typeof mapping_config === 'string' ? mapping_config : JSON.stringify(mapping_config)) : null,
      ]
    );
    const importRow = insertRow.rows[0];

    // Exécuter l'import ligne par ligne
    const inserter = ROW_INSERTERS[template.entity_type];
    let imported_rows = 0;
    let error_rows = 0;
    const errors = [];

    if (inserter) {
      for (let i = 0; i < rows.length; i++) {
        try {
          await inserter(rows[i], userId);
          imported_rows++;
        } catch (err) {
          error_rows++;
          if (errors.length < 20) errors.push({ row: i + 2, error: err.message });
        }
      }
    } else {
      errors.push({ error: `Aucun inserter configuré pour '${template.entity_type}' (import métadonnées uniquement)` });
    }

    const final_status = error_rows === 0 ? 'completed' : (imported_rows > 0 ? 'partial' : 'failed');
    const updated = await pool.query(
      `UPDATE excel_import SET imported_rows=$2, error_rows=$3, status=$4, updated_at=NOW(), updated_by=$5
       WHERE id_excel=$1 RETURNING id_excel AS id, filename, entity_type, status, imported_rows, error_rows`,
      [importRow.id, imported_rows, error_rows, final_status, userId]
    );

    // Cleanup temp
    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch {} }

    try {
      const io = await getIo();
      if (io) io.emit('excel-import:completed', updated.rows[0]);
    } catch {}

    return sendSuccess(res, {
      ...updated.rows[0],
      template: template.code,
      expected_columns: template.columns,
      total_rows: rows.length,
      errors,
    }, `Import terminé: ${imported_rows} lignes importées, ${error_rows} erreurs`);
  } catch (error) {
    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch {} }
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
