import * as model from './model.js';

export const list = (o) => model.listPostesFinition(o);
export const detail = (id) => model.findPoste(id);

export const demarrer = (id, id_operateur) => model.updatePoste(id, {
  statut: 'en_cours',
  date_debut_reel: new Date(),
  id_operateur: id_operateur ?? null
});

export const terminer = (id, { quantite_produite, quantite_rebut, commentaire }) => model.updatePoste(id, {
  statut: 'termine',
  date_fin_reel: new Date(),
  quantite_produite,
  quantite_rebut,
  commentaire: commentaire ?? null
});
