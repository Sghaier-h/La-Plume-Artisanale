# Guide de Création des Tables - Contrôleurs Génériques

## 📊 Résumé

**51 tables** doivent être créées dans la base de données pour que tous les contrôleurs génériques fonctionnent correctement.

## ✅ Script SQL Généré

Un script SQL exécutable a été généré automatiquement :
- **Fichier** : `scripts/create-tables-generiques-executable.sql`
- **Contenu** : 51 commandes `CREATE TABLE IF NOT EXISTS`
- **Structure** : Chaque table inclut les colonnes de base (ID, name, description, active, timestamps, audit)

## 🚀 Méthodes d'Exécution

### Méthode 1 : Via psql (Ligne de commande)

```bash
# Windows (PowerShell ou CMD)
psql -h localhost -p 5432 -U Aviateur -d ERP_La_Plume -f scripts/create-tables-generiques-executable.sql

# Linux/Mac
psql -h localhost -p 5432 -U Aviateur -d ERP_La_Plume -f scripts/create-tables-generiques-executable.sql
```

**Note** : Vous serez invité à saisir le mot de passe PostgreSQL.

### Méthode 2 : Via un Client PostgreSQL (Recommandé)

#### Avec pgAdmin
1. Ouvrir pgAdmin
2. Se connecter au serveur PostgreSQL
3. Sélectionner la base de données `ERP_La_Plume`
4. Cliquer sur "Query Tool" (Outil de requête)
5. Ouvrir le fichier `scripts/create-tables-generiques-executable.sql`
6. Exécuter le script (F5 ou bouton "Execute")

#### Avec DBeaver
1. Ouvrir DBeaver
2. Se connecter à la base de données PostgreSQL
3. Sélectionner la base de données `ERP_La_Plume`
4. Menu : SQL Editor → Open SQL Script
5. Sélectionner `scripts/create-tables-generiques-executable.sql`
6. Exécuter le script (Ctrl+Enter ou bouton "Execute")

#### Avec VS Code (Extension PostgreSQL)
1. Installer l'extension "PostgreSQL" dans VS Code
2. Se connecter à la base de données
3. Ouvrir le fichier `scripts/create-tables-generiques-executable.sql`
4. Exécuter le script

### Méthode 3 : Via Node.js (Automatique)

Si vous corrigez les identifiants de connexion dans `.env`, vous pouvez exécuter :

```bash
cd backend
node scripts/create-tables-generiques.mjs
```

Le script se connectera automatiquement et créera toutes les tables.

## 📋 Liste des Tables à Créer

Les 51 tables suivantes seront créées :

1. mobile
2. email
3. settings
4. multisociete
5. whatsapp
6. social_auth
7. ai
8. warehouse
9. accounting_tunisia
10. payroll_tunisia
11. pos
12. excel_import
13. audit
14. utilisateurs
15. pointage
16. database
17. migration
18. webhooks
19. ecommerce
20. communication
21. reports
22. couts
23. qualite_avance
24. planification_gantt
25. maintenance
26. produits
27. messages
28. notifications
29. taches
30. documents
31. qualite_avancee
32. tracabilite_lots
33. stock_multi_entrepots
34. planning_dragdrop
35. selecteurs_machines
36. articles_catalogue
37. modeles
38. parametres_catalogue
39. suivi_fabrication
40. matieres_premieres
41. parametrage
42. planning
43. production
44. dashboard
45. soustraitants
46. of
47. machines
48. bons_retour
49. bons_livraison
50. avoirs
51. search

## 🔍 Structure Standard des Tables

Chaque table suit cette structure de base :

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id_field SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);
```

### Colonnes

- **id_field** : Clé primaire auto-incrémentée (spécifique à chaque table)
- **name** : Nom de l'enregistrement
- **description** : Description textuelle
- **active** : Statut actif/inactif (par défaut: true)
- **created_at** : Date de création (automatique)
- **updated_at** : Date de mise à jour
- **created_by** : ID de l'utilisateur créateur
- **updated_by** : ID de l'utilisateur modificateur

## ⚠️ Notes Importantes

1. **CREATE TABLE IF NOT EXISTS** : Le script utilise cette commande pour éviter les erreurs si une table existe déjà. Les tables existantes ne seront pas modifiées.

2. **Colonnes supplémentaires** : Vous devrez peut-être ajouter des colonnes supplémentaires selon vos besoins métier spécifiques. Le script crée une structure de base minimale.

3. **Tables existantes** : Si certaines tables existent déjà avec une structure différente, elles ne seront pas modifiées. Vérifiez manuellement si nécessaire.

4. **Permissions** : Assurez-vous que l'utilisateur PostgreSQL a les permissions nécessaires pour créer des tables.

## ✅ Vérification Après Création

Après avoir créé les tables, vérifiez qu'elles existent :

```bash
cd backend
node scripts/verifier-tables-database.mjs
```

Ce script vérifiera l'existence de toutes les tables et affichera un rapport détaillé.

## 🔧 Dépannage

### Erreur : "permission denied"
- Vérifiez que l'utilisateur PostgreSQL a les droits CREATE
- Connectez-vous en tant qu'utilisateur avec les privilèges appropriés

### Erreur : "relation already exists"
- C'est normal si vous utilisez `CREATE TABLE IF NOT EXISTS`
- Les tables existantes ne seront pas modifiées

### Erreur : "syntax error"
- Vérifiez que vous utilisez la bonne version de PostgreSQL
- Le script utilise la syntaxe PostgreSQL standard

### Erreur de connexion
- Vérifiez les paramètres de connexion dans `.env`
- Vérifiez que PostgreSQL est démarré
- Vérifiez que l'IP est autorisée (si base distante)

## 📝 Prochaines Étapes

1. ✅ Script SQL généré - **FAIT**
2. ⏳ Exécuter le script SQL dans la base de données
3. ⏳ Vérifier que toutes les tables ont été créées
4. ⏳ Tester les routes CRUD avec les tables créées

## 🎉 Conclusion

Une fois les tables créées, tous les contrôleurs génériques seront opérationnels et pourront effectuer des opérations CRUD complètes sur la base de données.
