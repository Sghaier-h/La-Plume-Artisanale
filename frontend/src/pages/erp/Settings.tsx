/**
 * SettingsOdoo - Paramètres (Style Odoo)
 * Interface complète de paramétrage inspirée d'Odoo
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook, ERPButtonBox } from '../../components/erp';
import { useTheme } from '../../contexts/ThemeContext';
import { Save, Settings, Database, User, Bell, Globe, Building2, Mail, Lock, Shield, CreditCard, FileText, BarChart3, Users, Package, Factory, ShoppingBag, TrendingUp, Palette, Moon, Sun, Monitor } from 'lucide-react';

interface SettingsCategory {
  id: string;
  name: string;
  icon: any;
  sections: SettingsSection[];
}

interface SettingsSection {
  id: string;
  name: string;
  fields: SettingsField[];
}

interface SettingsField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';
  options?: { value: string; label: string }[];
  help?: string;
}

const SettingsOdoo: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [activeSection, setActiveSection] = useState<string>('company');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/settings');
      setSettings(response.data || {});
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      alert('Paramètres enregistrés avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const categories: SettingsCategory[] = [
    {
      id: 'general',
      name: 'Général',
      icon: Settings,
      sections: [
        {
          id: 'company',
          name: 'Informations de l\'entreprise',
          fields: [
            { name: 'company_name', label: 'Nom de l\'entreprise', type: 'text' },
            { name: 'company_email', label: 'Email', type: 'email' },
            { name: 'company_phone', label: 'Téléphone', type: 'text' },
            { name: 'company_website', label: 'Site web', type: 'text' },
            { name: 'company_street', label: 'Rue', type: 'text' },
            { name: 'company_city', label: 'Ville', type: 'text' },
            { name: 'company_country', label: 'Pays', type: 'text' },
            { name: 'company_vat', label: 'N° TVA', type: 'text' },
          ]
        },
        {
          id: 'localization',
          name: 'Localisation',
          fields: [
            { name: 'language', label: 'Langue', type: 'select', options: [
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'Anglais' },
              { value: 'ar', label: 'Arabe' }
            ]},
            { name: 'timezone', label: 'Fuseau horaire', type: 'select', options: [
              { value: 'Africa/Tunis', label: 'Tunis (GMT+1)' },
              { value: 'UTC', label: 'UTC' }
            ]},
            { name: 'currency', label: 'Devise', type: 'select', options: [
              { value: 'TND', label: 'Dinar tunisien (TND)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'USD', label: 'Dollar (USD)' }
            ]},
            { name: 'date_format', label: 'Format de date', type: 'select', options: [
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
            ]},
          ]
        }
      ]
    },
    {
      id: 'users',
      name: 'Utilisateurs',
      icon: Users,
      sections: [
        {
          id: 'authentication',
          name: 'Authentification',
          fields: [
            { name: 'password_min_length', label: 'Longueur minimale du mot de passe', type: 'number' },
            { name: 'password_require_uppercase', label: 'Exiger une majuscule', type: 'checkbox' },
            { name: 'password_require_number', label: 'Exiger un chiffre', type: 'checkbox' },
            { name: 'password_require_special', label: 'Exiger un caractère spécial', type: 'checkbox' },
            { name: 'session_timeout', label: 'Délai d\'expiration de session (minutes)', type: 'number' },
          ]
        },
        {
          id: 'permissions',
          name: 'Permissions',
          fields: [
            { name: 'default_user_role', label: 'Rôle par défaut', type: 'select', options: [
              { value: 'user', label: 'Utilisateur' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Administrateur' }
            ]},
            { name: 'allow_user_registration', label: 'Autoriser l\'inscription', type: 'checkbox' },
            { name: 'require_email_verification', label: 'Exiger la vérification email', type: 'checkbox' },
          ]
        }
      ]
    },
    {
      id: 'sales',
      name: 'Ventes',
      icon: ShoppingBag,
      sections: [
        {
          id: 'quotation',
          name: 'Devis',
          fields: [
            { name: 'quotation_validity_days', label: 'Validité par défaut (jours)', type: 'number' },
            { name: 'auto_confirm_quotation', label: 'Confirmation automatique', type: 'checkbox' },
            { name: 'quotation_template', label: 'Modèle de devis', type: 'select', options: [
              { value: 'standard', label: 'Standard' },
              { value: 'custom', label: 'Personnalisé' }
            ]},
          ]
        },
        {
          id: 'invoicing',
          name: 'Facturation',
          fields: [
            { name: 'invoice_sequence', label: 'Séquence de facturation', type: 'text' },
            { name: 'invoice_terms', label: 'Conditions de paiement', type: 'textarea' },
            { name: 'auto_validate_invoice', label: 'Validation automatique', type: 'checkbox' },
            { name: 'invoice_due_days', label: 'Délai de paiement (jours)', type: 'number' },
          ]
        },
        {
          id: 'pricing',
          name: 'Tarification',
          fields: [
            { name: 'default_pricelist', label: 'Liste de prix par défaut', type: 'text' },
            { name: 'rounding_method', label: 'Méthode d\'arrondi', type: 'select', options: [
              { value: 'round', label: 'Arrondir' },
              { value: 'floor', label: 'Arrondir vers le bas' },
              { value: 'ceil', label: 'Arrondir vers le haut' }
            ]},
          ]
        }
      ]
    },
    {
      id: 'purchase',
      name: 'Achats',
      icon: Package,
      sections: [
        {
          id: 'purchase_orders',
          name: 'Commandes d\'achat',
          fields: [
            { name: 'purchase_sequence', label: 'Séquence de commande', type: 'text' },
            { name: 'auto_confirm_purchase', label: 'Confirmation automatique', type: 'checkbox' },
            { name: 'purchase_terms', label: 'Conditions d\'achat', type: 'textarea' },
          ]
        },
        {
          id: 'receipt',
          name: 'Réception',
          fields: [
            { name: 'auto_validate_receipt', label: 'Validation automatique', type: 'checkbox' },
            { name: 'require_quality_check', label: 'Exiger contrôle qualité', type: 'checkbox' },
          ]
        }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventaire',
      icon: Package,
      sections: [
        {
          id: 'stock',
          name: 'Stock',
          fields: [
            { name: 'stock_valuation', label: 'Évaluation du stock', type: 'select', options: [
              { value: 'fifo', label: 'FIFO' },
              { value: 'lifo', label: 'LIFO' },
              { value: 'average', label: 'Moyenne pondérée' }
            ]},
            { name: 'allow_negative_stock', label: 'Autoriser stock négatif', type: 'checkbox' },
            { name: 'stock_alert_threshold', label: 'Seuil d\'alerte stock', type: 'number' },
            { name: 'auto_create_move', label: 'Créer automatiquement les mouvements', type: 'checkbox' },
          ]
        },
        {
          id: 'warehouse',
          name: 'Entrepôts',
          fields: [
            { name: 'default_warehouse', label: 'Entrepôt par défaut', type: 'text' },
            { name: 'multi_warehouse', label: 'Multi-entrepôts', type: 'checkbox' },
          ]
        }
      ]
    },
    {
      id: 'manufacturing',
      name: 'Production',
      icon: Factory,
      sections: [
        {
          id: 'production',
          name: 'Ordres de fabrication',
          fields: [
            { name: 'production_sequence', label: 'Séquence de production', type: 'text' },
            { name: 'auto_confirm_production', label: 'Confirmation automatique', type: 'checkbox' },
            { name: 'require_bom', label: 'Exiger nomenclature', type: 'checkbox' },
            { name: 'track_production_time', label: 'Suivre le temps de production', type: 'checkbox' },
          ]
        },
        {
          id: 'routing',
          name: 'Gamme',
          fields: [
            { name: 'use_routing', label: 'Utiliser les gammes', type: 'checkbox' },
            { name: 'default_workcenter', label: 'Poste de travail par défaut', type: 'text' },
          ]
        }
      ]
    },
    {
      id: 'accounting',
      name: 'Comptabilité',
      icon: BarChart3,
      sections: [
        {
          id: 'fiscal',
          name: 'Fiscal',
          fields: [
            { name: 'fiscal_year', label: 'Année fiscale', type: 'select', options: [
              { value: 'calendar', label: 'Calendaire' },
              { value: 'fiscal', label: 'Fiscale' }
            ]},
            { name: 'chart_template', label: 'Modèle de plan comptable', type: 'text' },
            { name: 'tax_calculation', label: 'Calcul des taxes', type: 'select', options: [
              { value: 'excluded', label: 'HT' },
              { value: 'included', label: 'TTC' }
            ]},
          ]
        },
        {
          id: 'journal',
          name: 'Journaux',
          fields: [
            { name: 'default_sale_journal', label: 'Journal vente par défaut', type: 'text' },
            { name: 'default_purchase_journal', label: 'Journal achat par défaut', type: 'text' },
            { name: 'default_cash_journal', label: 'Journal caisse par défaut', type: 'text' },
          ]
        }
      ]
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      sections: [
        {
          id: 'email',
          name: 'Email',
          fields: [
            { name: 'email_from', label: 'Email expéditeur', type: 'email' },
            { name: 'smtp_server', label: 'Serveur SMTP', type: 'text' },
            { name: 'smtp_port', label: 'Port SMTP', type: 'number' },
            { name: 'smtp_user', label: 'Utilisateur SMTP', type: 'text' },
            { name: 'smtp_password', label: 'Mot de passe SMTP', type: 'text' },
            { name: 'email_notifications_enabled', label: 'Activer les notifications email', type: 'checkbox' },
          ]
        },
        {
          id: 'push',
          name: 'Notifications Push',
          fields: [
            { name: 'push_notifications_enabled', label: 'Activer les notifications push', type: 'checkbox' },
            { name: 'push_on_sale', label: 'Notification sur nouvelle vente', type: 'checkbox' },
            { name: 'push_on_purchase', label: 'Notification sur nouvel achat', type: 'checkbox' },
            { name: 'push_on_production', label: 'Notification sur production', type: 'checkbox' },
          ]
        }
      ]
    },
    {
      id: 'security',
      name: 'Sécurité',
      icon: Shield,
      sections: [
        {
          id: 'access',
          name: 'Contrôle d\'accès',
          fields: [
            { name: 'two_factor_auth', label: 'Authentification à deux facteurs', type: 'checkbox' },
            { name: 'ip_whitelist', label: 'Liste blanche IP', type: 'textarea', help: 'Une IP par ligne' },
            { name: 'session_security', label: 'Sécurité de session', type: 'checkbox' },
          ]
        },
        {
          id: 'backup',
          name: 'Sauvegarde',
          fields: [
            { name: 'auto_backup', label: 'Sauvegarde automatique', type: 'checkbox' },
            { name: 'backup_frequency', label: 'Fréquence de sauvegarde', type: 'select', options: [
              { value: 'daily', label: 'Quotidienne' },
              { value: 'weekly', label: 'Hebdomadaire' },
              { value: 'monthly', label: 'Mensuelle' }
            ]},
            { name: 'backup_retention_days', label: 'Rétention (jours)', type: 'number' },
          ]
        }
      ]
    },
    {
      id: 'database',
      name: 'Base de données',
      icon: Database,
      sections: [
        {
          id: 'connection',
          name: 'Connexion',
          fields: [
            { name: 'db_host', label: 'Hôte', type: 'text' },
            { name: 'db_port', label: 'Port', type: 'number' },
            { name: 'db_name', label: 'Nom de la base', type: 'text' },
            { name: 'db_user', label: 'Utilisateur', type: 'text' },
            { name: 'db_password', label: 'Mot de passe', type: 'text' },
          ]
        },
        {
          id: 'performance',
          name: 'Performance',
          fields: [
            { name: 'query_timeout', label: 'Timeout des requêtes (ms)', type: 'number' },
            { name: 'connection_pool_size', label: 'Taille du pool de connexions', type: 'number' },
            { name: 'enable_query_cache', label: 'Activer le cache des requêtes', type: 'checkbox' },
          ]
        }
      ]
    }
  ];

  const activeCategoryData = categories.find(cat => cat.id === activeCategory) || categories[0];
  const activeSectionData = activeCategoryData.sections.find(sec => sec.id === activeSection) || activeCategoryData.sections[0];

  const renderField = (field: SettingsField) => {
    const value = settings[field.name] ?? '';

    switch (field.type) {
      case 'checkbox':
        return (
          <div className="erp-field" key={field.name}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => setSettings({ ...settings, [field.name]: e.target.checked })}
              />
              <span>{field.label}</span>
            </label>
            {field.help && <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>{field.help}</div>}
          </div>
        );

      case 'select':
        return (
          <div className="erp-field" key={field.name}>
            <label className="erp-field-label">{field.label}</label>
            <select
              value={value}
              onChange={(e) => setSettings({ ...settings, [field.name]: e.target.value })}
              className="erp-field-input"
            >
              <option value="">Sélectionner...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {field.help && <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>{field.help}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div className="erp-field" key={field.name}>
            <label className="erp-field-label">{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => setSettings({ ...settings, [field.name]: e.target.value })}
              className="erp-field-input"
              rows={4}
            />
            {field.help && <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>{field.help}</div>}
          </div>
        );

      default:
        return (
          <div className="erp-field" key={field.name}>
            <label className="erp-field-label">{field.label}</label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => setSettings({ ...settings, [field.name]: e.target.value })}
              className="erp-field-input"
            />
            {field.help && <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>{field.help}</div>}
          </div>
        );
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Paramètres"
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

      <div className="erp-content" style={{ display: 'flex', gap: '24px' }}>
        {/* Menu latéral */}
        <div style={{
          width: '250px',
          background: 'var(--erp-bg-primary)',
          border: '1px solid var(--erp-border-color)',
          borderRadius: 'var(--erp-border-radius-lg)',
          padding: '16px',
          height: 'fit-content',
          boxShadow: 'var(--erp-shadow-md)',
          position: 'sticky',
          top: '16px'
        }}>
          <div style={{ marginBottom: '16px', fontWeight: 700, fontSize: '16px', color: 'var(--erp-text-primary)' }}>
            Catégories
          </div>
          {categories.map(category => {
            const Icon = category.icon;
              return (
              <div key={category.id}>
                <button
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveSection(category.sections[0]?.id || '');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '8px',
                    background: activeCategory === category.id ? 'var(--erp-primary-gradient)' : 'transparent',
                    color: activeCategory === category.id ? 'white' : 'var(--erp-text-primary)',
                    border: 'none',
                    borderRadius: 'var(--erp-border-radius)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: activeCategory === category.id ? 600 : 500,
                    transition: 'var(--erp-transition)'
                  }}
                >
                  <Icon size={18} />
                  <span>{category.name}</span>
                </button>
                {activeCategory === category.id && (
                  <div style={{ marginLeft: '32px', marginBottom: '8px' }}>
                    {category.sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          marginBottom: '4px',
                          background: activeSection === section.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          color: activeSection === section.id ? 'var(--erp-primary)' : 'var(--erp-text-secondary)',
                          border: 'none',
                          borderRadius: 'var(--erp-border-radius)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          transition: 'var(--erp-transition)'
                        }}
                      >
                        {section.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
        </div>

        {/* Contenu principal */}
        <div style={{ flex: 1 }}>
          <div className="erp-form-view">
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '8px',
                background: 'var(--erp-primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {activeSectionData.name}
              </h2>
              <p style={{ color: 'var(--erp-text-secondary)', fontSize: '14px' }}>
                Configurez les paramètres de cette section
              </p>
          </div>

            <div style={{ display: 'grid', gap: '24px' }}>
              {activeSectionData.fields.map(field => renderField(field))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOdoo;
