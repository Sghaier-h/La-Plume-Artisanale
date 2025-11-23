# ✅ Vérifier Après Création du .ovhconfig

## ✅ Fichier .ovhconfig Créé

Le fichier `.ovhconfig` a été créé avec succès. Maintenant, vérifions que tout fonctionne.

---

## 🔍 Vérifications à Effectuer

### 1. Vérifier la Structure des Fichiers

```bash
cd ~/fouta-erp/backend

# Vérifier que tous les fichiers sont présents
ls -la

# Vous devriez voir :
# - .ovhconfig ✅
# - .env
# - package.json
# - src/
#   - server.js
```

### 2. Vérifier le Contenu de .ovhconfig

```bash
cat .ovhconfig
```

Doit afficher :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
```

### 3. Vérifier que l'Application Tourne avec PM2

```bash
# Charger nvm et PM2
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$PATH"

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs fouta-api --lines 20
```

---

## ⏰ Attendre la Propagation

Après création du `.ovhconfig` :

1. **Attendez 5-10 minutes** pour qu'OVH prenne en compte le fichier
2. **Redémarrez** l'application si nécessaire :
   ```bash
   pm2 restart fouta-api
   ```

---

## 🧪 Tests à Effectuer

### Test 1 : Accès au Domaine

```bash
# Tester depuis le serveur
curl https://fabrication.laplume-artisanale.tn

# OU tester depuis votre navigateur
# https://fabrication.laplume-artisanale.tn
```

### Test 2 : Health Check

```bash
# Tester l'endpoint health
curl https://fabrication.laplume-artisanale.tn/health

# Résultat attendu :
# {"status":"OK","timestamp":"..."}
```

### Test 3 : API Endpoint

```bash
# Tester un endpoint API
curl https://fabrication.laplume-artisanale.tn/api/health
```

---

## 🔧 Si Ça Ne Fonctionne Pas

### Problème 1 : Erreur 502 ou 503

Cela signifie que Node.js n'est pas encore activé ou que l'application ne démarre pas.

**Solution** :
```bash
# Vérifier les logs OVH (si disponibles dans le panneau)
# OU vérifier les logs PM2
pm2 logs fouta-api

# Redémarrer l'application
pm2 restart fouta-api
```

### Problème 2 : Erreur 404

Le domaine ne pointe pas vers le bon dossier.

**Solution** :
- Vérifiez dans le panneau OVH que le dossier racine est bien `fouta-erp/backend`
- Attendez encore quelques minutes

### Problème 3 : Node.js Non Reconnu

Le fichier `.ovhconfig` n'est pas pris en compte.

**Solution** :
1. Vérifiez que le fichier est bien dans le dossier racine
2. Vérifiez la syntaxe XML
3. Contactez le support OVH

---

## 📋 Checklist

- [x] Fichier `.ovhconfig` créé
- [ ] Configuration OVH sauvegardée (dossier racine : `fouta-erp/backend`)
- [ ] Application PM2 en cours d'exécution
- [ ] Attendu 5-10 minutes
- [ ] Testé l'accès au domaine
- [ ] Testé l'endpoint `/health`

---

## 🎯 Prochaines Étapes

1. **Sauvegardez** la configuration dans le panneau OVH (si pas encore fait)
2. **Attendez 5-10 minutes**
3. **Testez** l'accès au domaine
4. **Vérifiez** les logs si problème

---

## 💡 Note

Le fichier `.ovhconfig` peut prendre quelques minutes à être pris en compte par OVH. Si après 10-15 minutes ça ne fonctionne toujours pas, contactez le support OVH.

---

## 🆘 Support

Si après toutes ces vérifications ça ne fonctionne pas :
1. Vérifiez les logs dans le panneau OVH
2. Contactez le support OVH avec :
   - Le fichier `.ovhconfig` créé
   - Le dossier racine configuré
   - Les erreurs rencontrées

