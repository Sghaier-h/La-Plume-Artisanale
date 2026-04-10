# Guide de Test des Fonctionnalités CRUD

## Prérequis

1. **Démarrer le serveur backend**:
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
   npm start
   ```

2. **Démarrer le frontend** (optionnel, pour tester via l'interface):
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
   npm start
   ```

3. **Obtenir un token d'authentification**:
   - Se connecter via l'interface frontend
   - Ou utiliser l'endpoint `/api/auth/login` pour obtenir un token

## Tests Automatiques

### Test de Connectivité Simple

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/test-crud-simple.mjs
```

Ce script teste si les routes sont accessibles (même sans authentification complète).

### Test CRUD Complet

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
$env:TEST_TOKEN="votre-token-jwt"
node scripts/test-crud-complet.mjs
```

**Note**: Remplacez `votre-token-jwt` par un token valide obtenu après connexion.

## Tests Manuels avec Postman/Insomnia

### 1. Purchase Requests

#### GET - Liste des demandes
```
GET http://localhost:5000/api/purchase-requests
Headers: Authorization: Bearer <token>
```

#### POST - Créer une demande
```
POST http://localhost:5000/api/purchase-requests
Headers: Authorization: Bearer <token>
Body:
{
  "motif": "Test demande d'achat",
  "date_besoin": "2024-12-31",
  "notes": "Notes de test",
  "lignes": [
    {
      "id_product": 1,
      "quantity": 10,
      "price_unit": 100,
      "description": "Ligne test"
    }
  ]
}
```

#### GET - Détails d'une demande
```
GET http://localhost:5000/api/purchase-requests/1?loadRelations=true
Headers: Authorization: Bearer <token>
```

#### PUT - Mettre à jour
```
PUT http://localhost:5000/api/purchase-requests/1
Headers: Authorization: Bearer <token>
Body:
{
  "notes": "Notes mises à jour"
}
```

#### POST - Valider
```
POST http://localhost:5000/api/purchase-requests/1/validate
Headers: Authorization: Bearer <token>
```

#### DELETE - Supprimer
```
DELETE http://localhost:5000/api/purchase-requests/1
Headers: Authorization: Bearer <token>
```

### 2. Product Pricelists

#### GET - Liste
```
GET http://localhost:5000/api/product/pricelists
```

#### POST - Créer
```
POST http://localhost:5000/api/product/pricelists
Body:
{
  "name": "Liste de prix test",
  "code": "TEST-PRICE",
  "active": true
}
```

#### GET - Détails
```
GET http://localhost:5000/api/product/pricelists/1
```

#### PUT - Mettre à jour
```
PUT http://localhost:5000/api/product/pricelists/1
Body:
{
  "name": "Liste mise à jour"
}
```

#### DELETE - Supprimer
```
DELETE http://localhost:5000/api/product/pricelists/1
```

### 3. Companies

#### GET - Liste
```
GET http://localhost:5000/api/companies
```

#### POST - Créer
```
POST http://localhost:5000/api/companies
Body:
{
  "nom": "Société Test",
  "code": "TEST-COMP",
  "active": true
}
```

#### GET - Détails
```
GET http://localhost:5000/api/companies/1
```

#### PUT - Mettre à jour
```
PUT http://localhost:5000/api/companies/1
Body:
{
  "nom": "Société Mise à Jour"
}
```

#### DELETE - Supprimer
```
DELETE http://localhost:5000/api/companies/1
```

### 4. Purchase Receptions

#### GET - Liste
```
GET http://localhost:5000/api/purchase/receptions
```

#### POST - Créer
```
POST http://localhost:5000/api/purchase/receptions
Body:
{
  "numero_reception": "REC-TEST-001",
  "date_reception": "2024-12-31",
  "statut": "brouillon"
}
```

#### POST - Créer depuis commande
```
POST http://localhost:5000/api/purchase/receptions/from-order
Body:
{
  "id_commande": 1
}
```

#### POST - Valider
```
POST http://localhost:5000/api/purchase/receptions/1/validate
```

### 5. Bank Reconciliation

#### GET - Liste
```
GET http://localhost:5000/api/account/reconciliations
```

#### POST - Créer
```
POST http://localhost:5000/api/account/reconciliations
Body:
{
  "name": "Rapprochement Test",
  "date_start": "2024-12-01",
  "date_end": "2024-12-31",
  "statut": "draft"
}
```

