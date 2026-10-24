/**
 * Contrôleur Production — Ordres de Fabrication (OF)
 *
 * Table : ordres_fabrication
 *
 * Endpoints:
 *   GET    /api/production                    — Liste OF (filtres)
 *   GET    /api/production/stats/global       — Statistiques globales
 *   GET    /api/production/:id                — Détail OF + suivis liés
 *   POST   /api/production                    — Créer OF (planifie)
 *   PUT    /api/production/:id                — Mise à jour champs
 *   PUT    /api/production/:id/lancer         — Lancement (en_cours)
 *   PUT    /api/production/:id/terminer       — Clôture (termine)
 *   PUT    /api/production/:id/pause          — Pause
 *   PUT    /api/production/:id/annuler        — Annulation
 *   DELETE /api/production/:id                — Suppression (planifie only)
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

// Lazy import de io pour éviter les cycles
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

// Génère un numero OF au format OF-YYYYMMDD-XXX
const generateNumeroOF = async () => {
  const r = await pool.query(
    `SELECT COUNT(*)::int + 1 AS n FROM ordres_fabrication WHERE DATE(date_creation_of) = CURRENT_DATE`
  );
  const seq = String(r.rows[0].n).padStart(3, '0');
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `OF-${ymd}-${seq}`;
};

// SELECT commun — jointure articles_catalogue + calcul avancement
const OF_SELECT = `
  SELECT
    of_.*,
    a.designation   AS article_designation,
    a.code_article  AS code_article,
    CASE
      WHEN of_.quantite_a_produire > 0
        THEN ROUND((COALESCE(of_.quantite_produite, 0)::numeric / of_.quantite_a_produire::numeric) * 100, 2)
      ELSE 0
    END AS avancement_pct
  FROM ordres_fabrication of_
  LEFT JOIN articles_catalogue a ON of_.id_article = a.id_article
`;

// ─── GET /api/production ──────────────────────────────────────────
export const getProduction = async (req, res) => {
  try {
    const { statut, priorite, search, date_debut, date_fin } = req.query;
    const params = [];
    const where = [];

    if (statut)   { params.push(statut);   where.push(`of_.statut = $${params.length}`); }
    if (priorite) { params.push(priorite); where.push(`of_.priorite = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`of_.date_debut_prevue >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`of_.date_fin_prevue   <= $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(of_.numero_of ILIKE $${params.length} OR a.designation ILIKE $${params.length} OR a.code_article ILIKE $${params.length})`);
    }

    const sql = `
      ${OF_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY of_.id_of DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, r.rows, 'Ordres de fabrication récupérés');
  } catch (error) {
    return handleError(res, error, 'getProduction');
  }
};

// ─── GET /api/production/stats/global ─────────────────────────────
export const getGlobalStats = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int                                                            AS total,
        COUNT(*) FILTER (WHERE statut = 'planifie')::int                         AS planifies,
        COUNT(*) FILTER (WHERE statut = 'en_cours')::int                         AS en_cours,
        COUNT(*) FILTER (WHERE statut = 'en_pause')::int                         AS en_pause,
        COUNT(*) FILTER (WHERE statut = 'termine')::int                          AS termines,
        COUNT(*) FILTER (
          WHERE statut IN ('planifie', 'en_cours', 'en_pause')
            AND date_fin_prevue IS NOT NULL
            AND date_fin_prevue < CURRENT_DATE
        )::int                                                                   AS en_retard,
        COALESCE(ROUND(AVG(
          CASE WHEN quantite_a_produire > 0
               THEN (quantite_produite::numeric / quantite_a_produire::numeric) * 100
               ELSE NULL END
        ), 2), 0)                                                                AS rendement_moyen
      FROM ordres_fabrication
    `);
    return sendSuccess(res, r.rows[0], 'Statistiques production');
  } catch (error) {
    return handleError(res, error, 'getGlobalStats');
  }
};

// ─── GET /api/production/:id ──────────────────────────────────────
export const getProductionById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`${OF_SELECT} WHERE of_.id_of = $1 LIMIT 1`, [id]);
    if (!r.rows[0]) return sendError(res, 'Ordre de fabrication introuvable', 404);

    const suivis = await pool.query(
      `SELECT sf.*,
              m.numero_machine, m.marque AS machine_marque, m.modele AS machine_modele,
              e.nom AS operateur_nom, e.prenom AS operateur_prenom
         FROM suivi_fabrication sf
         LEFT JOIN machines m           ON sf.id_machine   = m.id_machine
         LEFT JOIN equipe_fabrication e ON sf.id_operateur = e.id_operateur
        WHERE sf.id_of = $1
        ORDER BY sf.date_creation DESC`,
      [id]
    );

    return sendSuccess(res, { ...r.rows[0], suivis: suivis.rows }, 'Ordre de fabrication trouvé');
  } catch (error) {
    return handleError(res, error, 'getProductionById');
  }
};

// ─── POST /api/production ─────────────────────────────────────────
export const createProduction = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      id_article,
      id_article_commande,
      quantite_a_produire,
      unite,
      date_debut_prevue,
      date_fin_prevue,
      priorite,
      temps_production_estime,
      cout_estime,
      observations,
    } = req.body || {};

    if (!id_article || !quantite_a_produire) {
      return sendError(res, 'id_article et quantite_a_produire requis', 400);
    }

    const numero_of = await generateNumeroOF();

    const r = await pool.query(
      `INSERT INTO ordres_fabrication
         (numero_of, id_article, id_article_commande, quantite_a_produire, quantite_produite, unite,
          date_creation_of, date_debut_prevue, date_fin_prevue, priorite, statut,
          temps_production_estime, cout_estime, observations, cree_par, created_by)
       VALUES ($1, $2, $3, $4, 0, $5,
               CURRENT_TIMESTAMP, $6, $7, $8, 'planifie',
               $9, $10, $11, $12, $12)
       RETURNING *`,
      [
        numero_of,
        id_article,
        id_article_commande || null,
        quantite_a_produire,
        unite || null,
        date_debut_prevue || null,
        date_fin_prevue || null,
        priorite || 'normale',
        temps_production_estime || null,
        cout_estime || null,
        observations || null,
        userId,
      ]
    );

    const of = r.rows[0];
    try {
      const io = await getIo();
      if (io) io.emit('of:created', { id_of: of.id_of, numero_of: of.numero_of });
    } catch {}

    return sendSuccess(res, of, 'Ordre de fabrication créé', 201);
  } catch (error) {
    return handleError(res, error, 'createProduction');
  }
};

// ─── PUT /api/production/:id ──────────────────────────────────────
export const updateProduction = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const {
      id_article,
      quantite_a_produire,
      quantite_produite,
      unite,
      date_debut_prevue,
      date_fin_prevue,
      priorite,
      temps_production_estime,
      temps_production_reel,
      cout_estime,
      cout_reel,
      observations,
    } = req.body || {};

    const r = await pool.query(
      `UPDATE ordres_fabrication SET
         id_article              = COALESCE($2,  id_article),
         quantite_a_produire     = COALESCE($3,  quantite_a_produire),
         quantite_produite       = COALESCE($4,  quantite_produite),
         unite                   = COALESCE($5,  unite),
         date_debut_prevue       = COALESCE($6,  date_debut_prevue),
         date_fin_prevue         = COALESCE($7,  date_fin_prevue),
         priorite                = COALESCE($8,  priorite),
         temps_production_estime = COALESCE($9,  temps_production_estime),
         temps_production_reel   = COALESCE($10, temps_production_reel),
         cout_estime             = COALESCE($11, cout_estime),
         cout_reel               = COALESCE($12, cout_reel),
         observations            = COALESCE($13, observations),
         date_modification       = CURRENT_TIMESTAMP,
         updated_by              = $14
       WHERE id_of = $1
       RETURNING *`,
      [
        id,
        id_article ?? null,
        quantite_a_produire ?? null,
        quantite_produite ?? null,
        unite ?? null,
        date_debut_prevue ?? null,
        date_fin_prevue ?? null,
        priorite ?? null,
        temps_production_estime ?? null,
        temps_production_reel ?? null,
        cout_estime ?? null,
        cout_reel ?? null,
        observations ?? null,
        userId,
      ]
    );
    if (!r.rows[0]) return sendError(res, 'Ordre de fabrication introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Ordre de fabrication mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateProduction');
  }
};

// Helper: transition de statut simple
const changeStatut = async (req, res, targetStatut, extraSet, eventName, contextName) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const sql = `
      UPDATE ordres_fabrication
         SET statut = $2${extraSet ? ', ' + extraSet : ''},
             date_modification = CURRENT_TIMESTAMP,
             updated_by = $3
       WHERE id_of = $1
       RETURNING id_of, numero_of, statut, date_debut_reelle, date_fin_reelle
    `;
    const r = await pool.query(sql, [id, targetStatut, userId]);
    if (!r.rows[0]) return sendError(res, 'Ordre de fabrication introuvable', 404);

    if (eventName) {
      try {
        const io = await getIo();
        if (io) io.emit(eventName, r.rows[0]);
      } catch {}
    }
    return sendSuccess(res, r.rows[0], `Ordre de fabrication ${targetStatut}`);
  } catch (error) {
    return handleError(res, error, contextName);
  }
};

// ─── PUT /api/production/:id/lancer ───────────────────────────────
export const lancerProduction = (req, res) =>
  changeStatut(req, res, 'en_cours', 'date_debut_reelle = COALESCE(date_debut_reelle, CURRENT_TIMESTAMP)', 'of:started', 'lancerProduction');

// ─── PUT /api/production/:id/terminer ─────────────────────────────
export const terminerProduction = (req, res) =>
  changeStatut(req, res, 'termine', 'date_fin_reelle = CURRENT_TIMESTAMP', 'of:completed', 'terminerProduction');

// ─── PUT /api/production/:id/pause ────────────────────────────────
export const pauseProduction = (req, res) =>
  changeStatut(req, res, 'en_pause', null, 'of:paused', 'pauseProduction');

// ─── PUT /api/production/:id/annuler ──────────────────────────────
export const annulerProduction = (req, res) =>
  changeStatut(req, res, 'annule', null, 'of:cancelled', 'annulerProduction');

// ─── DELETE /api/production/:id ───────────────────────────────────
export const deleteProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `DELETE FROM ordres_fabrication
        WHERE id_of = $1 AND statut = 'planifie'
        RETURNING id_of`,
      [id]
    );
    if (!r.rows[0]) return sendError(res, 'Suppression impossible : OF inexistant ou non "planifie"', 400);
    return sendSuccess(res, { id_of: r.rows[0].id_of }, 'Ordre de fabrication supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteProduction');
  }
};
