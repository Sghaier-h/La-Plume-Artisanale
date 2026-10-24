# Commandes Rapides - Test CRUD

## 🚀 Commandes à Exécuter

### Étape 1 : Démarrer le Serveur (Terminal 1)

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm start
```

**Attendez** le message : `✅ Serveur démarré sur le port 5000`

### Étape 2 : Exécuter les Tests (Terminal 2 - Nouveau Terminal)

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/test-crud-apres-creation-tables.mjs
```

## 📋 Commandes Alternatives

### Tester tous les contrôleurs (script complet)

```bash
node scripts/test-crud-complet-v2.mjs
```

### Tester un contrôleur spécifique avec cURL

```bash
# Test GET
curl http://localhost:5000/api/qualite-avancee

# Test POST
curl -X POST http://localhost:5000/api/qualite-avancee -H "Content-Type: application/json" -d "{\"name\": \"Test\", \"description\": \"Test\"}"

# Test GET by ID
curl http://localhost:5000/api/qualite-avancee/1

# Test PUT
curl -X PUT http://localhost:5000/api/qualite-avancee/1 -H "Content-Type: application/json" -d "{\"name\": \"Test Modifié\"}"

# Test DELETE
curl -X DELETE http://localhost:5000/api/qualite-avancee/1
```

### Vérifier les tables dans PostgreSQL

```sql
-- Dans votre client PostgreSQL, exécutez :
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'qualite%'
ORDER BY table_name;
```

## ⚠️ Problèmes Courants

### Le serveur ne démarre pas

```bash
# Vérifier si le port est utilisé
netstat -ano | findstr :5000

# Tuer le processus si nécessaire (remplacez PID par le numéro du processus)
taskkill /PID <PID> /F
```

### Erreur de connexion à la base de données

Vérifiez le fichier `.env` :
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=votre_mot_de_passe
```

### Le script de test ne trouve pas le serveur

1. Vérifiez que le serveur est bien démarré
2. Vérifiez l'URL dans le script (par défaut : `http://localhost:5000`)
3. Vérifiez qu'il n'y a pas de firewall qui bloque

## 📊 Résultats Attendus

### ✅ Succès
```
✅ Serveur accessible
✅ mobile - 5/5 tests réussis
✅ email - 5/5 tests réussis
✅ qualite-avancee - 5/5 tests réussis
...
✅ Tests réussis: 50/50 (100%)
```

### ⚠️ Partiel
```
✅ Serveur accessible
⚠️ mobile - 3/5 tests réussis
  ✗ POST: 500 (erreur serveur)
  ✗ PUT: 500 (erreur serveur)
```

Dans ce cas, vérifiez les logs du serveur pour voir l'erreur exacte.

## 🎯 Test Rapide d'une Seule Route

Pour tester rapidement une seule route sans exécuter tout le script :

```bash
# Test simple GET
curl http://localhost:5000/api/qualite-avancee

# Si ça retourne [] ou une liste, c'est bon !
# Si ça retourne une erreur, vérifiez les logs du serveur
```
