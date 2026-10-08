# auth-v2

Module authentification v2 conforme §2bis du contrat.

## Endpoints
- `POST /api/v2/auth/login` — { email, password, type_appareil? }
- `POST /api/v2/auth/verify-2fa` — { session_pre_2fa, code_totp }
- `POST /api/v2/auth/refresh` — { refresh_token, id_session }
- `POST /api/v2/auth/logout` — (Bearer)
- `GET  /api/v2/auth/sessions` — sessions actives (Bearer)

## Notes
- Hash bcrypt cost 12 ; rotation JWT à chaque refresh.
- TTL différenciés par `type_appareil` (web/mobile/tablette_atelier).
- Détection au démarrage des mots de passe seed `PLAIN:` → rehash automatique via `rehashPlainPasswordsOnBoot()`.
- Ne remplace pas `backend/modules/auth/` ; à monter sous préfixe `/api/v2/auth`.
