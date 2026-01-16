# 📁 Déploiement via FTP (Alternative si SSH ne fonctionne pas)

## 🎯 Si SSH ne fonctionne pas, utilisez FTP

---

## 📦 Étape 1 : Préparer les fichiers localement

### Créer un fichier ZIP

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
Compress-Archive -Path * -DestinationPath "La-Plume-Artisanale.zip" -Force
```

---

## 📤 Étape 2 : Transférer via FileZilla

### Installer FileZilla

Téléchargez : https://filezilla-project.org/

### Se connecter

1. Ouvrez FileZilla
2. Cliquez sur **"Fichier"** > **"Gestionnaire de sites"**
3. Cliquez sur **"Nouveau site"**
4. Configurez :
   - **Hôte** : `ftp.cluster130.hosting.ovh.net`
   - **Protocole** : FTP - Transfert de fichiers
   - **Type d'authentification** : Normal
   - **Utilisateur** : `allbyfb`
   - **Mot de passe** : `Allbyfouta007`
   - **Port** : `21`
5. Cliquez sur **"Connexion"**

### Transférer les fichiers

1. Naviguez vers `/var/www/` (ou `/www/` ou `/home/allbyfb/`)
2. Transférez le fichier `La-Plume-Artisanale.zip`
3. Ou transférez tout le dossier `La-Plume-Artisanale`

---

## 🔧 Étape 3 : Utiliser le terminal web OVH

Une fois les fichiers transférés :

1. Connectez-vous à https://www.ovh.com/manager/
2. Allez dans votre hébergement
3. Ouvrez le **"Terminal Web"**
4. Naviguez vers le dossier :

```bash
cd /var/www/La-Plume-Artisanale
# ou
cd /home/allbyfb/La-Plume-Artisanale
```

5. Décompressez (si vous avez transféré un ZIP) :

```bash
unzip La-Plume-Artisanale.zip
```

6. Exécutez le script de déploiement :

```bash
bash deploy-auto.sh
```

Ou téléchargez-le directement :

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

---

## 🔧 Étape 4 : Installation manuelle (si le script ne fonctionne pas)

### Via le terminal web OVH

```bash
# Aller dans le dossier
cd /var/www/La-Plume-Artisanale

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer les dépendances
cd backend
npm install --production

# Créer .env
nano .env
# (Copiez le contenu depuis le fichier .env.example)

# Initialiser la base de données
cd ../database
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
# ... etc
```

---

## 📋 Informations FTP

- **Hôte** : `ftp.cluster130.hosting.ovh.net`
- **Utilisateur** : `allbyfb`
- **Mot de passe** : `Allbyfouta007`
- **Port** : `21`
- **Protocole** : FTP

---

## ✅ Avantages du terminal web OVH

- ✅ Pas besoin de SSH
- ✅ Accès direct au serveur
- ✅ Interface graphique
- ✅ Fonctionne même si SSH est bloqué

---

## 🎯 Résumé

1. **Transférez les fichiers** via FileZilla
2. **Utilisez le terminal web OVH** pour exécuter les commandes
3. **Exécutez le script** de déploiement

C'est la solution la plus fiable si SSH ne fonctionne pas !

