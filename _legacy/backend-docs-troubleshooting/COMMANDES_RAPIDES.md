# ⚡ Commandes Rapides - Modules Odoo

## 🚀 Démarrer PostgreSQL et Tunnel

### 1. Démarrer PostgreSQL
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File demarrer-postgresql.ps1
```

### 2. Créer le Tunnel SSH
**Dans un nouveau terminal PowerShell :**
```bash
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```
**⚠️ Laissez ce terminal ouvert !**

### 3. Vérifier le Tunnel (dans un autre terminal)
```powershell
Test-NetConnection -ComputerName localhost -Port 5433
```

---

## 🧪 Tests

### Vérifier les Tables
```bash
cd backend
node verifier-tables-modules-odoo.js
```

### Tester les Modules
```bash
cd backend
node test-modules-odoo.js
```

### Test de Connexion Simple
```bash
cd backend
node test-connexion-simple.js
```

---

## 🎯 Démarrer le Serveur

```bash
cd backend
npm start
```

---

## 📊 Routes API Disponibles

Une fois le serveur démarré :

- `GET /api/sale/orders` - Liste des commandes de vente
- `GET /api/product/templates` - Liste des produits
- `GET /api/stock/pickings` - Liste des livraisons
- `GET /api/mrp/productions` - Liste des OF
- `GET /api/account/moves` - Liste des factures
- `GET /api/purchase/orders` - Liste des commandes d'achat

---

## 🔍 Vérification Rapide

```powershell
# 1. PostgreSQL démarré ?
Get-Service | Where-Object { $_.Name -like "*postgres*" }

# 2. Tunnel SSH actif ?
Test-NetConnection localhost -Port 5433

# 3. Connexion DB OK ?
cd backend
node test-connexion-simple.js
```
