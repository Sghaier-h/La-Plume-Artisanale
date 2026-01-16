# 📞 Contacter le Support OVH pour Activer Node.js

## ❌ Situation Actuelle

Malgré la création de `.ovhconfig` et `index.js`, le listing de répertoire persiste. Node.js n'est pas activé automatiquement et doit être activé manuellement par le support OVH.

---

## 📝 Message à Envoyer au Support OVH

### Via Ticket Support (Recommandé)

1. Allez sur [https://www.ovh.com/manager/](https://www.ovh.com/manager/)
2. Connectez-vous
3. Allez dans **Support** → **Créer un ticket**
4. Sélectionnez **Hébergement web**
5. Copiez-collez le message ci-dessous :

---

### Message pour le Support

```
Bonjour,

J'ai un hébergement partagé OVH et je souhaite activer Node.js pour mon domaine.

INFORMATIONS TECHNIQUES :
- Domaine : fabrication.laplume-artisanale.tn
- Dossier racine : fouta-erp/backend
- Serveur : cluster130.hosting.ovh.net
- Type d'hébergement : [À remplir depuis le panneau OVH]

CONFIGURATION EFFECTUÉE :
1. Fichier .ovhconfig créé dans fouta-erp/backend/ avec :
   <?xml version="1.0" encoding="UTF-8"?>
   <engine>
       <name>nodejs</name>
       <version>18</version>
   </engine>

2. Fichier index.js créé dans fouta-erp/backend/ comme point d'entrée

3. Application Node.js prête avec :
   - package.json configuré
   - src/server.js comme serveur Express
   - Modules installés dans node_modules/

PROBLÈME :
Malgré ces fichiers, je vois toujours un listing de répertoire (Index of /) au lieu de l'application Node.js.

DEMANDES :
1. Pouvez-vous activer Node.js pour le domaine fabrication.laplume-artisanale.tn ?
2. Vérifier que le fichier .ovhconfig est pris en compte ?
3. Me confirmer si mon type d'hébergement supporte Node.js ?
4. Si oui, quelle est la procédure pour activer Node.js ?

Merci de votre aide.
```

---

## 📋 Informations Complémentaires à Fournir

Si le support demande plus d'informations :

### Structure des Fichiers

```
fouta-erp/backend/
├── .ovhconfig          (Configuration Node.js 18)
├── .env                (Variables d'environnement)
├── index.js            (Point d'entrée)
├── package.json        (Dépendances Node.js)
├── src/
│   └── server.js       (Serveur Express)
└── node_modules/       (Modules installés)
```

### Contenu de .ovhconfig

```xml
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
```

### Contenu de index.js

```javascript
// Point d'entrée pour OVH
import './src/server.js';
```

---

## 🔍 Vérifications Préalables

Avant de contacter le support, vérifiez :

### 1. Type d'Hébergement

Dans le panneau OVH → Informations générales → Type d'hébergement

**Types qui supportent Node.js** :
- Hébergement Perso
- Hébergement Pro
- Hébergement Performance

**Types qui ne supportent pas Node.js** :
- Hébergement gratuit
- Certains anciens hébergements

### 2. Configuration Multisite

Dans le panneau OVH → Multisite → `fabrication.laplume-artisanale.tn` :
- Dossier racine : `fouta-erp/backend`
- Vérifiez s'il y a une option "Node.js" ou "Runtime"

---

## ⏰ Délai de Réponse

Le support OVH répond généralement sous **24-48 heures**. 

En attendant, vous pouvez :
- Vérifier que tous les fichiers sont en place
- Préparer les informations pour le support
- Envisager un VPS OVH si Node.js n'est pas disponible

---

## 🆘 Si Node.js N'est Pas Disponible

Si le support confirme que votre hébergement ne supporte pas Node.js :

### Option 1 : Passer à un VPS OVH

- **VPS Starter** : ~3€/mois
- **Contrôle complet** : Node.js, ports, configuration libre
- **Idéal pour Node.js** : Pas de limitations

### Option 2 : Changer d'Hébergeur

Cherchez un hébergeur qui supporte Node.js sur hébergement partagé :
- Heroku
- Railway
- Render
- DigitalOcean App Platform

---

## 📞 Méthodes de Contact

### 1. Ticket Support (Recommandé)

- Panneau OVH → Support → Créer un ticket
- Réponse sous 24-48h

### 2. Chat en Direct

- Panneau OVH → Support → Chat
- Disponible aux horaires de bureau

### 3. Téléphone

- Vérifiez les horaires sur votre panneau OVH

---

## ✅ Après Activation par le Support

Une fois Node.js activé par le support :

1. **Attendez 5-10 minutes** pour la propagation
2. **Testez** : `http://fabrication.laplume-artisanale.tn/health`
3. **Vous devriez voir** : `{"status":"OK","timestamp":"..."}`

---

## 🎯 Action Immédiate

1. **Vérifiez le type d'hébergement** dans le panneau OVH
2. **Créez un ticket support** avec le message ci-dessus
3. **Attendez la réponse** du support (24-48h)

---

## 💡 Note

Sur hébergement partagé OVH, Node.js doit souvent être activé **manuellement par le support**. Le fichier `.ovhconfig` seul ne suffit pas toujours. C'est normal et le support pourra vous aider.

