# 🇹🇳 MODULES PAIE ET COMPTABILITÉ TUNISIE

## 📋 Résumé
Modules complets pour la gestion de la paie et de la comptabilité selon la législation tunisienne, inspirés de l10n_tn d'Odoo.

---

## 💰 MODULE PAIE TUNISIE

### Fonctionnalités Implémentées

#### ✅ Structure SQL
- **`hr_salary_rule`** : Règles salariales (CNSS, IRPP, CSS)
- **`hr_payroll_structure`** : Structures salariales
- **`hr_payslip`** (extension) : Bulletins de paie avec champs spécifiques Tunisie
- **`hr_payslip_line`** : Lignes de bulletin
- **`hr_contract`** : Contrats de travail avec situation familiale

#### ✅ Calculs Automatiques

**CNSS (Caisse Nationale de Sécurité Sociale) :**
- ✅ CNSS Salarié : 9.18% (plafond 6000 DT)
- ✅ CNSS Patronal : 16.57%
- ✅ TFP (Taxe Formation Professionnelle) : 0.5%
- ✅ FOPROLOS (Fonds Promotion Logement Salariés) : 1%

**IRPP (Impôt sur le Revenu des Personnes Physiques) :**
- ✅ Barème progressif tunisien :
  - 0-5000 DT : 0%
  - 5000-20000 DT : 15%
  - 20000-30000 DT : 25%
  - 30000-50000 DT : 35%
  - 50000+ DT : 40%
- ✅ Abattements :
  - Frais professionnels : 10% du salaire brut (plafond 1000 DT)
  - Chef de famille : 250 DT
  - Époux : 100 DT
  - Enfants : 50 DT par enfant

**CSS (Contribution Sociale de Solidarité) :**
- ✅ 1% du revenu imposable

#### ✅ Backend API
- `POST /api/payroll-tunisia/compute` : Calculer un bulletin de paie
- `GET /api/payroll-tunisia/salary-rules` : Liste des règles salariales
- `GET /api/payroll-tunisia/structures` : Liste des structures salariales
- `POST /api/payroll-tunisia/structures` : Créer une structure salariale
- `GET /api/payroll-tunisia/cnss-rates` : Taux CNSS actuels
- `GET /api/payroll-tunisia/irpp-bracket` : Barème IRPP actuel

#### ✅ Frontend
- **`PayrollTunisia.tsx`** : Page complète de calcul de bulletin avec :
  - Formulaire de saisie (employé, dates, salaire, situation familiale)
  - Calcul automatique en temps réel
  - Affichage détaillé des cotisations
  - Détails IRPP avec abattements
  - Affichage des taux CNSS

---

## 📊 MODULE COMPTABILITÉ TUNISIE

### Fonctionnalités Implémentées

#### ✅ Structure SQL
- **`account_tax`** : Taxes tunisiennes (TVA, Timbre fiscal)
- **`account_fiscal_position`** : Positions fiscales (Local, Export, Exonéré)
- **`account_fiscal_position_rule`** : Règles de positions fiscales
- **`account_withholding_tax`** : Retenues à la source
- **`account_tax_report`** : Déclarations fiscales mensuelles
- **`plan_comptable`** (extension) : Plan comptable avec champs Tunisie

#### ✅ Taxes Tunisiennes
- ✅ **TVA 19%** : Vente et Achat
- ✅ **TVA 13%** : Vente et Achat
- ✅ **TVA 7%** : Vente et Achat
- ✅ **TVA 0%** : Exonéré
- ✅ **Timbre Fiscal** : 0.600 DT (obligatoire sur factures)

#### ✅ Positions Fiscales
- ✅ **Vente Locale** : TVA applicable
- ✅ **Exportation** : Exonération TVA
- ✅ **Régime Totalement Exportateur** : Exonération complète
- ✅ **Exonéré TVA** : Pas de TVA

#### ✅ Plan Comptable Tunisien
- ✅ Structure PCG Tunisie (Classes 1-7)
- ✅ Comptes hiérarchiques (synthétiques/analytiques)
- ✅ Comptes lettrables (Clients, Fournisseurs, Banques, Caisse)
- ✅ Initialisation automatique

