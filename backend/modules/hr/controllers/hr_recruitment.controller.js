/**
 * HR Recruitment Controller
 */

import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { logger } from '../../../src/utils/logger.js';
import Environment from '../../../src/core/Environment.js';

export default (router, pool) => {
  // CRUD pour les candidats
  router.get('/hr/applicants', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const applicants = await env['hr.applicant'].search([]);
      res.json(applicants);
    } catch (error) {
      logger.error('Erreur récupération candidats', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/hr/applicants/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const applicant = await env['hr.applicant'].read([parseInt(req.params.id)]);
      res.json(applicant[0] || null);
    } catch (error) {
      logger.error('Erreur récupération candidat', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/hr/applicants', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const applicant = await env['hr.applicant'].create(req.body);
      res.json(applicant);
    } catch (error) {
      logger.error('Erreur création candidat', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/hr/applicants/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const applicant = await env['hr.applicant'].write([parseInt(req.params.id)], req.body);
      res.json(applicant);
    } catch (error) {
      logger.error('Erreur mise à jour candidat', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/hr/applicants/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      await env['hr.applicant'].unlink([parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (error) {
      logger.error('Erreur suppression candidat', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Actions spéciales
  router.post('/hr/applicants/:id/hire', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const result = await env['hr.applicant'].action_hire(env, { id: parseInt(req.params.id) });
      res.json({ success: true, result });
    } catch (error) {
      logger.error('Erreur recrutement candidat', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/hr/applicants/:id/refuse', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const result = await env['hr.applicant'].action_refuse(env, { id: parseInt(req.params.id) });
      res.json({ success: true, result });
    } catch (error) {
      logger.error('Erreur refus candidat', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Étapes de recrutement
  router.get('/hr/recruitment/stages', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const stages = await env['hr.recruitment.stage'].search([]);
      res.json(stages);
    } catch (error) {
      logger.error('Erreur récupération étapes', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
};
