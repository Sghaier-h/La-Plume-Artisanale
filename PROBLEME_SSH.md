# 🔧 Problème de Connexion SSH - Solutions

## ❌ Erreur : Connection timed out

Le port SSH 22 semble bloqué ou inaccessible. Voici plusieurs solutions :

---

## 🔍 Solution 1 : Vérifier le port SSH

OVH utilise parfois un port SSH différent. Essayez :

```bash
# Port 22 (standard)
ssh allbyfb@145.239.37.162

# Port 22 avec timeout augmenté
ssh -o ConnectTimeout=30 allbyfb@145.239.37.162

# Port alternatif 2222
ssh -p 2222 allbyfb@145.239.37.162

# Port alternatif 443
ssh -p 443 allbyfb@145.239.37.162
```

---

## 🔍 Solution 2 : Utiliser le panneau OVH

### Via l'interface web OVH

1. Connectez-vous à votre espace client OVH
2. Allez dans **"Web Cloud"** > **"Hébergements"**
3. Cliquez sur votre hébergement
4. Utilisez le **"Terminal Web"** ou **"SSH"** dans le panneau
5. Exécutez directement :

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

---

## 🔍 Solution 3 : Utiliser FTP + FileZilla

Si SSH ne fonctionne pas, vous pouvez utiliser FTP pour transférer les fichiers :

### 1. Installer FileZilla

Téléchargez : https://filezilla-project.org/

### 2. Se connecter

- **Hôte** : `ftp.cluster130.hosting.ovh.net`
- **Utilisateur** : `allbyfb`
- **Mot de passe** : `Allbyfouta007`
- **Port** : `21`

### 3. Transférer les fichiers

Transférez le dossier `La-Plume-Artisanale` vers `/var/www/` sur le serveur.

---

## 🔍 Solution 4 : Vérifier les informations

### Vérifier l'IP

L'IP `145.239.37.162` est-elle correcte ? Vérifiez dans votre panneau OVH.

### Vérifier le domaine SSH

Essayez avec le domaine complet :

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

---

## 🔍 Solution 5 : Contacter le support OVH

Si rien ne fonctionne :

1. Contactez le support OVH
2. Demandez :
   - Le port SSH correct
   - Si SSH est activé
   - Les restrictions de firewall

---

## 🔍 Solution 6 : Utiliser un autre outil

### Avec PuTTY (Windows)

1. Téléchargez PuTTY : https://www.putty.org/
2. Configurez :
   - **Host Name** : `145.239.37.162` ou `ssh.cluster130.hosting.ovh.net`
   - **Port** : `22` (essayez aussi `2222`, `443`)
   - **Connection type** : SSH
3. Cliquez sur "Open"
4. Entrez le mot de passe : `Allbyfouta007`

### Avec WinSCP (Windows)

1. Téléchargez WinSCP : https://winscp.net/
2. Configurez :
   - **File protocol** : SFTP
   - **Host name** : `145.239.37.162`
   - **Port** : `22`
   - **User name** : `allbyfb`
   - **Password** : `Allbyfouta007`

---

## 🔍 Solution 7 : Vérifier le firewall local

Votre firewall Windows peut bloquer SSH :

```powershell
# Vérifier le firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*SSH*"}

# Autoriser SSH (si nécessaire)
New-NetFirewallRule -DisplayName "SSH" -Direction Outbound -Protocol TCP -RemotePort 22
```

---

## 🔍 Solution 8 : Test de connectivité

### Tester si le port est ouvert

```powershell
# Test de connexion
Test-NetConnection -ComputerName 145.239.37.162 -Port 22

# Ping
ping 145.239.37.162
```

### Avec telnet

```powershell
telnet 145.239.37.162 22
```

---

## 📋 Checklist de dépannage

- [ ] Vérifier l'IP : `145.239.37.162`
- [ ] Vérifier le port SSH (22, 2222, 443)
- [ ] Vérifier le domaine : `ssh.cluster130.hosting.ovh.net`
- [ ] Vérifier le firewall local
- [ ] Tester avec PuTTY
- [ ] Utiliser le terminal web OVH
- [ ] Contacter le support OVH

---

## 💡 Solution recommandée

**Utilisez le terminal web dans le panneau OVH** - c'est la solution la plus fiable si SSH ne fonctionne pas.

1. Connectez-vous à https://www.ovh.com/manager/
2. Allez dans votre hébergement
3. Utilisez le terminal web
4. Exécutez le script de déploiement

---

## 🆘 Si rien ne fonctionne

Contactez le support OVH avec ces informations :
- **IP** : 145.239.37.162
- **Domaine** : fabrication.laplume-artisanale.tn
- **Utilisateur** : allbyfb
- **Problème** : Connection timed out sur le port 22

Ils pourront vous aider à :
- Activer SSH
- Configurer le bon port
- Résoudre les problèmes de firewall

