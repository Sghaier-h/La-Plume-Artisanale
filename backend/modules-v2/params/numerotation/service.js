/**
 * NumeroSequenceService (§16bis.3)
 *
 * Concurrent-safe : `SELECT ... FOR UPDATE` dans une transaction pgSQL.
 *  - reset automatique annuel / mensuel selon `reset_sequence`
 *  - audit dans `audit_numerotation`
 *  - template : {prefixe}{AAAA}{MM}{sep}{seq:N} — la clé `seq:N` fait le zero-padding
 */
import { getPool, withTransaction } from '../../_shared/db.js';
import * as M from './model.js';

const PAD = (n, width) => String(n).padStart(width, '0');

/**
 * Rendu template.
 * Substitue : {prefixe} {suffixe} {AAAA} {AA} {MM} {sep} {seq:N} et clés dynamiques extra.
 */
export function renderTemplate(cfg, sequence, extra = {}) {
  const now = extra.date ? new Date(extra.date) : new Date();
  const AAAA = String(now.getFullYear());
  const AA   = AAAA.slice(-2);
  const MM   = PAD(now.getMonth() + 1, 2);
  let tpl = cfg.template && cfg.template.trim()
    ? cfg.template
    : `${cfg.prefixe || ''}${cfg.format_annee === 'AAAA' ? '{AAAA}' : cfg.format_annee === 'AA' ? '{AA}' : ''}${cfg.format_mois === 'MM' ? '{MM}' : ''}${cfg.separateur || ''}{seq:${cfg.longueur_sequence}}${cfg.suffixe || ''}`;

  const dict = {
    prefixe: cfg.prefixe || '',
    suffixe: cfg.suffixe || '',
    sep:     cfg.separateur || '',
    AAAA, AA, MM,
    ...extra,
  };
  // {seq:N}
  tpl = tpl.replace(/\{seq:(\d+)\}/g, (_, n) => PAD(sequence, Number(n)));
  // {ordre:N} pour COL
  tpl = tpl.replace(/\{ordre:(\d+)\}/g, (_, n) => PAD(extra.ordre || 0, Number(n)));
  // Autres clés
  tpl = tpl.replace(/\{(\w+)\}/g, (_, k) => (dict[k] !== undefined ? String(dict[k]) : ''));
  return tpl;
}

function needsReset(cfg, now = new Date()) {
  if (cfg.reset_sequence === 'annuel')  return cfg.annee_reset !== now.getFullYear();
  if (cfg.reset_sequence === 'mensuel') return cfg.annee_reset !== now.getFullYear() || cfg.mois_reset !== (now.getMonth() + 1);
  return false;
}

/**
 * Émet le prochain numéro (transactionnel).
 * @returns {Promise<{numero, sequence}>}
 */
export async function next({ id_societe = 1, code_document, contexte, id_user, extra } = {}) {
  if (!code_document) { const e = new Error('code_document requis'); e.status = 400; e.code = 'bad_request'; throw e; }
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM parametres_numerotation
        WHERE id_societe = $1 AND code_document = $2 FOR UPDATE`,
      [id_societe, code_document]);
    if (!rows[0]) { const e = new Error(`Numérotation ${code_document} introuvable`); e.status = 404; e.code = 'not_found'; throw e; }
    const cfg = rows[0];
    const now = new Date();
    let ancienneSeq = Number(cfg.sequence_courante || 0);
    let nouvelleSeq = ancienneSeq + 1;
    let resetFlag = false;
    if (needsReset(cfg, now)) {
      nouvelleSeq = 1;
      resetFlag = true;
    }
    await client.query(
      `UPDATE parametres_numerotation
          SET sequence_courante = $1,
              annee_reset       = $2,
              mois_reset        = $3,
              updated_at        = NOW()
        WHERE id_num = $4`,
      [nouvelleSeq, now.getFullYear(), now.getMonth() + 1, cfg.id_num]);
    const numero = renderTemplate(cfg, nouvelleSeq, extra || {});
    // Audit hors verrou métier
    await client.query(
      `INSERT INTO audit_numerotation (id_num, ancienne_seq, nouvelle_seq, numero_emis, contexte, id_user, reset_effectue)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [cfg.id_num, ancienneSeq, nouvelleSeq, numero, contexte || null, id_user || null, resetFlag]);
    return { numero, sequence: nouvelleSeq, reset_effectue: resetFlag };
  });
}

/** Simule sans consommer la séquence. */
export function preview(cfg, extra = {}) {
  const next = Number(cfg.sequence_courante || 0) + 1;
  return renderTemplate(cfg, next, extra);
}

export async function listByCompany(idSoc) { return M.listByCompany(idSoc); }
export async function get(idSoc, code)     { return M.findByCode(idSoc, code); }

export async function update(idSoc, code, patch, userId) {
  // Refuser modif préfixe si verrouille et sequence_courante > 0 (§16bis.4)
  const current = await M.findByCode(idSoc, code);
  if (!current) { const e = new Error('Introuvable'); e.status = 404; e.code = 'not_found'; throw e; }
  if (current.verrouille && (patch.prefixe && patch.prefixe !== current.prefixe)) {
    const e = new Error('Numérotation verrouillée : préfixe non modifiable'); e.status = 409; e.code = 'locked'; throw e;
  }
  return M.updateConfig(idSoc, code, { ...patch, updated_by: userId });
}

export async function reset(idSoc, code, userId) {
  await M.resetSequence(idSoc, code, userId);
  return { reset: true };
}

export async function previewApi(idSoc, code, extra) {
  const cfg = await M.findByCode(idSoc, code);
  if (!cfg) { const e = new Error('Introuvable'); e.status = 404; e.code = 'not_found'; throw e; }
  return { apercu: preview(cfg, extra || {}), prochaine_sequence: Number(cfg.sequence_courante || 0) + 1 };
}
