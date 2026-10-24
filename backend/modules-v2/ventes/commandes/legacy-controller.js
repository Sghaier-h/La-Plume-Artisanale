/**
 * Contrôleur Commandes — Module modulaire
 * CRUD commandes avec lignes d'articles
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/commandes ──────────────────────────────────────────────────
export const getCommandes = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin, page, limit, sans_of } = req.query;

    const qb = new QueryBuilder('commandes', 'c')
      .select([
        'c.id_commande', 'c.numero_commande', 'c.id_client',
        'cl.raison_sociale as client_nom',
        'c.date_commande', 'c.date_livraison_prevue',
        'c.statut', 'c.priorite', 'c.montant_total',
        'c.devise', 'c.date_creation',
        `(SELECT COUNT(*)::int FROM ordres_fabrication ofx
           WHERE ofx.id_article_commande IN (
             SELECT ac.id_article_commande FROM articles_commande ac WHERE ac.id_commande = c.id_commande
           )) AS nb_ofs`
      ])
      .join('LEFT JOIN comptes cl ON c.id_client = cl.id_client')
      .search(['c.numero_commande', 'cl.raison_sociale'], search)
      .whereIf('c.statut = $?', statut)
      .whereIf('c.id_client = $?', client_id)
      .dateRange('c.date_commande', date_debut, date_fin)
      .orderBy('c.date_commande DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 20);

    const result = await qb.execute(pool);
    // Post-filtre sans_of (le QueryBuilder ne supporte pas le HAVING sur sous-requête)
    if (sans_of === '1' && Array.isArray(result?.data)) {
      result.data = result.data.filter(r => r.statut === 'validee' && (r.nb_ofs || 0) === 0);
    } else if (sans_of === '0' && Array.isArray(result?.data)) {
      result.data = result.data.filter(r => (r.nb_ofs || 0) > 0);
    }
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getCommandes');
  }
};

// ── GET /api/commandes/:id ──────────────────────────────────────────────
export const getCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const commande = await pool.query(
      `SELECT c.*, cl.raison_sociale as client_nom, cl.code_client as client_code
       FROM commandes c
       LEFT JOIN comptes cl ON c.id_client = cl.id_client
       WHERE c.id_commande = $1`,
      [id]
    );

    if (commande.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }

    const lignes = await pool.query(
      `SELECT ac.*, a.code_article, a.designation as article_designation
       FROM articles_commande ac
       LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
       WHERE ac.id_commande = $1
       ORDER BY ac.numero_ligne`,
      [id]
    );

    return sendSuccess(res, { ...commande.rows[0], lignes: lignes.rows });
  } catch (error) {
    return handleError(res, error, 'getCommande');
  }
};

// ── POST /api/commandes ─────────────────────────────────────────────────
export const createCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { client_id, date_commande, date_livraison_prevue, lignes, ...commandeData } = req.body;

    if (!client_id || !date_commande || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Client, date et lignes de commande requis', HTTP_STATUS.BAD_REQUEST);
    }

    // Vérifier client
    const clientCheck = await client.query(
      'SELECT id_client FROM comptes WHERE id_client = $1 AND actif = true',
      [client_id]
    );
    if (clientCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Client actif'));
    }

    // Numéro auto
    const count = await client.query('SELECT COUNT(*) as count FROM commandes WHERE date_commande >= CURRENT_DATE');
    const numero = `CMD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    // Calcul montant
    let montantTotal = 0;
    for (const ligne of lignes) {
      montantTotal += (ligne.prix_unitaire || 0) * (ligne.quantite_commandee || 0) * (1 - (ligne.remise || 0) / 100);
    }

    const userId = getUserId(req) || 1;
    const commande = await client.query(
      `INSERT INTO commandes
        (numero_commande, id_client, date_commande, date_livraison_prevue,
         statut, priorite, montant_total, devise, conditions_paiement,
         adresse_livraison, observations, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        numero, client_id, date_commande, date_livraison_prevue || null,
        commandeData.statut || 'en_attente', commandeData.priorite || 'normale',
        montantTotal, commandeData.devise || 'TND', commandeData.conditions_paiement || null,
        commandeData.adresse_livraison || null, commandeData.observations || null, userId
      ]
    );

    const idCommande = commande.rows[0].id_commande;

    // Insérer lignes
    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i];
      const montantLigne = (l.prix_unitaire || 0) * (l.quantite_commandee || 0) * (1 - (l.remise || 0) / 100);

      await client.query(
        `INSERT INTO articles_commande
          (id_commande, numero_ligne, id_article, quantite_commandee,
           prix_unitaire, remise, montant_ligne, date_livraison_prevue, observations)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [idCommande, i + 1, l.id_article, l.quantite_commandee,
         l.prix_unitaire, l.remise || 0, montantLigne,
         l.date_livraison_prevue || null, l.observations || null]
      );
    }

    await client.query('COMMIT');
    logger.info('Commande créée', { id: idCommande, numero });

    const result = await pool.query(
      `SELECT c.*, cl.raison_sociale as client_nom
       FROM commandes c LEFT JOIN comptes cl ON c.id_client = cl.id_client
       WHERE c.id_commande = $1`, [idCommande]
    );

    return sendSuccess(res, result.rows[0], 'Commande créée avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'createCommande');
  } finally {
    client.release();
  }
};

// ── PUT /api/commandes/:id ──────────────────────────────────────────────
export const updateCommande = async (req, res) => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    const { id } = req.params;
    const updateData = req.body;

    const existing = await dbClient.query(
      'SELECT id_commande, statut FROM commandes WHERE id_commande = $1', [id]
    );
    if (existing.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }
    if (existing.rows[0].statut === 'validee' && updateData.statut !== 'validee') {
      await dbClient.query('ROLLBACK');
      return sendError(res, 'Impossible de modifier une commande validée', HTTP_STATUS.BAD_REQUEST);
    }

    const userId = getUserId(req) || 1;
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && !['lignes', 'created_by', 'updated_by'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (userId !== null) {
      fields.push(`updated_by = $${paramCount}`);
      values.push(userId);
      paramCount++;
    }
    fields.push('date_modification = CURRENT_TIMESTAMP');

    if (fields.length > 0) {
      values.push(id);
      await dbClient.query(
        `UPDATE commandes SET ${fields.join(', ')} WHERE id_commande = $${paramCount}`,
        values
      );
    }

    // Mise à jour des lignes
    if (updateData.lignes) {
      await dbClient.query('DELETE FROM articles_commande WHERE id_commande = $1', [id]);

      for (let i = 0; i < updateData.lignes.length; i++) {
        const l = updateData.lignes[i];
        const montantLigne = (l.prix_unitaire || 0) * (l.quantite_commandee || 0) * (1 - (l.remise || 0) / 100);

        await dbClient.query(
          `INSERT INTO articles_commande
            (id_commande, numero_ligne, id_article, quantite_commandee,
             prix_unitaire, remise, montant_ligne, date_livraison_prevue, observations)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, i + 1, l.id_article, l.quantite_commandee,
           l.prix_unitaire, l.remise || 0, montantLigne,
           l.date_livraison_prevue || null, l.observations || null]
        );
      }

      // Recalculer le montant total
      const totalResult = await dbClient.query(
        'SELECT SUM(montant_ligne) as total FROM articles_commande WHERE id_commande = $1', [id]
      );
      await dbClient.query(
        'UPDATE commandes SET montant_total = $1, updated_by = $2, date_modification = CURRENT_TIMESTAMP WHERE id_commande = $3',
        [totalResult.rows[0].total || 0, userId, id]
      );
    }

    await dbClient.query('COMMIT');

    const result = await pool.query(
      `SELECT c.*, cl.raison_sociale as client_nom
       FROM commandes c LEFT JOIN comptes cl ON c.id_client = cl.id_client
       WHERE c.id_commande = $1`, [id]
    );

    return sendSuccess(res, result.rows[0], 'Commande mise à jour');
  } catch (error) {
    await dbClient.query('ROLLBACK');
    return handleError(res, error, 'updateCommande');
  } finally {
    dbClient.release();
  }
};

// ── Helpers OF ──────────────────────────────────────────────────────────
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const toDateStr = (d) => new Date(d).toISOString().split('T')[0];

/**
 * Calcule les OFs à générer pour une commande. Retourne un array + warnings globaux.
 * Ne fait AUCUNE écriture.
 */
