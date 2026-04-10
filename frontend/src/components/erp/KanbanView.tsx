/**
 * Composant KanbanView ERP
 * Vue Kanban avec drag & drop
 */

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface KanbanColumn {
  id: string;
  title: string;
  items: any[];
}

interface KanbanViewProps {
  columns: KanbanColumn[];
  onItemMove?: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  renderItem?: (item: any) => React.ReactNode;
  onItemClick?: (item: any) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
  columns,
  onItemMove,
  renderItem,
  onItemClick
}) => {
  const [localColumns, setLocalColumns] = useState(columns);

  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = localColumns.find(col => col.id === source.droppableId);
    const destColumn = localColumns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const item = sourceColumn.items[source.index];

    // Mettre à jour localement
    const newColumns = localColumns.map(col => {
      if (col.id === source.droppableId) {
        return {
          ...col,
          items: col.items.filter((_, index) => index !== source.index)
        };
      }
      if (col.id === destination.droppableId) {
        const newItems = [...col.items];
        newItems.splice(destination.index, 0, item);
        return {
          ...col,
          items: newItems
        };
      }
      return col;
    });

    setLocalColumns(newColumns);

    // Appeler le callback
    if (onItemMove) {
      onItemMove(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );
    }
  };

  const defaultRenderItem = (item: any) => (
    <div className="erp-kanban-card">
      <div className="erp-kanban-card-header">
        <span className="erp-kanban-card-title">
          {item.name || item.display_name || `Item ${item.id}`}
        </span>
      </div>
      <div className="erp-kanban-card-content">
        {item.description || item.notes || ''}
      </div>
      {item.amount && (
        <div style={{ marginTop: '8px', fontWeight: 600, color: 'var(--erp-primary)' }}>
          {item.amount.toFixed(2)} TND
        </div>
      )}
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="erp-kanban">
        {localColumns.map(column => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="erp-kanban-column"
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? 'var(--erp-bg-hover)'
                    : 'var(--erp-bg-secondary)'
                }}
              >
                <div className="erp-kanban-column-header">
                  {column.title} ({column.items.length})
                </div>
                {column.items.map((item, index) => (
                  <Draggable
                    key={item.id?.toString() || item.id_demande?.toString() || index}
                    draggableId={item.id?.toString() || item.id_demande?.toString() || index.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onItemClick && onItemClick(item)}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          cursor: onItemClick ? 'pointer' : 'move'
                        }}
                      >
                        {renderItem ? renderItem(item) : defaultRenderItem(item)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
