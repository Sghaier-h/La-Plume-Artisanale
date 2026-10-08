import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'inventaires',
  pk: 'id_inventaire',
  columns: [
    'numero_inventaire','id_entrepot','mode',
    'date_debut','date_fin','statut',
    'responsable_id_utilisateur','notes',
  ],
  searchColumns: ['numero_inventaire','notes'],
  orderBy: 'date_debut DESC NULLS LAST, id_inventaire DESC',
});

export const model = {
  ...crud.model,

  async listLignes(idInventaire) {
    const { rows } = await getPool().query(
      `SELECT * FROM inventaire_lignes WHERE id_inventaire = $1 ORDER BY id_ligne ASC`,
      [idInventaire],
    );
    return rows;
  },

  async addLigne(idInventaire, ligne, userId) {
    const cols = [
      'id_inventaire','id_article','id_emplacement','id_lot',
      'quantite_theorique','quantite_comptee','note','compte_par','date_comptage',
    ];
    const vals = cols.map((c, i) => `$${i + 1}`);
    const params = [
      idInventaire,
      ligne.id_article,
      ligne.id_emplacement ?? null,
      ligne.id_lot ?? null,
      ligne.quantite_theorique ?? 0,
      ligne.quantite_comptee ?? 0,
      ligne.note ?? null,
      ligne.compte_par ?? userId ?? null,
      ligne.date_comptage ?? new Date(),
    ];
    const { rows } = await getPool().query(
      `INSERT INTO inventaire_lignes (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`,
      params,
    );
    return rows[0];
  },
};

export const baseRoutes = crud.routes;
export const baseService = crud.service;
export const baseController = crud.controller;
