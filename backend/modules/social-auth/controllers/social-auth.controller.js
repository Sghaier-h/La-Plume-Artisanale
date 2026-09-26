/**
 * Contrôleur Social-Auth — Placeholders OAuth (Google, Microsoft, Facebook)
 *
 * Endpoints:
 *   GET    /api/social-auth/providers         — Liste des providers
 *   GET    /api/social-auth/links             — Liens de l'utilisateur courant
 *   POST   /api/social-auth/link/start        — Démarrage flow OAuth (placeholder)
 *   GET    /api/social-auth/callback          — Callback (placeholder)
 *   POST   /api/social-auth/link/complete     — Finalisation de liaison (placeholder)
 *   DELETE /api/social-auth/link/:provider    — Retirer un provider
 *   POST   /api/social-auth/login             — Login social (placeholder)
 *
 * NOTE: Ces endpoints sont des placeholders — ils ne contactent aucun provider OAuth.
 * La colonne SQL "social-auth" contient un tiret : quoter avec "".
 */

import crypto from 'crypto';
import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const currentUserId = (req) => req.user?.id || req.user?.userId || null;

const PROVIDERS = [
  { code: 'google',    name: 'Google',            enabled: false, icon: 'logo-google' },
  { code: 'microsoft', name: 'Microsoft / Azure', enabled: false, icon: 'logo-microsoft' },
  { code: 'facebook',  name: 'Facebook',          enabled: false, icon: 'logo-facebook' },
];

// Migration idempotente
(async () => {
  try {
    await pool.query(`
      ALTER TABLE "social-auth"
        ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
        ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS id_utilisateur INTEGER,
        ADD COLUMN IF NOT EXISTS access_token TEXT,
        ADD COLUMN IF NOT EXISTS refresh_token TEXT,
        ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS profile_data JSONB,
        ADD COLUMN IF NOT EXISTS linked_at TIMESTAMP DEFAULT NOW()
    `);
    try {
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_social_auth_user_provider
        ON "social-auth"(id_utilisateur, provider) WHERE provider IS NOT NULL
      `);
    } catch {}
  } catch (err) {
    console.warn('[social-auth] migration ALTER TABLE échouée:', err.message);
  }
})();

// Colonnes sûres (jamais access_token / refresh_token)
const SAFE_COLS = `provider, provider_user_id, id_utilisateur, token_expires_at, profile_data, linked_at`;

// ─── GET /api/social-auth/providers ───────────────────────────────
export const getProviders = async (req, res) => {
  return sendSuccess(res, { providers: PROVIDERS, total: PROVIDERS.length });
};

// ─── GET /api/social-auth/links ───────────────────────────────────
export const getLinks = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `SELECT ${SAFE_COLS} FROM "social-auth" WHERE id_utilisateur = $1 AND provider IS NOT NULL`,
      [uid]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getLinks');
  }
};

// ─── POST /api/social-auth/link/start ─────────────────────────────
export const linkStart = async (req, res) => {
  try {
    const { provider } = req.body || {};
    if (!provider) return sendError(res, 'provider requis', 400);
    if (!PROVIDERS.find((p) => p.code === provider)) {
      return sendError(res, 'Provider inconnu', 400);
    }
    const state = crypto.randomBytes(16).toString('hex');
    return sendSuccess(res, {
      authorize_url: `/api/social-auth/callback?provider=${provider}&state=${state}`,
      state,
      note: 'Placeholder — configurer la librairie OAuth du provider pour activer réellement le flow',
    });
  } catch (error) {
    return handleError(res, error, 'linkStart');
  }
};

// ─── GET /api/social-auth/callback ────────────────────────────────
export const callback = async (req, res) => {
  return sendSuccess(res, {
    provider: req.query.provider || null,
    state: req.query.state || null,
    note: 'OAuth callback — configure the provider client library',
  });
};

// ─── POST /api/social-auth/link/complete ──────────────────────────
export const linkComplete = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const { provider, code, profile_data } = req.body || {};
    if (!provider) return sendError(res, 'provider requis', 400);
    if (!PROVIDERS.find((p) => p.code === provider)) {
      return sendError(res, 'Provider inconnu', 400);
    }

    // Placeholder — un vrai flow échangerait 'code' contre des tokens auprès du provider
    const providerUserId = code || `placeholder-${Date.now()}`;
    const existing = await pool.query(
      `SELECT 1 FROM "social-auth" WHERE id_utilisateur = $1 AND provider = $2 LIMIT 1`,
      [uid, provider]
    );

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE "social-auth"
           SET provider_user_id = $1, profile_data = $2, linked_at = NOW()
         WHERE id_utilisateur = $3 AND provider = $4`,
        [providerUserId, profile_data ? JSON.stringify(profile_data) : null, uid, provider]
      );
    } else {
      await pool.query(
        `INSERT INTO "social-auth" (provider, provider_user_id, id_utilisateur, profile_data, linked_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [provider, providerUserId, uid, profile_data ? JSON.stringify(profile_data) : null]
      );
    }
    return sendSuccess(res, { provider, linked: true }, 'Provider lié (placeholder)', 201);
  } catch (error) {
    return handleError(res, error, 'linkComplete');
  }
};

// ─── DELETE /api/social-auth/link/:provider ───────────────────────
export const unlink = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `DELETE FROM "social-auth" WHERE id_utilisateur = $1 AND provider = $2 RETURNING provider`,
      [uid, req.params.provider]
    );
    if (!r.rows[0]) return sendError(res, 'Lien introuvable', 404);
    return sendSuccess(res, { provider: r.rows[0].provider }, 'Provider délié');
  } catch (error) {
    return handleError(res, error, 'unlink');
  }
};

// ─── POST /api/social-auth/login ──────────────────────────────────
// Placeholder — retourne un shape compatible avec le login classique (auth module)
export const socialLogin = async (req, res) => {
  try {
    const { provider, id_token } = req.body || {};
    if (!provider) return sendError(res, 'provider requis', 400);
    return sendSuccess(res, {
      user: null,
      token: null,
      provider,
      note: 'Placeholder — configurer la vérification id_token du provider pour émettre un JWT',
      id_token_received: !!id_token,
    }, 'Social login placeholder', 200);
  } catch (error) {
    return handleError(res, error, 'socialLogin');
  }
};
