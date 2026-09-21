/**
 * Composant Notebook ERP (Onglets)
 */

import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface ERPNotebookProps {
  tabs: Tab[];
  defaultTab?: number;
}

const ERPNotebook: React.FC<ERPNotebookProps> = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="erp-notebook">
      <div className="erp-notebook-tabs">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`erp-notebook-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon && <span style={{ marginRight: '4px' }}>{tab.icon}</span>}
            {tab.label}
          </div>
        ))}
      </div>
      <div className="erp-notebook-content">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default ERPNotebook;
