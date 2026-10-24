# Module rh/primes-bordereaux

Bordereaux HORS BULLETIN pour les primes de rendement (§11bis.7bis).

- **Table** : `primes_bordereaux_hors_bulletin`
- **Endpoint racine** : `/api/v2/rh/primes-bordereaux`
- **Compte comptable par défaut** : **648** (charge de personnel non-CNSS)
- **Numérotation** : `BOR-{YYYY}-{seq:6}` (locking `SHARE ROW EXCLUSIVE`)
- **Contrainte** : jamais dans le bulletin de paie, jamais dans l'assiette CNSS.

## Endpoints

| Méthode | Route                                | Description |
|---------|--------------------------------------|-------------|
| GET     | `/`                                  | Liste (filtres `id_cagnotte`, `id_employe`, `statut`, `mode_versement`) |
| GET     | `/:id`                               | Détail |
| GET     | `/:id/pdf`                           | Payload JSON pour PDF (stub — TODO pdfkit) |
| POST    | `/`                                  | Création manuelle (numéro auto si absent) |
| PUT     | `/:id`                               | Modification |
| DELETE  | `/:id`                               | Suppression (autorisée uniquement si `statut='a_verser'`) |
| POST    | `/:id/verser`                        | Marque le versement (statut → `verse`) |
| POST    | `/:id/generer-ecriture-comptable`    | Débit 648 / Crédit 5310 (+ 4321 IRPP) |
| POST    | `/:id/recu-signe`                    | Enregistre signature + photo remise |

## Écriture comptable générée

Journal choisi automatiquement : `type_journal='caisse'` prioritaire, sinon `od`.

| Ligne | Compte | Libellé                                           | Débit | Crédit |
|-------|--------|---------------------------------------------------|-------|--------|
| 1     | 648    | Prime rendement hors bulletin BOR-… — Nom Prénom  | montant_dt      | 0 |
| 2     | 5310   | idem                                              | 0     | montant_net_dt |
| 3     | 4321   | idem — IRPP (si montant_irpp_dt > 0)              | 0     | montant_irpp_dt |

- Pièce : `PRM-{YYYY}-{seq:5}` scoped par journal.
- `source_type='prime_hors_bulletin'`, `source_id=id_bordereau`.
- `id_ecriture_comptable` est renseigné sur le bordereau après création
  (idempotence : une seconde tentative renvoie 400).

## Reçu signé

`POST /:id/recu-signe` accepte JSON ou multipart :
- JSON : `{ signature_url, signature_type, photo_remise_url, temoin }`
- Multipart (via multer en amont) : `req.files.signature`, `req.files.photo`
  → mappés automatiquement.
- `ip_capture` est renseigné depuis `req.ip` si absent.
- UNIQUE (`id_bordereau`) : upsert idempotent.

## PDF

`GET /:id/pdf` retourne un JSON structuré :
```json
{
  "type": "application/vnd.laplume.bordereau-prime.stub+json",
  "todo": "Générateur PDF réel à câbler (pdfkit) — payload JSON pour aperçu.",
  "bordereau": { ... },
  "recu": { ... }
}
```
Le remplacement par un vrai PDF (pdfkit / puppeteer) est isolé dans
`service.pdfPayload()` — aucune signature d'API à faire évoluer.
