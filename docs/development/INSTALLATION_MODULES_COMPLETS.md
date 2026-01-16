# 📦 Installation des Modules Complets

## ✅ Tous les modules ont été créés !

### 📋 Étapes d'Installation

#### 1. Backend - Installer les nouvelles dépendances

```bash
cd La-Plume-Artisanale/backend
npm install pdfkit exceljs
```

#### 2. Base de Données - Exécuter les scripts SQL

Exécuter dans l'ordre :

```bash
# Depuis le dossier database
psql -U postgres -d votre_base -f 05_tables_catalogue.sql
psql -U postgres -d votre_base -f 06_tables_selecteurs.sql
psql -U postgres -d votre_base -f 07_tables_stock_multi_entrepots.sql
psql -U postgres -d votre_base -f 08_tables_tracabilite_lots.sql
```

#### 3. Redémarrer le Backend

```bash
cd La-Plume-Artisanale/backend
npm run dev
```

#### 4. Redémarrer le Frontend

```bash
cd La-Plume-Artisanale/frontend
npm start
```

## 🎯 Modules Disponibles

### Navigation Principale

1. **Dashboard** - Vue d'ensemble
2. **Catalogue Articles** - Gestion catalogue avec BOM
3. **Articles** - Articles simples
4. **Clients** - Gestion clients
5. **Fournisseurs** - Gestion fournisseurs
6. **Commandes** - Gestion commandes
7. **Machines** - Inventaire machines
8. **Ordres de Fabrication** - Gestion OF
9. **Planning** - Planning drag & drop
10. **Suivi Fabrication** - Suivi production
11. **Matières Premières** - Gestion MP
12. **Sous-traitants** - Gestion sous-traitance
13. **Paramétrage** - Paramètres système
14. **Paramètres Catalogue** - Dimensions, finitions, couleurs, modèles

## 📝 Notes Importantes

1. **Mode Mock** : Tous les contrôleurs supportent le mode mock (`USE_MOCK_AUTH=true`) pour le développement sans base de données.

2. **Tables Manquantes** : Si certaines tables n'existent pas encore, le code retourne des données mock automatiquement.

3. **QR Codes** : La génération de QR codes nécessite la bibliothèque `qrcode` (déjà installée).

4. **PDF/Excel** : Les générations de documents nécessitent `pdfkit` et `exceljs` (à installer).

## 🚀 Le système est complet et prêt à être utilisé !
