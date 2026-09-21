/**
 * ParametrageComplet - Paramétrage Complet
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook, ERPButtonBox } from '../../components/erp';
import { Save, Settings, Database, User, Bell, Globe, Package, Factory } from 'lucide-react';

const ParametrageComplet: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/parametrage');
      setSettings(response.data || {});
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/parametrage', settings);
      alert('Paramètres enregistrés avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Paramétrage Complet"
        breadcrumb={[
          { label: 'Paramètres' }
        ]}
        actions={
          <button onClick={handleSave} className="erp-btn erp-btn-primary">
            <Save size={16} style={{ marginRight: '4px' }} />
            Enregistrer
          </button>
        }
      />

      <div className="erp-content">
        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Général',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={settings.company_name || ''}
                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Email</label>
                      <input
                        type="email"
                        value={settings.email || ''}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Téléphone</label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                  </div>
                )
              },
              {
                label: 'Production',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Unité de production par défaut</label>
                      <input
                        type="text"
                        value={settings.production_unit || ''}
                        onChange={(e) => setSettings({ ...settings, production_unit: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.auto_validate_production || false}
                          onChange={(e) => setSettings({ ...settings, auto_validate_production: e.target.checked })}
                        />
                        Validation automatique de la production
                      </label>
                    </div>
                  </div>
                )
              },
              {
                label: 'Stock',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Gestion des lots</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.lot_tracking || false}
                          onChange={(e) => setSettings({ ...settings, lot_tracking: e.target.checked })}
                        />
                        Activer le suivi des lots
                      </label>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Gestion des séries</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.serial_tracking || false}
                          onChange={(e) => setSettings({ ...settings, serial_tracking: e.target.checked })}
                        />
                        Activer le suivi des séries
                      </label>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ParametrageComplet;
