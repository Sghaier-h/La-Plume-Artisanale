# Guide des Scripts de Test CRUD

## Scripts Disponibles

### 1. `test-crud-simple.mjs`
Test de connectivité basique - Vérifie si les routes répondent.

**Usage:**
```powershell
node scripts/test-crud-simple.mjs
```

**Résultat:** Liste des routes accessibles ou en erreur.

---

### 2. `test-crud-avec-serveur.mjs` ⭐
Test avec vérification du serveur - Vérifie d'abord si le serveur est démarré.

**Usage:**
```powershell
node scripts/test-crud-avec-serveur.mjs
```

**Résultat:** 
- Vérifie la connectivité du serveur
- Teste toutes les routes principales
- Identifie les routes nécessitant une authentification

---

### 3. `test-crud-automatique.mjs` ⭐⭐⭐
Test CRUD automatique complet - Teste toutes les opérations CRUD.

**Usage:**
```powershell
# Sans authentification (tests limités)
node scripts/test-crud-automatique.mjs

# Avec authentification (tests complets)
$env:TEST_TOKEN="votre-token-jwt"
node scripts/test-crud-automatique.mjs
```

**Résultat:**
- Teste GET, POST, PUT, DELETE pour tous les modules
- Génère un rapport JSON détaillé
- Gère les erreurs d'authentification gracieusement

**Rapport généré:** `TEST_CRUD_REPORT.json`

---

### 4. `test-crud-complet.mjs`
Test CRUD complet avancé - Teste avec création/mise à jour/suppression réelles.

**Usage:**
```powershell
$env:TEST_TOKEN="votre-token-jwt"
node scripts/test-crud-complet.mjs
```

**Résultat:**
- Crée réellement des enregistrements
- Les met à jour
- Les supprime
- Nécessite un token valide

---

## Obtenir un Token

### Méthode 1: Via le Frontend
1. Démarrer le frontend: `cd frontend && npm start`
2. Se connecter via l'interface
3. Ouvrir la console du navigateur (F12)
4. Exécuter: `localStorage.getItem('token')`
5. Copier le token

### Méthode 2: Via l'API
```powershell
# Exemple avec curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"votre-email","password":"votre-password"}'
```

---

## Variables d'Environnement

- `API_URL`: URL de l'API (défaut: `http://localhost:5000/api`)
- `TEST_TOKEN`: Token JWT pour les tests authentifiés

**Exemple:**
```powershell
$env:API_URL="http://localhost:5000/api"
$env:TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
node scripts/test-crud-automatique.mjs
```

---

## Interprétation des Résultats

### Codes de Statut

- **200 OK**: Opération réussie
- **201 Created**: Création réussie
- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Authentification requise (normal sans token)
- **404 Not Found**: Route non trouvée
- **500 Internal Server Error**: Erreur serveur

### Rapport JSON

Le rapport contient:
```json
{
  "timestamp": "2024-12-31T12:00:00.000Z",
  "apiUrl": "http://localhost:5000/api",
  "hasToken": true,
  "summary": {
    "total": 100,
    "passed": 95,
    "failed": 5,
    "skipped": 0
  },
  "modules": {
    "purchase-requests": {
      "operations": {
        "GET_LIST": { "success": true, "status": 200 },
        "CREATE": { "success": true, "status": 201 },
        ...
      }
    },
    ...
  },
  "errors": [...]
}
```

---

## Dépannage

### "ECONNREFUSED"
- Vérifier que le serveur backend est démarré
- Vérifier le port (5000 par défaut)

### Tous les tests retournent 401
- Normal sans token
- Fournir un token pour tests complets

### Certaines routes retournent 404
- Vérifier que le module est chargé dans `server.js`
- Vérifier que la route existe dans le manifest

### Erreurs 500
- Vérifier les logs du serveur
- Vérifier que les tables existent
- Vérifier les colonnes de la base de données

---

## Workflow Recommandé

1. **Démarrer le serveur backend**
   ```powershell
   cd backend
   npm start
   ```

2. **Tester la connectivité**
   ```powershell
   node scripts/test-crud-avec-serveur.mjs
   ```

3. **Obtenir un token** (voir section "Obtenir un Token")

4. **Tests complets**
   ```powershell
   $env:TEST_TOKEN="votre-token"
   node scripts/test-crud-automatique.mjs
   ```

5. **Analyser le rapport**
   - Ouvrir `TEST_CRUD_REPORT.json`
   - Vérifier les erreurs
   - Corriger les problèmes identifiés

---

## Modules Testés

- Purchase Requests
- Product Pricelists
- Companies
- Purchase Receptions
- Bank Reconciliation
- CRM Campaigns
- POS (Caisses, Sessions, Ventes)
- E-commerce (Products, Orders, Settings)
- Commercial

---

## Support

Pour toute question ou problème:
1. Vérifier les logs du serveur backend
2. Consulter `GUIDE_TEST_CRUD.md`
3. Consulter `CONTROLEURS_ET_TESTS_COMPLETS.md`
