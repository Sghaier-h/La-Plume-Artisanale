# PHASE T5 — KpiCards cliquables (généralisation UX §14ter.18)

## (a) Composants KpiCard patchés

Les deux composants partagés fournissent désormais les props `onClick?: () => void` et `active?: boolean`, avec le même comportement UX (hover scale, ring au focus, bordure accent, badge « ● Filtre actif », aria-pressed) :

- `frontend/src/components/ecommerce/KpiCard.tsx` — déjà patché Phase T0 (Commandes.tsx).
- `frontend/src/components/dashboard/KpiCard.tsx` — patché ici : ajout `active`, rendu `role="button"` + Enter/Space, bordure 2px et ring en couleur de tone quand `active=true`, badge accent « ● Filtre actif ».

## (b) Pages câblées (KpiCard → filtre liste)

| Page | Filtre câblé |
|---|---|
| `pages/Clients.tsx` | `kpiActive` (all / actifs / inactifs / prospects) + `filters.actif/type_client` |
| `pages/Devis.tsx` | `filters.statut` (BROUILLON / ACCEPTE / ENVOYE / '') |
| `pages/Facture.tsx` | `filters.statut` (REGLEE / IMPAYEE / PARTIELLEMENT_REGLEE / '') |
| `pages/Opportunities.tsx` | `filter` (ACTIVE / GAGNEE / all) |
| `pages/CrmLeads.tsx` | `statut` (all / nouveau / en_traitement / converti) |
| `pages/Articles.tsx` | `filters.actif`+`filters.catalogue` |
| `pages/Pointage.tsx` | `statutFilter` (tous / present / absent / retard) sur vue équipe |
| `pages/Maintenance.tsx` | `filters.statut` (EN_ATTENTE / EN_COURS / TERMINEE / '') |
| `pages/RhRecrutement.tsx` | `statutFilter` (tous / encours / embauche / refuse) sur Kanban |
| `pages/TracabiliteLots.tsx` | `statutFilter` (disponible / reserve / '') |
| `pages/achats/BonsCommande.tsx` | `statutFilter` (all / envoye / confirme / livre) |
| `pages/achats/FacturesFournisseur.tsx` | `statutFilter` (en_attente_paiement / payee_partiel / en_litige / all) |
| `pages/achats/ReceptionsFF.tsx` | `statutFilter` (all / en_cours / litige / valide) |
| `pages/achats/PaiementsFournisseurs.tsx` | `modeFilter` (all / virement / cheque) |
| `pages/rh/AvancesSalaires.tsx` | `statutFilter` (demande / approuvee / payee / remboursee_partiel) — ajout filtre table |
| `pages/rh/AjustementsComptesRh.tsx` | `statutFilter` (en_attente / validee / rejetee) — ajout filtre table |
| `pages/rh/CompensationsRh.tsx` | `statutFilter` (en_attente / appliquee / annulee) — ajout filtre table |
| `pages/rh/AvertissementsRh.tsx` | `filters.niveau` (info / attention / grave / sanction) |
| `pages/rh/CandidaturesTablette.tsx` | `statutFilter` ('' / reçue) — ajout filtre table |
| `pages/rh/Formations.tsx` | `statutFilter` ('' / terminee / en_cours / planifiee) |
| `pages/rh/EntretiensAnnuels.tsx` | `statutFilter` (planifie / realise / valide) |
| `pages/rh/ComptesEmployes.tsx` | `solde` (negatif / positif / '') |
| `pages/comptabilite/Caisses.tsx` | `typeFilter` (cheques_clients / compensation / '') |
| `pages/comptabilite/DepensesEspeces.tsx` | `cloturableFilter` (all / cloturee / en_attente) |
| `pages/comptabilite/CompensationsCroisees.tsx` | `statutFilter` (brouillon / validee / '') |
| `pages/comptabilite/DossiersImport.tsx` | `statutFilter` (ouvert / en_douane / liquide / '') |
| `pages/comptabilite/JournalEcritures.tsx` | `filterStatut` (all / validee / brouillon) |
| `pages/comptabilite/TvaDeclarations.tsx` | `filterStatut` (all / payee / soumise / en_preparation) |
| `pages/comptabilite/Immobilisations.tsx` | `filterCat` (all / materiel_industriel / informatique / batiment) |
| `pages/comptabilite/ApportGerant.tsx` | `typeFilter` (apport / retrait / '') |
| `pages/documents/ArchiveDocuments.tsx` | reset `type` filtre |
| `pages/documents/PhotosBoiteTri.tsx` | `filterSource` (teams / whatsapp / email / '') |
| `pages/ventes/RelancesFactures.tsx` | `filtreNiveau` (1 / 3 / 4 / tous) |
| `pages/ventes/PaiementsEcheances.tsx` | `filtreStatut` (en_retard / du / a_echoir / tous) |
| `pages/ventes/ListeColisage.tsx` | `filtreStatut` (expedie / brouillon / tous) |
| `pages/ventes/ListePalettes.tsx` | `statutFilter` (expediee / livree / preparee / '') — ajout filtre liste |
| `pages/ventes/SuiviTransporteurs.tsx` | `actifFilter` (actifs / tous) — ajout filtre liste |
| `pages/marketing/StatsPerformance.tsx` | `canalFilter` (email / whatsapp / '') — ajout filtre top table |
| `pages/ecommerce-app/StockSynchronise.tsx` | `filtreEtat` (tous / ecart / jamais_syncrhonise / ok) |
| `pages/ecommerce-app/PanierAbandonne.tsx` | `filtreStatut` (tous / relance / recupere / perdu) |
| `pages/ia/AgentsActifs.tsx` | `statutFilter` (actif / pause / '') — ajout filtre table |
| `pages/ia/ConstatsATraiter.tsx` | `filterStatut`+`filterSev` (all / danger / nouveau / valide) |

