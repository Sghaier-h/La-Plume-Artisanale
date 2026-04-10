/**
 * FormView - Vue formulaire
 * Formulaire avec onglets, groupes de champs, champs Many2One, One2Many, etc.
 */

import React, { useState } from 'react';
import { Save, X, Edit, Trash2, Plus } from 'lucide-react';
import Many2OneField from '../fields/Many2OneField';
import One2ManyField from '../fields/One2ManyField';
import MonetaryField from '../fields/MonetaryField';
import OperationsPanel, { Operation, RelatedDocument, ActivityLog } from './OperationsPanel';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'many2one' | 'one2many' | 'many2many' | 'selection' | 'monetary' | 'html';
  required?: boolean;
  readonly?: boolean;
  invisible?: boolean;
  options?: any;
  relation?: string;
  widget?: string;
  placeholder?: string;
  help?: string;
}

interface Tab {
  name: string;
  label: string;
  groups: Array<{
    name: string;
    label: string;
    fields: Field[];
  }>;
}

interface FormViewProps {
  record: any;
  fields: Field[] | Tab[];
  loading?: boolean;
  mode?: 'view' | 'edit' | 'create';
  onSave?: (data: any) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onChange?: (field: string, value: any) => void;
  className?: string;
  recordType?: string; // Type de document (sale.order, account.move, etc.)
  operations?: Operation[];
  relatedDocuments?: RelatedDocument[];
  activities?: ActivityLog[];
  onOperation?: (operationId: string) => void | Promise<void>;
  showOperationsPanel?: boolean; // Afficher le panneau d'opérations
}

const FormView: React.FC<FormViewProps> = ({
  record = {},
  fields,
  loading = false,
  mode = 'view',
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onChange,
  className = '',
  recordType = '',
  operations = [],
  relatedDocuments = [],
  activities = [],
  onOperation,
  showOperationsPanel = true
}) => {
  const [activeTab, setActiveTab] = useState<string>('tab_0');
  const [formData, setFormData] = useState<any>(record || {});

  const hasTabs = fields.length > 0 && 'groups' in fields[0];
  const tabs = hasTabs ? (fields as Tab[]) : [];
  const flatFields = hasTabs ? [] : (fields as Field[]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    if (onChange) {
      onChange(fieldName, value);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const renderField = (field: Field) => {
    if (field.invisible) return null;

    const value = formData[field.name];
    const isReadonly = field.readonly || mode === 'view';

    switch (field.type) {
      case 'many2one':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Many2OneField
              model={field.relation || ''}
              value={value}
              onChange={(val) => handleFieldChange(field.name, val)}
              label={field.label}
              disabled={isReadonly}
              placeholder={field.placeholder}
            />
            {field.help && (
              <p className="text-xs text-gray-500 mt-1">{field.help}</p>
            )}
          </div>
        );

      case 'one2many':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <One2ManyField
              name={field.name}
              value={value || []}
              onChange={(val) => handleFieldChange(field.name, val)}
              relation={field.relation || ''}
              readonly={isReadonly}
            />
          </div>
        );

      case 'monetary':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <MonetaryField
              name={field.name}
              value={value || 0}
              onChange={(val) => handleFieldChange(field.name, val)}
              readonly={isReadonly}
              currency={field.options?.currency || 'TND'}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                disabled={isReadonly}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{field.label}</span>
            </label>
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={isReadonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'selection':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={isReadonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sélectionner --</option>
              {field.options?.selection?.map((opt: any) => (
                <option key={opt[0]} value={opt[0]}>
                  {opt[1]}
                </option>
              ))}
            </select>
          </div>
        );

      case 'html':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div
              className="prose max-w-none p-3 border border-gray-300 rounded-lg bg-gray-50"
              dangerouslySetInnerHTML={{ __html: value || '' }}
            />
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={isReadonly}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {field.help && (
              <p className="text-xs text-gray-500 mt-1">{field.help}</p>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* En-tête avec actions */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'Créer' : mode === 'edit' ? 'Modifier' : 'Visualiser'}
        </h2>
        <div className="flex items-center gap-2">
          {mode === 'view' && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
          {mode === 'edit' && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </>
          )}
          {mode === 'view' && onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className={`p-6 ${showOperationsPanel && record?.id ? 'mr-80' : ''}`}>
        {hasTabs ? (
          <>
            {/* Onglets */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-4">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(`tab_${index}`)}
                    className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                      activeTab === `tab_${index}`
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu des onglets */}
            {tabs.map((tab, index) => (
              <div
                key={tab.name}
                className={activeTab === `tab_${index}` ? 'block' : 'hidden'}
              >
                {tab.groups.map((group) => (
                  <div key={group.name} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.fields.map((field) => renderField(field))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flatFields.map((field) => renderField(field))}
          </div>
        )}
      </div>

      {/* Panneau d'opérations en bas à gauche */}
      {showOperationsPanel && record?.id && mode === 'view' && (
        <OperationsPanel
          record={record}
          recordType={recordType}
          operations={operations}
          relatedDocuments={relatedDocuments}
          activities={activities}
          onOperation={onOperation}
        />
      )}
    </div>
  );
};

export default FormView;
