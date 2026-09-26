import { getPool } from '../../_shared/db.js';

export async function list({ id_client, limit = 100, offset = 0 }) {
  const wh = ['1=1']; const p = [];
  if (id_client) { p.push(id_client); wh.push(`a.id_client = $${p.length}`); }
  const where = `WHERE ${wh.join(' AND ')}`;
  p.push(limit); p.push(offset);
  const { rows } = await getPool().query(
    `SELECT a.*, co.raison_sociale AS compte_raison_sociale, co.code_client
       FROM adresses_client a
       LEFT JOIN comptes co ON co.id_client = a.id_client
      ${where}
      ORDER BY a.id_adresse
      LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  const cnt = await getPool().query(
    `SELECT COUNT(*)::int AS n FROM adresses_client a ${where}`,
    p.slice(0, p.length - 2));
  return { rows, total: cnt.rows[0].n };
}

export async function findById(id) {
  const { rows } = await getPool().query(`SELECT * FROM adresses_client WHERE id_adresse = $1`, [id]);
  return rows[0] || null;
}

export async function create(a) {
  // Règles : 1 seul défaut facturation + 1 seul défaut livraison par compte
  if (a.est_defaut_facturation) {
    await getPool().query(
      `UPDATE adresses_client SET est_defaut_facturation = FALSE WHERE id_client = $1`, [a.id_client]);
  }
  if (a.est_defaut_livraison) {
    await getPool().query(
      `UPDATE adresses_client SET est_defaut_livraison = FALSE WHERE id_client = $1`, [a.id_client]);
  }
  const { rows } = await getPool().query(
    `INSERT INTO adresses_client (id_client,libelle,type_facturation,type_livraison,type_siege,
       rue,complement,code_postal,ville,region,pays,contact_livraison_nom,contact_livraison_telephone,
       est_defaut_facturation,est_defaut_livraison)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id_adresse`,
    [a.id_client, a.libelle || null,
     !!a.type_facturation, !!a.type_livraison, !!a.type_siege,
     a.rue || null, a.complement || null, a.code_postal || null,
     a.ville || null, a.region || null, a.pays || 'TN',
     a.contact_livraison_nom || null, a.contact_livraison_telephone || null,
     !!a.est_defaut_facturation, !!a.est_defaut_livraison]);
  return rows[0].id_adresse;
}

export async function update(id, patch) {
  const current = await findById(id);
  if (!current) return { updated: 0 };
  if (patch.est_defaut_facturation === true && !current.est_defaut_facturation) {
    await getPool().query(
      `UPDATE adresses_client SET est_defaut_facturation = FALSE
        WHERE id_client = $1 AND id_adresse <> $2`, [current.id_client, id]);
  }
  if (patch.est_defaut_livraison === true && !current.est_defaut_livraison) {
    await getPool().query(
      `UPDATE adresses_client SET est_defaut_livraison = FALSE
        WHERE id_client = $1 AND id_adresse <> $2`, [current.id_client, id]);
  }
  const cols = ['libelle','type_facturation','type_livraison','type_siege','rue','complement',
                'code_postal','ville','region','pays','contact_livraison_nom','contact_livraison_telephone',
                'est_defaut_facturation','est_defaut_livraison'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(
    `UPDATE adresses_client SET ${set.join(', ')}, updated_at = NOW() WHERE id_adresse = $${p.length}`, p);
  return { updated: 1 };
}

export async function remove(id) {
  await getPool().query(`DELETE FROM adresses_client WHERE id_adresse = $1`, [id]);
  return { deleted: 1 };
}
