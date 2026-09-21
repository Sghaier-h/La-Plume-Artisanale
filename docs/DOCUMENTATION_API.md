# 📚 Documentation API - La Plume Artisanale

## ✅ Documentation Swagger/OpenAPI créée

La documentation API complète a été créée au format OpenAPI 3.0 (Swagger).

---

## 📄 Fichiers créés

1. **`backend/docs/swagger.yaml`** : Documentation OpenAPI complète
2. **`backend/src/docs/swagger.config.js`** : Configuration Swagger
3. **`docs/DOCUMENTATION_API.md`** : Ce fichier (guide d'utilisation)

---

## 🚀 Installation et Configuration

### Option 1 : Utiliser swagger-ui-express (Recommandé)

#### 1. Installer les dépendances

```bash
cd La-Plume-Artisanale/backend
npm install swagger-ui-express yamljs
```

#### 2. Configurer dans `server.js`

Ajouter avant les routes :

```javascript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger la documentation Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API ERP La Plume Artisanale'
}));
```

#### 3. Accéder à la documentation

Une fois le serveur démarré :

- **Développement** : http://localhost:5000/api-docs
- **Production** : https://fabrication.laplume-artisanale.tn/api-docs

### Option 2 : Utiliser Swagger Editor en ligne

1. Aller sur https://editor.swagger.io/
2. Ouvrir le fichier `backend/docs/swagger.yaml`
3. Visualiser et tester la documentation

### Option 3 : Générer une documentation statique

#### Installer redoc-cli

```bash
npm install -g redoc-cli
```

#### Générer la documentation HTML

```bash
redoc-cli bundle backend/docs/swagger.yaml -o docs/api-documentation.html
```

---

## 📋 Endpoints documentés

### ✅ Modules principaux documentés :

1. **Authentification**
   - `POST /api/auth/login` - Connexion

2. **Clients**
   - `GET /api/clients` - Liste des clients (pagination)
   - `GET /api/clients/:id` - Détails d'un client
   - `POST /api/clients` - Créer un client
   - `PUT /api/clients/:id` - Modifier un client

3. **Commandes**
   - `GET /api/commandes` - Liste des commandes
   - `POST /api/commandes` - Créer une commande
   - `POST /api/commandes/:id/valider` - Valider une commande

4. **Ordres de Fabrication (OF)**
   - `GET /api/of` - Liste des OF
   - `GET /api/of/:id` - Détails d'un OF
   - `POST /api/of` - Créer un OF
   - `PUT /api/of/:id` - Modifier un OF
   - `POST /api/of/:id/assigner-machine` - Assigner une machine
   - `POST /api/of/:id/demarrer` - Démarrer un OF
   - `POST /api/of/:id/terminer` - Terminer un OF

5. **Devis**
   - `GET /api/devis` - Liste des devis
   - `POST /api/devis` - Créer un devis

6. **Dashboard**
   - `GET /api/dashboard/kpis` - KPIs du dashboard

### ⚠️ Endpoints à documenter (ajouter dans swagger.yaml) :

- Fournisseurs (`/api/fournisseurs`)
- Factures (`/api/factures`)
- Bons de livraison (`/api/bons-livraison`)
- Avoirs (`/api/avoirs`)
- Bons retour (`/api/bons-retour`)
- Articles (`/api/articles`)
- Machines (`/api/machines`)
- Sous-traitants (`/api/soustraitants`)
- Stock (`/api/stock`)
- Planning (`/api/planning`)
- Qualité (`/api/quality`)

---

## 🔐 Authentification

La plupart des endpoints nécessitent une authentification JWT.

### Obtenir un token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@laplume-artisanale.tn",
  "password": "password123"
}
```

Réponse :
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@laplume-artisanale.tn",
      "nom": "Admin"
    }
  }
}
```

### Utiliser le token

Inclure le token dans l'en-tête `Authorization` :

```http
GET /api/clients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📖 Structure de la documentation

### Tags (Catégories)

- Authentification
- Clients
- Fournisseurs
- Commandes
- Devis
- Factures
- Bons Livraison
- Ordres Fabrication
- Articles
- Machines
- Sous-traitants
- Dashboard
- Stock

### Schemas (Modèles)

- `SuccessResponse` : Réponse de succès standardisée
- `ErrorResponse` : Réponse d'erreur standardisée
- `PaginatedResponse` : Réponse paginée
- `ClientCreate` : Données pour créer un client
- `ClientUpdate` : Données pour modifier un client

### Responses standardisées

- `200 OK` : Succès
- `201 Created` : Ressource créée
- `400 Bad Request` : Requête invalide
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Accès interdit
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

---

## 🛠️ Utilisation de la documentation Swagger

### Tester les endpoints

1. Accéder à `/api-docs`
2. Cliquer sur "Authorize" en haut à droite
3. Entrer le token JWT : `Bearer <token>`
4. Tester les endpoints directement depuis l'interface

### Exemples de requêtes

Tous les exemples sont disponibles dans la documentation Swagger avec :
- Paramètres requis/optionnels
- Format des données (JSON Schema)
- Exemples de réponses
- Codes d'erreur possibles

---

## 📝 Maintenance de la documentation

### Ajouter un nouvel endpoint

1. Ouvrir `backend/docs/swagger.yaml`
2. Ajouter le chemin dans `paths:`
3. Définir les paramètres, body, réponses
4. Si nouveau modèle, l'ajouter dans `components/schemas:`

### Exemple d'ajout :

```yaml
/api/fournisseurs:
  get:
    summary: Liste des fournisseurs
    tags: [Fournisseurs]
    security:
      - bearerAuth: []
    responses:
      '200':
        description: Liste des fournisseurs
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PaginatedResponse'
```

---

## 🔗 Liens utiles

- **Swagger Editor** : https://editor.swagger.io/
- **OpenAPI Specification** : https://swagger.io/specification/
- **Swagger UI** : https://swagger.io/tools/swagger-ui/
- **Redoc** : https://github.com/Redocly/redoc (alternative à Swagger UI)

---

## ✅ Checklist de complétude

- [x] Documentation OpenAPI 3.0 créée
- [x] Endpoints principaux documentés (Clients, Commandes, OF, Devis)
- [x] Authentification documentée
- [x] Schemas définis (SuccessResponse, ErrorResponse, PaginatedResponse)
- [x] Codes de réponse standardisés
- [ ] swagger-ui-express configuré dans server.js
- [ ] Tous les endpoints documentés (46+ endpoints)
- [ ] Documentation hébergée et accessible

---

## 📚 Prochaines étapes

1. **Installer et configurer swagger-ui-express** (voir Option 1 ci-dessus)
2. **Compléter la documentation** pour tous les endpoints (46+)
3. **Tester la documentation** via l'interface Swagger
4. **Héberger la documentation** sur `/api-docs` en production
5. **Maintenir à jour** lors des modifications d'API

---

**La documentation API est prête à être utilisée !** 🎉

Pour accéder à l'interface Swagger après configuration : `/api-docs`
