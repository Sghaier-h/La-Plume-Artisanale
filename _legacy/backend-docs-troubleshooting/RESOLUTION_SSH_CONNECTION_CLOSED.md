# 🔧 Résolution : "Connection closed by 137.74.40.191 port 22"

**Erreur :** `Connection closed by 137.74.40.191 port 22`

---

## 🔍 CAUSES POSSIBLES

### 1. Authentification SSH échouée
- Clé SSH manquante ou incorrecte
- Mot de passe incorrect
- Utilisateur non autorisé

### 2. Configuration du serveur SSH
- Votre IP n'est pas autorisée
- Le serveur SSH refuse les connexions
- Rate limiting activé

### 3. Problème réseau
- Firewall bloque le port 22
- Problème de connexion internet
- Timeout de connexion

---

## ✅ SOLUTIONS

### Solution 1 : Vérifier la connexion SSH de base

Testez d'abord une connexion SSH simple :

```bash
ssh ubuntu@137.74.40.191
```

**Si cela fonctionne :** Le problème vient de la commande de tunnel.  
**Si cela échoue :** Le problème vient de l'authentification SSH.

---

### Solution 2 : Utiliser une clé SSH spécifique

Si vous avez une clé SSH dans un autre emplacement :

```bash
ssh -i "C:\chemin\vers\votre\cle" -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

---

### Solution 3 : Mode verbose pour diagnostiquer

Utilisez `-v` pour voir les détails de l'erreur :

```bash
ssh -v -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

Cela affichera des informations détaillées sur pourquoi la connexion échoue.

---

### Solution 4 : Vérifier les clés SSH

Vérifiez si vous avez des clés SSH :

```powershell
Get-ChildItem $env:USERPROFILE\.ssh
```

Si vous n'avez pas de clé, vous devrez :
1. Générer une clé SSH
2. L'ajouter au serveur (authorized_keys)

---

### Solution 5 : Utiliser un mot de passe

Si l'authentification par clé échoue, essayez avec un mot de passe :

```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

Vous serez invité à entrer le mot de passe.

---

## 🔍 DIAGNOSTIC DÉTAILLÉ

### Étape 1 : Tester la connectivité réseau

```powershell
Test-NetConnection -ComputerName 137.74.40.191 -Port 22
```

**Résultat attendu :** `TcpTestSucceeded : True`

### Étape 2 : Tester SSH en mode verbose

```bash
ssh -v ubuntu@137.74.40.191
```

**Regardez les messages d'erreur :**
- `Permission denied` → Problème d'authentification
- `Connection refused` → Serveur SSH non accessible
- `Connection timed out` → Problème réseau/firewall

### Étape 3 : Vérifier les logs SSH

Les messages `-v` vous donneront des indices sur le problème.

---

## 💡 SOLUTIONS ALTERNATIVES

### Option A : Utiliser pgAdmin avec connexion directe

Si le tunnel SSH ne fonctionne pas, vous pouvez :
1. Configurer pgAdmin pour se connecter directement à OVH
2. Utiliser la connexion directe (si votre IP est autorisée)

### Option B : Utiliser une base de données locale

Pour tester localement sans tunnel :
1. Créer une base PostgreSQL locale
2. Modifier le `.env` pour utiliser `localhost:5432`
3. Importer les données si nécessaire

### Option C : Utiliser un autre outil de tunnel

- **PuTTY** (Windows) : Interface graphique pour créer des tunnels
- **MobaXterm** : Terminal avec gestion de tunnels intégrée

---

## 🎯 COMMANDES RAPIDES

### Diagnostic complet
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File diagnostiquer-ssh.ps1
```

### Test SSH simple
```bash
ssh ubuntu@137.74.40.191
```

### Test SSH verbose
```bash
ssh -v ubuntu@137.74.40.191
```

### Tunnel SSH avec verbose
```bash
ssh -v -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

---

## 📞 SUPPORT

Si le problème persiste :

1. **Vérifiez avec l'administrateur du serveur :**
   - Votre IP est-elle autorisée ?
   - Le serveur SSH est-il actif ?
   - Y a-t-il des restrictions ?

2. **Vérifiez votre configuration locale :**
   - Clés SSH présentes et correctes
   - Firewall Windows
   - Connexion internet

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
