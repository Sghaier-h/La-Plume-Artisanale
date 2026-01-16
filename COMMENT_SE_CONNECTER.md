# 🔐 Comment Se Connecter - Guide Simple

## 🚀 Étape 1 : Démarrer le Frontend

**Ouvrir un terminal PowerShell et exécuter :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

**Attendre que le navigateur s'ouvre automatiquement.** Sinon, ouvrir manuellement :
- URL : `http://localhost:3000`

---

## 🔑 Étape 2 : Se Connecter

### Compte Administrateur (Recommandé)

**Email :** `admin@system.local`  
**Mot de passe :** `Admin123!`

### Autres Comptes Disponibles

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Administrateur** | `admin@system.local` | `Admin123!` |
| **Chef de Production** | `chef.production@entreprise.local` | `User123!` |
| **Tisseur** | `tisseur@entreprise.local` | `User123!` |
| **Magasinier MP** | `magasinier.mp@entreprise.local` | `User123!` |

---

## 📋 Procédure Détaillée

### 1. Démarrer le Serveur Frontend

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

**Résultat attendu :**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### 2. Ouvrir le Navigateur

**Le navigateur devrait s'ouvrir automatiquement.** Sinon :

1. Ouvrir votre navigateur (Chrome, Firefox, Edge, etc.)
2. Aller à : `http://localhost:3000`

### 3. Page de Connexion

**Vous verrez la page de connexion avec :**
- Champ "Email"
- Champ "Mot de passe"
- Bouton "Se connecter"

### 4. Entrer les Identifiants

**Avec le compte administrateur :**

```
Email : admin@system.local
Mot de passe : Admin123!
```

**Cliquer sur "Se connecter" ou appuyer sur Entrée**

### 5. Redirection Automatique

**Après connexion réussie, vous serez automatiquement redirigé vers :**
- Dashboard principal (si ADMIN ou CHEF_PRODUCTION)
- Interface spécifique selon votre rôle

---

## ✅ Vérification de la Connexion

### Si la Connexion Réussit

✅ **Vous verrez :**
- Redirection vers le dashboard
- Interface de l'application
- Informations de votre profil (nom, rôle)

### Si la Connexion Échoue

❌ **Vérifier :**
1. ✅ Le frontend est démarré (`npm start` en cours)
2. ✅ L'API VPS est accessible : `https://fabrication.laplume-artisanale.tn/health`
3. ✅ Les identifiants sont corrects
4. ✅ La connexion internet fonctionne

**Tester l'API VPS :**
```powershell
curl.exe https://fabrication.laplume-artisanale.tn/health
```

**Résultat attendu :**
```json
{"status":"OK","timestamp":"2026-01-08T..."}
```

---

## 🆘 Problèmes Courants

### Erreur : "API VPS inaccessible"

**Solution :** L'API du VPS doit être accessible. Vérifier :
- Connexion internet
- Le backend est déployé sur le VPS
- L'URL est correcte : `https://fabrication.laplume-artisanale.tn`

### Erreur : "Identifiants invalides"

**Solution :** Vérifier :
- L'email est exactement : `admin@system.local` (sans espaces)
- Le mot de passe est exactement : `Admin123!` (avec majuscule A et !)
- Les utilisateurs existent dans la base de données

### Erreur : "Cannot GET /login"

**Solution :** Vérifier :
- Le frontend compile sans erreur
- Tous les fichiers sont présents
- Les dépendances sont installées : `npm install`

### Le Navigateur ne s'Ouvre pas Automatiquement

**Solution :** Ouvrir manuellement :
1. Ouvrir votre navigateur
2. Aller à : `http://localhost:3000`

---

## 📱 Après la Connexion

### Interface selon le Rôle

**ADMIN :**
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Configuration système

**CHEF_PRODUCTION :**
- Dashboard production
- Gestion des OF (Ordres de Fabrication)
- Planning
- Suivi production

**TISSEUR :**
- Interface de suivi de production
- Saisie des données de tissage
- Voir les OF assignés

**MAGASINIER :**
- Gestion du stock MP (Matières Premières)
- Entrées/sorties de stock
- Transferts

---

## 🔄 Déconnexion

**Pour vous déconnecter :**
1. Cliquer sur votre profil (en haut à droite)
2. Cliquer sur "Déconnexion"
3. Vous serez redirigé vers la page de connexion

---

## 🚀 Commandes Rapides

### Démarrer le Frontend
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

### Vérifier l'API VPS
```powershell
curl.exe https://fabrication.laplume-artisanale.tn/health
```

### Arrêter le Frontend
**Dans le terminal où `npm start` est actif :**
- Appuyer sur `Ctrl + C`
- Confirmer avec `Y` si demandé

---

## ✅ Checklist de Connexion

- [ ] Frontend démarré (`npm start` en cours)
- [ ] Navigateur ouvert à `http://localhost:3000`
- [ ] Page de connexion affichée
- [ ] Email : `admin@system.local`
- [ ] Mot de passe : `Admin123!`
- [ ] Cliqué sur "Se connecter"
- [ ] Redirigé vers le dashboard

---

**🎯 Vous êtes prêt à vous connecter ! Démarrer le frontend et utiliser les identifiants ci-dessus.**
