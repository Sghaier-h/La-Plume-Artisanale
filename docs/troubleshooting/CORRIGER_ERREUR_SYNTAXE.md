# 🔧 Corriger l'Erreur de Syntaxe

## ❌ Erreur Détectée

```
SyntaxError: Unexpected identifier
```

**Problème** : Le fichier `server.js` a une erreur de syntaxe, probablement lors de la modification.

---

## ✅ Solution : Vérifier et Corriger le Fichier

### Étape 1 : Voir le Fichier Actuel

#### Sur le VPS

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Voir le fichier (premières 50 lignes)
head -50 src/server.js

# Voir autour de la ligne problématique
cat -n src/server.js | head -50
```

### Étape 2 : Vérifier la Syntaxe

```bash
# Tester la syntaxe du fichier
node --check src/server.js

# Doit afficher l'erreur exacte
```

---

## 🔧 Option 1 : Copier le Fichier Corrigé (Recommandé)

### Depuis Windows (FileZilla)

1. **Ouvrir FileZilla**
2. **Se connecter** au VPS : `137.74.40.191`
3. **Naviguer vers** (côté gauche) : `D:\OneDrive - FLYING TEX\PROJET\backend\src\`
4. **Naviguer vers** (côté droit) : `/opt/fouta-erp/backend/src/`
5. **Glisser-déposer** `server.js` vers le VPS
6. **Remplacer** le fichier existant

### Depuis Windows (SCP)

```powershell
# Copier le fichier corrigé
scp "D:\OneDrive - FLYING TEX\PROJET\backend\src\server.js" ubuntu@137.74.40.191:/opt/fouta-erp/backend/src/
```

---

## 🔧 Option 2 : Corriger Manuellement sur le VPS

### Voir le Fichier Complet

```bash
# Voir tout le fichier
cat src/server.js
```

### Identifier l'Erreur

L'erreur "Unexpected identifier" peut être causée par :
- Une virgule manquante
- Une parenthèse manquante
- Une ligne mal formatée
- Un caractère invalide

### Fichier Correct (Référence)

Le fichier devrait ressembler à ceci :

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes.js';
import productionRoutes from './routes/production.routes.js';
import stockRoutes from './routes/stock.routes.js';
import planningRoutes from './routes/planning.routes.js';
import qualityRoutes from './routes/quality.routes.js';
import mobileRoutes from './routes/mobile.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "capacitor://localhost",
      "ionic://localhost",
      "https://app.fouta-erp.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Trust proxy (nécessaire derrière Nginx)
app.set('trust proxy', true);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/quality', qualityRoutes);

// Routes Mobile (SaaS)
app.use('/api/v1/mobile', mobileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO pour temps réel
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });

  // Écouter les événements de production
  socket.on('production:update', (data) => {
    io.emit('production:updated', data);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});

export { io };
```

### Éditer le Fichier

```bash
# Éditer le fichier
nano src/server.js

# Corriger l'erreur
# Vérifier que la ligne "app.set('trust proxy', true);" est bien présente
# Vérifier qu'il n'y a pas de caractères invalides
# Vérifier que toutes les parenthèses et accolades sont fermées

# Sauvegarder : Ctrl+O, Entrée, Ctrl+X
```

---

## 🧪 Vérifier la Syntaxe

### Sur le VPS

```bash
# Tester la syntaxe
node --check src/server.js

# Doit afficher : (rien) si la syntaxe est correcte
# OU une erreur détaillée si problème
```

---

## 🔄 Redémarrer l'Application

### Sur le VPS

```bash
# Redémarrer l'application avec PM2
pm2 restart fouta-api

# Attendre quelques secondes
sleep 3

# Vérifier les logs
pm2 logs fouta-api --lines 20

# Ne doit plus afficher :
# SyntaxError: Unexpected identifier
# ValidationError: The 'X-Forwarded-For' header...
```

---

## 📋 Checklist

- [ ] Fichier vérifié : `cat src/server.js`
- [ ] Syntaxe testée : `node --check src/server.js`
- [ ] Fichier corrigé : Copié depuis Windows OU corrigé manuellement
- [ ] Ligne `app.set('trust proxy', true);` présente
- [ ] Application redémarrée : `pm2 restart fouta-api`
- [ ] Logs vérifiés : Plus d'erreur `SyntaxError` ni `ValidationError`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Vérifier le fichier** : `cat src/server.js` ou `node --check src/server.js`
2. **Copier le fichier corrigé** : Depuis Windows vers le VPS
3. **Vérifier la syntaxe** : `node --check src/server.js`
4. **Redémarrer** : `pm2 restart fouta-api`
5. **Vérifier les logs** : `pm2 logs fouta-api --lines 20`

**La meilleure solution est de copier le fichier corrigé depuis Windows vers le VPS !**

