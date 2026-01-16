# 🚀 Commencer le Développement - Guide Rapide

## ✅ Prérequis Vérifiés

Avant de commencer, assurez-vous que :

- [x] Node.js 18+ installé
- [x] PostgreSQL accessible (OVH ou local)
- [x] Projet cloné dans `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
- [x] Environnement de développement configuré (voir `DEVELOPPEMENT_LOCAL_PAS_A_PAS.md`)

---

## 🎯 Démarrage Immédiat

### Étape 1 : Vérifier la Structure

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
dir
```

Vous devriez voir :
- `backend/` ✅
- `frontend/` ✅
- `database/` ✅

### Étape 2 : Installer les Dépendances

**Backend :**
```powershell
cd backend
npm install
```

**Frontend :**
```powershell
cd frontend
npm install
```

### Étape 3 : Configurer Prisma (Phase 1)

```powershell
cd backend
npm install prisma @prisma/client
npx prisma init
```

**Modifier `prisma/schema.prisma`** selon `PHASE_1_ARCHITECTURE_AUTH.md`

**Générer le client :**
```powershell
npx prisma generate
npx prisma db push
```

### Étape 4 : Démarrer l'Application

**Terminal 1 - Backend :**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```powershell
cd frontend
npm start
```

---

## 📋 Plan de Développement

Suivez les phases dans l'ordre :

1. **Phase 1** : Architecture + Authentification (3-4 jours)
   - Guide : `PHASE_1_ARCHITECTURE_AUTH.md`
   
2. **Phase 2** : Articles + Nomenclature (3-4 jours)
   - À créer après Phase 1

3. **Phase 3** : Clients (1-2 jours)
   - À créer après Phase 2

4. **Phase 4** : Commandes (3-4 jours)
   - À créer après Phase 3

5. **Phase 5** : Machines + Sélecteurs (3-4 jours) ⚠️ CRITIQUE
   - À créer après Phase 4

6. **Phase 6** : Ordres de Fabrication (4-5 jours)
   - À créer après Phase 5

7. **Phase 7** : Stock et Matières Premières (4-5 jours)
   - À créer après Phase 2

8. **Phase 8** : Suivi de Production (3-4 jours)
   - À créer après Phase 6

9. **Phase 9** : Sous-traitants (2-3 jours)
   - À créer après Phase 6

10. **Phase 10** : Dashboard (2-3 jours)
    - À créer après toutes les phases

**Voir le plan complet :** `PLAN_DEVELOPPEMENT_COMPLET.md`

---

## 🤖 Utiliser Cursor AI

### Template de Prompt

Pour chaque module, utilisez ce template dans Cursor :

```
Développe le module [NOM_MODULE] pour l'ERP La Plume Artisanale selon le cahier des charges :

1. BACKEND (Node.js + Express + Prisma) :
   - Créer/modifier le modèle Prisma : [copier spécifications]
   - Créer les routes API : [copier endpoints]
   - Implémenter les validations
   - Gestion des erreurs
   - Respecter l'architecture existante

2. FRONTEND (React + TypeScript + Tailwind) :
   - Créer la page liste avec DataTable
   - Créer le formulaire création/édition
   - Implémenter les appels API
   - Gestion loading/error

3. VALIDATIONS :
   - Backend : Zod ou Joi
   - Frontend : Validation formulaire

Respecter l'architecture existante du projet.
```

---

## 📚 Documentation

- **Plan complet** : `PLAN_DEVELOPPEMENT_COMPLET.md`
- **Phase 1** : `PHASE_1_ARCHITECTURE_AUTH.md`
- **Développement local** : `DEVELOPPEMENT_LOCAL_PAS_A_PAS.md`
- **Paramétrage** : `PARAMETRAGE_INITIAL.md`
- **Cahier des charges** : `Cahier_des_Charges_COMPLET_ERP_LaPlume.docx`

---

## ✅ Checklist de Démarrage

- [ ] Dépendances installées (backend + frontend)
- [ ] Prisma initialisé
- [ ] Base de données connectée
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Phase 1 commencée

---

**🎉 Prêt à développer ! Commencez par la Phase 1.**
