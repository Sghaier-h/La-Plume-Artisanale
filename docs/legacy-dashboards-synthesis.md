# Synthèse des dashboards legacy (prototype Apps Script)

Analyse des 4 fichiers `.tsx` du prototype Google Apps Script pour préparer l'intégration dans `docs/domain.md` (Phase 2.7 Fabrication).

---

### Dashboard: `dashboard_chef_production v2.tsx`

**Rôle utilisateur cible**: CHEF_PRODUCTION (vision globale, planificateur principal)

**Sections principales** (onglets):
- **Vue Générale**: KPIs globaux, camembert statuts, courbe TRS hebdo, alertes urgentes.
- **Planification**: Gantt drag & drop OF → machines (5 machines M2301-M2305), file OF en attente à gauche.
- **Fabrication**: KPIs process + tableau état machines avec rendement/OF en cours.
- **Coupe**: barre de progression journalière, split 1er/2ème choix, taux rebut.
- **Atelier**: compteurs par poste (Pliage, Couture, Étiquetage, Emballage) + capacité vs charge.
- **Sous-traitance**: tableau sortis/retournés/restant/conformité par ST.
- **Matières 1ères**: disponibilité, alertes, ruptures, transferts inter-entrepôts.
- Placeholders Mécanique et Magasin PF.

**KPIs affichés**: TRS moyen, Rendement, Taux panne, Taux rebut, Respect planning, Commandes actives/terminées/retard, Production du jour (pièces).

**Widgets interactifs**: drag OF vers machine (Gantt), modal Attribution QR MP (sélection cases à cocher fils par entrepôt), boutons Nouvel OF / Filtrer / Exporter, boutons Commander/Urgent sur alerte MP.

**Données consommées** (feuilles/entités simulées): OFs en attente, planning machines (avec `laize`, `vitesse`, `selecteurs`, `etat`, `qrmp[]`), stock MP (qr, code, couleur, poids, entrepôt), transferts, sous-traitants.

**Workflows métier clés**:
1. Créer un OF puis le glisser sur une machine du Gantt.
2. Attribuer les QR bobines fil (matière première) au moment du drop.
3. Suivre progression % de chaque OF en cours.
4. Déclencher un transfert inter-entrepôts si stock usine bas.
5. Consulter alertes urgentes (retard client, panne, stock critique).

**Points remarquables**:
- Machine `Panne mécanique` bloque toute planification dessus.
- Contraintes machine (`selecteurs=6` → ne pas planifier modèle 8 couleurs).
- QR MP format `Cxx_NM05_S2023` (code couleur + code fabrication + lot).

---

### Dashboard: `chef_atelier_dashboard v11.tsx`

**Rôle utilisateur cible**: CHEF_ATELIER (finition, sous-traitance externe, emballage)

**Sections principales**:
- **Par Opération**: 6 opérations (Frange, Pliage, Étiquetage, Couture, Repassage, Emballage) avec compteurs en cours/termine/attente.
- **Par Commande**: arborescence Commande → Article → Suivis (numSuivi = lot) → matrice Opérations avec `qteSortie / qteRetour / qteEnCours`.
- **Alertes**: demandes magasinier, dates envoi proches.
- **Maintenance**: liste des demandes envoyées au mécanicien (statut, priorité, équipement).
- **Analyse 2ème choix**: taux par sous-traitant + répartition types de défauts.

**KPIs affichés**: Commandes actives, Alertes urgentes, Total 2ème choix, Total opérations en cours, taux 2ème choix par ST (seuils 5%/7%).

**Widgets interactifs**: Scanner Lot (input numSuivi), Déclarer 2ème (qté + type défaut + décision), Complément urgent, Demande Maintenance (équipement/type problème/priorité), bouton Imprimer, expand/collapse par article.

**Données consommées**: commandes (avec `dateEnvoi`, `joursRestants`), articles (`refCommercial`, `modele`, `dimension`, `qteCommandee`), suivis (`numSuivi`, `qteLot`, `operations{}`, `qteDeuxieme`, `qteRebut`, `sousTraitant`), demandes maintenance, historique 2ème choix.

