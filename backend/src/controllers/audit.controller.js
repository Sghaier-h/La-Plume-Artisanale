import { pool } from '../utils/db.js';

// GET /api/audit - Liste des logs d'audit avec filtres
export const getAuditLogs = async (req, res) => {
  try {
    const {
      table_name,
      user_id,
      action,
      record_id,
      date_from,
      date_to,
      search,
      page = 1,
      limit = 50
    } = req.query;

    let query = `
      SELECT 
        id_audit,
        action,
        user_id,
        user_email,
        user_role,
        table_name,
        record_id,
        record_identifier,
        old_values,
        new_values,
        ip_address,
        endpoint,
        method,
        created_at
      FROM v_audit_log
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (table_name) {
      query += ` AND table_name = $${paramIndex}`;
      params.push(table_name);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(parseInt(user_id));
      paramIndex++;
    }

    if (action) {
      query += ` AND action = $${paramIndex}`;
      params.push(action.toUpperCase());
      paramIndex++;
    }

    if (record_id) {
      query += ` AND record_id = $${paramIndex}`;
      params.push(parseInt(record_id));
      paramIndex++;
    }

    if (date_from) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        record_identifier ILIKE $${paramIndex} OR
        user_email ILIKE $${paramIndex} OR
        endpoint ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Compter le total
    const countQuery = query.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Ajouter pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        logs: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur getAuditLogs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/audit/:id - Détails d'un log d'audit
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT *
      FROM v_audit_log
      WHERE id_audit = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Log d\'audit non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getAuditLogById:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/audit/stats/by-table - Statistiques par table
export const getAuditStatsByTable = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM v_audit_stats_by_table
      ORDER BY table_name, action
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAuditStatsByTable:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/audit/stats/by-user - Statistiques par utilisateur
export const getAuditStatsByUser = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM v_audit_stats_by_user
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAuditStatsByUser:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/audit/record/:table/:id - Historique complet d'un enregistrement
export const getRecordHistory = async (req, res) => {
  try {
    const { table, id } = req.params;

    const result = await pool.query(`
      SELECT *
      FROM v_audit_log
      WHERE table_name = $1 AND record_id = $2
      ORDER BY created_at DESC
    `, [table, parseInt(id)]);

    res.json({
      success: true,
      data: {
        table,
        record_id: parseInt(id),
        history: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getRecordHistory:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/audit/tables - Liste des tables auditées
export const getAuditedTables = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT table_name
      FROM audit_log
      ORDER BY table_name
    `);

    res.json({
      success: true,
      data: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Erreur getAuditedTables:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
