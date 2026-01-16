# 🔧 Activer Node.js Manuellement - Le Listing Persiste

## ❌ Problème : Listing de Répertoire Persiste

Malgré la création de `.ovhconfig` et `index.js`, le listing de répertoire persiste. Node.js n'est pas activé automatiquement.

---

## ✅ Solution 1 : Vérifier le Type d'Hébergement

Dans le panneau OVH :
1. Allez dans **Informations générales**
2. Vérifiez le **Type d'hébergement**
3. Certains types ne supportent pas Node.js

**Types qui supportent Node.js** :
- Hébergement Perso
- Hébergement Pro
- Hébergement Performance

**Types qui ne supportent pas Node.js** :
- Hébergement gratuit
- Certains anciens hébergements

---

## ✅ Solution 2 : Contacter le Support OVH

Si Node.js n'est pas activé automatiquement, **contactez le support OVH** :

### Informations à Fournir

```
Bonjour,

J'ai un hébergement partagé OVH et je souhaite activer Node.js pour mon domaine.

- Domaine : fabrication.laplume-artisanale.tn
- Dossier racine : fouta-erp/backend
- Fichier .ovhconfig créé avec Node.js 18
- Fichier index.js créé comme point d'entrée

Malgré ces fichiers, je vois toujours un listing de répertoire au lieu de l'application Node.js.

Pouvez-vous :
1. Activer Node.js pour ce domaine ?
2. Vérifier que le fichier .ovhconfig est pris en compte ?
3. Me confirmer si mon type d'hébergement supporte Node.js ?

Merci de votre aide.
```

---

## ✅ Solution 3 : Vérifier la Configuration dans le Panneau

Dans le panneau OVH → Multisite → `fabrication.laplume-artisanale.tn` :

1. **Vérifiez** s'il y a une option "Node.js" ou "Runtime"
2. **Activez-la** si disponible
3. **Sélectionnez** Node.js 18
4. **Point d'entrée** : `index.js` ou `src/server.js`

---

## ✅ Solution 4 : Créer un Fichier .htaccess

Si Node.js n'est pas disponible, essayez avec un `.htaccess` (si PHP est disponible) :

```bash
cd ~/fouta-erp/backend

# Créer .htaccess
cat > .htaccess << 'EOF'
DirectoryIndex index.js
RewriteEngine On
RewriteRule ^(.*)$ index.js [L]
EOF
```

Mais cela ne fonctionnera que si Node.js est activé.

---

## ✅ Solution 5 : Vérifier les Permissions

Vérifiez que les fichiers ont les bonnes permissions :

```bash
cd ~/fouta-erp/backend

# Vérifier les permissions
ls -la index.js .ovhconfig

# Si nécessaire, modifier les permissions
chmod 644 index.js
chmod 644 .ovhconfig
```

---

## 🔍 Diagnostic

### Vérifier que les Fichiers sont au Bon Endroit

```bash
cd ~/fouta-erp/backend

# Vérifier tous les fichiers
ls -la | grep -E "(index.js|.ovhconfig|.env)"

# Vérifier le contenu
cat index.js
cat .ovhconfig
```

### Vérifier le Dossier Racine dans OVH

Dans le panneau OVH, vérifiez que le dossier racine est bien :
- `fouta-erp/backend`

Et non :
- `fouta-erp`
- `./fouta-erp/backend`

---

## 📋 Checklist

- [ ] Vérifié le type d'hébergement dans OVH
- [ ] Vérifié la configuration du multisite
- [ ] Vérifié que `.ovhconfig` est au bon endroit
- [ ] Vérifié que `index.js` est au bon endroit
- [ ] Contacté le support OVH si nécessaire

---

## 🎯 Action Immédiate

1. **Vérifiez le type d'hébergement** dans le panneau OVH
2. **Vérifiez la configuration du multisite** pour voir s'il y a une option Node.js
3. **Contactez le support OVH** si Node.js n'est pas disponible

---

## 💡 Note

Sur certains hébergements partagés OVH, Node.js doit être activé **manuellement par le support** et ne peut pas être activé automatiquement via `.ovhconfig`. C'est probablement le cas ici.

---

## 🆘 Si Rien Ne Fonctionne

Si après contact du support OVH, Node.js n'est toujours pas disponible :

1. **Envisagez un VPS OVH** (~3€/mois)
   - Contrôle complet
   - Node.js installable librement
   - Pas de limitations

2. **OU utilisez un autre hébergeur** qui supporte Node.js sur hébergement partagé

---

## 📞 Contact Support OVH

**Méthode recommandée** : Ticket support dans le panneau OVH

1. Allez sur [https://www.ovh.com/manager/](https://www.ovh.com/manager/)
2. Support → Créer un ticket
3. Sélectionnez "Hébergement web"
4. Utilisez le message ci-dessus

