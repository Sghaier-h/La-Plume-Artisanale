/**
 * PipelineVente - Pipeline de Vente
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { TrendingUp, Search } from 'lucide-react';

interface PipelineItem {
  id: number;
  name: string;
  partner_id?: any;
  expected_revenue: number;
  probability: number;
  stage_id?: any;
}

const PipelineVente: React.FC = () => {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPipeline();
  }, [search]);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const [leadsRes, oppsRes] = await Promise.all([
        api.get('/crm/leads', { params }),
        api.get('/crm/opportunities', { params })
      ]);
      
      const leads = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.data || [];
      const opps = Array.isArray(oppsRes.data) ? oppsRes.data : oppsRes.data.data || [];
      
      setItems([...leads, ...opps]);
    } catch (error) {
      console.error('Erreur chargement pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const kanbanColumns = [
    {
      id: 'new',
      title: 'Nouveau',
      items: items.filter(i => !i.stage_id || i.stage_id[1] === 'Nouveau')
    },
    {
      id: 'qualified',
      title: 'Qualifié',
      items: items.filter(i => i.stage_id?.[1] === 'Qualifié')
    },
    {
      id: 'proposition',
      title: 'Proposition',
      items: items.filter(i => i.stage_id?.[1] === 'Proposition')
    },
    {
      id: 'won',
      title: 'Gagné',
      items: items.filter(i => i.stage_id?.[1] === 'Gagné')
    }
  ];

  const totalRevenue = items.reduce((sum, item) => sum + (item.expected_revenue || 0), 0);
  const weightedRevenue = items.reduce((sum, item) => 
    sum + ((item.expected_revenue || 0) * (item.probability || 0) / 100), 0);

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Pipeline de Vente"
        breadcrumb={[
          { label: 'CRM' },
          { label: 'Pipeline' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'var(--erp-text-secondary)', marginRight: '8px' }}>Revenu total:</span>
              <strong style={{ color: 'var(--erp-primary)' }}>{totalRevenue.toFixed(2)} TND</strong>
            </div>
            <div>
              <span style={{ color: 'var(--erp-text-secondary)', marginRight: '8px' }}>Revenu pondéré:</span>
              <strong style={{ color: 'var(--erp-success)' }}>{weightedRevenue.toFixed(2)} TND</strong>
            </div>
          </div>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher dans le pipeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <KanbanView
          columns={kanbanColumns}
          renderItem={(item) => (
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '8px' }}>
                {item.partner_id?.[1] || 'Contact'}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--erp-primary)' }}>
                {item.expected_revenue?.toFixed(2) || '0.00'} TND
              </div>
              <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                Probabilité: {item.probability || 0}%
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default PipelineVente;
