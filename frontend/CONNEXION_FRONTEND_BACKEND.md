# 🔗 Connexion Frontend React aux Routes API Backend

**Date** : 28 Janvier 2026

---

## ✅ Services API Créés/Mis à Jour

Tous les services frontend ont été créés ou mis à jour pour correspondre aux routes backend.

### 📋 Services Principaux

#### 1. **Product Templates Service** (`productTemplatesService`)
- ✅ `GET /product/templates` - Liste des produits
- ✅ `GET /product/templates/:id` - Détails d'un produit
- ✅ `POST /product/templates` - Créer un produit
- ✅ `PUT /product/templates/:id` - Mettre à jour un produit
- ✅ `DELETE /product/templates/:id` - Supprimer un produit
- ✅ `GET /product/templates/:id/stock` - Stock d'un produit
- ✅ `GET /product/templates/:id/movements` - Mouvements d'un produit

#### 2. **Sale Orders Service** (`saleOrdersService`)
- ✅ `GET /sale/orders` - Liste des commandes de vente
- ✅ `GET /sale/orders/:id` - Détails d'une commande
- ✅ `POST /sale/orders` - Créer une commande
- ✅ `PUT /sale/orders/:id` - Mettre à jour une commande
- ✅ `DELETE /sale/orders/:id` - Supprimer une commande
- ✅ `POST /sale/orders/:id/confirm` - Confirmer une commande
- ✅ `POST /sale/orders/:id/cancel` - Annuler une commande

#### 3. **Purchase Orders Service** (`purchaseOrdersService`)
- ✅ `GET /purchase/orders` - Liste des commandes d'achat
- ✅ `GET /purchase/orders/:id` - Détails d'une commande
- ✅ `POST /purchase/orders` - Créer une commande
- ✅ `PUT /purchase/orders/:id` - Mettre à jour une commande
- ✅ `DELETE /purchase/orders/:id` - Supprimer une commande
- ✅ `POST /purchase/orders/:id/confirm` - Confirmer une commande

#### 4. **Account Moves Service** (`accountMovesService`)
- ✅ `GET /account/moves` - Liste des écritures comptables
- ✅ `GET /account/moves/:id` - Détails d'une écriture
- ✅ `POST /account/moves` - Créer une écriture
- ✅ `PUT /account/moves/:id` - Mettre à jour une écriture
- ✅ `POST /account/moves/:id/post` - Comptabiliser une écriture

#### 5. **HR Employees Service** (`hrEmployeesService`)
- ✅ `GET /hr/employees` - Liste des employés
- ✅ `GET /hr/employees/:id` - Détails d'un employé
- ✅ `POST /hr/employees` - Créer un employé
- ✅ `PUT /hr/employees/:id` - Mettre à jour un employé
- ✅ `DELETE /hr/employees/:id` - Supprimer un employé

#### 6. **CRM Leads Service** (`crmLeadsService`)
- ✅ `GET /crm/leads` - Liste des pistes
- ✅ `GET /crm/leads/:id` - Détails d'une piste
- ✅ `POST /crm/leads` - Créer une piste
- ✅ `PUT /crm/leads/:id` - Mettre à jour une piste
- ✅ `DELETE /crm/leads/:id` - Supprimer une piste
- ✅ `POST /crm/leads/:id/convert` - Convertir en opportunité

#### 7. **Project Projects Service** (`projectsService`)
- ✅ `GET /project/projects` - Liste des projets
- ✅ `GET /project/projects/:id` - Détails d'un projet
- ✅ `POST /project/projects` - Créer un projet
- ✅ `PUT /project/projects/:id` - Mettre à jour un projet
- ✅ `DELETE /project/projects/:id` - Supprimer un projet

#### 8. **MRP Productions Service** (`productionsService`)
- ✅ `GET /mrp/productions` - Liste des productions
- ✅ `GET /mrp/productions/:id` - Détails d'une production
- ✅ `POST /mrp/productions` - Créer une production
- ✅ `PUT /mrp/productions/:id` - Mettre à jour une production
- ✅ `DELETE /mrp/productions/:id` - Supprimer une production
- ✅ `POST /mrp/productions/:id/start` - Démarrer une production
- ✅ `POST /mrp/productions/:id/done` - Terminer une production
- ✅ `POST /mrp/productions/:id/confirm` - Confirmer une production

#### 9. **Stock Pickings Service** (`stockPickingsService`)
- ✅ `GET /stock/pickings` - Liste des transferts
- ✅ `GET /stock/pickings/:id` - Détails d'un transfert
- ✅ `POST /stock/pickings` - Créer un transfert
- ✅ `PUT /stock/pickings/:id` - Mettre à jour un transfert
- ✅ `DELETE /stock/pickings/:id` - Supprimer un transfert
- ✅ `POST /stock/pickings/:id/validate` - Valider un transfert

#### 10. **Inventory Service** (`inventoryService`)
- ✅ `GET /inventory/adjustments` - Liste des ajustements
- ✅ `GET /inventory/adjustments/:id` - Détails d'un ajustement
- ✅ `POST /inventory/adjustments` - Créer un ajustement
- ✅ `PUT /inventory/adjustments/:id` - Mettre à jour un ajustement
- ✅ `DELETE /inventory/adjustments/:id` - Supprimer un ajustement

