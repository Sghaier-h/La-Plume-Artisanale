# Gestion des photos articles — Google Drive

Le Node.js ERP partage le **même stockage photos** que le projet Google Apps Script existant : un dossier Google Drive dédié au catalogue.

## Architecture

```
Frontend React
    │
    ├── POST /api/articles-catalogue/:id/photo (multipart/form-data, champ "photo")
    │     ↓
    │   Backend Node.js
    │     ↓
    │   multer (temp file /uploads/tmp)
    │     ↓
    │   googleapis → Google Drive API v3
    │     ↓
    │   public URL stockée dans articles_catalogue.image_url
    │
    └── PUT /api/articles-catalogue/:id/photo-url (JSON, URL externe)
          ↓ (pas d'upload, juste stocke l'URL)
```

## Endpoints

### 1. Upload fichier (multipart)

```bash
curl -X POST http://localhost:5000/api/articles-catalogue/123/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/image.jpg"
```

Réponse :
```json
{
  "success": true,
  "data": {
    "article": {
      "id_article": 123,
      "code_article": "AR1020-B02-03",
      "image_url": "https://drive.google.com/uc?export=view&id=1a2b3c..."
    },
    "drive": {
      "fileId": "1a2b3c...",
      "fileName": "AR1020-B02-03_1704067200000_photo.jpg",
      "publicUrl": "https://drive.google.com/uc?export=view&id=1a2b3c..."
    }
  }
}
```

- Format autorisés : jpg, jpeg, png, gif, webp
- Taille max : 10 MB
- Ancien fichier Drive supprimé automatiquement
- Permissions publiques "reader" appliquées après upload

### 2. URL externe (pas d'upload)

Pour associer une photo déjà hébergée ailleurs (CDN, Dropbox, autre Drive…) :

```bash
curl -X PUT http://localhost:5000/api/articles-catalogue/123/photo-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://example.com/photo.jpg"}'
```

### 3. Supprimer photo

```bash
curl -X DELETE http://localhost:5000/api/articles-catalogue/123/photo \
  -H "Authorization: Bearer $TOKEN"
```

Supprime le fichier Drive (si c'est une URL Drive) et met `image_url = NULL` en BDD.

## Configuration Google Drive

### Étape 1 — Créer un Service Account

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet (ou réutiliser celui du GAS)
3. Menu **IAM & Admin → Service Accounts → Create Service Account**
4. Nom : `laplume-catalogue-photos`
5. Rôle : aucun (la permission sera donnée via Drive)
6. Après création : **Keys → Add Key → JSON** → télécharger le fichier
7. Activer l'API Drive : **APIs & Services → Library → Google Drive API → Enable**

### Étape 2 — Partager le dossier Drive

1. Ouvrir le dossier Drive qui contient déjà les photos (celui du GAS)
2. Clic droit → **Share / Partager**
3. Ajouter l'email du service account (format `xxx@xxx.iam.gserviceaccount.com`)
4. Permission : **Éditeur** (pour pouvoir uploader + supprimer)
5. Copier l'**ID du dossier** depuis l'URL :
   ```
   https://drive.google.com/drive/folders/1abc123XYZ
                                            └──────┘
                                             FOLDER_ID
   ```

### Étape 3 — Configurer le backend

Dans `backend/.env` :

```env
GOOGLE_DRIVE_ENABLED=true
GOOGLE_SERVICE_ACCOUNT_JSON=/absolute/path/to/service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=1abc123XYZ
```

**Important** : Le fichier `service-account-key.json` doit être :
- **Hors du repo git** (ajouter au `.gitignore`)
- Accessible en lecture par le process Node.js
- En **production Docker**, monté en volume read-only :
  ```yaml
  volumes:
    - ./secrets/google-sa.json:/app/secrets/google-sa.json:ro
  ```

## Mode désactivé (fallback)

Si `GOOGLE_DRIVE_ENABLED != true`, l'endpoint `POST /photo` (upload fichier) retourne un 503 avec un message clair. L'endpoint `PUT /photo-url` (URL externe) reste fonctionnel — tu peux toujours coller une URL manuellement.

## Partage avec le GAS

Le GAS et le Node.js **écrivent dans le même dossier Drive**. Les photos sont identifiées par leur `fileId` Drive, qui reste stable. Le Node.js utilise le format :

```
https://drive.google.com/uc?export=view&id=<fileId>
```

Ce qui est compatible avec toutes les autres URL Drive stockées par le GAS.

## Sécurité

- Les photos uploadées sont **lisibles publiquement** (`role: reader, type: anyone`)
  → n'upload **jamais** de photo sensible
- Les tokens JWT sont requis pour appeler les endpoints
- multer valide le type MIME en amont (image uniquement)
- Taille limitée à 10 MB
- Les fichiers temporaires sont supprimés après upload (`finally` block)

## Débogage

Erreur commune : `Failed to open service account key file`
→ Vérifier le chemin absolu dans `GOOGLE_SERVICE_ACCOUNT_JSON`

Erreur : `File not found: <folderId>`
→ Le dossier n'est pas partagé avec le service account, ou l'ID est incorrect

Erreur : `insufficient permissions`
→ La permission partagée est "Lecteur" au lieu d'"Éditeur"
