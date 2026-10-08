import * as M from './model.js';

export const list         = ()                => M.listConfigs();
export const get          = (entite)          => M.getConfig(entite);
export const update       = (entite, patch)   => M.updateConfig(entite, patch);
export const next         = (entite, ctx)     => M.next(entite, ctx);
export const preview      = (entite, ctx)     => M.preview(entite, ctx);