#### ✅ Backend API
- `GET /api/accounting-tunisia/taxes` : Liste des taxes
- `GET /api/accounting-tunisia/taxes/:id` : Détails d'une taxe
- `GET /api/accounting-tunisia/fiscal-positions` : Positions fiscales
- `GET /api/accounting-tunisia/tax-reports` : Déclarations fiscales
- `POST /api/accounting-tunisia/tax-reports/generate` : Générer déclaration
- `POST /api/accounting-tunisia/tax-reports/:id/validate` : Valider déclaration
- `GET /api/accounting-tunisia/chart-of-accounts` : Plan comptable
- `POST /api/accounting-tunisia/chart-of-accounts/init` : Initialiser plan comptable

---

## 📁 Fichiers Créés

### Database
- `database/25_paie_tunisie.sql` : Structure SQL paie Tunisie
- `database/26_comptabilite_tunisie.sql` : Structure SQL comptabilité Tunisie

### Backend
- `backend/src/controllers/payroll-tunisia.controller.js` : Contrôleur paie Tunisie
- `backend/src/controllers/accounting-tunisia.controller.js` : Contrôleur comptabilité Tunisie
- `backend/src/routes/payroll-tunisia.routes.js` : Routes paie Tunisie
- `backend/src/routes/accounting-tunisia.routes.js` : Routes comptabilité Tunisie

### Frontend
- `frontend/src/pages/odoo/PayrollTunisia.tsx` : Page calcul bulletin paie Tunisie
- `frontend/src/services/api.ts` : Services API ajoutés

---

## 🚀 Utilisation

### Paie Tunisie

1. **Accéder à la page** : `/payroll-tunisia` (à ajouter dans App.tsx)
2. **Remplir le formulaire** :
   - ID Employé
   - Dates (début/fin)
   - Salaire de base
   - Jours/heures travaillés
   - Situation familiale
   - Nombre d'enfants
   - Chef de famille (oui/non)
3. **Cliquer sur "Calculer Bulletin"**
4. **Voir les résultats** :
   - Salaire de base, brut, net
   - Déductions (CNSS, IRPP, CSS)
   - Cotisations patronales
   - Détails IRPP avec abattements

### Comptabilité Tunisie

1. **Initialiser le plan comptable** :
   ```
   POST /api/accounting-tunisia/chart-of-accounts/init
   ```

2. **Voir les taxes** :
   ```
   GET /api/accounting-tunisia/taxes
   ```

3. **Générer une déclaration fiscale** :
   ```
   POST /api/accounting-tunisia/tax-reports/generate
   Body: { period: "2024-01", report_type: "TVA", date_from: "...", date_to: "..." }
   ```

---

## ⚠️ Notes Importantes

1. **Taux et Barèmes** : Les taux CNSS, IRPP et CSS sont basés sur la législation tunisienne actuelle. Ils doivent être vérifiés et mis à jour selon les lois de finances en vigueur.

2. **Plafonds** : Le plafond CNSS (6000 DT) doit être configurable et mis à jour annuellement.

3. **Barème IRPP** : Le barème IRPP doit être vérifié chaque année selon la loi de finances.

4. **Plan Comptable** : Le plan comptable inclus est une version simplifiée du PCG Tunisie. Pour une utilisation professionnelle, il est recommandé d'utiliser le plan comptable complet officiel.

5. **Déclarations Fiscales** : Les déclarations générées doivent être vérifiées et validées avant envoi aux autorités fiscales tunisiennes.

---

## 📝 Prochaines Étapes

- [ ] Créer page frontend complète pour la comptabilité tunisienne
- [ ] Ajouter export PDF des bulletins de paie
- [ ] Intégrer déclarations CNSS (télédéclaration)
- [ ] Ajouter génération fichiers Excel pour déclarations fiscales
- [ ] Créer rapports légaux (Journal de paie, Déclaration mensuelle TVA)
- [ ] Ajouter gestion des acomptes IRPP

---

**Module créé le** : $(date)
**Version** : 1.0.0
**Basé sur** : l10n_tn d'Odoo (localisation Tunisie)
