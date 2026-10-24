import { getPool } from '../../_shared/db.js';
export * as numerotation from '../../_shared/numerotation/service.js';

const TABLES = {
  'sources-leads':      { table: 'crm_sources_leads',      id: 'id_source',    unique: 'code' },
  'motifs-perte':       { table: 'crm_motifs_perte',       id: 'id_motif',     unique: 'code' },
  'categories-clients': { table: 'crm_categories_clients', id: 'id_categorie', unique: 'code' },
  'devises':            { table: 'crm_config_devises',     id: 'code',         unique: 'code' },
};

function resolve(kind) {
  const cfg = TABLES[kind];
  if (!cfg) { const e = new Error('kind inconnu'); e.status = 400; e.code = 'invalid_input'; throw e; }
  return cfg;
}

export async function list(kind, { actif } = {}) {
  const { table, id } = resolve(kind);
  const wh = ['1=1']; const p = [];
  if (actif !== undefined) { p.push(actif); wh.push(`actif = $${p.length}`); }
  const { rows } = await getPool().query(
    `SELECT * FROM ${table} WHERE ${wh.join(' AND ')} ORDER BY ordre, ${id}`, p);
  return rows;
}

export async function upsert(kind, item) {
  const { table, id } = resolve(kind);
  // devises n'a pas de colonne "libelle/couleur" identique — cols variables
  const cols = ['libelle','actif','ordre'];
  if (kind === 'categories-clients') cols.push('couleur');
  if (kind === 'devises') { cols.push('symbole','arrondi','taux_change_vs_tnd','date_taux'); }
  if (kind !== 'devises') cols.push('code');   // devises : code = clé primaire

  if (item[id]) {
    const set = [], p = [];
    for (const c of cols) if (item[c] !== undefined) { p.push(item[c]); set.push(`${c} = $${p.length}`); }
    if (!set.length) return { updated: 0 };
    p.push(item[id]);
    await getPool().query(`UPDATE ${table} SET ${set.join(', ')} WHERE ${id} = $${p.length}`, p);
    return { updated: 1, id: item[id] };
  }
  const insertCols = kind === 'devises'
    ? ['code','libelle','symbole','arrondi','taux_change_vs_tnd','actif','ordre']
    : (kind === 'categories-clients'
        ? ['code','libelle','couleur','actif','ordre']
        : ['code','libelle','actif','ordre']);
  const vals = insertCols.map((c) => item[c] === undefined
    ? (c === 'actif' ? true : (c === 'ordre' || c === 'arrondi' ? 0 : (c === 'taux_change_vs_tnd' ? 1 : null)))
    : item[c]);
  const params = vals.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = await getPool().query(
    `INSERT INTO ${table} (${insertCols.join(',')}) VALUES (${params})
     ON CONFLICT (code) DO UPDATE SET libelle=EXCLUDED.libelle, actif=EXCLUDED.actif, ordre=EXCLUDED.ordre
     RETURNING ${id}`, vals);
  return { created: 1, id: rows[0][id] };
}

export async function remove(kind, id) {
  const { table, id: pk } = resolve(kind);
  await getPool().query(`DELETE FROM ${table} WHERE ${pk} = $1`, [id]);
  return { deleted: 1 };
}
