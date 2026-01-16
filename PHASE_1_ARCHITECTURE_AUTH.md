# 🔐 Phase 1 : Architecture + Authentification

## 🎯 Objectifs

- ✅ Configuration Prisma avec schéma de base
- ✅ Système d'authentification JWT complet
- ✅ Gestion des utilisateurs et rôles
- ✅ Middleware de sécurité
- ✅ Interface de connexion

---

## 📋 Tâches Détaillées

### 1. Configuration Prisma

**Créer le fichier `backend/prisma/schema.prisma` :**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTHENTIFICATION ET UTILISATEURS
// ============================================

enum Role {
  ADMIN
  COMMERCIAL
  CHEF_PRODUCTION
  TISSEUR
  MAGASINIER
  QUALITE
  USER
}

model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String   // bcrypt hash
  nom               String
  prenom            String
  role              Role     @default(USER)
  actif             Boolean  @default(true)
  derniere_connexion DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  commandes         Commande[]
  suivis_tissage    SuiviTissage[]
  suivis_coupe      SuiviCoupe[]
  suivis_qualite    SuiviQualite[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**Créer le fichier `.env` dans `backend/` :**

```env
DATABASE_URL="postgresql://Aviateur:Allbyfouta007@sh131616-002.eu.clouddb.ovh.net:35392/ERP_La_Plume?schema=public"
JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Installer Prisma :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm install prisma @prisma/client
npx prisma init
```

**Générer le client Prisma :**

```powershell
npx prisma generate
npx prisma db push
```

---

### 2. Backend - Authentification

**Créer `backend/src/middleware/auth.middleware.js` :**

```javascript
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token manquant' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, nom: true, prenom: true, role: true, actif: true }
    });

    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        error: { message: 'Utilisateur invalide ou inactif' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token invalide' }
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Non authentifié' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Accès refusé' }
      });
    }

    next();
  };
};
```

**Créer `backend/src/controllers/auth.controller.js` :**

```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email et mot de passe requis' }
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants invalides' }
      });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants invalides' }
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Mettre à jour dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { derniere_connexion: new Date() }
    });

    // Retourner les données
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        derniere_connexion: true
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

export const logout = async (req, res) => {
  // JWT est stateless, pas besoin de supprimer côté serveur
  // Le client supprime simplement le token
  res.json({
    success: true,
    data: { message: 'Déconnexion réussie' }
  });
};
```

**Créer `backend/src/routes/auth.routes.js` :**

```javascript
import express from 'express';
import { login, me, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
```

**Ajouter les routes dans `backend/src/server.js` :**

```javascript
import authRoutes from './routes/auth.routes.js';

// ... autres imports

app.use('/api/auth', authRoutes);
```

---

### 3. Frontend - Interface de Connexion

**Créer `frontend/src/pages/Login.tsx` :**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        // Stocker le token
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ERP La Plume Artisanale
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

**Créer un hook pour l'authentification `frontend/src/hooks/useAuth.ts` :**

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      setUser(JSON.parse(userStr));
      
      // Vérifier que le token est toujours valide
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return { user, loading, logout };
};
```

**Mettre à jour `frontend/src/App.tsx` :**

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

### 4. Seed Données Initiales

**Créer `backend/prisma/seed.ts` :**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@laplume.tn' },
    update: {},
    create: {
      email: 'admin@laplume.tn',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Système',
      role: 'ADMIN',
      actif: true
    }
  });

  console.log('✅ Utilisateur admin créé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Exécuter le seed :**

```powershell
npx prisma db seed
```

---

## ✅ Checklist Phase 1

- [ ] Prisma installé et configuré
- [ ] Schéma Prisma créé (User, Role, Session)
- [ ] Migration base de données effectuée
- [ ] Middleware authentification créé
- [ ] Controller auth créé (login, me, logout)
- [ ] Routes API `/api/auth/*` fonctionnelles
- [ ] Page login React créée
- [ ] Hook useAuth créé
- [ ] Protection routes avec PrivateRoute
- [ ] Seed utilisateur admin créé
- [ ] Tests de connexion réussis

---

## 🧪 Tests

**Tester l'API :**

```powershell
# Login
curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@laplume.tn\",\"password\":\"Admin123!\"}'

# Me (avec token)
curl.exe -X GET http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer <TOKEN>"
```

**Tester le frontend :**
1. Démarrer le frontend : `npm start`
2. Ouvrir `http://localhost:3000`
3. Se connecter avec : `admin@laplume.tn` / `Admin123!`
4. Vérifier la redirection vers le dashboard

---

## 📚 Prochaine Phase

Une fois la Phase 1 terminée, passer à **Phase 2 : Articles + Nomenclature**.
