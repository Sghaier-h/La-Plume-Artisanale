/**
 * ViewGenerator - Génère des composants React depuis les vues JSON
 * Inspiré du système de vues d'Odoo
 */

import fs from 'fs';
import path from 'path';

export class ViewGenerator {
  /**
   * Charge une vue JSON
   */
  static loadView(moduleName, modelName, viewType = 'form') {
    const viewPath = path.join(
      process.cwd(),
      'modules',
      moduleName,
      'views',
      `${modelName.replace('.', '_')}_views.json`
    );

    if (!fs.existsSync(viewPath)) {
      throw new Error(`View file not found: ${viewPath}`);
    }

    const viewData = JSON.parse(fs.readFileSync(viewPath, 'utf8'));
    return viewData[modelName]?.views?.[viewType];
  }

  /**
   * Génère un composant React depuis une vue JSON
   */
  static generateReactComponent(view, modelName) {
    if (!view || !view.arch) {
      return null;
    }

    const arch = view.arch;
    let component = '';

    // Générer le header
    if (arch.header) {
      component += this._generateHeader(arch.header);
    }

    // Générer le sheet (contenu principal)
    if (arch.sheet) {
      component += this._generateSheet(arch.sheet);
    }

    // Générer le notebook (onglets)
    if (arch.notebook) {
      component += this._generateNotebook(arch.notebook);
    }

    return this._wrapComponent(component, modelName, view);
  }

  /**
   * Génère le header (boutons, statusbar)
   */
  static _generateHeader(header) {
    let html = '<div className="view-header">\n';

    // Boutons
    if (header.buttons) {
      html += '  <div className="header-buttons">\n';
      for (const button of header.buttons) {
        html += this._generateButton(button);
      }
      html += '  </div>\n';
    }

    // Statusbar
    if (header.fields) {
      for (const field of header.fields) {
        if (field.widget === 'statusbar') {
          html += this._generateStatusbar(field);
        }
      }
    }

    html += '</div>\n';
    return html;
  }

  /**
   * Génère un bouton
   */
  static _generateButton(button) {
    const attrs = button.attrs || {};
    const invisible = attrs.invisible || [];
    
    let jsx = `    <button\n`;
    jsx += `      onClick={() => handleAction('${button.name}')}\n`;
    jsx += `      className="${button.class || 'btn'}"\n`;
    
    if (invisible.length > 0) {
      jsx += `      style={{ display: ${this._generateCondition(invisible)} ? 'none' : 'block' }}\n`;
    }
    
    jsx += `    >\n`;
    jsx += `      {t('${button.string}')}\n`;
    jsx += `    </button>\n`;
    
    return jsx;
  }

  /**
   * Génère un statusbar
   */
  static _generateStatusbar(field) {
    const states = field.statusbar_visible?.split(',') || [];
    
    let jsx = '  <div className="statusbar">\n';
    for (const state of states) {
      jsx += `    <span className={record.state === '${state}' ? 'active' : ''}>\n`;
      jsx += `      {t('${state}')}\n`;
      jsx += `    </span>\n`;
    }
    jsx += '  </div>\n';
    
    return jsx;
  }

  /**
   * Génère le sheet (contenu principal)
   */
  static _generateSheet(sheet) {
    let html = '<div className="view-sheet">\n';

    // Groupes
    if (sheet.groups) {
      for (const group of sheet.groups) {
        html += this._generateGroup(group);
      }
    }

    html += '</div>\n';
    return html;
  }

  /**
   * Génère un groupe de champs
   */
  static _generateGroup(group) {
    let html = `  <div className="form-group" data-group="${group.name}">\n`;
    html += `    <h3>{t('${group.string}')}</h3>\n`;
    html += '    <div className="form-fields">\n';

    if (group.fields) {
      for (const field of group.fields) {
        html += this._generateField(field);
      }
    }

    html += '    </div>\n';
    html += '  </div>\n';
    return html;
  }

  /**
   * Génère un champ
   */
  static _generateField(field) {
    const fieldType = field.type || 'char';
    let jsx = '';

    switch (fieldType) {
      case 'many2one':
        jsx = this._generateMany2OneField(field);
        break;
      case 'one2many':
        jsx = this._generateOne2ManyField(field);
        break;
      case 'monetary':
        jsx = this._generateMonetaryField(field);
        break;
      case 'datetime':
        jsx = this._generateDateTimeField(field);
        break;
      case 'float':
        jsx = this._generateFloatField(field);
        break;
      default:
        jsx = this._generateCharField(field);
    }

    return jsx;
  }

  /**
   * Génère un champ texte
   */
  static _generateCharField(field) {
    let jsx = `      <div className="form-field" data-field="${field.name}">\n`;
    jsx += `        <label>{t('${field.string}')}</label>\n`;
    jsx += `        <input\n`;
    jsx += `          type="text"\n`;
    jsx += `          name="${field.name}"\n`;
    jsx += `          value={record.${field.name} || ''}\n`;
    jsx += `          onChange={(e) => handleFieldChange('${field.name}', e.target.value)}\n`;
    
    if (field.required) {
      jsx += `          required\n`;
    }
    if (field.readonly) {
      jsx += `          readOnly\n`;
    }
    
    jsx += `        />\n`;
    jsx += `      </div>\n`;
    
    return jsx;
  }

