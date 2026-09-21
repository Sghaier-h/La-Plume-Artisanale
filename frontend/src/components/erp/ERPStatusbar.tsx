/**
 * Composant Statusbar ERP
 * Barre d'état avec workflow et actions
 */

import React from 'react';

interface StatusItem {
  label: string;
  value: string;
  color?: 'draft' | 'confirmed' | 'done' | 'cancelled';
  onClick?: () => void;
}

interface ERPStatusbarProps {
  status: StatusItem;
  workflow?: StatusItem[];
  actions?: React.ReactNode;
  info?: React.ReactNode;
}

const ERPStatusbar: React.FC<ERPStatusbarProps> = ({ status, workflow, actions, info }) => {
  return (
    <div className="erp-statusbar">
      <div className="erp-statusbar-left">
        <div>
          <span style={{ marginRight: '8px', color: 'var(--erp-text-secondary)' }}>
            Statut:
          </span>
          <span className={`erp-status-badge ${status.color || 'draft'}`}>
            {status.label}
          </span>
        </div>
        {workflow && workflow.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {workflow.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span style={{ color: 'var(--erp-text-muted)' }}>→</span>}
                <button
                  onClick={item.onClick}
                  className={`erp-status-badge ${item.color || 'draft'}`}
                  style={{
                    cursor: item.onClick ? 'pointer' : 'default',
                    opacity: item.value === status.value ? 1 : 0.5
                  }}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
        {info}
      </div>
      {actions && (
        <div className="erp-statusbar-right">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ERPStatusbar;
