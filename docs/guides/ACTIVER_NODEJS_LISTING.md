# 🔧 Activer Node.js - Résoudre le Listing de Répertoire

## ❌ Problème : Listing de Répertoire au Lieu de l'Application

Le domaine fonctionne (on voit le listing), mais Node.js n'est pas activé. Il faut activer Node.js pour que l'application démarre.

---

## 🔍 Diagnostic

Le fait de voir "Index of /" signifie que :
- ✅ Le domaine pointe vers le bon dossier (`fouta-erp/backend`)
- ❌ Node.js n'est pas activé
- ❌ Le fichier `.ovhconfig` n'est peut-être pas pris en compte

---

## ✅ Solution 1 : Vérifier .ovhconfig

```bash
# Vérifier que le fichier existe au bon endroit
ls -la ~/fouta-erp/backend/.ovhconfig

# Voir le contenu
cat ~/fouta-erp/backend/.ovhconfig
```

Le fichier doit être dans le **dossier racine** configuré dans OVH.

---

## ✅ Solution 2 : Créer un Fichier index.js

Parfois, OVH cherche un fichier `index.js` à la racine :

```bash
cd ~/fouta-erp/backend

# Créer un index.js qui démarre l'application
cat > index.js << 'EOF'
// Point d'entrée pour OVH
import './src/server.js';
EOF

# Vérifier
cat index.js
```

---

## ✅ Solution 3 : Vérifier la Configuration OVH

Dans le panneau OVH :

1. Allez dans **Multisite**
2. Cliquez sur `fabrication.laplume-artisanale.tn`
3. Vérifiez :
   - **Dossier racine** : `fouta-erp/backend`
   - **Point d'entrée** : `src/server.js` ou `index.js` (si option disponible)
   - **Node.js** : Doit être activé (même si pas visible dans l'interface)

---

## ✅ Solution 4 : Créer un .htaccess pour Rediriger

Si Node.js n'est pas disponible, créer un `.htaccess` :

```bash
cd ~/fouta-erp/backend

# Créer .htaccess (si PHP disponible)
cat > .htaccess << 'EOF'
DirectoryIndex index.js
EOF
```

Mais cela ne fonctionnera que si Node.js est activé.

---

## ✅ Solution 5 : Contacter le Support OVH

Si rien ne fonctionne, contactez le support OVH et demandez :

1. **Pourquoi Node.js n'est pas activé** pour `fabrication.laplume-artisanale.tn`
2. **Comment activer Node.js** avec le fichier `.ovhconfig`
3. **Si votre type d'hébergement** supporte Node.js

---

## 🚀 Action Immédiate

### 1. Vérifier .ovhconfig

```bash
ls -la ~/fouta-erp/backend/.ovhconfig
cat ~/fouta-erp/backend/.ovhconfig
```

### 2. Créer index.js

```bash
cd ~/fouta-erp/backend
cat > index.js << 'EOF'
import './src/server.js';
EOF
```

### 3. Attendre et Tester

- Attendez 5-10 minutes
- Testez : `http://fabrication.laplume-artisanale.tn` (sans https)
- Ou : `http://fabrication.laplume-artisanale.tn/health`

---

## 📋 Checklist

- [ ] Fichier `.ovhconfig` présent dans le dossier racine
- [ ] Fichier `index.js` créé (optionnel)
- [ ] Configuration OVH vérifiée
- [ ] Attendu 5-10 minutes
- [ ] Testé l'accès (HTTP, pas HTTPS)
- [ ] Si ne fonctionne pas : contacté le support OVH

---

## 💡 Note

Le listing de répertoire signifie que le serveur web fonctionne mais ne trouve pas de point d'entrée Node.js. Il faut que Node.js soit activé via `.ovhconfig` ou le panneau OVH.

---

## 🆘 Si Rien Ne Fonctionne

Contactez le support OVH avec :
- Le fichier `.ovhconfig` créé
- Le fait que vous voyez un listing de répertoire
- La demande d'activation de Node.js pour ce domaine

