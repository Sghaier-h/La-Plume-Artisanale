import * as S from './service.js';
import { ok, fail, asyncHandler } from '../_shared/response.js';

const meta = (req) => ({ ip: req.ip, userAgent: req.headers['user-agent'] });

export const login = asyncHandler(async (req, res) => {
  const { email, password, type_appareil } = req.body || {};
  if (!email || !password) return fail(res, 400, 'bad_request', 'email et password requis');
  try {
    const out = await S.login({ email, password, ...meta(req), typeAppareil: type_appareil });
    return ok(res, out);
  } catch (e) { return fail(res, e.status || 401, e.code || 'invalid_credentials', e.message); }
});

export const verify2FA = asyncHandler(async (req, res) => {
  const { session_pre_2fa, code_totp, type_appareil } = req.body || {};
  try {
    const out = await S.verify2FA({ session_pre_2fa, code_totp, ...meta(req), typeAppareil: type_appareil });
    return ok(res, out);
  } catch (e) { return fail(res, e.status || 401, e.code || 'invalid_totp', e.message); }
});

export const refresh = asyncHandler(async (req, res) => {
  const { refresh_token, id_session } = req.body || {};
  if (!refresh_token || !id_session) return fail(res, 400, 'bad_request', 'refresh_token et id_session requis');
  try {
    const out = await S.refresh({ refresh_token, id_session, ...meta(req) });
    return ok(res, out);
  } catch (e) { return fail(res, e.status || 401, e.code || 'invalid_token', e.message); }
});

export const logout = asyncHandler(async (req, res) => {
  const out = await S.logout({ id_session: req.user.id_session, id_user: req.user.id_user });
  return ok(res, out);
});

export const sessions = asyncHandler(async (req, res) => {
  const list = await S.listSessions(req.user.id_user);
  return ok(res, list);
});