**Workflows métier clés**:
1. Scanner un numéro de suivi et affecter à une opération.
2. Déclarer un 2ème choix avec type de défaut et décision (garder/refaire).
3. Demander un complément fabrication au tisseur quand qté 1er choix < qté commandée.
4. Envoyer une demande de maintenance au mécanicien.
5. Analyser la performance des sous-traitants (frange notamment).

**Points remarquables**:
- Progression = `qteRetour emballage / qteCommandee`.
- Opérations codées `en_attente | en_cours | termine`.
- `sousTraitant` porté sur le suivi (ex : "AliSassi" pour frange).
- Types défauts standardisés: Tache, Couture irrégulière, Fil cassé, Dimension incorrecte, Couleur non conforme.

---

### Dashboard: `dashboard-magasinier-mp v15.tsx`

**Rôle utilisateur cible**: MAGASINIER_MP (préparation fils, alimentation machines, transferts)

**Sections principales**:
- **Vue Machines**: sidebar machines + liste OF triée par `ordrePlanification` (surplus urgents en tête).
- **Liste OF**: vue à plat de toutes les préparations.
- **Stock MP**: table QR/code/couleur avec poids par entrepôt (Usine, E1, E2).
- **Transferts**: demandes inter-entrepôts (état "En attente validation").
- **Retours & Consommations**: pour OF terminés, saisie `preparer / consomme / retour` par sélecteur.

**KPIs affichés**: Machines actives, Surplus urgents, Machines alimentées, À préparer, alertes stock bas / rupture.

**Widgets interactifs**: saisie qté préparée + scan/sélection QR MP par sélecteur, bouton Alimenter Machine, Imprimer étiquette MP préparée, modal Demander Transfert, expand/collapse OF.

**Données consommées**: préparations OF (numSousOF, machine, `selecteurs[{sel, codeFab, codeCom, couleur, besoins, preparer, qrMP}]`, `etat`, `priorite`, `surplusDemande`, `ofOrigine`), stock MP multi-entrepôt, transferts, retours.

**Workflows métier clés**:
1. Voir les OF affectés à ma machine, préparer les fils demandés par sélecteur.
2. Scanner un QR MP en stock et l'attribuer à un sélecteur.
3. Imprimer étiquette de matière préparée (par sélecteur).
4. Alimenter machine → état passe à "Machine alimentée" et OF bascule vers tisseur.
5. Demander transfert d'un entrepôt vers usine si stock insuffisant.
6. Retour MP : saisir consommé réel, calculer reliquat automatiquement.

**Points remarquables**:
- Machine du sous-OF est déjà fixée en amont (par chef de production).
- `besoins` (kg) est calculé selon BOM ; `preparer` doit être ≥ `besoins`.
- Codes MP double : `codeFab` (interne fabrication, ex NM05-01.00) + `codeCom` (commercial C29).
- Priorité "SURPLUS URGENT" liée à un `ofOrigine` (complément fabrication).

---

### Dashboard: `dashboard-tisseur v33.tsx`

**Rôle utilisateur cible**: TISSEUR (opérateur machine)

**Sections principales**:
- **Mes Machines**: OF assignés triés par machine et ordre planif ; états Machine alimentée / En attente / En cours / Terminé.
- **Incidents**: liste incidents déclarés (mécanique, MP, électrique...).
- **Mon Rendement**: rendement jour/semaine/mois + détail par OF avec valeur perte 2ème choix en TND.

**KPIs affichés**: Rendement Temps (%), Rendement Production (%), 1er choix, 2ème choix, Déchets, Temps prévu vs réel, Temps d'arrêts (Mécanique, MP, Planification), Valeur perte TND.

**Widgets interactifs**: Démarrer OF (saisie compteur initial dégressif), Fin de poste, Déclarer incident (6 types), Imprimer étiquette (début/fin/arrêt), Note tisseur, Refuser complément avec cause.

**Données consommées**: OF avec `compteurInitial / compteurActuel`, `typeCompteur` (pieces/metres), `vitesseDuites`, `selecteurs[]`, `noteSpeciale` (planif), `instructionSpeciale` (tech), `noteTisseur` (retour terrain), incidents.

