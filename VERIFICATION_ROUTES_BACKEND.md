# Vérification des Routes Backend

## Résumé

Vérification complète des routes backend pour correspondre aux services frontend.

## Routes créées/mises à jour

### 1. Product Pricelists
- **Routes**: `/api/product/pricelists`
- **Fichier**: `backend/modules/product/routes/product_pricelist.routes.js`
- **Contrôleur**: `backend/modules/product/controllers/product_pricelist.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

### 2. Companies
- **Routes**: `/api/companies`
- **Fichier**: `backend/modules/multisociete/routes/companies.routes.js`
- **Contrôleur**: `backend/modules/multisociete/controllers/companies.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

### 3. Purchase Requests
- **Routes**: `/api/purchase-requests`
- **Fichier**: `backend/modules/purchase-requests/routes/purchase-requests.routes.js`
- **Contrôleur**: Mis à jour avec `validate`, `reject`, et routes pour `lignes`
- **Nouvelles routes**:
  - `POST /api/purchase-requests/:id/validate`
  - `POST /api/purchase-requests/:id/reject`
  - `GET /api/purchase-requests/:id/lignes`
  - `POST /api/purchase-requests/:id/lignes`
  - `PUT /api/purchase-requests/:id/lignes/:lineId`
  - `DELETE /api/purchase-requests/:id/lignes/:lineId`

### 4. Purchase Receptions
- **Routes**: `/api/purchase/receptions`
- **Fichier**: `backend/modules/purchase/routes/purchase_reception.routes.js`
- **Contrôleur**: `backend/modules/purchase/controllers/purchase_reception.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

### 5. Bank Reconciliation
- **Routes**: `/api/account/reconciliations`
- **Fichier**: `backend/modules/account/routes/account_reconciliation.routes.js`
- **Contrôleur**: `backend/modules/account/controllers/account_reconciliation.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

### 6. CRM Campaigns
- **Routes**: `/api/crm/campaigns`
- **Fichier**: `backend/modules/crm/routes/crm_campaign.routes.js`
- **Contrôleur**: `backend/modules/crm/controllers/crm_campaign.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

### 7. POS
- **Routes**:
  - `/api/pos/caisses`
  - `/api/pos/sessions`
  - `/api/pos/ventes`
- **Fichiers**:
  - `backend/modules/pos/routes/pos_caisse.routes.js`
  - `backend/modules/pos/routes/pos_session.routes.js`
  - `backend/modules/pos/routes/pos_vente.routes.js`
- **Contrôleurs**:
  - `backend/modules/pos/controllers/pos_caisse.controller.js`
  - `backend/modules/pos/controllers/pos_session.controller.js`
  - `backend/modules/pos/controllers/pos_vente.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

### 8. E-commerce
- **Routes**:
  - `/api/ecommerce/products`
  - `/api/ecommerce/orders`
  - `/api/ecommerce/settings`
- **Fichiers**:
  - `backend/modules/ecommerce/routes/ecommerce_product.routes.js`
  - `backend/modules/ecommerce/routes/ecommerce_order.routes.js`
  - `backend/modules/ecommerce/routes/ecommerce_settings.routes.js`
- **Contrôleurs**:
  - `backend/modules/ecommerce/controllers/ecommerce_product.controller.js`
  - `backend/modules/ecommerce/controllers/ecommerce_order.controller.js`
  - `backend/modules/ecommerce/controllers/ecommerce_settings.controller.js`
- **Manifest**: Mis à jour pour inclure les nouvelles routes

## Notes importantes

1. **Chargement des routes**: Le serveur (`server.js`) charge automatiquement les routes depuis les manifests des modules. Les nouvelles routes seront chargées au redémarrage du serveur.

2. **Mapping des chemins**: Le serveur convertit automatiquement les noms de fichiers de routes en chemins API. Par exemple:
   - `product_pricelist.routes.js` → `/api/product/pricelists`
   - `pos_caisse.routes.js` → `/api/pos/caisses`

3. **Authentification**: Toutes les routes utilisent `authMiddleware` pour l'authentification.

4. **Relations**: Les contrôleurs supportent le paramètre `loadRelations` pour charger les relations automatiquement.

## Prochaines étapes

1. Tester toutes les routes avec Postman ou un client HTTP
2. Vérifier que les routes correspondent exactement aux services frontend
3. Ajouter les mappings de tables manquants dans `TableMapping.js` si nécessaire
4. Implémenter les fonctionnalités manquantes dans les contrôleurs (actuellement certains retournent "Non implémenté")