async function computePreviewOfs(idCommande, dbClient = null) {
  const q = dbClient || pool;

  const commande = await q.query(
    `SELECT c.id_commande, c.numero_commande, c.id_client, c.statut, c.date_livraison_prevue,
            cl.raison_sociale
     FROM commandes c
     LEFT JOIN comptes cl ON c.id_client = cl.id_client
     WHERE c.id_commande = $1`,
    [idCommande]
  );
  if (commande.rows.length === 0) return { notFound: true };

  const lignes = await q.query(
    `SELECT ac.id_article_commande, ac.id_commande, ac.id_article,
            ac.quantite_commandee AS quantite,
            ac.date_livraison_prevue AS ligne_date_livraison,
            a.code_article, a.designation AS article_designation,
            a.temps_production_standard, a.prix_revient, a.id_tissage
     FROM articles_commande ac
     LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
     WHERE ac.id_commande = $1
     ORDER BY ac.numero_ligne, ac.id_article_commande`,
    [idCommande]
  );

  const ofs = [];
  const warningsGlobaux = [];

  for (const row of lignes.rows) {
    const warnings = [];
    const quantite = Number(row.quantite) || 0;
    const tempsStd = Number(row.temps_production_standard) || 1;
    const prixRevient = Number(row.prix_revient) || 0;

    // Durée estimée en heures = temps unitaire × quantité
    const tempsEstimeHeures = tempsStd * quantite;
    const nbJours = Math.max(1, Math.ceil(tempsEstimeHeures / 8));

    const dateDebut = new Date();
    const dateFin = addDays(dateDebut, nbJours);
    const coutEstime = quantite * prixRevient;

    // Machine suggérée: type_machine correspondant au tissage, statut opérationnelle,
    // moins chargée (nb OFs actifs ASC)
    let machineSuggeree = null;
    if (row.id_tissage) {
      try {
        const mres = await q.query(
          `SELECT m.id_machine, m.numero_machine, m.marque,
                  COALESCE((SELECT COUNT(*) FROM planning_machines pm
                            LEFT JOIN ordres_fabrication ofx ON pm.id_of = ofx.id_of
                            WHERE pm.id_machine = m.id_machine
                              AND ofx.statut IN ('planifie','en_cours')), 0) AS charge
           FROM machines m
           WHERE COALESCE(m.statut, 'operationnelle') = 'operationnelle'
             AND (m.id_type_machine = $1 OR $1 IS NULL)
           ORDER BY charge ASC, m.id_machine ASC
           LIMIT 1`,
          [row.id_tissage]
        );
        if (mres.rows.length > 0) {
          machineSuggeree = mres.rows[0];
        } else {
          warnings.push(`Aucune machine disponible pour type tissage ${row.id_tissage}`);
        }
      } catch (e) {
        // schema variant — ignore
      }
    }

    // MP requises via BOM
    let mpRequises = [];
    try {
      const bomMaster = await q.query(
        `SELECT id_bom_master FROM bom_master WHERE id_article = $1 AND COALESCE(actif, true) = true LIMIT 1`,
        [row.id_article]
      );
      if (bomMaster.rows.length > 0) {
        const composants = await q.query(
          `SELECT bc.*,
                  mp.id_mp, mp.code_mp, mp.designation AS mp_designation, mp.unite AS mp_unite
           FROM bom_composant bc
           LEFT JOIN matieres_premieres mp ON mp.code_mp = bc.code_bom_composant
           WHERE bc.id_bom_master = $1 AND COALESCE(bc.actif, true) = true`,
          [bomMaster.rows[0].id_bom_master]
        );
        mpRequises = composants.rows.map(c => {
          const conso = ['consommation_s01','consommation_s02','consommation_s03',
                         'consommation_s04','consommation_s05','consommation_s06']
            .reduce((s, k) => s + (Number(c[k]) || 0), 0);
          const qtyUnit = conso > 0 ? conso : (Number(c.quantite) || 0);
          const qtyTotale = qtyUnit * quantite;
          return {
            id_mp: c.id_mp || null,
            code_mp: c.code_mp || c.code_bom_composant,
            designation: c.mp_designation || c.produit_libelle,
            quantite_necessaire: qtyTotale,
            unite: c.mp_unite || c.unite || null,
            stock_actuel: null,
          };
        });
      } else {
        warnings.push('Aucune nomenclature BOM associée à cet article');
      }
    } catch {
      // schema variant — silently skip MP
    }

    ofs.push({
      id_article_commande: row.id_article_commande,
      id_article: row.id_article,
      article_designation: row.article_designation,
      code_article: row.code_article,
      quantite_a_produire: quantite,
      unite: 'pcs',
      date_debut_prevue: toDateStr(dateDebut),
      date_fin_prevue: toDateStr(dateFin),
      temps_production_estime: tempsEstimeHeures,
      cout_estime: Number(coutEstime.toFixed(2)),
      priorite: 'normale',
      machine_suggeree: machineSuggeree,
      mp_requises: mpRequises,
      warnings,
    });
  }

  const nbSansMachine = ofs.filter(o => !o.machine_suggeree).length;
  if (nbSansMachine > 0) warningsGlobaux.push(`${nbSansMachine} OF sans machine disponible`);

  return {
    commande: {
      id_commande: commande.rows[0].id_commande,
      numero_commande: commande.rows[0].numero_commande,
      id_client: commande.rows[0].id_client,
      raison_sociale: commande.rows[0].raison_sociale,
      statut: commande.rows[0].statut,
    },
    ofs_a_generer: ofs,
    total_ofs: ofs.length,
    warnings_globaux: warningsGlobaux,
  };
}

