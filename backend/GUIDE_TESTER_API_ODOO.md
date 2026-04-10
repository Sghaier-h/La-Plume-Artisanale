# 🧪 Guide : Comment Tester les API Odoo

**Date :** 20 janvier 2026  
**Version :** 1.0

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Obtenir un Token d'Authentification](#obtenir-un-token-dauthentification)
3. [Tester les API avec curl](#tester-les-api-avec-curl)
4. [Tester avec Postman](#tester-avec-postman)
5. [Tester avec le Frontend](#tester-avec-le-frontend)
6. [Exemples Pratiques](#exemples-pratiques)

---

## 🔧 Prérequis

### 1. Serveur Démarré
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm start
```

Le serveur doit afficher :
```
✅ Modules Odoo chargés
🚀 Serveur démarré sur le port 5000
```

### 2. Base de Données Connectée
Vérifier que la base de données PostgreSQL est accessible :
- Host: localhost (ou votre serveur)
- Port: 5433
- Database: ERP_La_Plume

---

## 🔐 Obtenir un Token d'Authentification

### Option 1 : Via l'API d'Authentification Existante

```bash
# Login pour obtenir un token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre_email@example.com",
    "password": "votre_mot_de_passe"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

### Option 2 : Mode Développement (Mock Auth)

Si vous êtes en mode développement, vous pouvez utiliser un token mock :

```bash
# Créer un token simple pour les tests
# Le serveur acceptera n'importe quel token valide en mode dev
```

---

## 🧪 Tester les API avec curl

### 1. Commandes de Vente (Sale Order)

#### Lister toutes les commandes
```bash
curl http://localhost:5000/api/odoo/sale.order \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Obtenir une commande spécifique
```bash
curl http://localhost:5000/api/odoo/sale.order/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Créer une nouvelle commande
```bash
curl -X POST http://localhost:5000/api/odoo/sale.order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "SO001",
    "partner_id": 1,
    "state": "draft",
    "date_order": "2026-01-20T10:00:00Z"
  }'
```

#### Mettre à jour une commande
```bash
curl -X PUT http://localhost:5000/api/odoo/sale.order/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "state": "sale",
    "amount_total": 1500.00
  }'
```

#### Confirmer une commande
```bash
curl -X POST http://localhost:5000/api/odoo/sale.order/1/confirm \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Supprimer une commande
```bash
curl -X DELETE http://localhost:5000/api/odoo/sale.order/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

### 2. Produits (Product Template)

#### Lister tous les produits
```bash
curl http://localhost:5000/api/odoo/product.template \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Créer un produit
```bash
curl -X POST http://localhost:5000/api/odoo/product.template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "Produit Test",
    "default_code": "PROD001",
    "list_price": 100.00,
    "type": "product",
    "categ_id": 1
  }'
```

---

### 3. Livraisons (Stock Picking)

#### Lister les livraisons
```bash
curl http://localhost:5000/api/odoo/stock.picking \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Créer une livraison
```bash
curl -X POST http://localhost:5000/api/odoo/stock.picking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "WH/OUT/001",
    "picking_type_id": 1,
    "location_id": 8,
    "location_dest_id": 3,
    "state": "draft"
  }'
```

---

### 4. Ordres de Fabrication (MRP Production)

#### Lister les ordres de fabrication
```bash
curl http://localhost:5000/api/odoo/mrp.production \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Créer un ordre de fabrication
```bash
curl -X POST http://localhost:5000/api/odoo/mrp.production \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "MO/001",
    "product_id": 1,
    "product_qty": 10,
    "state": "draft"
  }'
```

---

### 5. Factures (Account Move)

#### Lister les factures
```bash
curl http://localhost:5000/api/odoo/account.move \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Créer une facture client
```bash
curl -X POST http://localhost:5000/api/odoo/account.move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "move_type": "out_invoice",
    "partner_id": 1,
    "invoice_date": "2026-01-20",
    "amount_total": 1200.00
  }'
```

---

### 6. Commandes d'Achat (Purchase Order)

#### Lister les commandes d'achat
```bash
curl http://localhost:5000/api/odoo/purchase.order \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

#### Créer une commande d'achat
```bash
curl -X POST http://localhost:5000/api/odoo/purchase.order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "PO001",
    "partner_id": 1,
    "state": "draft",
    "amount_total": 500.00
  }'
```

---

## 📮 Tester avec Postman

### 1. Créer une Collection Postman

1. Ouvrir Postman
2. Créer une nouvelle Collection : "La Plume Odoo API"
3. Ajouter une variable d'environnement : `base_url` = `http://localhost:5000`
4. Ajouter une variable : `token` = (votre token)

### 2. Configurer l'Authentification

Dans les paramètres de la Collection :
- Type : Bearer Token
- Token : `{{token}}`

### 3. Créer des Requêtes

Exemples de requêtes à créer :

**GET - Lister les commandes**
- Method: GET
- URL: `{{base_url}}/api/odoo/sale.order`
- Headers: `Authorization: Bearer {{token}}`

**POST - Créer une commande**
- Method: POST
- URL: `{{base_url}}/api/odoo/sale.order`
- Headers: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "SO001",
  "partner_id": 1,
  "state": "draft"
}
```

---

## 💻 Tester avec le Frontend React

### 1. Créer un Service API

**Fichier : `frontend/src/services/odooApi.ts`**

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_ODOO_BASE = `${API_BASE_URL}/api/odoo`;

// Configuration axios avec token
const apiClient = axios.create({
  baseURL: API_ODOO_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Service Sale Order
export const saleOrderApi = {
  getAll: () => apiClient.get('/sale.order'),
  getById: (id: number) => apiClient.get(`/sale.order/${id}`),
  create: (data: any) => apiClient.post('/sale.order', data),
  update: (id: number, data: any) => apiClient.put(`/sale.order/${id}`, data),
  delete: (id: number) => apiClient.delete(`/sale.order/${id}`),
  confirm: (id: number) => apiClient.post(`/sale.order/${id}/confirm`),
  cancel: (id: number) => apiClient.post(`/sale.order/${id}/cancel`),
};

// Service Product Template
export const productTemplateApi = {
  getAll: () => apiClient.get('/product.template'),
  getById: (id: number) => apiClient.get(`/product.template/${id}`),
  create: (data: any) => apiClient.post('/product.template', data),
  update: (id: number, data: any) => apiClient.put(`/product.template/${id}`, data),
  delete: (id: number) => apiClient.delete(`/product.template/${id}`),
};

export default apiClient;
```

