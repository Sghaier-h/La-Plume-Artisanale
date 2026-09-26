import * as model from './model.js';

export const getGantt = (opts) => model.ganttEntre(opts.dateDebut, opts.dateFin, opts.id_machine);

/**
 * Assignation par drag-drop. Contraintes (§7.12) :
 *  - laize machine ≥ laize article
 *  - nb couleurs OF ≤ nb sélecteurs machine
 *  - machine pas en panne
 * (validations légères ici ; validations dures côté DB / trigger à venir)
 */
export async function assignerMachine(id_of, params) {
  // TODO valider laize, couleurs, état machine (module base v2)
  return model.replanifier(id_of, params);
}

export const replanifier = model.replanifier;