// ── GET /api/commandes/:id/preview-ofs ──────────────────────────────────
export const previewOFs = async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await computePreviewOfs(parseInt(id, 10));
    if (preview.notFound) return sendError(res, 'Commande non trouvée', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, preview);
  } catch (error) {
    return handleError(res, error, 'previewOFs');
  }
};

// ── POST /api/commandes/:id/generer-ofs ─────────────────────────────────
export const generateOFs = async (req, res) => {
  const dbClient = await pool.connect();
  try {
    const idCommande = parseInt(req.params.id, 10);
    const { overrides = [], force = false } = req.body || {};

    await dbClient.query('BEGIN');

    const cmdRes = await dbClient.query(
      `SELECT id_commande, numero_commande, statut FROM commandes WHERE id_commande = $1 FOR UPDATE`,
      [idCommande]
    );
    if (cmdRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return sendError(res, 'Commande non trouvée', HTTP_STATUS.NOT_FOUND);
    }
    const cmd = cmdRes.rows[0];
    if (cmd.statut !== 'validee' && !force) {
      await dbClient.query('ROLLBACK');
      return sendError(
        res,
        `Impossible de générer des OF: statut de la commande = '${cmd.statut}'. Utilisez { force: true } pour forcer.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Détecter OFs déjà présents
    const existing = await dbClient.query(
      `SELECT COUNT(*)::int AS n FROM ordres_fabrication ofx
       WHERE ofx.id_article_commande IN (
         SELECT id_article_commande FROM articles_commande WHERE id_commande = $1
       )`,
      [idCommande]
    );
    if (existing.rows[0].n > 0 && !force) {
      await dbClient.query('ROLLBACK');
      return sendError(
        res,
        `${existing.rows[0].n} OF existent déjà pour cette commande. Utilisez { force: true } pour créer quand même.`,
        409
      );
    }

    const preview = await computePreviewOfs(idCommande, dbClient);
    if (preview.notFound) {
      await dbClient.query('ROLLBACK');
      return sendError(res, 'Commande non trouvée', HTTP_STATUS.NOT_FOUND);
    }

    const overridesById = new Map((overrides || []).map(o => [o.id_article_commande, o]));
    const userId = getUserId(req) || 1;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // Compter les OFs déjà créés aujourd'hui pour la séquence
    const seqRes = await dbClient.query(
      `SELECT COUNT(*)::int AS n FROM ordres_fabrication
       WHERE date_creation_of = CURRENT_DATE`
    );
    let seq = seqRes.rows[0].n;

    const io = await getIo();
    const created = [];

    for (const of of preview.ofs_a_generer) {
      const override = overridesById.get(of.id_article_commande) || {};
      const dateDebut = override.date_debut_prevue || of.date_debut_prevue;
      const dateFin = override.date_fin_prevue || of.date_fin_prevue;
      const priorite = override.priorite || of.priorite;
      const idMachine = override.id_machine ?? of.machine_suggeree?.id_machine ?? null;

      seq += 1;
      const numeroOf = `OF-${today}-${String(seq).padStart(3, '0')}`;

      const ins = await dbClient.query(
        `INSERT INTO ordres_fabrication
          (numero_of, id_article_commande, id_article, quantite_a_produire,
           date_creation_of, date_debut_prevue, date_fin_prevue, statut, cree_par)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, 'planifie', $7)
         RETURNING *`,
        [numeroOf, of.id_article_commande, of.id_article, of.quantite_a_produire,
         dateDebut, dateFin, userId]
      );
      const ofRow = ins.rows[0];

      // Planning machine si machine ciblée
      if (idMachine) {
        try {
          await dbClient.query(
            `INSERT INTO planning_machines
               (id_machine, id_of, date_debut_prevue, date_fin_prevue, statut,
                observations, date_creation, created_by)
             VALUES ($1, $2, $3, $4, 'planifie', $5, NOW(), $6)`,
            [idMachine, ofRow.id_of, dateDebut, dateFin,
             `Auto-généré depuis commande ${cmd.numero_commande}`, userId]
          );
        } catch (e) {
          logger.warn('planning_machines insert échoué', { err: e.message });
        }
      }

      created.push({ ...ofRow, priorite, machine: idMachine });
      if (io) io.emit('of:created', { of: ofRow, id_commande: idCommande });
    }

    // Update commande → en_production
    await dbClient.query(
      `UPDATE commandes SET statut = 'en_production', date_modification = CURRENT_TIMESTAMP
       WHERE id_commande = $1`,
      [idCommande]
    );

    await dbClient.query('COMMIT');

    if (io) io.emit('of:generated', { id_commande: idCommande, ofs_created: created.length });
    logger.info('OFs générés', { id_commande: idCommande, count: created.length });

    return sendSuccess(res, {
      ofs_created: created,
      count: created.length,
      warnings: preview.warnings_globaux,
    }, `${created.length} OF créés`, HTTP_STATUS.CREATED);
  } catch (error) {
    try { await dbClient.query('ROLLBACK'); } catch {}
    return handleError(res, error, 'generateOFs');
  } finally {
    dbClient.release();
  }
};

// ─── Helpers introspection tables ───────────────────────────────────────
const _tableCache = new Map();
async function tableExists(name) {
  if (_tableCache.has(name)) return _tableCache.get(name);
  try {
    const r = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1 LIMIT 1`,
      [name]
    );
    const ok = r.rows.length > 0;
    _tableCache.set(name, ok);
    return ok;
  } catch { return false; }
}
async function columnExists(table, col) {
  const key = `${table}.${col}`;
  if (_tableCache.has(key)) return _tableCache.get(key);
  try {
    const r = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
      [table, col]
    );
    const ok = r.rows.length > 0;
    _tableCache.set(key, ok);
    return ok;
  } catch { return false; }
}

