/**
 * Integration tests - Sales workflow (Devis -> Commande -> Facture)
 *
 * Prerequisites:
 *   - Backend server running on http://localhost:5000
 *   - USE_MOCK_AUTH=true and NODE_ENV=development  (or a real DB with the admin user)
 *
 * Run:
 *   NODE_OPTIONS="--experimental-vm-modules" npx jest tests/integration/workflow.test.js
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const LOGIN_EMAIL = 'admin@system.local';
const LOGIN_PASSWORD = process.env.DEV_MOCK_PASSWORD || 'DevLocal2024!';

// ── Shared state across the ordered test steps ──────────────────────────
const ctx = {
  token: null,
  clientId: null,
  devisId: null,
  commandeId: null,
  factureId: null,
};

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Thin wrapper around fetch so every call includes the auth token and
 * JSON content-type header.
 */
async function api(method, path, body = undefined) {
  const headers = { 'Content-Type': 'application/json' };
  if (ctx.token) {
    headers['Authorization'] = `Bearer ${ctx.token}`;
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

// Generate a unique suffix to avoid collisions between test runs
const uid = Date.now().toString(36);

// ── Tests ───────────────────────────────────────────────────────────────

describe('Sales workflow integration', () => {

  // ------------------------------------------------------------------ 1
  describe('Step 1 - Authentication', () => {
    test('POST /api/auth/login returns a token', async () => {
      const { status, body } = await api('POST', '/auth/login', {
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
      });

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.token).toBeDefined();
      expect(typeof body.data.token).toBe('string');
      expect(body.data.user).toBeDefined();
      expect(body.data.user.email).toBe(LOGIN_EMAIL);
      expect(body.data.user.role).toBe('ADMIN');

      // Store the token for subsequent requests
      ctx.token = body.data.token;
    });

    test('GET /api/auth/me returns the current user', async () => {
      const { status, body } = await api('GET', '/auth/me');

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user).toBeDefined();
      expect(body.data.user.email).toBe(LOGIN_EMAIL);
    });
  });

  // ------------------------------------------------------------------ 2
  describe('Step 2 - Create a client', () => {
    test('POST /api/clients creates a new client', async () => {
      const clientPayload = {
        code_client: `CLI-TEST-${uid}`,
        raison_sociale: `Client Test ${uid}`,
        type_client: 'ENTREPRISE',
        email: `test-${uid}@example.com`,
        telephone: '70000000',
        adresse: '1 Rue du Test',
        ville: 'Tunis',
        pays: 'Tunisie',
      };

      const { status, body } = await api('POST', '/clients', clientPayload);

      expect([200, 201]).toContain(status);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();

      // The client id field can be either id_client or id depending on the model layer
      const clientId = body.data.id_client || body.data.id;
      expect(clientId).toBeDefined();

      ctx.clientId = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
      expect(ctx.clientId).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------------ 3
  describe('Step 3 - Create a devis (quote)', () => {
    test('POST /api/devis creates a devis with lignes', async () => {
      const today = new Date().toISOString().split('T')[0];
      const validite = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

      const devisPayload = {
        id_client: ctx.clientId,
        date_devis: today,
        date_validite: validite,
        notes: `Devis integration test ${uid}`,
        lignes: [
          {
            designation: 'Produit A',
            quantite: 10,
            prix_unitaire_ht: 25.00,
            taux_tva: 19,
            remise: 0,
          },
          {
            designation: 'Produit B',
            quantite: 5,
            prix_unitaire_ht: 50.00,
            taux_tva: 19,
            remise: 10,
          },
        ],
      };

      const { status, body } = await api('POST', '/devis', devisPayload);

      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id_devis).toBeDefined();
      expect(body.data.numero_devis).toBeDefined();
      expect(body.data.id_client).toBe(ctx.clientId);
      expect(body.data.statut).toBe('BROUILLON');

      // Verify lignes were returned
      expect(body.data.lignes).toBeDefined();
      expect(Array.isArray(body.data.lignes)).toBe(true);
      expect(body.data.lignes.length).toBe(2);

      // Verify montants are calculated
      expect(parseFloat(body.data.montant_ht)).toBeGreaterThan(0);
      expect(parseFloat(body.data.montant_ttc)).toBeGreaterThan(0);

      ctx.devisId = body.data.id_devis;
    });

    test('GET /api/devis/:id returns the created devis', async () => {
      const { status, body } = await api('GET', `/devis/${ctx.devisId}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id_devis).toBe(ctx.devisId);
      expect(body.data.lignes).toBeDefined();
      expect(body.data.lignes.length).toBe(2);
    });
  });

  // ------------------------------------------------------------------ 4
  describe('Step 4 - Transform devis into commande', () => {
    test('POST /api/devis/:id/transformer creates a commande from the devis', async () => {
      const today = new Date().toISOString().split('T')[0];
      const livraison = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      const { status, body } = await api('POST', `/devis/${ctx.devisId}/transformer`, {
        date_commande: today,
        date_livraison_prevue: livraison,
      });

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();

      // The response contains both the updated devis and the new commande
      expect(body.data.devis).toBeDefined();
      expect(body.data.devis.statut).toBe('TRANSFORME');
      expect(body.data.commande).toBeDefined();
      expect(body.data.commande.id_commande).toBeDefined();
      expect(body.data.commande.numero_commande).toBeDefined();

      ctx.commandeId = body.data.commande.id_commande;
    });

    test('Devis is now marked as TRANSFORME', async () => {
      const { status, body } = await api('GET', `/devis/${ctx.devisId}`);

      expect(status).toBe(200);
      expect(body.data.statut).toBe('TRANSFORME');
      expect(body.data.id_commande).toBe(ctx.commandeId);
    });
  });

  // ------------------------------------------------------------------ 5
  describe('Step 5 - Verify the commande', () => {
    test('GET /api/commandes/:id returns the commande', async () => {
      const { status, body } = await api('GET', `/commandes/${ctx.commandeId}`);

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id_commande).toBe(ctx.commandeId);
      expect(body.data.numero_commande).toBeDefined();
      expect(body.data.id_client).toBe(ctx.clientId);
      expect(body.data.statut).toBeDefined();

      // Verify montant was carried over from the devis
      expect(parseFloat(body.data.montant_total)).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------------ 6
  describe('Step 6 - Create a facture from the commande', () => {
    test('POST /api/factures/from-commande/:id creates a facture', async () => {
      const today = new Date().toISOString().split('T')[0];

      const { status, body } = await api('POST', `/factures/from-commande/${ctx.commandeId}`, {
        date_facture: today,
      });

      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id_facture).toBeDefined();
      expect(body.data.numero_facture).toBeDefined();
      expect(body.data.id_commande).toBe(ctx.commandeId);
      expect(body.data.id_client).toBe(ctx.clientId);
      expect(body.data.statut).toBe('BROUILLON');

      // Verify montants
      expect(parseFloat(body.data.montant_ht)).toBeGreaterThan(0);
      expect(parseFloat(body.data.montant_ttc)).toBeGreaterThan(0);

      // Verify lignes were copied from the commande
      expect(body.data.lignes).toBeDefined();
      expect(Array.isArray(body.data.lignes)).toBe(true);
      expect(body.data.lignes.length).toBeGreaterThan(0);

      ctx.factureId = body.data.id_facture;
    });
  });

  // ------------------------------------------------------------------ 7
  describe('Step 7 - Verify the facture', () => {
    test('GET /api/factures/:id returns the facture with lignes', async () => {
      const { status, body } = await api('GET', `/factures/${ctx.factureId}`);

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id_facture).toBe(ctx.factureId);
      expect(body.data.numero_facture).toBeDefined();
      expect(body.data.id_commande).toBe(ctx.commandeId);
      expect(body.data.id_client).toBe(ctx.clientId);
      expect(body.data.date_facture).toBeDefined();
      expect(body.data.date_echeance).toBeDefined();

      // Verify financial fields
      expect(parseFloat(body.data.montant_ht)).toBeGreaterThan(0);
      expect(parseFloat(body.data.montant_tva)).toBeGreaterThan(0);
      expect(parseFloat(body.data.montant_ttc)).toBeGreaterThan(0);

      // Verify lignes
      expect(body.data.lignes).toBeDefined();
      expect(body.data.lignes.length).toBeGreaterThan(0);
      for (const ligne of body.data.lignes) {
        expect(ligne.quantite).toBeDefined();
        expect(ligne.prix_unitaire_ht).toBeDefined();
      }
    });

    test('The full workflow chain is consistent', async () => {
      // Fetch all three entities and cross-check references
      const [devisRes, cmdRes, factRes] = await Promise.all([
        api('GET', `/devis/${ctx.devisId}`),
        api('GET', `/commandes/${ctx.commandeId}`),
        api('GET', `/factures/${ctx.factureId}`),
      ]);

      // All should succeed
      expect(devisRes.status).toBe(200);
      expect(cmdRes.status).toBe(200);
      expect(factRes.status).toBe(200);

      const devis = devisRes.body.data;
      const cmd = cmdRes.body.data;
      const facture = factRes.body.data;

      // Client is the same across all three
      expect(devis.id_client).toBe(ctx.clientId);
      expect(cmd.id_client).toBe(ctx.clientId);
      expect(facture.id_client).toBe(ctx.clientId);

      // Devis references the commande
      expect(devis.id_commande).toBe(ctx.commandeId);

      // Facture references the commande
      expect(facture.id_commande).toBe(ctx.commandeId);
    });
  });

  // ------------------------------------------------------------------ Cleanup
  describe('Cleanup - remove test data', () => {
    test('DELETE facture', async () => {
      if (!ctx.factureId) return;
      const { status } = await api('DELETE', `/factures/${ctx.factureId}`);
      expect([200, 204]).toContain(status);
    });

    test('DELETE commande', async () => {
      if (!ctx.commandeId) return;
      const { status } = await api('DELETE', `/commandes/${ctx.commandeId}`);
      // Commande deletion may not be allowed depending on status; accept 200 or 400
      expect([200, 204, 400]).toContain(status);
    });

    test('DELETE devis', async () => {
      if (!ctx.devisId) return;
      // Devis is TRANSFORME so deletion may be blocked (400) or fail (500 if FK constraint)
      const { status } = await api('DELETE', `/devis/${ctx.devisId}`);
      expect([200, 204, 400, 500]).toContain(status);
    });

    test('DELETE client', async () => {
      if (!ctx.clientId) return;
      const { status } = await api('DELETE', `/clients/${ctx.clientId}`);
      expect([200, 204]).toContain(status);
    });
  });
});
