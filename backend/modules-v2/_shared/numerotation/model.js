import { getPool, withTransaction } from '../db.js';

// Format tokens acceptés dans une config : {YYYY} {YY} {MM} {YYYYMM} {SEQ:N} {SOCIETE} {TYPE}
export function render(format, ctx) {
  const now = ctx.now || new Date();
  const y  = now.getUTCFullYear();
  const yy = String(y).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return format
    .replace(/\{YYYYMM\}/g, `${y}${mm}`)
    .replace(/\{YYYY\}/g,   String(y))
    .replace(/\{YY\}/g,     yy)
    .replace(/\{MM\}/g,     mm)
    .replace(/\{SOCIETE\}/g, ctx.societe || '')
    .replace(/\{TYPE\}/g,   ctx.type    || '')
    .replace(/\{SEQ:(\d+)\}/g, (_, n) => String(ctx.seq).padStart(parseInt(n, 10), '0'));
}

function currentPeriod(reset_period, now = new Date()) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  if (reset_period === 'annuel')  return String(y);
  if (reset_period === 'mensuel') return `${y}-${m}`;
  return 'never';
}

export async function listConfigs() {
  const { rows } = await getPool().query(
    `SELECT * FROM config_numerotation ORDER BY entite`);
  return rows;
}

export async function getConfig(entite) {
  const { rows } = await getPool().query(
    `SELECT * FROM config_numerotation WHERE entite = $1`, [entite]);
  return rows[0] || null;
}

export async function updateConfig(entite, patch) {
  const cols = ['format','reset_period','verrouille','sequence_courante'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(entite);
  await getPool().query(
    `UPDATE config_numerotation SET ${set.join(', ')}, date_modification = NOW()
      WHERE entite = $${p.length}`, p);
  return { updated: 1 };
}

// Génère et incrémente atomiquement (SELECT ... FOR UPDATE).
export async function next(entite, ctx = {}) {
  return withTransaction(async (client) => {
    const q = await client.query(
      `SELECT * FROM config_numerotation WHERE entite = $1 FOR UPDATE`, [entite]);
    if (q.rowCount === 0) {
      const e = new Error(`Config numérotation absente pour ${entite}`);
      e.status = 400; e.code = 'no_numerotation'; throw e;
    }
    const cfg = q.rows[0];
    const period = currentPeriod(cfg.reset_period);
    let seq = cfg.sequence_courante || 0;
    if (cfg.derniere_periode !== period) seq = 0;
    seq += 1;
    const code = render(cfg.format, { seq, ...ctx });
    await client.query(
      `UPDATE config_numerotation
          SET sequence_courante = $1, derniere_periode = $2, date_modification = NOW()
        WHERE entite = $3`, [seq, period, entite]);
    return { code, seq, format: cfg.format, entite };
  });
}

// Aperçu (sans incrémenter)
export async function preview(entite, ctx = {}) {
  const cfg = await getConfig(entite);
  if (!cfg) return null;
  const period = currentPeriod(cfg.reset_period);
  let seq = cfg.sequence_courante || 0;
  if (cfg.derniere_periode !== period) seq = 0;
  seq += 1;
  return { code: render(cfg.format, { seq, ...ctx }), seq_previewed: seq };
}
