# 🔍 Résumé des Problèmes POST (500)

**Date** : 28 Janvier 2026

---

## 📊 Situation Actuelle

D'après les tests, **54 modules sont partiellement fonctionnels** (50%) :
- ✅ GET fonctionne (200)
- ❌ POST échoue (500)
- ⚠️ GET/:id fonctionne parfois (404 normal si ID n'existe pas)

---

## 🔍 Analyse des Problèmes

### Problème Principal : Erreurs 500 sur POST

Les erreurs 500 indiquent des problèmes serveur, probablement :
1. **Erreurs SQL** dans les requêtes INSERT
2. **Champs manquants** ou incorrects dans les données
3. **Problèmes avec `getUserId(req)`** retournant null/undefined
4. **Noms de colonnes incorrects** dans les requêtes SQL

### Modules Affectés

**Routes simples avec POST 500** :
- mobile, email, whatsapp, communication
- qualite-avancee, qualite-avance
- articles-catalogue, matieres-premieres
- devis, warehouse, stock-multi-entrepots
- of, production, pointage
- couts, accounting-tunisia, payroll-tunisia
- planning, planification-gantt, planning-dragdrop
- maintenance, selecteurs-machines
- dashboard, settings, parametres-catalogue
- documents, reports, search, database, migration
- excel-import, webhooks, social-auth, multisociete

**Routes avec préfixes avec POST 500** :
- Toutes les routes `module/resource` (account/*, hr/*, product/*, etc.)

---

## 🛠️ Solutions Proposées

### 1. Diagnostiquer les Erreurs Exactes

Utiliser le script de diagnostic :
```bash
node scripts/test-module-simple.mjs mobile
node scripts/test-module-simple.mjs email
node scripts/test-module-simple.mjs warehouse
```

### 2. Vérifier les Logs du Serveur

Les logs du serveur backend devraient contenir les erreurs SQL détaillées :
- Erreurs de syntaxe SQL
- Colonnes manquantes
- Contraintes violées
- Types de données incorrects

### 3. Vérifier `getUserId(req)`

Le problème peut venir de `getUserId(req)` qui retourne `null` ou `undefined` :
- Vérifier que le token JWT est valide
- Vérifier que le middleware `authenticate` fonctionne correctement
- Vérifier que `req.user` est défini après authentification

### 4. Vérifier les Noms de Colonnes

Les contrôleurs utilisent des noms de colonnes dynamiques basés sur `req.body` :
- S'assurer que les noms correspondent aux colonnes de la table
- Vérifier que les colonnes existent dans la table
- Vérifier les contraintes NOT NULL

---

## 📝 Actions Immédiates

### Étape 1 : Diagnostiquer un Module Spécifique

```bash
# Tester un module qui fonctionne (produits)
node scripts/test-module-simple.mjs produits

# Tester un module qui échoue (mobile)
node scripts/test-module-simple.mjs mobile

# Comparer les différences
```

### Étape 2 : Vérifier les Logs du Serveur

Regarder les logs du serveur backend pour voir les erreurs SQL exactes :
- Erreurs PostgreSQL
- Stack traces
- Messages d'erreur détaillés

### Étape 3 : Corriger les Problèmes Identifiés

Une fois les erreurs identifiées :
1. Corriger les noms de colonnes si nécessaire
2. Ajouter les champs manquants dans les données de test
3. Corriger les requêtes SQL dans les contrôleurs
4. Vérifier que `getUserId(req)` fonctionne correctement

---

## 🔧 Scripts Disponibles

1. **test-module-simple.mjs** : Teste un module spécifique et affiche l'erreur exacte
2. **diagnostiquer-erreurs-post.mjs** : Diagnostique plusieurs modules avec erreurs POST
3. **test-modules-400.mjs** : Teste les modules avec erreurs 400 (validation)

---

## 💡 Hypothèses

### Hypothèse 1 : Problème avec `getUserId(req)`

Si `getUserId(req)` retourne `null` ou `undefined`, alors :
- `userId` dans la requête SQL sera `null`
- Cela peut causer des erreurs si `created_by` est NOT NULL
- Ou des erreurs de type si `created_by` attend un INTEGER

**Solution** : Vérifier que le middleware `authenticate` définit correctement `req.user`

### Hypothèse 2 : Problème avec les Noms de Colonnes

Les données de test utilisent `name` et `description`, mais :
- Certaines tables peuvent avoir `nom` au lieu de `name`
- Certaines tables peuvent ne pas avoir `description`
- Les noms de colonnes peuvent être en snake_case différent

**Solution** : Vérifier les noms de colonnes réels dans les tables

### Hypothèse 3 : Problème avec les Valeurs NULL

Les données de test peuvent contenir des valeurs qui causent des erreurs :
- Chaînes vides au lieu de NULL
- Types de données incorrects
- Valeurs qui violent des contraintes

**Solution** : Nettoyer les données avant l'insertion

---

## ✅ Prochaines Étapes

1. **Diagnostiquer** : Utiliser `test-module-simple.mjs` pour identifier les erreurs exactes
2. **Analyser** : Examiner les logs du serveur pour les erreurs SQL
3. **Corriger** : Appliquer les corrections nécessaires
4. **Tester** : Re-tester avec `test-tous-modules.mjs`

---

**Action immédiate** : Exécuter `node scripts/test-module-simple.mjs mobile` pour voir l'erreur exacte.
