// routes.js — dashboard agrégé par rôle (T3c)
// Les 9 rapports T2 ont relevé plusieurs 404 HTML sur /api/v2/dashboard/<role>.
// Ce module expose du JSON stable (success/data/meta/error), dégrade gracieusement
// si les tables sources sont absentes ou vides.
//
// Endpoints montés sous /api/v2/dashboard :
//   GET /mecanicien       — machines sous responsabilité + interventions en cours
//   GET /controle-central — vue agrégée Chef de production / contrôleur global
import { Router } from 'express';
import { getPool } from '../_shared/db.js';
import { ok, asyncHandler } from '../_shared/api-envelope.js';

const router = Router();

async function safeQuery(sql, params = []) {
  try {
    const r = await getPool().query(sql, params);
    return r.rows;
  } catch (e) {
    return { _error: e.message };
  }
}

/**
 * GET /api/v2/dashboard/mecanicien
 * - Machines sous responsabilité du mécanicien connecté (si demandes_intervention.assigne_a
 *   = id user mappé via users.id_operateur, sinon toutes machines actives).
 * - Interventions en cours (statut en_cours / en_attente).
 * - Pannes à traiter (prio haute/critique non terminées).
 */
router.get('/mecanicien', asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?.id_user || null;

  // 1) Machines (sans filtre explicite ; filtre côté front via equipe_fabrication)
  const machines = await safeQuery(`
    SELECT id_machine, numero_machine, marque, modele, statut,
           emplacement, date_derniere_maintenance, date_prochaine_maintenance
      FROM machines
     WHERE actif = TRUE
     ORDER BY numero_machine
  `);

  // 2) Interventions assignées (si user mappé à equipe_fabrication)
  const interventionsAssignees = await safeQuery(`
    SELECT di.id_demande AS id, di.numero_demande, di.statut, di.priorite,
           di.type_intervention, di.date_demande,
           di.id_machine, m.numero_machine
      FROM demandes_intervention di
      LEFT JOIN machines m ON m.id_machine = di.id_machine
     WHERE di.statut IN ('en_attente','en_cours','assignee')
       AND ($1::int IS NULL OR di.assigne_a = $1)
     ORDER BY
       CASE di.priorite WHEN 'critique' THEN 1 WHEN 'haute' THEN 2
            WHEN 'normale' THEN 3 ELSE 4 END,
       di.date_demande DESC
     LIMIT 50
  `, [userId]);

  // 3) Pannes/alertes à traiter (prio haute+critique)
  const alertes = await safeQuery(`
    SELECT di.id_demande AS id, di.numero_demande, di.priorite,
           di.type_intervention, di.description,
           di.id_machine, m.numero_machine
      FROM demandes_intervention di
      LEFT JOIN machines m ON m.id_machine = di.id_machine
     WHERE di.statut IN ('en_attente','assignee')
       AND di.priorite IN ('haute','critique')
     ORDER BY di.date_demande DESC
     LIMIT 20
  `);

  // 4) KPIs
  const kpis = await safeQuery(`
    SELECT
      COUNT(*) FILTER (WHERE statut = 'en_attente')::int AS en_attente,
      COUNT(*) FILTER (WHERE statut = 'en_cours')::int   AS en_cours,
      COUNT(*) FILTER (WHERE statut IN ('terminee','cloturee')
                       AND date_fin_intervention >= NOW() - INTERVAL '7 days')::int AS terminees_7j,
      COALESCE(AVG(temps_reponse) FILTER (WHERE temps_reponse IS NOT NULL), 0)::numeric AS mttr_min_moy
    FROM demandes_intervention
  `);

  return res.json(ok({
    machines:  Array.isArray(machines) ? machines : [],
    interventions_en_cours: Array.isArray(interventionsAssignees) ? interventionsAssignees : [],
    pannes_a_traiter: Array.isArray(alertes) ? alertes : [],
    kpis: Array.isArray(kpis) && kpis[0] ? kpis[0] : {},
  }, {
    user_id: userId,
    warnings: [machines, interventionsAssignees, alertes, kpis]
      .filter(x => x && x._error)
      .map(x => x._error),
  }));
}));

/**
 * GET /api/v2/dashboard/controle-central
 * Vue de synthèse pour la salle de contrôle (Chef Production + Contrôleur global).
 */
router.get('/controle-central', asyncHandler(async (req, res) => {
  // Dégradation gracieuse : chaque bloc dans un try/catch
  const [ofActifs, machinesEtats, defautsRecents, interventionsCritiques, mpAlertes] =
    await Promise.all([
      safeQuery(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE statut = 'en_cours')::int   AS en_cours,
               COUNT(*) FILTER (WHERE statut = 'planifie')::int   AS planifies,
               COUNT(*) FILTER (WHERE statut = 'bloque_qc')::int  AS bloques_qc
          FROM ordres_fabrication
         WHERE statut NOT IN ('cloture','annule')
      `),
      safeQuery(`
        SELECT statut, COUNT(*)::int AS n
          FROM machines
         WHERE actif = TRUE
         GROUP BY statut
      `),
      safeQuery(`
        SELECT ds.id_defaut_signale AS id, ds.date_signalement,
               ds.quantite_impactee, dt.libelle AS type_defaut
          FROM defauts_signales ds
          LEFT JOIN defauts_types dt ON dt.id_defaut_type = ds.id_defaut_type
         WHERE ds.date_signalement >= NOW() - INTERVAL '24 hours'
         ORDER BY ds.date_signalement DESC
         LIMIT 15
      `),
      safeQuery(`
        SELECT COUNT(*)::int AS n
          FROM demandes_intervention
         WHERE statut IN ('en_attente','assignee')
           AND priorite IN ('haute','critique')
      `),
      safeQuery(`
        SELECT COUNT(*)::int AS n
          FROM matieres_premieres
         WHERE actif = TRUE AND stock_alerte IS NOT NULL
      `),
    ]);

  return res.json(ok({
    of: Array.isArray(ofActifs) && ofActifs[0] ? ofActifs[0] : {},
    machines_etats: Array.isArray(machinesEtats) ? machinesEtats : [],
    defauts_24h: Array.isArray(defautsRecents) ? defautsRecents : [],
    pannes_critiques:
      Array.isArray(interventionsCritiques) && interventionsCritiques[0]
        ? interventionsCritiques[0].n
        : 0,
    mp_alertes_count:
      Array.isArray(mpAlertes) && mpAlertes[0] ? mpAlertes[0].n : 0,
  }));
}));

export default router;
