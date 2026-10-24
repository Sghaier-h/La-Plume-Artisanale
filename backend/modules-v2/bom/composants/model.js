import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'bom_composants',
  pk: 'id_ligne_bom',
  columns: [
    'id_bom','id_article_composant','ordre',
    'code_composant','libelle_composant','role','numero_selecteur','id_etape_gamme',
    'largeur_cm','longueur_cm','hauteur_cm','laize_cm',
    'id_numero_metrique','numero_metrique_valeur','id_composition','id_torsion',
    'grammage_g_m2','id_couleur','code_couleur','code_hex',
    'quantite','unite',
    'quantite_s01','quantite_s02','quantite_s03','quantite_s04',
    'quantite_s05','quantite_s06','quantite_s07','quantite_s08',
    'nb_fils_chaine','metres_chaine','poids_ourdissage_kg',
    'nb_duites','metres_trame','poids_trame_kg',
    'poids_theorique_kg','poids_reel_kg','perte_pct',
    'prix_unitaire','cout_ligne','devise',
    'remplacements_possibles','obligatoire','notes',
  ],
  searchColumns: ['code_composant','libelle_composant'],
  orderBy: 'id_bom ASC, ordre ASC',
});
export const model = crud.model;
export const baseRoutes = crud.routes;
export const baseService = crud.service;
export const baseController = crud.controller;
