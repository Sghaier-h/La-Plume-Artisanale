import bcrypt from 'bcrypt';
import * as M from './model.js';

const BCRYPT_COST = 12;

// Validation politique de mot de passe §2bis.2
export function validatePassword(pwd, ctx = {}) {
  if (!pwd || pwd.length < 12) return 'Minimum 12 caractères';
  const cats = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter(re => re.test(pwd)).length;
  if (cats < 3) return 'Au moins 3 catégories parmi minuscule/majuscule/chiffre/symbole';
  const forbidden = [ctx.email, ctx.nom, ctx.prenom, ctx.username].filter(Boolean).map(s => String(s).toLowerCase());
  const lower = pwd.toLowerCase();
  if (forbidden.some(f => f && lower.includes(f))) return 'Ne doit pas contenir email/nom/prénom/username';
  return null;
}

export async function list(params) { return M.list(params); }
export async function get(id)      { return M.findById(id); }

export async function create(input, creePar) {
  const err = validatePassword(input.password, input);
  if (err) { const e = new Error(err); e.code = 'weak_password'; e.status = 400; throw e; }
  const hash = await bcrypt.hash(input.password, BCRYPT_COST);
  const id = await M.create({ ...input, mot_de_passe_hash: hash, cree_par: creePar });
  return M.findById(id);
}

export async function update(id, input) {
  const out = await M.update(id, input);
  return { ...out, user: await M.findById(id) };
}

export async function deactivate(id) { return M.remove(id); }
export const listRoles       = () => M.listRoles();
export const listPermissions = () => M.listPermissions();
