# 🌐 Tester l'Application Depuis l'Extérieur

## ❌ Problème : Connexion Refusée depuis le Serveur

Le serveur SSH ne peut pas se connecter à son propre domaine via HTTP. C'est normal. Il faut tester depuis l'extérieur.

---

## ✅ Solution 1 : Tester depuis Votre Navigateur

1. **Ouvrez votre navigateur**
2. **Allez sur** : `http://fabrication.laplume-artisanale.tn`
3. **OU** : `http://fabrication.laplume-artisanale.tn/health`

### Résultats Possibles

- **Listing de répertoire** : Node.js n'est pas encore activé
- **Erreur 502/503** : Node.js est activé mais l'application ne démarre pas
- **{"status":"OK"}** : ✅ L'application fonctionne !
- **Page d'erreur Node.js** : Node.js est activé mais il y a une erreur dans le code

---

## ✅ Solution 2 : Tester avec curl depuis Windows

Depuis votre machine Windows (PowerShell) :

```powershell
# Tester en HTTP
curl http://fabrication.laplume-artisanale.tn/health

# OU tester en HTTPS (si SSL est configuré)
curl https://fabrication.laplume-artisanale.tn/health
```

---

## ✅ Solution 3 : Vérifier la Configuration DNS

Vérifiez que le domaine pointe vers la bonne IP :

```bash
# Depuis Windows (PowerShell)
nslookup fabrication.laplume-artisanale.tn

# OU depuis le serveur SSH
nslookup fabrication.laplume-artisanale.tn
```

L'IP devrait être `145.239.37.162` ou une IP OVH.

---

## 🔍 Diagnostic

### Vérifier que index.js est Créé

```bash
# Sur le serveur SSH
ls -la ~/fouta-erp/backend/index.js
cat ~/fouta-erp/backend/index.js
```

### Vérifier que .ovhconfig est Présent

```bash
cat ~/fouta-erp/backend/.ovhconfig
```

---

## ⏰ Attendre la Propagation

Après création de `index.js` :
- **Attendez 10-15 minutes** pour qu'OVH prenne en compte les changements
- **Testez depuis votre navigateur** (pas depuis le serveur SSH)

---

## 📋 Checklist

- [ ] Fichier `index.js` créé
- [ ] Fichier `.ovhconfig` présent
- [ ] Attendu 10-15 minutes
- [ ] Testé depuis le navigateur (pas depuis SSH)
- [ ] Vérifié la configuration DNS

---

## 🎯 Action Immédiate

1. **Vérifiez** que `index.js` est créé :
   ```bash
   ls -la ~/fouta-erp/backend/index.js
   ```

2. **Attendez 10-15 minutes**

3. **Testez depuis votre navigateur** :
   - `http://fabrication.laplume-artisanale.tn`
   - `http://fabrication.laplume-artisanale.tn/health`

4. **OU testez depuis Windows (PowerShell)** :
   ```powershell
   curl http://fabrication.laplume-artisanale.tn/health
   ```

---

## 💡 Note

Il est **normal** que la connexion soit refusée depuis le serveur SSH lui-même. Le serveur ne peut pas se connecter à son propre domaine via HTTP. Il faut tester depuis l'extérieur (navigateur ou votre machine Windows).

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

1. Vérifiez que `index.js` est bien créé
2. Vérifiez que `.ovhconfig` est correct
3. Contactez le support OVH pour activer Node.js
4. Vérifiez la configuration DNS dans le panneau OVH

