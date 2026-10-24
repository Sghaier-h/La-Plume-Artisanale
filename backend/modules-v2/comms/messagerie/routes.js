// routes.js — messagerie
//
// Phase F : ajout endpoint /recents pour la UserBar (dropdown messages).
// Lit la table `messages` (legacy) qui est la source de données réelle
// alimentée en production. Fallback silencieux si table absente.
import { Router } from 'express';
import * as ctrl from './controller.js';
import { getPool } from '../../_shared/db.js';
import { authenticate } from '../../_shared/authMiddleware.js';

const router = Router();

// ── GET /api/v2/messages/recents?limit=5 ──────────────────────────
// Retourne les N derniers messages pour l'utilisateur courant (adaptés
// au shape attendu par UserBar : {id, from, preview, time, urgent, channel}).
router.get('/recents', authenticate, async (req, res) => {
  const pool = getPool();
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50);
  const userId = req.user?.id_user || req.user?.id || req.user?.userId || null;
  try {
    const params = [];
    const where = ['m.contenu IS NOT NULL'];
    if (userId) {
      params.push(userId);
      where.push(`(m.id_destinataire = $${params.length} OR m.id_expediteur = $${params.length})`);
    }
    params.push(limit);
    const sql = `
      SELECT
        m.id_messages AS id,
        COALESCE(exp.prenom || ' ' || exp.nom, 'Expéditeur') AS from_name,
        LEFT(m.contenu, 160) AS preview,
        m.date_envoi AS time_at,
        COALESCE(m.urgent, false) AS urgent
      FROM messages m
      LEFT JOIN users exp ON m.id_expediteur = exp.id_user
      WHERE ${where.join(' AND ')}
      ORDER BY m.date_envoi DESC NULLS LAST
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    const items = r.rows.map(row => ({
      id: row.id,
      from: row.from_name,
      preview: row.preview || '',
      time: row.time_at,
      urgent: !!row.urgent,
      channel: 'interne',
    }));
    return res.json({ success: true, data: items, error: null });
  } catch (e) {
    // Pas de table / erreur SQL → renvoie liste vide (fonctionnel partout)
    return res.json({ success: true, data: [], error: null });
  }
});

router.get('/',        ctrl.list);
router.get('/:id',     ctrl.getOne);
router.post('/',       ctrl.create);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
