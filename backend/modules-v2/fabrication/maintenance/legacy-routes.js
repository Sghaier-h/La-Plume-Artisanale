/**
 * Routes Maintenance — bridge vers `demandes_intervention`.
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import {
  getMaintenance, getMaintenanceById, createMaintenance, updateMaintenance,
  assignerMaintenance, demarrerMaintenance, terminerMaintenance,
  cloturerMaintenance, annulerMaintenance, deleteMaintenance,
  getHistoriqueMachine, getStatsGlobal,
} from './legacy-controller.js';

const router = express.Router();
router.use(authenticate);

// Routes spécifiques d'abord
router.get('/stats/global',           getStatsGlobal);
router.get('/machine/:id_machine(\\d+)', getHistoriqueMachine);

// T3c — GET /api/v2/fabrication/maintenance/alertes
// Agrège : machines en panne + maintenances dues (date_prochaine_maintenance) +
// interventions critiques en attente.
router.get('/alertes', async (req, res) => {
  try {
    const horizon = Math.max(1, Math.min(90, Number(req.query.dans_jours) || 15));
    let pannes = [];
    try {
      const r = await pool.query(`
        SELECT m.id_machine, m.numero_machine, m.statut,
               m.marque, m.modele, m.emplacement
          FROM machines m
         WHERE m.actif = TRUE
           AND m.statut IN ('panne','en_panne','hors_service','arret_critique')
         ORDER BY m.numero_machine
      `);
      pannes = r.rows;
    } catch (e) {}
    let maintenancesDues = [];
    try {
      const r = await pool.query(`
        SELECT m.id_machine, m.numero_machine,
               m.date_derniere_maintenance,
               m.date_prochaine_maintenance,
               (m.date_prochaine_maintenance - CURRENT_DATE)::int AS jours_restants
          FROM machines m
         WHERE m.actif = TRUE
           AND m.date_prochaine_maintenance IS NOT NULL
           AND m.date_prochaine_maintenance <= CURRENT_DATE + ($1 || ' days')::interval
         ORDER BY m.date_prochaine_maintenance
      `, [String(horizon)]);
      maintenancesDues = r.rows;
    } catch (e) {}
    let interventionsCritiques = [];
    try {
      const r = await pool.query(`
        SELECT id_demande AS id, numero_demande, priorite, statut,
               type_intervention, id_machine, date_demande
          FROM demandes_intervention
         WHERE statut IN ('en_attente','assignee')
           AND priorite IN ('haute','critique')
         ORDER BY date_demande DESC
         LIMIT 50
      `);
      interventionsCritiques = r.rows;
    } catch (e) {}
    return sendSuccess(res, {
      machines_en_panne: pannes,
      maintenances_dues: maintenancesDues,
      interventions_critiques: interventionsCritiques,
      horizon_jours: horizon,
    });
  } catch (error) {
    return handleError(res, error, 'getAlertesMaintenance');
  }
});

// CRUD + transitions
router.get('/',                       getMaintenance);
router.post('/',                      createMaintenance);
router.get('/:id(\\d+)',              getMaintenanceById);
router.put('/:id(\\d+)',              updateMaintenance);
router.delete('/:id(\\d+)',           deleteMaintenance);

router.put('/:id(\\d+)/assigner',     assignerMaintenance);
router.put('/:id(\\d+)/demarrer',     demarrerMaintenance);
router.put('/:id(\\d+)/terminer',     terminerMaintenance);
router.put('/:id(\\d+)/cloturer',     cloturerMaintenance);
router.put('/:id(\\d+)/annuler',      annulerMaintenance);

export default router;
