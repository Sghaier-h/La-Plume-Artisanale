# 🔧 Activer Node.js dans Multisite OVH - Si l'Option N'Existe Pas

## ❌ Problème

L'option Node.js n'apparaît pas dans la configuration Multisite OVH, et c'est configuré en PHP.

---

## 🔍 Solutions

### Solution 1 : Vérifier le Type d'Hébergement

Sur hébergement mutualisé OVH, Node.js doit être activé au niveau de l'hébergement.

**Dans le panneau OVH** :
1. **Hébergement** → **Informations générales**
2. **Vérifiez** si Node.js est disponible pour votre hébergement
3. **Si Node.js n'est pas disponible**, il faut :
   - Contacter le support OVH pour activer Node.js
   - OU passer à un VPS OVH

### Solution 2 : Créer un Nouveau Multisite pour Node.js

**Dans le panneau OVH** :
1. **Multisite** → **Ajouter un domaine ou sous-domaine**
2. **Domaine** : `fabrication.laplume-artisanale.tn`
3. **Dossier racine** : `fouta-erp/backend`
4. **Type** : Cherchez l'option **Node.js** ou **Application Node.js**
5. **Si Node.js n'apparaît pas** : Contactez le support OVH

### Solution 3 : Modifier le Multisite Existant

**Dans le panneau OVH** :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Modifier** ou **Éditer**
3. **Cherchez** :
   - **Type d'application** : Node.js
   - **Engine** : Node.js
   - **Runtime** : Node.js
4. **Si ces options n'existent pas** : Contactez le support OVH

### Solution 4 : Vérifier .ovhconfig dans le Dossier Racine

Le `.ovhconfig` doit être dans le dossier racine du multisite.

```bash
cd ~/fouta-erp/backend

# Vérifier que .ovhconfig existe
cat .ovhconfig

# Doit être :
# <?xml version="1.0" encoding="UTF-8"?>
# <engine>
#     <name>nodejs</name>
#     <version>18</version>
# </engine>
```

**Important** : Le `.ovhconfig` doit être dans le dossier racine configuré dans Multisite.

### Solution 5 : Vérifier qu'il n'y a pas de .htaccess qui Interfère

```bash
cd ~/fouta-erp/backend

# Vérifier s'il y a un .htaccess
ls -la .htaccess

# Si présent, renommez-le temporairement
mv .htaccess .htaccess.backup
```

### Solution 6 : Contacter le Support OVH

Si aucune option Node.js n'apparaît dans Multisite :

1. **Contactez le support OVH**
2. **Mentionnez** :
   - Vous avez un hébergement mutualisé
   - Vous voulez utiliser Node.js pour `fabrication.laplume-artisanale.tn`
   - L'option Node.js n'apparaît pas dans Multisite
   - Vous avez créé `.ovhconfig` avec Node.js 18
   - Les logs montrent que PHP 5.4 est utilisé au lieu de Node.js

3. **Demandez** :
   - Comment activer Node.js pour ce multisite
   - Si votre hébergement supporte Node.js
   - Si vous devez passer à un autre type d'hébergement

---

## 🔧 Actions Immédiates

### 1. Vérifier .ovhconfig

```bash
cd ~/fouta-erp/backend

# Vérifier
cat .ovhconfig

# Si incorrect, recréer
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF
```

### 2. Vérifier .htaccess

```bash
# Vérifier s'il y a un .htaccess qui interfère
ls -la .htaccess

# Si présent, renommez-le
mv .htaccess .htaccess.backup
```

### 3. Vérifier la Configuration Multisite

**Dans le panneau OVH** :
- **Multisite** → `fabrication.laplume-artisanale.tn`
- **Dossier racine** : `fouta-erp/backend`
- **Cherchez** toutes les options disponibles
- **Notez** ce qui est disponible

### 4. Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers
touch .ovhconfig
touch index.js

# Attendre 15-20 minutes
```

---

## 📋 Checklist

- [ ] `.ovhconfig` vérifié (nodejs, version 18)
- [ ] `.htaccess` vérifié (renommé si présent)
- [ ] Configuration Multisite vérifiée (toutes les options)
- [ ] Support OVH contacté (si Node.js n'est pas disponible)
- [ ] Fichiers touchés : `touch .ovhconfig`
- [ ] Attendu 15-20 minutes

---

## 💡 Note Importante

**Si Node.js n'est pas disponible dans Multisite**, cela peut signifier :

1. **Votre hébergement ne supporte pas Node.js** (hébergement mutualisé basique)
2. **Node.js doit être activé par le support OVH**
3. **Il faut passer à un VPS OVH** pour utiliser Node.js

**Dans ce cas, la meilleure solution est de contacter le support OVH ou de passer à un VPS.**

---

## ✅ Résumé

1. **Vérifier `.ovhconfig`** : Doit contenir `nodejs` version `18`
2. **Vérifier `.htaccess`** : Renommer si présent
3. **Vérifier la configuration Multisite** : Chercher toutes les options
4. **Contacter le support OVH** : Si Node.js n'est pas disponible
5. **OU passer à un VPS OVH** : Pour utiliser Node.js sans contraintes

**Si Node.js n'est pas disponible dans Multisite, il faut contacter le support OVH ou passer à un VPS !**

