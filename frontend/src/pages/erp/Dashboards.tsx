/**
 * Page Dashboards Centralisée - La Plume Artisanale
 * Regroupe tous les tableaux de bord disponibles
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ERPHeader } from '../../components/erp';
import {
  LayoutDashboard, User, Factory, Package, ShoppingCart,
  Wrench, ClipboardCheck, Truck, BarChart3, Users,
  TrendingUp, DollarSign, Calendar, Target, Zap
} from 'lucide-react';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  category: string;
}

const Dashboards: React.FC = () => {
  const navigate = useNavigate();

  const dashboards: Dashboard[] = [
    {
      id: 'admin',
      name: 'Dashboard Administrateur',
      description: 'Vue d\'ensemble complète pour les administrateurs',
      icon: <LayoutDashboard size={32} />,
      path: '/dashboard-admin',
      color: '#6366f1',
      category: 'Administration'
    },
    {
      id: 'commercial',
      name: 'Dashboard Commercial',
      description: 'Tableau de bord commercial et ventes',
      icon: <ShoppingCart size={32} />,
      path: '/erp/commercial-dashboard',
      color: '#10b981',
      category: 'Vente'
    },
    {
      id: 'tisseur',
      name: 'Dashboard Tisseur',
      description: 'Tableau de bord pour les tisseurs',
      icon: <Factory size={32} />,
      path: '/dashboard-tisseur',
      color: '#f59e0b',
      category: 'Production'
    },
    {
      id: 'magasinier-mp',
      name: 'Dashboard Magasinier MP',
      description: 'Gestion des matières premières',
      icon: <Package size={32} />,
      path: '/dashboard-magasinier-mp',
      color: '#3b82f6',
      category: 'Stock'
    },
    {
      id: 'mecanicien',
      name: 'Tableau de Bord Mécanicien',
      description: 'Maintenance et réparations',
      icon: <Wrench size={32} />,
      path: '/tableau-bord-mecanicien',
      color: '#ef4444',
      category: 'Maintenance'
    },
    {
      id: 'post-coupe',
      name: 'Dashboard Post Coupe',
      description: 'Gestion du poste de coupe',
      icon: <ClipboardCheck size={32} />,
      path: '/dashboard-post-coupe',
      color: '#8b5cf6',
      category: 'Production'
    },
    {
      id: 'controle-central',
      name: 'Dashboard Contrôle Central',
      description: 'Contrôle qualité centralisé',
      icon: <ClipboardCheck size={32} />,
      path: '/dashboard-controle-central',
      color: '#10b981',
      category: 'Qualité'
    },
    {
      id: 'chef-atelier',
      name: 'Dashboard Chef d\'Atelier',
      description: 'Vue d\'ensemble de l\'atelier',
      icon: <Factory size={32} />,
      path: '/chef-atelier-dashboard',
      color: '#6366f1',
      category: 'Production'
    },
    {
      id: 'magasin-pf',
      name: 'Tableau de Bord Magasin PF',
      description: 'Gestion des produits finis',
      icon: <Package size={32} />,
      path: '/tableau-bord-magasin-pf',
      color: '#3b82f6',
      category: 'Stock'
    },
    {
      id: 'chef-production',
      name: 'Dashboard Chef Production',
      description: 'Planification et suivi de production',
      icon: <BarChart3 size={32} />,
      path: '/dashboard-chef-production',
      color: '#f59e0b',
      category: 'Production'
    },
    {
      id: 'magasinier-soustraitants',
      name: 'Dashboard Magasinier Soustraitants',
      description: 'Gestion des sous-traitants',
      icon: <Truck size={32} />,
      path: '/dashboard-magasinier-soustraitants',
      color: '#14b8a6',
      category: 'Sous-traitance'
    },
  ];

  const categories = Array.from(new Set(dashboards.map(d => d.category)));

  const handleDashboardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Dashboards"
        breadcrumb={[
          { label: 'Accueil', path: '/erp/home' },
          { label: 'Dashboards' }
        ]}
        actions={
          <button 
            onClick={() => navigate('/erp/home')}
            className="erp-btn erp-btn-outline"
          >
            Retour à l'accueil
          </button>
        }
      />

      <div className="erp-content" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 700,
            background: 'var(--erp-primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            Tous les Tableaux de Bord
          </h2>
          <p style={{ color: 'var(--erp-text-secondary)', fontSize: '16px' }}>
            Accédez à tous les dashboards disponibles selon votre rôle et vos besoins
          </p>
        </div>

        {categories.map(category => {
          const categoryDashboards = dashboards.filter(d => d.category === category);
          
          return (
            <div key={category} style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--erp-text-primary)',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid var(--erp-border-color)'
              }}>
                {category}
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {categoryDashboards.map(dashboard => (
                  <div
                    key={dashboard.id}
                    onClick={() => handleDashboardClick(dashboard.path)}
                    style={{
                      background: 'white',
                      borderRadius: 'var(--erp-border-radius-lg)',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'var(--erp-transition)',
                      boxShadow: 'var(--erp-shadow-md)',
                      border: '2px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = 'var(--erp-shadow-xl)';
                      e.currentTarget.style.borderColor = dashboard.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--erp-shadow-md)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--erp-border-radius-lg)',
                        background: `linear-gradient(135deg, ${dashboard.color}15 0%, ${dashboard.color}05 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: dashboard.color,
                        flexShrink: 0
                      }}>
                        {dashboard.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: 'var(--erp-text-primary)',
                          margin: 0,
                          marginBottom: '4px'
                        }}>
                          {dashboard.name}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--erp-text-secondary)',
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          {dashboard.description}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--erp-border-color)',
                      color: dashboard.color,
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      <span>Accéder</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboards;
