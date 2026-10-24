# Guide : Ajouter le traçage automatique (created_by/updated_by) aux contrôleurs

## Helper créé
Le fichier `backend/src/utils/audit.helper.js` contient les fonctions utilitaires :
- `getUserId(req)` : Récupère l'ID utilisateur depuis req.user
- `addCreateAudit(req, data)` : Ajoute created_by pour INSERT
- `addUpdateAudit(req, data)` : Ajoute updated_by pour UPDATE
- `buildUpdateQuery(req, fields, values, paramIndex)` : Construit la clause SET avec updated_by

## Contrôleurs déjà mis à jour
✅ `clients.controller.js`
✅ `fournisseurs.controller.js`
✅ `devis.controller.js`
✅ `of.controller.js`

## Pattern à suivre pour les autres contrôleurs

### 1. Importer le helper
```javascript
import { getUserId } from '../utils/audit.helper.js';
```

### 2. Pour les INSERT (CREATE)
```javascript
const userId = getUserId(req);
const result = await pool.query(
  `INSERT INTO table_name (col1, col2, ..., created_by)
   VALUES ($1, $2, ..., $N)
   RETURNING *`,
  [val1, val2, ..., userId]
);
```

### 3. Pour les UPDATE
```javascript
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

### 4. Pour les UPDATE simples (statut, etc.)
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

## Contrôleurs restants à mettre à jour (42 fichiers)

### Priorité haute (entités principales)
- [ ] `commandes.controller.js`
- [ ] `machines.controller.js`
- [ ] `articles.controller.js`
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
- Certains contrôleurs peuvent utiliser des transactions (BEGIN/COMMIT) - ajouter le traçage dans la transaction
- Certains contrôleurs peuvent avoir des UPDATE multiples - ajouter updated_by à chaque UPDATE
- Vérifier que les colonnes `created_by` et `updated_by` existent dans la table avant d'ajouter le traçage
- Toutes les tables ont déjà ces colonnes grâce au script `add_created_updated_by_all_tables.sql`
