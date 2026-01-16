# 🌐 Tester Depuis l'Extérieur - Important

## ❌ Ne Pas Tester Depuis le Serveur SSH

Le serveur SSH **ne peut pas** se connecter à son propre domaine via HTTP. C'est normal et attendu.

---

## ✅ Tester Depuis Votre Machine Windows

### Depuis PowerShell Windows

```powershell
# Tester la route /health
curl http://fabrication.laplume-artisanale.tn/health

# OU tester la route racine
curl http://fabrication.laplume-artisanale.tn/
```

### Depuis Votre Navigateur

1. **Ouvrez votre navigateur**
2. **Allez sur** : `http://fabrication.laplume-artisanale.tn`
3. **OU** : `http://fabrication.laplume-artisanale.tn/health`

---

## 📊 Résultats Possibles

### ✅ Succès

**Résultat** :
```json
{
  "status": "OK",
  "message": "Application Node.js fonctionne !",
  "timestamp": "2025-11-23T..."
}
```

**Signification** : 🎉 L'application fonctionne !

---

### ⚠️ Erreur 501

**Résultat** : "501 Not Implemented"

**Action** :
- Attendez encore 2-3 minutes
- Vérifiez les logs dans le panneau OVH
- Réessayez

---

### ❌ Listing de Répertoire

**Résultat** : "Index of /"

**Signification** : Node.js n'est toujours pas activé

**Action** :
- Contactez le support OVH
- Vérifiez la configuration dans le panneau

---

### ❌ Erreur 502/503

**Résultat** : "502 Bad Gateway" ou "503 Service Unavailable"

**Signification** : Node.js est activé mais l'application ne démarre pas

**Action** :
- Vérifiez les logs dans le panneau OVH
- Vérifiez que les modules sont installés
- Vérifiez la connexion à la base de données

---

## 🔍 Vérifications sur le Serveur

Pendant que vous testez depuis l'extérieur, vous pouvez vérifier sur le serveur :

```bash
# Vérifier que index.js est correct
cat ~/fouta-erp/backend/index.js

# Vérifier que .ovhconfig est présent
cat ~/fouta-erp/backend/.ovhconfig

# Vérifier que les modules sont installés
ls -la ~/fouta-erp/backend/node_modules/ | head -10
```

---

## 📋 Checklist

- [ ] Testé depuis Windows (PowerShell ou navigateur)
- [ ] PAS testé depuis le serveur SSH
- [ ] Attendu 2-3 minutes après création de index.js
- [ ] Résultat obtenu et noté

---

## 🎯 Action Immédiate

1. **Depuis votre machine Windows** (PAS depuis SSH) :
   ```powershell
   curl http://fabrication.laplume-artisanale.tn/health
   ```

2. **OU depuis votre navigateur** :
   - `http://fabrication.laplume-artisanale.tn/health`

3. **Dites-moi ce que vous voyez**

---

## 💡 Note Importante

**Ne testez JAMAIS depuis le serveur SSH lui-même**. Le serveur ne peut pas se connecter à son propre domaine via HTTP. C'est une limitation normale.

**Testez TOUJOURS depuis** :
- Votre machine Windows (PowerShell)
- Votre navigateur
- Une autre machine

---

## 🆘 Si Problème Persiste

Si après test depuis l'extérieur vous voyez encore une erreur :

1. **Vérifiez les logs** dans le panneau OVH
2. **Attendez encore 5 minutes** (parfois OVH prend du temps)
3. **Contactez le support OVH** si nécessaire

