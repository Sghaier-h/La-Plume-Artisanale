# 🔍 Vérification de l'Import des Données

Ce guide vous permet de vérifier que toutes les données ont bien été importées dans votre base de données.

## 📋 Script de Vérification

Le script `database/imports/10_verifier_import_donnees.sql` vérifie :

1. **Attributs** (Paramètres Catalogue)
   - Types de Produits
   - Types de Tissages
   - Dimensions
   - Types de Finitions
   - Nombre de Couleurs
   - Couleurs
   - Types de Personnalisation

2. **Modèles**
   - Nombre total de modèles
   - Modèles avec relations (Type Produit, Type Tissage)
   - Modèles actifs

3. **Articles**
   - Nombre total d'articles
   - Articles dans le catalogue
   - Articles avec modèle associé
   - Articles actifs

4. **Clients**
   - Nombre total de clients
   - Clients vs Prospects
   - Clients avec adresses
   - Clients avec contacts
   - Clients actifs

5. **Commandes**
   - Nombre total de commandes
   - Nombre de lignes de commande
   - Lignes avec personnalisation
   - Commandes actives

6. **Utilisateurs**
   - Nombre total d'utilisateurs
   - Utilisateurs avec groupes
   - Utilisateurs avec dashboards
   - Utilisateurs actifs

7. **Groupes**
   - Liste des groupes créés

## 🚀 Exécution du Script

### Méthode 1 : Via pgAdmin ou DBeaver

1. Ouvrez votre outil de gestion de base de données (pgAdmin, DBeaver, etc.)
2. Connectez-vous à votre base de données PostgreSQL
3. Ouvrez le fichier `database/imports/10_verifier_import_donnees.sql`
4. Exécutez le script
5. Consultez les résultats dans l'onglet "Messages" ou "Output"

### Méthode 2 : Via psql (ligne de commande)

```bash
psql -U votre_utilisateur -d votre_base_de_donnees -f database/imports/10_verifier_import_donnees.sql
```

### Méthode 3 : Via PowerShell (si vous avez psql installé)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
$env:PGPASSWORD="votre_mot_de_passe"
psql -U votre_utilisateur -d votre_base_de_donnees -f database/imports/10_verifier_import_donnees.sql
```

## 📊 Résultats Attendus

Selon le document `IMPORT_DONNÉES_RÉELLES.md`, vous devriez avoir :

- ✅ **Types de Produits** : ~15
- ✅ **Types de Tissages** : ~5
- ✅ **Dimensions** : ~24
- ✅ **Types de Finitions** : ~6
- ✅ **Couleurs** : ~37
- ✅ **Modèles** : ~95
- ✅ **Articles** : ~1503
- ✅ **Commandes** : ~15
- ✅ **Lignes de Commande** : ~1326
- ✅ **Clients** : Au moins 14 (créés automatiquement lors de l'import des commandes)

## ⚠️ Si des Données Manquent

Si le script indique que certaines données manquent :

1. **Vérifiez les scripts d'import** dans `database/imports/`
2. **Vérifiez les logs** lors de l'exécution des scripts
3. **Ré-exécutez les scripts manquants** dans l'ordre :
   - `00_attributs.sql` (Attributs de base)
   - `01_modeles.sql` (Structure des modèles)
   - `01_modeles_data.sql` (Données des modèles)
   - `03_articles_data.sql` (Articles)
   - `04_structure_commandes.sql` (Structure des commandes)
   - `04_commandes_data.sql` (Commandes)
   - `05_utilisateurs_data.sql` (Utilisateurs)
   - `08_structure_clients_enrichie.sql` (Structure clients enrichie)

## 🔧 Dépannage

### Erreur : "relation does not exist"

Cela signifie qu'une table n'existe pas. Exécutez d'abord les scripts de structure avant les scripts de données.

### Erreur : "permission denied"

Vérifiez que votre utilisateur PostgreSQL a les droits nécessaires sur la base de données.

### Aucune donnée n'apparaît

1. Vérifiez que vous êtes connecté à la bonne base de données
2. Vérifiez que les scripts d'import ont bien été exécutés
3. Vérifiez les logs d'erreur lors de l'exécution des scripts

---

**Note** : Ce script est en lecture seule et ne modifie pas les données.
