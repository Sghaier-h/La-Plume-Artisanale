# 🔐 Configurer les IPs Autorisées - PostgreSQL OVH

## 🎯 IP à Autoriser

Pour que votre serveur puisse se connecter à la base PostgreSQL OVH, vous devez autoriser son IP.

---

## ✅ IP du Serveur à Autoriser

**IP de votre serveur** : `145.239.37.162`

C'est l'IP de votre hébergement `fabrication.laplume-artisanale.tn`.

---

## 🚀 Comment Autoriser l'IP

### Dans le Panneau OVH

1. Allez dans votre instance **PostgreSQL** (Web Cloud Databases)
2. Cliquez sur l'onglet **"IPs autorisées"** ou **"Authorized IPs"**
3. Cliquez sur **"Ajouter une IP"** ou **"Add IP"**
4. Entrez : `145.239.37.162`
5. Description (optionnel) : `Serveur fabrication.laplume-artisanale.tn`
6. Cliquez sur **"Valider"** ou **"Add"**

---

## 🔓 Option : Autoriser Toutes les IPs (Développement uniquement)

⚠️ **Attention** : Pour le développement/test uniquement, vous pouvez autoriser :
- `0.0.0.0/0` (toutes les IPs)

**Mais c'est moins sécurisé !** Pour la production, autorisez uniquement l'IP de votre serveur.

---

## 📋 Checklist

- [ ] Instance PostgreSQL créée
- [ ] Base `fouta_erp` créée
- [ ] Utilisateur `fouta_user` créé
- [ ] **IP `145.239.37.162` autorisée** ← Important !
- [ ] Identifiants notés

---

## ✅ Après Autorisation

Une fois l'IP autorisée, vous pourrez vous connecter depuis votre serveur :

```bash
# Test de connexion
psql -h postgresql-xxxxx.ovh.net -p 5432 -U fouta_user -d fouta_erp
```

---

## 🆘 Si la Connexion Échoue

Vérifiez :
1. ✅ L'IP est bien autorisée dans OVH
2. ✅ Le firewall du serveur autorise le port 5432 (sortant)
3. ✅ Les identifiants sont corrects
4. ✅ Le serveur PostgreSQL est démarré

---

## 💡 Astuce

Si vous voulez tester depuis votre machine locale aussi, ajoutez votre IP publique :
- Trouvez votre IP : https://whatismyipaddress.com/
- Ajoutez-la aussi dans "IPs autorisées"

---

## 🎯 Résumé

**IP à autoriser** : `145.239.37.162`

C'est l'IP de votre serveur qui va se connecter à la base PostgreSQL.

