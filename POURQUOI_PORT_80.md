# 🔍 Pourquoi le Port 80 dans curl ?

## ✅ Explication

Quand vous faites :
```bash
curl http://fabrication.laplume-artisanale.tn/health
```

**Le port 80 est normal** - c'est le port HTTP par défaut.

### Ports HTTP/HTTPS Standards

- **HTTP** : Port `80` (par défaut)
- **HTTPS** : Port `443` (par défaut)

Quand vous ne spécifiez pas de port dans l'URL :
- `http://domain.com` → Port `80`
- `https://domain.com` → Port `443`

---

## 🔄 Comment Ça Fonctionne sur OVH

### Architecture OVH

```
Internet → Port 80 (HTTP) → Reverse Proxy OVH → Port Interne Node.js
```

1. **Port 80 (externe)** : C'est le port que les utilisateurs utilisent
2. **Reverse Proxy OVH** : Route les requêtes vers l'application Node.js
3. **Port Interne Node.js** : Le port que votre application écoute (fourni par OVH via `process.env.PORT`)

### Exemple

- **URL externe** : `http://fabrication.laplume-artisanale.tn/health` (port 80)
- **Application Node.js** : Écoute sur un port interne (ex: 30000, fourni par OVH)
- **OVH Reverse Proxy** : Route le port 80 vers le port interne

---

## ❌ Pourquoi "Connexion Refusée" ?

### Le Problème

```
curl http://fabrication.laplume-artisanale.tn/health
curl: (7) Failed to connect to fabrication.laplume-artisanale.tn port 80: Connexion refusée
```

**Cela signifie** :
- Le port 80 est accessible (pas de problème de firewall)
- Mais **l'application Node.js ne démarre pas**
- Donc le reverse proxy OVH ne peut pas router les requêtes vers l'application
- Résultat : "Connexion refusée"

---

## ✅ Solution

### Le Vrai Problème

**Ce n'est pas le port 80** - c'est que **l'application Node.js ne démarre pas automatiquement**.

### Actions à Faire

1. **Vérifier la configuration Multisite OVH** :
   - Dossier racine : `fouta-erp/backend`
   - Node.js : Activé

2. **Vérifier les fichiers essentiels** :
   - `.ovhconfig` présent
   - `index.js` présent
   - Code correct (écoute sur `127.0.0.1:PORT`)

3. **Forcer un redémarrage** :
   ```bash
   touch index.js
   touch .ovhconfig
   ```

4. **Attendre 15-20 minutes**

5. **Vérifier que l'application tourne** :
   ```bash
   ps aux | grep node | grep -v grep
   ```

6. **Tester** :
   ```bash
   curl http://fabrication.laplume-artisanale.tn/health
   ```

---

## 💡 Note

**Le port 80 dans curl est normal** - c'est le port HTTP standard.

**Le problème est que l'application Node.js ne démarre pas**, donc le reverse proxy OVH ne peut pas router les requêtes.

**Une fois l'application démarrée**, curl sur le port 80 fonctionnera automatiquement grâce au reverse proxy OVH.

---

## 📋 Checklist

- [x] Compris : Port 80 est normal pour HTTP
- [ ] Application Node.js vérifiée : `ps aux | grep node`
- [ ] Configuration Multisite vérifiée
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes
- [ ] Testé : `curl http://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Port 80 est normal** - c'est le port HTTP par défaut
2. **Le problème** : L'application Node.js ne démarre pas
3. **Solution** : Vérifier la configuration Multisite OVH et forcer un redémarrage
4. **Une fois démarrée** : curl sur le port 80 fonctionnera automatiquement

**Le port 80 n'est pas le problème - c'est que l'application ne démarre pas !**

