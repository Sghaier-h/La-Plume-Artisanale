# 📁 Configurer FileZilla pour se Connecter au VPS

## 🔧 Configuration FileZilla

### Informations de Connexion

- **Hôte** : `sftp://137.74.40.191`
- **OU** : `137.74.40.191`
- **Port** : `22` (SFTP)
- **Protocole** : `SFTP - SSH File Transfer Protocol`
- **Type de connexion** : `Normal`
- **Utilisateur** : `ubuntu`
- **Mot de passe** : Votre nouveau mot de passe

---

## 📋 Étapes dans FileZilla

### 1. Ouvrir FileZilla

### 2. Cliquer sur "Gestionnaire de sites" (icône en haut à gauche)

### 3. Nouveau Site

- **Nom du site** : `VPS OVH`
- **Protocole** : `SFTP - SSH File Transfer Protocol`
- **Hôte** : `137.74.40.191`
- **Port** : `22`
- **Type de connexion** : `Normal`
- **Utilisateur** : `ubuntu`
- **Mot de passe** : Votre nouveau mot de passe

### 4. Cliquer sur "Connexion"

---

## 🔍 Vérification

### Une Fois Connecté

**Côté gauche (Local)** :
- Naviguez vers : `D:\OneDrive - FLYING TEX\PROJET\backend`

**Côté droit (Serveur distant)** :
- Naviguez vers : `/opt/fouta-erp/`
- Si le dossier `backend` n'existe pas, créez-le (clic droit → Créer un répertoire)

### Copier les Fichiers

1. **Sélectionner** tous les fichiers du dossier `backend` (côté gauche)
2. **Glisser-déposer** vers `/opt/fouta-erp/backend/` (côté droit)
3. **Attendre** que la copie se termine

---

## ⚠️ Si le Dossier n'Existe Pas sur le VPS

### Option 1 : Créer via FileZilla

1. **Clic droit** dans `/opt/fouta-erp/` (côté droit)
2. **Créer un répertoire** : `backend`
3. **Entrer** dans le dossier `backend`
4. **Glisser-déposer** les fichiers

### Option 2 : Créer via SSH

Dans votre connexion SSH :

```bash
sudo mkdir -p /opt/fouta-erp/backend
sudo chown -R ubuntu:ubuntu /opt/fouta-erp
```

Puis utiliser FileZilla pour copier les fichiers.

---

## 📋 Checklist

- [ ] FileZilla installé
- [ ] Nouveau site créé avec les bonnes informations
- [ ] Port : `22`
- [ ] Protocole : `SFTP`
- [ ] Connecté au VPS
- [ ] Dossier `/opt/fouta-erp/backend` créé (si nécessaire)
- [ ] Fichiers copiés depuis `D:\OneDrive - FLYING TEX\PROJET\backend`

---

## ✅ Résumé

1. **Hôte** : `137.74.40.191`
2. **Port** : `22` (SFTP)
3. **Protocole** : `SFTP - SSH File Transfer Protocol`
4. **Utilisateur** : `ubuntu`
5. **Mot de passe** : Votre nouveau mot de passe

**Le port est 22 pour SFTP !**

