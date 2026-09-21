/**
 * KanbanView - Vue Kanban
 * Colonnes avec cartes draggable, statistiques par colonne
 */

import React, { useState } from 'react';
import { Edit, Trash2, Eye, MoreVertical, Plus } from 'lucide-react';

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  items: any[];
}

interface KanbanViewProps {
  columns: KanbanColumn[];
  loading?: boolean;
  onCardClick?: (item: any) => void;
  onCardEdit?: (item: any) => void;
  onCardDelete?: (item: any) => void;
  onCardMove?: (itemId: number, fromColumn: string, toColumn: string) => void;
  renderCard?: (item: any) => React.ReactNode;
  onAddCard?: (columnId: string) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
  columns,
  loading = false,
  onCardClick,
  onCardEdit,
  onCardDelete,
  onCardMove,
  renderCard,
  onAddCard
}) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

  const handleDragStart = (item: any, columnId: string) => {
    setDraggedItem(item);
    setDraggedFrom(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (draggedItem && draggedFrom && draggedFrom !== columnId && onCardMove) {
      onCardMove(draggedItem.id, draggedFrom, columnId);
    }
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  const defaultRenderCard = (item: any) => (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="font-medium text-gray-900 mb-1">{item.name || item.title || `Item ${item.id}`}</div>
      {item.description && (
        <div className="text-sm text-gray-600 mb-2">{item.description}</div>
      )}
      {item.partner_id && (
        <div className="text-xs text-gray-500">{item.partner_id.name}</div>
      )}
      {item.amount && (
        <div className="text-sm font-semibold text-gray-900 mt-2">
          {item.amount.toLocaleString('fr-FR')} TND
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* En-tête de colonne */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  column.color || 'bg-blue-500'
                }`}
              ></div>
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-500">({column.items.length})</span>
            </div>
            {onAddCard && (
              <button
                onClick={() => onAddCard(column.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Ajouter une carte"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cartes */}
          <div className="space-y-3 min-h-[200px]">
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable={!!onCardMove}
                onDragStart={() => handleDragStart(item, column.id)}
                onClick={() => onCardClick && onCardClick(item)}
                className="cursor-move"
              >
                {renderCard ? renderCard(item) : defaultRenderCard(item)}
                
                {/* Actions sur hover */}
                {(onCardEdit || onCardDelete) && (
                  <div className="flex items-center justify-end gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                    {onCardEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCardEdit(item);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                    {onCardDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCardDelete(item);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {column.items.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Aucun élément
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
