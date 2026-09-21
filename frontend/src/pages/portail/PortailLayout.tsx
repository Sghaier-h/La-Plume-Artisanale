import React from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Home, ShoppingBag, FileText, Truck, FileCheck, MessageSquare, User } from 'lucide-react';
import { portailAuth } from '../../services/portailApi';

export const PortailPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('portail_token') : null;
  if (!token) return <Navigate to="/portail/login" replace />;
  return <>{children}</>;
};

const PortailLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const clientStr = localStorage.getItem('portail_client');
  const client = clientStr ? JSON.parse(clientStr) : null;

  const handleLogout = async () => {
    try { await portailAuth.logout(); } catch {}
    localStorage.removeItem('portail_token');
    localStorage.removeItem('portail_client');
    navigate('/portail/login');
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-amber-100 text-amber-900'
        : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-amber-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow">
              LP
            </div>
            <div>
              <div className="font-serif text-lg font-semibold text-stone-800">La Plume Artisanale</div>
              <div className="text-xs text-stone-500">Espace client — {client?.raison_sociale || 'Portail'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-stone-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
        <nav className="max-w-7xl mx-auto px-4 md:px-6 pb-3 flex flex-wrap gap-1 overflow-x-auto">
          <NavLink to="/portail" end className={linkCls}><Home className="w-4 h-4" /> Accueil</NavLink>
          <NavLink to="/portail/commandes" className={linkCls}><ShoppingBag className="w-4 h-4" /> Commandes</NavLink>
          <NavLink to="/portail/factures" className={linkCls}><FileText className="w-4 h-4" /> Factures</NavLink>
          <NavLink to="/portail/bons-livraison" className={linkCls}><Truck className="w-4 h-4" /> Bons de livraison</NavLink>
          <NavLink to="/portail/devis" className={linkCls}><FileCheck className="w-4 h-4" /> Devis</NavLink>
          <NavLink to="/portail/demandes" className={linkCls}><MessageSquare className="w-4 h-4" /> Demandes</NavLink>
          <NavLink to="/portail/profil" className={linkCls}><User className="w-4 h-4" /> Profil</NavLink>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {children ?? <Outlet />}
      </main>

      <footer className="text-center text-xs text-stone-500 py-6">
        © {new Date().getFullYear()} La Plume Artisanale — Espace client
      </footer>
    </div>
  );
};

export default PortailLayout;
