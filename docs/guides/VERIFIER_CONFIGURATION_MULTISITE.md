# 🔍 Vérifier la Configuration du Multisite OVH

## ✅ Domaine Configuré

Votre domaine `fabrication.laplume-artisanale.tn` est déjà dans les multisites. Il faut maintenant vérifier sa configuration.

---

## 🔍 Étapes de Vérification

### 1. Cliquer sur le Domaine

Dans le panneau OVH :
1. Allez dans **Web Cloud** → **Hébergements**
2. Cliquez sur votre hébergement
3. Allez dans **Multisite**
4. **Cliquez sur** `fabrication.laplume-artisanale.tn`

---

### 2. Vérifier la Configuration

Vous devriez voir :

- **Dossier racine** : Doit pointer vers `/image.pngfouta-erp/backend` ou `/fouta-erp`
- **SSL** : Activé (recommandé)
- **Node.js** : Doit être activé

---

### 3. Modifier la Configuration si Nécessaire

Si Node.js n'est pas activé :

1. **Cliquez sur "Modifier"** ou l'icône d'édition
2. **Cherchez l'option "Node.js"** ou "Runtime"
3. **Activez Node.js**
4. **Sélectionnez la version** : Node.js 18.x
5. **Point d'entrée** : `backend/src/server.js` ou `src/server.js`
6. **Sauvegardez**

---

### 4. Vérifier le Dossier Racine

Le dossier racine doit être :

```
/fouta-erp/backend
```

OU

```
/fouta-erp
```

Selon où se trouve votre `package.json`.

---

## 🔧 Si Node.js N'est Pas Disponible

Si vous ne voyez pas l'option Node.js :

### Option 1 : Contacter le Support OVH

Demandez comment activer Node.js pour votre multisite.

### Option 2 : Utiliser un Fichier de Configuration

Créez un fichier `.ovhconfig` dans le dossier racine :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
```

### Option 3 : Vérifier le Type d'Hébergement

Certains hébergements OVH ne supportent pas Node.js. Vérifiez dans :
- **Informations** → **Type d'hébergement**
- Si c'est un hébergement "Perso" ou "Pro", Node.js devrait être disponible

---

## 📋 Configuration Recommandée

Pour `fabrication.laplume-artisanale.tn` :

- **Dossier racine** : `/fouta-erp/backend`
- **SSL** : Activé
- **Node.js** : Activé
- **Version Node.js** : 18.x
- **Point d'entrée** : `src/server.js`
- **Variables d'environnement** :
  - `NODE_ENV=production`
  - `PORT=5000` (ou le port fourni par OVH)

---

## 🚀 Après Modification

1. **Sauvegardez** la configuration
2. **Attendez 5-10 minutes** pour la propagation
3. **Testez** : `https://fabrication.laplume-artisanale.tn`
4. **Vérifiez les logs** via SSH :
   ```bash
   pm2 logs fouta-api
   ```

---

## 🔍 Vérification via SSH

Vous pouvez aussi vérifier la configuration depuis SSH :

```bash
# Voir la structure des dossiers
ls -la ~/fouta-erp/

# Vérifier que l'application est au bon endroit
ls -la ~/fouta-erp/backend/src/server.js

# Vérifier le fichier .env
cat ~/fouta-erp/backend/.env
```

---

## ✅ Checklist

- [ ] Domaine configuré dans multisite
- [ ] Dossier racine pointe vers `/fouta-erp/backend`
- [ ] Node.js activé
- [ ] Version Node.js : 18.x
- [ ] Point d'entrée : `src/server.js`
- [ ] SSL activé
- [ ] Application accessible via le domaine

---

## 🆘 Si Problème

Si Node.js n'est toujours pas disponible après vérification :

1. **Contactez le support OVH**
2. **Demandez** comment activer Node.js pour votre type d'hébergement
3. **Ou envisagez** un VPS OVH pour plus de contrôle

---

## 💡 Note

Sur certains hébergements OVH, Node.js doit être activé **par domaine** dans le multisite, pas globalement.

