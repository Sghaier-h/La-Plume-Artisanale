# params-numerotation-v2 (§16bis)

## Endpoints
- `GET  /api/v2/params/numerotation`                    — liste tous les codes
- `GET  /api/v2/params/numerotation/:code`
- `PUT  /api/v2/params/numerotation/:code`              — modifier config (préfixe/format/longueur/template)
- `POST /api/v2/params/numerotation/:code/reset`        — admin only
- `POST /api/v2/params/numerotation/:code/apercu`       — simulateur (n'incrémente pas)
- `POST /api/v2/params/numerotation/next`               — **émission atomique** `{ code_document, contexte?, extra? }`

## `NumeroSequenceService.next()`

Transaction pgSQL avec `SELECT ... FOR UPDATE` sur la ligne concernée →
zéro doublon en concurrence. Reset auto annuel/mensuel selon `reset_sequence`.
Ligne d'audit obligatoire dans `audit_numerotation` (ancienne_seq, nouvelle_seq,
numero_emis, contexte, id_user, reset_effectue).

### Template

Le `template` (colonne `parametres_numerotation.template`) supporte :
- `{prefixe}` `{suffixe}` `{sep}` — depuis la config
- `{AAAA}` `{AA}` `{MM}` — date d'émission
- `{seq:N}` — séquence avec zero-padding sur N chiffres
- `{ordre:N}` — pour numéros COL (colisage, séquence par BL)
- toute clé `{xxx}` passée dans `extra` (ex : `{JOURNAL}` pour les écritures comptables)

Ex : `{prefixe}{AAAA}{MM}{seq:5}` avec prefixe=`FA-` et seq=123 → `FA-20260900123`.