Toutes les cartes « Total / Tous » appellent `setFilter('')` ou l'équivalent pour reset. Toggle au re-clic quand pertinent. Le dropdown filtre existant reste synchronisé (même state).

## (c) Pages exclues

- Hubs opérateur §14ter.17c (14 dashboards + 10 tablettes) : KPI = indicateurs, navigation par icônes dédiées.
- Pages formulaire / détails : `ClientForm`, `SoustraitantForm`, `BonSortieST`, `BonRetourST`, `ClientDetails`, `CommandeDetails`, `CaisseDetails`, `DossierImportDetails`, `SoustraitantDetails`, `CompteEmployeDetails`, `OFDetails`, `ArticleDetails`, `ModeleDetails`, `CaisseDetails`.
- `sous-traitants/SoustraitantsListe.tsx` : les KpiCards naviguent vers d'autres pages (dashboard ST, travaux-ST), pas de filtre dans cette page — laissé en l'état (filtrage type_activite déjà fait via boutons dédiés).
- `RapprochementBancaire.tsx` : UI déjà en 3 colonnes par statut (`non_matche` / `suggere` / `rapproche`) — les KPIs reflètent les comptes, pas de liste unique à filtrer.
- `rh/BulletinsPaie.tsx` : KPIs = sommes financières (masse brute / net / CNSS / IRPP), non catégorielles.
- Pages hors scope : `DashboardCommercial`, `DashboardRHManager`, `DashboardAdministrateur`, `DashboardIA`, `DashboardChefProduction`, `DashboardControleCentral`, `DashboardMagasinierMP`, `DashboardMagasinierSoustraitants`, `DashboardPostCoupe`, `DashboardTisseur`, `ChefAtelierDashboard`, `DashboardSousTraitants`, `TableauBordMagasinPF`, `TableauBordMecanicien`, `ResponsableDashboard`, `PortailDashboard`, `Reports`, `PubliciteDigitale`, `PrimesRendement` et tous les `Tablette*`, ainsi que des pages de rapports/mesures (SeoProduits, CoutsLLM, StructureOrga, SegmentsClients, StatsWeb, VitrinePublique, Fidelite, FondCaisse, PlanComptes, ClotureExercice, RapportsCompta, DemandesAchat, ContratsServices, RapprochementBcBlFf, achats/DepensesEspeces, ContratsTravail, PaieTunisie, SanctionsPrimes, PointageTimeMoto, crm/Contacts, crm/Interactions, fabrication/*, stock/AlertesStock, EcommerceB2B).

## (d) TypeScript check

`cd frontend && npx tsc --noEmit` → **EXIT_CODE=0**.

## (e) Reste à faire

- Les pages où le filtre a été ajouté ex-nihilo (AvancesSalaires, AjustementsComptesRh, CompensationsRh, ListePalettes, SuiviTransporteurs, StatsPerformance, AgentsActifs) : vérifier à l'usage que l'API côté serveur ne pousse pas déjà un paramètre de filtre antagoniste.
- Les hubs opérateur et tablettes conservent leur navigation par icônes (hors scope §14ter.18, mais à revisiter si §14ter.17c évolue).
- Smoke-test manuel conseillé sur Devis / Facture / BonsCommande / Clients / Opportunities pour valider le toggle visuel et la cohérence avec les dropdowns de filtre existants.

Pas de commit effectué (contrainte stricte respectée).
