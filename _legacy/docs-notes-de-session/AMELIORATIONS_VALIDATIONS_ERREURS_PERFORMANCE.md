# Améliorations : Validations Métier, Gestion d'Erreurs et Performance

## ✅ Statut : Helpers créés - À appliquer aux contrôleurs

---

## 1. ✅ VALIDATIONS MÉTIER (Point 3)

### Helper créé : `backend/src/utils/validations.helper.js`

#### Fonctions disponibles :

1. **`validateDates(dateDebut, dateFin)`**
   - Valide que `date_debut < date_fin`
   - Retourne `{ valid: boolean, error?: string }`

2. **`validateDateNotFuture(date, toleranceDays)`**
   - Valide qu'une date n'est pas dans le futur
   - Tolérance configurable (jours)

3. **`validateQuantiteDisponible(idArticle, quantiteDemandee, checkStock)`**
   - Vérifie les quantités disponibles avant création d'OF
   - Retourne stock disponible si valide

4. **`validateWorkflowStatusForTable(tableName, currentStatus)`**
   - Valide les statuts de workflow (ne pas modifier facture payée, etc.)
   - Règles préconfigurées par table :
     - `factures`: PAYEE, ANNULEE interdits
     - `devis`: TRANSFORME interdit
     - `commandes`: LIVREE, ANNULEE interdits
     - `ordres_fabrication`: TERMINE, ANNULE interdits
     - `bons_livraison`: LIVRE, ANNULE interdits

5. **`validateReferentialIntegrity(tableName, idColumn, id, mustBeActive)`**
   - Vérifie l'intégrité référentielle (client existe, article existe, etc.)
   - Option pour vérifier si actif

6. **`validateQuantite(quantite, min, max)`**
   - Valide une quantité positive avec min/max

7. **`validateMontant(montant, min)`**
   - Valide un montant positif

### Exemple d'utilisation :

```javascript
import { validateDates, validateQuantiteDisponible, validateWorkflowStatusForTable } from '../utils/validations.helper.js';

// Dans createOF :
const dateValidation = validateDates(date_debut_prevue, date_fin_prevue);
if (!dateValidation.valid) {
  return sendError(res, HTTP_STATUS.BAD_REQUEST, dateValidation.error);
}

// Vérifier stock (optionnel)
const quantiteCheck = await validateQuantiteDisponible(id_article, quantite_a_produire, true);
if (!quantiteCheck.valid) {
  return sendError(res, HTTP_STATUS.BAD_REQUEST, quantiteCheck.error);
}

// Dans updateOF :
const statusValidation = validateWorkflowStatusForTable('ordres_fabrication', existing.statut);
if (!statusValidation.valid) {
  return sendError(res, HTTP_STATUS.BAD_REQUEST, statusValidation.error);
}
```

### Contrôleur mis à jour (exemple) :
- ✅ `of.controller.js` : Validations dates, statuts workflow, intégrité référentielle

### À appliquer dans :
- Tous les contrôleurs CREATE/UPDATE qui manipulent des dates
- Tous les contrôleurs qui vérifient des statuts de workflow
- Création OF : validation quantités disponibles

---

## 2. ✅ GESTION D'ERREURS (Point 4)

### Helper créé : `backend/src/utils/error.helper.js`

#### Fonctions disponibles :

1. **`sendError(res, statusCode, message, code, details)`**
   - Réponse d'erreur standardisée
   - Format : `{ success: false, error: { message, code?, details? } }`

2. **`sendSuccess(res, data, statusCode, message)`**
   - Réponse de succès standardisée
   - Format : `{ success: true, data?, message? }`

3. **`handleError(res, error, context, defaultStatus)`**
   - Gère les erreurs avec logging automatique
   - Détecte automatiquement les erreurs PostgreSQL :
     - `23505` : Unique violation → 409 CONFLICT
     - `23503` : Foreign key violation → 400 BAD_REQUEST
     - `23502` : Not null violation → 400 BAD_REQUEST

