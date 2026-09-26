/**
 * Contrôleur OF (Ordres de Fabrication) — Module modulaire
 * Requête la table `ordres_fabrication` (pas la table générique `of`)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/of ─────────────────────────────────────────────────────────
export const getOf = async (req, res) => {
  try {
    const { search, statut, priorite, id_article, date_debut, date_fin, page, limit } = req.query;

    const qb = new QueryBuilder('ordres_fabrication', 'o')
      .select([
        'o.*',
        'a.code_article', 'a.designation as article_designation',
        'ac.id_commande', 'c.numero_commande'
      ])
      .join('LEFT JOIN articles_catalogue a ON o.id_article = a.id_article')
      .join('LEFT JOIN articles_commande ac ON o.id_article_commande = ac.id_article_commande')
      .join('LEFT JOIN commandes c ON ac.id_commande = c.id_commande')
      .search(['o.numero_of', 'a.code_article', 'a.designation'], search)
      .whereIf('o.statut = $?', statut)
      .whereIf('o.priorite = $?', priorite)
      .whereIf('o.id_article = $?', id_article)
      .dateRange('o.date_creation_of', date_debut, date_fin)
      .orderBy('o.date_creation_of DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getOf');
  }
};

// ── GET /api/of/:id ─────────────────────────────────────────────────────
export const getOfById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*,
              a.code_article, a.designation as article_designation,
              ac.id_commande, ac.quantite_commandee, ac.ref_commerciale,
              c.numero_commande, cl.raison_sociale as client_nom
       FROM ordres_fabrication o
       LEFT JOIN articles_catalogue a ON o.id_article = a.id_article
       LEFT JOIN articles_commande ac ON o.id_article_commande = ac.id_article_commande
       LEFT JOIN commandes c ON ac.id_commande = c.id_commande
       LEFT JOIN clients cl ON c.id_client = cl.id_client
       WHERE o.id_of = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Ordre de fabrication'));
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getOfById');
  }
};

// ── POST /api/of ────────────────────────────────────────────────────────
export const createOf = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const {
      id_article, id_article_commande, quantite_a_produire,
      date_debut_prevue, date_fin_prevue, priorite, observations
    } = req.body;

    if (!id_article || !quantite_a_produire) {
      return sendError(res, 'Article et quantité à produire requis', HTTP_STATUS.BAD_REQUEST);
    }

    // Générer numéro OF
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM ordres_fabrication WHERE date_creation_of >= CURRENT_DATE"
    );
    const numero = `OF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO ordres_fabrication (
        numero_of, id_article, id_article_commande, quantite_a_produire,
        date_creation_of, date_debut_prevue, date_fin_prevue,
        priorite, statut, observations, cree_par, created_by
      ) VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,$6,$7,'planifie',$8,$9,$9)
      RETURNING *`,
      [
        numero, id_article, id_article_commande || null,
        quantite_a_produire, date_debut_prevue || null, date_fin_prevue || null,
        priorite || 'normale', observations || null, userId
      ]
    );

    logger.info('OF créé', { id: result.rows[0].id_of, numero });
    return sendSuccess(res, result.rows[0], 'OF créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createOf');
  }
};

// ── PUT /api/of/:id ─────────────────────────────────────────────────────
export const updateOf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;

    const existing = await pool.query('SELECT id_of, statut FROM ordres_fabrication WHERE id_of = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('OF'));
    }

    const excludedFields = ['id_of', 'numero_of', 'date_creation_of', 'created_by', 'updated_by', 'cree_par'];
    const fields = Object.keys(data).filter(f => !excludedFields.includes(f) && data[f] !== undefined);

    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE ordres_fabrication SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
       WHERE id_of = $${values.length + 2} RETURNING *`,
      [...values, userId, id]
    );

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateOf');
  }
};

// ─── Helpers introspection (best-effort schema) ────────────────────────
const _oftableCache = new Map();
async function _tblExists(name) {
  if (_oftableCache.has(name)) return _oftableCache.get(name);
  try {
    const r = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1 LIMIT 1`,
      [name]
    );
    const ok = r.rows.length > 0;
    _oftableCache.set(name, ok);
    return ok;
  } catch { return false; }
}

// ── GET /api/of/:id/detail-complet ──────────────────────────────────────
export const getOFDetailComplet = async (req, res) => {
  try {
    const { id } = req.params;

    const ofRes = await pool.query(
      `SELECT o.*,
              a.code_article, a.designation AS article_designation, a.description AS description_article,
              ac.id_commande, ac.quantite_commandee, ac.ref_commerciale, ac.numero_ligne,
              c.numero_commande, c.date_livraison_prevue AS commande_date_livraison,
              cl.raison_sociale AS client_nom
         FROM ordres_fabrication o
         LEFT JOIN articles_catalogue a ON o.id_article = a.id_article
         LEFT JOIN articles_commande ac ON o.id_article_commande = ac.id_article_commande
         LEFT JOIN commandes c ON ac.id_commande = c.id_commande
         LEFT JOIN clients cl ON c.id_client = cl.id_client
        WHERE o.id_of = $1`,
      [id]
    );
    if (ofRes.rows.length === 0) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND('Ordre de fabrication'), HTTP_STATUS.NOT_FOUND);
    }
    const of = ofRes.rows[0];

    // Machine + opérateur via planning_machines
    let machine = null;
    let operateur = null;
    if (await _tblExists('planning_machines')) {
      try {
        const pmRes = await pool.query(
          `SELECT pm.id_operateur, m.id_machine, m.numero_machine, m.marque, m.modele, m.statut AS machine_statut,
                  op.nom AS op_nom, op.prenom AS op_prenom
             FROM planning_machines pm
             LEFT JOIN machines m ON m.id_machine = pm.id_machine
             LEFT JOIN operateurs op ON op.id_operateur = pm.id_operateur
            WHERE pm.id_of = $1
            ORDER BY pm.id DESC
            LIMIT 1`,
          [id]
        );
        if (pmRes.rows[0]) {
          const r = pmRes.rows[0];
          if (r.id_machine) machine = {
            id_machine: r.id_machine, numero_machine: r.numero_machine,
            marque: r.marque, modele: r.modele, statut: r.machine_statut,
          };
          if (r.id_operateur) operateur = {
            id_operateur: r.id_operateur, nom: r.op_nom, prenom: r.op_prenom,
          };
        }
      } catch { /* silent */ }
    }

    // Suivis production
    let suivis = [];
    if (await _tblExists('suivi_fabrication')) {
      try {
        const sfRes = await pool.query(
          `SELECT sf.*, op.nom AS operateur_nom, op.prenom AS operateur_prenom
             FROM suivi_fabrication sf
             LEFT JOIN operateurs op ON op.id_operateur = sf.id_operateur
            WHERE sf.id_of = $1
            ORDER BY COALESCE(sf.date_debut, sf.date_creation) ASC`,
          [id]
        );
        suivis = sfRes.rows;
      } catch { /* silent */ }
    }

    // Coûts (dernier calcul)
    let couts = null;
    if (await _tblExists('couts')) {
      try {
        const cRes = await pool.query(
          `SELECT * FROM couts WHERE id_of = $1 ORDER BY date_calcul DESC NULLS LAST, id_cout DESC LIMIT 1`,
          [id]
        );
        couts = cRes.rows[0] || null;
      } catch { /* silent */ }
    }

    // Lots produits
    let lots = [];
    if (await _tblExists('lots_coupe')) {
      try {
        const lRes = await pool.query(
          `SELECT * FROM lots_coupe WHERE id_of = $1 ORDER BY id_lot_coupe DESC`,
          [id]
        );
        lots = lRes.rows;
      } catch { /* silent */ }
    }

    // Non-conformités
    let ncs = [];
    if (await _tblExists('non_conformites')) {
      try {
        const ncRes = await pool.query(
          `SELECT * FROM non_conformites WHERE id_of = $1 ORDER BY date_declaration DESC NULLS LAST`,
          [id]
        );
        ncs = ncRes.rows;
      } catch { /* silent */ }
    }

    // MP consommées
    let mpConsommees = [];
    if (await _tblExists('mouvements_mp')) {
      try {
        const mpRes = await pool.query(
          `SELECT mm.*, mp.code_mp, mp.designation AS mp_designation, mp.unite AS mp_unite
             FROM mouvements_mp mm
             LEFT JOIN matieres_premieres mp ON mp.id_mp = mm.id_mp
            WHERE mm.id_of = $1 AND mm.type_mouvement IN ('sortie','consommation')
            ORDER BY mm.date_mouvement ASC`,
          [id]
        );
        mpConsommees = mpRes.rows;
      } catch { /* silent */ }
    }

    // Timeline chronologique
    const timeline = [];
    if (of.date_creation_of) timeline.push({
      type: 'creation', date: of.date_creation_of, label: `OF créé (${of.numero_of})`,
    });
    if (of.date_debut_reelle) timeline.push({
      type: 'demarrage', date: of.date_debut_reelle, label: 'Lancement production',
    });
    for (const s of suivis) {
      timeline.push({
        type: 'suivi',
        date: s.date_debut || s.date_creation,
        label: `Run production — ${s.quantite_produite || 0} produits`,
        detail: { rendement: s.rendement, trs: s.trs, quantite_bonne: s.quantite_bonne, quantite_rebut: s.quantite_rebut },
      });
    }
    for (const nc of ncs) timeline.push({
      type: 'non_conformite', date: nc.date_declaration, label: `Non-conformité: ${nc.description || ''}`,
    });
    if (of.date_fin_reelle) timeline.push({
      type: 'fin', date: of.date_fin_reelle, label: 'Production terminée',
    });
    timeline.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

    const qty = Number(of.quantite_a_produire || 0);
    const prod = Number(of.quantite_produite || 0);
    const avancementPct = qty > 0 ? +((prod / qty) * 100).toFixed(1) : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const finPrevue = of.date_fin_prevue ? new Date(of.date_fin_prevue) : null;
    const enRetard = !!(finPrevue && finPrevue < today && of.statut !== 'termine' && of.statut !== 'annule');

    return sendSuccess(res, {
      of: {
        ...of,
        avancement_pct: avancementPct,
        en_retard: enRetard,
      },
      machine,
      operateur,
      suivis,
      couts,
      lots,
      non_conformites: ncs,
      mp_consommees: mpConsommees,
      timeline,
    });
  } catch (error) {
    return handleError(res, error, 'getOFDetailComplet');
  }
};

// ── DELETE /api/of/:id ──────────────────────────────────────────────────
export const deleteOf = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id_of, statut FROM ordres_fabrication WHERE id_of = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('OF'));
    }

    // Soft delete via statut
    await pool.query(
      "UPDATE ordres_fabrication SET statut = 'annule', date_modification = NOW() WHERE id_of = $1",
      [id]
    );

    logger.info('OF annulé', { id });
    return sendSuccess(res, null, 'OF annulé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteOf');
  }
};
