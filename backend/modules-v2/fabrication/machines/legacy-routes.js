/**
 * Routes Machines
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import {
  getMachines,
  getMachineById,
  getMachineByNumero,
  createMachine,
  updateMachine,
  updateMachineStatut,
  updateMachineMaintenance,
  deleteMachine,
  getMachinesStats,
  getHistoriqueArrets,
} from './legacy-controller.js';

const router = express.Router();
router.use(authenticate);

// Routes spécifiques AVANT /:id
router.get('/types', async (req, res) => {
  try {
    const q = `SELECT DISTINCT id_type_machine AS id FROM machines WHERE id_type_machine IS NOT NULL ORDER BY id_type_machine`;
    const result = await pool.query(q);
    return sendSuccess(res, result.rows, 'Types machines');
  } catch (error) {
    return handleError(res, error, 'getTypesMachines');
  }
});
router.get('/stats/global', getMachinesStats);
router.get('/numero/:numero', getMachineByNumero);

// CRUD standard
router.get('/', getMachines);
router.post('/', createMachine);
router.get('/:id(\\d+)', getMachineById);
router.put('/:id(\\d+)', updateMachine);
router.put('/:id(\\d+)/statut', updateMachineStatut);
router.put('/:id(\\d+)/maintenance', updateMachineMaintenance);
router.delete('/:id(\\d+)', deleteMachine);
router.get('/:id(\\d+)/historique-arrets', getHistoriqueArrets);

// T3c — GET /api/v2/fabrication/machines/:id/historique
// Pannes passées + pièces changées, à partir de demandes_intervention.
router.get('/:id(\\d+)/historique', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT di.id_demande AS id, di.numero_demande, di.date_demande,
             di.date_debut_intervention, di.date_fin_intervention,
             di.type_intervention, di.priorite, di.statut,
             di.description, di.diagnostic, di.actions_effectuees,
             di.pieces_changees, di.cout_intervention,
             di.temps_reponse, di.duree_intervention
        FROM demandes_intervention di
       WHERE di.id_machine = $1
       ORDER BY di.date_demande DESC NULLS LAST
       LIMIT 500
    `, [req.params.id]);
    return sendSuccess(res, {
      items: r.rows,
      total: r.rows.length,
      id_machine: Number(req.params.id),
    });
  } catch (error) {
    // Dégradation : retourne vide
    return sendSuccess(res, {
      items: [],
      total: 0,
      id_machine: Number(req.params.id),
      message: 'En attente d\'implémentation DB (demandes_intervention)',
    });
  }
});

// T3c — GET /api/v2/fabrication/machines/:id/mtbf
// MTBF (Mean Time Between Failures) et MTTR (Mean Time To Repair) sur une période.
router.get('/:id(\\d+)/mtbf', async (req, res) => {
  try {
    const idM = Number(req.params.id);
    const periodeJours = Math.max(7, Math.min(730, Number(req.query.periode_jours) || 365));
    const r = await pool.query(`
      WITH ints AS (
        SELECT date_demande, date_fin_intervention,
               duree_intervention, temps_reponse
          FROM demandes_intervention
         WHERE id_machine = $1
           AND date_demande >= NOW() - ($2 || ' days')::interval
           AND statut IN ('terminee','cloturee')
      )
      SELECT
        COUNT(*)::int AS nb_pannes,
        -- MTTR = moyenne durée d'intervention (en minutes)
        COALESCE(AVG(duree_intervention), 0)::numeric AS mttr_minutes,
        COALESCE(AVG(temps_reponse), 0)::numeric      AS temps_reponse_moyen_minutes,
        -- MTBF = période / nombre de pannes (en heures)
        CASE WHEN COUNT(*) > 0
             THEN ROUND(($2::numeric * 24.0 / COUNT(*))::numeric, 2)
             ELSE NULL END AS mtbf_heures
      FROM ints
    `, [idM, String(periodeJours)]);
    return sendSuccess(res, {
      id_machine: idM,
      periode_jours: periodeJours,
      ...r.rows[0],
    });
  } catch (error) {
    return sendSuccess(res, {
      id_machine: Number(req.params.id),
      nb_pannes: 0,
      mttr_minutes: 0,
      mtbf_heures: null,
      message: 'En attente d\'implémentation DB (demandes_intervention)',
    });
  }
});

router.get('/:id(\\d+)/planning', async (req, res) => {
  try {
    const q = `SELECT * FROM planning_machines WHERE id_machine = $1 ORDER BY date_debut DESC`;
    const result = await pool.query(q, [req.params.id]);
    return sendSuccess(res, result.rows, 'Planning machine');
  } catch (error) {
    return handleError(res, error, 'getPlanningMachine');
  }
});

export default router;
