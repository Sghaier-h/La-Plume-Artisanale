/**
 * Contrôleur Planification Gantt — arbre projets / tâches / ressources
 *
 * Endpoints :
 *   GET  /api/planification-gantt/projets      — Projets = commandes ayant ≥ 1 OF
 *   GET  /api/planification-gantt/taches       — Tâches Gantt (planning_machines)
 *   GET  /api/planification-gantt/ressources   — Machines + opérateurs
 *   GET  /api/planification-gantt/gantt-data   — Payload combiné
 *   POST /api/planification-gantt/taches       — Créer une tâche Gantt
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// ─── GET /api/planification-gantt/projets ────────────────────────
export const getProjets = async (req, res) => {
  try {
    const sql = `
      SELECT
        cmd.id_commande,
        cmd.numero_commande                   AS numero,
        cli.raison_sociale                    AS client_raison_sociale,
        MIN(of_.date_debut_prevue)            AS date_debut,
        MAX(of_.date_fin_prevue)              AS date_fin,
        COALESCE(AVG(
          CASE WHEN of_.quantite_a_produire > 0
               THEN (of_.quantite_produite::numeric / of_.quantite_a_produire) * 100
               ELSE 0 END
        ), 0)::numeric                        AS pct_avancement,
        COUNT(of_.id_of)::int                 AS nb_of
      FROM commandes cmd
      LEFT JOIN clients cli               ON cmd.id_client = cli.id_client
      INNER JOIN articles_commande ac     ON ac.id_commande = cmd.id_commande
      INNER JOIN ordres_fabrication of_   ON of_.id_article_commande = ac.id_article_commande
      GROUP BY cmd.id_commande, cmd.numero_commande, cli.raison_sociale
      ORDER BY MIN(of_.date_debut_prevue) ASC NULLS LAST
    `;
    const r = await pool.query(sql);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getProjets');
  }
};

// ─── GET /api/planification-gantt/taches ─────────────────────────
export const getTachesGantt = async (req, res) => {
  try {
    const { date_debut, date_fin, id_machine, id_operateur } = req.query;
    const params = [];
    const where = [];

    if (date_debut)   { params.push(date_debut);   where.push(`pm.date_debut_prevue >= $${params.length}`); }
    if (date_fin)     { params.push(date_fin);     where.push(`pm.date_fin_prevue   <= $${params.length}`); }
    if (id_machine)   { params.push(id_machine);   where.push(`pm.id_machine        = $${params.length}`); }
    if (id_operateur) { params.push(id_operateur); where.push(`pm.id_operateur      = $${params.length}`); }

    const sql = `
      SELECT
        pm.id_planning                                                                        AS id,
        COALESCE(of_.numero_of, 'OF-' || pm.id_of)                                            AS name,
        pm.date_debut_prevue                                                                  AS start,
        pm.date_fin_prevue                                                                    AS "end",
        CASE WHEN of_.quantite_a_produire > 0
             THEN LEAST(100, (of_.quantite_produite::numeric / of_.quantite_a_produire) * 100)
             ELSE 0 END                                                                       AS progress,
        pm.statut,
        pm.id_machine                                                                         AS resource_id,
        pm.id_of, pm.id_operateur,
        m.numero_machine                                                                      AS machine_numero,
        e.nom                                                                                 AS operateur_nom,
        e.prenom                                                                              AS operateur_prenom,
        NULL::text                                                                            AS dependencies
      FROM planning_machines pm
      LEFT JOIN ordres_fabrication of_ ON pm.id_of        = of_.id_of
      LEFT JOIN machines m             ON pm.id_machine   = m.id_machine
      LEFT JOIN equipe_fabrication e   ON pm.id_operateur = e.id_operateur
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY pm.date_debut_prevue ASC NULLS LAST
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getTachesGantt');
  }
};

// ─── GET /api/planification-gantt/ressources ─────────────────────
export const getRessources = async (req, res) => {
  try {
    const machines = await pool.query(
      `SELECT id_machine AS id, numero_machine AS name, 'machine' AS type, 8 AS capacity_per_day
       FROM machines
       WHERE (actif IS NULL OR actif = true)
       ORDER BY numero_machine`
    );
    const operateurs = await pool.query(
      `SELECT id_operateur AS id,
              COALESCE(prenom || ' ' || nom, nom, prenom) AS name,
              'operateur' AS type,
              8 AS capacity_per_day
       FROM equipe_fabrication
       WHERE (actif IS NULL OR actif = true)
       ORDER BY nom, prenom`
    );
    const items = [...machines.rows, ...operateurs.rows];
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'getRessources');
  }
};

// ─── GET /api/planification-gantt/gantt-data ─────────────────────
export const getGanttData = async (req, res) => {
  try {
    const projetsQ = pool.query(`
      SELECT
        cmd.id_commande,
        cmd.numero_commande                   AS numero,
        cli.raison_sociale                    AS client_raison_sociale,
        MIN(of_.date_debut_prevue)            AS date_debut,
        MAX(of_.date_fin_prevue)              AS date_fin,
        COALESCE(AVG(
          CASE WHEN of_.quantite_a_produire > 0
               THEN (of_.quantite_produite::numeric / of_.quantite_a_produire) * 100
               ELSE 0 END
        ), 0)::numeric                        AS pct_avancement
      FROM commandes cmd
      LEFT JOIN clients cli               ON cmd.id_client = cli.id_client
      INNER JOIN articles_commande ac     ON ac.id_commande = cmd.id_commande
      INNER JOIN ordres_fabrication of_   ON of_.id_article_commande = ac.id_article_commande
      GROUP BY cmd.id_commande, cmd.numero_commande, cli.raison_sociale
      ORDER BY MIN(of_.date_debut_prevue) ASC NULLS LAST
    `);

    const tachesQ = pool.query(`
      SELECT
        pm.id_planning AS id,
        COALESCE(of_.numero_of, 'OF-' || pm.id_of) AS name,
        pm.date_debut_prevue AS start, pm.date_fin_prevue AS "end",
        CASE WHEN of_.quantite_a_produire > 0
             THEN LEAST(100, (of_.quantite_produite::numeric / of_.quantite_a_produire) * 100)
             ELSE 0 END AS progress,
        pm.id_machine AS resource_id, pm.statut, pm.id_of
      FROM planning_machines pm
      LEFT JOIN ordres_fabrication of_ ON pm.id_of = of_.id_of
      ORDER BY pm.date_debut_prevue ASC NULLS LAST
    `);

    const machinesQ = pool.query(
      `SELECT id_machine AS id, numero_machine AS name, 'machine' AS type, 8 AS capacity_per_day
       FROM machines WHERE (actif IS NULL OR actif = true) ORDER BY numero_machine`
    );
    const operateursQ = pool.query(
      `SELECT id_operateur AS id,
              COALESCE(prenom || ' ' || nom, nom, prenom) AS name,
              'operateur' AS type, 8 AS capacity_per_day
       FROM equipe_fabrication WHERE (actif IS NULL OR actif = true) ORDER BY nom, prenom`
    );

    const bornesQ = pool.query(
      `SELECT MIN(date_debut_prevue) AS min_date, MAX(date_fin_prevue) AS max_date
       FROM planning_machines`
    );

    const [projets, taches, machines, operateurs, bornes] = await Promise.all([
      projetsQ, tachesQ, machinesQ, operateursQ, bornesQ,
    ]);

    return sendSuccess(res, {
      projets: projets.rows,
      taches: taches.rows,
      ressources: [...machines.rows, ...operateurs.rows],
      ligne_temps: bornes.rows[0] || { min_date: null, max_date: null },
    });
  } catch (error) {
    return handleError(res, error, 'getGanttData');
  }
};

// ─── POST /api/planification-gantt/taches ────────────────────────
export const createTacheGantt = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const { id_of, id_machine, id_operateur, date_debut_prevue, date_fin_prevue,
            id_commande, observations } = req.body || {};

    if (!id_of || !id_machine || !date_debut_prevue || !date_fin_prevue) {
      return sendError(res, 'id_of, id_machine, date_debut_prevue, date_fin_prevue requis', 400);
    }

    const r = await pool.query(
      `INSERT INTO planning_machines
         (id_machine, id_of, date_debut_prevue, date_fin_prevue, id_operateur, statut,
          observations, date_creation, created_by)
       VALUES ($1, $2, $3, $4, $5, 'planifie', $6, NOW(), $7)
       RETURNING *`,
      [id_machine, id_of, date_debut_prevue, date_fin_prevue, id_operateur || null,
       observations || (id_commande ? `Projet cmd ${id_commande}` : null), userId]
    );

    try {
      const io = await getIo();
      if (io) io.emit('gantt:updated', { id_machine, id_commande });
    } catch {}

    return sendSuccess(res, r.rows[0], 'Tâche Gantt créée', 201);
  } catch (error) {
    return handleError(res, error, 'createTacheGantt');
  }
};
