# Guide Étape par Étape - Test CRUD

## 📋 Prérequis

Avant de commencer, assurez-vous que :
- ✅ Les tables sont créées dans la base de données
- ✅ Le serveur backend peut démarrer
- ✅ Vous avez Node.js installé

## 🚀 Étape 1 : Démarrer le Serveur Backend

### Terminal 1 : Démarrer le serveur

```bash
# Aller dans le dossier backend
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

# Démarrer le serveur
npm start
```

**Attendez** que vous voyiez un message comme :
```
✅ Serveur démarré sur le port 5000
✅ Connecté à PostgreSQL
```

**⚠️ Important** : Laissez ce terminal ouvert et le serveur en cours d'exécution.

## 🧪 Étape 2 : Exécuter le Script de Test

### Terminal 2 : Ouvrir un nouveau terminal

Ouvrez un **nouveau terminal** (laissez le premier avec le serveur en cours d'exécution).

```bash
# Aller dans le dossier backend
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

# Exécuter le script de test
node scripts/test-crud-apres-creation-tables.mjs
```

## 📊 Résultats Attendus

### ✅ Succès

Vous devriez voir quelque chose comme :

```
🧪 Test CRUD après création des tables

================================================================================
🔍 Vérification de l'accessibilité du serveur...
✅ Serveur accessible

📦 Test de 10 contrôleurs prioritaires...

Testing mobile...
  ✅ 5/5 tests réussis

Testing email...
  ✅ 5/5 tests réussis

Testing qualite-avancee...
  ✅ 5/5 tests réussis

...

================================================================================
📊 RÉSUMÉ DES TESTS
================================================================================
✅ Tests réussis: 50/50 (100%)
📦 Contrôleurs testés: 10
```

### ⚠️ Erreurs Possibles

#### Erreur : "Le serveur backend n'est pas accessible"

**Solution** :
1. Vérifiez que le serveur est bien démarré dans le Terminal 1
2. Vérifiez que le port 5000 n'est pas utilisé par un autre processus
3. Vérifiez l'URL dans le script (par défaut : `http://localhost:5000`)

#### Erreur : "500 Internal Server Error"

**Causes possibles** :
- Les tables n'existent pas dans la base de données
- Problème de connexion à la base de données
- Erreur dans le contrôleur

**Solution** :
1. Vérifiez les logs du serveur backend (Terminal 1)
2. Vérifiez que les tables existent (voir section "Vérifier les Tables")
3. Vérifiez la connexion à la base de données dans `.env`

#### Erreur : "404 Not Found"

**Causes possibles** :
- Les routes ne sont pas enregistrées
- Le module n'est pas chargé

**Solution** :
1. Vérifiez que les routes sont dans le `manifest.js` du module
2. Vérifiez les logs du serveur pour voir les routes enregistrées

## 🔍 Étape 3 : Interpréter les Résultats

### Codes de Statut HTTP

- **200** : ✅ Succès
- **201** : ✅ Créé avec succès (POST)
- **404** : ⚠️ Normal pour les IDs fictifs (GET by ID, PUT, DELETE avec ID inexistant)
- **400** : ⚠️ Erreur de validation (vérifiez les données envoyées)
- **500** : ❌ Erreur serveur (vérifiez les logs)

### Exemple de Résultat Détaillé

```
✅ mobile:
   ✓ GET: 200
   ✓ GET_BY_ID: 404  (normal, ID fictif)
   ✓ POST: 201       (création réussie)
   ✓ PUT: 200        (mise à jour réussie)
   ✓ DELETE: 200     (suppression réussie)
```

## 🎯 Test d'un Contrôleur Spécifique

Si vous voulez tester un contrôleur spécifique, vous pouvez modifier le script ou utiliser cURL :

### Test avec cURL

```bash
# Test GET (liste)
curl http://localhost:5000/api/qualite-avancee

# Test POST (création)
curl -X POST http://localhost:5000/api/qualite-avancee \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Qualité\", \"description\": \"Test\"}"

# Test GET by ID (remplacez 1 par un ID réel)
curl http://localhost:5000/api/qualite-avancee/1

# Test PUT (mise à jour)
curl -X PUT http://localhost:5000/api/qualite-avancee/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Qualité Modifié\"}"

# Test DELETE
curl -X DELETE http://localhost:5000/api/qualite-avancee/1
```

## 📝 Checklist de Test

Avant de tester, vérifiez :

- [ ] Serveur backend démarré et accessible
- [ ] Tables créées dans la base de données
- [ ] Connexion à la base de données fonctionnelle
- [ ] Variables d'environnement correctes dans `.env`

Pendant le test :

- [ ] Le script se connecte au serveur
- [ ] Les routes GET retournent 200 ou 404
- [ ] Les routes POST créent des enregistrements (201)
- [ ] Les routes PUT mettent à jour (200)
- [ ] Les routes DELETE suppriment (200)

## 🔧 Dépannage Avancé

### Voir les Logs du Serveur

Dans le Terminal 1 (où le serveur tourne), vous verrez les logs en temps réel. Si une erreur se produit, elle apparaîtra ici.

### Tester une Route Spécifique

Si une route échoue, testez-la manuellement avec cURL ou Postman pour voir l'erreur exacte.

### Vérifier les Tables

Exécutez dans votre client PostgreSQL :

```sql
-- Vérifier qu'une table existe
SELECT * FROM qualite_avancee LIMIT 1;
```

Si cette requête fonctionne, la table existe et est accessible.

## 💡 Astuces

1. **Testez d'abord un seul contrôleur** : Modifiez le script pour ne tester que `qualite-avancee` si vous voulez commencer petit.

2. **Vérifiez les logs** : Les logs du serveur backend vous donneront plus de détails sur les erreurs.

3. **Testez manuellement** : Utilisez cURL ou Postman pour tester une route spécifique si le script échoue.

## 🎉 Résultat Final

Si tous les tests passent, vous verrez :

```
✅ Tests réussis: 50/50 (100%)
📦 Contrôleurs testés: 10

✅ Tous les contrôleurs fonctionnent correctement !
```

Cela signifie que :
- ✅ Les tables sont créées
- ✅ Les contrôleurs sont implémentés
- ✅ Les routes fonctionnent
- ✅ Le système est prêt à être utilisé

## 📚 Fichiers Utiles

- `scripts/test-crud-apres-creation-tables.mjs` - Script de test principal
- `scripts/verifier-tables-existantes.sql` - Script SQL pour vérifier les tables
- `GUIDE_VERIFICATION_ET_TEST.md` - Guide complet de vérification
