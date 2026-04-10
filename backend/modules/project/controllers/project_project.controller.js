/**
 * Project Controller
 */

import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { Environment } from '../../../src/core/Environment.js';

export default async function createProjectController(app) {
  app.get('/api/projects', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      const projects = await env['project.project'].search([]);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/projects/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      const project = await env['project.project'].read([parseInt(req.params.id)]);
      res.json(project[0] || null);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      const project = await env['project.project'].create(req.body);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      await env['project.project'].write([parseInt(req.params.id)], req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/projects/:id', authenticate, async (req, res) => {
    try {
      const env = new Environment(req.user);
      await env['project.project'].unlink([parseInt(req.params.id)]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
