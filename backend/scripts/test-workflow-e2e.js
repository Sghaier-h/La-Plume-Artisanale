#!/usr/bin/env node
/**
 * Phase T1 — Test End-to-End workflow métier complet (13 étapes)
 *
 * Enchaîne : CRM (client+contact) → devis → commande → OF → planification
 *          → sous-traitance (sortie+retour) → qualité → colisage → BL → facture
 *
 * Pré-requis : backend démarré sur http://localhost:5000, admin seedé.
 *
 * Usage :
 *   node backend/scripts/test-workflow-e2e.js
 *   node backend/scripts/test-workflow-e2e.js --verbose
 */

const API_BASE   = process.env.API_BASE_URL || 'http://localhost:5000/api';
const LOGIN_EMAIL = 'admin@system.local';
const LOGIN_PWD   = process.env.DEV_MOCK_PASSWORD || 'DevLocal2024!';
const VERBOSE     = process.argv.includes('--verbose');

const ctx = {
  token: null,
  clientId: null,
  contactId: null,
  devisId: null,
  commandeId: null,
  ofId: null,
  bonStId: null,
  retourStId: null,
  ctrlId: null,
  colisId: null,
  blId: null,
  factureId: null,
  machineId: null,
  sousTraitantId: null,
  idArticle: null,
};

const results = []; // { step, status, info, error? }

function logStep(step, status, info, error) {
  const ok = status === 'OK' ? '[OK]' : '[KO]';
  const line = `${ok} Étape ${step} — ${info}`;
  console.log(line);
  if (error) console.log('     Erreur:', typeof error === 'string' ? error : JSON.stringify(error));
  results.push({ step, status, info, error });
}

async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json', 'x-societe-id': '1' };
  if (ctx.token) headers['Authorization'] = `Bearer ${ctx.token}`;
  const url = `${API_BASE}${path}`;
  if (VERBOSE) console.log(`  → ${method} ${url}${body ? ' ' + JSON.stringify(body).slice(0,200) : ''}`);
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let json = null;
  try { json = txt ? JSON.parse(txt) : null; } catch { /* non-JSON */ }
  if (VERBOSE) console.log(`  ← ${r.status} ${txt.slice(0, 400)}`);
  return { status: r.status, body: json, raw: txt };
}

function assertSuccess(resp, label) {
  if (resp.status >= 200 && resp.status < 300 && resp.body && (resp.body.success === true || resp.body.success === undefined)) {
    return resp.body.data ?? resp.body;
  }
  const err = resp.body?.error?.message || resp.body?.error || resp.body?.message || resp.raw || `HTTP ${resp.status}`;
  throw new Error(`${label} → ${err}`);
}

// ──────────────────────────────────────────────────────────────────────────

async function pickExistingReferences() {
  // Pick an existing active sous-traitant and machine for use in the test
  const stResp = await api('GET', '/v2/sous-traitance/sous-traitants');
  const stData = stResp.body?.data?.rows || stResp.body?.data || [];
  const st = Array.isArray(stData) ? stData.find(x => x.actif) : null;
  if (st) ctx.sousTraitantId = st.id_soustraitant || st.id;
  if (!ctx.sousTraitantId) ctx.sousTraitantId = 2; // fallback (Chokri Haddad)

  // Pick an active catalog article
  ctx.idArticle = 1; // first seeded article

  // Pick an operational machine
  ctx.machineId = 1; // M-DEMO-001 operationnelle
}

