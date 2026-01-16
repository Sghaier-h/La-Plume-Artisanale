# 🚀 Démarrer le Paramétrage - Guide Rapide

## ⚡ Démarrage rapide (5 minutes)

### Étape 1 : Vérifier que la base de données est initialisée

**Sur le VPS :**

```bash
# Se connecter au VPS
ssh ubuntu@137.74.40.191

# Vérifier la connexion
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT COUNT(*) FROM parametres_systeme;"
```

**Si vous obtenez un nombre > 0 :** ✅ La base est initialisée, passez à l'étape 2.

**Si vous obtenez une erreur ou 0 :** ⚠️ Exécutez d'abord les scripts d'initialisation (voir ci-dessous).

---

### Étape 2 : Exécuter le script de paramétrage initial

**Sur le VPS :**

```bash
# Aller dans le dossier database
cd /opt/fouta-erp/database

# Exporter le mot de passe (remplacez par votre mot de passe réel)
export PGPASSWORD=Allbyfouta007

# Exécuter le script de paramétrage
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f parametrage_initial.sql

# Nettoyer
unset PGPASSWORD
```

**Résultat attendu :** Vous devriez voir un tableau récapitulatif avec les éléments configurés.

---

### Étape 3 : Vérifier la configuration

**Sur le VPS :**

```bash
# Se connecter à PostgreSQL
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume
```

**Dans PostgreSQL, exécutez :**

```sql
-- Vérifier les machines
SELECT code_machine, designation, statut FROM machines WHERE actif = true;

-- Vérifier les matières premières
SELECT code_mp, designation, stock_minimum FROM matieres_premieres WHERE actif = true;

-- Vérifier les clients
SELECT code_client, raison_sociale FROM clients WHERE actif = true;

-- Vérifier les articles
SELECT code_article, designation FROM articles_catalogue WHERE actif = true;

-- Quitter
\q
```

---

## 📋 Si la base de données n'est pas initialisée

**Exécutez d'abord les scripts d'initialisation :**

```bash
cd /opt/fouta-erp/database

export PGPASSWORD=Allbyfouta007

# Exécuter dans l'ordre
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 01_base_et_securite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 02_production_et_qualite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 03_flux_et_tracabilite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 04_mobile_devices.sql

unset PGPASSWORD
```

**Puis revenez à l'Étape 2.**

---

## ✅ Vérification finale

**Tester l'API :**

```bash
# Depuis votre PC Windows (PowerShell)
curl.exe https://fabrication.laplume-artisanale.tn/health

# Tester l'authentification
curl.exe -X POST https://fabrication.laplume-artisanale.tn/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"nom_utilisateur\":\"admin\",\"mot_de_passe\":\"Admin123!\"}'
```

**Résultat attendu :** Un token JWT si l'authentification réussit.

---

## 🎯 Prochaines étapes

Une fois le paramétrage initial terminé :

1. ✅ **Personnaliser les données** selon vos besoins réels
2. ✅ **Créer vos propres machines, clients, fournisseurs**
3. ✅ **Ajouter vos matières premières**
4. ✅ **Créer vos articles du catalogue**
5. ✅ **Créer des commandes et tester le flux complet**

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **`PARAMETRAGE_INITIAL.md`** : Guide complet de paramétrage
- **`COMMENT_COMMENCER.md`** : Guide de démarrage de l'application

---

## 🆘 Problèmes courants

### Erreur : "relation does not exist"

**Solution :** Les scripts d'initialisation n'ont pas été exécutés. Exécutez-les d'abord (voir ci-dessus).

### Erreur : "password authentication failed"

**Solution :** Vérifiez le mot de passe dans la variable `PGPASSWORD` ou dans le fichier `.env`.

### Erreur : "could not connect to server"

**Solution :** 
- Vérifiez que l'IP du VPS est autorisée dans PostgreSQL OVH
- Vérifiez que le firewall n'bloque pas le port 35392

---

**✅ Paramétrage terminé !** Votre application est maintenant prête à être utilisée.