// ─── Stock disponible (multi-fallback) ──────────────────────────────────
async function getStockDisponible(idArticle) {
  // Option A : table stock_pf
  if (await tableExists('stock_pf')) {
    try {
      const r = await pool.query(
        `SELECT COALESCE(SUM(quantite),0)::float AS q FROM stock_pf WHERE id_article = $1`,
        [idArticle]
      );
      return Number(r.rows[0]?.q || 0);
    } catch { /* fallback */ }
  }
  // Option B : articles_catalogue.stock_actuel
  if (await columnExists('articles_catalogue', 'stock_actuel')) {
    try {
      const r = await pool.query(
        `SELECT COALESCE(stock_actuel,0)::float AS q FROM articles_catalogue WHERE id_article = $1`,
        [idArticle]
      );
      return Number(r.rows[0]?.q || 0);
    } catch { /* fallback */ }
  }
  return 0;
}

// ─── Stock réservé (autres commandes en_production) ─────────────────────
async function getStockReserve(idArticle, excludeCommandeId = null) {
  if (!(await columnExists('articles_commande', 'quantite_prise_stock'))) return 0;
  try {
    const r = await pool.query(
      `SELECT COALESCE(SUM(ac.quantite_prise_stock),0)::float AS q
         FROM articles_commande ac
         JOIN commandes c ON ac.id_commande = c.id_commande
        WHERE ac.id_article = $1
          AND ac.quantite_prise_stock > 0
          AND c.statut IN ('en_production','stock_reserve','validee')
          AND ($2::int IS NULL OR c.id_commande <> $2)`,
      [idArticle, excludeCommandeId]
    );
    return Number(r.rows[0]?.q || 0);
  } catch { return 0; }
}

