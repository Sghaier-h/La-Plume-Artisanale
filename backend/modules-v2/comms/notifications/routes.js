// routes.js — notifications
//
// Phase F : ajout endpoint /non-lues pour la UserBar (dropdown notifications).
// Lit la table `notifications` (auto-migrée par le module legacy) avec les
// colonnes communes id_destinataire, titre, contenu, lu, urgent, date_creation.
import { Router } from 'express';
import * as ctrl from './controller.js';
import { getPool } from '../../_shared/db.js';
import { authenticate } from '../../_shared/authMiddleware.js';

const router = Router();

// ── GET /api/v2/notifications/non-lues?limit=5 ────────────────────
// Retourne les N dernières notifications non-lues pour l'utilisateur
// courant, au shape attendu par UserBar : {id, title, body, time, level}.
router.get('/non-lues', authenticate, async (req, res) => {
  const pool = getPool();
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50);
  const userId = req.user?.id_user || req.user?.id || req.user?.userId || null;
  try {
    const params = [];
    const where = ['n.titre IS NOT NULL', 'n.lu = false'];
    if (userId) {
      params.push(userId);
      where.push(`n.id_destinataire = $${params.length}`);
    }
    params.push(limit);
    const sql = `
      SELECT
        n.id_notifications AS id,
        n.titre AS title,
        n.contenu AS body,
        n.date_creation AS time_at,
        COALESCE(n.urgent, false) AS urgent
      FROM notifications n
      WHERE ${where.join(' AND ')}
      ORDER BY n.date_creation DESC NULLS LAST
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    const items = r.rows.map(row => ({
      id: row.id,
      title: row.title,
      body: row.body || '',
      time: row.time_at,
      level: row.urgent ? 'danger' : 'info',
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
