// service.js — ecommerce/sync
// Pousse articles / stock / prix vers un site e-commerce ; journalise dans ecommerce_sync_log.
// L'appel réel HTTP vers Shopify/Woo n'est pas branché ici : il faut un adapteur par plateforme.
// Ce service prépare le payload, mesure le temps, et écrit le log.
import { model } from './model.js';
import { service as sitesService } from '../sites/service.js';

/** Prépare le payload Shopify d'un article. */
function buildShopifyProductPayload(article, stockDispo) {
  return {
    product: {
      title:       article.designation,
      body_html:   article.designation,
      variants: [{
        sku:               article.code_article,
        price:             article.prix_vente_ht,
        barcode:           article.ean_13 || undefined,
        inventory_quantity: Math.floor(stockDispo),
        inventory_management: 'shopify',
      }],
      images: article.image_url_principale ? [{ src: article.image_url_principale }] : [],
      status: article.actif ? 'active' : 'draft',
    },
  };
}

/** Prépare le payload WooCommerce d'un article. */
function buildWooProductPayload(article, stockDispo) {
  return {
    name:               article.designation,
    sku:                article.code_article,
    regular_price:      String(article.prix_vente_ht || ''),
    manage_stock:       true,
    stock_quantity:     Math.floor(stockDispo),
    status:             article.actif ? 'publish' : 'draft',
    images:             article.image_url_principale ? [{ src: article.image_url_principale }] : [],
  };
}

export const service = {
  async list(opts)      { return model.list(opts); },
  async get(id)         { return model.findById(id); },
  async log(entry)      { return model.logEntry(entry); },

  /**
   * Prépare le payload et journalise (statut='ignore' tant qu'aucun adapteur HTTP n'est branché).
   * L'appel HTTP externe est laissé à un adapteur par plateforme (à créer selon besoin réel).
   */
  async pushArticle(idSite, idArticle, typeSync = 'produit_update') {
    const t0 = Date.now();
    const site    = await sitesService.getWithSecrets(idSite);
    if (!site)    { const e = new Error('Site introuvable'); e.code = 'SITE_INCONNU'; e.httpStatus = 404; throw e; }
    const article = await model.loadArticleForSync(idArticle);
    if (!article) { const e = new Error('Article introuvable'); e.code = 'ARTICLE_INCONNU'; e.httpStatus = 404; throw e; }
    const stock   = await model.loadStockDispo(idArticle);
    const payload = site.plateforme === 'shopify'
      ? buildShopifyProductPayload(article, stock)
      : site.plateforme === 'woocommerce'
      ? buildWooProductPayload(article, stock)
      : { article, stock };

    // TODO : brancher l'appel HTTP réel (fetch/axios) + parser la réponse.
    const entry = await model.logEntry({
      id_site: idSite,
      type_sync: typeSync,
      id_article: idArticle,
      reference_externe: article.code_article,
      payload_envoye_json: payload,
      reponse_recue_json: null,
      statut: 'ignore',
      erreur_message: 'Adapteur HTTP non branché — payload préparé seulement.',
      duree_ms: Date.now() - t0,
    });
    return { entry, payload };
  },

  /** MAJ stock uniquement (pour un article déjà synchronisé). */
  async pushStock(idSite, idArticle) {
    return this.pushArticle(idSite, idArticle, 'stock_update');
  },

  /** MAJ prix uniquement. */
  async pushPrix(idSite, idArticle) {
    return this.pushArticle(idSite, idArticle, 'prix_update');
  },

  /** Sync batch d'articles. */
  async pushBatch(idSite, ids) {
    const results = [];
    for (const id of ids) {
      try {
        const r = await this.pushArticle(idSite, id, 'batch');
        results.push({ id_article: id, ok: true, id_sync: r.entry.id_sync });
      } catch (err) {
        results.push({ id_article: id, ok: false, error: err.message });
      }
    }
    return { total: ids.length, success: results.filter((r) => r.ok).length, results };
  },
};

export default service;
