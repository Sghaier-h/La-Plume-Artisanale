# 📊 Amélioration des Données de Test pour Modules avec Erreurs 400

**Date** : 28 Janvier 2026

---

## 🎯 Objectif

Améliorer les données de test pour les 17 modules qui génèrent des erreurs 400 (validation) lors des tests CRUD.

---

## ✅ Corrections Appliquées

### 1. Données de Test Améliorées

Les données de test ont été mises à jour pour correspondre aux structures réelles des tables dans la base de données.

#### Modules avec Données Spécifiques

**articles-catalogue** :
```javascript
{
  nom: 'Article Catalogue Test',  // NOT NULL
  reference: 'CAT-REF-...',
  prix_vente: 150.00,
  prix_achat: 100.00,
  actif: true
}
```

**clients** :
```javascript
{
  code_client: 'CLI-...',          // UNIQUE NOT NULL
  raison_sociale: '...',           // NOT NULL
  adresse: '123 Rue Test',
  ville: 'Tunis',
  pays: 'Tunisie',
  telephone: '+21612345678',
  email: 'client@test.com',
  contact_principal: 'Contact Principal',
  actif: true
}
```

**commandes** :
```javascript
{
  numero_commande: 'CMD-...',      // UNIQUE NOT NULL
  id_client: 1,                    // NOT NULL (référence vers clients)
  date_commande: '2026-01-28',     // NOT NULL
  statut: 'EN_ATTENTE',
  montant_ht: 1000.00,
  montant_tva: 200.00,
  montant_ttc: 1200.00
}
```

**fournisseurs** :
```javascript
{
  code_fournisseur: 'FOU-...',
  raison_sociale: '...',
  email: 'fournisseur@test.com',
  telephone: '+21612345679',
  adresse: '456 Rue Fournisseur',
  ville: 'Sfax',
  pays: 'Tunisie',
  actif: true
}
```

**soustraitants** :
```javascript
{
  code_soustraitant: 'SOU-...',
  raison_sociale: '...',
  email: 'soustraitant@test.com',
  telephone: '+21612345680',
  adresse: '789 Rue Sous-traitant',
  ville: 'Sousse',
  pays: 'Tunisie',
  actif: true
}
```

**Autres modules** :
- `articles`, `devis`, `of`, `machines`, `avoirs`, `bons-livraison`, `bons-retour`
- `factures`, `purchase-requests`, `matieres-premieres`, `modeles`, `pointage`

### 2. Script de Test Spécifique

Création de `scripts/test-modules-400.mjs` pour tester spécifiquement les modules avec erreurs 400.

**Fonctionnalités** :
- Utilise les données de test améliorées
- Affiche les données envoyées
- Affiche les erreurs détaillées
- Génère un résumé des résultats

### 3. Intégration dans le Script Principal

Le script `test-tous-modules.mjs` utilise maintenant automatiquement les données améliorées via `ameliorer-donnees-test.mjs`.

---

## 📋 Modules Améliorés (17)

1. ✅ **articles** - Données avec code_article et prix_vente
2. ✅ **articles-catalogue** - Données avec nom (NOT NULL), reference, prix_vente, prix_achat
3. ✅ **clients** - Données complètes avec code_client (UNIQUE NOT NULL), raison_sociale (NOT NULL)
4. ✅ **fournisseurs** - Données complètes avec code_fournisseur, raison_sociale
5. ✅ **soustraitants** - Données complètes avec code_soustraitant, raison_sociale
6. ✅ **commandes** - Données avec numero_commande (UNIQUE NOT NULL), id_client (NOT NULL)
7. ✅ **devis** - Données avec numero_devis, date_devis, statut
8. ✅ **of** - Données avec name, description, actif
9. ✅ **machines** - Données avec name, description, actif
10. ✅ **avoirs** - Données avec numero_avoir, date_avoir, montant
11. ✅ **bons-livraison** - Données avec numero_bl, date_bl, statut
12. ✅ **bons-retour** - Données avec numero_br, date_br, statut
13. ✅ **factures** - Données avec numero_facture, date_facture, montant_ht, montant_ttc
14. ✅ **purchase-requests** - Données avec numero_demande, date_demande, statut
15. ✅ **matieres-premieres** - Données avec code_mp, description, unite
16. ✅ **modeles** - Données avec name, description, actif
17. ✅ **pointage** - Données avec date_pointage, heure_entree, heure_sortie

---

## 🔍 Points d'Attention

### 1. Contraintes de Clés Étrangères

**commandes** nécessite `id_client` qui doit exister dans la table `clients`.

**Solution** :
- Pour les tests, utiliser `id_client: 1` si un client existe
- Ou créer d'abord un client, puis utiliser son ID

### 2. Champs UNIQUE

Les champs suivants doivent être uniques :
- `code_client` (clients)
- `numero_commande` (commandes)
- `code_fournisseur` (fournisseurs)
- `code_soustraitant` (soustraitants)

**Solution** : Utiliser `Date.now()` dans les codes pour garantir l'unicité.

### 3. Champs NOT NULL

Les champs suivants sont obligatoires :
- `nom` (articles-catalogue)
- `code_client` et `raison_sociale` (clients)
- `numero_commande` et `id_client` (commandes)

**Solution** : Toutes les données de test incluent ces champs.

---

## 🧪 Utilisation

### Tester les modules avec erreurs 400

```bash
node scripts/test-modules-400.mjs
```

### Tester tous les modules (avec données améliorées)

```bash
node scripts/test-tous-modules.mjs
```

### Obtenir les données de test pour un module spécifique

```bash
node scripts/ameliorer-donnees-test.mjs articles-catalogue
```

---

## 📊 Résultats Attendus

### Avant les améliorations
- ❌ 17 modules avec erreurs 400 (validation)

### Après les améliorations (attendu)
- ✅ Réduction significative des erreurs 400
- ⚠️ Certains modules peuvent encore nécessiter des ajustements selon les contraintes spécifiques

---

## 🔧 Ajustements Possibles

Si certains modules génèrent encore des erreurs 400 :

1. **Vérifier les logs d'erreur** pour identifier les champs manquants
2. **Consulter la structure de la table** dans la base de données
3. **Mettre à jour les données** dans `ameliorer-donnees-test.mjs`
4. **Retester** avec `test-modules-400.mjs`

---

## 📝 Notes Techniques

### Structure des Données

Les données de test suivent cette logique :
1. **Champs obligatoires (NOT NULL)** : Toujours inclus
2. **Champs UNIQUE** : Utilisent `Date.now()` pour garantir l'unicité
3. **Champs avec valeurs par défaut** : Peuvent être omis
4. **Champs de référence (Foreign Keys)** : Utilisent des IDs existants ou des valeurs par défaut

### Normalisation des Noms

Le script normalise automatiquement les noms de modules :
- `articles-catalogue` → `articles-catalogue`
- `articles_catalogue` → `articles-catalogue`
- Conversion en minuscules pour la correspondance

---

## ✅ Checklist

- [x] Données de test améliorées pour 17 modules
- [x] Script de test spécifique créé
- [x] Intégration dans le script principal
- [x] Documentation créée
- [ ] Tests effectués après redémarrage du serveur
- [ ] Ajustements si nécessaire

---

**Prochaine action** : Redémarrer le serveur et tester avec `node scripts/test-modules-400.mjs`
