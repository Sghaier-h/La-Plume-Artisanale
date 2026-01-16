import express from 'express';
import { pool } from '../utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/migration/executer-schema-pointage
 * Endpoint temporaire pour exécuter le schéma de pointage
 * ⚠️ À supprimer après utilisation pour des raisons de sécurité
 */
router.post('/executer-schema-pointage', async (req, res) => {
  try {
    // Vérification simple (à améliorer en production)
    const authHeader = req.headers['x-migration-key'];
    const expectedKey = process.env.MIGRATION_KEY || 'temporary-migration-key-2025';
    
    if (authHeader !== expectedKey) {
      return res.status(401).json({ 
        error: 'Clé d\'authentification invalide',
        message: 'Utilisez le header X-Migration-Key avec la clé correcte'
      });
    }

    console.log('[Migration] Exécution du schéma de pointage...');
    
    const client = await pool.connect();
    
    try {
      // Lire le fichier SQL
      const sqlFile = path.join(__dirname, '../../database/schema_pointage.sql');
      const sql = fs.readFileSync(sqlFile, 'utf8');
      
      console.log('[Migration] Fichier SQL lu, exécution...');
      
      // Exécuter le script SQL
      await client.query(sql);
      
      console.log('[Migration] Script SQL exécuté avec succès');
      
      res.json({
        success: true,
        message: 'Schéma de pointage créé avec succès',
        tables: [
          'pointage',
          'pointage_resume',
          'Colonnes ajoutées à equipe: timemoto_user_id, temps_travaille_mois'
        ],
        triggers: ['trigger_recalculer_resume_mois'],
        view: ['v_pointage_detail']
      });
      
    } catch (error) {
      console.error('[Migration] Erreur SQL:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        detail: error.detail
      });
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[Migration] Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/migration/test
 * Test de l'endpoint de migration
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de migration actif',
    instructions: {
      method: 'POST',
      url: '/api/migration/executer-schema-pointage',
      headers: {
        'Content-Type': 'application/json',
        'X-Migration-Key': 'temporary-migration-key-2025'
      }
    },
    note: 'Cet endpoint doit être supprimé après utilisation'
  });
});

export default router;
