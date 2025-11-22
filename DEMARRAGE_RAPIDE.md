# ⚡ Démarrage Rapide - Déploiement OVH

## 🎯 Informations du serveur

- **IP** : `46.105.204.30`
- **Domaine** : `fabrication.laplume-artisanale.tn`
- **SSH** : `ssh allbyfb@46.105.204.30`
- **Mot de passe** : `Allbyfouta007` ⚠️

---

## 🚀 Déploiement en 2 commandes

### 1. Se connecter

```bash
ssh allbyfb@46.105.204.30
```

**Mot de passe** : `Allbyfouta007`

### 2. Exécuter le script

```bash
curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/SCRIPT_DEPLOIEMENT.sh | bash
```

Ou télécharger et exécuter :

```bash
wget https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/SCRIPT_DEPLOIEMENT.sh
chmod +x SCRIPT_DEPLOIEMENT.sh
bash SCRIPT_DEPLOIEMENT.sh
```

---

## 📋 Réponses aux questions

Le script va vous demander :

1. **Mot de passe PostgreSQL** : Choisissez un mot de passe fort (différent de Allbyfouta007)
2. **JWT Secret** : Appuyez sur Entrée pour générer automatiquement

---

## ✅ Vérification

Après l'installation :

```bash
# Tester l'API
curl https://fabrication.laplume-artisanale.tn/health
curl http://46.105.204.30:5000/health

# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs fouta-api
```

---

## 🔐 Sécurité - À faire immédiatement

### Changer le mot de passe SSH

```bash
passwd
```

### Configurer le firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📱 URL API pour Android

```
https://fabrication.laplume-artisanale.tn/api/v1/
```

---

## 🆘 Problèmes ?

Consultez `DEPLOIEMENT_COMPLET.md` pour le guide détaillé et le dépannage.

---

## 🎉 C'est tout !

Votre application sera accessible sur :
- **https://fabrication.laplume-artisanale.tn**
- **http://46.105.204.30:5000**

