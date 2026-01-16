# 🔧 Node.js Non Disponible dans le Panneau OVH

## ❌ Problème

L'option Node.js n'apparaît pas dans l'étape 2 de la configuration du multisite. C'est une limitation de certains hébergements partagés OVH.

---

## ✅ Solution 1 : Utiliser un Fichier .ovhconfig

Créez un fichier `.ovhconfig` dans le dossier racine pour activer Node.js.

### Sur le Serveur SSH

```bash
cd ~/fouta-erp/backend

# Créer le fichier .ovhconfig
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF

# Vérifier
cat .ovhconfig
```

### Structure du Fichier

Le fichier `.ovhconfig` doit être dans le **dossier racine** du domaine :
- Si dossier racine = `fouta-erp/backend`, alors `.ovhconfig` dans `~/fouta-erp/backend/`

---

## ✅ Solution 2 : Vérifier le Type d'Hébergement

Certains hébergements OVH ne supportent pas Node.js :

- **Hébergement Perso** : Node.js généralement disponible
- **Hébergement Pro** : Node.js généralement disponible
- **Hébergement gratuit** : Node.js souvent non disponible

Vérifiez dans le panneau OVH → Informations générales → Type d'hébergement.

---

## ✅ Solution 3 : Contacter le Support OVH

Contactez le support OVH et demandez :

1. **Pourquoi Node.js n'est pas disponible** pour votre hébergement
2. **Comment activer Node.js** pour votre domaine
3. **Si votre type d'hébergement** supporte Node.js
4. **Quelles sont les alternatives** pour déployer une application Node.js

---

## ✅ Solution 4 : Utiliser PM2 en Mode Standalone

Si Node.js n'est pas disponible via le panneau, vous pouvez utiliser PM2 qui tourne déjà :

### Configuration

L'application tourne déjà avec PM2 sur le port 50000 (même si bloqué). Il faut configurer le reverse proxy OVH pour pointer vers cette application.

### Via .htaccess (si PHP disponible)

```apache
# Dans fouta-erp/backend/.htaccess
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:50000/$1 [P,L]
```

Mais cela nécessite que le reverse proxy OVH fonctionne.

---

## ✅ Solution 5 : Passer à un VPS OVH

Si Node.js n'est vraiment pas disponible :

- **VPS Starter** : ~3€/mois
- **Contrôle complet** : Node.js, ports, configuration libre
- **Idéal pour Node.js** : Pas de limitations

---

## 🚀 Action Immédiate

### 1. Créer le Fichier .ovhconfig

```bash
# Sur le serveur SSH
cd ~/fouta-erp/backend
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF
```

### 2. Sauvegarder la Configuration OVH

Même sans option Node.js visible :
- **Sauvegardez** la configuration avec le dossier racine `fouta-erp/backend`
- Le fichier `.ovhconfig` devrait activer Node.js automatiquement

### 3. Attendre et Tester

- Attendez 5-10 minutes
- Testez : `https://fabrication.laplume-artisanale.tn`

---

## 🔍 Vérification

Après création du `.ovhconfig` :

```bash
# Vérifier que le fichier existe
ls -la ~/fouta-erp/backend/.ovhconfig

# Voir le contenu
cat ~/fouta-erp/backend/.ovhconfig
```

---

## 📋 Checklist

- [ ] Fichier `.ovhconfig` créé dans le dossier racine
- [ ] Configuration OVH sauvegardée (dossier racine : `fouta-erp/backend`)
- [ ] Attendu 5-10 minutes pour la propagation
- [ ] Testé l'accès au domaine
- [ ] Si ne fonctionne pas : contacté le support OVH

---

## 💡 Note

Sur certains hébergements OVH, Node.js doit être activé **manuellement via fichier** plutôt que via le panneau. Le fichier `.ovhconfig` est la méthode standard.

---

## 🆘 Si Rien Ne Fonctionne

1. **Contactez le support OVH** avec les détails
2. **Demandez** si votre hébergement supporte Node.js
3. **Envisagez** un VPS OVH pour plus de contrôle

