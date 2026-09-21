/**
 * AISettingsERP - Paramètres IA
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook, ERPButtonBox } from '../../components/erp';
import { Save, Sparkles, Key } from 'lucide-react';

const AISettingsERP: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai/settings');
      setSettings(response.data || {});
    } catch (error) {
      console.error('Erreur chargement paramètres IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/ai/settings', settings);
      alert('Paramètres IA enregistrés avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Paramètres IA"
        breadcrumb={[
          { label: 'IA' },
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
                label: 'Configuration',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Clé API</label>
                      <input
                        type="password"
                        value={settings.api_key || ''}
                        onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                        className="erp-field-input"
                        placeholder="Entrez votre clé API..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Modèle</label>
                      <select
                        value={settings.model || 'gpt-3.5-turbo'}
                        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                        className="erp-field-input"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Température</label>
                      <input
                        type="number"
                        value={settings.temperature || 0.7}
                        onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) || 0.7 })}
                        className="erp-field-input"
                        min="0"
                        max="2"
                        step="0.1"
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.enabled || false}
                          onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                        />
                        Activer l'IA
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

export default AISettingsERP;
