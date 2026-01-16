import { pool } from '../utils/db.js';
import crypto from 'crypto';

/**
 * Vérifier la signature du webhook TimeMoto
 */
const verifierSignature = (signature, body, secret) => {
  if (!signature || !secret) {
    console.warn('[Webhook] Signature ou secret manquant');
    return false;
  }

  // TimeMoto utilise généralement HMAC SHA256
  // La signature est dans le header 'x-timemoto-signature' ou similaire
  // À adapter selon la documentation TimeMoto
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return signature === expectedSignature;
};

/**
 * Recevoir et traiter les webhooks TimeMoto
 * POST /api/webhooks/timemoto/pointage
 */
export const recevoirWebhookTimeMoto = async (req, res) => {
  try {
    const { event, timestamp, data } = req.body;

    console.log(`[Webhook TimeMoto] Événement reçu: ${event}`, { timestamp, data });

    // Vérifier la signature du webhook si la clé secrète est configurée
    const timemotoSecret = process.env.TIMEMOTO_WEBHOOK_SECRET;
    if (timemotoSecret) {
      const signature = req.headers['x-timemoto-signature'] || req.headers['x-signature'];
      if (!verifierSignature(signature, req.body, timemotoSecret)) {
        console.error('[Webhook TimeMoto] Signature invalide');
        return res.status(401).json({ error: 'Signature invalide' });
      }
      console.log('[Webhook TimeMoto] Signature vérifiée avec succès');
    } else {
      console.warn('[Webhook TimeMoto] Aucune clé secrète configurée - webhook non sécurisé');
    }

    switch (event) {
      case 'attendance.inserted':
      case 'attendance.updated':
        await traiterPresence(data);
        break;

      case 'attendance.deleted':
        await supprimerPresence(data);
        break;

      case 'user.inserted':
      case 'user.updated':
        await synchroniserUtilisateur(data);
        break;

      case 'user.deleted':
        await supprimerUtilisateur(data);
        break;

      default:
        console.log(`[Webhook TimeMoto] Événement non géré: ${event}`);
    }

    // Répondre rapidement à TimeMoto (200 OK)
    res.status(200).json({ 
      success: true, 
      message: 'Webhook reçu et traité',
      event 
    });

  } catch (error) {
    console.error('[Webhook TimeMoto] Erreur:', error);
    // Toujours répondre 200 pour éviter les retries de TimeMoto
    // Mais logger l'erreur pour traitement ultérieur
    res.status(200).json({ 
      success: false, 
      error: 'Erreur de traitement (loggée)' 
    });
  }
};

/**
 * Traiter une présence (insertion ou mise à jour)
 */
const traiterPresence = async (data) => {
  try {
    const {
      id: timemoto_id,
      user_id: timemoto_user_id,
      date,
      check_in,
      check_out,
      hours_worked,
      status,
      late_minutes,
      user
    } = data;

    // Trouver l'utilisateur dans notre système par email ou ID TimeMoto
    const queryUser = `
      SELECT id FROM equipe 
      WHERE email = $1 OR timemoto_user_id = $2
      LIMIT 1
    `;
    const resultUser = await pool.query(queryUser, [user?.email, timemoto_user_id]);

    if (resultUser.rows.length === 0) {
      console.log(`[Webhook] Utilisateur non trouvé: ${user?.email || timemoto_user_id}`);
      return;
    }

    const userId = resultUser.rows[0].id;

    // Vérifier si la présence existe déjà
    const queryCheck = `
      SELECT id FROM pointage 
      WHERE timemoto_id = $1 OR (user_id = $2 AND date = $3)
    `;
    const checkResult = await pool.query(queryCheck, [timemoto_id, userId, date]);

    if (checkResult.rows.length > 0) {
      // Mise à jour
      const updateQuery = `
        UPDATE pointage 
        SET 
          check_in = $1,
          check_out = $2,
          heures_travaillees = $3,
          present = $4,
          retard_minutes = $5,
          updated_at = NOW()
        WHERE id = $6
      `;
      await pool.query(updateQuery, [
        check_in,
        check_out,
        hours_worked,
        status === 'present',
        late_minutes || 0,
        checkResult.rows[0].id
      ]);
      console.log(`[Webhook] Présence mise à jour pour user ${userId}, date ${date}`);
    } else {
      // Insertion
      const insertQuery = `
        INSERT INTO pointage (
          timemoto_id,
          user_id,
          date,
          check_in,
          check_out,
          heures_travaillees,
          present,
          retard_minutes,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `;
      await pool.query(insertQuery, [
        timemoto_id,
        userId,
        date,
        check_in,
        check_out,
        hours_worked,
        status === 'present',
        late_minutes || 0
      ]);
      console.log(`[Webhook] Nouvelle présence enregistrée pour user ${userId}, date ${date}`);
    }

    // Mettre à jour le temps travaillé total du mois pour cet utilisateur
    await recalculerTempsTravailleMois(userId);

  } catch (error) {
    console.error('[Webhook] Erreur traitement présence:', error);
    throw error;
  }
};

