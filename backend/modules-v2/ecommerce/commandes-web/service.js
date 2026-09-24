// service.js — ecommerce/commandes-web
// Réception webhook Shopify/Woo, validation HMAC, conversion en commande ERP.
import crypto from 'crypto';
import { model, baseService, withTransaction } from './model.js';
import { verifyShopifyHmac, verifyWooHmac } from '../../_shared/crypto.js';
import { service as sitesService } from '../sites/service.js';

/** Normalise un payload Shopify → structure interne. */
function parseShopify(payload) {
  return {
    reference_externe: String(payload.id || payload.order_number || payload.name || ''),
    email:             payload.email || payload.contact_email || null,
    telephone:         payload.phone || payload.customer?.phone || null,
    nom:               [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(' ') || null,
    total_ttc:         parseFloat(payload.total_price || payload.current_total_price || 0),
    devise:            (payload.currency || 'TND').toUpperCase().slice(0, 3),
    date_commande:     payload.created_at ? new Date(payload.created_at) : new Date(),
  };
}

/** Normalise un payload WooCommerce → structure interne. */
function parseWoo(payload) {
  return {
    reference_externe: String(payload.id || payload.number || ''),
    email:             payload.billing?.email || null,
    telephone:         payload.billing?.phone || null,
    nom:               [payload.billing?.first_name, payload.billing?.last_name].filter(Boolean).join(' ') || null,
    total_ttc:         parseFloat(payload.total || 0),
    devise:            (payload.currency || 'TND').toUpperCase().slice(0, 3),
    date_commande:     payload.date_created ? new Date(payload.date_created) : new Date(),
  };
}

export const service = {
  ...baseService,

  /** Réception webhook — plateforme = 'shopify' | 'woocommerce'. */
  async receiveWebhook({ siteCode, plateforme, rawBody, headers, ip }) {
    const site = await sitesService.getByCodeWithSecrets(siteCode);
    if (!site) { const e = new Error(`Site "${siteCode}" introuvable`); e.code = 'SITE_INCONNU'; e.httpStatus = 404; throw e; }
    if (!site.actif) { const e = new Error('Site désactivé'); e.code = 'SITE_INACTIF'; e.httpStatus = 403; throw e; }

    // 1) Validation HMAC
    const secret = site.webhook_secret;
    let signature, ok;
    if (plateforme === 'shopify') {
      signature = headers['x-shopify-hmac-sha256'] || headers['X-Shopify-Hmac-Sha256'];
      ok = verifyShopifyHmac(rawBody, signature, secret);
    } else if (plateforme === 'woocommerce') {
      signature = headers['x-wc-webhook-signature'] || headers['X-WC-Webhook-Signature'];
      ok = verifyWooHmac(rawBody, signature, secret);
    } else {
      const e = new Error(`Plateforme non supportée : ${plateforme}`); e.code = 'PLATEFORME_INCONNUE'; e.httpStatus = 400; throw e;
    }
    if (!ok) { const e = new Error('Signature HMAC invalide'); e.code = 'HMAC_INVALIDE'; e.httpStatus = 401; throw e; }

    // 2) Parse payload
    let payload;
    try { payload = JSON.parse(rawBody.toString('utf8')); }
    catch { const e = new Error('Payload JSON invalide'); e.code = 'PAYLOAD_INVALIDE'; e.httpStatus = 400; throw e; }

    const parsed = plateforme === 'shopify' ? parseShopify(payload) : parseWoo(payload);
    if (!parsed.reference_externe) {
      const e = new Error('Référence externe absente du payload'); e.code = 'REF_MANQUANTE'; e.httpStatus = 422; throw e;
    }

    // 3) Idempotence
    const existante = await model.findByReference(site.id_site, parsed.reference_externe);
    if (existante) return { alreadyReceived: true, commande_web: existante };

    // 4) Persistance en statut 'reçue'
    const hashHmac = crypto.createHash('sha256').update(rawBody).digest('hex');
    const cmdWeb = await baseService.create({
      id_site:            site.id_site,
      reference_externe:  parsed.reference_externe,
      canal:              site.canal === 'B2B' ? 'B2B' : (site.canal === 'personnalisation' ? 'personnalisation' : 'B2C'),
      email_client:       parsed.email,
      telephone_client:   parsed.telephone,
      payload_json:       payload,
      total_ttc:          parsed.total_ttc,
      devise:             parsed.devise,
      statut_web:         'reçue',
      hash_hmac:          hashHmac,
      ip_source:          ip || null,
      date_commande_web:  parsed.date_commande,
    });

    return { alreadyReceived: false, commande_web: cmdWeb, parsed };
  },

  /**
   * Convertit une commande_web reçue en commande ERP.
   * Crée le compte CRM si nouveau, insère la commande ERP minimale, met à jour statut_web.
   */
  async convertirEnCommandeErp(idCommandeWeb, userId) {
    const cmdWeb = await model.findById(idCommandeWeb);
    if (!cmdWeb) { const e = new Error('Commande web introuvable'); e.code = 'NOT_FOUND'; e.httpStatus = 404; throw e; }
    if (cmdWeb.statut_web === 'importee' && cmdWeb.id_commande_erp) {
      return { deja_importee: true, commande_web: cmdWeb };
    }

    try {
      const result = await withTransaction(async (tx) => {
        let idCompte = cmdWeb.id_compte;
        if (!idCompte && cmdWeb.email_client) {
          const found = await model.findCompteByEmail(cmdWeb.email_client);
          idCompte = found?.id_compte || null;
        }
        if (!idCompte) {
          const payload = cmdWeb.payload_json || {};
          idCompte = await model.createCompteFromWeb({
            nom:       payload.customer ? `${payload.customer.first_name || ''} ${payload.customer.last_name || ''}`.trim() : null,
            email:     cmdWeb.email_client,
            telephone: cmdWeb.telephone_client,
            canal:     cmdWeb.canal,
          }, tx);
        }
        const idCommandeErp = await model.insertCommandeErp(cmdWeb, idCompte, tx);
        return { idCompte, idCommandeErp };
      });

      const updated = await model.setStatut(idCommandeWeb, 'importee', {
        id_commande_erp: result.idCommandeErp,
        dateImportErp:   new Date(),
      });
      return { deja_importee: false, commande_web: updated, id_compte: result.idCompte, id_commande_erp: result.idCommandeErp };
    } catch (err) {
      await model.setStatut(idCommandeWeb, 'erreur', { erreur: err.message });
      throw err;
    }
  },
};

export default service;
