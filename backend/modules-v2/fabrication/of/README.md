# fabrication/of — v2

Ordres de fabrication (CRUD + détail complet + alimentation stock + actions
démarrer/terminer/assigner-machine) — handlers legacy portés verbatim
(Phase E4).

Les actions `démarrer`/`terminer` restent délégués aux contrôleurs du module
legacy `backend/modules/production/` (non supprimé — port prévu dans une passe
ultérieure).

Endpoints sous `/api/v2/fabrication/of`.
