# 🚀 Commandes Directes - À Exécuter sur le Serveur

## ⚡ Solution Rapide : Créer le script directement

Exécutez ces commandes **une par une** sur le serveur :

### 1. Créer le dossier et aller dedans

```bash
mkdir -p ~/La-Plume-Artisanale
cd ~/La-Plume-Artisanale
```

### 2. Télécharger le script directement

```bash
wget https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
```

Si wget ne fonctionne pas, utilisez curl :

```bash
curl -o deploy-simple.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
```

### 3. Rendre exécutable

```bash
chmod +x deploy-simple.sh
```

### 4. Exécuter

```bash
bash deploy-simple.sh
```

---

## 🔑 Alternative : Utiliser un Token GitHub

Si le téléchargement ne fonctionne pas, utilisez un token :

### 1. Créer un token sur GitHub

- Allez sur : https://github.com/settings/tokens
- Créez un token avec permission `repo`

### 2. Cloner avec le token

```bash
git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git
cd La-Plume-Artisanale
bash deploy-simple.sh
```

**Remplacez** `VOTRE_TOKEN` par votre token GitHub.

---

## 📋 Commandes Complètes (Copier-Coller)

```bash
mkdir -p ~/La-Plume-Artisanale && cd ~/La-Plume-Artisanale
curl -o deploy-simple.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
chmod +x deploy-simple.sh
bash deploy-simple.sh
```

---

## ✅ Vérification

Après l'exécution :

```bash
pm2 status
curl http://localhost:5000/health
```

---

## 🆘 Si ça ne fonctionne toujours pas

Dites-moi quelle erreur vous obtenez et je vous donnerai la solution exacte.