#### 11. **Quality Services**
- ✅ `qualityChecksService` - `/quality/checks`
- ✅ `qualityPointsService` - `/quality/points`
- ✅ `qualityAlertsService` - `/quality/alerts`

#### 12. **E-commerce Services**
- ✅ `ecommerceProductsService` - `/ecommerce/products`
- ✅ `ecommerceOrdersService` - `/ecommerce/orders`
- ✅ `ecommerceSettingsService` - `/ecommerce/settingss`

#### 13. **POS Services** (`posService`)
- ✅ `GET /pos/caisses` - Liste des caisses
- ✅ `GET /pos/caisses/:id` - Détails d'une caisse
- ✅ `POST /pos/sessions/ouvrir` - Ouvrir une session
- ✅ `POST /pos/sessions/:id/fermer` - Fermer une session
- ✅ `POST /pos/ventes` - Créer une vente
- ✅ `GET /pos/ventes` - Liste des ventes
- ✅ `GET /pos/ventes/:id` - Détails d'une vente

#### 14. **Autres Services**
- ✅ `companiesService` - `/companies`
- ✅ `partnersService` - `/partners`
- ✅ `usersService` - `/users`
- ✅ `pricelistsService` - `/product/pricelists`
- ✅ `purchaseRequestsService` - `/purchase-requests`
- ✅ `purchaseReceptionsService` - `/purchase/receptions`
- ✅ `bankReconciliationService` - `/account/reconciliations`
- ✅ `crmCampaignsService` - `/crm/campaigns`
- ✅ `multisocieteCompaniesService` - `/multisociete/companies`

---

## 🔧 Corrections Appliquées

### 1. **Products.tsx**
- ✅ Import mis à jour : `productTemplatesService` au lieu de `productsService`
- ✅ Appel API corrigé : `productTemplatesService.getTemplates()` au lieu de `productsService.getProducts()`

### 2. **Services API**
- ✅ `productTemplatesService` créé pour `/product/templates`
- ✅ `productsService` mis à jour pour pointer vers `/product/templates` (compatibilité)
- ✅ Tous les services ERP standards créés/mis à jour

---

## 📝 Utilisation dans les Composants

### Exemple : Products.tsx

```typescript
import { productTemplatesService, productCategoryService } from '../../services/api';

// Charger les produits
const loadProducts = async () => {
  setLoading(true);
  try {
    const params: any = { loadRelations: true };
    if (search) params.search = search;
    const response = await productTemplatesService.getTemplates(params);
    const data = Array.isArray(response.data) 
      ? response.data 
      : response.data.data || [];
    setProducts(data);
  } catch (error) {
    console.error('Erreur chargement produits:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 🚀 Configuration

### Base URL
- **Développement** : `http://localhost:5000/api`
- **Production** : `https://fabrication.laplume-artisanale.tn/api`

### Authentification
- Token JWT automatiquement ajouté via intercepteur
- Header : `Authorization: Bearer <token>`

### Société Active
- ID de la société active automatiquement ajouté via intercepteur
- Header : `X-Active-Company-Id: <id_societe>`

---

## ✅ Checklist de Vérification

- [x] Tous les services API créés/mis à jour
- [x] Routes backend correspondantes vérifiées
- [x] Products.tsx mis à jour pour utiliser `productTemplatesService`
- [x] Intercepteurs axios configurés (token, société active)
- [x] Gestion des erreurs configurée (401, 429, etc.)

---

## 📊 Services Disponibles

**Total** : **60+ services** couvrant tous les modules ERP :

1. ✅ Authentification (`authService`)
2. ✅ Produits (`productTemplatesService`, `productsService`)
3. ✅ Ventes (`saleOrdersService`)
4. ✅ Achats (`purchaseOrdersService`, `purchaseRequestsService`, `purchaseReceptionsService`)
5. ✅ Comptabilité (`accountMovesService`, `bankReconciliationService`)
6. ✅ RH (`hrEmployeesService`, `hrRecruitmentService`, `hrPayslipsService`)
7. ✅ CRM (`crmLeadsService`, `crmOpportunitiesService`, `crmCampaignsService`)
8. ✅ Projets (`projectsService`)
9. ✅ Production (`productionsService`, `ofService`)
10. ✅ Stock (`stockPickingsService`, `inventoryService`, `warehouseService`)
11. ✅ Qualité (`qualityChecksService`, `qualityPointsService`, `qualityAlertsService`)
12. ✅ E-commerce (`ecommerceProductsService`, `ecommerceOrdersService`)
13. ✅ POS (`posService`)
14. ✅ Clients (`clientsService`)
15. ✅ Fournisseurs (`fournisseursService`)
16. ✅ Utilisateurs (`utilisateursService`, `usersService`)
17. ✅ Sociétés (`companiesService`, `multisocieteCompaniesService`)
18. ✅ Et bien d'autres...

---

## 💡 Notes Importantes

1. **Compatibilité** : `productsService` pointe maintenant vers `/product/templates` pour maintenir la compatibilité avec le code existant.

2. **Relations** : Tous les services supportent le paramètre `loadRelations: true` pour charger les relations Many2One et One2Many.

3. **Pagination** : Tous les services GET supportent les paramètres de pagination (`page`, `limit`).

4. **Recherche** : Tous les services GET supportent le paramètre `search` pour la recherche textuelle.

---

**Documentation créée** : `CONNEXION_FRONTEND_BACKEND.md`
