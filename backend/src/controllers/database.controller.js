import { pool } from '../utils/db.js';

/**
 * Vérifier l'existence des tables de pointage
 * GET /api/database/verifier-tables-pointage
 */
export const verifierTablesPointage = async (req, res) => {
  try {
    const result = {
      connexion: false,
      tables: {
        pointage: false,
        pointage_resume: false,
        equipe_timemoto_user_id: false,
        equipe_temps_travaille_mois: false
      },
      statistiques: null,
      derniers_pointages: null,
      erreur: null
    };

    // Test de connexion
    try {
      await pool.query('SELECT 1');
      result.connexion = true;
    } catch (error) {
      result.erreur = `Erreur de connexion: ${error.message}`;
      return res.status(500).json(result);
    }

    // Vérifier l'existence des tables
    try {
      // Table pointage
      const checkPointage = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'pointage'
        ) as exists;
      `);
      result.tables.pointage = checkPointage.rows[0].exists;

      // Table pointage_resume
      const checkResume = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'pointage_resume'
        ) as exists;
      `);
      result.tables.pointage_resume = checkResume.rows[0].exists;

      // Colonne timemoto_user_id dans equipe
      const checkTimemotoId = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'equipe' AND column_name = 'timemoto_user_id'
        ) as exists;
      `);
      result.tables.equipe_timemoto_user_id = checkTimemotoId.rows[0].exists;

      // Colonne temps_travaille_mois dans equipe
      const checkTempsMois = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'equipe' AND column_name = 'temps_travaille_mois'
        ) as exists;
      `);
      result.tables.equipe_temps_travaille_mois = checkTempsMois.rows[0].exists;

      // Si les tables existent, récupérer les statistiques
      if (result.tables.pointage) {
        const stats = await pool.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE date >= DATE_TRUNC('month', CURRENT_DATE)) as ce_mois,
            COUNT(*) FILTER (WHERE date = CURRENT_DATE) as aujourd_hui
          FROM pointage;
        `);
        result.statistiques = {
          total: parseInt(stats.rows[0].total) || 0,
          ce_mois: parseInt(stats.rows[0].ce_mois) || 0,
          aujourd_hui: parseInt(stats.rows[0].aujourd_hui) || 0
        };

        // Utilisateurs avec timemoto_user_id
        const usersTimemoto = await pool.query(`
          SELECT COUNT(*) as total
          FROM equipe
          WHERE timemoto_user_id IS NOT NULL;
        `);
        result.statistiques.utilisateurs_timemoto = parseInt(usersTimemoto.rows[0].total) || 0;

        // Derniers pointages (10)
        const derniers = await pool.query(`
          SELECT 
            p.id,
            p.timemoto_id,
            COALESCE(e.nom || ' ' || e.prenom, 'Utilisateur ' || p.user_id) as utilisateur,
            p.date,
            p.check_in,
            p.check_out,
            p.heures_travaillees,
            p.present,
            p.retard_minutes,
            p.created_at
          FROM pointage p
          LEFT JOIN equipe e ON p.user_id = e.id
          ORDER BY p.created_at DESC
          LIMIT 10;
        `);
        result.derniers_pointages = derniers.rows;
      }

      // Si pointage_resume existe, compter les résumés
      if (result.tables.pointage_resume) {
        const resumes = await pool.query(`
          SELECT COUNT(*) as total
          FROM pointage_resume;
        `);
        result.statistiques = result.statistiques || {};
        result.statistiques.resumes_mensuels = parseInt(resumes.rows[0].total) || 0;
      }

    } catch (error) {
      result.erreur = `Erreur lors de la vérification: ${error.message}`;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      connexion: false,
      erreur: error.message
    });
  }
};
