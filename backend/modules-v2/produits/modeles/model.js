import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'modeles',
  pk: 'id_modele',
  columns: [
    'code_modele','libelle','description','image_url_principale',
    'id_famille','type_produit',
    'format_ref_commerciale','format_ref_fabrication','actif',
  ],
  searchColumns: ['code_modele','libelle'],
  orderBy: 'code_modele ASC',
});

export const model = {
  ...crud.model,
  /**
   * Liste des variantes (articles catalogue) d'un modèle.
   */
  async listVariantes(idModele) {
    const { rows } = await getPool().query(
      `SELECT id_article, code_article, ref_commerciale, ref_fabrication,
              designation, image_url_principale, qualite, actif
         FROM articles_catalogue
        WHERE id_modele = $1
        ORDER BY ref_commerciale`,
      [idModele],
    );
    return rows;
  },
};

export const baseRoutes = crud.routes;
export const baseService = crud.service;
export const baseController = crud.controller;
