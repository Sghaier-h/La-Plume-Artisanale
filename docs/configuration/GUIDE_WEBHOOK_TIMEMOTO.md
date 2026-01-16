# 🔗 Guide d'Intégration Webhooks TimeMoto

## 📋 Configuration dans TimeMoto

### 1. Événements à sélectionner

Dans l'interface TimeMoto, sélectionnez ces événements pour recevoir les données de pointage :

#### ✅ Événements essentiels :
- `attendance.inserted` - Nouvelle présence enregistrée
- `attendance.updated` - Présence modifiée
- `attendance.deleted` - Présence supprimée
- `user.inserted` - Nouvel utilisateur créé
- `user.updated` - Utilisateur modifié
- `user.deleted` - Utilisateur supprimé

#### 📝 Configuration du Webhook :

1. **Name** : `GPAO Pointage Integration`
2. **URL** : `https://votre-domaine.com/api/webhooks/timemoto/pointage`
   - Remplacez `votre-domaine.com` par votre URL de production/staging
3. **Status** : `Active`
4. **Version** : Sélectionnez la version API TimeMoto (généralement la plus récente)
5. **Events** : Sélectionnez tous les événements listés ci-dessus

### 2. Structure des données reçues

TimeMoto enverra des webhooks avec cette structure :

```json
{
  "event": "attendance.inserted",
  "timestamp": "2025-10-19T14:30:00Z",
  "data": {
    "id": "attendance_123",
    "user_id": "user_456",
    "date": "2025-10-19",
    "check_in": "2025-10-19T08:00:00Z",
    "check_out": "2025-10-19T17:00:00Z",
    "hours_worked": 8.5,
    "status": "present",
    "late_minutes": 0,
    "user": {
      "id": "user_456",
      "name": "Marie Martin",
      "email": "marie.martin@entreprise.local"
    }
  }
}
```

## 🔧 Configuration Backend

### Endpoint Webhook à créer

L'endpoint recevra les webhooks et mettra à jour automatiquement les données de pointage dans notre système.
