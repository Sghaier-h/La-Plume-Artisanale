# 📑 Index de la Documentation

Guide pour trouver rapidement la documentation dont vous avez besoin.

## 🎯 Par Objectif

### Je veux comprendre la structure de la base de données

1. **Documentation complète** → `DOCUMENTATION_MODULES.md`
   - Toutes les tables avec leurs colonnes
   - Relations entre tables
   - Fonctionnalités frontend par module

2. **Résumé rapide** → `RESUME_MODULES.md`
   - Vue d'ensemble des modules
   - Tables principales
   - Fonctionnalités clés

### Je veux importer des données

1. **Guide d'import** → `../imports/README.md`
2. **Statut des imports** → `IMPORT_DONNÉES_RÉELLES.md`
3. **Vérifier les imports** → `VERIFIER_IMPORT_DONNEES.md`

### Je veux naviguer dans les fichiers

1. **Index des scripts** → `../INDEX_SCRIPTS.md`
2. **Organisation visuelle** → `../ORGANISATION_VISUELLE.md`
3. **Liste complète** → `../LISTE_COMPLETE_FICHIERS.md`

---

## 📖 Par Module

### Module Clients
- **Documentation complète** : `DOCUMENTATION_MODULES.md` → Section "Module Clients (CRM Enrichi)"
- **Résumé** : `RESUME_MODULES.md` → Section "1. Module Clients"

**Tables principales :**
- `clients`, `categories_clients`, `types_commerciaux`, `adresses_client`, `contacts_client`

**Pages Frontend :**
- `Clients.tsx`, `ClientDetails.tsx`

---

### Module Ventes
- **Documentation complète** : `DOCUMENTATION_MODULES.md` → Section "Module Ventes"
- **Résumé** : `RESUME_MODULES.md` → Section "2. Module Ventes"

**Tables principales :**
- `devis`, `lignes_devis`, `commandes`, `articles_commande`

**Pages Frontend :**
- `Devis.tsx`, `Commandes.tsx`, `CommandeDetails.tsx`

---

### Module Articles & Catalogue
- **Documentation complète** : `DOCUMENTATION_MODULES.md` → Section "Module Articles & Catalogue"
- **Résumé** : `RESUME_MODULES.md` → Section "3. Module Articles & Catalogue"

**Tables principales :**
- `articles_catalogue`, `parametres_modeles`, `parametres_types_personnalisation`

**Pages Frontend :**
- `Articles.tsx`, `Modeles.tsx`, `ArticlesCatalogue.tsx`

---

### Module Utilisateurs & Groupes
- **Documentation complète** : `DOCUMENTATION_MODULES.md` → Section "Module Utilisateurs & Groupes"
- **Résumé** : `RESUME_MODULES.md` → Section "4. Module Utilisateurs & Groupes"

**Tables principales :**
- `utilisateurs`, `groupes`, `utilisateurs_roles`, `utilisateurs_dashboards`

**Pages Frontend :**
- `Equipe.tsx`, `Login.tsx`

---

### Module Facturation
- **Documentation complète** : `DOCUMENTATION_MODULES.md` → Section "Module Facturation"
- **Résumé** : `RESUME_MODULES.md` → Section "5. Module Facturation"

**Tables principales :**
- `factures_clients`, `lignes_facture`, `paiements_clients`

**Pages Frontend :**
- `Facture.tsx`, `Avoir.tsx`

---

### Module Livraisons
- **Documentation complète** : `DOCUMENTATION_MODULES.md` → Section "Module Livraisons"
- **Résumé** : `RESUME_MODULES.md` → Section "6. Module Livraisons"

**Tables principales :**
- `livraisons`, `lignes_livraison`

**Pages Frontend :**
- `BonLivraison.tsx`

---

## 🔍 Recherche Rapide

| Je cherche... | Fichier |
|--------------|---------|
| **Toutes les tables d'un module** | `DOCUMENTATION_MODULES.md` |
| **Colonnes d'une table** | `DOCUMENTATION_MODULES.md` → Section du module |
| **Relations entre tables** | `DOCUMENTATION_MODULES.md` → Section "Relations" |
| **Fonctionnalités frontend** | `DOCUMENTATION_MODULES.md` → Section "Fonctionnalités Frontend" |
| **Vue d'ensemble rapide** | `RESUME_MODULES.md` |
| **Script SQL d'un module** | `../INDEX_SCRIPTS.md` |
| **Page frontend d'un module** | `DOCUMENTATION_MODULES.md` → Section "Pages Frontend" |

---

## 📊 Structure de la Documentation

```
docs/
├── DOCUMENTATION_MODULES.md    ← Documentation complète (⭐ Principal)
├── RESUME_MODULES.md           ← Résumé rapide
├── INDEX_DOCUMENTATION.md      ← Vous êtes ici
├── IMPORT_DONNÉES_RÉELLES.md  ← Suivi des imports
└── VERIFIER_IMPORT_DONNEES.md ← Guide de vérification
```

---

**💡 Conseil** : Commencez par `DOCUMENTATION_MODULES.md` pour une vue complète, puis utilisez `RESUME_MODULES.md` pour une référence rapide.
