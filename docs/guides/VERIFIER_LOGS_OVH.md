# 🔍 Vérifier les Logs OVH - Résoudre l'Erreur 501

## ❌ Problème : Erreur 501 Persiste

L'erreur 501 signifie que Node.js est activé, mais l'application ne démarre pas. Il faut vérifier les logs pour voir l'erreur exacte.

---

## 🔍 Vérifier les Logs dans le Panneau OVH

### 1. Accéder aux Logs

1. Allez sur [https://www.ovh.com/manager/](https://www.ovh.com/manager/)
2. Connectez-vous
3. Allez dans **Web Cloud** → **Hébergements**
4. Cliquez sur votre hébergement
5. Allez dans **Statistiques et logs**

### 2. Chercher les Logs d'Erreur

Cherchez :
- **Logs d'erreur** pour `fabrication.laplume-artisanale.tn`
- **Logs Node.js** ou **Logs d'application**
- **Erreurs récentes**

### 3. Noter les Erreurs

Copiez les erreurs que vous voyez. Elles indiqueront pourquoi l'application ne démarre pas.

---

## 🔧 Solutions Selon les Erreurs

### Erreur : "Cannot find module"

**Solution** :
```bash
cd ~/fouta-erp/backend
npm install --production
```

### Erreur : "SyntaxError" ou "Unexpected token"

**Solution** : Vérifier que `package.json` contient `"type": "module"`

### Erreur : "EACCES" ou "Permission denied"

**Solution** : Vérifier les permissions des fichiers

### Erreur : "ECONNREFUSED" (Base de données)

**Solution** : Vérifier la connexion à PostgreSQL

---

## ✅ Solution Alternative : Vérifier la Configuration OVH

Dans le panneau OVH → Multisite → `fabrication.laplume-artisanale.tn` :

1. **Vérifiez** s'il y a une option "Point d'entrée" ou "Entry point"
2. **Mettez** : `index.js`
3. **Sauvegardez**

---

## 🔍 Vérifications sur le Serveur

Sur le serveur SSH, vérifiez :

```bash
cd ~/fouta-erp/backend

# 1. Vérifier index.js
cat index.js

# 2. Vérifier package.json
cat package.json | grep -E "(type|module|main)"

# 3. Vérifier que express est installé
ls -la node_modules/express/ 2>/dev/null || echo "Express non installé"

# 4. Vérifier .ovhconfig
cat .ovhconfig
```

---

## ✅ Solution : Créer un package.json à la Racine

Parfois OVH cherche `package.json` à la racine. Vérifions :

```bash
cd ~/fouta-erp/backend

# Vérifier que package.json existe
ls -la package.json

# Vérifier le contenu
cat package.json | head -15
```

Doit contenir :
```json
{
  "type": "module",
  "main": "index.js",
  ...
}
```

---

## 📋 Checklist de Diagnostic

- [ ] Logs OVH vérifiés
- [ ] Erreurs notées
- [ ] `package.json` vérifié (contient `"type": "module"`)
- [ ] `index.js` vérifié
- [ ] Modules installés
- [ ] Configuration OVH vérifiée (point d'entrée)

---

## 🎯 Action Immédiate

1. **Vérifiez les logs** dans le panneau OVH → Statistiques et logs
2. **Notez les erreurs** que vous voyez
3. **Dites-moi les erreurs** pour que je puisse vous aider à les corriger

---

## 💡 Note

L'erreur 501 signifie que Node.js est activé mais l'application ne peut pas démarrer. Les logs OVH contiennent l'erreur exacte qui empêche le démarrage.

---

## 🆘 Si Vous Ne Trouvez Pas les Logs

Si vous ne trouvez pas les logs dans le panneau OVH :

1. **Contactez le support OVH** avec :
   - Le domaine : `fabrication.laplume-artisanale.tn`
   - L'erreur 501
   - La demande de voir les logs d'erreur Node.js

2. **Demandez** :
   - Pourquoi l'application Node.js ne démarre pas
   - Quelles sont les erreurs dans les logs
   - Comment résoudre le problème