#### POST - Valider
```
POST http://localhost:5000/api/account/reconciliations/1/validate
```

#### POST - Appariement automatique
```
POST http://localhost:5000/api/account/reconciliations/1/auto-match
```

### 6. CRM Campaigns

#### GET - Liste
```
GET http://localhost:5000/api/crm/campaigns
```

#### POST - Créer
```
POST http://localhost:5000/api/crm/campaigns
Body:
{
  "name": "Campagne Test",
  "date_start": "2024-12-31",
  "statut": "draft"
}
```

#### POST - Démarrer
```
POST http://localhost:5000/api/crm/campaigns/1/start
```

#### POST - Mettre en pause
```
POST http://localhost:5000/api/crm/campaigns/1/pause
```

#### GET - Statistiques
```
GET http://localhost:5000/api/crm/campaigns/1/stats
```

### 7. POS

#### GET - Liste des caisses
```
GET http://localhost:5000/api/pos/caisses
```

#### GET - Détails d'une caisse
```
GET http://localhost:5000/api/pos/caisses/1
```

#### POST - Ouvrir une session
```
POST http://localhost:5000/api/pos/sessions/ouvrir
Body:
{
  "id_caisse": 1,
  "montant_ouverture": 1000
}
```

#### POST - Fermer une session
```
POST http://localhost:5000/api/pos/sessions/1/fermer
Body:
{
  "montant_fermeture": 1500
}
```

#### POST - Créer une vente
```
POST http://localhost:5000/api/pos/ventes
Body:
{
  "id_session": 1,
  "lignes": [
    {
      "id_product": 1,
      "quantity": 2,
      "price_unit": 50
    }
  ],
  "paiements": [
    {
      "type": "cash",
      "amount": 100
    }
  ]
}
```

### 8. E-commerce

#### GET - Liste des produits
```
GET http://localhost:5000/api/ecommerce/products
```

#### POST - Créer un produit
```
POST http://localhost:5000/api/ecommerce/products
Body:
{
  "nom_article": "Produit E-commerce",
  "reference": "ECO-001",
  "prix_vente": 99.99,
  "website_published": true
}
```

#### GET - Paramètres
```
GET http://localhost:5000/api/ecommerce/settings
```

#### PUT - Mettre à jour les paramètres
```
PUT http://localhost:5000/api/ecommerce/settings
Body:
{
  "site_name": "La Plume Artisanale",
  "site_active": true
}
```

### 9. Commercial

#### GET - Liste
```
GET http://localhost:5000/api/commercial
```

#### POST - Créer
```
POST http://localhost:5000/api/commercial
Body:
{
  "nom": "Commercial Test",
  "email": "test@example.com",
  "active": true
}
```

## Vérification des Résultats

### Codes de Statut Attendus

- **200 OK**: Opération réussie (GET, PUT, DELETE)
- **201 Created**: Création réussie (POST)
- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Token manquant ou invalide
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

### Format de Réponse Attendu

```json
{
  "success": true,
  "data": { ... },
  "message": "Message de succès"
}
```

ou en cas d'erreur:

```json
{
  "success": false,
  "error": {
    "message": "Message d'erreur"
  }
}
```

## Checklist de Test

Pour chaque module, vérifier:

- [ ] GET liste retourne un tableau
- [ ] POST création retourne 201 avec l'objet créé
- [ ] GET détails retourne l'objet avec l'ID spécifié
- [ ] PUT mise à jour modifie correctement l'objet
- [ ] DELETE supprime (ou désactive) l'objet
- [ ] Les relations sont chargées avec `loadRelations=true`
- [ ] Les filtres de recherche fonctionnent
- [ ] Les actions spécifiques (validate, start, etc.) fonctionnent

## Dépannage

### Erreur "ECONNREFUSED"
- Vérifier que le serveur backend est démarré
- Vérifier le port (par défaut 5000)

### Erreur 401 Unauthorized
- Vérifier que le token est valide
- Vérifier le format: `Authorization: Bearer <token>`

### Erreur 404 Not Found
- Vérifier que la route existe dans le manifest du module
- Vérifier que le module est chargé dans `server.js`

### Erreur 500 Internal Server Error
- Vérifier les logs du serveur backend
- Vérifier que les tables de base de données existent
- Vérifier que les colonnes correspondent aux champs utilisés
