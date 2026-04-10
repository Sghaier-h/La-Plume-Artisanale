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
        // S'assurer que le rôle est en majuscules pour la cohérence
        const userData = {
          ...response.data.data.user,
          role: response.data.data.user.role?.toUpperCase() || response.data.data.user.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Configurer axios pour les requêtes futures
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        
        // Rediriger vers le dashboard approprié selon le rôle et les dashboards attribués
        const userRole = userData.role?.toUpperCase() || '';
        const dashboardsAttribues = userData.dashboardsAttribues || [];
        
        // Mapping des dashboards (doit correspondre exactement aux chemins dans App.tsx)
        const dashboardPaths: { [key: string]: string } = {
          'dashboard': '/dashboard-admin',
          'admin': '/dashboard-admin',
          'tisseur': '/dashboard-tisseur',
          'chef-production': '/dashboard-chef-production',
          'magasinier-mp': '/dashboard-magasinier-mp',
          'controle-central': '/dashboard-controle-central',
          'post-coupe': '/dashboard-post-coupe',
          'chef-atelier': '/chef-atelier-dashboard',
          'magasinier-soustraitants': '/dashboard-magasinier-soustraitants',
          'gpao': '/dashboard-admin',
          'mecanicien': '/mecanicien',
          'magasin-pf': '/magasin-pf',
        };
        
        // Si admin, toujours rediriger vers dashboard-admin
        if (userRole === 'ADMIN') {
          navigate('/dashboard-admin');
          return;
        }
        
        // Si des dashboards sont attribués, utiliser le premier
        if (dashboardsAttribues.length > 0) {
          const firstDashboard = dashboardPaths[dashboardsAttribues[0]];
          if (firstDashboard) {
            navigate(firstDashboard);
            return;
          }
        }
        
        // Mapping rôle -> dashboard par défaut
        const roleToDashboard: { [key: string]: string } = {
          'TISSEUR': '/dashboard-tisseur',
          'CHEF_PRODUCTION': '/dashboard-chef-production',
          'CHEF_PRODUCT': '/dashboard-chef-production',
          'MAGASINIER': '/dashboard-magasinier-mp',
          'COUPEUR': '/dashboard-post-coupe',
          'CONTROLEUR': '/dashboard-controle-central',
          'CONTROLEUR_QUALITE': '/dashboard-controle-central',
          'QUALITE': '/dashboard-controle-central',
          'CHEF_ATELIER': '/chef-atelier-dashboard',
          'MAGASINIER_SOUSTRAITANTS': '/dashboard-magasinier-soustraitants',
          'GPAO': '/dashboard-admin',
          'MECANICIEN': '/mecanicien',
          'MAGASIN_PF': '/magasin-pf',
        };
        
        // Utiliser le mapping rôle -> dashboard par défaut
        const defaultDashboard = roleToDashboard[userRole];
        if (defaultDashboard) {
          navigate(defaultDashboard);
          return;
        }
        
        // Fallback: dashboard admin
        navigate('/dashboard-admin');
      }
    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';
      
      // Gérer les erreurs de connexion réseau
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = process.env.NODE_ENV === 'production'
          ? 'Impossible de se connecter au serveur. Vérifiez que le backend est accessible.'
          : 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:5000';
      } else if (err.message?.includes('fermée') || err.message?.includes('interrompue')) {
        errorMessage = 'La connexion au serveur a été interrompue. Vérifiez que le backend est bien démarré et accessible.';
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.error?.message || 'Email ou mot de passe incorrect';
      } else if (err.response?.status === 429) {
        // Erreur de rate limiting
        const retryAfter = err.response.headers['retry-after'];
        errorMessage = err.response?.data?.error?.message || 
          (retryAfter 
            ? `Trop de tentatives de connexion. Veuillez patienter ${retryAfter} secondes avant de réessayer.`
            : 'Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.');
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


  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-blue-500 to-purple-600 ${error ? 'items-start pt-6 sm:pt-8 justify-center' : 'items-center justify-center'}`}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 ERP La Plume
          </h1>
          <p className="text-gray-600">Artisanale</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-white border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">!</span>
              <span>{error}</span>
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
              placeholder="votre@email.com"
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

      </div>
    </div>
  );
};

export default Login;
