# 📁 Créer le Dossier sur le VPS

## ❌ Erreur

```
realpath /opt/fouta-erp/: No such file
```

Le dossier `/opt/fouta-erp/` n'existe pas encore sur le VPS.

---

## ✅ Solution : Créer le Dossier d'Abord

### Sur le VPS (dans votre connexion SSH)

```bash
# Créer le dossier avec les bonnes permissions
sudo mkdir -p /opt/fouta-erp
sudo chown -R ubuntu:ubuntu /opt/fouta-erp

# Vérifier que le dossier existe
ls -la /opt/fouta-erp
```

**Maintenant vous pouvez copier les fichiers !**

---

## 📤 Copier l'Application

### Depuis Windows (PowerShell) - Nouvelle Fenêtre

**Ouvrez une nouvelle fenêtre PowerShell** (gardez la connexion SSH ouverte) :

```powershell
# Copier le dossier backend vers le VPS
scp -r "D:\OneDrive - FLYING TEX\PROJET\backend" ubuntu@137.74.40.191:/opt/fouta-erp/
```

**Mot de passe** : Votre nouveau mot de passe

**OU copier directement le contenu du dossier backend** :

```powershell
# Copier le contenu du dossier backend
scp -r "D:\OneDrive - FLYING TEX\PROJET\backend\*" ubuntu@137.74.40.191:/opt/fouta-erp/backend/
```

**Mais d'abord, créez aussi le dossier backend** :

```bash
# Sur le VPS
sudo mkdir -p /opt/fouta-erp/backend
sudo chown -R ubuntu:ubuntu /opt/fouta-erp
```

---

## 🔄 Alternative : Utiliser WinSCP ou FileZilla

### WinSCP (Plus Facile)

1. **Télécharger WinSCP** : https://winscp.net/
2. **Nouvelle connexion** :
   - **Hôte** : `137.74.40.191`
   - **Utilisateur** : `ubuntu`
   - **Mot de passe** : Votre nouveau mot de passe
   - **Protocole** : SFTP
3. **Se connecter**
4. **Naviguer vers** : `/opt/fouta-erp/`
5. **Créer le dossier** `backend` si nécessaire
6. **Glisser-déposer** le dossier `backend` depuis votre machine

### FileZilla

1. **Télécharger FileZilla** : https://filezilla-project.org/
2. **Nouvelle connexion** :
   - **Hôte** : `sftp://137.74.40.191`
   - **Utilisateur** : `ubuntu`
   - **Mot de passe** : Votre nouveau mot de passe
   - **Port** : 22
3. **Se connecter**
4. **Naviguer vers** : `/opt/fouta-erp/`
5. **Créer le dossier** `backend` si nécessaire
6. **Glisser-déposer** le dossier `backend`

---

## 📋 Étapes Complètes

### 1. Sur le VPS (SSH)

```bash
# Créer les dossiers
sudo mkdir -p /opt/fouta-erp/backend
sudo chown -R ubuntu:ubuntu /opt/fouta-erp

# Vérifier
ls -la /opt/fouta-erp
```

### 2. Depuis Windows (PowerShell)

```powershell
# Copier le dossier backend
scp -r "D:\OneDrive - FLYING TEX\PROJET\backend" ubuntu@137.74.40.191:/opt/fouta-erp/
```

**OU utiliser WinSCP/FileZilla** (plus facile).

### 3. Vérifier sur le VPS

```bash
# Vérifier que les fichiers sont copiés
ls -la /opt/fouta-erp/backend

# Doit afficher :
# package.json
# src/
# node_modules/ (si présent)
# etc.
```

---

## ✅ Résumé

1. **Créer le dossier sur le VPS** : `sudo mkdir -p /opt/fouta-erp/backend`
2. **Donner les permissions** : `sudo chown -R ubuntu:ubuntu /opt/fouta-erp`
3. **Copier les fichiers** : `scp` ou WinSCP/FileZilla
4. **Vérifier** : `ls -la /opt/fouta-erp/backend`

**Créez d'abord le dossier sur le VPS, puis copiez les fichiers !**