// ─── Estimation OF (machine + MP + temps + coût) ────────────────────────
async function estimerOF(idArticle, quantite) {
  const est = {
    temps_production_jours: null,
    cout_estime: null,
    machine_suggeree_id: null,
    machine_suggeree_numero: null,
    mp_requises: [],
  };
  if (quantite <= 0) return est;

  // Article — cadence + coût unitaire
  try {
    const cols = [];
    if (await columnExists('articles_catalogue', 'cadence_horaire')) cols.push('cadence_horaire');
    if (await columnExists('articles_catalogue', 'temps_fabrication_unitaire')) cols.push('temps_fabrication_unitaire');
    if (await columnExists('articles_catalogue', 'cout_revient')) cols.push('cout_revient');
    if (await columnExists('articles_catalogue', 'cout_fabrication')) cols.push('cout_fabrication');
    if (cols.length > 0) {
      const r = await pool.query(
        `SELECT ${cols.join(',')} FROM articles_catalogue WHERE id_article = $1`,
        [idArticle]
      );
      const row = r.rows[0] || {};
      const cadence = Number(row.cadence_horaire || 0);
      const tempsUnit = Number(row.temps_fabrication_unitaire || 0);
      if (cadence > 0) est.temps_production_jours = +(quantite / cadence / 8).toFixed(2);
      else if (tempsUnit > 0) est.temps_production_jours = +((tempsUnit * quantite) / 60 / 8).toFixed(2);
      else est.temps_production_jours = +(quantite / 100).toFixed(2);
      const coutU = Number(row.cout_revient || row.cout_fabrication || 0);
      if (coutU > 0) est.cout_estime = +(coutU * quantite).toFixed(2);
    }
  } catch { /* silent */ }

  // Machine suggérée
  if (await tableExists('machines')) {
    try {
      const r = await pool.query(
        `SELECT id_machine, numero_machine FROM machines
          WHERE COALESCE(statut,'active') NOT IN ('hors_service','maintenance')
          ORDER BY id_machine LIMIT 1`
      );
      if (r.rows[0]) {
        est.machine_suggeree_id = r.rows[0].id_machine;
        est.machine_suggeree_numero = r.rows[0].numero_machine;
      }
    } catch { /* silent */ }
  }

  // MP requises via nomenclatures (best-effort)
  if (await tableExists('nomenclatures')) {
    try {
      const r = await pool.query(
        `SELECT n.id_mp, n.quantite_unitaire, n.unite,
                mp.code_mp, mp.designation,
                COALESCE(mp.stock_actuel, 0) AS stock_actuel
           FROM nomenclatures n
           LEFT JOIN matieres_premieres mp ON n.id_mp = mp.id_mp
          WHERE n.id_article = $1`,
        [idArticle]
      );
      est.mp_requises = r.rows.map(row => {
        const qNeed = Number(row.quantite_unitaire || 0) * quantite;
        return {
          id_mp: row.id_mp,
          code_mp: row.code_mp,
          designation: row.designation,
          quantite_pour_qte: +qNeed.toFixed(3),
          unite: row.unite,
          stock_actuel: Number(row.stock_actuel || 0),
          suffisant: Number(row.stock_actuel || 0) >= qNeed,
        };
      });
    } catch { /* silent */ }
  }

  return est;
}

// ── GET /api/commandes/:id/analyse-stock ────────────────────────────────
export const analyseStock = async (req, res) => {
  try {
    const { id } = req.params;
    const cmd = await pool.query(
      `SELECT c.id_commande, c.numero_commande, c.id_client, c.statut,
              cl.raison_sociale
         FROM commandes c
         LEFT JOIN comptes cl ON c.id_client = cl.id_client
        WHERE c.id_commande = $1`,
      [id]
    );
    if (cmd.rows.length === 0) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND('Commande'), HTTP_STATUS.NOT_FOUND);
    }
    const commande = cmd.rows[0];

    const lignes = await pool.query(
      `SELECT ac.id_article_commande, ac.id_article, ac.quantite_commandee,
              COALESCE(ac.quantite_prise_stock,0) AS quantite_prise_stock,
              COALESCE(ac.quantite_fabriquee,0) AS quantite_fabriquee,
              COALESCE(ac.statut_ligne,'a_traiter') AS statut_ligne,
              a.code_article, a.designation
         FROM articles_commande ac
         LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
        WHERE ac.id_commande = $1
        ORDER BY ac.numero_ligne`,
      [id]
    );

    const articles = [];
    for (const l of lignes.rows) {
      const qCmd = Number(l.quantite_commandee || 0);
      const dispo = await getStockDisponible(l.id_article);
      const reserve = await getStockReserve(l.id_article, Number(id));
      const utilisable = Math.max(0, dispo - reserve);
      const qStockMax = Math.min(qCmd, utilisable);
      const qFabMin = Math.max(0, qCmd - qStockMax);
      const stockOnlyFaisable = utilisable >= qCmd;

      const est = await estimerOF(l.id_article, qFabMin || qCmd);
      const warnings = [];
      if (est.mp_requises.some(m => !m.suffisant)) {
        warnings.push('Certaines matières premières sont insuffisantes en stock.');
      }
      if (!est.machine_suggeree_id) {
        warnings.push('Aucune machine disponible détectée.');
      }

      articles.push({
        id_article_commande: l.id_article_commande,
        id_article: l.id_article,
        code_article: l.code_article,
        designation: l.designation,
        quantite_commandee: qCmd,
        stock_disponible: dispo,
        stock_reserve: reserve,
        stock_utilisable: utilisable,
        quantite_a_prendre_stock_max: qStockMax,
        quantite_a_fabriquer_min: qFabMin,
        statut_ligne: l.statut_ligne,
        options: [
          {
            code: 'stock_only',
            libelle: stockOnlyFaisable
              ? `Livrer ${qCmd} du stock`
              : `Livrer ${qStockMax} du stock (partiel)`,
            faisable: stockOnlyFaisable,
            note: stockOnlyFaisable ? null : `Reste ${qFabMin} unités non couvertes`,
          },
          {
            code: 'mix',
            libelle: `${qStockMax} du stock + fabriquer ${qFabMin}`,
            faisable: qStockMax > 0 && qFabMin > 0,
            recommandee: qStockMax > 0 && qFabMin > 0,
          },
          {
            code: 'fabrication_only',
            libelle: `Fabriquer les ${qCmd} unités`,
            faisable: true,
            recommandee: qStockMax === 0,
          },
          {
            code: 'attendre_reappro',
            libelle: 'Attendre réapprovisionnement stock',
            faisable: true,
          },
        ],
        of_estimation: est,
        warnings,
      });
    }

    return sendSuccess(res, {
      commande: {
        id_commande: commande.id_commande,
        numero_commande: commande.numero_commande,
        id_client: commande.id_client,
        raison_sociale: commande.raison_sociale,
        statut: commande.statut,
      },
      articles,
    });
  } catch (error) {
    return handleError(res, error, 'analyseStock');
  }
};

