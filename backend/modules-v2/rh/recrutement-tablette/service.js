// service.js — rh/recrutement-tablette
import * as model from './model.js';

export async function questionsActives(poste) { return model.questionsActives(poste); }

export async function postuler(body, req) {
  // Validation minimale
  if (!body || typeof body !== 'object') throw new Error('Payload requis');
  const { identite = {}, parcours = {}, questionnaire_reponses = [],
          test_logique_reponses = [], attentes_salariales,
          signature_svg, photo_cv_url, poste_cible, duree_minutes } = body;

  if (!identite?.nom && !identite?.prenom) {
    const err = new Error('Nom ou prénom requis');
    err.code = 'BAD_REQUEST';
    throw err;
  }

  return model.createCandidature({
    identite,
    parcours,
    poste_cible,
    reponses: questionnaire_reponses,
    test_logique: test_logique_reponses,
    attentes_salariales,
    signature_svg,
    photo_cv_url,
    duree_minutes,
    ip_source: req?.ip || req?.connection?.remoteAddress || null,
    user_agent: (req?.headers?.['user-agent'] || '').slice(0, 500),
  });
}

export async function listCandidatures(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.listCandidatures({ limit: +limit, offset: +offset, filters });
}

export async function getCandidatureDetail(id) {
  return model.getCandidatureDetail(id);
}
