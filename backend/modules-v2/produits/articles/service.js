import { baseService, model } from './model.js';

/**
 * Génère la référence composée d'un article catalogue (§5.5 domain.md) :
 *   {MODELE}{DIM4}-{LETTRE}{CODE_COULEUR}-{SUFFIXE_NUANCE}[-{CODES_ADD}]
 *
 * Exemples :
 *   AR + 1020 + B + 02 + -03            → AR1020-B02-03
 *   EPU + 0919                          → EPU0919-19 (uni, lettre U absente)
 *   BA + 1020 + C + 15 + -01 + -25      → BA1020-C15-01-25
 */
export function genererReferenceCommerciale(ctx, payload) {
  const modele = ctx.code_modele || '';
  const dim = ctx.code_dim || '';
  const lettre = ctx.lettre_absent ? '' : (ctx.lettre_nb || '');
  const codeCouleur = payload.code_couleur_base || '';
  const suffixeNuance = payload.suffixe_nuance || '';
  const codesAdd = (payload.codes_couleurs_add || '')
    .split('-').filter(Boolean).map((c) => c.trim());

  let ref = `${modele}${dim}`;
  const chunkCouleur = `${lettre}${codeCouleur}`;
  if (chunkCouleur) ref += `-${chunkCouleur}`;
  if (suffixeNuance) ref += `-${suffixeNuance}`;
  for (const add of codesAdd) ref += `-${add}`;
  return ref;
}

/**
 * ref_fabrication = idem ref_commerciale mais lettre séparée par tiret
 * (§5.5 tableau : `AR1020-B02-03` → `AR1020-B-02-03`).
 */
export function genererReferenceFabrication(ctx, payload) {
  const modele = ctx.code_modele || '';
  const dim = ctx.code_dim || '';
  const lettre = ctx.lettre_absent ? '' : (ctx.lettre_nb || '');
  const codeCouleur = payload.code_couleur_base || '';
  const suffixeNuance = payload.suffixe_nuance || '';
  const codesAdd = (payload.codes_couleurs_add || '')
    .split('-').filter(Boolean).map((c) => c.trim());

  let ref = `${modele}${dim}`;
  if (lettre) ref += `-${lettre}`;
  if (codeCouleur) ref += `-${codeCouleur}`;
  if (suffixeNuance) ref += `-${suffixeNuance}`;
  for (const add of codesAdd) ref += `-${add}`;
  return ref;
}

/**
 * Génère code_article technique : timestamp + hash court des attributs.
 */
export function genererCodeArticle(refCommerciale) {
  return `ART-${refCommerciale}-${Date.now().toString(36).toUpperCase()}`;
}

export const service = {
  ...baseService,

  async create(payload, userId) {
    const ctx = await model.loadRefContext(payload);
    const refCom = payload.ref_commerciale || genererReferenceCommerciale(ctx, payload);
    const refFab = payload.ref_fabrication || genererReferenceFabrication(ctx, payload);
    const codeArt = payload.code_article || genererCodeArticle(refCom);
    return baseService.create({
      ...payload,
      ref_commerciale: refCom,
      ref_fabrication: refFab,
      code_article: codeArt,
    }, userId);
  },
};

export default service;
