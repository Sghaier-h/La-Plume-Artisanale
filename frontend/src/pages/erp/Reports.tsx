/**
 * ReportsERP - Rapports
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook } from '../../components/erp';
import { FileText, BarChart3, TrendingUp, DollarSign, Package, Users, Search } from 'lucide-react';

interface Report {
  id: number;
  name: string;
  type: 'sale' | 'purchase' | 'stock' | 'accounting' | 'hr';
  description?: string;
}

const ReportsERP: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, [search]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await api.get('/reports', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setReports(data);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (type: string) => {
    const icons: Record<string, any> = {
      sale: DollarSign,
      purchase: Package,
      stock: Package,
      accounting: BarChart3,
      hr: Users
    };
    return icons[type] || FileText;
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: 'Ventes',
      purchase: 'Achats',
      stock: 'Stock',
      accounting: 'Comptabilité',
      hr: 'Ressources Humaines'
    };
    return labels[type] || type;
  };

  const reportsByType = reports.reduce((acc, report) => {
    if (!acc[report.type]) acc[report.type] = [];
    acc[report.type].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Rapports"
        breadcrumb={[
          { label: 'Rapports' }
        ]}
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un rapport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Object.entries(reportsByType).map(([type, typeReports]) => {
            const Icon = getReportIcon(type);
            return (
              <div key={type} style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: '18px', 
                  fontWeight: 700,
                  color: 'var(--erp-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Icon size={20} />
                  {getReportTypeLabel(type)}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {typeReports.map(report => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="erp-kanban-card"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="erp-kanban-card-title">{report.name}</div>
                      {report.description && (
                        <div className="erp-kanban-card-content">{report.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
              Chargement...
            </div>
          )}
          {!loading && reports.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
              Aucun rapport disponible
            </div>
          )}
        </div>

        {selectedReport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--erp-bg-primary)',
              borderRadius: 'var(--erp-border-radius-lg)',
              padding: '24px',
              width: '80%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>{selectedReport.name}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="erp-btn erp-btn-outline"
                >
                  Fermer
                </button>
              </div>
              <div style={{ padding: '16px', background: 'var(--erp-bg-secondary)', borderRadius: 'var(--erp-border-radius)' }}>
                <p style={{ color: 'var(--erp-text-muted)', textAlign: 'center' }}>
                  Le rapport sera généré ici
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsERP;