// ── POST /api/commandes/:id/executer-choix ──────────────────────────────
export const executerChoix = async (req, res) => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    const { id } = req.params;
    const { decisions } = req.body || {};
    if (!Array.isArray(decisions) || decisions.length === 0) {
      await dbClient.query('ROLLBACK');
      return sendError(res, 'decisions[] requis', HTTP_STATUS.BAD_REQUEST);
    }

    const userId = getUserId(req) || 1;
    const cmd = await dbClient.query(
      `SELECT id_commande, numero_commande, statut FROM commandes WHERE id_commande = $1`,
      [id]
    );
    if (cmd.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return sendError(res, ERROR_MESSAGES.NOT_FOUND('Commande'), HTTP_STATUS.NOT_FOUND);
    }
    const numeroCommande = cmd.rows[0].numero_commande;

    const hasQtyStock = await columnExists('articles_commande', 'quantite_prise_stock');
    const hasQtyFab = await columnExists('articles_commande', 'quantite_fabriquee');
    const hasStatutLigne = await columnExists('articles_commande', 'statut_ligne');
    const hasMouvementsStock = await tableExists('mouvements_stock');
    const hasPlanningMachines = await tableExists('planning_machines');

    const ofsCrees = [];
    const stockReserve = [];

    for (const dec of decisions) {
      const idAC = Number(dec.id_article_commande);
      const action = String(dec.action || 'fabrication_only');
      const qStock = Math.max(0, Number(dec.quantite_prise_stock || 0));
      const qFab = Math.max(0, Number(dec.quantite_a_fabriquer || 0));
      const priorite = dec.priorite || 'normale';

      // Charger la ligne
      const ligne = await dbClient.query(
        `SELECT ac.*, a.code_article
           FROM articles_commande ac
           LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
          WHERE ac.id_article_commande = $1 AND ac.id_commande = $2`,
        [idAC, id]
      );
      if (ligne.rows.length === 0) continue;
      const l = ligne.rows[0];

      // ── Réservation stock ────────────────────────────────────────────
      if (qStock > 0) {
        if (hasQtyStock) {
          await dbClient.query(
            `UPDATE articles_commande
                SET quantite_prise_stock = $1
              WHERE id_article_commande = $2`,
            [qStock, idAC]
          );
        }
        if (hasMouvementsStock) {
          try {
            await dbClient.query(
              `INSERT INTO mouvements_stock
                 (id_article, quantite, type_mouvement, reference_document, observations, cree_par, date_mouvement)
               VALUES ($1, $2, 'reservation', $3, $4, $5, NOW())`,
              [l.id_article, qStock, `CMD-${numeroCommande}`,
               `Réservation commande ${numeroCommande} ligne ${idAC}`, userId]
            );
          } catch (e) {
            logger.warn?.('mouvements_stock insert failed', { err: e.message });
          }
        }
        stockReserve.push({ id_article: l.id_article, quantite: qStock });
      }

      // ── Création OF ──────────────────────────────────────────────────
      let idOf = null;
      let numeroOf = null;
      if (qFab > 0 && action !== 'attendre_reappro') {
        // Numéro OF auto
        const cnt = await dbClient.query(
          `SELECT COUNT(*) AS c FROM ordres_fabrication WHERE date_creation_of >= CURRENT_DATE`
        );
        numeroOf = `OF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(cnt.rows[0].c) + 1 + ofsCrees.length).padStart(4, '0')}`;

        const dateDebut = dec.date_debut_prevue || new Date().toISOString().split('T')[0];
        const est = await estimerOF(l.id_article, qFab);
        const joursFab = Math.max(1, Math.ceil(est.temps_production_jours || 1));
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + joursFab);
        const dateFinStr = dateFin.toISOString().split('T')[0];

        const ofRow = await dbClient.query(
          `INSERT INTO ordres_fabrication
             (numero_of, id_article, id_article_commande, quantite_a_produire,
              date_debut_prevue, date_fin_prevue, statut, priorite,
              cout_estime, temps_production_estime, cree_par, date_creation_of)
           VALUES ($1,$2,$3,$4,$5,$6,'planifie',$7,$8,$9,$10,NOW())
           RETURNING id_of, numero_of, quantite_a_produire`,
          [numeroOf, l.id_article, idAC, qFab, dateDebut, dateFinStr, priorite,
           est.cout_estime, est.temps_production_jours, userId]
        );
        idOf = ofRow.rows[0].id_of;
        ofsCrees.push(ofRow.rows[0]);

        // Planning machine
        if (hasPlanningMachines && (dec.id_machine || est.machine_suggeree_id)) {
          try {
            await dbClient.query(
              `INSERT INTO planning_machines
                 (id_machine, id_of, date_debut, date_fin, statut)
               VALUES ($1, $2, $3, $4, 'planifie')`,
              [dec.id_machine || est.machine_suggeree_id, idOf, dateDebut, dateFinStr]
            );
          } catch (e) {
            logger.warn?.('planning_machines insert failed', { err: e.message });
          }
        }

        if (hasQtyFab) {
          await dbClient.query(
            `UPDATE articles_commande SET quantite_fabriquee = COALESCE(quantite_fabriquee,0) + $1
              WHERE id_article_commande = $2`,
            [0, idAC]  // planifié, pas encore fabriqué
          );
        }
      }

      // ── Statut de la ligne ────────────────────────────────────────────
      if (hasStatutLigne) {
        let statutLigne = 'a_traiter';
        if (action === 'stock_only') statutLigne = 'reservee_stock';
        else if (action === 'mix') statutLigne = 'mixte';
        else if (action === 'fabrication_only') statutLigne = 'en_production';
        else if (action === 'attendre_reappro') statutLigne = 'attente_reappro';
        await dbClient.query(
          `UPDATE articles_commande SET statut_ligne = $1 WHERE id_article_commande = $2`,
          [statutLigne, idAC]
        );
      }
    }

    // ── Statut commande global ──────────────────────────────────────────
    let nouveauStatut = 'validee';
    if (ofsCrees.length > 0) nouveauStatut = 'en_production';
    else if (stockReserve.length > 0) nouveauStatut = 'stock_reserve';

    await dbClient.query(
      `UPDATE commandes SET statut = $1, updated_by = $2, date_modification = CURRENT_TIMESTAMP
        WHERE id_commande = $3`,
      [nouveauStatut, userId, id]
    );

    await dbClient.query('COMMIT');
    logger.info('Commande — choix exécuté', {
      id, ofs: ofsCrees.length, stock: stockReserve.length, statut: nouveauStatut,
    });

    // Émission Socket.IO (post-commit)
    try {
      const io = await getIo();
      if (io) {
        io.emit('commande:executee', {
          id_commande: Number(id),
          numero_commande: numeroCommande,
          ofs_crees: ofsCrees,
          stock_pris: stockReserve,
          nouveau_statut: nouveauStatut,
        });
      }
    } catch { /* silent */ }

    return sendSuccess(res, {
      success: true,
      ofs_crees: ofsCrees,
      stock_reserve: stockReserve,
      nouveau_statut_commande: nouveauStatut,
    }, 'Traitement de la commande effectué');
  } catch (error) {
    await dbClient.query('ROLLBACK');
    return handleError(res, error, 'executerChoix');
  } finally {
    dbClient.release();
  }
};

