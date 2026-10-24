// service.js — commandes
// Auto-génération OF depuis commande validée (§8.9) et traçabilité ligne → OF
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id)                     { return model.findById(id); }
export async function create(payload, user)          { return model.insert(payload, user); }
export async function update(id, payload, user)      { return model.updateById(id, payload, user); }
export async function remove(id, user)               { return model.deleteById(id, user); }

export async function valider(id, user) {
  const cmd = await model.findById(id);
  if (!cmd) throw new Error('Commande introuvable');
  if (cmd.statut !== 'brouillon') throw new Error(`Commande non brouillon (statut=${cmd.statut})`);
  return model.updateById(id, {
    statut: 'validee',
    date_validation: new Date(),
    id_utilisateur_validation: user?.id
  });
}

/**
 * Génère automatiquement les OF pour chaque ligne d'article de la commande.
 * Retourne les liens créés (id_ligne_commande → id_of).
 * (Squelette : la création réelle d'OF est déléguée au service production.)
 */
export async function genererOFs(id, opts = {}, user) {
  const cmd = await model.findById(id);
  if (!cmd) throw new Error('Commande introuvable');
  if (cmd.statut === 'brouillon') throw new Error('Commande à valider avant génération OF');
  if (cmd.ofs_generes && !opts.force) throw new Error('OF déjà générés (force=true pour regénérer)');

  const lignes = await model.getLignes(id);
  const liens  = await model.creerOFsPourLignes(cmd, lignes, user);
  await model.marquerOFsGeneres(id);
  return { commande: id, of_crees: liens.length, liens };
}

export async function listOfLiens(id) {
  return model.getOfLiens(id);
}
