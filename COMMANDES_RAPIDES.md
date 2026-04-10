# 🚀 Commandes Rapides - La Plume Artisanale

**Chemin du projet :** `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`

---

## 📂 Navigation Rapide

### Option 1 : Script PowerShell (Recommandé)
```powershell
# Depuis n'importe où, exécutez :
.\aller-backend.ps1
```

### Option 2 : Navigation manuelle
```powershell
# Se placer dans le répertoire backend
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
```

---

## 🧪 Tests et Vérifications

### Tester les Modules Odoo
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node test-modules-odoo.js
```

### Vérifier les Tables
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node verifier-tables-modules-odoo.js
```

### Tester la Connexion à la Base
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node test-connexion-simple.js
```

---

## 🖥️ Serveur Backend

### Démarrer le Serveur
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm start
```

### Installer les Dépendances
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm install
```

---

## 🗄️ Base de Données

### Via pgAdmin
1. Ouvrir pgAdmin
2. Se connecter au serveur OVH
3. Sélectionner la base `ERP_La_Plume`
4. Exécuter les scripts SQL nécessaires

### Scripts SQL Disponibles
- `verifier-base-existante-pgadmin.sql` - Vérifier les tables
- `creer-tables-manquantes-pgadmin.sql` - Créer les tables manquantes
- `ajouter-colonnes-et-relations.sql` - Ajouter colonnes et relations

---

## 🔧 Utilitaires

### Trouver le Mot de Passe PostgreSQL (local)
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
powershell -ExecutionPolicy Bypass -File trouver-mot-de-passe-postgres.ps1
```

### Démarrer PostgreSQL (local)
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
powershell -ExecutionPolicy Bypass -File demarrer-postgresql.ps1
```

---

## 📝 Notes Importantes

1. **Toujours être dans le répertoire backend** avant d'exécuter les commandes Node.js
2. **Pour les scripts PowerShell**, vous pouvez les exécuter depuis n'importe où avec le chemin complet
3. **Le chemin du projet contient des espaces**, utilisez des guillemets autour du chemin

---

## 💡 Astuce

Créez un alias PowerShell permanent pour accéder rapidement au backend :

```powershell
# Ajouter dans votre profil PowerShell ($PROFILE)
function Go-Backend {
    Set-Location "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
}

# Ensuite, utilisez simplement :
Go-Backend
```