/**
 * Supprimer une présence
 */
const supprimerPresence = async (data) => {
  try {
    const { id: timemoto_id, user_id: timemoto_user_id, date } = data;

    // Trouver l'utilisateur
    const queryUser = `
      SELECT id FROM equipe 
      WHERE timemoto_user_id = $1
      LIMIT 1
    `;
    const resultUser = await pool.query(queryUser, [timemoto_user_id]);

    if (resultUser.rows.length === 0) {
      return;
    }

    const userId = resultUser.rows[0].id;

    // Supprimer la présence
    const deleteQuery = `
      DELETE FROM pointage 
      WHERE timemoto_id = $1 OR (user_id = $2 AND date = $3)
    `;
    await pool.query(deleteQuery, [timemoto_id, userId, date]);

    // Recalculer le temps travaillé
    await recalculerTempsTravailleMois(userId);

    console.log(`[Webhook] Présence supprimée pour user ${userId}, date ${date}`);

  } catch (error) {
    console.error('[Webhook] Erreur suppression présence:', error);
    throw error;
  }
};

/**
 * Synchroniser un utilisateur TimeMoto avec notre système
 */
const synchroniserUtilisateur = async (data) => {
  try {
    const {
      id: timemoto_user_id,
      name,
      email,
      employee_id
    } = data;

    // Vérifier si l'utilisateur existe
    const queryCheck = `
      SELECT id FROM equipe 
      WHERE email = $1 OR timemoto_user_id = $2
    `;
    const checkResult = await pool.query(queryCheck, [email, timemoto_user_id]);

    if (checkResult.rows.length > 0) {
      // Mise à jour
      const updateQuery = `
        UPDATE equipe 
        SET 
          timemoto_user_id = $1,
          nom = $2,
          prenom = $3,
          email = $4,
          updated_at = NOW()
        WHERE id = $5
      `;
      const [nom, prenom] = name ? name.split(' ').slice(0, 2) : ['', ''];
      await pool.query(updateQuery, [timemoto_user_id, nom, prenom, email, checkResult.rows[0].id]);
      console.log(`[Webhook] Utilisateur mis à jour: ${email}`);
    } else {
      // Créer un nouvel utilisateur (optionnel - selon votre logique métier)
      console.log(`[Webhook] Nouvel utilisateur TimeMoto détecté: ${email} - Création manuelle requise`);
    }

  } catch (error) {
    console.error('[Webhook] Erreur synchronisation utilisateur:', error);
    throw error;
  }
};

/**
 * Supprimer un utilisateur
 */
const supprimerUtilisateur = async (data) => {
  try {
    const { id: timemoto_user_id } = data;

    // Marquer comme inactif plutôt que supprimer
    const updateQuery = `
      UPDATE equipe 
      SET actif = false, updated_at = NOW()
      WHERE timemoto_user_id = $1
    `;
    await pool.query(updateQuery, [timemoto_user_id]);

    console.log(`[Webhook] Utilisateur marqué comme inactif: ${timemoto_user_id}`);

  } catch (error) {
    console.error('[Webhook] Erreur suppression utilisateur:', error);
    throw error;
  }
};

/**
 * Recalculer le temps travaillé total du mois pour un utilisateur
 */
const recalculerTempsTravailleMois = async (userId) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const query = `
      SELECT COALESCE(SUM(heures_travaillees), 0) as total
      FROM pointage
      WHERE user_id = $1 
        AND date LIKE $2
        AND present = true
    `;
    const result = await pool.query(query, [userId, `${currentMonth}%`]);
    const totalHeures = parseFloat(result.rows[0].total) || 0;

    // Mettre à jour dans la table equipe ou pointage_resume
    const updateQuery = `
      UPDATE equipe 
      SET temps_travaille_mois = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(updateQuery, [totalHeures, userId]);

  } catch (error) {
    console.error('[Webhook] Erreur calcul temps travaillé:', error);
  }
};

/**
 * Endpoint de test pour vérifier la configuration
 * GET /api/webhooks/timemoto/test
 */
export const testerWebhook = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Endpoint webhook opérationnel',
      timestamp: new Date().toISOString(),
      instructions: {
        url: '/api/webhooks/timemoto/pointage',
        method: 'POST',
        events: [
          'attendance.inserted',
          'attendance.updated',
          'attendance.deleted',
          'user.inserted',
          'user.updated',
          'user.deleted'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
