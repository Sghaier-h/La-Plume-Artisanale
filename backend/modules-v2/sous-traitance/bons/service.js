import * as model from './model.js';

export const list   = (o) => model.list(o);
export const detail = (id) => model.findById(id);
export const stats  = () => model.stats();

/** Enregistre une signature tactile SVG (sortie, récepteur ou retour). */
export async function signer(id, { role, svg, user_id }) {
  if (!svg) throw Object.assign(new Error('svg requis'), { status: 400 });
  const field = role === 'retour'  ? 'signature_retour_svg'
              : role === 'recepteur' ? 'signature_recepteur_svg'
              : 'signature_sortie_svg';
  const patch = { [field]: svg };
  if (role === 'retour')  { patch.controle_par = user_id ?? null; }
  else                    { patch.id_utilisateur_expedition = user_id ?? null; }
  return model.updateSignature(id, patch);
}

export async function enregistrerControle(id, body, { user_id } = {}) {
  return model.enregistrerControle(id, {
    quantite_retournee: body.quantite_retournee,
    quantite_rejetee:   body.quantite_rejetee,
    motif_rejet:        body.motif_rejet,
    controle_qualite:   body.controle_qualite,          // JSON { defauts_couture, defauts_teinture, defauts_dimension, autre, photo_url }
    signature_retour_svg: body.signature_retour_svg,
    controle_par:       user_id ?? null
  });
}
