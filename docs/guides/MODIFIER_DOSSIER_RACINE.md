# 🔧 Modifier le Dossier Racine vers fouta-erp/backend

## 📋 Configuration Cible

- **Dossier racine** : `fouta-erp/backend`
- **Point d'entrée** : `src/server.js`
- **Structure** : L'application reste dans `~/fouta-erp/backend/`

---

## 🚀 Étapes dans le Panneau OVH

### 1. Dans la Page de Modification

Si le champ "Dossier racine" est modifiable :
- Changez `./ fouta-erp` en `fouta-erp/backend`
- Cliquez sur "Suivant"

### 2. Si le Champ n'est Pas Modifiable

Dans ce cas, il faut peut-être :
- **Annuler** cette modification
- **Supprimer** le domaine du multisite
- **Recréer** le domaine avec le bon dossier racine

OU

- Contacter le support OVH pour modifier le dossier racine

---

## ✅ Configuration Recommandée

Dans l'étape 2, configurez :

- **Dossier racine** : `fouta-erp/backend`
- **Point d'entrée Node.js** : `src/server.js`
- **Version Node.js** : 18.x (si disponible)
- **Variables d'environnement** :
  - `NODE_ENV=production`
  - `PORT=5000` (ou le port fourni par OVH)

---

## 🔍 Vérification de la Structure

Assurez-vous que la structure est correcte :

```bash
# Sur le serveur SSH
cd ~/fouta-erp/backend
ls -la

# Vous devriez voir :
# - package.json
# - .env
# - src/
#   - server.js
```

---

## 📋 Checklist

- [ ] Dossier racine : `fouta-erp/backend`
- [ ] Point d'entrée : `src/server.js`
- [ ] Node.js activé (si disponible dans étape 2)
- [ ] Version Node.js : 18.x
- [ ] Structure des fichiers correcte

---

## 🎯 Action Immédiate

1. **Dans OVH** : Modifiez le dossier racine en `fouta-erp/backend` (si possible)
2. **Cliquez sur "Suivant"** pour voir l'étape 2
3. **Cherchez l'option Node.js** et activez-la
4. **Configurez le point d'entrée** : `src/server.js`
5. **Sauvegardez**

---

## 💡 Si le Dossier Racine Ne Peut Pas Être Modifié

Si le champ est verrouillé, vous devrez peut-être :
1. **Supprimer** le domaine du multisite
2. **Recréer** le domaine avec le bon dossier racine dès le début

OU

1. **Contacter le support OVH** pour modifier le dossier racine

---

## ✅ Après Configuration

Une fois configuré :
1. Attendez 5-10 minutes pour la propagation
2. Testez : `https://fabrication.laplume-artisanale.tn`
3. Vérifiez les logs : `pm2 logs fouta-api`

