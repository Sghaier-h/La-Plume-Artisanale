// model.js — rh/primes-bordereaux
// Table `primes_bordereaux_hors_bulletin` + `primes_recus_signes`.
// Comptabilité : écritures compte 648 (charge non-CNSS) / 5310 caisse.
import { getPool, withTransaction } from '../../_shared/db.js';

const pool  = getPool();
const TABLE = 'primes_bordereaux_hors_bulletin';
const PK    = 'id_bordereau';

const UPDATE_COLS = new Set([
  'numero_bordereau','id_cagnotte','id_employe',
  'score_total_semaine','montant_dt','montant_irpp_dt',
  'mode_versement','compte_comptable','id_ecriture_comptable',
  'statut','date_versement','verse_par',
]);

function pick(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (UPDATE_COLS.has(k) && v !== undefined) out[k] = v;
  }
  return out;
}

async function nextNumero(client, annee) {
  await client.query('LOCK TABLE primes_bordereaux_hors_bulletin IN SHARE ROW EXCLUSIVE MODE');
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS nb FROM primes_bordereaux_hors_bulletin
       WHERE numero_bordereau LIKE $1`,
    [`BOR-${annee}-%`]
  );
  const seq = rows[0].nb + 1;
  return `BOR-${annee}-${String(seq).padStart(6, '0')}`;
}

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  const ALLOWED = new Set(['id_cagnotte','id_employe','statut','mode_versement']);
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    if (!ALLOWED.has(k)) continue;
    where.push(`${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE}
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY ${PK} DESC LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1 LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function insert(payload) {
  return withTransaction(async (client) => {
    const data = pick(payload);
    if (!data.id_cagnotte || !data.id_employe || data.montant_dt == null) {
      throw new Error('id_cagnotte, id_employe, montant_dt requis');
    }
    if (!data.numero_bordereau) {
      const annee = new Date().getFullYear();
      data.numero_bordereau = await nextNumero(client, annee);
    }
    const cols = Object.keys(data);
    const vals = Object.values(data);
    const ph   = cols.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await client.query(
      `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
      vals
    );
    return rows[0];
  });
}

export async function updateById(id, payload) {
  const data = pick(payload);
  const cols = Object.keys(data);
  if (!cols.length) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${set} WHERE ${PK} = $${cols.length + 1} RETURNING *`,
    [...Object.values(data), id]
  );
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM ${TABLE} WHERE ${PK} = $1 AND statut = 'a_verser'`,
    [id]
  );
  return { deleted: rowCount };
}

export async function verser(id, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'verse',
            date_versement = COALESCE(date_versement, CURRENT_DATE),
            verse_par = $2
      WHERE ${PK} = $1 AND statut = 'a_verser'
      RETURNING *`,
    [id, user?.id_user || null]
  );
  if (!rows[0]) throw new Error('Bordereau introuvable ou déjà versé/annulé');
  return rows[0];
}

/**
 * Génère l'écriture comptable pour un bordereau :
 *   - débit  648 (charge non-CNSS)        : montant_dt
 *   - crédit 5310 (Caisse TND) espèces    : montant_net_dt
 *   - crédit 4321 (IRPP à payer)          : montant_irpp_dt (si > 0)
 * Journal cible : type 'caisse' (fallback 'od').
 */
export async function genererEcritureComptable(id) {
  return withTransaction(async (client) => {
    const bordRes = await client.query(
      `SELECT b.*, e.nom, e.prenom
         FROM ${TABLE} b
         LEFT JOIN employes e ON e.id_employe = b.id_employe
        WHERE b.${PK} = $1 FOR UPDATE`,
      [id]
    );
    const b = bordRes.rows[0];
    if (!b) throw new Error('Bordereau introuvable');
    if (b.id_ecriture_comptable) {
      throw new Error(`Écriture déjà générée (id=${b.id_ecriture_comptable})`);
    }
    if (b.statut === 'annule') throw new Error('Bordereau annulé');

    // Sélection journal : caisse en priorité (versement espèces), sinon OD.
    const jRes = await client.query(
      `SELECT id_journal, code FROM journaux_comptables
        WHERE actif = TRUE
          AND type_journal IN ('caisse','od')
        ORDER BY CASE type_journal WHEN 'caisse' THEN 1 ELSE 2 END
        LIMIT 1`
    );
    if (!jRes.rows[0]) throw new Error('Aucun journal comptable actif (caisse|od)');
    const id_journal = jRes.rows[0].id_journal;

    const dateEcr = b.date_versement || new Date().toISOString().slice(0, 10);
    const annee = new Date(dateEcr).getFullYear();

    // Numéro pièce : PRM-{YYYY}-{seq:5} scoped par journal.
    const nRes = await client.query(
      `SELECT COUNT(*)::int AS nb FROM ecritures
        WHERE id_journal = $1 AND numero_piece LIKE $2`,
      [id_journal, `PRM-${annee}-%`]
    );
    const numero_piece = `PRM-${annee}-${String(nRes.rows[0].nb + 1).padStart(5, '0')}`;

    const libelle = `Prime rendement hors bulletin ${b.numero_bordereau} — ${b.prenom || ''} ${b.nom || ''}`.trim();
    const montantTotal = Number(b.montant_dt);
    const montantIrpp  = Number(b.montant_irpp_dt || 0);
    const montantNet   = Number(b.montant_dt) - montantIrpp;

    const ecrRes = await client.query(
      `INSERT INTO ecritures (id_journal, numero_piece, date_ecriture, libelle,
                              source_type, source_id, montant_total, statut,
                              id_utilisateur_creation)
       VALUES ($1, $2, $3, $4, 'prime_hors_bulletin', $5, $6, 'validee', $7)
       RETURNING *`,
      [id_journal, numero_piece, dateEcr, libelle, b.id_bordereau, montantTotal, null]
    );
    const idEcriture = ecrRes.rows[0].id_ecriture;

    // Ligne 1 : débit 648
    await client.query(
      `INSERT INTO ecritures_lignes (id_ecriture, ordre, numero_compte,
                                     libelle, debit, credit, id_tiers, tiers_type)
       VALUES ($1, 1, $2, $3, $4, 0, $5, 'employe')`,
      [idEcriture, b.compte_comptable || '648', libelle, montantTotal, b.id_employe]
    );
    // Ligne 2 : crédit 5310 (Caisse) pour le net
    await client.query(
      `INSERT INTO ecritures_lignes (id_ecriture, ordre, numero_compte,
                                     libelle, debit, credit, id_tiers, tiers_type)
       VALUES ($1, 2, '5310', $2, 0, $3, $4, 'employe')`,
      [idEcriture, libelle, montantNet, b.id_employe]
    );
    // Ligne 3 : crédit IRPP à payer (si > 0)
    if (montantIrpp > 0) {
      await client.query(
        `INSERT INTO ecritures_lignes (id_ecriture, ordre, numero_compte,
                                       libelle, debit, credit, id_tiers, tiers_type)
         VALUES ($1, 3, '4321', $2, 0, $3, $4, 'employe')`,
        [idEcriture, libelle + ' — IRPP', montantIrpp, b.id_employe]
      );
    }

    const upd = await client.query(
      `UPDATE ${TABLE}
          SET id_ecriture_comptable = $2
        WHERE ${PK} = $1
        RETURNING *`,
      [id, idEcriture]
    );

    return {
      bordereau: upd.rows[0],
      ecriture: ecrRes.rows[0],
      numero_piece,
      id_journal,
    };
  });
}

export async function enregistrerRecuSigne(id, payload, user) {
  const { signature_url, signature_type, photo_remise_url, ip_capture, temoin } = payload || {};
  return withTransaction(async (client) => {
    const b = await client.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`, [id]);
    if (!b.rows[0]) throw new Error('Bordereau introuvable');
    const { rows } = await client.query(
      `INSERT INTO primes_recus_signes
         (id_bordereau, signature_url, signature_type,
          photo_remise_url, ip_capture, remis_par, temoin)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id_bordereau) DO UPDATE SET
         signature_url    = EXCLUDED.signature_url,
         signature_type   = EXCLUDED.signature_type,
         photo_remise_url = EXCLUDED.photo_remise_url,
         ip_capture       = EXCLUDED.ip_capture,
         remis_par        = EXCLUDED.remis_par,
         temoin           = EXCLUDED.temoin,
         date_signature   = NOW()
       RETURNING *`,
      [
        id,
        signature_url || null,
        signature_type || 'manuscrite_scan',
        photo_remise_url || null,
        ip_capture || null,
        user?.id_user || null,
        temoin || null,
      ]
    );
    return rows[0];
  });
}

export async function findRecuByBordereau(id) {
  const { rows } = await pool.query(
    `SELECT * FROM primes_recus_signes WHERE id_bordereau = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}
