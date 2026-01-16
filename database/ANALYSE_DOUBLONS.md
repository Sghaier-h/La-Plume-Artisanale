# 📊 Analyse des Fichiers SQL Suspects de Doublons

## ✅ Résultat de l'Analyse

**Aucun doublon exact détecté.** Les fichiers sont des versions différentes ou améliorées.

## 📋 Comparaison Détaillée

### 1. Modules Coûts
- **18_modules_couts.sql** : 273 lignes, **6 tables**
  - `couts_of_theoriques`
  - `analyses_couts`
  - `ecarts_couts`
  - `budgets_couts`
  - `lignes_budget_couts`
  - `historique_couts`
  
- **20_modules_couts.sql** : 321 lignes, **7 tables**
  - `budgets`
  - `lignes_budget`
  - `analyses_couts`
  - `ecarts_couts`
  - `rapports_couts`
  - `alertes_couts`
  - `parametres_couts`

**Conclusion** : Versions différentes. **Conserver les deux** ou fusionner.

### 2. Planification Gantt
- **19_modules_planification_gantt.sql** : 316 lignes, **7 tables**
  - `projets`
  - `taches_planification`
  - `dependances_taches`
  - `ressources_projet`
  - `affectations_ressources`
  - `jalons_projet`
  - `suivi_progression`
  
- **20_modules_gantt_planification.sql** : 267 lignes, **6 tables**
  - `projets`
  - `taches_projet`
  - `dependances_taches`
  - `ressources_projet`
  - `affectations_ressources`
  - `jalons`

**Conclusion** : Versions différentes (noms de tables légèrement différents). **Conserver les deux** ou choisir la version la plus complète.

### 3. Multi-Société
- **19_modules_multisociete.sql** : 210 lignes, **5 tables**
  - `societes`
  - `utilisateurs_societes`
  - `parametres_societe`
  - `donnees_societe`
  - `historique_changements`
  
- **21_modules_multisociete.sql** : 259 lignes, **6 tables**
  - `societes`
  - `etablissements`
  - `utilisateurs_societes`
  - `parametres_societe`
  - `donnees_societe`
  - `historique_changements`

**Conclusion** : Version améliorée (ajout de `etablissements`). **Conserver 21_modules_multisociete.sql**, supprimer 19_modules_multisociete.sql.

### 4. Communication Externe
- **21_modules_communication_externe.sql** : 267 lignes, **7 tables**
  - Version moins complète
  
- **22_modules_communication_externe.sql** : 318 lignes, **7 tables**
  - Version plus complète avec plus de fonctionnalités

**Conclusion** : **22_modules_communication_externe.sql est plus complet**. **Supprimer 21_modules_communication_externe.sql**.

### 5. E-commerce IA
- **22_modules_ecommerce_ia.sql** : 307 lignes, **8 tables**
  - `boutiques_en_ligne`
  - `produits_ecommerce`
  - `commandes_ecommerce`
  - `recommandations_ia`
  - `analyses_ventes_ia`
  - `campagnes_marketing`
  - `avis_clients`
  - `statistiques_boutique`
  
- **23_modules_ecommerce_ia.sql** : 256 lignes, **7 tables**
  - `boutiques`
  - `produits_boutique`
  - `commandes_boutique`
  - `recommandations_ia`
  - `analyses_ventes_ia`
  - `campagnes_marketing`
  - `avis_clients`

**Conclusion** : Versions différentes (noms de tables différents). **Conserver les deux** ou fusionner.

## 🗑️ Fichiers à Supprimer

1. ✅ **21_modules_communication_externe.sql** (remplacé par 22_modules_communication_externe.sql)
2. ⚠️ **19_modules_multisociete.sql** (remplacé par 21_modules_multisociete.sql) - À confirmer

## 📝 Recommandations

1. **Fusionner les modules coûts** : Créer un seul fichier complet combinant les deux versions
2. **Choisir une version Gantt** : Garder la version la plus complète (19_modules_planification_gantt.sql)
3. **Fusionner e-commerce IA** : Créer un seul fichier combinant les deux versions
