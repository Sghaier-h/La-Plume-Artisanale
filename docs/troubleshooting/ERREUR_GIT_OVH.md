# 🔧 Résoudre l'Erreur Git OVH

## ❓ Quelle erreur obtenez-vous ?

Dites-moi l'erreur exacte, mais voici les solutions les plus courantes :

---

## 🔍 Erreur 1 : "Repository not found" ou "Authentication failed"

### Solution : Rendre le repository public (temporairement)

1. Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale
2. Cliquez sur **"Settings"**
3. Allez dans **"General"** > **"Danger Zone"**
4. Cliquez sur **"Change visibility"** > **"Make public"**
5. Confirmez

Ensuite, réessayez avec :
```
https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

**⚠️ Note** : Vous pourrez le remettre en privé après le déploiement.

---

## 🔍 Erreur 2 : "Invalid repository URL"

### Vérifiez l'URL

L'URL doit être **exactement** :
```
https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

**Vérifiez** :
- Pas d'espace avant ou après
- `.git` à la fin
- Pas de `/` à la fin après `.git`
- `Sghaier-h` avec un `S` majuscule

---

## 🔍 Erreur 3 : "SSH key required"

### Solution : Utiliser SSH au lieu de HTTPS

Si le repository est privé, utilisez l'URL SSH :

```
git@github.com:Sghaier-h/La-Plume-Artisanale.git
```

**Mais d'abord**, vous devez ajouter la clé SSH OVH sur GitHub :

1. Dans OVH, copiez la clé SSH publique (elle devrait être affichée)
2. Allez sur : https://github.com/settings/keys
3. Cliquez sur **"New SSH key"**
4. Collez la clé OVH
5. Cliquez sur **"Add SSH key"**

Ensuite, utilisez l'URL SSH dans OVH.

---

## 🔍 Erreur 4 : "Branch not found"

### Vérifiez la branche

La branche doit être :
```
main
```

**Pas** :
- `master`
- `Main`
- `MAIN`
- `main/`
- `/main`

---

## 🔍 Erreur 5 : "Directory not empty"

### Solution : Vider le répertoire

Connectez-vous en SSH et videz le répertoire :

```bash
# Voir où sont les fichiers
pwd

# Vider le répertoire (remplacez par le bon chemin)
rm -rf ~/fabrication/*
# ou
rm -rf /home/allbyfb/fabrication/*
```

Puis réessayez dans OVH.

---

## 🚀 Solution Alternative : Ne pas utiliser Git OVH

Si Git OVH continue de poser problème, utilisez directement SSH :

### 1. Connectez-vous en SSH

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

### 2. Téléchargez le script directement

```bash
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
chmod +x deploy.sh
bash deploy.sh
```

Cette méthode fonctionne **sans** configurer Git dans OVH.

---

## 📋 Checklist de Vérification

- [ ] URL exacte : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
- [ ] Branche : `main` (pas `master`)
- [ ] Repository public (ou clé SSH configurée)
- [ ] Répertoire vide
- [ ] Pas d'espace dans l'URL

---

## 🆘 Dites-moi l'erreur exacte

Pour vous aider mieux, dites-moi :
1. **Le message d'erreur exact** affiché par OVH
2. **L'URL que vous avez entrée**
3. **Si le repository est public ou privé**

---

## 💡 Solution Rapide

Si Git OVH pose trop de problèmes, **ignorez-le** et utilisez directement SSH avec le téléchargement du script. C'est plus simple et plus rapide !

