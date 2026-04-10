/**
 * SocialAuthOdoo - Authentification Sociale
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook, ERPButtonBox } from '../../components/erp';
import { Save, Facebook, Twitter, Linkedin } from 'lucide-react';

const SocialAuthOdoo: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/social-auth/settings');
      setSettings(response.data || {});
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/social-auth/settings', settings);
      alert('Paramètres enregistrés avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Authentification Sociale"
        breadcrumb={[
          { label: 'Paramètres' },
          { label: 'Authentification Sociale' }
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
                label: 'Facebook',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">App ID</label>
                      <input
                        type="text"
                        value={settings.facebook_app_id || ''}
                        onChange={(e) => setSettings({ ...settings, facebook_app_id: e.target.value })}
                        className="erp-field-input"
                        placeholder="Facebook App ID..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">App Secret</label>
                      <input
                        type="password"
                        value={settings.facebook_app_secret || ''}
                        onChange={(e) => setSettings({ ...settings, facebook_app_secret: e.target.value })}
                        className="erp-field-input"
                        placeholder="Facebook App Secret..."
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.facebook_enabled || false}
                          onChange={(e) => setSettings({ ...settings, facebook_enabled: e.target.checked })}
                        />
                        Activer Facebook
                      </label>
                    </div>
                  </div>
                )
              },
              {
                label: 'Google',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Client ID</label>
                      <input
                        type="text"
                        value={settings.google_client_id || ''}
                        onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
                        className="erp-field-input"
                        placeholder="Google Client ID..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Client Secret</label>
                      <input
                        type="password"
                        value={settings.google_client_secret || ''}
                        onChange={(e) => setSettings({ ...settings, google_client_secret: e.target.value })}
                        className="erp-field-input"
                        placeholder="Google Client Secret..."
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.google_enabled || false}
                          onChange={(e) => setSettings({ ...settings, google_enabled: e.target.checked })}
                        />
                        Activer Google
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

export default SocialAuthOdoo;