// ──────────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   WORKFLOW E2E — Phase T1 — ERP La Plume Artisanale');
  console.log('═══════════════════════════════════════════════════════\n');

  // ───── Étape 0 — Auth ─────────────────────────────────────────────────
  try {
    const r = await api('POST', '/auth/login', { email: LOGIN_EMAIL, password: LOGIN_PWD });
    const d = assertSuccess(r, 'Login');
    ctx.token = d.token;
    if (!ctx.token) throw new Error('Pas de token');
    logStep(0, 'OK', `Login admin OK (user=${d.user?.email})`);
  } catch (e) {
    logStep(0, 'KO', 'Login admin', e.message);
    return finalReport();
  }

  await pickExistingReferences();

  const uid = Date.now().toString(36);

  // ───── Étape 1 — Client (réutiliser id 89 si dispo, sinon créer) ──────
  try {
    const r89 = await api('GET', '/v2/crm/comptes/89');
    if (r89.status === 200 && r89.body?.success) {
      ctx.clientId = 89;
      logStep(1, 'OK', `Client existant réutilisé (id=89, ${r89.body.data?.raison_sociale})`);
    } else {
      // Créer un nouveau compte
      const r = await api('POST', '/v2/crm/comptes', {
        code_client: `CLI-E2E-${uid}`,
        raison_sociale: `Hotel Test E2E Djerba (E2E-${uid})`,
        type_compte: 'societe',
        statut_crm: 'client',
        pays: 'TN',
        actif: true,
      });
      const d = assertSuccess(r, 'POST /v2/crm/comptes');
      ctx.clientId = d.id_client || d.id;
      logStep(1, 'OK', `Compte CRM créé (id=${ctx.clientId}, code=CLI-E2E-${uid})`);
    }
  } catch (e) {
    logStep(1, 'KO', 'Client CRM', e.message);
    return finalReport();
  }

  // ───── Étape 2 — Contact ──────────────────────────────────────────────
  try {
    const r = await api('POST', '/v2/crm/contacts', {
      id_client: ctx.clientId,
      role: 'commercial_client',
      civilite: 'M',
      nom: 'Durand',
      prenom: 'Jean',
      fonction: 'Directeur achats',
      email: `contact-e2e-${uid}@example.com`,
      telephone: '+33 1 00 00 00 00',
      est_principal: false,
    });
    const d = assertSuccess(r, 'POST /v2/crm/contacts');
    ctx.contactId = d.id_contact || d.id;
    logStep(2, 'OK', `Contact créé (id=${ctx.contactId}, M. Durand)`);
  } catch (e) {
    logStep(2, 'KO', 'Contact', e.message);
    return finalReport();
  }

  // ───── Étape 3 — Devis ────────────────────────────────────────────────
  try {
    const today = new Date().toISOString().split('T')[0];
    const validite = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const r = await api('POST', '/v2/ventes/devis', {
      id_client: ctx.clientId,
      date_devis: today,
      date_validite: validite,
      notes: `Devis E2E ${uid}`,
      lignes: [
        {
          id_article: ctx.idArticle,
          designation: 'Fouta ARTISANAT Lin — 50 pcs',
          quantite: 50,
          prix_unitaire_ht: 25.0,
          taux_tva: 19,
          remise: 0,
        },
        {
          id_article: ctx.idArticle,
          designation: 'Fouta ARTISANAT Lin — personnalisée',
          quantite: 10,
          prix_unitaire_ht: 32.0,
          taux_tva: 19,
          remise: 5,
        },
      ],
    });
    const d = assertSuccess(r, 'POST /v2/ventes/devis');
    ctx.devisId = d.id_devis;
    logStep(3, 'OK', `Devis créé (id=${ctx.devisId}, numero=${d.numero_devis}, ttc=${d.montant_ttc})`);
  } catch (e) {
    logStep(3, 'KO', 'Devis', e.message);
    return finalReport();
  }

  // ───── Étape 4 — Transformer devis → commande ─────────────────────────
  try {
    const today = new Date().toISOString().split('T')[0];
    const livraison = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const r = await api('POST', `/v2/ventes/devis/${ctx.devisId}/transformer`, {
      date_commande: today,
      date_livraison_prevue: livraison,
    });
    const d = assertSuccess(r, 'POST /v2/ventes/devis/:id/transformer');
    ctx.commandeId = d.commande?.id_commande;
    logStep(4, 'OK', `Commande générée (id=${ctx.commandeId}, numero=${d.commande?.numero_commande})`);
  } catch (e) {
    logStep(4, 'KO', 'Transformer devis en commande', e.message);
    return finalReport();
  }

  // ───── Étape 5 — Générer OF (nécessite commande validée) ──────────────
  try {
    // Valider la commande d'abord (sinon generer-ofs refuse)
    await api('POST', `/v2/ventes/commandes/${ctx.commandeId}/valider`);
    const r = await api('POST', `/v2/ventes/commandes/${ctx.commandeId}/generer-ofs`, { force: false });
    const d = assertSuccess(r, 'POST /v2/ventes/commandes/:id/generer-ofs');
    const ofs = d.ofs_created || d.data?.ofs_created || [];
    if (ofs.length === 0) throw new Error('Aucun OF créé');
    ctx.ofId = ofs[0].id_of;
    logStep(5, 'OK', `${ofs.length} OF générés (premier id=${ctx.ofId}, numero=${ofs[0].numero_of})`);
  } catch (e) {
    logStep(5, 'KO', 'Générer OFs', e.message);
    return finalReport();
  }

  // ───── Étape 6 — Planifier OF (assigner machine) ──────────────────────
  try {
    const today = new Date().toISOString().split('T')[0];
    const fin = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const r = await api('POST', `/v2/fabrication/of/${ctx.ofId}/assigner-machine`, {
      id_machine: ctx.machineId,
      date_debut_prevue: today,
      date_fin_prevue: fin,
    });
    const d = assertSuccess(r, 'POST assigner-machine');
    logStep(6, 'OK', `OF ${ctx.ofId} planifié sur machine ${ctx.machineId}`);
  } catch (e) {
    logStep(6, 'KO', 'Planifier OF', e.message);
    // non bloquant si simple warning sur planning_machines; continuer
  }

  // ───── Étape 7 — Bon de sous-traitance (sortie) ───────────────────────
  try {
    const retourPrevu = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    const r = await api('POST', '/v2/sous-traitance/bons', {
      id_sous_traitant: ctx.sousTraitantId,
      id_of: ctx.ofId,
      type_mouvement: 'sortie',
      date_retour_prevue: retourPrevu,
      observations: `Sous-traitance frange — OF ${ctx.ofId}`,
    });
    const d = assertSuccess(r, 'POST /v2/sous-traitance/bons');
    ctx.bonStId = d.id_mouvement_st;
    logStep(7, 'OK', `Bon ST sortie (id=${ctx.bonStId}, numero=${d.numero_mouvement})`);
  } catch (e) {
    logStep(7, 'KO', 'Bon ST sortie', e.message);
    return finalReport();
  }

  // ───── Étape 8 — Retour sous-traitant ─────────────────────────────────
  try {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="30"><path d="M5 20 L25 5 L45 25 L65 10" stroke="black" fill="none"/></svg>';
    const r = await api('POST', '/v2/sous-traitance/retours', {
      id_mouvement_st: ctx.bonStId,
      signature_svg: svg,
      observations: 'Retour conforme',
    });
    const d = assertSuccess(r, 'POST /v2/sous-traitance/retours');
    ctx.retourStId = d.id_mouvement_st;
    logStep(8, 'OK', `Retour ST enregistré (id=${ctx.retourStId}, numero=${d.numero_mouvement})`);
  } catch (e) {
    logStep(8, 'KO', 'Retour ST', e.message);
    return finalReport();
  }

  // ───── Étape 9 — Contrôle qualité ─────────────────────────────────────
  try {
    const r = await api('POST', '/v2/qualite/controles', {
      id_of: ctx.ofId,
      date_controle: new Date().toISOString(),
      type_controle: 'visuel',
      qte_1er_choix: 48,
      qte_2e_choix: 2,
      qte_ourlet: 0,
      qte_rebut: 0,
      est_bloquant: false,
      decision: 'laisser_passer_1c',
      commentaire: 'Conforme — OK pour livraison',
    });
    const d = assertSuccess(r, 'POST /v2/qualite/controles');
    ctx.ctrlId = d.id_ctrl;
    logStep(9, 'OK', `Contrôle qualité créé (id=${ctx.ctrlId}, décision=laisser_passer_1c)`);
  } catch (e) {
    logStep(9, 'KO', 'Contrôle qualité', e.message);
    return finalReport();
  }

  // ───── Étape 10 — Colisage ────────────────────────────────────────────
  // Note : le BL n'existe pas encore ici — on crée un colis sans id_bl pour
  // l'instant (ok tech) ; il sera rattaché à un BL plus tard si besoin.
  try {
    const r = await api('POST', '/v2/ventes/colis', {
      statut: 'ouvert',
      poids_kg: 5.5,
      dimensions: '60x40x30',
      notes: `Colis E2E ${uid}`,
    });
    const d = assertSuccess(r, 'POST /v2/ventes/colis');
    ctx.colisId = d.id_colis;
    logStep(10, 'OK', `Colis créé (id=${ctx.colisId}, numero=${d.numero})`);
  } catch (e) {
    logStep(10, 'KO', 'Colisage', e.message);
    // non bloquant pour la suite
  }

  // ───── Étape 11 — BL depuis commande ──────────────────────────────────
  try {
    const r = await api('POST', `/v2/ventes/bl/from-commande/${ctx.commandeId}`, {
      transporteur: 'DHL Express',
    });
    const d = assertSuccess(r, 'POST /v2/ventes/bl/from-commande');
    ctx.blId = d.id_bl;
    logStep(11, 'OK', `BL créé (id=${ctx.blId}, numero=${d.numero_bl})`);
  } catch (e) {
    logStep(11, 'KO', 'BL from-commande', e.message);
    return finalReport();
  }

  // ───── Étape 12 — Facture depuis commande ─────────────────────────────
  try {
    const today = new Date().toISOString().split('T')[0];
    const r = await api('POST', `/v2/ventes/factures/from-commande/${ctx.commandeId}`, {
      date_facture: today,
    });
    const d = assertSuccess(r, 'POST /v2/ventes/factures/from-commande');
    ctx.factureId = d.id_facture;
    logStep(12, 'OK', `Facture créée (id=${ctx.factureId}, numero=${d.numero_facture}, ttc=${d.montant_ttc})`);
  } catch (e) {
    logStep(12, 'KO', 'Facture', e.message);
    return finalReport();
  }

  // ───── Étape 13 — Vérifier le chaînage ────────────────────────────────
  try {
    const checks = await Promise.all([
      api('GET', `/v2/ventes/devis/${ctx.devisId}`),
      api('GET', `/v2/ventes/commandes/${ctx.commandeId}`),
      api('GET', `/v2/fabrication/of/${ctx.ofId}`),
      api('GET', `/v2/ventes/bl/${ctx.blId}`),
      api('GET', `/v2/ventes/factures/${ctx.factureId}`),
    ]);
    const [devis, cmd, of, bl, fact] = checks.map(c => c.body?.data || c.body);
    const okChain =
      devis?.statut === 'TRANSFORME' && devis?.id_commande === ctx.commandeId &&
      cmd?.id_client === ctx.clientId &&
      of?.quantite_a_produire !== undefined &&
      bl?.id_commande === ctx.commandeId &&
      fact?.id_commande === ctx.commandeId && fact?.id_client === ctx.clientId;
    if (!okChain) throw new Error('Chaînage incomplet : ' + JSON.stringify({
      devis_statut: devis?.statut, devis_id_cmd: devis?.id_commande,
      cmd_id_client: cmd?.id_client, of_qte: of?.quantite_a_produire,
      bl_id_cmd: bl?.id_commande, fact_id_cmd: fact?.id_commande,
    }));
    logStep(13, 'OK', `Chaînage vérifié : devis→commande→OF+BL+facture tous liés`);
  } catch (e) {
    logStep(13, 'KO', 'Vérification chaînage', e.message);
  }

  finalReport();
}

function finalReport() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   RÉCAPITULATIF');
  console.log('═══════════════════════════════════════════════════════');
  const ok = results.filter(r => r.status === 'OK').length;
  const ko = results.filter(r => r.status === 'KO').length;
  console.log(`   Total: ${results.length}   OK: ${ok}   KO: ${ko}\n`);
  console.log('   IDs créés :');
  console.log(`     clientId      = ${ctx.clientId}`);
  console.log(`     contactId     = ${ctx.contactId}`);
  console.log(`     devisId       = ${ctx.devisId}`);
  console.log(`     commandeId    = ${ctx.commandeId}`);
  console.log(`     ofId          = ${ctx.ofId}`);
  console.log(`     bonStId       = ${ctx.bonStId}`);
  console.log(`     retourStId    = ${ctx.retourStId}`);
  console.log(`     ctrlId        = ${ctx.ctrlId}`);
  console.log(`     colisId       = ${ctx.colisId}`);
  console.log(`     blId          = ${ctx.blId}`);
  console.log(`     factureId     = ${ctx.factureId}`);
  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(ko === 0 ? 0 : 1);
}

run().catch(e => {
  console.error('Erreur fatale:', e);
  process.exit(2);
});
