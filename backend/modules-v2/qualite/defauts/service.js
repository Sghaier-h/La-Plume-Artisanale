import * as model from './model.js';

export const listTypes    = (o) => model.listTypes(o);
export const listSignales = (o) => model.listSignales(o);
export const photosDe     = (id) => model.photosDe(id);

export async function signaler(payload, { id_utilisateur } = {}) {
  return model.insertSignale({ ...payload, id_signaleur: payload.id_signaleur ?? id_utilisateur ?? null });
}

export const resoudre = (id) => model.resoudre(id);

export async function ajouterPhoto({ id_defaut_signale, url, mime_type, taille_octets, largeur_px, hauteur_px, id_uploader, ordre }) {
  return model.ajouterPhoto({
    id_defaut_signale, url,
    mime_type: mime_type ?? null,
    taille_octets: taille_octets ?? null,
    largeur_px:  largeur_px  ?? null,
    hauteur_px:  hauteur_px  ?? null,
    id_uploader: id_uploader ?? null,
    ordre: ordre ?? 0
  });
}
