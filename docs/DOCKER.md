# Déploiement Docker — La Plume Artisanale ERP

## Prérequis

- Docker 20+
- Docker Compose v2+
- Base de données PostgreSQL accessible (OVH CloudDB ou locale)

## Démarrage rapide

```bash
# 1. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DB credentials, JWT secret, etc.)

# 2. Lancer l'ensemble (backend + frontend + redis)
docker compose up -d

# 3. Vérifier les logs
docker compose logs -f backend
docker compose logs -f frontend
```

L'application sera disponible sur :
- **Frontend** : http://localhost (port 80)
- **Backend API** : http://localhost:5000
- **Health check** : http://localhost:5000/health

## Architecture des containers

```
┌─────────────────────────────────────────┐
│          laplume-frontend               │
│     (Nginx + React build)  :80          │
│                                          │
│    proxy /api/*  ──────┐                │
│    proxy /socket.io/* ─┤                │
└────────────────────────┼────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────┐
│          laplume-backend                │
│     (Node.js + Express)  :5000          │
└────────┬────────────────────────┬───────┘
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│  laplume-redis   │    │   PostgreSQL     │
│     :6379        │    │  (externe/OVH)   │
└──────────────────┘    └──────────────────┘
```

## Commandes utiles

```bash
# Démarrer en arrière-plan
docker compose up -d

# Voir les logs en direct
docker compose logs -f

# Logs d'un seul service
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Rebuild après modification du code
docker compose build backend
docker compose up -d backend

# Arrêter tout
docker compose down

# Arrêter + supprimer volumes (ATTENTION perte données)
docker compose down -v

# Vérifier la santé
docker compose ps

# Exécuter une commande dans le backend
docker compose exec backend npm run test:integration

# Shell dans le backend
docker compose exec backend sh
```

## Variables d'environnement

Toutes les variables sont définies dans `.env` à la racine :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement Node | `production` |
| `DB_HOST` | Hôte PostgreSQL | `sh131616-002.eu.clouddb.ovh.net` |
| `DB_PORT` | Port PostgreSQL | `35392` |
| `DB_NAME` | Nom de la base | `ERP_La_Plume` |
| `DB_USER` | Utilisateur BDD | `Aviateur` |
| `DB_PASSWORD` | Mot de passe BDD | `...` |
| `JWT_SECRET` | Secret JWT (min 32 chars) | Random hex |
| `JWT_EXPIRE` | Durée token | `24h` |
| `FRONTEND_URL` | URL publique frontend | `https://erp.example.com` |
| `LOG_LEVEL` | Niveau de log | `info`, `warn`, `error` |

## Utiliser PostgreSQL dans Docker (optionnel)

Par défaut, le `docker-compose.yml` s'attend à ce que PostgreSQL soit externe (OVH CloudDB). Si vous voulez PostgreSQL local dans Docker :

1. Décommentez la section `postgres` dans `docker-compose.yml`
2. Changez `DB_HOST=postgres` dans `.env`
3. Créez `database/init/` avec vos fichiers `.sql` d'initialisation

## Production

Pour le déploiement en production :

1. **HTTPS** : Mettre un reverse proxy TLS devant (Traefik, Caddy, ou Nginx Let's Encrypt)
2. **Secrets** : Utiliser Docker Secrets ou un vault, pas `.env`
3. **Monitoring** : Ajouter Prometheus + Grafana
4. **Backups** : Snapshot quotidien des volumes + backup BDD
5. **Firewall** : Exposer uniquement le port 443 (et pas 5000)

## Troubleshooting

### Backend ne démarre pas
```bash
docker compose logs backend
# Vérifier la connexion BDD (DB_HOST, credentials)
```

### Frontend affiche "502 Bad Gateway"
Le backend n'est pas healthy. Vérifier :
```bash
docker compose ps
docker compose logs backend
```

### Changer le port externe
Modifier dans `docker-compose.yml` :
```yaml
frontend:
  ports:
    - "8080:80"  # 8080 au lieu de 80
```
