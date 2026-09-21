/**
 * HR Employee Controller
 */

import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { Environment } from '../../../src/core/Environment.js';

export default async function createEmployeeController(app) {
  app.get('/api/hr/employees', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      const employees = await env['hr.employee'].search([]);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/hr/employees/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      const employee = await env['hr.employee'].read([parseInt(req.params.id)]);
      res.json(employee[0] || null);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/hr/employees', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      const employee = await env['hr.employee'].create(req.body);
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/hr/employees/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      await env['hr.employee'].write([parseInt(req.params.id)], req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/hr/employees/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      await env['hr.employee'].unlink([parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
