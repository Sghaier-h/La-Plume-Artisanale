// model.js — publicite/campagnes
// Tables : campagnes_pub + creatives_pub (§11quinquies.9)
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'campagnes_pub',
  pk: 'id_campagne',
  columns: [
    'id_compte_pub','campagne_id_externe','nom','objectif','canal_cible',
    'budget_total','budget_quotidien','devise','date_debut','date_fin',
    'ciblage_json','statut','id_utilisateur_gestion',
  ],
  searchColumns: ['nom','campagne_id_externe'],
  orderBy: 'date_debut DESC',
});

const creativesColumns = [
  'id_campagne','type_creative','titre','description','call_to_action',
  'url_destination','fichier_url','fichier_thumbnail_url','format_ratio',
  'duree_secondes','langue','utm_params','statut',
];

export const model = {
  ...crud.model,

  /** Toutes les créatives d'une campagne. */
  async listCreatives(idCampagne) {
    const { rows } = await getPool().query(
      'SELECT * FROM creatives_pub WHERE id_campagne = $1 ORDER BY id_creative ASC',
      [idCampagne],
    );
    return rows;
  },

  async getCreative(id) {
    const { rows } = await getPool().query(
      'SELECT * FROM creatives_pub WHERE id_creative = $1 LIMIT 1', [id],
    );
    return rows[0] || null;
  },

  async createCreative(payload) {
    const cols = []; const vals = []; const params = []; let i = 1;
    for (const c of creativesColumns) {
      if (payload[c] !== undefined) { cols.push(c); vals.push(`$${i++}`); params.push(payload[c]); }
    }
    const sql = `INSERT INTO creatives_pub (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
    const { rows } = await getPool().query(sql, params);
    return rows[0];
  },

  async updateCreative(id, payload) {
    const sets = []; const params = []; let i = 1;
    for (const c of creativesColumns) {
      if (payload[c] !== undefined) { sets.push(`${c} = $${i++}`); params.push(payload[c]); }
    }
    if (!sets.length) return this.getCreative(id);
    params.push(id);
    const sql = `UPDATE creatives_pub SET ${sets.join(', ')} WHERE id_creative = $${i} RETURNING *`;
    const { rows } = await getPool().query(sql, params);
    return rows[0] || null;
  },

  async deleteCreative(id) {
    const { rows } = await getPool().query(
      'DELETE FROM creatives_pub WHERE id_creative = $1 RETURNING id_creative', [id],
    );
    return rows[0] || null;
  },

  async setStatut(id, statut) {
    const { rows } = await getPool().query(
      'UPDATE campagnes_pub SET statut = $1, date_modification = NOW() WHERE id_campagne = $2 RETURNING *',
      [statut, id],
    );
    return rows[0] || null;
  },
};

export const baseService    = crud.service;
export const baseController = crud.controller;
