import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@system.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production'
          ? 'https://fabrication.laplume-artisanale.tn/api'
          : 'http://localhost:5000/api');
      
      const response = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        // Stocker le token
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Configurer axios pour les requêtes futures
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';
      
      // Gérer les erreurs de connexion réseau
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:5000';
      } else if (err.message?.includes('fermée') || err.message?.includes('interrompue')) {
        errorMessage = 'La connexion au serveur a été interrompue. Vérifiez que le backend est bien démarré et accessible.';
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.error?.message || 'Email ou mot de passe incorrect';
      } else if (err.response?.status === 500) {
        errorMessage = 'Erreur serveur. Vérifiez les logs du backend.';
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  const testUsers = [
    { email: 'admin@system.local', password: 'Admin123!', role: 'ADMIN', label: 'Administrateur' },
    { email: 'chef.production@entreprise.local', password: 'User123!', role: 'CHEF_PRODUCTION', label: 'Chef Production' },
    { email: 'tisseur@entreprise.local', password: 'User123!', role: 'TISSEUR', label: 'Tisseur' },
    { email: 'magasinier.mp@entreprise.local', password: 'User123!', role: 'MAGASINIER', label: 'Magasinier MP' },
    { email: 'coupeur@entreprise.local', password: 'User123!', role: 'COUPEUR', label: 'Coupeur' },
    { email: 'controleur.qualite@entreprise.local', password: 'User123!', role: 'QUALITE', label: 'Contrôleur Qualité' },
    { email: 'commercial@entreprise.local', password: 'User123!', role: 'COMMERCIAL', label: 'Commercial' }
  ];

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 ERP La Plume
          </h1>
          <p className="text-gray-600">Artisanale</p>
        </div>
        
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
              placeholder="admin@system.local"
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Comptes de test */}
        <div className="mt-6">
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showCredentials ? '▼' : '▶'} Comptes de test disponibles
          </button>
          
          {showCredentials && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-semibold text-blue-800 mb-3">
                🔑 Identifiants Staging (Mode Mock)
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testUsers.map((user, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => fillCredentials(user.email, user.password)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-800">{user.label}</div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                      </div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {user.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-blue-600 italic">
                Cliquez sur un compte pour remplir automatiquement les champs
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Mode Staging - Authentification Mock Activée</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
