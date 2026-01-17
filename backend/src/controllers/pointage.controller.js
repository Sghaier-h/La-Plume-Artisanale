import { pool } from '../utils/db.js';

/**
 * Récupérer tous les pointages
 * GET /api/pointage
 */
export const getAllPointages = async (req, res) => {
  try {
    const { limit = 100, offset = 0, date, user_id } = req.query;

    let query = `
      SELECT 
        p.id,
        p.timemoto_id,
        p.user_id,
        e.nom,
        e.prenom,
        e.fonction,
        e.email,
        e.timemoto_user_id,
        p.date,
        p.check_in,
        p.check_out,
        p.heures_travaillees,
        p.present,
        p.retard_minutes,
        CASE WHEN p.retard_minutes > 0 THEN true ELSE false END as a_retard,
        p.created_at,
        p.updated_at
      FROM pointage p
      LEFT JOIN equipe e ON p.user_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (date) {
      query += ` AND p.date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND p.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    query += ` ORDER BY p.date DESC, p.check_in DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Récupérer le nombre total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM pointage p
      WHERE 1=1
    `;
    const countParams = [];
    let countIndex = 1;

    if (date) {
      countQuery += ` AND p.date = $${countIndex}`;
      countParams.push(date);
      countIndex++;
    }

    if (user_id) {
      countQuery += ` AND p.user_id = $${countIndex}`;
      countParams.push(user_id);
      countIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total) || 0;

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('[Pointage] Erreur récupération pointages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Récupérer le statut actuel de chaque personne (présent/absent aujourd'hui)
 * GET /api/pointage/statut
 */
export const getStatutPersonnes = async (req, res) => {
  try {
    const { date } = req.query;
    const datePointage = date || new Date().toISOString().split('T')[0]; // Aujourd'hui par défaut

    // Récupérer tous les membres de l'équipe avec leur statut aujourd'hui
    const query = `
      SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.fonction,
        e.email,
        e.matricule,
        e.timemoto_user_id,
        e.actif,
        p.id as pointage_id,
        p.date as pointage_date,
        p.check_in,
        p.check_out,
        p.heures_travaillees,
        p.present,
        p.retard_minutes,
        CASE 
          WHEN p.id IS NOT NULL THEN 
            CASE WHEN p.present THEN 'present' ELSE 'absent' END
          ELSE 'non_pointe'
        END as statut,
        CASE 
          WHEN p.id IS NOT NULL THEN true
          ELSE false
        END as a_pointe
      FROM equipe e
      LEFT JOIN pointage p ON e.id = p.user_id AND p.date = $1
      WHERE e.actif = true
      ORDER BY 
        CASE 
          WHEN p.id IS NOT NULL THEN 
            CASE WHEN p.present THEN 1 ELSE 2 END
          ELSE 3
        END,
        e.nom, e.prenom
    `;

    const result = await pool.query(query, [datePointage]);

    // Statistiques
    const stats = {
      total: result.rows.length,
      presents: result.rows.filter(r => r.statut === 'present').length,
      absents: result.rows.filter(r => r.statut === 'absent').length,
      non_pointes: result.rows.filter(r => r.statut === 'non_pointe').length,
      date: datePointage
    };

    res.json({
      success: true,
      date: datePointage,
      statistiques: stats,
      personnes: result.rows
    });
  } catch (error) {
    console.error('[Pointage] Erreur récupération statut:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Récupérer les résumés mensuels
 * GET /api/pointage/resumes
 */
export const getResumesMensuels = async (req, res) => {
  try {
    const { mois, user_id } = req.query;

    let query = `
      SELECT 
        pr.id,
        pr.user_id,
        e.nom,
        e.prenom,
        e.fonction,
        e.email,
        pr.mois,
        pr.total_heures,
        pr.total_jours_presents,
        pr.total_jours_absents,
        pr.total_retards,
        pr.total_minutes_retard,
        pr.created_at,
        pr.updated_at
      FROM pointage_resume pr
      LEFT JOIN equipe e ON pr.user_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (mois) {
      query += ` AND pr.mois = $${paramIndex}`;
      params.push(mois);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND pr.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    query += ` ORDER BY pr.mois DESC, e.nom, e.prenom`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[Pointage] Erreur récupération résumés:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Récupérer les statistiques globales
 * GET /api/pointage/stats
 */
export const getStatistiques = async (req, res) => {
  try {
    const stats = {
      total_pointages: 0,
      pointages_ce_mois: 0,
      pointages_aujourdhui: 0,
      utilisateurs_timemoto: 0,
      resumes_mensuels: 0,
      personnes_actives: 0
    };

    // Total pointages
    const totalPointages = await pool.query('SELECT COUNT(*) as total FROM pointage');
    stats.total_pointages = parseInt(totalPointages.rows[0].total) || 0;

    // Pointages ce mois
    const pointagesMois = await pool.query(`
      SELECT COUNT(*) as total
      FROM pointage
      WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    stats.pointages_ce_mois = parseInt(pointagesMois.rows[0].total) || 0;

    // Pointages aujourd'hui
    const pointagesAujourdhui = await pool.query(`
      SELECT COUNT(*) as total
      FROM pointage
      WHERE date = CURRENT_DATE
    `);
    stats.pointages_aujourdhui = parseInt(pointagesAujourdhui.rows[0].total) || 0;

    // Utilisateurs TimeMoto
    const usersTimemoto = await pool.query(`
      SELECT COUNT(*) as total
      FROM equipe
      WHERE timemoto_user_id IS NOT NULL AND actif = true
    `);
    stats.utilisateurs_timemoto = parseInt(usersTimemoto.rows[0].total) || 0;

    // Résumés mensuels
    const resumes = await pool.query('SELECT COUNT(*) as total FROM pointage_resume');
    stats.resumes_mensuels = parseInt(resumes.rows[0].total) || 0;

    // Personnes actives
    const actives = await pool.query('SELECT COUNT(*) as total FROM equipe WHERE actif = true');
    stats.personnes_actives = parseInt(actives.rows[0].total) || 0;

    res.json({
      success: true,
      statistiques: stats
    });
  } catch (error) {
    console.error('[Pointage] Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