  /**
   * Génère un champ Many2one
   */
  static _generateMany2OneField(field) {
    let jsx = `      <div className="form-field" data-field="${field.name}">\n`;
    jsx += `        <label>{t('${field.string}')}</label>\n`;
    jsx += `        <Many2OneField\n`;
    jsx += `          name="${field.name}"\n`;
    jsx += `          model="${field.comodel || 'res.partner'}"\n`;
    jsx += `          value={record.${field.name}}\n`;
    jsx += `          onChange={(value) => handleFieldChange('${field.name}', value)}\n`;
    
    if (field.required) {
      jsx += `          required\n`;
    }
    if (field.readonly) {
      jsx += `          readOnly\n`;
    }
    
    jsx += `        />\n`;
    jsx += `      </div>\n`;
    
    return jsx;
  }

  /**
   * Génère un champ One2many
   */
  static _generateOne2ManyField(field) {
    let jsx = `      <div className="form-field" data-field="${field.name}">\n`;
    jsx += `        <label>{t('${field.string}')}</label>\n`;
    jsx += `        <One2ManyField\n`;
    jsx += `          name="${field.name}"\n`;
    jsx += `          model="${field.comodel || 'sale.order.line'}"\n`;
    jsx += `          value={record.${field.name} || []}\n`;
    jsx += `          fields={${JSON.stringify(field.fields)}}\n`;
    jsx += `          onChange={(value) => handleFieldChange('${field.name}', value)}\n`;
    jsx += `        />\n`;
    jsx += `      </div>\n`;
    
    return jsx;
  }

  /**
   * Génère un champ monétaire
   */
  static _generateMonetaryField(field) {
    let jsx = `      <div className="form-field" data-field="${field.name}">\n`;
    jsx += `        <label>{t('${field.string}')}</label>\n`;
    jsx += `        <MonetaryField\n`;
    jsx += `          name="${field.name}"\n`;
    jsx += `          value={record.${field.name} || 0}\n`;
    jsx += `          currency={record.currency_id}\n`;
    jsx += `          readOnly={${field.readonly || false}}\n`;
    jsx += `        />\n`;
    jsx += `      </div>\n`;
    
    return jsx;
  }

  /**
   * Génère un champ datetime
   */
  static _generateDateTimeField(field) {
    let jsx = `      <div className="form-field" data-field="${field.name}">\n`;
    jsx += `        <label>{t('${field.string}')}</label>\n`;
    jsx += `        <input\n`;
    jsx += `          type="datetime-local"\n`;
    jsx += `          name="${field.name}"\n`;
    jsx += `          value={record.${field.name} || ''}\n`;
    jsx += `          onChange={(e) => handleFieldChange('${field.name}', e.target.value)}\n`;
    
    if (field.required) {
      jsx += `          required\n`;
    }
    if (field.readonly) {
      jsx += `          readOnly\n`;
    }
    
    jsx += `        />\n`;
    jsx += `      </div>\n`;
    
    return jsx;
  }

  /**
   * Génère un champ float
   */
  static _generateFloatField(field) {
    let jsx = `      <div className="form-field" data-field="${field.name}">\n`;
    jsx += `        <label>{t('${field.string}')}</label>\n`;
    jsx += `        <input\n`;
    jsx += `          type="number"\n`;
    jsx += `          step="0.01"\n`;
    jsx += `          name="${field.name}"\n`;
    jsx += `          value={record.${field.name} || 0}\n`;
    jsx += `          onChange={(e) => handleFieldChange('${field.name}', parseFloat(e.target.value))}\n`;
    
    if (field.required) {
      jsx += `          required\n`;
    }
    if (field.readonly) {
      jsx += `          readOnly\n`;
    }
    
    jsx += `        />\n`;
    jsx += `      </div>\n`;
    
    return jsx;
  }

  /**
   * Génère le notebook (onglets)
   */
  static _generateNotebook(notebook) {
    let html = '  <div className="view-notebook">\n';
    html += '    <Tabs>\n';

    if (notebook.pages) {
      for (const page of notebook.pages) {
        html += `      <Tab label={t('${page.string}')}>\n`;
        
        if (page.fields) {
          for (const field of page.fields) {
            html += this._generateField(field);
          }
        }
        
        html += '      </Tab>\n';
      }
    }

    html += '    </Tabs>\n';
    html += '  </div>\n';
    return html;
  }

  /**
   * Enveloppe le composant dans une fonction React
   */
  static _wrapComponent(content, modelName, view) {
    return `
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

export const ${this._toPascalCase(modelName)}Form = ({ recordId, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const response = await api.get(\`/api/${modelName.replace('.', '/')}/\${recordId}\`);
      setRecord(response.data.data);
    } catch (error) {
      console.error('Error loading record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setRecord(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleAction = async (actionName) => {
    try {
      const response = await api.post(\`/api/${modelName.replace('.', '/')}/\${record.id}/\${actionName}\`);
      setRecord(response.data.data);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (record.id) {
        await api.put(\`/api/${modelName.replace('.', '/')}/\${record.id}\`, record);
      } else {
        await api.post(\`/api/${modelName.replace('.', '/')}\`, record);
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="${modelName.replace('.', '-')}-form">
${content}
      <div className="form-actions">
        <button onClick={handleSave} className="btn-primary">
          {t('Save')}
        </button>
        <button onClick={onCancel} className="btn-secondary">
          {t('Cancel')}
        </button>
      </div>
    </div>
  );
};
`;
  }

  /**
   * Génère une condition depuis un domaine
   */
  static _generateCondition(domain) {
    // Simplification : convertir le domaine en condition JavaScript
    if (domain.length === 3) {
      const [field, operator, value] = domain;
      return `record.${field} ${operator} '${value}'`;
    }
    return 'false';
  }

  /**
   * Convertit un nom en PascalCase
   */
  static _toPascalCase(str) {
    return str.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
  }
}

export default ViewGenerator;
