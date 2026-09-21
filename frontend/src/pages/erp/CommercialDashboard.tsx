/**
 * CommercialDashboard - Tableau de Bord Commercial
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader } from '../../components/erp';
import { TrendingUp, DollarSign, Users, ShoppingBag, BarChart3 } from 'lucide-react';

const CommercialDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/commercial/dashboard/stats');
      setStats(response.data || {});
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.total_revenue?.toFixed(2) || '0.00'} TND`,
      icon: DollarSign,
      color: 'var(--erp-success)',
      gradient: 'var(--erp-success-gradient)'
    },
    {
      title: 'Clients',
      value: stats.total_customers || 0,
      icon: Users,
      color: 'var(--erp-primary)',
      gradient: 'var(--erp-primary-gradient)'
    },
    {
      title: 'Commandes',
      value: stats.total_orders || 0,
      icon: ShoppingBag,
      color: 'var(--erp-info)',
      gradient: 'var(--erp-info-gradient)'
    },
    {
      title: 'Taux de conversion',
      value: `${stats.conversion_rate?.toFixed(1) || '0.0'}%`,
      icon: TrendingUp,
      color: 'var(--erp-warning)',
      gradient: 'var(--erp-warning-gradient)'
    }
  ];

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Tableau de Bord Commercial"
        breadcrumb={[
          { label: 'Commercial' },
          { label: 'Tableau de Bord' }
        ]}
      />

      <div className="erp-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                style={{
                  background: card.gradient,
                  borderRadius: 'var(--erp-border-radius-lg)',
                  padding: '24px',
                  color: 'white',
                  boxShadow: 'var(--erp-shadow-lg)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.2 }}>
                  <Icon size={64} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>
                    {card.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="erp-form-view">
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Commandes récentes</h3>
            <div style={{ color: 'var(--erp-text-muted)', textAlign: 'center', padding: '32px' }}>
              Liste des commandes récentes...
            </div>
          </div>
          <div className="erp-form-view">
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Graphiques</h3>
            <div style={{ color: 'var(--erp-text-muted)', textAlign: 'center', padding: '32px' }}>
              Graphiques de performance...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;
