/**
 * One2ManyField - Champ One2many (relation un-à-plusieurs)
 */

import React, { useState } from 'react';

interface One2ManyFieldProps {
  name?: string;
  model?: string;
  relation?: string; // Alias pour model
  value?: any[];
  fields?: any[];
  onChange?: (value: any[]) => void;
  readOnly?: boolean;
  readonly?: boolean; // Alias pour readOnly
}

export const One2ManyField: React.FC<One2ManyFieldProps> = ({
  name = '',
  model,
  relation,
  value = [],
  fields = [],
  onChange,
  readOnly = false,
  readonly
}) => {
  const actualModel = model || relation || '';
  const actualReadOnly = readOnly || readonly || false;
  const [lines, setLines] = useState<any[]>(value);

  const handleAddLine = () => {
    const newLine: any = {};
    for (const field of fields) {
      newLine[field.name] = field.type === 'float' ? 0 : '';
    }
    const updated = [...lines, newLine];
    setLines(updated);
    onChange?.(updated);
  };

  const handleRemoveLine = (index: number) => {
    const updated = lines.filter((_, i) => i !== index);
    setLines(updated);
    onChange?.(updated);
  };

  const handleLineChange = (index: number, fieldName: string, fieldValue: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [fieldName]: fieldValue };
    setLines(updated);
    onChange?.(updated);
  };

  return (
    <div className="one2many-field">
      <table className="table">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field.name}>{field.string}</th>
            ))}
            {!readOnly && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index}>
              {fields.map((field) => (
                <td key={field.name}>
                  {field.readonly ? (
                    <span>{line[field.name] || ''}</span>
                  ) : (
                    <input
                      type={field.type === 'float' ? 'number' : 'text'}
                      value={line[field.name] || ''}
                      onChange={(e) => {
                        const val = field.type === 'float' 
                          ? parseFloat(e.target.value) || 0 
                          : e.target.value;
                        handleLineChange(index, field.name, val);
                      }}
                      step={field.type === 'float' ? '0.01' : undefined}
                      required={field.required}
                    />
                  )}
                </td>
              ))}
              {!readOnly && (
                <td>
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!readOnly && (
        <button
          type="button"
          onClick={handleAddLine}
          className="btn btn-sm btn-primary"
        >
          Add Line
        </button>
      )}
    </div>
  );
};

export default One2ManyField;
