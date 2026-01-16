# 🔍 Trouver l'IP Publique du Serveur Web

## ❌ Problème

La commande `curl -s ifconfig.me` ne retourne rien.

---

## ✅ Solutions Alternatives

### Méthode 1 : Utiliser Plusieurs Services

```bash
# Essayer plusieurs services
curl -s ifconfig.me
curl -s ipinfo.io/ip
curl -s icanhazip.com
curl -s ipecho.net/plain
curl -s checkip.amazonaws.com
```

### Méthode 2 : Utiliser wget (si disponible)

```bash
wget -qO- ifconfig.me
wget -qO- ipinfo.io/ip
```

### Méthode 3 : Utiliser hostname avec l'IP du serveur

```bash
# Voir l'IP locale
hostname -I

# Voir l'IP publique via l'API OVH (si disponible)
curl -s https://api.ipify.org
```

### Méthode 4 : Utiliser l'Interface OVH

Dans le panneau OVH :
1. **Hébergement** → **Informations générales**
2. **IP du serveur** : L'IP publique est affichée

---

## 🔧 Solution Recommandée : Utiliser l'IP du Serveur OVH

### Option 1 : Autoriser Toutes les IPs (Pour les Tests)

Dans le panneau OVH :
1. **Web Cloud** → **Databases** → **sh131616-002**
2. **Onglet** : **IPs autorisées**
3. **Ajouter** : `0.0.0.0/0`
4. **Description** : `Toutes les IPs (test)`

**⚠️ Note** : Moins sécurisé, mais fonctionne pour les tests.

### Option 2 : Trouver l'IP via l'Interface OVH

1. **Connectez-vous au panneau OVH**
2. **Hébergement** → **Informations générales**
3. **Notez l'IP publique** du serveur
4. **Ajoutez cette IP** dans les IPs autorisées de la base de données

---

## 📋 Checklist

- [ ] IP trouvée (via curl, wget, ou interface OVH)
- [ ] IP ajoutée dans "IPs autorisées" de la base de données
- [ ] Connexion testée depuis le serveur web

---

## ✅ Résumé

1. **Essayer plusieurs services** : `curl -s ipinfo.io/ip`, `curl -s icanhazip.com`
2. **OU utiliser l'interface OVH** pour trouver l'IP
3. **OU autoriser `0.0.0.0/0`** pour les tests (moins sécurisé)

**Pour les tests, autoriser `0.0.0.0/0` est la solution la plus simple !**

