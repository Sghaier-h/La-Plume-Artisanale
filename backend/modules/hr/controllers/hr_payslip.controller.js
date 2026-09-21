/**
 * HR Payslip Controller
 */

import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { logger } from '../../../src/utils/logger.js';
import Environment from '../../../src/core/Environment.js';

export default (router, pool) => {
  // CRUD pour les bulletins de paie
  router.get('/hr/payslips', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const payslips = await env['hr.payslip'].search([]);
      res.json(payslips);
    } catch (error) {
      logger.error('Erreur récupération bulletins', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/hr/payslips/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const payslip = await env['hr.payslip'].read([parseInt(req.params.id)]);
      res.json(payslip[0] || null);
    } catch (error) {
      logger.error('Erreur récupération bulletin', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/hr/payslips', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const payslip = await env['hr.payslip'].create(req.body);
      res.json(payslip);
    } catch (error) {
      logger.error('Erreur création bulletin', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/hr/payslips/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const payslip = await env['hr.payslip'].write([parseInt(req.params.id)], req.body);
      res.json(payslip);
    } catch (error) {
      logger.error('Erreur mise à jour bulletin', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/hr/payslips/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      await env['hr.payslip'].unlink([parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (error) {
      logger.error('Erreur suppression bulletin', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Actions spéciales
  router.post('/hr/payslips/:id/compute', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const result = await env['hr.payslip'].action_compute_sheet(env, { id: parseInt(req.params.id) });
      res.json({ success: true, result });
    } catch (error) {
      logger.error('Erreur calcul bulletin', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/hr/payslips/:id/validate', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user, pool);
      const result = await env['hr.payslip'].action_payslip_done(env, { id: parseInt(req.params.id) });
      res.json({ success: true, result });
    } catch (error) {
      logger.error('Erreur validation bulletin', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
};