**Workflows métier clés**:
1. Démarrer OF : confirmer qté et programmer compteur machine (dégressif).
2. Déclarer incident (mécanique / MP manque / électrique / programme / carton).
3. Imprimer étiquette début poste, arrêt, fin fabrication (pour coupeur), fin de poste.
4. Refuser un complément tissage avec motif.
5. Consulter son rendement et coût du 2ème choix.

**Points remarquables**:
- Compteur machine dégressif (pièces ou mètres selon config machine).
- Rendement temps = `(temps prévu / temps réel hors arrêts)`.
- Trois catégories d'arrêt distinctes : mécanique, MP, planification (chacune exclue du rendement).
- Complément tissage crée un sous-OF `.1` avec ordre 0 (prioritaire).

---

## Synthèse cross-dashboard

### Terminologie clé récurrente
- **OF / numSousOF**: ordre de fabrication (ex `OF249780`, sous-OF `.1` pour compléments).
- **numCommande**: `CM-FTxxxx` ; **client**: `CLxxxxx`.
- **numSuivi**: identifiant lot de coupe (`OF244984-1` … `-N`), 5 pièces/étiquette par défaut.
- **refCommercial** / **refFabrication**: référence article (ex `AR1020-B02-04`, `NDL1020-B12-01`).
- **codeFab** (interne, ex `NM05-01.00`) vs **codeCom** (commercial couleur, ex `C29`).
- **Sélecteur** `S01..S06`: emplacement couleur sur machine ; contrainte # sélecteurs machine.
- **QR MP**: format `Cxx_COULEUR_NM05-XX.XX_Sxxxx` (couleur + fab + lot).
- **États OF**: `A préparer` → `En cours préparation` → `Préparé` → `Machine alimentée` → `En attente départ` → `En cours` → `Terminé`.
- **États opération atelier**: `en_attente` / `en_cours` / `termine`.
- **Priorité**: `Normal | Urgent | SURPLUS URGENT | COMPLEMENT`.
- **1er choix / 2ème choix / Déchet / Ourlet** (ourlet inclus dans 1er choix).
- **Entrepôts**: `Usine`, `E1`, `E2` (multi-entrepôts).
- **Rendement Temps** (basé durée, arrêts exclus) vs **Rendement Production** (basé qté).
- **Complément tissage**: sous-OF de rattrapage (rebuts non couverts).
- **Poids net par pièce** (Base Modèle) pour calcul colis.

### Contraintes / règles métier récurrentes
- Pas de lancement tissage tant que MP pas préparée + machine alimentée (chaîne Magasinier→Tisseur).
- Attribution QR MP obligatoire avant démarrage (chef production ET magasinier valident).
- Nombre de sélecteurs modèle ≤ sélecteurs machine.
- Machine `en panne` bloque planification.
- Suivi propagé partout : déplacer un OF → notifs Magasinier MP, Tisseur, Coupeur, Mécanicien.
- Un OF urgent s'affiche en rouge sur tous les postes concernés.
- Retour MP obligatoire après fin fab (consommé + reliquat).
- 2ème choix déclaré côté atelier remonte en analyse par sous-traitant.
- Complément fabrication demandé par coupeur/atelier → validé/refusé par tisseur (cause obligatoire).
- Coupeur incrémente numSuivi ; nouvelles étiquettes seulement quand fabrication finie (dernière peut avoir <5 pcs).

### Éléments à ne PAS reproduire
- Données mockées en dur (`useState` initial) : à remplacer par API/DB.
- `alert()` de confirmation programmation machine → utiliser toast/modal propre.
- Calculs de rendement hardcodés dans le tableau récap (jour/semaine/mois figés).
- Prix unitaire `2.5 TND` hardcodé pour perte 2ème choix.
- Filtrage par état basé sur chaînes littérales françaises ("En cours", "Machine alimentée") → utiliser enum backend.
- Duplication de la logique de tri (surplus + ordrePlanification) répétée dans chaque dashboard.
- Impression via bouton simulé sans intégration imprimante réelle (Bluetooth/Zebra) — à concevoir côté service impression.
- Sections marquées "en construction" (Mécanique, Magasin PF côté Chef Prod) : à traiter comme portées manquantes, pas comme features.
