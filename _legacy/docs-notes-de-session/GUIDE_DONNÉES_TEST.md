# Guide d'Utilisation des Données de Test

## 📋 Vue d'ensemble

Ce guide explique comment utiliser les données de test créées pour tester l'application La Plume Artisanale ERP.

---

## 🚀 Installation des Données de Test

### Méthode 1 : Via psql (ligne de commande)

```bash
# Se connecter à PostgreSQL
psql -U postgres -d la_plume_artisanale

# Exécuter le script
\i database/insert_donnees_test.sql
```

Ou directement :

```bash
psql -U postgres -d la_plume_artisanale -f database/insert_donnees_test.sql
```

### Méthode 2 : Via pgAdmin

1. Ouvrir pgAdmin
2. Se connecter au serveur PostgreSQL
3. Sélectionner la base de données `la_plume_artisanale`
4. Clic droit → Query Tool
5. Ouvrir le fichier `database/insert_donnees_test.sql`
6. Exécuter (F5)

### Méthode 3 : Via Node.js (si script disponible)

```bash
cd La-Plume-Artisanale/backend
node scripts/import-donnees-test.js
```

---

## 👥 Utilisateurs de Test

### Comptes créés :

| Email | Rôle | Mot de passe |
|-------|------|--------------|
| admin@laplume.tn | ADMIN | *À définir* |
| jean.dupont@laplume.tn | CHEF_PROD | *À définir* |
| marie.martin@laplume.tn | OPERATEUR | *À définir* |
| pierre.bernard@laplume.tn | COMMERCIAL | *À définir* |

**⚠️ Important** : Les mots de passe dans le script sont hashés avec bcrypt. Pour vous connecter, vous devez :

1. **Option A** : Créer de nouveaux utilisateurs via l'interface
2. **Option B** : Modifier les mots de passe dans la base de données
3. **Option C** : Utiliser le script de création d'utilisateurs

### Créer un utilisateur de test manuellement :

```sql
-- Exemple : Créer un admin avec mot de passe "admin123"
-- Le hash doit être généré avec bcrypt
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, actif)
VALUES ('Admin', 'Test', 'admin@test.tn', '$2b$10$...', 'ADMIN', true);
```

---

## 📦 Données Créées

### 1. Clients (5)

- **Boutique Tunis Centre** : contact@tuniscentre.tn
- **Magasin Sfax** : info@magasinsfax.tn
- **Showroom Hammamet** : showroom@hammamet.tn
- **Boutique Djerba** : boutique@djerba.tn
- **Client Export France** : export@france.tn

### 2. Machines (5)

- MACH-001 : Métier à tisser automatique 1
- MACH-002 : Métier à tisser automatique 2
- MACH-003 : Machine à coudre industrielle
- MACH-004 : Machine de finition (en maintenance)
- MACH-005 : Machine d'emballage

### 3. Matières Premières (5)

- MP-001 : Fil de coton blanc (500 KG)
- MP-002 : Fil de coton coloré (300 KG)
- MP-003 : Fil de lin (200 KG)
- MP-004 : Fil de bambou (150 KG)
- MP-005 : Fil métallique lurex (50 KG)

### 4. Articles (3)

- AR-1020-B-FR-001 : Fouta ARTHUR 100/200 CM
- AR-1020-B-FR-002 : Fouta ARTHUR 100/200 CM Variante
- AR-1626-B-FR-001 : Fouta ARTHUR 160/260 CM

### 5. Commandes (1)

- Commande avec 2 lignes (20 articles au total)
- Statut : Validée
- Client : Boutique Tunis Centre

### 6. Ordres de Fabrication (2)

- OF-001 : En attente (20 unités)
- OF-002 : En cours (15 unités, 8 produites)

### 7. Suivis de Fabrication (1)

- Suivi en cours pour OF-002
- 8 unités produites (7 bonnes, 1 rebut)

### 8. Mouvements de Stock (2)

- Entrée : 50 produits finis
- Sortie : 25.5 KG de matières premières

### 9. Inventaires (1)

- Inventaire en attente de validation
- Écart détecté : -2 unités

### 10. Entrepôts (3)

- ENT-001 : Entrepôt Principal
- ENT-002 : Showroom
- ENT-003 : Réserve

### 11. Fournitures (4)

- FOUR-001 : Étiquettes produits
- FOUR-002 : Sacs en papier
- FOUR-003 : Rubans de finition
- FOUR-004 : Fils de couture

### 12. Contrôles Qualité (2)

- Contrôle en attente
- Contrôle validé

---

## 🧪 Scénarios de Test

### Scénario 1 : Workflow Complet Production

1. **Créer une commande**
   - Aller dans "Commandes"
   - Créer une nouvelle commande pour un client existant
   - Ajouter des lignes avec des articles