### 2. Utiliser dans un Composant React

```typescript
import React, { useEffect, useState } from 'react';
import { saleOrderApi } from '../services/odooApi';

const SaleOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await saleOrderApi.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    try {
      const newOrder = {
        name: 'SO001',
        partner_id: 1,
        state: 'draft'
      };
      const response = await saleOrderApi.create(newOrder);
      console.log('Commande créée:', response.data);
      fetchOrders(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Commandes de Vente</h1>
      <button onClick={createOrder}>Créer une commande</button>
      <ul>
        {orders.map((order: any) => (
          <li key={order.id}>
            {order.name} - {order.state}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SaleOrdersPage;
```

---

## 📝 Exemples Pratiques

### Scénario 1 : Créer une Commande de Vente Complète

```bash
# 1. Créer la commande
curl -X POST http://localhost:5000/api/odoo/sale.order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "SO001",
    "partner_id": 1,
    "state": "draft",
    "date_order": "2026-01-20T10:00:00Z"
  }'

# 2. Confirmer la commande
curl -X POST http://localhost:5000/api/odoo/sale.order/1/confirm \
  -H "Authorization: Bearer VOTRE_TOKEN"

# 3. Créer la facture
curl -X POST http://localhost:5000/api/odoo/account.move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "move_type": "out_invoice",
    "partner_id": 1,
    "invoice_date": "2026-01-20",
    "invoice_origin": "SO001"
  }'
```

### Scénario 2 : Gérer le Stock

```bash
# 1. Créer une livraison
curl -X POST http://localhost:5000/api/odoo/stock.picking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "WH/OUT/001",
    "picking_type_id": 1,
    "state": "draft"
  }'

# 2. Valider la livraison (mettre à jour le stock)
curl -X PUT http://localhost:5000/api/odoo/stock.picking/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "state": "done"
  }'
```

---

## 🐛 Gestion des Erreurs

### Erreurs Courantes

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Token manquant"
  }
}
```
**Solution :** Vérifier que le token est présent dans les headers

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Ressource non trouvée"
  }
}
```
**Solution :** Vérifier l'ID de la ressource et qu'elle existe dans la base

#### 500 Internal Server Error
**Solution :** Vérifier les logs du serveur pour plus de détails

---

## ✅ Checklist de Test

- [ ] Obtenir un token d'authentification
- [ ] Tester GET pour lister les ressources
- [ ] Tester POST pour créer une ressource
- [ ] Tester GET par ID pour récupérer une ressource
- [ ] Tester PUT pour mettre à jour une ressource
- [ ] Tester DELETE pour supprimer une ressource
- [ ] Tester les actions spécifiques (confirm, cancel, etc.)
- [ ] Vérifier les erreurs d'authentification
- [ ] Vérifier les erreurs de validation

---

## 📚 Ressources

- **Documentation API :** Si Swagger est configuré : `http://localhost:5000/api-docs`
- **Logs Serveur :** Surveiller la console pour les erreurs
- **Base de Données :** Utiliser pgAdmin pour vérifier les données

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
