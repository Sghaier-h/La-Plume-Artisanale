/**
 * Contrôleur Suivi Fabrication
 *
 * Table : suivi_fabrication
 *
 * Endpoints:
 *   GET    /api/suivi-fabrication                             — Liste (filtres)
 *   GET    /api/suivi-fabrication/of/:id_of/summary           — Récap par OF
 *   GET    /api/suivi-fabrication/machine/:id_machine/stats   — Stats machine (30j)
 *   GET    /api/suivi-fabrication/operateur/:id_operateur/day — Tâches du jour
 *   GET    /api/suivi-fabrication/:id                         — Détail
 *   POST   /api/suivi-fabrication                             — Créer
 *   PUT    /api/suivi-fabrication/:id                         — Mettre à jour
 *   DELETE /api/suivi-fabrication/:id                         — Supprimer
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

// Lazy import de io
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Numero SF-YYYYMMDD-XXX
const generateNumeroSF = async () => {
  const r = await pool.query(
    `SELECT COUNT(*)::int + 1 AS n FROM suivi_fabrication WHERE DATE(date_creation) = CURRENT_DATE`
  );
  const seq = String(r.rows[0].n).padStart(3, '0');
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `SF-${ymd}-${seq}`;
};

// Calcul rendement + TRS (simplifié)
//   rendement = quantite_bonne / quantite_produite * 100
//   trs       = quantite_bonne / (quantite_produite + rebut + 2eme_choix) * 100
const computeKPIs = ({ quantite_produite, quantite_bonne, quantite_rebut, quantite_2eme_choix }) => {
  const bonne    = Number(quantite_bonne)      || 0;
  const produite = Number(quantite_produite)   || 0;
  const rebut    = Number(quantite_rebut)      || 0;
  const second   = Number(quantite_2eme_choix) || 0;
  const total    = produite + rebut + second;

  const rendement = produite > 0 ? Math.round((bonne / produite) * 10000) / 100 : 0;
  const trs       = total    > 0 ? Math.round((bonne / total)    * 10000) / 100 : 0;
  return { rendement, trs };
};

const SF_SELECT = `
  SELECT
    sf.*,
    of_.numero_of,
    a.designation   AS article_designation,
    a.code_article  AS code_article,
    m.numero_machine,
    m.marque        AS machine_marque,
    m.modele        AS machine_modele,
    e.nom           AS operateur_nom,
    e.prenom        AS operateur_prenom,
    e.fonction      AS operateur_fonction
  FROM suivi_fabrication sf
  LEFT JOIN ordres_fabrication of_ ON sf.id_of        = of_.id_of
  LEFT JOIN articles_catalogue a   ON of_.id_article  = a.id_article
  LEFT JOIN machines m             ON sf.id_machine   = m.id_machine
  LEFT JOIN equipe_fabrication e   ON sf.id_operateur = e.id_operateur
`;

// ─── GET /api/suivi-fabrication ───────────────────────────────────
export const getSuiviFabrication = async (req, res) => {
  try {
    const { id_of, id_machine, id_operateur, statut, date_debut, date_fin } = req.query;
    const params = [];
    const where = [];

    if (id_of)        { params.push(id_of);        where.push(`sf.id_of        = $${params.length}`); }
    if (id_machine)   { params.push(id_machine);   where.push(`sf.id_machine   = $${params.length}`); }
    if (id_operateur) { params.push(id_operateur); where.push(`sf.id_operateur = $${params.length}`); }
    if (statut)       { params.push(statut);       where.push(`sf.statut       = $${params.length}`); }
    if (date_debut)   { params.push(date_debut);   where.push(`sf.date_debut  >= $${params.length}`); }
    if (date_fin)     { params.push(date_fin);     where.push(`sf.date_fin    <= $${params.length}`); }

    const sql = `
      ${SF_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY sf.date_creation DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, r.rows, 'Suivis récupérés');
  } catch (error) {
    return handleError(res, error, 'getSuiviFabrication');
  }
};

// ─── GET /api/suivi-fabrication/of/:id_of/summary ─────────────────
export const getOfSummary = async (req, res) => {
  try {
    const { id_of } = req.params;
    const r = await pool.query(
      `SELECT
         COUNT(*)::int                                       AS nb_suivis,
         COALESCE(SUM(quantite_produite),   0)::numeric      AS quantite_produite_totale,
         COALESCE(SUM(quantite_bonne),      0)::numeric      AS quantite_bonne_totale,
         COALESCE(SUM(quantite_rebut),      0)::numeric      AS quantite_rebut_totale,
         COALESCE(SUM(quantite_2eme_choix), 0)::numeric      AS quantite_2eme_choix_totale,
         COALESCE(SUM(temps_production),    0)::numeric      AS temps_production_total,
         COALESCE(SUM(temps_arret),         0)::numeric      AS temps_arret_total,
         COALESCE(ROUND(AVG(rendement)::numeric, 2), 0)      AS rendement_moyen,
         COALESCE(ROUND(AVG(trs)::numeric,       2), 0)      AS trs_moyen
       FROM suivi_fabrication
       WHERE id_of = $1`,
      [id_of]
    );
    return sendSuccess(res, r.rows[0], 'Récapitulatif OF');
  } catch (error) {
    return handleError(res, error, 'getOfSummary');
  }
};

// ─── GET /api/suivi-fabrication/machine/:id_machine/stats ─────────
export const getMachineStats = async (req, res) => {
  try {
    const { id_machine } = req.params;
    const r = await pool.query(
      `SELECT
         COUNT(*)::int                                              AS nb_suivis,
         COALESCE(ROUND(AVG(rendement)::numeric, 2), 0)             AS rendement_moyen,
         COALESCE(ROUND(AVG(trs)::numeric,       2), 0)             AS trs_moyen,
         COALESCE(SUM(temps_production), 0)::numeric                AS temps_total,
         COALESCE(SUM(temps_arret),      0)::numeric                AS temps_arret_total,
         COUNT(*) FILTER (WHERE temps_arret IS NOT NULL AND temps_arret > 0)::int AS incidents
       FROM suivi_fabrication
       WHERE id_machine = $1
         AND date_creation >= CURRENT_DATE - INTERVAL '30 days'`,
      [id_machine]
    );
    return sendSuccess(res, r.rows[0], 'Statistiques machine (30 jours)');
  } catch (error) {
    return handleError(res, error, 'getMachineStats');
  }
};

// ─── GET /api/suivi-fabrication/operateur/:id_operateur/day ───────
export const getOperateurDay = async (req, res) => {
  try {
    const { id_operateur } = req.params;
    const r = await pool.query(
      `${SF_SELECT}
        WHERE sf.id_operateur = $1
          AND DATE(sf.date_creation) = CURRENT_DATE
        ORDER BY sf.date_creation DESC`,
      [id_operateur]
    );
    return sendSuccess(res, r.rows, 'Tâches du jour');
  } catch (error) {
    return handleError(res, error, 'getOperateurDay');
  }
};

// ─── GET /api/suivi-fabrication/:id ───────────────────────────────
export const getSuiviFabricationById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`${SF_SELECT} WHERE sf.id_suivi = $1 LIMIT 1`, [id]);
    if (!r.rows[0]) return sendError(res, 'Suivi introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Suivi trouvé');
  } catch (error) {
    return handleError(res, error, 'getSuiviFabricationById');
  }
};

// ─── POST /api/suivi-fabrication ──────────────────────────────────
export const createSuiviFabrication = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      id_of,
      id_machine,
      id_operateur,
      date_debut,
      date_fin,
      quantite_produite,
      quantite_bonne,
      quantite_rebut,
      quantite_2eme_choix,
      temps_production,
      temps_arret,
      vitesse_moyenne,
      statut,
      observations,
    } = req.body || {};

    if (!id_of) return sendError(res, 'id_of requis', 400);

    const numero_suivi = await generateNumeroSF();
    const { rendement, trs } = computeKPIs({
      quantite_produite, quantite_bonne, quantite_rebut, quantite_2eme_choix,
    });

    const r = await pool.query(
      `INSERT INTO suivi_fabrication
         (numero_suivi, id_of, id_machine, id_operateur,
          date_debut, date_fin,
          quantite_produite, quantite_bonne, quantite_rebut, quantite_2eme_choix,
          temps_production, temps_arret, vitesse_moyenne,
          rendement, trs, statut, observations,
          date_creation, created_by)
       VALUES ($1, $2, $3, $4,
               $5, $6,
               $7, $8, $9, $10,
               $11, $12, $13,
               $14, $15, $16, $17,
               CURRENT_TIMESTAMP, $18)
       RETURNING *`,
      [
        numero_suivi,
        id_of,
        id_machine || null,
        id_operateur || null,
        date_debut || null,
        date_fin || null,
        quantite_produite || 0,
        quantite_bonne || 0,
        quantite_rebut || 0,
        quantite_2eme_choix || 0,
        temps_production || null,
        temps_arret || null,
        vitesse_moyenne || null,
        rendement,
        trs,
        statut || 'en_cours',
        observations || null,
        userId,
      ]
    );

    const row = r.rows[0];
    try {
      const io = await getIo();
      if (io) {
        io.emit('production:updated', row);
        if (row.id_operateur) io.to(`user-${row.id_operateur}`).emit('production:updated', row);
      }
    } catch {}

    return sendSuccess(res, row, 'Suivi créé', 201);
  } catch (error) {
    return handleError(res, error, 'createSuiviFabrication');
  }
};

// ─── PUT /api/suivi-fabrication/:id ───────────────────────────────
export const updateSuiviFabrication = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;

    // Charger la ligne pour recalculer KPIs sur valeurs fusionnées
    const cur = await pool.query(`SELECT * FROM suivi_fabrication WHERE id_suivi = $1`, [id]);
    if (!cur.rows[0]) return sendError(res, 'Suivi introuvable', 404);
    const before = cur.rows[0];

    const {
      id_machine, id_operateur,
      date_debut, date_fin,
      quantite_produite, quantite_bonne, quantite_rebut, quantite_2eme_choix,
      temps_production, temps_arret, vitesse_moyenne,
      statut, observations,
    } = req.body || {};

    const merged = {
      quantite_produite:   quantite_produite   ?? before.quantite_produite,
      quantite_bonne:      quantite_bonne      ?? before.quantite_bonne,
      quantite_rebut:      quantite_rebut      ?? before.quantite_rebut,
      quantite_2eme_choix: quantite_2eme_choix ?? before.quantite_2eme_choix,
    };
    const { rendement, trs } = computeKPIs(merged);

    const r = await pool.query(
      `UPDATE suivi_fabrication SET
         id_machine          = COALESCE($2,  id_machine),
         id_operateur        = COALESCE($3,  id_operateur),
         date_debut          = COALESCE($4,  date_debut),
         date_fin            = COALESCE($5,  date_fin),
         quantite_produite   = COALESCE($6,  quantite_produite),
         quantite_bonne      = COALESCE($7,  quantite_bonne),
         quantite_rebut      = COALESCE($8,  quantite_rebut),
         quantite_2eme_choix = COALESCE($9,  quantite_2eme_choix),
         temps_production    = COALESCE($10, temps_production),
         temps_arret         = COALESCE($11, temps_arret),
         vitesse_moyenne     = COALESCE($12, vitesse_moyenne),
         rendement           = $13,
         trs                 = $14,
         statut              = COALESCE($15, statut),
         observations        = COALESCE($16, observations),
         updated_by          = $17
       WHERE id_suivi = $1
       RETURNING *`,
      [
        id,
        id_machine ?? null,
        id_operateur ?? null,
        date_debut ?? null,
        date_fin ?? null,
        quantite_produite ?? null,
        quantite_bonne ?? null,
        quantite_rebut ?? null,
        quantite_2eme_choix ?? null,
        temps_production ?? null,
        temps_arret ?? null,
        vitesse_moyenne ?? null,
        rendement,
        trs,
        statut ?? null,
        observations ?? null,
        userId,
      ]
    );

    const row = r.rows[0];
    try {
      const io = await getIo();
      if (io) {
        io.emit('production:updated', row);
        if (row.id_operateur) io.to(`user-${row.id_operateur}`).emit('production:updated', row);
      }
    } catch {}

    return sendSuccess(res, row, 'Suivi mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateSuiviFabrication');
  }
};

// ─── DELETE /api/suivi-fabrication/:id ────────────────────────────
export const deleteSuiviFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `DELETE FROM suivi_fabrication WHERE id_suivi = $1 RETURNING id_suivi`,
      [id]
    );
    if (!r.rows[0]) return sendError(res, 'Suivi introuvable', 404);
    return sendSuccess(res, { id_suivi: r.rows[0].id_suivi }, 'Suivi supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteSuiviFabrication');
  }
};