4. **`HTTP_STATUS`** (constantes)
   - Codes HTTP standardisés : OK, CREATED, BAD_REQUEST, NOT_FOUND, etc.

5. **`ERROR_MESSAGES`** (messages utilisateur-friendly)
   - Messages pré-définis en français
   - Exemples :
     - `REQUIRED_FIELD(field)` : "Le champ 'X' est requis"
     - `NOT_FOUND(resource)` : "X non trouvé(e)"
     - `INVALID_DATE_RANGE` : "La date de début doit être antérieure à la date de fin"
     - `INSUFFICIENT_STOCK` : "Stock insuffisant. Disponible: X, Demandé: Y"

6. **`createValidationError(message, details)`**
   - Crée une erreur de validation flaggée

7. **`createBusinessError(message)`**
   - Crée une erreur métier flaggée

### Exemple d'utilisation :

```javascript
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../utils/error.helper.js';

// Remplacement de :
res.status(404).json({ success: false, error: { message: 'OF non trouvé' } });

// Par :
return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('OF'));

// Remplacement de :
res.status(201).json({ success: true, data: result.rows[0] });

// Par :
return sendSuccess(res, result.rows[0], HTTP_STATUS.CREATED);

// Remplacement de :
} catch (error) {
  console.error('Erreur createOF:', error);
  res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
}

// Par :
} catch (error) {
  return handleError(res, error, 'createOF');
}
```

### Contrôleur mis à jour (exemple) :
- ✅ `of.controller.js` : Gestion d'erreurs standardisée

### À appliquer dans :
- Tous les contrôleurs pour cohérence des messages
- Tous les catch blocks pour gestion automatique des erreurs PostgreSQL

---

## 3. ✅ PERFORMANCE (Point 5)

### A. Index manquants

#### Script SQL créé : `backend/database/add_missing_indexes.sql`

#### Index créés (80+ index) :

1. **Recherches textuelles (LIKE/ILIKE)**
   - `idx_articles_code_lower`, `idx_articles_designation_lower`
   - `idx_clients_code_lower`, `idx_clients_raison_sociale_lower`
   - Index sur colonnes `LOWER()` pour recherches insensibles à la casse

2. **Filtres par statut**
   - `idx_commandes_statut`, `idx_devis_statut`, `idx_factures_statut`
   - `idx_of_statut`, `idx_bl_statut`, `idx_avoirs_statut`
   - Index composites : `idx_commandes_statut_date`

3. **Filtres par date**
   - `idx_commandes_date_commande`, `idx_devis_date_devis`
   - `idx_of_date_debut_prevue`, `idx_of_date_fin_prevue`

4. **Joins (Foreign Keys)**
   - `idx_articles_commande_commande`, `idx_lignes_devis_devis`
   - `idx_commandes_client`, `idx_devis_client`, `idx_factures_client`
   - `idx_of_article`, `idx_of_article_commande`

5. **Traçabilité (created_by, updated_by)**
   - `idx_commandes_created_by_date`
   - `idx_devis_created_by_date`
   - `idx_of_created_by_date`

6. **Tries fréquents**
   - `idx_commandes_date_montant` (ORDER BY date, montant)
   - `idx_of_priorite_date` (ORDER BY priorite, date)

7. **Recherches avancées (composites)**
   - `idx_articles_type_actif`
   - `idx_commandes_client_statut`
   - `idx_of_article_statut`

#### Exécution :
```bash
# Via pgAdmin : Ouvrir le fichier et exécuter
# Via psql :
psql -U user -d database -f backend/database/add_missing_indexes.sql
```

### B. Pagination

#### Helper créé : `backend/src/utils/pagination.helper.js`

#### Fonctions disponibles :

1. **`getPaginationParams(req, defaultPageSize, maxPageSize)`**
   - Récupère `page`, `limit`, `offset` depuis `req.query`
   - Défauts : page=1, limit=20, max=100

2. **`buildPaginationQuery(query, limit, offset)`**
   - Ajoute `LIMIT` et `OFFSET` à une requête SQL

