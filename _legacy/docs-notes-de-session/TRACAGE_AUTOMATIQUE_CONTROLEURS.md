# Traçage automatique dans les contrôleurs - Mise en œuvre

## ✅ Statut : Partiellement complété

### Contrôleurs mis à jour (8/46)

1. ✅ **clients.controller.js**
   - `createClient` : Ajoute `created_by` lors de la création
   - `updateClient` : Ajoute `updated_by` lors de la mise à jour
   - `deleteClient` : Ajoute `updated_by` lors de la désactivation

2. ✅ **fournisseurs.controller.js**
   - `createFournisseur` : Ajoute `created_by` lors de la création
   - `updateFournisseur` : Ajoute `updated_by` lors de la mise à jour

3. ✅ **devis.controller.js**
   - `createDevis` : Ajoute `created_by` lors de la création
   - `updateDevis` : Ajoute `updated_by` lors de la mise à jour

4. ✅ **of.controller.js**
   - `createOF` : Ajoute `created_by` lors de la création (remplace `cree_par`)
   - `updateOF` : Ajoute `updated_by` lors de la mise à jour
   - `assignerMachine` : Ajoute `updated_by` lors de l'assignation
   - `demarrerOF` : Ajoute `updated_by` lors du démarrage
   - `terminerOF` : Ajoute `updated_by` lors de la finalisation

5. ✅ **commandes.controller.js**
   - `createCommande` : Ajoute `created_by` lors de la création
   - `updateCommande` : Ajoute `updated_by` lors de la mise à jour
   - `validerCommande` : Ajoute `updated_by` lors de la validation
   - Mise à jour du montant total : Ajoute `updated_by`

6. ✅ **machines.controller.js**
   - `createMachine` : Ajoute `created_by` lors de la création
   - `updateMachine` : Ajoute `updated_by` lors de la mise à jour

7. ✅ **articles.controller.js**
   - `createArticle` : Ajoute `created_by` lors de la création
   - `updateArticle` : Ajoute `updated_by` lors de la mise à jour
   - `deleteArticle` : Ajoute `updated_by` lors de la désactivation

8. ✅ **soustraitants.controller.js** (à vérifier)

## Helper créé

**Fichier** : `backend/src/utils/audit.helper.js`

### Fonctions disponibles :

1. **`getUserId(req)`**
   - Récupère l'ID utilisateur depuis `req.user.id`
   - Gère les cas où `req.user` est `null` ou `undefined`
   - Convertit automatiquement les strings en integers

2. **`getAuditFields(req, operation)`**
   - Retourne `{ created_by, updated_by }` selon l'opération
   - `operation` : `'create'` ou `'update'`

3. **`addCreateAudit(req, data)`**
   - Ajoute `created_by` à un objet de données pour INSERT

4. **`addUpdateAudit(req, data)`**
   - Ajoute `updated_by` à un objet de données pour UPDATE

5. **`buildUpdateQuery(req, fields, values, paramIndex)`**
   - Construit la clause SET avec `updated_by` et `updated_at`
   - Retourne `{ fields, values, paramIndex }`

## Pattern d'utilisation

### Pour les INSERT (CREATE)

```javascript
import { getUserId } from '../utils/audit.helper.js';

const userId = getUserId(req);
const result = await pool.query(
  `INSERT INTO table_name (col1, col2, ..., created_by)
   VALUES ($1, $2, ..., $N)
   RETURNING *`,
  [val1, val2, ..., userId]
);
```

### Pour les UPDATE dynamiques

```javascript
import { getUserId } from '../utils/audit.helper.js';

const userId = getUserId(req);
const fields = [];
const values = [];
let paramCount = 1;

// Exclure created_by et updated_by des champs modifiables
Object.keys(updateData).forEach(key => {
  if (updateData[key] !== undefined && 
      key !== 'id' && 
      key !== 'created_by' && 
      key !== 'updated_by') {
    fields.push(`${key} = $${paramCount}`);
    values.push(updateData[key]);
    paramCount++;
  }
});

// Ajouter updated_by et updated_at
if (userId !== null) {
  fields.push(`updated_by = $${paramCount}`);
  values.push(userId);
  paramCount++;
}
fields.push(`updated_at = CURRENT_TIMESTAMP`);

// Ajouter l'ID pour le WHERE
values.push(id);
const result = await pool.query(
  `UPDATE table_name 
   SET ${fields.join(', ')}
   WHERE id = $${paramCount}
   RETURNING *`,
  values
);
```

