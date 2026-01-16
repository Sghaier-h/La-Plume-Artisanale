# 🌐 Configurer le Domaine dans le Panneau OVH

## ⚠️ Important : Redirection DNS ≠ Configuration OVH

La redirection DNS vers l'IP ne suffit pas. Il faut **configurer le domaine dans le panneau OVH** pour activer Node.js.

---

## 🚀 Étapes de Configuration

### Étape 1 : Accéder au Panneau OVH

1. Allez sur [https://www.ovh.com/manager/](https://www.ovh.com/manager/)
2. Connectez-vous avec vos identifiants
3. Allez dans **Web Cloud** → **Hébergements**

---

### Étape 2 : Configurer le Multisite

1. Cliquez sur votre hébergement
2. Allez dans l'onglet **Multisite**
3. Cliquez sur **Ajouter un domaine ou un sous-domaine**

---

### Étape 3 : Ajouter le Domaine

Remplissez le formulaire :

- **Domaine** : `fabrication.laplume-artisanale.tn`
- **Dossier racine** : `/fouta-erp` ou `/fouta-erp/backend` (selon votre configuration)
- **Activer SSL** : Oui (recommandé)
- **Activer Node.js** : **OUI** (important !)

---

### Étape 4 : Configurer Node.js

Si l'option Node.js est disponible :

1. **Version Node.js** : Sélectionnez **18.x** ou la version disponible
2. **Point d'entrée** : `backend/src/server.js` ou `src/server.js`
3. **Variables d'environnement** : 
   - `NODE_ENV=production`
   - `PORT=5000` (ou le port fourni par OVH)

---

### Étape 5 : Vérifier le Dossier Racine

Le dossier racine doit pointer vers votre application :

```
/fouta-erp/backend
```

OU

```
/fouta-erp
```

Selon où se trouve votre `package.json` et `src/server.js`.

---

## 🔧 Configuration Alternative : Via .htaccess

Si Node.js n'est pas directement disponible, vous pouvez utiliser un `.htaccess` :

```apache
# Dans /fouta-erp/backend/.htaccess
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

Mais cela nécessite que le port 5000 fonctionne, ce qui n'est pas le cas.

---

## 📋 Vérification

Après configuration :

1. **Attendez 5-10 minutes** pour la propagation DNS
2. **Testez** : `https://fabrication.laplume-artisanale.tn`
3. **Vérifiez les logs** : `pm2 logs fouta-api`

---

## 🚨 Problèmes Courants

### Problème 1 : Node.js Non Disponible

Si Node.js n'est pas disponible dans le panneau :
- Contactez le support OVH
- Ou passez à un VPS OVH

### Problème 2 : Mauvais Dossier Racine

Vérifiez que le dossier racine pointe vers :
- Le dossier contenant `package.json`
- Le dossier contenant `src/server.js`

### Problème 3 : Application Ne Démarre Pas

Vérifiez les logs dans le panneau OVH ou via SSH :
```bash
pm2 logs fouta-api
```

---

## 💡 Note sur l'IP

L'IP `46.105.204.30` que vous avez configurée est différente de `145.239.37.162` que nous avons utilisée. Vérifiez quelle est la bonne IP de votre serveur dans le panneau OVH.

---

## 🎯 Résumé

1. **Allez dans le panneau OVH** → Hébergements → Multisite
2. **Ajoutez le domaine** `fabrication.laplume-artisanale.tn`
3. **Activez Node.js** pour ce domaine
4. **Configurez le dossier racine** vers `/fouta-erp/backend`
5. **Attendez la propagation** (5-10 minutes)
6. **Testez** l'accès au domaine

---

## ✅ Après Configuration

Une fois configuré, votre application sera accessible via :
- `https://fabrication.laplume-artisanale.tn`
- OVH gérera automatiquement le reverse proxy

---

## 🆘 Si Problème

Si vous ne trouvez pas l'option Node.js dans le panneau :
1. Contactez le support OVH
2. Demandez comment activer Node.js pour votre domaine
3. Ou envisagez un VPS OVH pour plus de contrôle

