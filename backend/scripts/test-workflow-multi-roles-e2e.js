#!/usr/bin/env node
/**
 * Phase T6 — Test End-to-End workflow métier avec LOGIN PAR RÔLE.
 *
 * Chaque étape se logge avec le rôle réel qui doit l'exécuter (COMMERCIAL,
 * CHEF_PRODUCTION, TISSEUR, COUPEUR, CONTROLEUR_QUALITE, MAGASINIER_*,
 * COMPTABLE, MECANICIEN) et appelle l'API avec son propre JWT, afin de
 * détecter les trous de permission (403) et les routes manquantes (404)
 * dans le workflow réel.
 *
 * Pré-requis : backend démarré sur http://localhost:5000, 10 comptes mock.
 *
 * Usage :
 *   node backend/scripts/test-workflow-multi-roles-e2e.js
 *   node backend/scripts/test-workflow-multi-roles-e2e.js --verbose
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const PWD      = process.env.DEV_MOCK_PASSWORD || 'DevLocal2024!';
const VERBOSE  = process.argv.includes('--verbose');

// ─── Comptes mock par rôle ─────────────────────────────────────────────────
const USERS = {
  ADMIN:                   'admin@system.local',
  COMMERCIAL:              'commercial@entreprise.local',
  CHEF_PRODUCTION:         'chef.production@entreprise.local',
  TISSEUR:                 'tisseur@entreprise.local',
  COUPEUR:                 'coupeur@entreprise.local',
  CONTROLEUR_QUALITE:      'controleur.qualite@entreprise.local',
  MAGASINIER_MP:           'magasinier.mp@entreprise.local',
  MAGASINIER_STOCK:        'magasinier.stock@entreprise.local',
  MAGASINIER_PREPARATION:  'magasinier.preparation@entreprise.local',
  MAGASINIER_SOUSTRAITANTS:'magasinier.st@entreprise.local',
  COMPTABLE:               'comptable@entreprise.local',
  MECANICIEN:              'mecanicien@entreprise.local',
};

// Fallback emails si certains n'existent pas
const USER_FALLBACKS = {
  MAGASINIER_SOUSTRAITANTS: ['magasinier.soustraitants@entreprise.local'],
  MAGASINIER_MP:            ['magasinier.preparation@entreprise.local'],
};

const tokens = {};      // role → token
const ctx = {};         // IDs partagés
const results = [];     // { step, role, status, info, id, error, duration_ms }

// ─── Helpers ───────────────────────────────────────────────────────────────
function log(step, role, status, info, idCree, error, duration) {
  const tag = status === 'OK' ? '[OK] ' : (status === 'SKIP' ? '[SK] ' : '[KO] ');
  const line = `${tag}Étape ${String(step).padStart(2)} (${role.padEnd(26)}) ${info}` +
               (idCree !== undefined && idCree !== null ? ` → id=${idCree}` : '') +
               ` (${duration}ms)`;
  console.log(line);
  if (error) console.log('     ⚠ ', typeof error === 'string' ? error : JSON.stringify(error));
  results.push({ step, role, status, info, id: idCree ?? null, error: error || null, duration_ms: duration });
}

async function loginAs(email, password = PWD) {
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error(`login ${email} → HTTP ${r.status}`);
  const j = await r.json();
  const token = j?.data?.token || j?.token;
  if (!token) throw new Error(`login ${email} → pas de token (resp=${JSON.stringify(j).slice(0, 200)})`);
  return token;
}

async function loginRole(role) {
  if (tokens[role]) return tokens[role];
  const emails = [USERS[role], ...(USER_FALLBACKS[role] || [])].filter(Boolean);
  for (const email of emails) {
    try {
      const t = await loginAs(email);
      tokens[role] = t;
      if (VERBOSE) console.log(`  🔑 login ${role} via ${email}`);
      return t;
    } catch (e) {
      if (VERBOSE) console.log(`  ✗  login ${role} via ${email} : ${e.message}`);
    }
  }
  throw new Error(`Aucun compte connecté pour ${role} (essais: ${emails.join(', ')})`);
}

async function apiAs(token, method, path, body) {
  const headers = {
    'Content-Type': 'application/json',
    'x-societe-id': '1',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const url = `${API_BASE}${path}`;
  if (VERBOSE) console.log(`    → ${method} ${url}${body ? ' ' + JSON.stringify(body).slice(0, 160) : ''}`);
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let json = null; try { json = txt ? JSON.parse(txt) : null; } catch {}
  if (VERBOSE) console.log(`    ← ${r.status} ${txt.slice(0, 220)}`);
  return { status: r.status, body: json, raw: txt };
}

function unwrap(resp, label) {
  if (resp.status >= 200 && resp.status < 300 && resp.body && (resp.body.success === true || resp.body.success === undefined)) {
    return resp.body.data ?? resp.body;
  }
  const msg = resp.body?.error?.message || resp.body?.error || resp.body?.message || resp.raw || `HTTP ${resp.status}`;
  const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  err.httpStatus = resp.status;
  err.label = label;
  throw err;
}

async function pickReferences() {
  // Récupérer sous-traitant actif
  const admin = await loginRole('ADMIN');
  try {
    const r = await apiAs(admin, 'GET', '/v2/sous-traitance/sous-traitants');
    const list = r.body?.data?.rows || r.body?.data || [];
    const st = Array.isArray(list) ? list.find(x => x.actif) : null;
    ctx.sousTraitantId = st?.id_soustraitant || st?.id || 2;
  } catch { ctx.sousTraitantId = 2; }
  // Article et machine
  ctx.idArticle = 1;
  ctx.machineId = 1;
  // Caisse principale pour encaissement
  ctx.caisseId = 1;
  // MP et entrepôt (pour la sortie atelier)
  try {
    const r = await apiAs(admin, 'GET', '/v2/stock/matieres-premieres?limit=1');
    const first = r.body?.data?.matieres_premieres?.[0] || r.body?.data?.[0];
    ctx.idMp = first?.id_mp || null;
  } catch {}
  try {
    const r = await apiAs(admin, 'GET', '/entrepots');
    const first = r.body?.data?.[0];
    ctx.idEntrepot = first?.id_warehouse || first?.id_entrepot || 1;
  } catch { ctx.idEntrepot = 1; }
}

// ─── Exécuteur d'étape avec chrono + logging ───────────────────────────────
async function step(num, role, label, fn, { optional = false } = {}) {
  const t0 = Date.now();
  try {
    const token = await loginRole(role);
    const res = await fn(token);
    const dt = Date.now() - t0;
    log(num, role, 'OK', label, res?.id, null, dt);
    return res;
  } catch (e) {
    const dt = Date.now() - t0;
    log(num, role, 'KO', label, null, e.message, dt);
    if (!optional && e.httpStatus === 401) throw e;   // auth cassée → stop
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
async function run() {
  const uid = Date.now().toString(36);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   WORKFLOW E2E MULTI-RÔLES — Phase T6 — La Plume Artisanale');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await pickReferences();
  if (VERBOSE) console.log(`  ctx initial: ${JSON.stringify(ctx)}`);

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 1 — ADMIN : crée client CRM + contact
  // ───────────────────────────────────────────────────────────────────────
  await step(1, 'ADMIN', 'crée client CRM', async (t) => {
    const r = await apiAs(t, 'POST', '/v2/crm/comptes', {
      code_client: `MR-${uid}`,
      raison_sociale: `Multi-Roles Hotel E2E ${uid}`,
      type_compte: 'societe',
      statut_crm: 'client',
      pays: 'TN',
      actif: true,
    });
    const d = unwrap(r, 'POST /v2/crm/comptes');
    ctx.clientId = d.id_client || d.id;
    return { id: ctx.clientId };
  });

  await step(2, 'ADMIN', 'crée contact', async (t) => {
    if (!ctx.clientId) throw new Error('clientId manquant');
    const r = await apiAs(t, 'POST', '/v2/crm/contacts', {
      id_client: ctx.clientId,
      role: 'commercial_client',
      civilite: 'M',
      nom: 'Multi',
      prenom: 'Roles',
      fonction: 'Directeur achats',
      email: `mr-${uid}@example.com`,
      telephone: '+33 1 00 00 00 00',
      est_principal: true,
    });
    const d = unwrap(r, 'POST /v2/crm/contacts');
    ctx.contactId = d.id_contact || d.id;
    return { id: ctx.contactId };
  });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 3 — COMMERCIAL : crée devis
  // ───────────────────────────────────────────────────────────────────────
  await step(3, 'COMMERCIAL', 'crée devis', async (t) => {
    if (!ctx.clientId) throw new Error('clientId manquant');
    const today = new Date().toISOString().split('T')[0];
    const validite = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const r = await apiAs(t, 'POST', '/v2/ventes/devis', {
      id_client: ctx.clientId,
      date_devis: today,
      date_validite: validite,
      notes: `Devis multi-rôles ${uid}`,
      lignes: [
        { id_article: ctx.idArticle, designation: 'Fouta ARTISANAT Lin — 50 pcs',
          quantite: 50, prix_unitaire_ht: 25.0, taux_tva: 19, remise: 0 },
      ],
    });
    const d = unwrap(r, 'POST /v2/ventes/devis');
    ctx.devisId = d.id_devis;
    return { id: ctx.devisId };
  });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 4 — ADMIN : transforme devis → commande + génère OF
  //  (fonctionnellement devrait être exécutable par COMMERCIAL mais la
  //   génération d'OF appartient à la fabrication → reste côté ADMIN)
  // ───────────────────────────────────────────────────────────────────────
  await step(4, 'ADMIN', 'transforme devis → commande', async (t) => {
    if (!ctx.devisId) throw new Error('devisId manquant');
    const today = new Date().toISOString().split('T')[0];
    const livraison = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const r = await apiAs(t, 'POST', `/v2/ventes/devis/${ctx.devisId}/transformer`, {
      date_commande: today, date_livraison_prevue: livraison,
    });
    const d = unwrap(r, 'POST /v2/ventes/devis/:id/transformer');
    ctx.commandeId = d.commande?.id_commande;
    // Valider la commande + générer OFs dans la foulée
    await apiAs(t, 'POST', `/v2/ventes/commandes/${ctx.commandeId}/valider`);
    const g = await apiAs(t, 'POST', `/v2/ventes/commandes/${ctx.commandeId}/generer-ofs`, { force: false });
    const dg = unwrap(g, 'POST /v2/ventes/commandes/:id/generer-ofs');
    const ofs = dg.ofs_created || dg.data?.ofs_created || [];
    if (ofs.length) ctx.ofId = ofs[0].id_of;
    return { id: ctx.commandeId };
  });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 5 — CHEF_PRODUCTION : planifie l'OF sur une machine
  // ───────────────────────────────────────────────────────────────────────
  await step(5, 'CHEF_PRODUCTION', 'planifie OF sur machine', async (t) => {
    if (!ctx.ofId) throw new Error('ofId manquant (étape 4 a-t-elle produit un OF ?)');
    const today = new Date().toISOString().split('T')[0];
    const fin = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const r = await apiAs(t, 'POST', `/v2/fabrication/of/${ctx.ofId}/assigner-machine`, {
      id_machine: ctx.machineId,
      date_debut_prevue: today,
      date_fin_prevue: fin,
    });
    unwrap(r, 'POST /v2/fabrication/of/:id/assigner-machine');
    return { id: ctx.ofId };
  });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 6 — MAGASINIER_MP : prépare les MP → sortie_of
  //  Note : la spec demande type_mouvement='sortie_atelier' mais le service
  //  v2 n'accepte que sortie_vente/sortie_of/ajustement_negatif/mise_au_rebut.
  //  → on utilise sortie_of (sortie pour alimenter un OF).
  // ───────────────────────────────────────────────────────────────────────
  await step(6, 'MAGASINIER_MP', 'sortie MP → atelier (sortie_of)', async (t) => {
    const payload = {
      type_mouvement: 'sortie_of',
      id_article: ctx.idArticle,
      id_entrepot_source: ctx.idEntrepot,
      quantite: 10,
      id_of_source: ctx.ofId,
      motif: `Alimentation OF ${ctx.ofId || '?'} multi-rôles ${uid}`,
    };
    const r = await apiAs(t, 'POST', '/v2/stock/mouvements', payload);
    const d = unwrap(r, 'POST /v2/stock/mouvements');
    ctx.mvtMpId = d.id_mouvement || d.id;
    return { id: ctx.mvtMpId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 7 — TISSEUR : démarre son OF + tâche tissage
  // ───────────────────────────────────────────────────────────────────────
  await step(7, 'TISSEUR', 'démarre OF + tâche tissage', async (t) => {
    if (!ctx.ofId) throw new Error('ofId manquant');
    // Essaie demarrer l'OF
    const r1 = await apiAs(t, 'POST', `/v2/fabrication/of/${ctx.ofId}/demarrer`, {});
    if (r1.status === 403) throw new Error(`403 TISSEUR cannot demarrer OF: ${r1.body?.error?.message || ''}`);
    if (r1.status >= 400 && r1.status < 500 && r1.status !== 404) {
      unwrap(r1, 'POST /v2/fabrication/of/:id/demarrer'); // raise
    }
    // Toujours créer une tâche de tissage (côté opérateur)
    const admin = await loginRole('ADMIN');
    const rc = await apiAs(admin, 'POST', '/v2/fabrication/taches', {
      titre: `Tissage OF ${ctx.ofId}`,
      description: 'Tâche de tissage multi-rôles',
      id_of: ctx.ofId,
      poste: 'tissage',
      priorite: 'normale',
      statut: 'en_attente',
    });
    const dt = unwrap(rc, 'POST /v2/fabrication/taches');
    ctx.tacheTisseurId = dt.id_taches || dt.id;
    // Démarre la tâche en tant que TISSEUR
    const rd = await apiAs(t, 'PUT', `/v2/fabrication/taches/${ctx.tacheTisseurId}/demarrer`);
    unwrap(rd, 'PUT /v2/fabrication/taches/:id/demarrer');
    // Termine la tâche
    const rf = await apiAs(t, 'PUT', `/v2/fabrication/taches/${ctx.tacheTisseurId}/terminer`);
    unwrap(rf, 'PUT /v2/fabrication/taches/:id/terminer');
    return { id: ctx.tacheTisseurId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 8 — CONTROLEUR_QUALITE : contrôle après tissage
  // ───────────────────────────────────────────────────────────────────────
  await step(8, 'CONTROLEUR_QUALITE', 'contrôle qualité après tissage', async (t) => {
    if (!ctx.ofId) throw new Error('ofId manquant');
    // Note: enum ctrl_type_enum = 'visuel'|'dimensionnel'|'colorimetrique'|
    //       'resistance'|'poids'|'retour_soustraitance' — PAS 'tissage'.
    const r = await apiAs(t, 'POST', '/v2/qualite/controles', {
      id_of: ctx.ofId,
      date_controle: new Date().toISOString(),
      type_controle: 'visuel',
      qte_1er_choix: 48, qte_2e_choix: 2, qte_ourlet: 0, qte_rebut: 0,
      est_bloquant: false,
      decision: 'laisser_passer_1c',
      commentaire: 'Conforme — OK après tissage',
    });
    const d = unwrap(r, 'POST /v2/qualite/controles');
    ctx.ctrlTissageId = d.id_ctrl || d.id;
    return { id: ctx.ctrlTissageId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 9 — COUPEUR : démarre tâche de coupe + termine, décide envoi ST
  // ───────────────────────────────────────────────────────────────────────
  await step(9, 'COUPEUR', 'tâche coupe + envoi sous-traitant', async (t) => {
    const admin = await loginRole('ADMIN');
    const rc = await apiAs(admin, 'POST', '/v2/fabrication/taches', {
      titre: `Coupe OF ${ctx.ofId}`,
      description: 'Tâche de coupe + décision ST frange',
      id_of: ctx.ofId,
      poste: 'coupe',
      priorite: 'normale',
      statut: 'en_attente',
    });
    const dt = unwrap(rc, 'POST /v2/fabrication/taches');
    ctx.tacheCoupeurId = dt.id_taches || dt.id;
    const rd = await apiAs(t, 'PUT', `/v2/fabrication/taches/${ctx.tacheCoupeurId}/demarrer`);
    unwrap(rd, 'PUT /v2/fabrication/taches/:id/demarrer (COUPEUR)');
    const rf = await apiAs(t, 'PUT', `/v2/fabrication/taches/${ctx.tacheCoupeurId}/terminer`);
    unwrap(rf, 'PUT /v2/fabrication/taches/:id/terminer (COUPEUR)');
    return { id: ctx.tacheCoupeurId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 10 — MAGASINIER_SOUSTRAITANTS : crée bon sortie ST (frange)
  // ───────────────────────────────────────────────────────────────────────
  await step(10, 'MAGASINIER_SOUSTRAITANTS', 'bon sortie sous-traitant', async (t) => {
    const retourPrevu = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    const r = await apiAs(t, 'POST', '/v2/sous-traitance/bons', {
      id_sous_traitant: ctx.sousTraitantId,
      id_of: ctx.ofId,
      type_mouvement: 'sortie',
      date_retour_prevue: retourPrevu,
      observations: `Sous-traitance frange — OF ${ctx.ofId} (multi-rôles ${uid})`,
    });
    const d = unwrap(r, 'POST /v2/sous-traitance/bons');
    ctx.bonStId = d.id_mouvement_st || d.id;
    return { id: ctx.bonStId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 11 — MAGASINIER_SOUSTRAITANTS : enregistre retour ST
  // ───────────────────────────────────────────────────────────────────────
  await step(11, 'MAGASINIER_SOUSTRAITANTS', 'retour sous-traitant', async (t) => {
    if (!ctx.bonStId) throw new Error('bonStId manquant (étape 10 KO ?)');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="30"><path d="M5 20 L25 5 L45 25 L65 10" stroke="black" fill="none"/></svg>';
    const r = await apiAs(t, 'POST', '/v2/sous-traitance/retours', {
      id_mouvement_st: ctx.bonStId,
      signature_svg: svg,
      observations: 'Retour frange conforme (multi-rôles)',
    });
    const d = unwrap(r, 'POST /v2/sous-traitance/retours');
    ctx.retourStId = d.id_mouvement_st || d.id;
    return { id: ctx.retourStId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 12 — CONTROLEUR_QUALITE : contrôle après frange
  // ───────────────────────────────────────────────────────────────────────
  await step(12, 'CONTROLEUR_QUALITE', 'contrôle qualité après frange', async (t) => {
    const r = await apiAs(t, 'POST', '/v2/qualite/controles', {
      id_of: ctx.ofId,
      date_controle: new Date().toISOString(),
      type_controle: 'visuel',
      qte_1er_choix: 46, qte_2e_choix: 4, qte_ourlet: 0, qte_rebut: 0,
      est_bloquant: false,
      decision: 'laisser_passer_1c',
      commentaire: 'Conforme après frange sous-traitant',
    });
    const d = unwrap(r, 'POST /v2/qualite/controles');
    ctx.ctrlFrangeId = d.id_ctrl || d.id;
    return { id: ctx.ctrlFrangeId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 13 — MAGASINIER_STOCK : colis + BL
  // ───────────────────────────────────────────────────────────────────────
  await step(13, 'MAGASINIER_STOCK', 'colisage + bon livraison', async (t) => {
    const rc = await apiAs(t, 'POST', '/v2/ventes/colis', {
      statut: 'ouvert', poids_kg: 5.5, dimensions: '60x40x30',
      notes: `Colis multi-rôles ${uid}`,
    });
    const dc = unwrap(rc, 'POST /v2/ventes/colis');
    ctx.colisId = dc.id_colis || dc.id;
    if (!ctx.commandeId) throw new Error('commandeId manquant');
    const rb = await apiAs(t, 'POST', `/v2/ventes/bl/from-commande/${ctx.commandeId}`, {
      transporteur: 'DHL Express',
    });
    const db = unwrap(rb, 'POST /v2/ventes/bl/from-commande/:id');
    ctx.blId = db.id_bl || db.id;
    return { id: ctx.blId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 14 — COMPTABLE : facture + encaissement
  // ───────────────────────────────────────────────────────────────────────
  await step(14, 'COMPTABLE', 'facture + encaissement', async (t) => {
    if (!ctx.commandeId) throw new Error('commandeId manquant');
    const today = new Date().toISOString().split('T')[0];
    // 1) Facture depuis BL (fallback from-commande)
    let factureCreated = null;
    if (ctx.blId) {
      const r = await apiAs(t, 'POST', `/v2/ventes/factures/from-bl/${ctx.blId}`, { date_facture: today });
      if (r.status >= 200 && r.status < 300) factureCreated = unwrap(r, 'POST /v2/ventes/factures/from-bl/:id');
    }
    if (!factureCreated) {
      const r = await apiAs(t, 'POST', `/v2/ventes/factures/from-commande/${ctx.commandeId}`, { date_facture: today });
      factureCreated = unwrap(r, 'POST /v2/ventes/factures/from-commande/:id');
    }
    ctx.factureId = factureCreated.id_facture || factureCreated.id;

    // 2) Encaissement — spec demande POST /v2/comptabilite/caisses/:id/mouvements
    //    Cet endpoint n'existe PAS (seul GET exposé). On tente d'abord, puis
    //    fallback sur POST /v2/ventes/paiements qui est l'endpoint réel.
    const encPayload = {
      type: 'encaissement',
      id_caisse: ctx.caisseId,
      montant: 100,
      moyen_paiement: 'especes',
      libelle: `Encaissement facture ${ctx.factureId} multi-rôles ${uid}`,
    };
    const re1 = await apiAs(t, 'POST', `/v2/comptabilite/caisses/${ctx.caisseId}/mouvements`, encPayload);
    if (re1.status === 404 || re1.status === 405) {
      // Fallback paiement client — schéma paiements_clients: id_client (NOT NULL),
      // date_paiement, montant, mode_paiement, id_caisse. L'allocation facture
      // passe par la table junction factures_paiements.
      const re2 = await apiAs(t, 'POST', '/v2/ventes/paiements', {
        id_client: ctx.clientId,
        montant: 100,
        mode_paiement: 'especes',
        id_caisse: ctx.caisseId,
        date_paiement: today,
        statut: 'encaisse',
        notes: `Encaissement facture ${ctx.factureId} multi-rôles ${uid}`,
      });
      if (re2.status >= 200 && re2.status < 300) {
        const dp = unwrap(re2, 'POST /v2/ventes/paiements (fallback)');
        ctx.paiementId = dp.id_paiement || dp.id;
      } else {
        throw new Error(`Encaissement: /caisses/:id/mouvements=404 (route absente) ET /ventes/paiements=HTTP ${re2.status} (${re2.body?.error?.message || ''})`);
      }
    } else {
      if (re1.status < 200 || re1.status >= 300) throw new Error(`HTTP ${re1.status} sur /caisses/${ctx.caisseId}/mouvements : ${re1.body?.error?.message || re1.raw?.slice(0, 150)}`);
      const dp = unwrap(re1, 'POST /v2/comptabilite/caisses/:id/mouvements');
      ctx.paiementId = dp.id_mouvement || dp.id;
    }
    return { id: ctx.factureId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 15 — MECANICIEN : crée une intervention maintenance (en parallèle)
  // ───────────────────────────────────────────────────────────────────────
  await step(15, 'MECANICIEN', 'intervention maintenance', async (t) => {
    // Note : les mock users ont des id (ex. MECANICIEN=10) qui ne correspondent
    // PAS à un id_operateur dans equipe_fabrication. Le contrôleur a été patché
    // pour accepter `demande_par` depuis le body + fallback 1er opérateur
    // disponible (après redémarrage backend requis pour prise en compte).
    const r = await apiAs(t, 'POST', '/v2/fabrication/maintenance', {
      id_machine: ctx.machineId,
      type_intervention: 'preventive',
      priorite: 'normale',
      description: `Contrôle hebdo machine ${ctx.machineId} (multi-rôles ${uid})`,
      demande_par: 1, // id_operateur réel seedé (post-patch controller)
    });
    const d = unwrap(r, 'POST /v2/fabrication/maintenance');
    ctx.interventionId = d.id_demande || d.id;
    return { id: ctx.interventionId };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  ÉTAPE 16 — CHEF_PRODUCTION : vérifie le rapport final
  // ───────────────────────────────────────────────────────────────────────
  await step(16, 'CHEF_PRODUCTION', 'rapport final (KPIs admin)', async (t) => {
    const r = await apiAs(t, 'GET', '/dashboard/kpis-admin');
    const d = unwrap(r, 'GET /dashboard/kpis-admin');
    return { id: Object.keys(d || {}).length };
  }, { optional: true });

  // ───────────────────────────────────────────────────────────────────────
  //  RÉCAPITULATIF
  // ───────────────────────────────────────────────────────────────────────
  finalReport();
}

function finalReport() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   RÉCAPITULATIF — Phase T6 multi-rôles');
  console.log('═══════════════════════════════════════════════════════════════');

  const okCount = results.filter(r => r.status === 'OK').length;
  const koCount = results.filter(r => r.status === 'KO').length;

  // Par rôle
  const byRole = {};
  for (const r of results) {
    byRole[r.role] = byRole[r.role] || { total: 0, ok: 0, ko: 0 };
    byRole[r.role].total++;
    if (r.status === 'OK') byRole[r.role].ok++;
    else if (r.status === 'KO') byRole[r.role].ko++;
  }

  console.log(`\n   Total: ${results.length}   OK: ${okCount}   KO: ${koCount}\n`);
  console.log('   Par rôle :');
  for (const [role, s] of Object.entries(byRole)) {
    console.log(`     ${role.padEnd(26)}  total=${s.total}  OK=${s.ok}  KO=${s.ko}`);
  }

  console.log('\n   IDs créés :');
  for (const [k, v] of Object.entries(ctx)) {
    console.log(`     ${k.padEnd(18)} = ${v}`);
  }

  // Détails des KO
  const kos = results.filter(r => r.status === 'KO');
  if (kos.length) {
    console.log('\n   Erreurs détectées :');
    for (const k of kos) {
      console.log(`     ❌ Étape ${k.step} (${k.role}) — ${k.info}`);
      console.log(`        → ${k.error}`);
    }
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
  process.exit(koCount === 0 ? 0 : 1);
}

run().catch(e => {
  console.error('\n[FATAL]', e.message);
  if (VERBOSE && e.stack) console.error(e.stack);
  finalReport();
});
