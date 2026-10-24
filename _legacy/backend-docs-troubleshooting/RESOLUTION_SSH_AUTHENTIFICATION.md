# 🔐 Résolution : Problème d'Authentification SSH

**Erreur :** `Connection closed by 137.74.40.191 port 22`

**Diagnostic :**
- ✅ Port 22 accessible
- ✅ SSH installé
- ❌ Aucune clé SSH trouvée
- ❌ Authentification échoue

---

## 🎯 SOLUTION RAPIDE

### Option 1 : Utiliser un mot de passe (si configuré)

Essayez de vous connecter avec un mot de passe :

```bash
ssh ubuntu@137.74.40.191
```

Vous serez invité à entrer le mot de passe. Si cela fonctionne, créez ensuite le tunnel :

```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

---

### Option 2 : Générer une clé SSH

Si vous n'avez pas de clé SSH, générez-en une :

```bash
ssh-keygen -t rsa -b 4096 -C "votre_email@example.com"
```

**Puis copiez la clé publique sur le serveur :**

```bash
ssh-copy-id ubuntu@137.74.40.191
```

**Ou manuellement :**

```bash
# 1. Afficher votre clé publique
cat $env:USERPROFILE\.ssh\id_rsa.pub

# 2. Copier le contenu et l'ajouter sur le serveur dans :
#    ~/.ssh/authorized_keys
```

---

### Option 3 : Utiliser une clé SSH existante

Si vous avez une clé SSH ailleurs, utilisez-la :

```bash
ssh -i "C:\chemin\vers\votre\cle" -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

---

## 🔍 DIAGNOSTIC DÉTAILLÉ

### Test 1 : Connexion SSH simple

```bash
ssh ubuntu@137.74.40.191
```

**Résultats possibles :**
- ✅ Connexion réussie → Le problème vient de la commande de tunnel
- ❌ `Permission denied` → Problème d'authentification
- ❌ `Connection closed` → Serveur refuse la connexion

### Test 2 : Mode verbose

```bash
ssh -v ubuntu@137.74.40.191
```

**Regardez les messages :**
- `Offering public key` → Tente d'utiliser une clé
- `Permission denied (publickey)` → Clé refusée ou manquante
- `Connection closed` → Serveur ferme la connexion

---

## 💡 SOLUTIONS ALTERNATIVES

### Alternative 1 : Utiliser PuTTY (Windows)

1. Téléchargez PuTTY
2. Configurez la connexion SSH
3. Créez le tunnel dans les paramètres de connexion

### Alternative 2 : Utiliser MobaXterm

1. Téléchargez MobaXterm
2. Créez une session SSH
3. Configurez le port forwarding (5433 → 35392)

### Alternative 3 : Base de données locale (pour tests)

Si vous voulez tester sans tunnel SSH :

1. **Créer une base locale :**
   ```sql
   CREATE DATABASE "ERP_La_Plume";
   ```

2. **Modifier le `.env` :**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ERP_La_Plume
   DB_USER=postgres
   DB_PASSWORD=votre_mot_de_passe
   ```

3. **Importer les données si nécessaire**

---

## 🎯 ÉTAPES RECOMMANDÉES

### Étape 1 : Tester la connexion SSH de base

```bash
ssh ubuntu@137.74.40.191
```

**Si cela fonctionne :** Passez à l'étape 2.  
**Si cela échoue :** Contactez l'administrateur du serveur.

### Étape 2 : Créer le tunnel SSH

Une fois la connexion SSH de base fonctionnelle :

```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Laissez ce terminal ouvert !**

### Étape 3 : Vérifier le tunnel

Dans un autre terminal :

```powershell
Test-NetConnection localhost -Port 5433
```

**Résultat attendu :** `TcpTestSucceeded : True`

### Étape 4 : Tester la connexion à la base

```bash
cd backend
node verifier-tables-modules-odoo.js
```

---

## 📞 CONTACT ADMINISTRATEUR

Si le problème persiste, contactez l'administrateur du serveur pour :

1. **Vérifier votre accès SSH :**
   - Votre IP est-elle autorisée ?
   - Votre clé SSH est-elle dans `~/.ssh/authorized_keys` ?
   - L'authentification par mot de passe est-elle activée ?

2. **Vérifier la configuration SSH :**
   - Le serveur SSH est-il actif ?
   - Y a-t-il des restrictions de connexion ?
   - Les logs SSH montrent-ils des erreurs ?

---

## ✅ CHECKLIST

- [ ] Test de connexion SSH de base réussi
- [ ] Clé SSH configurée (ou mot de passe fonctionnel)
- [ ] Tunnel SSH créé et actif
- [ ] Port 5433 ouvert localement
- [ ] Connexion à la base de données testée

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