2. **Créer un OF**
   - Aller dans "Ordres de Fabrication"
   - Créer un OF depuis la commande
   - Assigner une machine

3. **Démarrer l'OF**
   - Cliquer sur "Démarrer" sur l'OF
   - Vérifier qu'un suivi de fabrication est créé automatiquement

4. **Suivre la production**
   - Aller dans "Suivi Fabrication"
   - Mettre à jour les quantités produites

5. **Terminer l'OF**
   - Retourner dans "OF"
   - Terminer l'OF avec la quantité produite
   - Vérifier qu'un mouvement de stock est créé
   - Vérifier qu'un contrôle qualité est créé

6. **Valider le contrôle qualité**
   - Aller dans "Qualité Avancée"
   - Valider ou refuser le contrôle

### Scénario 2 : Gestion Stock

1. **Voir les mouvements**
   - Aller dans "Mouvements"
   - Vérifier les entrées/sorties

2. **Créer un inventaire**
   - Aller dans "Inventaire"
   - Créer un nouvel inventaire
   - Saisir les quantités réelles
   - Valider l'inventaire

3. **Voir les stocks par entrepôt**
   - Aller dans "Entrepôts"
   - Voir les stocks détaillés

### Scénario 3 : Navigation et Pages de Détails

1. **Naviguer vers les détails**
   - Aller dans "Articles"
   - Cliquer sur un article (carte ou bouton "Voir")
   - Vérifier que la page de détails s'affiche

2. **Tester toutes les pages de détails**
   - Articles : `/articles/:id`
   - Clients : `/clients/:id`
   - Modèles : `/modeles/:id`
   - OF : `/of/:id`

3. **Tester les actions rapides**
   - Modifier depuis la page de détails
   - Voir les entités liées

---

## 🔍 Vérification des Données

### Requêtes SQL utiles :

```sql
-- Compter les enregistrements par table
SELECT 'Utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Machines', COUNT(*) FROM machines
UNION ALL
SELECT 'Articles', COUNT(*) FROM articles_catalogue
UNION ALL
SELECT 'Commandes', COUNT(*) FROM commandes
UNION ALL
SELECT 'OF', COUNT(*) FROM ordres_fabrication
UNION ALL
SELECT 'Suivis', COUNT(*) FROM suivi_fabrication
UNION ALL
SELECT 'Mouvements', COUNT(*) FROM mouvements_stock
UNION ALL
SELECT 'Inventaires', COUNT(*) FROM inventaires;

-- Voir les OF avec leurs statuts
SELECT numero_of, statut, quantite_a_produire, quantite_produite 
FROM ordres_fabrication;

-- Voir les commandes avec leurs montants
SELECT numero_commande, statut, montant_total, date_commande 
FROM commandes;

-- Voir les stocks d'articles
SELECT code_article, designation, 
       (SELECT SUM(quantite) FROM mouvements_stock 
        WHERE id_article = a.id_article AND type_mouvement = 'ENTREE') as stock_entree,
       (SELECT SUM(quantite) FROM mouvements_stock 
        WHERE id_article = a.id_article AND type_mouvement = 'SORTIE') as stock_sortie
FROM articles_catalogue a
WHERE actif = true;
```

---

## 🐛 Dépannage

### Problème : Les données ne s'insèrent pas

**Solution** :
1. Vérifier que la base de données existe
2. Vérifier que les tables existent (exécuter les scripts de création de tables)
3. Vérifier que les paramètres (parametres_modeles, etc.) existent
4. Vérifier les logs PostgreSQL pour les erreurs

### Problème : Erreurs de clés étrangères

**Solution** :
1. S'assurer que les scripts de création de tables ont été exécutés
2. S'assurer que les données de paramètres existent (insert_attributs_catalogue.sql)
3. Vérifier l'ordre d'exécution des scripts

### Problème : Impossible de se connecter avec les utilisateurs

**Solution** :
1. Les mots de passe sont hashés - créer de nouveaux utilisateurs via l'interface
2. Ou utiliser le script de création d'utilisateurs avec des mots de passe connus

---

## 📝 Notes

- Les données de test sont idempotentes : vous pouvez exécuter le script plusieurs fois sans créer de doublons
- Les dates sont relatives (CURRENT_DATE) pour rester cohérentes
- Les montants et quantités sont réalistes mais fictifs
- Les emails sont fictifs et ne doivent pas être utilisés en production

---

## ✅ Checklist de Vérification

Après avoir installé les données de test :

- [ ] Les utilisateurs sont créés
- [ ] Les clients sont visibles dans la liste
- [ ] Les articles sont visibles
- [ ] Les commandes sont visibles
- [ ] Les OF sont visibles
- [ ] Les pages de détails fonctionnent
- [ ] Les workflows fonctionnent (OF → Production → Stock)
- [ ] Les imports/exports fonctionnent

---

**Dernière mise à jour** : $(date)