### Pour les UPDATE simples

```javascript
const userId = getUserId(req);
if (userId !== null) {
  await pool.query(
    'UPDATE table_name SET statut = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [newStatus, userId, id]
  );
} else {
  await pool.query(
    'UPDATE table_name SET statut = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newStatus, id]
  );
}
```

## Contrôleurs restants à mettre à jour (38 fichiers)

### Priorité haute (entités principales)
- [ ] `articles-catalogue.controller.js`
- [ ] `soustraitants.controller.js`
- [ ] `matieres-premieres.controller.js`
- [ ] `factures.controller.js`
- [ ] `bons-livraison.controller.js`
- [ ] `bons-retour.controller.js`
- [ ] `avoirs.controller.js`

### Priorité moyenne (suivi et qualité)
- [ ] `suivi-fabrication.controller.js`
- [ ] `qualite-avancee.controller.js`
- [ ] `tracabilite-lots.controller.js`
- [ ] `planning.controller.js`
- [ ] `planning-dragdrop.controller.js`
- [ ] `maintenance.controller.js`
- [ ] `pointage.controller.js`

### Priorité basse (autres)
- [ ] `stock.controller.js`
- [ ] `stock-multi-entrepots.controller.js`
- [ ] `couts.controller.js`
- [ ] `taches.controller.js`
- [ ] `notifications.controller.js`
- [ ] `messages.controller.js`
- [ ] `documents.controller.js`
- [ ] `dashboard.controller.js`
- [ ] `parametrage.controller.js`
- [ ] `parametres-catalogue.controller.js`
- [ ] `attributs-articles.controller.js`
- [ ] `selecteurs-machines.controller.js`
- [ ] `production.controller.js`
- [ ] `mobile.controller.js`
- [ ] `ecommerce.controller.js`
- [ ] `communication.controller.js`
- [ ] `multisociete.controller.js`
- [ ] `planification-gantt.controller.js`
- [ ] `webhooks.controller.js`
- [ ] `database.controller.js`
- [ ] `produits.controller.js`
- [ ] `qualite-avance.controller.js`
- [ ] `auth.controller.js` (peut ne pas nécessiter de traçage)
- [ ] `utilisateurs.controller.js` (peut nécessiter un traitement spécial)
- [ ] `audit.controller.js` (peut ne pas nécessiter de traçage)

## Notes importantes

1. **Toutes les tables ont déjà les colonnes** `created_by` et `updated_by` grâce au script `add_created_updated_by_all_tables.sql` (82 tables mises à jour).

2. **Gestion des transactions** : Certains contrôleurs utilisent des transactions (`BEGIN`/`COMMIT`). Le traçage doit être ajouté dans la transaction.

3. **Gestion des valeurs NULL** : `getUserId(req)` retourne `null` si l'utilisateur n'est pas authentifié. Les requêtes SQL doivent gérer ce cas.

4. **Exclusion des champs** : Toujours exclure `created_by` et `updated_by` des champs modifiables dans les UPDATE pour éviter qu'ils soient écrasés.

5. **Colonnes de date** : Certaines tables utilisent `date_modification` au lieu de `updated_at`. Adapter selon la table.

## Prochaines étapes

1. Mettre à jour les contrôleurs de priorité haute (7 fichiers)
2. Mettre à jour les contrôleurs de priorité moyenne (7 fichiers)
3. Mettre à jour les contrôleurs de priorité basse (24 fichiers)
4. Tester le traçage sur les endpoints principaux
5. Vérifier que les champs sont bien remplis dans la base de données

## Guide de référence

Voir `backend/scripts/ajouter-audit-controllers.md` pour un guide détaillé.
