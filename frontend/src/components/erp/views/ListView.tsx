/**
 * ListView - Vue liste
 * Table avec colonnes configurables, tri, sélection multiple, actions de masse
 */

import React, { useState } from 'react';
import { Edit, Trash2, Eye, MoreVertical, ArrowUpDown, CheckSquare, Square } from 'lucide-react';

interface Column {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'many2one' | 'selection';
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface ListViewProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  selectedRows?: number[];
  onSelectRow?: (id: number) => void;
  onSelectAll?: (selected: boolean) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  onView?: (record: any) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  rowActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    action: (record: any) => void;
    className?: string;
  }> | ((record: any) => Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    action: (record: any) => void;
    className?: string;
  }>);
}

const ListView: React.FC<ListViewProps> = ({
  columns,
  data,
  loading = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
  onSort,
  sortField,
  sortDirection,
  rowActions = []
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSort = (field: string) => {
    if (!onSort) return;
    if (sortField === field) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const renderCell = (column: Column, record: any) => {
    const value = record[column.name];

    if (column.render) {
      return column.render(value, record);
    }

    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded border-2 ${value ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
              {value && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
            </div>
          </div>
        );

      case 'date':
        return value ? new Date(value).toLocaleDateString('fr-FR') : '-';

      case 'many2one':
        return value?.name || '-';

      case 'selection':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {value}
          </span>
        );

      case 'number':
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;

      default:
        return value || '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucun enregistrement trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Checkbox de sélection */}
              {(onSelectRow || onSelectAll) && (
                <th className="px-4 py-3 text-left w-12">
                  <button
                    onClick={() => onSelectAll && onSelectAll(!allSelected)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : someSelected ? (
                      <CheckSquare className="w-5 h-5 opacity-50" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
              )}

              {/* Colonnes */}
              {columns.map((column) => (
                <th
                  key={column.name}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && onSort && (
                      <button
                        onClick={() => handleSort(column.name)}
                        className={`text-gray-400 hover:text-gray-600 ${
                          sortField === column.name ? 'text-blue-600' : ''
                        }`}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}

              {/* Colonne actions */}
              {(onEdit || onDelete || onView || rowActions.length > 0) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((record, index) => {
              const isSelected = selectedRows.includes(record.id);
              const isHovered = hoveredRow === record.id;

              return (
                <tr
                  key={record.id}
                  onMouseEnter={() => setHoveredRow(record.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Checkbox de sélection */}
                  {(onSelectRow || onSelectAll) && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectRow && onSelectRow(record.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  )}

                  {/* Cellules */}
                  {columns.map((column) => (
                    <td key={column.name} className="px-4 py-3 text-sm text-gray-900">
                      {renderCell(column, record)}
                    </td>
                  ))}

                  {/* Actions */}
                  {(onEdit || onDelete || onView || rowActions.length > 0) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(record)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(record)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {(() => {
                          const actions = typeof rowActions === 'function' ? rowActions(record) : rowActions;
                          return actions && actions.length > 0 && (
                            <div className="relative group">
                              <button
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                title="Plus d'actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {actions.map((action, idx) => {
                                  const Icon = action.icon || Edit;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => action.action(record)}
                                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${action.className || ''}`}
                                    >
                                      <Icon className="w-4 h-4" />
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
