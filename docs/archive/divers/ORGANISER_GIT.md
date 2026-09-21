# 📁 Organisation du Dépôt Git

## 🎯 Structure Proposée

```
La-Plume-Artisanale/
├── backend/              # Code backend Node.js
├── frontend/            # Code frontend React
├── mobile/              # Code mobile (Android/iOS)
├── database/            # Scripts SQL
├── scripts/             # Scripts de déploiement et utilitaires
├── docs/                # Documentation
│   ├── deployment/      # Guides de déploiement
│   ├── configuration/   # Guides de configuration
│   ├── troubleshooting/ # Guides de dépannage
│   └── development/     # Guides de développement
├── tests/               # Tests automatisés
└── .gitignore          # Fichiers à ignorer
```

## 📋 Fichiers à Organiser

### Documentation à déplacer dans `docs/`

- Guides de déploiement → `docs/deployment/`
- Guides de configuration → `docs/configuration/`
- Guides de dépannage → `docs/troubleshooting/`
- Guides de développement → `docs/development/`

### Scripts à déplacer dans `scripts/`

- Tous les fichiers `.ps1` et `.sh` → `scripts/`

### Configuration

- `NGINX_CONFIG_CORRECTE.conf` → `docs/configuration/nginx/`