3. **`buildPaginationResponse(data, page, limit, total)`**
   - Construit la réponse paginée standardisée :
     ```json
     {
       "success": true,
       "data": [...],
       "pagination": {
         "page": 1,
         "limit": 20,
         "total": 150,
         "totalPages": 8,
         "hasNextPage": true,
         "hasPrevPage": false
       }
     }
     ```

4. **`getTotalCount(countQuery, params, pool)`**
   - Compte le nombre total d'enregistrements

### Exemple d'utilisation :

```javascript
import { getPaginationParams, buildPaginationQuery, buildPaginationResponse, getTotalCount } from '../utils/pagination.helper.js';

export const getOFs = async (req, res) => {
  try {
    // Récupérer paramètres pagination
    const { page, limit, offset } = getPaginationParams(req, 20, 100);
    
    // Construire requête avec pagination
    let query = `SELECT ... FROM ordres_fabrication WHERE 1=1`;
    const paginatedQuery = buildPaginationQuery(query, limit, offset);
    
    // Requête COUNT pour total
    const countQuery = `SELECT COUNT(*) as count FROM ordres_fabrication WHERE 1=1`;
    const total = await getTotalCount(countQuery, params, pool);
    
    // Exécuter requête paginée
    const result = await pool.query(paginatedQuery, params);
    
    // Retourner réponse paginée
    return sendSuccess(res, buildPaginationResponse(result.rows, page, limit, total));
  } catch (error) {
    return handleError(res, error, 'getOFs');
  }
};
```

### À appliquer dans :
- Tous les contrôleurs GET qui listent des données :
  - `getArticles`, `getClients`, `getCommandes`, `getDevis`
  - `getOFs`, `getFactures`, `getMachines`, etc.

### C. Requêtes optimisées (JOIN)

#### Recommandations :
- Utiliser `LEFT JOIN` uniquement si nécessaire (garder `INNER JOIN` sinon)
- Éviter `SELECT *` : sélectionner uniquement les colonnes nécessaires
- Utiliser `EXISTS` au lieu de `IN (SELECT ...)` pour grandes listes
- Index sur colonnes de JOIN déjà créés dans `add_missing_indexes.sql`

---

## 📋 RÉSUMÉ DES ACTIONS

### ✅ Complété :
1. ✅ Helper validations métier créé (`validations.helper.js`)
2. ✅ Helper gestion erreurs créé (`error.helper.js`)
3. ✅ Helper pagination créé (`pagination.helper.js`)
4. ✅ Script SQL index manquants créé (`add_missing_indexes.sql`)
5. ✅ Contrôleur `of.controller.js` mis à jour (exemple)

### ⚠️ À faire :
1. ⚠️ Appliquer validations métier à tous les contrôleurs CREATE/UPDATE
2. ⚠️ Appliquer gestion erreurs standardisée à tous les contrôleurs
3. ⚠️ Appliquer pagination à tous les contrôleurs GET listes
4. ⚠️ Exécuter `add_missing_indexes.sql` sur la base de données
5. ⚠️ Optimiser les requêtes JOIN existantes

---

## 🎯 PRIORISATION

### Priorité 1 (Critique) :
- Exécuter `add_missing_indexes.sql` (impact immédiat sur performance)
- Appliquer gestion erreurs standardisée (cohérence messages)

### Priorité 2 (Important) :
- Appliquer validations métier aux contrôleurs principaux :
  - `of.controller.js` (déjà fait ✅)
  - `commandes.controller.js`
  - `devis.controller.js`
  - `factures.controller.js`

### Priorité 3 (Amélioration) :
- Ajouter pagination aux listes longues
- Optimiser requêtes JOIN

---

## 📚 Documentation complémentaire

- `backend/src/utils/validations.helper.js` : Code source avec commentaires
- `backend/src/utils/error.helper.js` : Code source avec commentaires
- `backend/src/utils/pagination.helper.js` : Code source avec commentaires
- `backend/database/add_missing_indexes.sql` : Script SQL avec commentaires

---

**Les helpers sont prêts à être utilisés dans tous les contrôleurs pour une cohérence et performance optimale.**
