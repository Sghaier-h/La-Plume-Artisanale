# 🔧 Corriger le DNS pour Pointer vers le VPS

## ❌ Problème Détecté

```
nslookup fabrication.laplume-artisanale.tn
Addresses:  2001:41d0:301::30
          145.239.37.162  ← ANCIEN SERVEUR (OVH Shared Hosting)
```

**Le DNS pointe vers l'ancien serveur** (`145.239.37.162`) au lieu du nouveau VPS (`137.74.40.191`).

**Résultat** : Quand vous accédez via le domaine, vous arrivez sur l'ancien serveur qui retourne `501 Not Implemented`.

---

## ✅ Solution : Corriger le DNS

### Étape 1 : Vérifier le DNS Actuel

#### Dans le Panneau OVH

1. **Se connecter** à https://www.ovh.com/manager/
2. **Domaines** → `laplume-artisanale.tn` → **Zone DNS**
3. **Chercher** l'entrée pour `fabrication`

**Vous devriez voir** :
- **Type** : A
- **Sous-domaine** : `fabrication`
- **Cible** : `145.239.37.162` ← **À CHANGER**

---

### Étape 2 : Modifier l'Entrée DNS

#### Option A : Modifier l'Entrée Existante

1. **Cliquer** sur l'entrée `fabrication` (Type A)
2. **Modifier** la cible : `145.239.37.162` → `137.74.40.191`
3. **Sauvegarder**

#### Option B : Supprimer et Recréer

1. **Supprimer** l'entrée existante pour `fabrication` (Type A)
2. **Ajouter une nouvelle entrée** :
   - **Type** : A
   - **Sous-domaine** : `fabrication`
   - **Cible** : `137.74.40.191`
   - **TTL** : 3600
3. **Sauvegarder**

---

### Étape 3 : Vérifier l'IPv6 (Optionnel mais Recommandé)

#### Si vous avez une IPv6

1. **Chercher** l'entrée AAAA pour `fabrication`
2. **Modifier** ou **Créer** :
   - **Type** : AAAA
   - **Sous-domaine** : `fabrication`
   - **Cible** : `2001:41d0:305:2100::ea97` (IPv6 du VPS)
   - **TTL** : 3600
3. **Sauvegarder**

---

## ⏳ Étape 4 : Attendre la Propagation DNS

### Temps de Propagation

- **Minimum** : 5 minutes
- **Moyen** : 15-30 minutes
- **Maximum** : 24 heures (rare)

### Vérifier la Propagation

#### Depuis PowerShell

```powershell
# Vérifier le DNS
nslookup fabrication.laplume-artisanale.tn

# Doit retourner : 137.74.40.191 (au lieu de 145.239.37.162)
```

#### Depuis le VPS

```bash
# Vérifier le DNS
dig fabrication.laplume-artisanale.tn +short

# Doit retourner : 137.74.40.191
```

---

## 🧪 Étape 5 : Tester après Propagation

### Une Fois le DNS Propagé

#### Depuis PowerShell

```powershell
# Vérifier le DNS
nslookup fabrication.laplume-artisanale.tn

# Doit retourner : 137.74.40.191

# Tester HTTP
curl.exe -I http://fabrication.laplume-artisanale.tn

# Doit retourner : HTTP/1.1 200 OK ou 502 Bad Gateway

# Tester le endpoint health
curl.exe http://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

#### Si ça Fonctionne

✅ **Le DNS est correctement configuré !**

Vous pouvez maintenant réessayer Certbot :

```bash
# Sur le VPS
sudo certbot --nginx -d fabrication.laplume-artisanale.tn
```

---

## 📋 Checklist

- [ ] DNS vérifié dans le panneau OVH
- [ ] Entrée A modifiée : `fabrication` → `137.74.40.191`
- [ ] Entrée AAAA modifiée (si applicable) : `fabrication` → `2001:41d0:305:2100::ea97`
- [ ] DNS sauvegardé dans le panneau OVH
- [ ] Attendu 15-30 minutes pour la propagation
- [ ] DNS vérifié : `nslookup fabrication.laplume-artisanale.tn` → `137.74.40.191`
- [ ] Domaine testé : `curl.exe http://fabrication.laplume-artisanale.tn/health` → `{"status":"OK"}`
- [ ] Certbot réessayé : `sudo certbot --nginx -d fabrication.laplume-artisanale.tn`

---

## 🔍 Vérifications Actuelles

### ✅ Ce qui Fonctionne

- **IP directe** : `curl.exe http://137.74.40.191/health` → ✅ Fonctionne
- **Nginx** : ✅ Actif et fonctionne
- **Application** : ✅ Répond correctement

### ❌ Ce qui ne Fonctionne Pas

- **DNS** : Pointe vers l'ancien serveur (`145.239.37.162`)
- **Domaine** : Retourne `501 Not Implemented` (ancien serveur)
- **Certbot** : Ne peut pas vérifier le domaine (DNS incorrect)

---

## ✅ Résumé

1. **Corriger le DNS** : Modifier l'entrée A `fabrication` → `137.74.40.191` dans le panneau OVH
2. **Attendre 15-30 minutes** pour la propagation
3. **Vérifier** : `nslookup fabrication.laplume-artisanale.tn` → `137.74.40.191`
4. **Tester** : `curl.exe http://fabrication.laplume-artisanale.tn/health`
5. **Réessayer Certbot** : `sudo certbot --nginx -d fabrication.laplume-artisanale.tn`

**Le problème est le DNS qui pointe vers l'ancien serveur. Corrigez-le dans le panneau OVH !**

