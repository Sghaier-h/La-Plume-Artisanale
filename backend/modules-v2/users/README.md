# users-v2

CRUD utilisateurs + rôles + permissions (§2bis.1, §2bis.8).

## Endpoints
- `GET    /api/v2/users` — liste paginée `?q&role&actif&page&limit`
- `POST   /api/v2/users` — création (valide politique mot de passe §2bis.2)
- `GET    /api/v2/users/:id`
- `PUT    /api/v2/users/:id`
- `DELETE /api/v2/users/:id` — soft delete (actif=false)
- `GET    /api/v2/users/roles`
- `GET    /api/v2/users/permissions`

Politique password : ≥12 caractères, ≥3 catégories, pas d'email/nom/prénom dedans.
