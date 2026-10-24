/**
 * admin-edit-guard.js — §14quater.8-9
 *
 * Garde-fou pour l'édition par un ADMIN d'un document (devis, commande,
 * facture, avoir, bl) déjà sorti du statut 'brouillon'. Les autres rôles
 * n'ont jamais ce droit : seul le brouillon reste modifiable par eux.
 *
 * Traçabilité intégrale : qui (id_admin), quand (date_edition), pourquoi
 * (raison obligatoire dans req.body.raison_edition_admin), diff JSON
 * avant/après dans historique_editions_admin, IP + user-agent.
 *
 * API :
 *   requireAdmin                → middleware pur
 *   requireAdminForNonDraft     → bloque les non-ADMIN si statut ≠ brouillon
 *   wrapAdminEdit(ctrl, docType) → wrap un controller PUT :
 *                                 1. snapshot "avant"
 *                                 2. appel du controller d'origine
 *                                 3. si succès ET statut ≠ brouillon ET ADMIN,
 *                                    écrit la ligne historique_editions_admin
 */
import { getPool } from './db.js';

const pool = getPool();

/** Normalise le rôle principal → majuscules. */
function roleOf(user) {
  return String(user?.role_principal || user?.role || '').toUpperCase();
}

export function isAdmin(user) {
  const r = roleOf(user);
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') return true;
  const arr = Array.isArray(user?.roles) ? user.roles.map(x => String(x).toUpperCase()) : [];
  return arr.includes('ADMIN') || arr.includes('SUPER_ADMIN');
}

/** Middleware : bloque si l'appelant n'est pas ADMIN. */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Non authentifié' } });
  }
  if (!isAdmin(req.user)) {
    return res.status(403).json({ success: false, error: { code: 'forbidden', message: 'ADMIN requis' } });
  }
  return next();
}

/* ------------------------------------------------------------------ */
/* Mapping docType → table / clé primaire / colonne statut            */
/* ------------------------------------------------------------------ */
const DOC_CONFIG = {
  devis:    { table: 'devis',     pk: 'id_devis',    statut: 'statut' },
  commande: { table: 'commandes', pk: 'id_commande', statut: 'statut' },
  facture:  { table: 'factures',  pk: 'id_facture',  statut: 'statut' },
  avoir:    { table: 'avoirs',    pk: 'id_avoir',    statut: 'statut' },
  bl:       { table: 'bons_livraison', pk: 'id_bl',  statut: 'statut' },
};

/** Normalise un statut texte → 'brouillon' | 'autre'. */
function isBrouillon(statut) {
  const s = String(statut || '').toLowerCase();
  return s === 'brouillon' || s === 'draft' || s === '';
}

async function fetchDocSnapshot(table, pk, id) {
  try {
    const r = await pool.query(`SELECT * FROM ${table} WHERE ${pk} = $1`, [id]);
    return r.rows[0] || null;
  } catch {
    return null;
  }
}

/** Diff JSON basique : clés dont la valeur a changé. */
function diffShallow(before, after) {
  if (!before || !after) return {};
  const diff = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    const b = before[k];
    const a = after[k];
    const bs = typeof b === 'object' && b !== null ? JSON.stringify(b) : String(b ?? '');
    const as_ = typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a ?? '');
    if (bs !== as_) diff[k] = { avant: b, apres: a };
  }
  return diff;
}

async function logEdition({ docType, idDoc, idAdmin, raison, avant, apres, ip, ua }) {
  const diff = diffShallow(avant, apres);
  const resumeKeys = Object.keys(diff).slice(0, 10).join(', ');
  await pool.query(
    `INSERT INTO historique_editions_admin
       (type_doc, id_doc, id_admin, raison, avant_jsonb, apres_jsonb,
        diff_resume, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      docType,
      idDoc,
      idAdmin,
      raison,
      JSON.stringify(avant || {}),
      JSON.stringify(apres || {}),
      resumeKeys || null,
      String(ip || '').slice(0, 64),
      String(ua || '').slice(0, 255),
    ],
  );
}

/**
 * Wrap un controller PUT /:id d'un module ventes v2 pour y greffer la
 * traçabilité §14quater.8-9. L'édition n'est autorisée que si :
 *  - le document est encore 'brouillon' (tous rôles autorisés)
 *  - OU l'utilisateur est ADMIN et fournit une `raison_edition_admin`.
 *
 * Signature :
 *   router.put('/:id', wrapAdminEdit(updateFacture, 'facture'));
 */
export function wrapAdminEdit(controller, docType) {
  const cfg = DOC_CONFIG[docType];
  if (!cfg) throw new Error(`wrapAdminEdit: docType inconnu '${docType}'`);

  return async function wrappedPut(req, res, next) {
    const id = req.params?.id;
    if (!id) return controller(req, res, next);

    const before = await fetchDocSnapshot(cfg.table, cfg.pk, id);
    const wasDraft = isBrouillon(before?.[cfg.statut]);
    const admin = isAdmin(req.user);
    const raison = req.body?.raison_edition_admin || req.headers['x-admin-edit-reason'];

    if (!wasDraft && !admin) {
      return res.status(403).json({
        success: false,
        error: { code: 'edit_forbidden_non_draft', message: `Édition interdite : ${docType} déjà validé (seul un ADMIN peut l'éditer)` },
      });
    }
    if (!wasDraft && admin && !raison) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'reason_required',
          message: `Raison obligatoire pour éditer un ${docType} validé (champ 'raison_edition_admin' ou header 'x-admin-edit-reason').`,
        },
      });
    }

    // Supprime le champ "raison" de req.body avant de passer au controller
    // (évite d'avoir une colonne inconnue dans l'UPDATE dynamique).
    const originalBody = req.body;
    if (req.body && typeof req.body === 'object' && 'raison_edition_admin' in req.body) {
      const { raison_edition_admin, ...rest } = req.body;
      req.body = rest;
    }

    // Interception de la réponse pour détecter le succès et logger.
    let responded = false;
    const origJson = res.json.bind(res);
    const origStatus = res.status.bind(res);
    let statusCode = 200;
    res.status = (c) => { statusCode = c; return origStatus(c); };
    res.json = (payload) => {
      responded = true;
      // Appel immédiat vers le client, log en background (fire-and-forget).
      const result = origJson(payload);
      const success = statusCode < 400 && payload && (payload.success !== false);
      if (success && !wasDraft && admin) {
        fetchDocSnapshot(cfg.table, cfg.pk, id)
          .then((after) => logEdition({
            docType,
            idDoc: Number(id),
            idAdmin: Number(req.user?.id_user || req.user?.id || 0) || 0,
            raison: String(raison),
            avant: before,
            apres: after,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
            ua: req.headers['user-agent'] || '',
          }))
          .catch((e) => console.warn('[admin-edit-guard] log historique_editions_admin KO:', e?.message));
      }
      req.body = originalBody; // restaure (sécurité pour tests)
      return result;
    };

    try {
      await controller(req, res, next);
    } finally {
      if (!responded) req.body = originalBody;
    }
  };
}

export default { requireAdmin, wrapAdminEdit, isAdmin };
