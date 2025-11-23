# 📞 Contacter le Support OVH - Guide

## 🎯 Objectif

Obtenir de l'aide pour configurer votre application Node.js sur hébergement partagé OVH.

---

## 📋 Informations à Fournir au Support

### 1. Votre Situation

```
Bonjour,

J'ai une application Node.js que je souhaite déployer sur mon hébergement partagé OVH.

- Domaine : fabrication.laplume-artisanale.tn
- Application : Node.js 18 avec Express
- Problème : Tous les ports sont bloqués (EACCES: permission denied)
  - Ports testés : 5000, 30000, 50000
  - Même sur localhost (127.0.0.1)

Questions :
1. Quels ports sont autorisés pour Node.js sur hébergement partagé ?
2. Comment configurer le reverse proxy pour pointer vers mon application Node.js ?
3. Y a-t-il une variable d'environnement spécifique pour le port ?
4. Dois-je activer Node.js dans le panneau pour ce domaine ?

Merci de votre aide.
```

---

### 2. Informations Techniques

- **Domaine** : `fabrication.laplume-artisanale.tn`
- **Serveur** : `ssh.cluster130.hosting.ovh.net`
- **Node.js** : v18.20.8
- **Application** : Express.js (API REST)
- **Port souhaité** : N'importe quel port autorisé

---

## 🔗 Comment Contacter le Support OVH

### Option 1 : Ticket Support (Recommandé)

1. Allez sur [https://www.ovh.com/manager/](https://www.ovh.com/manager/)
2. Connectez-vous
3. Allez dans **Support** → **Créer un ticket**
4. Sélectionnez **Hébergement web**
5. Remplissez le formulaire avec les informations ci-dessus

### Option 2 : Chat en Direct

1. Allez sur le panneau OVH
2. Cherchez **Support** ou **Aide**
3. Cliquez sur **Chat en direct** (si disponible)

### Option 3 : Téléphone

- **Support technique** : Vérifiez les horaires sur votre panneau OVH

---

## 📝 Questions à Poser

1. **Ports autorisés** : Quels ports puis-je utiliser pour Node.js ?
2. **Reverse proxy** : Comment configurer le reverse proxy pour mon application ?
3. **Node.js** : Dois-je activer Node.js dans le panneau pour mon domaine ?
4. **Variables d'environnement** : Y a-t-il des variables spécifiques à utiliser ?
5. **Limitations** : Quelles sont les limitations pour Node.js sur hébergement partagé ?

---

## ✅ Après la Réponse du Support

Une fois que vous avez les informations :

1. **Notez les ports autorisés** ou la méthode de configuration
2. **Configurez l'application** selon les instructions
3. **Testez l'accès** via le domaine

---

## 💡 Alternative : VPS OVH

Si l'hébergement partagé ne convient pas :

- **VPS Starter** : ~3€/mois
- **Contrôle complet** : Ports, root, configuration libre
- **Idéal pour Node.js** : Pas de limitations

---

## 🎯 Résumé

**Contactez le support OVH** avec les informations ci-dessus pour obtenir de l'aide sur la configuration Node.js sur hébergement partagé.

