# 🔧 Résoudre le Listing de Répertoire au Lieu de l'Application

## ❌ Problème

Le domaine `fabrication.laplume-artisanale.tn` affiche un listing de répertoire au lieu d'exécuter l'application Node.js.

---

## ✅ Solution 1 : Vérifier et Corriger .ovhconfig

Le fichier `.ovhconfig` doit être dans le dossier racine et contenir la bonne configuration.

### Vérifier le Fichier

```bash
cd ~/fouta-erp/backend
cat .ovhconfig
```

### Si le Fichier N'Existe Pas ou Est Incorrect

```bash
cd ~/fouta-erp/backend
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
EOF
```

---

## ✅ Solution 2 : Créer un Fichier index.js à la Racine

OVH cherche souvent un fichier `index.js` à la racine du dossier.

### Créer index.js

```bash
cd ~/fouta-erp/backend
cat > index.js << 'EOF'
// Point d'entrée pour OVH
import './src/server.js';
EOF
```

---

## ✅ Solution 3 : Modifier .ovhconfig avec Point d'Entrée

Certaines versions d'OVH nécessitent de spécifier le point d'entrée dans `.ovhconfig`.

### Modifier .ovhconfig

```bash
cd ~/fouta-erp/backend
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
<app>
    <entrypoint>src/server.js</entrypoint>
</app>
EOF
```

---

## ✅ Solution 4 : Vérifier la Configuration OVH

Dans le panneau OVH, vérifiez :

1. **Dossier racine** : `fouta-erp/backend`
2. **Point d'entrée** : `src/server.js` (si option disponible)
3. **Node.js activé** : Vérifiez dans les options du multisite

---

## 🔧 Solution Complète Recommandée

```bash
# 1. Aller dans le dossier backend
cd ~/fouta-erp/backend

# 2. Créer/modifier .ovhconfig
cat > .ovhconfig << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
<app>
    <entrypoint>src/server.js</entrypoint>
</app>
EOF

# 3. Créer index.js (point d'entrée alternatif)
cat > index.js << 'EOF'
import './src/server.js';
EOF

# 4. Vérifier
cat .ovhconfig
ls -la index.js
```

---

## ⏰ Attendre la Propagation

Après modification :

1. **Attendez 5-10 minutes** pour qu'OVH prenne en compte les changements
2. **Videz le cache** de votre navigateur (Ctrl+F5)
3. **Testez** : `https://fabrication.laplume-artisanale.tn`

---

## 🧪 Test

Après modification et attente :

```bash
# Tester depuis le serveur
curl https://fabrication.laplume-artisanale.tn/health

# Résultat attendu :
# {"status":"OK","timestamp":"..."}
```

---

## 📋 Checklist

- [ ] Fichier `.ovhconfig` créé avec point d'entrée
- [ ] Fichier `index.js` créé (optionnel mais recommandé)
- [ ] Configuration OVH vérifiée
- [ ] Attendu 5-10 minutes
- [ ] Cache navigateur vidé
- [ ] Testé l'accès au domaine

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

1. **Contactez le support OVH** avec :
   - Le fichier `.ovhconfig` créé
   - Le dossier racine configuré
   - Le problème rencontré (listing au lieu d'application)

2. **Vérifiez dans le panneau OVH** s'il y a des logs d'erreur

3. **Envisagez un VPS OVH** pour plus de contrôle

---

## 💡 Note

Le listing de répertoire apparaît quand le serveur web ne trouve pas de point d'entrée Node.js. Le fichier `.ovhconfig` avec le point d'entrée devrait résoudre le problème.

