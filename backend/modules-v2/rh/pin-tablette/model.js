// model.js — rh/pin-tablette
// Gestion des codes PIN d'identification tablette.
// Le hash est volontairement simple en démo (stockage direct). En production
// le service doit utiliser bcrypt — on l'y branchera à l'intégration réelle.
import { getPool } from '../../_shared/db.js';
import crypto from 'node:crypto';
const pool = getPool();

const TABLE = 'code_pin_employe';
const MAX_ESSAIS = 3;

function hashPin(pin, salt) {
  // Fallback démo : SHA-256(pin + salt). Interopérable avec seeds (pin_hash = pin, salt='').
  if (!salt) return pin;
  return crypto.createHash('sha256').update(pin + salt).digest('hex');
}

export async function findByEmploye(idEmploye) {
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE} WHERE id_employe = $1 LIMIT 1`,
    [idEmploye]
  );
  return rows[0] || null;
}

export async function listAll({ limit = 500, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT p.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} p
       JOIN employes e ON e.id_employe = p.id_employe
      ORDER BY e.nom, e.prenom
      LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

export async function setPin(idEmploye, pin, user) {
  const longueur = String(pin).length;
  if (longueur < 4 || longueur > 6) throw new Error('PIN doit faire 4 à 6 chiffres');
  if (!/^\d+$/.test(pin)) throw new Error('PIN doit être numérique');

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPin(pin, salt);

  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (
       id_employe, pin_hash, salt, pin_longueur,
       date_derniere_maj, bloque, nb_tentatives_echec, debloque_par
     ) VALUES ($1, $2, $3, $4, NOW(), FALSE, 0, $5)
     ON CONFLICT (id_employe) DO UPDATE SET
       pin_hash = EXCLUDED.pin_hash,
       salt = EXCLUDED.salt,
       pin_longueur = EXCLUDED.pin_longueur,
       bloque = FALSE,
       nb_tentatives_echec = 0,
       date_derniere_maj = NOW(),
       updated_at = NOW()
     RETURNING *`,
    [idEmploye, hash, salt, longueur, user?.id || null]
  );
  return rows[0];
}

/**
 * Vérifie un PIN et renvoie l'employé si ok. Incrémente le compteur
 * d'échecs sinon, bloque après MAX_ESSAIS.
 */
export async function verifier(idEmploye, pin) {
  const row = await findByEmploye(idEmploye);
  if (!row) throw new Error('Aucun PIN défini pour cet employé');
  if (row.bloque) throw new Error('Compte PIN bloqué — contacter l\'admin RH');

  const hash = hashPin(pin, row.salt);
  const ok = row.pin_hash === hash || row.pin_hash === pin; // compat seeds

  if (!ok) {
    const next = row.nb_tentatives_echec + 1;
    const bloquer = next >= MAX_ESSAIS;
    await pool.query(
      `UPDATE ${TABLE}
          SET nb_tentatives_echec = $1,
              bloque = $2,
              date_blocage = CASE WHEN $2 THEN NOW() ELSE date_blocage END,
              updated_at = NOW()
        WHERE id_employe = $3`,
      [next, bloquer, idEmploye]
    );
    throw new Error(`PIN incorrect (${next}/${MAX_ESSAIS}${bloquer ? ' — compte bloqué' : ''})`);
  }

  // Succès → reset compteur
  await pool.query(
    `UPDATE ${TABLE}
        SET nb_tentatives_echec = 0,
            updated_at = NOW()
      WHERE id_employe = $1`,
    [idEmploye]
  );

  const { rows: [emp] } = await pool.query(
    `SELECT id_employe, matricule, nom, prenom
       FROM employes WHERE id_employe = $1`,
    [idEmploye]
  );
  return emp;
}

export async function debloquer(idEmploye, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET bloque = FALSE,
            nb_tentatives_echec = 0,
            debloque_par = $1,
            date_deblocage = NOW(),
            updated_at = NOW()
      WHERE id_employe = $2
      RETURNING *`,
    [user?.id || null, idEmploye]
  );
  if (!rows[0]) throw new Error('PIN introuvable pour cet employé');
  return rows[0];
}