// ── GET /api/commandes/:id/with-ofs ─────────────────────────────────────
export const getCommandeWithOFs = async (req, res) => {
  try {
    const { id } = req.params;
    const cmdRes = await pool.query(
      `SELECT c.*, cl.raison_sociale, cl.email, cl.telephone, cl.code_client
         FROM commandes c
         LEFT JOIN comptes cl ON c.id_client = cl.id_client
        WHERE c.id_commande = $1`,
      [id]
    );
    if (cmdRes.rows.length === 0) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND('Commande'), HTTP_STATUS.NOT_FOUND);
    }
    const cmd = cmdRes.rows[0];

    const hasQtyStock = await columnExists('articles_commande', 'quantite_prise_stock');
    const hasQtyFab = await columnExists('articles_commande', 'quantite_fabriquee');
    const hasStatutLigne = await columnExists('articles_commande', 'statut_ligne');
    const hasPlanningMachines = await tableExists('planning_machines');

    const lignesRes = await pool.query(
      `SELECT ac.*, a.code_article, a.designation AS article_designation
         FROM articles_commande ac
         LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
        WHERE ac.id_commande = $1
        ORDER BY ac.numero_ligne`,
      [id]
    );

    // Charger tous les OFs liés pour cette commande en une seule requête
    const ofsRes = await pool.query(
      `SELECT ofx.id_of, ofx.numero_of, ofx.statut, ofx.priorite,
              ofx.quantite_a_produire, COALESCE(ofx.quantite_produite,0) AS quantite_produite,
              ofx.date_debut_prevue, ofx.date_fin_prevue,
              ofx.date_debut_reelle, ofx.date_fin_reelle,
              ofx.cout_estime, ofx.cout_reel,
              ofx.id_article_commande, ofx.id_article
         FROM ordres_fabrication ofx
         JOIN articles_commande ac ON ac.id_article_commande = ofx.id_article_commande
        WHERE ac.id_commande = $1
        ORDER BY ofx.id_of`,
      [id]
    );

    // Enrichir chaque OF avec machine + opérateur si planning_machines existe
    const ofIds = ofsRes.rows.map(o => o.id_of);
    const machineByOf = new Map();
    if (hasPlanningMachines && ofIds.length > 0) {
      try {
        const pmRes = await pool.query(
          `SELECT pm.id_of, m.id_machine, m.numero_machine, m.marque,
                  pm.id_operateur,
                  op.nom AS operateur_nom, op.prenom AS operateur_prenom
             FROM planning_machines pm
             LEFT JOIN machines m ON m.id_machine = pm.id_machine
             LEFT JOIN operateurs op ON op.id_operateur = pm.id_operateur
            WHERE pm.id_of = ANY($1::int[])`,
          [ofIds]
        );
        for (const r of pmRes.rows) machineByOf.set(r.id_of, r);
      } catch { /* silent — schema variant */ }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ofsByLigne = new Map();
    for (const of of ofsRes.rows) {
      const qty = Number(of.quantite_a_produire || 0);
      const prod = Number(of.quantite_produite || 0);
      const pct = qty > 0 ? +((prod / qty) * 100).toFixed(1) : 0;
      const finPrevue = of.date_fin_prevue ? new Date(of.date_fin_prevue) : null;
      const enRetard = !!(finPrevue && finPrevue < today && of.statut !== 'termine' && of.statut !== 'annule');
      const joursRestants = finPrevue
        ? Math.ceil((finPrevue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const m = machineByOf.get(of.id_of);
      const enrichedOf = {
        id_of: of.id_of,
        numero_of: of.numero_of,
        statut: of.statut,
        priorite: of.priorite,
        quantite_a_produire: qty,
        quantite_produite: prod,
        avancement_pct: pct,
        date_debut_prevue: of.date_debut_prevue,
        date_fin_prevue: of.date_fin_prevue,
        date_debut_reelle: of.date_debut_reelle,
        date_fin_reelle: of.date_fin_reelle,
        cout_estime: of.cout_estime != null ? Number(of.cout_estime) : null,
        cout_reel: of.cout_reel != null ? Number(of.cout_reel) : null,
        en_retard: enRetard,
        jours_restants: joursRestants,
        machine: m && m.id_machine
          ? { id_machine: m.id_machine, numero_machine: m.numero_machine, marque: m.marque }
          : null,
        operateur: m && m.id_operateur
          ? { id_operateur: m.id_operateur, nom: m.operateur_nom, prenom: m.operateur_prenom }
          : null,
      };
      if (!ofsByLigne.has(of.id_article_commande)) ofsByLigne.set(of.id_article_commande, []);
      ofsByLigne.get(of.id_article_commande).push(enrichedOf);
    }

    // Calcul statut_ligne par ligne
    const articles_commande = lignesRes.rows.map(l => {
      const qCmd = Number(l.quantite_commandee || 0);
      const qStock = hasQtyStock ? Number(l.quantite_prise_stock || 0) : 0;
      const qFab = hasQtyFab ? Number(l.quantite_fabriquee || 0) : 0;
      const ofsLigne = ofsByLigne.get(l.id_article_commande) || [];
      const qAFab = Math.max(0, qCmd - qStock);

      let statutLigne = hasStatutLigne && l.statut_ligne ? l.statut_ligne : 'a_traiter';
      if (ofsLigne.length === 0) {
        if (qStock >= qCmd && qCmd > 0) statutLigne = 'stock_seul';
        else statutLigne = 'a_traiter';
      } else {
        const allDone = ofsLigne.every(o => o.statut === 'termine');
        const anyActive = ofsLigne.some(o => ['planifie', 'en_cours', 'en_pause', 'attribue'].includes(o.statut));
        if (allDone) statutLigne = 'terminee';
        else if (anyActive) statutLigne = 'en_fabrication';
      }

      const libelles = {
        a_traiter: 'À traiter',
        stock_seul: 'Stock uniquement',
        reservee_stock: 'Réservée du stock',
        mixte: 'Mixte (stock + fabrication)',
        en_fabrication: 'En fabrication',
        en_production: 'En production',
        attente_reappro: 'Attente réappro',
        terminee: 'Terminée',
        livree: 'Livrée',
      };

      const montantHt = Number(l.montant_ligne || (Number(l.prix_unitaire || 0) * qCmd * (1 - Number(l.remise || 0) / 100)));

      return {
        id_article_commande: l.id_article_commande,
        id_article: l.id_article,
        code_article: l.code_article,
        designation: l.article_designation || l.description_article,
        description_article: l.description_article,
        ref_commerciale: l.ref_commerciale,
        dimensions: l.dimensions,
        type_finition: l.type_finition,
        quantite_commandee: qCmd,
        quantite_prise_stock: qStock,
        quantite_fabriquee: qFab,
        quantite_a_fabriquer: qAFab,
        prix_unitaire_ht: Number(l.prix_unitaire || 0),
        remise: Number(l.remise || 0),
        montant_ht: Number(montantHt.toFixed(2)),
        statut_ligne: statutLigne,
        statut_ligne_libelle: libelles[statutLigne] || statutLigne,
        ofs: ofsLigne,
      };
    });

    return sendSuccess(res, {
      commande: {
        id_commande: cmd.id_commande,
        numero_commande: cmd.numero_commande,
        date_commande: cmd.date_commande,
        date_livraison_prevue: cmd.date_livraison_prevue,
        statut: cmd.statut,
        priorite: cmd.priorite,
        montant_total: cmd.montant_total != null ? Number(cmd.montant_total) : 0,
        devise: cmd.devise,
        observations: cmd.observations,
        adresse_livraison: cmd.adresse_livraison,
        client: {
          id_client: cmd.id_client,
          raison_sociale: cmd.raison_sociale,
          email: cmd.email,
          telephone: cmd.telephone,
          code_client: cmd.code_client,
        },
        articles_commande,
      },
    });
  } catch (error) {
    return handleError(res, error, 'getCommandeWithOFs');
  }
};

// ── DELETE /api/commandes/:id ───────────────────────────────────────────
export const deleteCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT statut FROM commandes WHERE id_commande = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }
    if (existing.rows[0].statut === 'validee') {
      return sendError(res, 'Impossible de supprimer une commande validée', HTTP_STATUS.BAD_REQUEST);
    }

    await pool.query('DELETE FROM articles_commande WHERE id_commande = $1', [id]);
    await pool.query('DELETE FROM commandes WHERE id_commande = $1', [id]);
    logger.info('Commande supprimée', { id });

    return sendSuccess(res, null, 'Commande supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteCommande');
  }
};
