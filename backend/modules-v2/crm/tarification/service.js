import * as M from './model.js';

export const listTarifs   = (params) => M.listTarifs(params);
export const getTarif     = async (id) => {
  const t = await M.findTarif(id);
  if (!t) return null;
  t.lignes = await M.listLignes(id);
  return t;
};
export const createTarif  = (t, user) => M.createTarif({ ...t, cree_par: user?.id_user });
export const updateTarif  = (id, p)   => M.updateTarif(id, p);
export const deleteTarif  = (id)      => M.deleteTarif(id);

export const upsertLigne  = (id, l)   => M.upsertLigne(id, l);
export const deleteLigne  = (id, il)  => M.deleteLigne(id, il);

export const listRemises  = (params)  => M.listRemises(params);
export const upsertRemise = (r, user) => M.upsertRemise({ ...r, cree_par: user?.id_user });
export const deleteRemise = (id)      => M.deleteRemise(id);

/**
 * Calcul de prix (§4.3) — utilitaire ré-utilisable.
 * order = { id_client, id_article, quantite, prix_base_ht, id_grille? }
 * Retourne { prix_ht, remise_pct, taux_tva, source }.
 */
export async function computePrice({ id_grille, id_article, quantite, prix_base_ht }) {
  if (!id_grille) return { prix_ht: prix_base_ht, remise_pct: 0, taux_tva: 19, source: 'no_grille' };
  const grille = await M.findTarif(id_grille);
  if (!grille) return { prix_ht: prix_base_ht, remise_pct: 0, taux_tva: 19, source: 'grille_manquante' };
  // 1) ligne spécifique ?
  const lignes = await M.listLignes(id_grille);
  const eligible = lignes
    .filter(l => l.id_article === id_article && quantite >= l.quantite_min)
    .sort((a, b) => b.quantite_min - a.quantite_min)[0];
  if (eligible && eligible.prix_unitaire_ht != null) {
    const prix = Number(eligible.prix_unitaire_ht) * (1 - Number(eligible.remise_pct || 0) / 100);
    return { prix_ht: prix, remise_pct: Number(eligible.remise_pct || 0), taux_tva: Number(grille.taux_tva_defaut), source: 'ligne' };
  }
  // 2) remise globale
  const prix = Number(prix_base_ht || 0) * (1 - Number(grille.remise_pct || 0) / 100);
  return { prix_ht: prix, remise_pct: Number(grille.remise_pct || 0), taux_tva: Number(grille.taux_tva_defaut), source: 'grille_globale' };
}
