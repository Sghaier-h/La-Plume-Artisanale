# ⚠️ Erreur PHP 5.4 dans les Logs - Problème Identifié

## ❌ Problème Identifié dans les Logs

```
[ovhconfig] Invalid image version for engine 5.4: 
engine php version 5.4 not available at /var/lib/fastcgi/php//images/stable64/5.4
```

**OVH essaie d'utiliser PHP 5.4 au lieu de Node.js !**

---

## 🔍 Cause

1. **`.ovhconfig` n'est pas correctement lu** par OVH
2. **Configuration Multisite** pointe vers PHP au lieu de Node.js
3. **`.ovhconfig` dans le mauvais dossier** ou mal formaté

---

## ✅ Solutions

### Solution 1 : Vérifier .ovhconfig

```bash
cd ~/fouta-erp/backend

# Vérifier le contenu
cat .ovhconfig

# Doit être :
# <?xml version="1.0" encoding="UTF-8"?>
# <engine>
#     <name>nodejs</name>
#     <version>18</version>
# </engine>
```

**Si ce n'est pas correct, corrigez-le** :

```bash
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF
```

### Solution 2 : Vérifier la Configuration Multisite OVH

**Dans le panneau OVH** :

1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Vérifiez** :
   - **Node.js** : **Activé** (vert) ⚠️ CRITIQUE
   - **PHP** : **Désactivé** (si possible)
   - **Dossier racine** : `fouta-erp/backend` (exactement)
3. **Si Node.js n'est pas activé** :
   - Activez Node.js
   - Désactivez PHP
   - Sauvegardez
4. **Attendez 10-15 minutes**

### Solution 3 : Vérifier qu'il n'y a pas de .ovhconfig dans le Home

```bash
# Vérifier s'il y a un .ovhconfig dans le home qui interfère
ls -la ~/.ovhconfig

# Si présent, vérifiez son contenu
cat ~/.ovhconfig

# S'il contient PHP, il faut le modifier ou le retirer
```

### Solution 4 : Vérifier les Permissions

```bash
cd ~/fouta-erp/backend

# Vérifier les permissions
ls -la .ovhconfig

# Doit être lisible (rw-r--r--)
# Si nécessaire :
chmod 644 .ovhconfig
```

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

### 2. Vérifier la Configuration Multisite

**Dans le panneau OVH** :
- **Node.js** : **Activé** (vert) ⚠️ CRITIQUE
- **PHP** : **Désactivé**

### 3. Forcer un Redémarrage

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
- [ ] Configuration Multisite vérifiée (Node.js activé, PHP désactivé)
- [ ] `.ovhconfig` dans le home vérifié (ne doit pas contenir PHP)
- [ ] Permissions vérifiées
- [ ] Fichiers touchés : `touch .ovhconfig`
- [ ] Attendu 15-20 minutes

---

## 💡 Note

**Le problème principal est que OVH essaie d'utiliser PHP 5.4 au lieu de Node.js.**

Cela signifie que :
- Soit `.ovhconfig` n'est pas correctement lu
- Soit la configuration Multisite pointe vers PHP

**Il faut absolument activer Node.js dans la configuration Multisite OVH !**

---

## ✅ Résumé

1. **Vérifier `.ovhconfig`** : Doit contenir `nodejs` version `18`
2. **Vérifier la configuration Multisite OVH** : **Node.js activé** (vert), PHP désactivé
3. **Forcer un redémarrage** : `touch .ovhconfig`
4. **Attendre 15-20 minutes**

**Le problème est que Node.js n'est pas activé dans la configuration Multisite OVH !**

