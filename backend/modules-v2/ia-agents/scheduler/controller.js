// controller.js — IA scheduler
import * as service from './service.js';

const ok    = (res, data)          => res.json({ success: true, data, error: null });
const fail  = (res, err, code=500) => res.status(code).json({ success: false, data: null, error: { message: err?.message || String(err), code: err?.code || 'ERR' }});

export async function status(req, res)  { try { ok(res, await service.status()); }  catch (e) { fail(res, e); } }
export async function start(req, res)   { try { ok(res, await service.start()); }   catch (e) { fail(res, e); } }
export async function stop(req, res)    { try { ok(res, await service.stop()); }    catch (e) { fail(res, e); } }
export async function reload(req, res)  { try { ok(res, await service.reload()); }  catch (e) { fail(res, e); } }
export async function trigger(req, res) {
  try   { ok(res, await service.triggerManual(req.params.idAgent, req.user)); }
  catch (e) { fail(res, e, 400); }
}
