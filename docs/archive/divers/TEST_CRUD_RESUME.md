# Résumé des Tests CRUD

## Scripts de Test Disponibles

### 1. Test de Connectivité Simple
**Fichier**: `backend/scripts/test-crud-simple.mjs`

Teste si les routes sont accessibles (sans authentification complète).

```powershell
cd backend
node scripts/test-crud-simple.mjs
```

### 2. Test avec Vérification du Serveur
**Fichier**: `backend/scripts/test-crud-avec-serveur.mjs`

Vérifie d'abord si le serveur est démarré, puis teste les routes.

```powershell
cd backend
node scripts/test-crud-avec-serveur.mjs
```

### 3. Test CRUD Complet
**Fichier**: `backend/scripts/test-crud-complet.mjs`

Teste toutes les opérations CRUD avec authentification.

```powershell
cd backend
$env:TEST_TOKEN="votre-token-jwt"
node scripts/test-crud-complet.mjs
```

## Modules Testés

### ✅ Modules avec CRUD Complet

1. **Purchase Requests** (`/api/purchase-requests`)
   - GET liste
   - GET détails
   - POST créer
   - PUT mettre à jour
   - DELETE supprimer
   - POST valider
   - POST rejeter
   - Gestion des lignes

2. **Product Pricelists** (`/api/product/pricelists`)
   - GET liste
   - GET détails
   - POST créer
   - PUT mettre à jour
   - DELETE supprimer
   - Gestion des items

3. **Companies** (`/api/companies`)
   - GET liste
   - GET détails
   - POST créer
   - PUT mettre à jour
   - DELETE supprimer

4. **Purchase Receptions** (`/api/purchase/receptions`)
   - GET liste
   - GET détails
   - POST créer
   - POST créer depuis commande
   - PUT mettre à jour
   - DELETE supprimer
   - POST valider

5. **Bank Reconciliation** (`/api/account/reconciliations`)
   - GET liste
   - GET détails
   - POST créer
   - PUT mettre à jour
   - DELETE supprimer
   - POST valider
   - POST appariement automatique

6. **CRM Campaigns** (`/api/crm/campaigns`)
   - GET liste
   - GET détails
   - POST créer
   - PUT mettre à jour
   - DELETE supprimer
   - POST démarrer
   - POST mettre en pause
   - POST arrêter
   - GET statistiques

7. **POS** (`/api/pos/*`)
   - GET caisses
   - GET détails caisse
   - POST ouvrir session
   - POST fermer session
   - POST créer vente
   - GET ventes

8. **E-commerce** (`/api/ecommerce/*`)
   - GET produits
   - POST créer produit
   - PUT mettre à jour produit
   - DELETE supprimer produit
   - GET commandes
   - PUT mettre à jour commande
   - POST confirmer commande
   - GET paramètres
   - PUT mettre à jour paramètres

9. **Commercial** (`/api/commercial`)
   - GET liste
   - GET détails
   - POST créer
   - PUT mettre à jour
   - DELETE supprimer

## Résultats Attendus

### Codes de Statut

- **200 OK**: Opération réussie
- **201 Created**: Création réussie
- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Authentification requise (normal sans token)
- **404 Not Found**: Route non trouvée (vérifier le manifest)
- **500 Internal Server Error**: Erreur serveur (vérifier les logs)

### Format de Réponse

**Succès**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Message de succès"
}
```

**Erreur**:
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

## Prochaines Étapes

1. **Démarrer le serveur backend**
2. **Exécuter les tests de connectivité**
3. **Obtenir un token d'authentification**
4. **Exécuter les tests CRUD complets**
5. **Vérifier les résultats dans le rapport JSON généré**

## Documentation

- **Guide complet**: `GUIDE_TEST_CRUD.md`
- **Rapport de test**: `backend/TEST_CRUD_REPORT.json` (généré après les tests)
